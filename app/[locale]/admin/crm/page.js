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
    const [filters, setFilters] = useState({ status: 'all', agentId: 'all', area: 'all' });
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [assigningAgent, setAssigningAgent] = useState("");
    const [bulkJson, setBulkJson] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && session.user.role !== 'ADMIN') {
            router.push("/");
        } else if (status === "authenticated") {
            fetchLeads();
        }
    }, [status, filters]);

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
                setRevenueStats({ total: 125000, listing: 85000, leads: 40000 });
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
                                <th style={{ padding: '15px' }}>Stats (Sent/Total)</th>
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
                                        <div style={{ width: '100px', background: '#f3f4f6', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '5px' }}>
                                            <div style={{ width: `${(b.sentCount/b.totalLeads)*100}%`, background: '#2563eb', height: '100%' }}></div>
                                        </div>
                                        {b.sentCount} / {b.totalLeads}
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

            {/* CSV Export Callout */}
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button className="btn" style={{ background: '#10b981', color: 'white', padding: '10px 20px', borderRadius: '8px' }}>
                    <i className="fa-solid fa-file-export"></i> Export Report (CSV)
                </button>
            </div>
        </div>
    );
}
