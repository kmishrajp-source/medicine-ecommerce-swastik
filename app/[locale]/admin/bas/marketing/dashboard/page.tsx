'use client';

import React, { useState, useEffect } from 'react';
import { 
  Megaphone, Users, Target, CheckCircle, 
  TrendingUp, TrendingDown, DollarSign, Activity, Settings
} from 'lucide-react';
import Link from 'next/link';

const MarketingFunnelDashboard = () => {
  const [data, setData] = useState(null);
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

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Loading Marketing Funnel...</div>;
  }

  const f = data?.funnel || {};
  const fin = data?.financials || {};

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Megaphone className="h-8 w-8 text-purple-600" />
            Marketing & Funnel ROI
          </h1>
          <p className="text-gray-500 mt-1">Track your customer acquisition cost, advertising ROI, and conversion funnel.</p>
        </div>
        <Link 
          href="/en/admin/bas/marketing/campaigns"
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition"
        >
          <Settings className="w-4 h-4" /> Manage Campaigns & Automations
        </Link>
      </div>

      {/* Top Level Financials */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Ad Spend</p>
          <h3 className="text-2xl font-bold text-gray-900">₹{(fin.adSpend || 0).toLocaleString()}</h3>
          <p className="text-xs text-gray-500 mt-1">Across all active campaigns</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
          <h3 className="text-2xl font-bold text-green-600">₹{(fin.revenue || 0).toLocaleString()}</h3>
          <p className="text-xs text-gray-500 mt-1">Generated this month</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Gross Profit</p>
          <h3 className="text-2xl font-bold text-blue-600">₹{(fin.profit || 0).toLocaleString()}</h3>
          <p className="text-xs text-gray-500 mt-1">Estimated at 30% margin</p>
        </div>
        <div className={`p-6 rounded-xl border shadow-sm ${fin.roi > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className={`text-sm font-medium mb-1 ${fin.roi > 0 ? 'text-green-800' : 'text-red-800'}`}>Marketing ROI</p>
          <h3 className={`text-2xl font-bold flex items-center gap-2 ${fin.roi > 0 ? 'text-green-900' : 'text-red-900'}`}>
            {fin.roi > 0 ? <TrendingUp className="w-6 h-6"/> : <TrendingDown className="w-6 h-6"/>}
            {fin.roi > 0 ? '+' : ''}{Math.round(fin.roi || 0)}%
          </h3>
          <p className={`text-xs mt-1 ${fin.roi > 0 ? 'text-green-700' : 'text-red-700'}`}>
            Return on ad spend
          </p>
        </div>
      </div>

      {/* The Visual Funnel */}
      <div className="bg-white border rounded-xl shadow-sm p-8">
        <h3 className="text-lg font-bold text-gray-900 mb-8 text-center">Customer Acquisition Funnel</h3>
        
        <div className="max-w-3xl mx-auto space-y-4 relative">
          {/* Connecting Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-100 -translate-x-1/2 z-0"></div>

          {/* Visitors */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-full max-w-lg bg-blue-50 border-2 border-blue-200 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900">Website Visitors</h4>
                  <p className="text-xs text-blue-700">Top of funnel traffic</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-900">{f.visitors?.toLocaleString()}</div>
            </div>
            {f.visitors > 0 && <div className="text-xs font-semibold text-gray-400 py-2">{(f.leads / f.visitors * 100).toFixed(1)}% Conversion</div>}
          </div>

          {/* Leads */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-full max-w-md bg-purple-50 border-2 border-purple-200 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-purple-900">Captured Leads</h4>
                  <p className="text-xs text-purple-700">Enquiries & Signups</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-900">{f.leads?.toLocaleString()}</div>
            </div>
            {f.leads > 0 && <div className="text-xs font-semibold text-gray-400 py-2">{(f.newCustomers / f.leads * 100).toFixed(1)}% Conversion</div>}
          </div>

          {/* New Customers */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-full max-w-sm bg-green-50 border-2 border-green-200 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-900">New Customers</h4>
                  <p className="text-xs text-green-700">First-time buyers</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-900">{f.newCustomers?.toLocaleString()}</div>
            </div>
          </div>

          {/* Repeat Customers */}
          <div className="relative z-10 flex flex-col items-center mt-8">
            <div className="w-full max-w-sm bg-amber-50 border-2 border-amber-200 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900">Returning Customers</h4>
                  <p className="text-xs text-amber-700">Loyalty & Retention</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-amber-900">{f.returningCustomers?.toLocaleString()}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MarketingFunnelDashboard;
