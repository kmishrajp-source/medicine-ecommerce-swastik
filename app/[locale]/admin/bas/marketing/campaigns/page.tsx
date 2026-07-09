'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, Zap, BarChart2, Plus, Play, Pause,
  Mail, MessageCircle, Heart, UserPlus
} from 'lucide-react';
import Link from 'next/link';

const CampaignManager = () => {
  const [data, setData] = useState({ campaigns: [], automations: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchData();
  }, []);

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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
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
        
        {/* Automations Section */}
        <div className="bg-white border rounded-xl shadow-sm flex flex-col">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" /> Active Automations
            </h3>
            <button className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 flex items-center gap-1">
              <Plus className="w-4 h-4"/> New Rule
            </button>
          </div>
          <div className="p-0 overflow-y-auto max-h-[500px]">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading automations...</div>
            ) : (data.automations || []).length === 0 ? (
              <div className="p-8 text-center text-gray-500 border-2 border-dashed mx-4 my-4 rounded-xl">
                No active automations. Create a Cart Abandonment or Welcome Email rule.
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
                        <div className="text-sm font-bold text-gray-900">{auto.runCount.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Executions</div>
                      </div>
                      <button className={`p-2 rounded-full ${auto.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}>
                        {auto.isActive ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5"/>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ad Campaigns Section */}
        <div className="bg-white border rounded-xl shadow-sm flex flex-col">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-500" /> Advertising Campaigns
            </h3>
            <button className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 flex items-center gap-1">
              <Plus className="w-4 h-4"/> Track Ad Spend
            </button>
          </div>
          <div className="p-0 overflow-y-auto max-h-[500px]">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading campaigns...</div>
            ) : (data.campaigns || []).length === 0 ? (
              <div className="p-8 text-center text-gray-500 border-2 border-dashed mx-4 my-4 rounded-xl">
                No active ad campaigns. Add your Facebook/Google Ad spend here to calculate ROI.
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
                        <div className="text-xs text-gray-500">Budget Allocated</div>
                        <div className="font-medium">₹{camp.budget.toLocaleString()}</div>
                      </div>
                      <div className="bg-red-50 p-2 rounded border border-red-100">
                        <div className="text-xs text-red-600">Total Spend</div>
                        <div className="font-bold text-red-700">₹{camp.spend.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CampaignManager;
