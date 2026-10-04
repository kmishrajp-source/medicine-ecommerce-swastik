"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiUsers,
  FiTrendingUp,
  FiDollarSign,
  FiTarget,
  FiActivity,
  FiList,
  FiCheckCircle,
  FiAlertCircle,
  FiCpu
} from "react-icons/fi";

export default function AIGrowthDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/en/login");
    } else if (status === "authenticated") {
      if (!["ADMIN", "SUPER_ADMIN"].includes(session?.user?.role)) {
        router.push("/en");
      } else {
        fetchDashboardData();
      }
    }
  }, [status, session, router]);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/admin/ai-growth");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to load AI Growth data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <FiCpu size={120} className="text-emerald-500" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center gap-3">
              <FiTarget className="text-emerald-500" /> AI Growth Manager
            </h1>
            <p className="text-slate-400 mt-2">
              Automated marketing intelligence, attribution, and growth acceleration.
            </p>
          </div>
          <div className="mt-4 md:mt-0 z-10 flex gap-3">
            <button 
              onClick={async () => {
                setLoading(true);
                await fetch("/api/cron/ai-seo-analysis");
                fetchDashboardData();
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg shadow-indigo-900/50"
            >
              <FiTarget /> Run SEO Analysis
            </button>
            <button 
              onClick={fetchDashboardData}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/50"
            >
              <FiActivity /> Refresh Data
            </button>
          </div>
        </div>

        {/* Action Center - Urgent AI Tasks */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FiAlertCircle className="text-rose-500" /> AI Action Center
          </h2>
          {data?.tasks?.length > 0 ? (
            <div className="space-y-3">
              {data.tasks.map((task, idx) => (
                <div key={idx} className={`p-4 rounded-lg border flex justify-between items-center ${
                  task.priority === 'URGENT' ? 'bg-rose-900/20 border-rose-500/30' : 
                  task.priority === 'HIGH' ? 'bg-amber-900/20 border-amber-500/30' : 
                  'bg-slate-700/50 border-slate-600'
                }`}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        task.priority === 'URGENT' ? 'bg-rose-500 text-white' : 
                        task.priority === 'HIGH' ? 'bg-amber-500 text-white' : 
                        'bg-slate-500 text-white'
                      }`}>{task.priority}</span>
                      <h3 className="font-semibold text-white">{task.title}</h3>
                    </div>
                    <p className="text-sm text-slate-400">{task.description}</p>
                  </div>
                  <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition-all border border-slate-600">
                    Review
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-700/30 rounded-lg border border-slate-700 border-dashed">
              <FiCheckCircle className="mx-auto text-emerald-500 mb-2" size={32} />
              <p className="text-slate-400">All automated tasks completed. Systems optimal.</p>
            </div>
          )}
        </div>

        {/* Acquisition & Sales KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md">
            <div className="flex items-center gap-3 text-slate-400 mb-2">
              <FiUsers className="text-emerald-400" /> <h3>Total Customers</h3>
            </div>
            <div className="text-3xl font-bold text-white">{data?.kpi?.customers || 0}</div>
          </div>
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md">
            <div className="flex items-center gap-3 text-slate-400 mb-2">
              <FiTrendingUp className="text-teal-400" /> <h3>Total Leads</h3>
            </div>
            <div className="text-3xl font-bold text-white">{data?.kpi?.leads || 0}</div>
          </div>
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md">
            <div className="flex items-center gap-3 text-slate-400 mb-2">
              <FiDollarSign className="text-amber-400" /> <h3>Orders Completed</h3>
            </div>
            <div className="text-3xl font-bold text-white">{data?.kpi?.orders || 0}</div>
          </div>
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md">
            <div className="flex items-center gap-3 text-slate-400 mb-2">
              <FiActivity className="text-indigo-400" /> <h3>B2B Providers</h3>
            </div>
            <div className="text-3xl font-bold text-white">{data?.kpi?.providers || 0}</div>
          </div>
        </div>

        {/* Attribution Funnel */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FiList className="text-teal-500" /> Customer Attribution (Unified Model)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-700/50 text-slate-300 text-sm">
                  <th className="p-3 border-b border-slate-600 rounded-tl-lg">Source Channel</th>
                  <th className="p-3 border-b border-slate-600">Leads</th>
                  <th className="p-3 border-b border-slate-600">Customers</th>
                  <th className="p-3 border-b border-slate-600">Orders</th>
                  <th className="p-3 border-b border-slate-600 rounded-tr-lg">Conversion</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data?.attribution?.map((attr, idx) => (
                  <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="p-3 font-medium text-white">{attr.source}</td>
                    <td className="p-3 text-slate-300">{attr.leads}</td>
                    <td className="p-3 text-slate-300">{attr.customers}</td>
                    <td className="p-3 text-slate-300">{attr.orders}</td>
                    <td className="p-3 text-emerald-400 font-semibold">{attr.conversion}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!data?.attribution || data.attribution.length === 0) && (
              <div className="p-8 text-center text-slate-400">
                Tracking initialized. Waiting for incoming UTM data...
              </div>
            )}
          </div>
        </div>

        {/* Executive Reports & ROI */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          
          {/* ROI Center (Phase 16) */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FiDollarSign className="text-amber-500" /> Marketing ROI Engine
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                <p className="text-xs text-slate-400 mb-1">Customer Acq. Cost (CAC)</p>
                <p className="text-xl font-bold text-white">{data?.reports?.roi?.cac || 'Data unavailable'}</p>
              </div>
              <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                <p className="text-xs text-slate-400 mb-1">Lifetime Value (LTV)</p>
                <p className="text-xl font-bold text-white">{data?.reports?.roi?.ltv || 'Data unavailable'}</p>
              </div>
              <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                <p className="text-xs text-slate-400 mb-1">LTV:CAC Ratio</p>
                <p className="text-xl font-bold text-emerald-400">{data?.reports?.roi?.ratio || 'Data unavailable'}</p>
              </div>
              <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                <p className="text-xs text-slate-400 mb-1">Average Order Value</p>
                <p className="text-xl font-bold text-white">{data?.reports?.roi?.aov || 'Data unavailable'}</p>
              </div>
            </div>
          </div>

          {/* Daily & Weekly Reports (Phase 14 & 15) */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-indigo-500" /> Executive Reports
            </h2>
            <div className="space-y-4">
              
              <div className="p-4 border-l-4 border-indigo-500 bg-slate-900 rounded-r-lg">
                <h3 className="font-semibold text-white mb-2">Daily Summary</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Total GMV: <span className="font-medium text-emerald-400">₹{data?.reports?.daily?.revenue?.toLocaleString() || 0}</span></li>
                  <li>• New Leads: {data?.reports?.daily?.leads || 0}</li>
                  <li>• New B2B Providers: {data?.reports?.daily?.newProviders || 0}</li>
                  <li>• Traffic: {data?.reports?.daily?.traffic || 'Data unavailable'}</li>
                </ul>
              </div>

              <div className="p-4 border-l-4 border-purple-500 bg-slate-900 rounded-r-lg">
                <h3 className="font-semibold text-white mb-2">Weekly Executive Briefing</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Top Acquisition Channel: <span className="font-medium text-white">{data?.reports?.weekly?.topChannel || 'Unknown'}</span></li>
                  <li>• Revenue Trend: <span className="text-emerald-400">{data?.reports?.weekly?.revenueGrowth || '0%'}</span></li>
                  <li>• AI Action Items Pending: <span className="text-rose-400 font-bold">{data?.reports?.weekly?.actionItems || 0}</span> tasks</li>
                </ul>
                <button className="mt-3 text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded transition-all">
                  Generate PDF Report
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
