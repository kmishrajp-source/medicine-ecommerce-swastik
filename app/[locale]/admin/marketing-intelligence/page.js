"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";

export default function MarketingIntelligencePage() {
    const { cartCount, toggleCart } = useCart();
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        kpis: {},
        campaigns: [],
        contents: [],
        leads: [],
        insights: [],
        channelBreakdown: {}
    });

    // Form state for creating AI Campaign
    const [campaignForm, setCampaignForm] = useState({
        title: "",
        objective: "PRODUCT_SALES",
        productOrService: "Homeopathy Dilutions & Ayurvedic Chronic Care",
        targetAudienceGroup: "NEW_PROSPECTS",
        geographyCity: "Gorakhpur",
        geographyRadiusKm: 15,
        campaignType: "HYBRID",
        budget: 1500
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    // Form state for simulating a lead
    const [leadForm, setLeadForm] = useState({
        fullName: "",
        phone: "",
        customerType: "PATIENT",
        productInterest: "Chronic Blood Pressure & Diabetes Monthly Refill",
        sourceChannel: "WHATSAPP",
        location: "Gorakhpur"
    });
    const [isCapturingLead, setIsCapturingLead] = useState(false);

    // Retargeting state
    const [retargetingType, setRetargetingType] = useState("CHRONIC_REFILL_DUE");
    const [retargetingResults, setRetargetingResults] = useState(null);
    const [isBuildingRetargeting, setIsBuildingRetargeting] = useState(false);

    useEffect(() => {
        fetchMarketingData();
    }, []);

    const fetchMarketingData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/marketing-intelligence");
            const json = await res.json();
            if (json.success) {
                setData(json);
            }
        } catch (err) {
            console.error("Failed to load marketing intelligence data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCampaign = async (e) => {
        e.preventDefault();
        setIsGenerating(true);
        setStatusMessage(null);
        try {
            const res = await fetch("/api/admin/marketing-intelligence", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "create_ai_campaign",
                    ...campaignForm
                })
            });
            const json = await res.json();
            if (json.success) {
                setStatusMessage({ type: "success", text: json.message });
                await fetchMarketingData();
                setActiveTab("calendar");
            } else {
                setStatusMessage({ type: "error", text: json.error || "Failed to generate campaign" });
            }
        } catch (err) {
            setStatusMessage({ type: "error", text: "Network error during AI content generation" });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApproveContent = async (contentId, approved) => {
        try {
            const res = await fetch("/api/admin/marketing-intelligence", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "approve_content",
                    contentId,
                    approved
                })
            });
            const json = await res.json();
            if (json.success) {
                fetchMarketingData();
            }
        } catch (err) {
            alert("Approval action failed");
        }
    };

    const handlePublishContent = async (contentId) => {
        try {
            const res = await fetch("/api/admin/marketing-intelligence", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "publish_content",
                    contentId
                })
            });
            const json = await res.json();
            if (json.success) {
                alert("Content marked as Published successfully!");
                fetchMarketingData();
            } else {
                alert(json.error || "Publish failed");
            }
        } catch (err) {
            alert("Failed to publish content");
        }
    };

    const handleApproveBudget = async (campaignId, approved) => {
        try {
            const res = await fetch("/api/admin/marketing-intelligence", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "approve_paid_budget",
                    campaignId,
                    approved
                })
            });
            const json = await res.json();
            if (json.success) {
                fetchMarketingData();
            }
        } catch (err) {
            alert("Budget approval failed");
        }
    };

    const handleCaptureLead = async (e) => {
        e.preventDefault();
        setIsCapturingLead(true);
        try {
            const res = await fetch("/api/admin/marketing-intelligence", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "capture_marketing_lead",
                    ...leadForm
                })
            });
            const json = await res.json();
            if (json.success) {
                alert("Lead captured and linked to Customer Finding Intelligence!");
                setLeadForm({
                    fullName: "",
                    phone: "",
                    customerType: "PATIENT",
                    productInterest: "",
                    sourceChannel: "WHATSAPP",
                    location: "Gorakhpur"
                });
                fetchMarketingData();
            } else {
                alert(json.error || "Lead capture failed");
            }
        } catch (err) {
            alert("Failed to capture lead");
        } finally {
            setIsCapturingLead(false);
        }
    };

    const handleBuildRetargeting = async () => {
        setIsBuildingRetargeting(true);
        try {
            const res = await fetch("/api/admin/marketing-intelligence", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "build_retargeting_audience",
                    segmentType: retargetingType
                })
            });
            const json = await res.json();
            if (json.success) {
                setRetargetingResults(json);
            }
        } catch (err) {
            alert("Failed to generate retargeting list");
        } finally {
            setIsBuildingRetargeting(false);
        }
    };

    const kpis = data.kpis || {};

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28">
                {/* Header Title */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
                    <div className="flex items-center gap-3">
                        <span className="p-3 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-2xl text-2xl shadow-lg shadow-indigo-500/20">
                            <i className="fa-solid fa-wand-magic-sparkles"></i>
                        </span>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-white">AI Marketing & Promotion Intelligence</h1>
                            <p className="text-slate-400 text-sm">Automated Video, Post, Channel Adaptation & Customer Finding Integration</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href="/admin/customer-intelligence"
                            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
                        >
                            <i className="fa-solid fa-users-viewfinder text-indigo-400"></i>
                            <span>Customer Finding Matrix</span>
                        </a>
                        <button
                            onClick={() => { setActiveTab("creator"); setStatusMessage(null); }}
                            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all text-xs flex items-center gap-2"
                        >
                            <i className="fa-solid fa-plus"></i>
                            <span>New AI Campaign</span>
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex overflow-x-auto gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl mb-8">
                    {[
                        { id: "overview", label: "Executive Overview", icon: "fa-chart-pie" },
                        { id: "creator", label: "AI Campaign Studio", icon: "fa-clapperboard" },
                        { id: "calendar", label: "Content Calendar & Approvals", icon: "fa-calendar-check" },
                        { id: "paid", label: "Paid Promotion Intelligence", icon: "fa-bullhorn" },
                        { id: "leads", label: "Lead Pipeline (A/B/C)", icon: "fa-filter-circle-dollar" },
                        { id: "retargeting", label: "AI Insights & Retargeting", icon: "fa-brain" }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}`}
                        >
                            <i className={`fa-solid ${tab.icon}`}></i>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* TAB 1: EXECUTIVE OVERVIEW */}
                {activeTab === "overview" && (
                    <div className="space-y-8">
                        {/* KPI Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Active Campaigns</span>
                                <span className="text-2xl font-black text-white">{kpis.activeCampaigns ?? 0}</span>
                            </div>
                            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
                                <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider block mb-1">Total Reach</span>
                                <span className="text-2xl font-black text-indigo-400">{(kpis.totalReach ?? 0).toLocaleString()}</span>
                            </div>
                            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
                                <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider block mb-1">Video Views</span>
                                <span className="text-2xl font-black text-cyan-400">{(kpis.totalViews ?? 0).toLocaleString()}</span>
                            </div>
                            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
                                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider block mb-1">Inbound Leads</span>
                                <span className="text-2xl font-black text-emerald-400">{kpis.totalLeads ?? 0}</span>
                            </div>
                            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
                                <span className="text-purple-400 text-xs font-bold uppercase tracking-wider block mb-1">Orders Won</span>
                                <span className="text-2xl font-black text-purple-400">{kpis.totalOrders ?? 0}</span>
                            </div>
                            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
                                <span className="text-amber-400 text-xs font-bold uppercase tracking-wider block mb-1">Revenue Generated</span>
                                <span className="text-2xl font-black text-amber-400">₹{(kpis.totalRevenue ?? 0).toLocaleString()}</span>
                            </div>
                            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
                                <span className="text-rose-400 text-xs font-bold uppercase tracking-wider block mb-1">Avg. Cost / Lead</span>
                                <span className="text-2xl font-black text-rose-400">{kpis.avgCpl ?? —”"}</span>
                            </div>
                        </div>

                        {/* Channel Performance Grid */}
                        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-black text-white">Channel Efficiency & ROAS Matrix</h3>
                                    <p className="text-slate-400 text-xs">Live tracking of reach, leads, orders, and revenue generated across media</p>
                                </div>
                                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold">
                                    {kpis.conversionRate ? `Overall Conversion: ${kpis.conversionRate}` : "No conversions yet"}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(data.channelBreakdown || {}).length === 0 ? (
                                <div className="col-span-3 py-12 text-center text-slate-500">
                                    <i className="fa-solid fa-chart-bar text-3xl mb-3 block"></i>
                                    <p className="text-sm font-bold">No channel data yet</p>
                                    <p className="text-xs mt-1">Capture leads via the Lead Pipeline tab to see real channel performance here.</p>
                                </div>
                            ) : Object.entries(data.channelBreakdown || {}).map(([ch, stat]) => (
                                    <div key={ch} className="bg-slate-950 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg text-sm">
                                                    <i className={`fa-brands ${ch === 'WHATSAPP' ? 'fa-whatsapp text-emerald-400' : ch === 'INSTAGRAM' ? 'fa-instagram text-pink-400' : ch === 'YOUTUBE' ? 'fa-youtube text-red-500' : ch === 'FACEBOOK' ? 'fa-facebook text-blue-500' : ch === 'LINKEDIN' ? 'fa-linkedin text-cyan-400' : 'fa-chrome text-amber-400'}`}></i>
                                                </span>
                                                <span className="font-bold text-sm text-white">{ch}</span>
                                            </div>
                                            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                                                ROAS: {stat.roas}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-800/60">
                                            <div>
                                                <span className="text-[10px] text-slate-500 uppercase font-bold block">Reach</span>
                                                <span className="font-mono text-xs font-bold text-slate-300">{(stat.reach).toLocaleString()}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-slate-500 uppercase font-bold block">Leads</span>
                                                <span className="font-mono text-xs font-bold text-indigo-400">{stat.leads}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-slate-500 uppercase font-bold block">Revenue</span>
                                                <span className="font-mono text-xs font-bold text-emerald-400">₹{(stat.revenue).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Strategic AI Insights & Recommendations */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-indigo-950/50 to-slate-900 border border-indigo-800/40 p-6 rounded-3xl">
                                <span className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl text-lg inline-block mb-3">
                                    <i className="fa-solid fa-map-pin"></i>
                                </span>
                                <h4 className="text-base font-bold text-white mb-1">Top Performing Geography</h4>
                                <p className="text-xs text-slate-300 mb-3">{kpis.topGeography || "No geography data yet"}</p>
                                <div className="text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                                    <strong>AI Insight:</strong> {kpis.topGeography ? "Dense concentration of chronic patients with high 3-hour hyperlocal delivery adoption." : "Capture leads with location data to see geographic insights."}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-950/50 to-slate-900 border border-emerald-800/40 p-6 rounded-3xl">
                                <span className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl text-lg inline-block mb-3">
                                    <i className="fa-brands fa-whatsapp"></i>
                                </span>
                                <h4 className="text-base font-bold text-white mb-1">Top Converting Channel</h4>
                                <p className="text-xs text-slate-300 mb-3">{kpis.topChannel || "No channel data yet"}</p>
                                <div className="text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                                    <strong>AI Insight:</strong> {kpis.topChannel ? "Direct 1-click prescription upload links on WhatsApp yield 34% conversion into delivered orders." : "Capture leads with source channels to see top converting channel."}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-950/50 to-slate-900 border border-purple-800/40 p-6 rounded-3xl">
                                <span className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl text-lg inline-block mb-3">
                                    <i className="fa-solid fa-pills"></i>
                                </span>
                                <h4 className="text-base font-bold text-white mb-1">Top High-Margin Product</h4>
                                <p className="text-xs text-slate-300 mb-3">{kpis.topProduct || "No product data yet"}</p>
                                <div className="text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                                    <strong>AI Insight:</strong> {kpis.topProduct ? "High repeat refill rate (28-day cycle) with zero substitution resistance." : "Product insights will appear once orders are linked to marketing campaigns."}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: AI CAMPAIGN STUDIO */}
                {activeTab === "creator" && (
                    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8">
                        <div className="max-w-3xl mb-8">
                            <h2 className="text-2xl font-black text-white">AI Content Creation & Channel Adaptation Studio</h2>
                            <p className="text-slate-400 text-sm mt-1">
                                Generates short videos, YouTube educational scripts, WhatsApp high-conversion messages, LinkedIn B2B pitches, and SEO articles with strict human approval guardrails.
                            </p>
                        </div>

                        {statusMessage && (
                            <div className={`p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-3 ${statusMessage.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                                <i className={`fa-solid ${statusMessage.type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}`}></i>
                                <span>{statusMessage.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleCreateCampaign} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Campaign Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Gorakhpur Chronic Care & Homeopathy Launch"
                                        value={campaignForm.title}
                                        onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Primary Objective</label>
                                    <select
                                        value={campaignForm.objective}
                                        onChange={(e) => setCampaignForm({ ...campaignForm, objective: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="PRODUCT_SALES">Direct Medicine & Product Sales</option>
                                        <option value="LEAD_GEN">Inbound Patient Prescription Leads</option>
                                        <option value="REFILL_RETENTION">Monthly Chronic Care Refill Retention</option>
                                        <option value="B2B_SUPPLIER">B2B Pharmacy & Stockist Recruitment</option>
                                        <option value="DOCTOR_BOOKING">Doctor Consultation & Diagnostic Bookings</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Product / Service / Offer Target</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Bakson Homeopathy, Glycomet 500mg, Full Body Health Check"
                                        value={campaignForm.productOrService}
                                        onChange={(e) => setCampaignForm({ ...campaignForm, productOrService: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Target Audience Segment</label>
                                    <select
                                        value={campaignForm.targetAudienceGroup}
                                        onChange={(e) => setCampaignForm({ ...campaignForm, targetAudienceGroup: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="NEW_PROSPECTS">New Prospects (First Time Buyers)</option>
                                        <option value="EXISTING_CUSTOMERS">Existing Customers (Repeat Orders)</option>
                                        <option value="HIGH_VALUE">High-Value / Chronic Care Families</option>
                                        <option value="B2B_RETAILERS">Licensed Retail Chemists (10% Commission)</option>
                                        <option value="STOCKISTS">Stockists & Pharma Distributors</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Target Geography (City)</label>
                                    <input
                                        type="text"
                                        value={campaignForm.geographyCity}
                                        onChange={(e) => setCampaignForm({ ...campaignForm, geographyCity: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Delivery Radius (KM)</label>
                                    <input
                                        type="number"
                                        value={campaignForm.geographyRadiusKm}
                                        onChange={(e) => setCampaignForm({ ...campaignForm, geographyRadiusKm: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Proposed Ad Budget (₹)</label>
                                    <input
                                        type="number"
                                        value={campaignForm.budget}
                                        onChange={(e) => setCampaignForm({ ...campaignForm, budget: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                                <div className="text-xs text-slate-400 flex items-center gap-2">
                                    <i className="fa-solid fa-shield-halved text-emerald-400"></i>
                                    <span>All generated posts will be placed in the <strong>Approval Queue</strong> for your review.</span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isGenerating}
                                    className="px-8 py-3.5 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:opacity-90 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/25 transition-all text-sm flex items-center gap-2"
                                >
                                    {isGenerating ? (
                                        <>
                                            <i className="fa-solid fa-spinner fa-spin"></i>
                                            <span>AI Generating Multi-Channel Assets...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-sparkles"></i>
                                            <span>Generate AI Campaign & Assets</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* TAB 3: CONTENT CALENDAR & APPROVALS */}
                {activeTab === "calendar" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-white">Content Calendar & Human-in-the-Loop Approval Queue</h3>
                                <p className="text-slate-400 text-xs">Review, adapt, approve, or reject AI-generated video scripts, posts, and messages</p>
                            </div>
                            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-bold">
                                {data.contents.length} Total Creative Assets
                            </span>
                        </div>

                        {data.contents.length === 0 ? (
                            <div className="py-20 text-center bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
                                <i className="fa-solid fa-film text-4xl text-slate-700 mb-4 block"></i>
                                <h4 className="text-lg font-bold text-slate-300">No Creative Assets Generated Yet</h4>
                                <p className="text-slate-500 text-xs mt-1 mb-4">Launch an AI campaign from the Campaign Studio tab to generate multi-channel assets.</p>
                                <button
                                    onClick={() => setActiveTab("creator")}
                                    className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl"
                                >
                                    Go to AI Studio
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {data.contents.map((item) => (
                                    <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
                                        <div>
                                            {/* Badge Row */}
                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${item.channel === 'WHATSAPP' ? 'bg-emerald-500/20 text-emerald-300' : item.channel === 'INSTAGRAM' ? 'bg-pink-500/20 text-pink-300' : item.channel === 'YOUTUBE' ? 'bg-red-500/20 text-red-300' : item.channel === 'LINKEDIN' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-700 text-slate-300'}`}>
                                                        {item.channel} • {item.contentType}
                                                    </span>
                                                </div>

                                                <span className={`px-2.5 py-1 rounded-full text-xs font-black ${item.approvalStatus === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : item.approvalStatus === 'REJECTED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'}`}>
                                                    {item.approvalStatus}
                                                </span>
                                            </div>

                                            <h4 className="text-base font-black text-white mb-2">{item.title}</h4>
                                            <p className="text-xs text-indigo-300 font-semibold mb-3"><strong>Key Message:</strong> {item.keyMessage}</p>

                                            {/* Script / Copy Body */}
                                            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 mb-4 max-h-48 overflow-y-auto text-xs text-slate-300 whitespace-pre-line font-sans leading-relaxed">
                                                {item.scriptOrCopy}
                                            </div>

                                            {item.visualPrompt && (
                                                <div className="bg-purple-950/30 border border-purple-800/30 p-3 rounded-xl text-[11px] text-purple-300 mb-4">
                                                    <strong>🎨 AI Visual / Video Generator Prompt:</strong> {item.visualPrompt}
                                                </div>
                                            )}

                                            <div className="text-[11px] text-slate-400 mb-4 flex items-center justify-between">
                                                <span><strong>CTA:</strong> {item.callToAction}</span>
                                                <span><strong>Target:</strong> {item.targetGeography}</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons with Human Approval Guardrail */}
                                        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                                            {item.approvalStatus === "PENDING_APPROVAL" ? (
                                                <>
                                                    <button
                                                        onClick={() => handleApproveContent(item.id, false)}
                                                        className="px-4 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-800/50 text-rose-300 text-xs font-bold rounded-xl transition-all"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => handleApproveContent(item.id, true)}
                                                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                                                    >
                                                        <i className="fa-solid fa-check"></i>
                                                        <span>Approve for Publish</span>
                                                    </button>
                                                </>
                                            ) : item.approvalStatus === "APPROVED" && !item.isPublished ? (
                                                <button
                                                    onClick={() => handlePublishContent(item.id)}
                                                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                                                >
                                                    <i className="fa-solid fa-paper-plane"></i>
                                                    <span>Publish to {item.channel}</span>
                                                </button>
                                            ) : (
                                                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                                                    <i className="fa-solid fa-circle-check"></i> Published • Live on Channel
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: PAID PROMOTION INTELLIGENCE */}
                {activeTab === "paid" && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-black text-white">Paid Promotion Intelligence & Budget Governance</h3>
                            <p className="text-slate-400 text-xs">AI evaluates objective, reach, CPL history, and conversion potential before recommending ad spend.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.campaigns.map((camp) => (
                                <div key={camp.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold text-slate-400">{camp.campaignType}</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${camp.paidRecommendation === 'PROMOTE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : camp.paidRecommendation === 'TEST_FIRST' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'}`}>
                                                AI: {camp.paidRecommendation.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <h4 className="text-lg font-black text-white mb-2">{camp.title}</h4>
                                        <p className="text-xs text-slate-400 mb-4">{camp.productOrService} • {camp.geographyCity} ({camp.geographyRadiusKm}km radius)</p>

                                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-4 space-y-2 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Proposed Budget:</span>
                                                <span className="font-bold text-white font-mono">₹{camp.budget}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Estimated Reach:</span>
                                                <span className="font-bold text-indigo-400 font-mono">{((camp.budget || 1000) * 18).toLocaleString()} Users</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Estimated Inbound Leads:</span>
                                                <span className="font-bold text-emerald-400 font-mono">{Math.floor((camp.budget || 1000) / 38)} Leads</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Human Approval Status:</span>
                                                <span className={`font-bold ${camp.paidApprovalStatus === 'APPROVED' ? 'text-emerald-400' : 'text-amber-400'}`}>{camp.paidApprovalStatus}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-800">
                                        {camp.paidApprovalStatus === "PENDING" ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApproveBudget(camp.id, false)}
                                                    className="flex-1 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-800/40 text-rose-300 text-xs font-bold rounded-xl"
                                                >
                                                    Decline Spend
                                                </button>
                                                <button
                                                    onClick={() => handleApproveBudget(camp.id, true)}
                                                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20"
                                                >
                                                    Approve Budget (₹{camp.budget})
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-center text-xs font-bold text-emerald-400 py-1">
                                                <i className="fa-solid fa-circle-check mr-1"></i> Budget Approved & Active
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB 5: LEAD PIPELINE (A/B/C PRIORITY) */}
                {activeTab === "leads" && (
                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-black text-white">Inbound Lead Pipeline & Customer Intelligence Link</h3>
                                <p className="text-slate-400 text-xs">AI Lead Scoring, A/B/C Priority Tiering, and direct push to CRM / Salesperson</p>
                            </div>

                            <a
                                href="/admin/customer-intelligence"
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 self-start"
                            >
                                <i className="fa-solid fa-users-viewfinder"></i>
                                <span>Open Customer Finding Matrix</span>
                            </a>
                        </div>

                        {/* Capture / Simulate Inbound Lead Modal Box */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                            <h4 className="text-sm font-black text-indigo-400 uppercase tracking-wider mb-4">Capture Inbound Marketing Lead</h4>
                            <form onSubmit={handleCaptureLead} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    required
                                    value={leadForm.fullName}
                                    onChange={(e) => setLeadForm({ ...leadForm, fullName: e.target.value })}
                                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                                />
                                <input
                                    type="text"
                                    placeholder="Phone Number"
                                    required
                                    value={leadForm.phone}
                                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                                />
                                <select
                                    value={leadForm.customerType}
                                    onChange={(e) => setLeadForm({ ...leadForm, customerType: e.target.value })}
                                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                                >
                                    <option value="PATIENT">Patient (Chronic/General)</option>
                                    <option value="RETAILER">Retail Pharmacy</option>
                                    <option value="DOCTOR">Doctor Clinic</option>
                                    <option value="STOCKIST">Stockist / Distributor</option>
                                </select>
                                <select
                                    value={leadForm.sourceChannel}
                                    onChange={(e) => setLeadForm({ ...leadForm, sourceChannel: e.target.value })}
                                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                                >
                                    <option value="WHATSAPP">WhatsApp</option>
                                    <option value="INSTAGRAM">Instagram</option>
                                    <option value="FACEBOOK">Facebook</option>
                                    <option value="YOUTUBE">YouTube</option>
                                    <option value="LINKEDIN">LinkedIn</option>
                                    <option value="WEBSITE">Website</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Product Interest (e.g. Diabetes Monthly)"
                                    value={leadForm.productInterest}
                                    onChange={(e) => setLeadForm({ ...leadForm, productInterest: e.target.value })}
                                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                                />
                                <button
                                    type="submit"
                                    disabled={isCapturingLead}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs py-2 shadow-lg"
                                >
                                    {isCapturingLead ? "Scoring..." : "+ Save & Score Lead"}
                                </button>
                            </form>
                        </div>

                        {/* Leads Table */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-slate-300">
                                    <thead className="bg-slate-950 text-slate-400 uppercase font-black tracking-wider border-b border-slate-800">
                                        <tr>
                                            <th className="py-3.5 px-4">Lead & Contact</th>
                                            <th className="py-3.5 px-4">Type & Channel</th>
                                            <th className="py-3.5 px-4">Product Interest</th>
                                            <th className="py-3.5 px-4">AI Score & Priority</th>
                                            <th className="py-3.5 px-4">Status</th>
                                            <th className="py-3.5 px-4">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {data.leads.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="py-12 text-center text-slate-500 font-bold">
                                                    No leads captured yet. Use the form above or launch campaigns to capture live inquiries.
                                                </td>
                                            </tr>
                                        ) : (
                                            data.leads.map((l) => (
                                                <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                                                    <td className="py-3.5 px-4">
                                                        <div className="font-bold text-white text-sm">{l.fullName}</div>
                                                        <div className="font-mono text-slate-400 text-xs mt-0.5">{l.phone} • {l.location}</div>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <span className="font-bold text-indigo-300 block">{l.customerType}</span>
                                                        <span className="text-[10px] text-slate-400">{l.sourceChannel}</span>
                                                    </td>
                                                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                                                        {l.productInterest || "General Inquiry"}
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black ${l.priorityRank === 'A' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : l.priorityRank === 'B' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-700 text-slate-300'}`}>
                                                                Priority {l.priorityRank}
                                                            </span>
                                                            <span className="font-mono font-bold text-slate-400">Score: {l.leadScore}/100</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-bold text-slate-300">
                                                            {l.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <a
                                                            href={`https://wa.me/${l.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Namaste ${l.fullName}, thank you for inquiring with Swastik Medicare regarding ${l.productInterest || 'medicines'}. How can we assist with your order?`)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5"
                                                        >
                                                            <i className="fa-brands fa-whatsapp"></i>
                                                            <span>Chat & Quote</span>
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 6: AI INSIGHTS & RETARGETING */}
                {activeTab === "retargeting" && (
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xl font-black text-white">AI Campaign Diagnostics & Retargeting Engine</h3>
                            <p className="text-slate-400 text-xs">Understand why campaigns performed, and trigger hyper-targeted re-engagement for high-intent audiences.</p>
                        </div>

                        {/* Retargeting Segment Builder */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                            <h4 className="text-sm font-black text-indigo-400 uppercase tracking-wider mb-3">AI Retargeting Audience Builder</h4>
                            <div className="flex flex-col sm:flex-row gap-3 items-center mb-4">
                                <select
                                    value={retargetingType}
                                    onChange={(e) => setRetargetingType(e.target.value)}
                                    className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-bold"
                                >
                                    <option value="CHRONIC_REFILL_DUE">Chronic Patients Refill Due (25-35 Days Since Last Order)</option>
                                    <option value="CART_DROP_OFF">High-Intent Cart Drop-Offs (Last 24 Hours)</option>
                                    <option value="VIDEO_ENGAGED">High Video Watch-Time Viewers (&gt;75% Completion)</option>
                                </select>

                                <button
                                    onClick={handleBuildRetargeting}
                                    disabled={isBuildingRetargeting}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                                >
                                    {isBuildingRetargeting ? "Generating Segment..." : "Build Retargeting List"}
                                </button>
                            </div>

                            {retargetingResults && (
                                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-emerald-400">Found {retargetingResults.count} High-Intent Retargeting Targets</span>
                                        <span className="text-xs text-indigo-300 font-bold">{retargetingResults.recommendedCampaign}</span>
                                    </div>

                                    <div className="space-y-2">
                                        {retargetingResults.audiences.map((aud, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800/80 text-xs">
                                                <div>
                                                    <span className="font-bold text-white">{aud.name}</span>
                                                    <span className="text-slate-400 ml-2">({aud.phone})</span>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">{aud.reason}</p>
                                                </div>
                                                <a
                                                    href={`https://wa.me/${aud.phone}?text=${encodeURIComponent(`Namaste ${aud.name}, your monthly medicine refill is due. Order today on Swastik Medicare for 3-hour doorstep delivery and flat 10% discount: https://swastikmed.online`)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg text-xs"
                                                >
                                                    Send Refill Alert
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* AI Performance Insights List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data.insights.map((ins) => (
                                <div key={ins.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[11px] font-black uppercase text-indigo-400">{ins.category}</span>
                                        <span className="text-xs font-bold text-emerald-400 font-mono">Confidence: {ins.confidenceScore}%</span>
                                    </div>

                                    <h4 className="text-base font-black text-white mb-2">{ins.title}</h4>
                                    <p className="text-xs text-slate-300 mb-4 leading-relaxed">{ins.insightText}</p>

                                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2 mb-4 text-xs">
                                        <div>
                                            <strong className="text-slate-400 block text-[10px] uppercase">Why it Happened:</strong>
                                            <p className="text-slate-300 mt-0.5">{ins.whyItHappened}</p>
                                        </div>
                                        <div className="pt-2 border-t border-slate-800">
                                            <strong className="text-emerald-400 block text-[10px] uppercase">Recommended Action:</strong>
                                            <p className="text-emerald-300 mt-0.5">{ins.recommendedAction}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
