"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  FiEdit3,
  FiFacebook,
  FiInstagram,
  FiMessageCircle,
  FiMapPin,
  FiVideo,
  FiTrendingUp,
  FiTarget,
  FiDollarSign,
  FiUsers
} from "react-icons/fi";

export default function ContentRepurposerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  
  const [topicInput, setTopicInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedDrafts, setGeneratedDrafts] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/en/login");
    } else if (status === "authenticated") {
      fetchTrackingData();
    }
  }, [status, router]);

  const fetchTrackingData = async () => {
    try {
      const res = await fetch("/api/admin/content-repurposer");
      const json = await res.json();
      if (json.success) {
        setCampaigns(json.data);
      }
    } catch (err) {
      console.error("Failed to load tracking data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!topicInput) return;
    setGenerating(true);
    setGeneratedDrafts(null);
    try {
      const res = await fetch("/api/admin/content-repurposer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleTopic: topicInput })
      });
      const json = await res.json();
      if (json.success) {
        setGeneratedDrafts(json.data);
        fetchTrackingData(); // Refresh table to show new initialized tracking
      }
    } catch (error) {
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading || status === "loading") {
    return <div className="flex justify-center items-center h-screen bg-slate-900"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center gap-3">
            <FiEdit3 className="text-indigo-500" /> AI Social Media Engine
          </h1>
          <p className="text-slate-400 mt-2">
            Phase 6: Automatic Article Repurposing & Full-Funnel Tracking (Reach → Revenue)
          </p>
        </div>

        {/* Content Generator */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4">Create New Campaign Workflow</h2>
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Enter core article topic (e.g. Preventive Healthcare for Diabetes)" 
              className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
            />
            <button 
              onClick={handleGenerate}
              disabled={generating}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
            >
              {generating ? "Generating workflow..." : "Generate & Repurpose"}
            </button>
          </div>

          {generatedDrafts && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900 border border-slate-700 rounded-lg">
                <h3 className="font-bold text-emerald-400 flex items-center gap-2 mb-2"><FiEdit3/> Article Draft</h3>
                <p className="text-sm text-slate-300">{generatedDrafts.article}</p>
              </div>
              <div className="p-4 bg-slate-900 border border-blue-900 rounded-lg">
                <h3 className="font-bold text-blue-400 flex items-center gap-2 mb-2"><FiFacebook/> Facebook Post</h3>
                <p className="text-sm text-slate-300">{generatedDrafts.facebook}</p>
              </div>
              <div className="p-4 bg-slate-900 border border-pink-900 rounded-lg">
                <h3 className="font-bold text-pink-400 flex items-center gap-2 mb-2"><FiInstagram/> Instagram Caption</h3>
                <p className="text-sm text-slate-300">{generatedDrafts.instagram}</p>
              </div>
              <div className="p-4 bg-slate-900 border border-green-900 rounded-lg">
                <h3 className="font-bold text-green-400 flex items-center gap-2 mb-2"><FiMessageCircle/> WhatsApp Broadcast</h3>
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{generatedDrafts.whatsapp}</p>
              </div>
              <div className="p-4 bg-slate-900 border border-amber-900 rounded-lg">
                <h3 className="font-bold text-amber-400 flex items-center gap-2 mb-2"><FiMapPin/> Google Business Profile</h3>
                <p className="text-sm text-slate-300">{generatedDrafts.gbp}</p>
              </div>
              <div className="p-4 bg-slate-900 border border-rose-900 rounded-lg">
                <h3 className="font-bold text-rose-400 flex items-center gap-2 mb-2"><FiVideo/> Short Video Script</h3>
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{generatedDrafts.videoScript}</p>
              </div>
              <div className="col-span-full flex justify-end mt-2">
                <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded font-semibold text-sm">
                  Approve & Push to Drafts
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tracking Metrics Table */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FiTarget className="text-emerald-500" /> Full-Funnel Tracking (Optimizing for Revenue)
          </h2>
          <p className="text-sm text-slate-400 mb-6">Tracking the entire journey: Reach → Clicks → WhatsApp → Lead → Customer → Order → Revenue.</p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-700/50 text-slate-300 text-xs uppercase tracking-wider">
                  <th className="p-3 border-b border-slate-600 rounded-tl-lg">Campaign</th>
                  <th className="p-3 border-b border-slate-600 text-center"><FiTrendingUp className="inline mr-1" />Reach</th>
                  <th className="p-3 border-b border-slate-600 text-center">Clicks</th>
                  <th className="p-3 border-b border-slate-600 text-center"><FiMessageCircle className="inline mr-1" />WA Inqs</th>
                  <th className="p-3 border-b border-slate-600 text-center"><FiUsers className="inline mr-1" />Leads</th>
                  <th className="p-3 border-b border-slate-600 text-center">Customers</th>
                  <th className="p-3 border-b border-slate-600 text-center">Orders</th>
                  <th className="p-3 border-b border-slate-600 text-right rounded-tr-lg"><FiDollarSign className="inline mr-1" />Revenue</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {campaigns.length === 0 ? (
                  <tr><td colSpan="8" className="p-8 text-center text-slate-400">No campaigns tracked yet.</td></tr>
                ) : (
                  campaigns.map((c, idx) => (
                    <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors group">
                      <td className="p-3 font-medium text-white max-w-xs truncate" title={c.name}>{c.name}</td>
                      <td className="p-3 text-slate-300 text-center">{c.totalReach}</td>
                      <td className="p-3 text-slate-300 text-center">{c.totalClicks}</td>
                      <td className="p-3 text-green-400 font-semibold text-center">{c.totalWaInqs}</td>
                      <td className="p-3 text-indigo-300 text-center">{c.totalLeads}</td>
                      <td className="p-3 text-emerald-300 text-center">{c.totalCustomers}</td>
                      <td className="p-3 text-slate-300 text-center">{c.totalOrders}</td>
                      <td className="p-3 text-amber-400 font-bold text-right">₹{c.totalRevenue.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
