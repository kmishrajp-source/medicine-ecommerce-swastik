'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap, CheckCircle2, Clock, XCircle, Plus, ChevronRight,
  Mail, MessageSquare, Phone, Users, Settings, Play, Pause,
  ArrowRight, GitBranch
} from 'lucide-react';

const TRIGGERS = [
  { value: 'ORDER_PLACED', label: 'Order Placed', icon: '🛒' },
  { value: 'LEAD_CREATED', label: 'Lead Created', icon: '👤' },
  { value: 'LOW_STOCK', label: 'Low Stock Alert', icon: '📦' },
  { value: 'PURCHASE_ABOVE_LIMIT', label: 'Purchase Exceeds Limit', icon: '💰' },
  { value: 'TICKET_OPENED', label: 'Support Ticket Opened', icon: '🎫' },
  { value: 'APPROVAL_NEEDED', label: 'Approval Needed', icon: '✅' },
];

const ACTION_TYPES = [
  { value: 'NOTIFY_EMAIL', label: 'Send Email', icon: Mail },
  { value: 'NOTIFY_WHATSAPP', label: 'Send WhatsApp', icon: MessageSquare },
  { value: 'NOTIFY_SMS', label: 'Send SMS', icon: Phone },
  { value: 'REQUIRE_APPROVAL', label: 'Request Approval', icon: CheckCircle2 },
  { value: 'ASSIGN_AGENT', label: 'Assign to Agent', icon: Users },
];

export default function AutomationDashboard() {
  const [activeTab, setActiveTab] = useState<'workflows' | 'approvals'>('workflows');
  const [workflows, setWorkflows] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/bas/automation/workflows').then(r => r.json()),
      fetch('/api/admin/bas/automation/approvals').then(r => r.json()),
    ]).then(([wf, ap]) => {
      setWorkflows(Array.isArray(wf) ? wf : []);
      setApprovals(Array.isArray(ap) ? ap : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const getApprovalStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':   return { color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-900/20',   border: 'border-amber-200 dark:border-amber-800',   icon: Clock,        label: 'Pending' };
      case 'APPROVED':  return { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', icon: CheckCircle2, label: 'Approved' };
      case 'REJECTED':  return { color: 'text-red-600 dark:text-red-400',     bg: 'bg-red-50 dark:bg-red-900/20',       border: 'border-red-200 dark:border-red-800',       icon: XCircle,      label: 'Rejected' };
      case 'ESCALATED': return { color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', icon: ChevronRight,  label: 'Escalated' };
      default:          return { color: 'text-gray-600 dark:text-gray-400',   bg: 'bg-gray-50 dark:bg-gray-800',        border: 'border-gray-200 dark:border-gray-700',     icon: Clock,        label: status };
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-xl gap-6">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-gradient-to-br from-violet-500 to-purple-700 rounded-2xl shadow-lg shadow-violet-500/30">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
              Workflow Automation
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Configure triggers, automate actions, and manage multi-level approvals</p>
          </div>
        </div>
        <button className="flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl shadow-lg shadow-violet-500/25 transition-all hover:scale-105 active:scale-95 font-medium">
          <Plus className="w-5 h-5" />
          <span>New Workflow</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-sm w-fit">
        {(['workflows', 'approvals'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-200 ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-md'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab === 'workflows' ? '⚡ Workflows' : '✅ Approvals'}
          </button>
        ))}
      </div>

      {/* Workflows Tab */}
      {activeTab === 'workflows' && (
        <div className="space-y-6">
          {/* Trigger legend */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {TRIGGERS.map(t => (
              <div key={t.value} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-3 rounded-2xl border border-white/20 shadow-sm text-center hover:-translate-y-1 transition-transform duration-200 cursor-pointer group">
                <div className="text-2xl mb-1">{t.icon}</div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{t.label}</p>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-500 bg-white/40 dark:bg-slate-900/40 rounded-3xl backdrop-blur-md">Loading workflows...</div>
          ) : workflows.length === 0 ? (
            <div className="text-center py-20 bg-white/40 dark:bg-slate-900/40 rounded-3xl backdrop-blur-md border border-white/20 border-dashed">
              <Zap className="w-12 h-12 text-violet-300 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">No workflows configured yet</p>
              <p className="text-gray-400 mt-2">Click "New Workflow" to automate your first business process</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workflows.map((wf: any) => (
                <div key={wf.id} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-lg hover:shadow-xl hover:border-violet-500/30 transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{wf.name}</h3>
                        {wf.isActive ? (
                          <span className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 animate-pulse">
                            <Play className="w-3 h-3 mr-1" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center text-xs font-bold text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
                            <Pause className="w-3 h-3 mr-1" /> Paused
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{wf.description || 'No description'}</p>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 bg-violet-50 dark:bg-violet-900/30 text-violet-600 rounded-xl hover:bg-violet-100 transition-colors">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Visual step chain */}
                  <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                    <div className="flex items-center space-x-2 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 px-3 py-1.5 rounded-xl">
                      <GitBranch className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      <span className="text-xs font-bold text-violet-700 dark:text-violet-300">{wf.triggerType}</span>
                    </div>
                    {wf.steps?.map((step: any, i: number) => {
                      const actionDef = ACTION_TYPES.find(a => a.value === step.actionType);
                      const Icon = actionDef?.icon || Zap;
                      return (
                        <React.Fragment key={step.id}>
                          <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="flex items-center space-x-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-3 py-1.5 rounded-xl">
                            <Icon className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{actionDef?.label || step.actionType}</span>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Approvals Tab */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20 text-gray-500 bg-white/40 dark:bg-slate-900/40 rounded-3xl">Loading approvals...</div>
          ) : approvals.length === 0 ? (
            <div className="text-center py-20 bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-white/20 border-dashed">
              <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">No approval requests</p>
              <p className="text-gray-400 mt-2">All clear! No pending approvals at this time.</p>
            </div>
          ) : (
            approvals.map((ap: any) => {
              const cfg = getApprovalStatusConfig(ap.status);
              const StatusIcon = cfg.icon;
              return (
                <div key={ap.id} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {cfg.label}
                        </span>
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-slate-700">{ap.workflowType}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{ap.title}</h3>
                      {ap.description && <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{ap.description}</p>}
                      {ap.amount && (
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2">Amount: ₹{ap.amount.toLocaleString()}</p>
                      )}

                      {/* Approval Level Pipeline */}
                      <div className="flex items-center space-x-2 mt-4 flex-wrap gap-y-2">
                        {ap.approvalLevels?.map((level: any, i: number) => {
                          const lCfg = getApprovalStatusConfig(level.status);
                          const LIcon = lCfg.icon;
                          return (
                            <React.Fragment key={level.id}>
                              {i > 0 && <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                              <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${lCfg.bg} ${lCfg.color} ${lCfg.border}`}>
                                <LIcon className="w-3 h-3" />
                                <span>L{level.level}</span>
                              </div>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>

                    {ap.status === 'PENDING' && (
                      <div className="flex space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow transition-all hover:scale-105">
                          Approve
                        </button>
                        <button className="px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl border border-red-200 dark:border-red-800 transition-all hover:scale-105">
                          Reject
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-between text-xs text-gray-400">
                    <span>Requested by: {ap.requestedById.slice(0, 8)}...</span>
                    <span>{new Date(ap.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
