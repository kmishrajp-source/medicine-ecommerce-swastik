'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, CheckCircle2, User, Clock, Filter, Plus, Send, X, Search } from 'lucide-react';

const DEPARTMENTS = ['MARKETING', 'SALES', 'OPERATIONS', 'WAREHOUSE', 'CS'];

export default function SOPManagement() {
  const [sops, setSops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState('ALL');
  const [activeSop, setActiveSop] = useState<any>(null);
  
  // Create SOP Form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSop, setNewSop] = useState({
    department: 'OPERATIONS',
    title: '',
    description: '',
    content: '',
    authorId: 'emp_01' // mockup current user ID
  });

  const fetchSops = () => {
    setLoading(true);
    const url = filterDept === 'ALL' ? '/api/admin/bas/sop' : `/api/admin/bas/sop?department=${filterDept}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setSops(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSops();
  }, [filterDept]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('/api/admin/bas/sop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSop),
    })
      .then(res => res.json())
      .then(() => {
        setShowCreateModal(false);
        setNewSop({ department: 'OPERATIONS', title: '', description: '', content: '', authorId: 'emp_01' });
        fetchSops();
      })
      .catch(err => console.error(err));
  };

  const handleAcknowledge = (sopId: string) => {
    fetch('/api/admin/bas/sop/acknowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sopDocumentId: sopId, employeeId: 'emp_01' }), // Mock employee
    })
      .then(res => res.json())
      .then(() => {
        fetchSops();
        if (activeSop && activeSop.id === sopId) {
          setActiveSop((prev: any) => ({
            ...prev,
            acknowledgements: [...(prev.acknowledgements || []), { employeeId: 'emp_01', acknowledgedAt: new Date() }]
          }));
        }
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-xl gap-6">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl shadow-lg shadow-indigo-500/30">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
              Standard Operating Procedures (SOP)
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Access guidelines, version control, and track reader confirmations</p>
          </div>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>New SOP Document</span>
        </button>
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Navigation / Filters & List */}
        <div className="space-y-6">
          {/* Department filter buttons */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-4 rounded-3xl border border-white/20 shadow-lg">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Departments</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterDept('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filterDept === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white/80 dark:bg-slate-800/80 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50'
                }`}
              >
                All SOPs
              </button>
              {DEPARTMENTS.map(dept => (
                <button
                  key={dept}
                  onClick={() => setFilterDept(dept)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    filterDept === dept
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white/80 dark:bg-slate-800/80 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* SOP List */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Guidelines</h3>
            {loading ? (
              <div className="text-center py-10 text-gray-500">Loading documents...</div>
            ) : sops.length === 0 ? (
              <div className="text-center py-10 text-gray-400">No SOPs found in department.</div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {sops.map((sop: any) => (
                  <button
                    key={sop.id}
                    onClick={() => setActiveSop(sop)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      activeSop?.id === sop.id
                        ? 'bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/20'
                        : 'bg-white/80 dark:bg-slate-800/80 border-gray-100 dark:border-slate-800 hover:border-indigo-500/20'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{sop.department}</span>
                      <span className="text-[10px] font-semibold text-gray-400">v{sop.version}.0</span>
                    </div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mt-1 truncate">{sop.title}</h4>
                    <div className="flex justify-between items-center mt-3 text-[10px] text-gray-400">
                      <span className="flex items-center"><User className="w-3 h-3 mr-1" /> {sop.authorId}</span>
                      <span className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" /> {sop.acknowledgements?.length || 0} Reads</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: SOP Viewer */}
        <div className="lg:col-span-2">
          {activeSop ? (
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-xl space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-start border-b border-gray-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                    {activeSop.department}
                  </span>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-3">{activeSop.title}</h2>
                  {activeSop.description && <p className="text-gray-400 mt-1 text-sm">{activeSop.description}</p>}
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-lg border border-gray-200 dark:border-slate-700">
                    Version {activeSop.version}.0
                  </span>
                </div>
              </div>

              {/* SOP Body Content */}
              <div className="bg-white/50 dark:bg-slate-950/50 p-6 rounded-2xl border border-white/10 max-h-[350px] overflow-y-auto font-mono text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {activeSop.content}
              </div>

              {/* Acknowledgements Status / Acknowledge button */}
              <div className="flex flex-col md:flex-row justify-between items-center pt-4 border-t border-gray-100 dark:border-slate-800 gap-4">
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>Last updated on {new Date(activeSop.updatedAt).toLocaleDateString()}</span>
                </div>
                
                {activeSop.acknowledgements?.some((a: any) => a.employeeId === 'emp_01') ? (
                  <span className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Read Acknowledged
                  </span>
                ) : (
                  <button
                    onClick={() => handleAcknowledge(activeSop.id)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 font-bold"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Acknowledge Read</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-white/20 border-dashed min-h-[400px] flex flex-col justify-center items-center text-center p-8">
              <FileText className="w-12 h-12 text-indigo-200 dark:text-indigo-900 mb-4" />
              <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400">No SOP Selected</h4>
              <p className="text-gray-400 mt-2 max-w-sm">Select an SOP document from the list to view its complete content and register read confirmation.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create SOP Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex justify-center items-center z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg p-8 rounded-3xl border border-white/20 shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-400 rounded-xl transition-all"
            >
              <X className="w-4 h-4" />
            </button>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create SOP Document</h3>
              <p className="text-xs text-gray-400 mt-1">Publish standard operating compliance rules</p>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Department</label>
                <select
                  value={newSop.department}
                  onChange={(e) => setNewSop({ ...newSop, department: e.target.value })}
                  className="w-full bg-white/80 dark:bg-slate-850/80 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Document Title</label>
                <input
                  type="text"
                  required
                  value={newSop.title}
                  onChange={(e) => setNewSop({ ...newSop, title: e.target.value })}
                  className="w-full bg-white/80 dark:bg-slate-850/80 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Cold Chain Storage Protocol"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Short Description</label>
                <input
                  type="text"
                  value={newSop.description}
                  onChange={(e) => setNewSop({ ...newSop, description: e.target.value })}
                  className="w-full bg-white/80 dark:bg-slate-850/80 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Summary of this guideline"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Document Content (Markdown)</label>
                <textarea
                  required
                  rows={6}
                  value={newSop.content}
                  onChange={(e) => setNewSop({ ...newSop, content: e.target.value })}
                  className="w-full bg-white/80 dark:bg-slate-850/80 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter detailed protocol guidelines..."
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 font-bold"
              >
                <Send className="w-5 h-5" />
                <span>Publish SOP</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
