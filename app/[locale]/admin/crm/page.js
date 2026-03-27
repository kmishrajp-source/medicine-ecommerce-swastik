"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminCRMDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [leads, setLeads] = useState([]);
    const [agents, setAgents] = useState([]);
    const [batches, setBatches] = useState([]);
    const [revenueStats, setRevenueStats] = useState({ total: 0, listing: 0, leads: 0 });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: 'all', agentId: 'all', area: 'all', serviceType: 'all' });
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [assigningAgent, setAssigningAgent] = useState("");
    const [bulkJson, setBulkJson] = useState("");
    const [revenueData, setRevenueData] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [activeTab, setActiveTab] = useState("leads");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && session.user.role !== 'ADMIN') {
            router.push("/");
        } else if (status === "authenticated") {
            fetchLeads();
            // Assuming fetchAgents, fetchRevenue, fetchPaymentHistory are also needed on initial load
            // and potentially on filter changes.
            // For now, I'll add them here, but the user's provided useEffect structure was ambiguous.
            // The instruction's useEffect was:
            // useEffect(() => { fetchLeads(); fetchAgents(); fetchRevenue(); fetchPaymentHistory(); }, [filterStatus, filterAgent, filterArea]);
            // This implies a different filter state management or a separate useEffect.
            // I will integrate the new fetches into the existing authenticated block and add a separate useEffect for filters if needed.
            // For now, I'll keep the existing filter dependency for fetchLeads.
            fetchAgents(); // Assuming this is a new function to fetch agents separately if not part of fetchLeads
            fetchRevenue(); // Assuming this is a new function
            fetchPaymentHistory();
        }
    }, [status, filters]); // Keep existing dependencies for now

    // New useEffect for filter-based data fetching, if filters are meant to trigger all fetches
    // This part is speculative based on the instruction's useEffect, but not explicitly defined in the state.
    // If filterStatus, filterAgent, filterArea are meant to be separate states, they need to be defined.
    // For now, I'll assume the existing 'filters' state is the source of truth for filtering.
    useEffect(() => {
        if (status === "authenticated") {
            fetchLeads();
            // If agents, revenue, and payment history also depend on filters, they should be fetched here.
            // For simplicity, I'll assume they are mostly static or fetched once, or have their own triggers.
            // The instruction's `useEffect` was ambiguous about `filterStatus, filterAgent, filterArea`
            // as dependencies for *all* fetches. I'll stick to `filters` for `fetchLeads` as it was.
        }
    }, [filters.status, filters.agentId, filters.area, status]); // Re-trigger leads on filter change

    const fetchAgents = async () => {
        // This function might already be implicitly called by fetchLeads,
        // but if it's a separate concern, it needs its own API call.
        // For now, assuming agents are fetched within fetchLeads or this is a placeholder.
        // If agents are fetched separately, add an API call here.
        // Example:
        // try {
        //     const res = await fetch("/api/admin/crm/agents");
        //     const data = await res.json();
        //     if (data.success) setAgents(data.agents);
        // } catch (error) { console.error("Fetch Agents Error:", error); }
    };

    const fetchRevenue = async () => {
        try {
            const res = await fetch('/api/admin/crm/revenue-summary'); // Assuming a new endpoint for summary
            const data = await res.json();
            if (data.success) setRevenueStats(data.summary);
        } catch (err) { console.error("Revenue Summary Fetch Error:", err); }
    };

    const fetchPaymentHistory = async () => {
        try {
            const res = await fetch('/api/admin/crm/revenue'); // Reusing or create new
            const data = await res.json();
            if (data.success) setPaymentHistory(data.revenue || []);
        } catch (err) { console.error("History Fetch Error:", err); }
    };

    const exportToClickUp = () => {
        const headers = ["Task Name", "Status", "Description", "Priority", "Assignee", "Tags"];
        const rows = leads.map(l => [
            l.guestName || "N/A",
            l.status || "new",
            `Type: ${l.serviceType}\nPhone: ${l.guestPhone}\nArea: ${l.area}\nNotes: ${l.notes || ""}`,
            "Normal",
            l.assignedAgent?.name || "",
            l.serviceType || ""
        ]);
        
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `clickup_ready_leads_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams(filters).toString();
            const res = await fetch(`/api/admin/crm/leads?${query}`);
            const data = await res.json();
            if (data.success) {
                setLeads(data.leads);
                setAgents(data.agents);
                
                // Fetch batches for tracking
                const bRes = await fetch("/api/admin/whatsapp-bulk/batches");
                const bData = await bRes.json();
                if (bData.success) setBatches(bData.batches);

                // Fetch placeholder revenue stats (In production, use a dedicated API)
                // This was a placeholder, now replaced by fetchRevenue()
                // setRevenueStats({ total: 125000, listing: 85000, leads: 40000 });
            }
        } catch (error) {
            console.error("Fetch CRM Leads Error:", error);
        }
        setLoading(false);
    };

    const addRevenue = async (partnerId, type, amount) => {
        try {
            await fetch("/api/admin/crm/revenue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ partnerId, partnerType: 'DOCTOR', revenueType: type, amount })
            });
            alert("Revenue recorded!");
            fetchLeads();
            fetchPaymentHistory(); // Refresh payment history after adding revenue
            fetchRevenue(); // Refresh revenue stats
        } catch (err) { console.error(err); }
    };

    const handleBulkUpload = async () => {
        try {
            const leadsToUpload = JSON.parse(bulkJson);
            const res = await fetch("/api/admin/crm/bulk-upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leads: leadsToUpload })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Uploaded ${data.count} leads!`);
                setBulkJson("");
                fetchLeads();
            }
        } catch (e) { alert("Invalid JSON format"); }
    };

    const handleBulkWhatsApp = async () => {
        if (selectedLeads.length === 0) return;
        const template = prompt("Enter Template Name:", "first_contact");
        if (!template) return;
        
        try {
            const res = await fetch("/api/admin/whatsapp-bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leadIds: selectedLeads, templateName: template })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Triggered WhatsApp for ${data.sentCount} leads.`);
                fetchLeads();
            }
        } catch (err) { console.error(err); }
    };

    const handleAssign = async () => {
        if (!assigningAgent || selectedLeads.length === 0) return;
        try {
            const res = await fetch("/api/admin/crm/assign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leadIds: selectedLeads, agentId: assigningAgent })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Successfully assigned ${data.count} leads.`);
                setSelectedLeads([]);
                fetchLeads();
            }
        } catch (error) {
            console.error("Assignment Error:", error);
        }
    };

    const toggleLeadSelection = (id) => {
        setSelectedLeads(prev => 
            prev.includes(id) ? prev.filter(lid => lid !== id) : [...prev, id]
        );
    };

    if (loading && leads.length === 0) return <div className="p-10 text-center">Loading CRM...</div>;

    return (
        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px' }}>Healthcare Lead CRM</h1>
            
            {/* Revenue Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '25px', borderRadius: '16px', color: 'white' }}>
                    <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Total Revenue</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{revenueStats.total.toLocaleString()}</div>
                </div>
                <div style={{ background: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Listing Fees</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>₹{revenueStats.listing.toLocaleString()}</div>
                </div>
                <div style={{ background: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Lead Credits</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>₹{revenueStats.leads.toLocaleString()}</div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                    <button 
                        onClick={() => setActiveTab("leads")}
                        className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'leads' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400'}`}
                    >
                        Leads Management
                    </button>
                    <button 
                        onClick={() => setActiveTab("payments")}
                        className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'payments' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400'}`}
                    >
                        Payment History
                    </button>
                </div>
                {activeTab === 'leads' && (
                    <div className="flex gap-2">
                        <button 
                            onClick={exportToClickUp}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg text-xs"
                        >
                            <i className="fa-solid fa-file-arrow-up"></i> ClickUp Export
                        </button>
                    </div>
                )}
            </div>

            {/* Category Sections Selector */}
            {activeTab === 'leads' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                    {['all', 'doctor', 'hospital', 'retailer', 'lab', 'patient', 'agent'].map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setFilters({...filters, serviceType: cat})}
                            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filters.serviceType === cat ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}
                        >
                            {cat}s
                        </button>
                    ))}
                </div>
            )}

            {activeTab === 'leads' ? (
                <>
                    {/* Filters Bar */}
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', background: '#f3f4f6', padding: '20px', borderRadius: '12px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px' }}>Status</label>
                            <select 
                                value={filters.status} 
                                onChange={(e) => setFilters({...filters, status: e.target.value})}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                            >
                                <option value="all">All Status</option>
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="interested">Interested</option>
                                <option value="converted">Converted</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px' }}>Agent</label>
                            <select 
                                value={filters.agentId} 
                                onChange={(e) => setFilters({...filters, agentId: e.target.value})}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                            >
                                <option value="all">All Agents</option>
                                <option value="none">Unassigned</option>
                                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <button onClick={fetchLeads} className="btn btn-primary" style={{ padding: '10px 20px' }}>Apply Filters</button>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedLeads.length > 0 && (
                        <div style={{ background: '#e0e7ff', padding: '15px', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: '#4338ca' }}>{selectedLeads.length} leads selected</span>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <select 
                                    value={assigningAgent} 
                                    onChange={(e) => setAssigningAgent(e.target.value)}
                                    style={{ padding: '8px', borderRadius: '8px' }}
                                >
                                    <option value="">Assign to Agent...</option>
                                    <option value="none">Remove Assignment</option>
                                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                                <button onClick={handleAssign} className="btn" style={{ background: '#4338ca', color: 'white', padding: '8px 20px', borderRadius: '8px' }}>Confirm Assignment</button>
                                <button onClick={handleBulkWhatsApp} className="btn" style={{ background: '#2563eb', color: 'white', padding: '8px 20px', borderRadius: '8px' }}>
                                    <i className="fa-brands fa-whatsapp"></i> Send WhatsApp
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Bulk Upload Section */}
                    <div style={{ marginBottom: '30px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '10px' }}>Bulk Lead Upload (JSON)</h3>
                        <textarea 
                            value={bulkJson} 
                            onChange={(e) => setBulkJson(e.target.value)}
                            placeholder='[{"name":"Dr. Amit", "phone":"91...", "type":"doctor", "area":"Civil Lines"}]'
                            style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '10px', fontSize: '0.8rem' }}
                        />
                        <button onClick={handleBulkUpload} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>Upload Leads</button>
                    </div>

                    {/* Leads Table */}
                    <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                                <tr>
                                    <th style={{ padding: '15px' }}><input type="checkbox" onChange={(e) => e.target.checked ? setSelectedLeads(leads.map(l => l.id)) : setSelectedLeads([])} /></th>
                                    <th style={{ padding: '15px' }}>Name</th>
                                    <th style={{ padding: '15px' }}>Type</th>
                                    <th style={{ padding: '15px' }}>Area</th>
                                    <th style={{ padding: '15px' }}>Agent</th>
                                    <th style={{ padding: '15px' }}>Status</th>
                                    <th style={{ padding: '15px' }}>Last Contact</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map(lead => (
                                    <tr key={lead.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                                        <td style={{ padding: '15px' }}>
                                            <input type="checkbox" checked={selectedLeads.includes(lead.id)} onChange={() => toggleLeadSelection(lead.id)} />
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ fontWeight: 'bold' }}>{lead.guestName}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{lead.guestPhone}</div>
                                        </td>
                                        <td style={{ padding: '15px' }}>{lead.serviceType}</td>
                                        <td style={{ padding: '15px' }}>{lead.area || "Gorakhpur"}</td>
                                        <td style={{ padding: '15px' }}>
                                            {lead.assignedAgent ? (
                                                <span style={{ color: '#4338ca', fontWeight: 600 }}>{lead.assignedAgent.name}</span>
                                            ) : (
                                                <span style={{ color: '#9ca3af' }}>Unassigned</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <span style={{ 
                                                padding: '4px 10px', 
                                                borderRadius: '20px', 
                                                fontSize: '0.75rem', 
                                                fontWeight: 'bold',
                                                background: lead.status === 'new' ? '#fee2e2' : lead.status === 'contacted' ? '#dbeafe' : '#d1fae5',
                                                color: lead.status === 'new' ? '#ef4444' : lead.status === 'contacted' ? '#3b82f6' : '#10b981'
                                            }}>
                                                {lead.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            {lead.status === 'converted' && (
                                                <button 
                                                    onClick={() => addRevenue(lead.id, 'LISTING_FEE', 1000)}
                                                    style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', background: '#ecfdf5', color: '#047857', border: '1px solid #10b981', cursor: 'pointer' }}
                                                >
                                                    + ₹1000 Fee
                                                </button>
                                            )}
                                        </td>
                                        <td style={{ padding: '15px', fontSize: '0.8rem', color: '#6b7280' }}>
                                            {lead.lastContactDate ? new Date(lead.lastContactDate).toLocaleDateString() : 'Never'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* WhatsApp Batches Tracking */}
                    <div style={{ marginTop: '40px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px' }}>WhatsApp Campaigns</h2>
                        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: '#f9fafb' }}>
                                    <tr>
                                        <th style={{ padding: '15px' }}>Campaign Name</th>
                                        <th style={{ padding: '15px' }}>Template</th>
                                        <th style={{ padding: '15px' }}>Sent</th>
                                        <th style={{ padding: '15px' }}>Delivered</th>
                                        <th style={{ padding: '15px' }}>Read</th>
                                        <th style={{ padding: '15px' }}>Status</th>
                                        <th style={{ padding: '15px' }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {batches.map(b => (
                                        <tr key={b.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                                            <td style={{ padding: '15px', fontWeight: 600 }}>{b.name}</td>
                                            <td style={{ padding: '15px' }}>{b.templateName}</td>
                                            <td style={{ padding: '15px' }}>
                                                <div style={{ fontWeight: 'bold' }}>{b.sentCount}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>of {b.totalLeads}</div>
                                            </td>
                                            <td style={{ padding: '15px' }}>
                                                <div style={{ fontWeight: 'bold', color: '#059669' }}>{b.deliveredCount}</div>
                                                <div style={{ width: '60px', background: '#f3f4f6', height: '4px', borderRadius: '2px', overflow: 'hidden', marginTop: '4px' }}>
                                                    <div style={{ width: `${(b.deliveredCount/b.sentCount)*100}%`, background: '#10b981', height: '100%' }}></div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '15px' }}>
                                                <div style={{ fontWeight: 'bold', color: '#2563eb' }}>{b.readCount}</div>
                                                <div style={{ width: '60px', background: '#f3f4f6', height: '4px', borderRadius: '2px', overflow: 'hidden', marginTop: '4px' }}>
                                                    <div style={{ width: `${(b.readCount/b.deliveredCount)*100}%`, background: '#3b82f6', height: '100%' }}></div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '15px' }}>
                                                <span style={{ 
                                                    padding: '4px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold',
                                                    background: b.status === 'completed' ? '#d1fae5' : '#fef3c7',
                                                    color: b.status === 'completed' ? '#10b981' : '#f59e0b'
                                                }}>{b.status.toUpperCase()}</span>
                                            </td>
                                            <td style={{ padding: '15px', fontSize: '0.8rem', color: '#6b7280' }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-50">
                        <h2 className="text-xl font-black text-slate-900">Total Revenue Stream</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Partner ID</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Type</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Description</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Amount</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paymentHistory.map((pay, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-all">
                                        <td className="px-8 py-5 font-mono text-xs text-slate-500">{pay.partnerId.slice(-8)}</td>
                                        <td className="px-8 py-5">
                                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">{pay.partnerType}</span>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-bold text-slate-700">{pay.revenueType}</td>
                                        <td className="px-8 py-5 text-sm font-black text-indigo-600">₹{pay.amount.toLocaleString()}</td>
                                        <td className="px-8 py-5 text-xs font-bold text-slate-400">{new Date(pay.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {paymentHistory.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center font-bold text-slate-300">No payment records found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
