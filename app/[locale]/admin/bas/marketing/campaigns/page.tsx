'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, Zap, BarChart2, Plus, Play, Pause,
  Mail, MessageCircle, Heart, UserPlus, X, Check
} from 'lucide-react';
import Link from 'next/link';

const CampaignManager = () => {
  const [data, setData] = useState({ campaigns: [], automations: [] });
  const [loading, setLoading] = useState(true);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [newCampaign, setNewCampaign] = useState({
    name: '', type: 'GOOGLE_ADS', status: 'ACTIVE', budget: '', targetAudience: ''
  });
  const [newRule, setNewRule] = useState({
    name: '', triggerEvent: 'NEW_USER', actionType: 'SEND_WHATSAPP', delayHours: 1
  });

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/bas/marketing/analytics');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddCampaign = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/bas/marketing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newCampaign, budget: parseFloat(newCampaign.budget) || 0 })
      });
      if (res.ok) {
        setSuccessMsg('Campaign added!');
        setShowCampaignForm(false);
        setNewCampaign({ name: '', type: 'GOOGLE_ADS', status: 'ACTIVE', budget: '', targetAudience: '' });
        fetchData();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleAddRule = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/bas/marketing/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule)
      });
      if (res.ok) {
        setSuccessMsg('Automation rule created!');
        setShowRuleForm(false);
        setNewRule({ name: '', triggerEvent: 'NEW_USER', actionType: 'SEND_WHATSAPP', delayHours: 1 });
        fetchData();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const toggleAutomation = async (id, currentState) => {
    try {
      await fetch(`/api/admin/bas/marketing/automations`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentState })
      });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const getTriggerIcon = (event) => {
    switch(event) {
      case 'NEW_USER': return <UserPlus className="w-5 h-5 text-blue-500" />;
      case 'CART_ABANDONED': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'BIRTHDAY': return <Heart className="w-5 h-5 text-pink-500" />;
      default: return <Settings className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActionIcon = (action) => {
    switch(action) {
      case 'SEND_EMAIL': return <Mail className="w-4 h-4 text-gray-500" />;
      case 'SEND_WHATSAPP': return <MessageCircle className="w-4 h-4 text-green-500" />;
      default: return <Settings className="w-4 h-4 text-gray-500" />;
    }
  };

  const inputStyle = {
    width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
    borderRadius: '8px', fontSize: '0.9rem', outline: 'none'
  };
  const labelStyle = { fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '4px', display: 'block' };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Success Toast */}
      {successMsg && (
        <div style={{ position: 'fixed', top: '80px', right: '24px', background: '#22c55e', color: 'white', padding: '12px 20px', borderRadius: '12px', fontWeight: 700, zIndex: 9999, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check className="w-5 h-5" /> {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Settings className="h-8 w-8 text-purple-600" />
            Campaigns & Automations
          </h1>
          <p className="text-gray-500 mt-1">Manage ad spend tracking and automated marketing drips.</p>
        </div>
        <Link 
          href="/en/admin/bas/marketing/dashboard"
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition"
        >
          <BarChart2 className="w-4 h-4" /> View Funnel ROI
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Automations */}
        <div className="bg-white border rounded-xl shadow-sm flex flex-col">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" /> Active Automations
            </h3>
            <button
              onClick={() => setShowRuleForm(true)}
              className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 flex items-center gap-1"
            >
              <Plus className="w-4 h-4"/> New Rule
            </button>
          </div>
          <div className="p-0 overflow-y-auto max-h-[500px]">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading automations...</div>
            ) : (data.automations || []).length === 0 ? (
              <div className="p-8 text-center text-gray-500 border-2 border-dashed mx-4 my-4 rounded-xl">
                No active automations yet.<br/>
                <button onClick={() => setShowRuleForm(true)} className="mt-3 text-blue-600 font-bold text-sm underline">
                  Create your first automation rule →
                </button>
              </div>
            ) : (
              <div className="divide-y">
                {data.automations.map(auto => (
                  <div key={auto.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getTriggerIcon(auto.triggerEvent)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{auto.name}</h4>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          Trigger: <span className="font-mono bg-gray-200 px-1 rounded">{auto.triggerEvent}</span>
                          <span className="mx-1">→</span>
                          {getActionIcon(auto.actionType)} {auto.actionType}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">{(auto.runCount || 0).toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Executions</div>
                      </div>
                      <button
                        onClick={() => toggleAutomation(auto.id, auto.isActive)}
                        className={`p-2 rounded-full ${auto.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                        title={auto.isActive ? 'Pause' : 'Activate'}
                      >
                        {auto.isActive ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5"/>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ad Campaigns */}
        <div className="bg-white border rounded-xl shadow-sm flex flex-col">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-500" /> Advertising Campaigns
            </h3>
            <button
              onClick={() => setShowCampaignForm(true)}
              className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 flex items-center gap-1"
            >
              <Plus className="w-4 h-4"/> Track Ad Spend
            </button>
          </div>
          <div className="p-0 overflow-y-auto max-h-[500px]">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading campaigns...</div>
            ) : (data.campaigns || []).length === 0 ? (
              <div className="p-8 text-center text-gray-500 border-2 border-dashed mx-4 my-4 rounded-xl">
                No ad campaigns yet.<br/>
                <button onClick={() => setShowCampaignForm(true)} className="mt-3 text-blue-600 font-bold text-sm underline">
                  Add your first campaign →
                </button>
              </div>
            ) : (
              <div className="divide-y">
                {data.campaigns.map(camp => (
                  <div key={camp.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{camp.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs ${camp.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {camp.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div className="bg-gray-50 p-2 rounded border">
                        <div className="text-xs text-gray-500">Budget</div>
                        <div className="font-medium">₹{(camp.budget || 0).toLocaleString()}</div>
                      </div>
                      <div className="bg-red-50 p-2 rounded border border-red-100">
                        <div className="text-xs text-red-600">Spend</div>
                        <div className="font-bold text-red-700">₹{(camp.spend || 0).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---- MODAL: Add Campaign ---- */}
      {showCampaignForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={handleAddCampaign} style={{ background: 'white', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '440px', display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Track Ad Campaign</h2>
              <button type="button" onClick={() => setShowCampaignForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div>
              <label style={labelStyle}>Campaign Name *</label>
              <input style={inputStyle} required placeholder="e.g. Google Gorakhpur Medicines" value={newCampaign.name} onChange={e => setNewCampaign(p => ({...p, name: e.target.value}))} />
            </div>
            <div>
              <label style={labelStyle}>Platform</label>
              <select style={inputStyle} value={newCampaign.type} onChange={e => setNewCampaign(p => ({...p, type: e.target.value}))}>
                <option value="GOOGLE_ADS">Google Ads</option>
                <option value="META_ADS">Meta / Facebook Ads</option>
                <option value="WHATSAPP">WhatsApp Campaign</option>
                <option value="SMS">SMS Campaign</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Budget (₹)</label>
              <input style={inputStyle} type="number" min="0" placeholder="5000" value={newCampaign.budget} onChange={e => setNewCampaign(p => ({...p, budget: e.target.value}))} />
            </div>
            <div>
              <label style={labelStyle}>Target Audience</label>
              <input style={inputStyle} placeholder="e.g. Gorakhpur diabetics aged 40+" value={newCampaign.targetAudience} onChange={e => setNewCampaign(p => ({...p, targetAudience: e.target.value}))} />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowCampaignForm(false)} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ padding: '8px 20px', borderRadius: '8px', background: '#7c3aed', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                {saving ? 'Saving...' : 'Add Campaign'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---- MODAL: New Automation Rule ---- */}
      {showRuleForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={handleAddRule} style={{ background: 'white', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '440px', display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.1rem' }}>New Automation Rule</h2>
              <button type="button" onClick={() => setShowRuleForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div>
              <label style={labelStyle}>Rule Name *</label>
              <input style={inputStyle} required placeholder="e.g. Welcome WhatsApp Message" value={newRule.name} onChange={e => setNewRule(p => ({...p, name: e.target.value}))} />
            </div>
            <div>
              <label style={labelStyle}>Trigger Event</label>
              <select style={inputStyle} value={newRule.triggerEvent} onChange={e => setNewRule(p => ({...p, triggerEvent: e.target.value}))}>
                <option value="NEW_USER">New User Signup</option>
                <option value="CART_ABANDONED">Cart Abandoned</option>
                <option value="BIRTHDAY">Customer Birthday</option>
                <option value="ORDER_PLACED">Order Placed</option>
                <option value="ORDER_DELIVERED">Order Delivered</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Action</label>
              <select style={inputStyle} value={newRule.actionType} onChange={e => setNewRule(p => ({...p, actionType: e.target.value}))}>
                <option value="SEND_WHATSAPP">Send WhatsApp Message</option>
                <option value="SEND_EMAIL">Send Email</option>
                <option value="SEND_SMS">Send SMS</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Delay (hours after trigger)</label>
              <input style={inputStyle} type="number" min="0" max="168" value={newRule.delayHours} onChange={e => setNewRule(p => ({...p, delayHours: parseInt(e.target.value)}))} />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowRuleForm(false)} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ padding: '8px 20px', borderRadius: '8px', background: '#f59e0b', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                {saving ? 'Creating...' : 'Create Rule'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CampaignManager;
