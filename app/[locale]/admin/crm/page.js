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
    
    // New States for Providers and Logistics
    const [providers, setProviders] = useState([]);
    const [deliveries, setDeliveries] = useState([]);

    // Registered Customers Tab States
    const [customers, setCustomers] = useState([]);
    const [customerSearch, setCustomerSearch] = useState("");
    const [selectedCustomers, setSelectedCustomers] = useState([]);

    // Contact Import States
    const [showContactModal, setShowContactModal] = useState(false);
    const [rawContactText, setRawContactText] = useState("");
    const [contactTag, setContactTag] = useState("Personal Contact");
    const [importingContacts, setImportingContacts] = useState(false);
    const [importProgress, setImportProgress] = useState("");
    const [importedCustomers, setImportedCustomers] = useState([]);
    const [importResult, setImportResult] = useState(null);
    
    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && session.user.role !== 'ADMIN') {
            router.push("/");
        } else if (status === "authenticated") {
            fetchLeads();
            fetchRevenue(); 
            fetchPaymentHistory();
            fetchProviders();
        }
    }, [status, filters]);

    const fetchProviders = async () => {
        try {
            const res = await fetch("/api/admin/crm/providers");
            const data = await res.json();
            if (data.success) {
                setProviders(data.providers);
            }
        } catch (error) { console.error("Fetch Providers Error:", error); }
    };

    // New useEffect for filter-based data fetching, if filters are meant to trigger all fetches
    // This part is speculative based on the instruction's useEffect, but not explicitly defined in the state.
    // If filterStatus, filterAgent, filterArea are meant to be separate states, they need to be defined.
    // For now, I'll assume the existing 'filters' state is the source of truth for filtering.
    useEffect(() => {
        if (status === "authenticated") {
            setPage(1); // Reset page on filter change
            fetchLeads();
        }
    }, [filters.status, filters.agentId, filters.area, filters.serviceType, status]);
    
    useEffect(() => {
        if (status === "authenticated") {
            fetchLeads();
            if (activeTab === 'customers') fetchCustomers(customerSearch);
        }
    }, [page, activeTab]);

    const fetchCustomers = async (searchQuery = "") => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/crm/customers?search=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            if (data.success) {
                setCustomers(data.customers);
            }
        } catch (err) {
            console.error("Fetch Customers Error:", err);
        } finally {
            setLoading(false);
        }
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
            const queryParams = new URLSearchParams({ ...filters, page, limit: 50 });
            const query = queryParams.toString();
            const res = await fetch(`/api/admin/crm/leads?${query}`);
            const data = await res.json();
            if (data.success) {
                setLeads(data.leads);
                setAgents(data.agents);
                if (data.pagination) setTotalPages(data.pagination.pages);
                
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

    const addRevenue = async (partnerId, partnerType, type, amount) => {
        try {
            await fetch("/api/admin/crm/revenue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ partnerId, partnerType: partnerType.toUpperCase(), revenueType: type, amount })
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
        const targets = activeTab === 'customers' ? selectedCustomers : selectedLeads;
        if (targets.length === 0) return;
        
        const template = prompt("Enter Template/Message Name:", "hello");
        if (!template) return;
        
        try {
            const res = await fetch("/api/admin/mass-whatsapp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    audience: "CUSTOM",
                    customNumbers: targets.join(","),
                    message: template,
                    method: "WHATSAPP"
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Triggered Mass Broadcast for ${data.targetCount} users.`);
                if (activeTab === 'leads') fetchLeads();
            } else {
                alert("Error: " + data.error);
            }
        } catch (err) { console.error(err); }
    };

    const toggleCustomerSelection = (deviceId) => {
        setSelectedCustomers(prev => 
            prev.includes(deviceId) ? prev.filter(id => id !== deviceId) : [...prev, deviceId]
        );
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
                    <button 
                        onClick={() => setActiveTab("partners")}
                        className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'partners' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400'}`}
                    >
                        Partners Profile
                    </button>
                    <button 
                        onClick={() => setActiveTab("logistics")}
                        className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'logistics' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400'}`}
                    >
                        Logistics Log
                    </button>
                    <button 
                        onClick={() => setActiveTab("customers")}
                        className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'customers' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-400'}`}
                    >
                        Registered Customers
                    </button>
                </div>
                {activeTab === 'leads' && (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowContactModal(true)}
                            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg text-xs"
                        >
                            <i className="fa-solid fa-mobile-screen-button"></i> 📱 Import Mobile Contacts (+91)
                        </button>
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

            {activeTab === 'leads' && (
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
                                                    onClick={() => addRevenue(lead.id, lead.serviceType, 'LISTING_FEE', 1000)}
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
                        {/* Pagination Controls */}
                        <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderTop: '1px solid #f3f4f6' }}>
                            <button 
                                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                disabled={page === 1}
                                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', background: page === 1 ? '#f9fafb' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? '#9ca3af' : '#111827' }}
                            >
                                Previous
                            </button>
                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#4b5563' }}>
                                Page {page} of {totalPages || 1}
                            </span>
                            <button 
                                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={page >= totalPages}
                                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', background: page >= totalPages ? '#f9fafb' : 'white', cursor: page >= totalPages ? 'not-allowed' : 'pointer', color: page >= totalPages ? '#9ca3af' : '#111827' }}
                            >
                                Next
                            </button>
                        </div>
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
            )}

            {activeTab === 'payments' && (
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

            {activeTab === 'partners' && (
                <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                        <h2 className="text-xl font-black text-slate-900">Marketplace Providers</h2>
                        <span className="text-xs font-bold text-slate-400">{providers.length} Partners Registered</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Name</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Type</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Phone</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {providers.map((p, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-all">
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-slate-900">{p.doctorName || p.name}</div>
                                            <div className="text-xs font-bold text-slate-400">{p.locality || p.address}</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">{p.type}</span>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-black text-slate-600">{p.phone}</td>
                                        <td className="px-8 py-5">
                                            {p.verified ? 
                                                <span className="text-emerald-500 font-bold text-xs"><i className="fa-solid fa-circle-check"></i> Verified</span> : 
                                                <span className="text-amber-500 font-bold text-xs">Unverified</span>
                                            }
                                        </td>
                                        <td className="px-8 py-5">
                                            <button 
                                                onClick={() => addRevenue(p.id, p.type, 'SUBSCRIPTION', p.type === 'doctor' ? 1000 : 1500)}
                                                className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                            >
                                                Log Sub
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {providers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center font-bold text-slate-300">No partner records found or loading...</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'logistics' && (
                <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-50">
                        <h2 className="text-xl font-black text-slate-900">Delivery Agent Fleet</h2>
                        <p className="text-sm font-bold text-slate-400 mt-2">Manage Swastik Delivery Partners</p>
                    </div>
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {agents.map(agent => (
                                <div key={agent.id} className="border border-slate-100 rounded-2xl p-6 hover:shadow-lg transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center text-xl">
                                            <i className="fa-solid fa-motorcycle"></i>
                                        </div>
                                        <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full">
                                            Active
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 mb-1">{agent.name}</h3>
                                    <p className="text-xs font-bold text-slate-400 mb-4"><i className="fa-solid fa-phone mr-1"></i> {agent.phone || "No phone"}</p>
                                    <div className="bg-slate-50 p-3 rounded-xl flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-500">Deliveries</span>
                                        <span className="font-black text-indigo-600">{agent.stats?.completed || 0}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                   </div>
                </div>
            )}
            {activeTab === 'customers' && (
                <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex justify-between items-center flex-wrap gap-4">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Registered Customers</h2>
                            <p className="text-sm font-bold text-slate-400 mt-2">
                                {customers.length} customers total &nbsp;|&nbsp; 
                                <span className="text-red-400">{customers.filter(c => !c.name || c.name === 'Customer' || c.name.startsWith('Type') || c.name.startsWith('type')).length} with missing/bad name</span>
                            </p>
                        </div>
                        <div className="flex gap-3 flex-wrap items-center">
                            <input 
                                type="text"
                                placeholder="Search Name/Phone..."
                                value={customerSearch}
                                onChange={e => {
                                    setCustomerSearch(e.target.value);
                                    if(e.target.value.length > 2 || e.target.value === "") fetchCustomers(e.target.value);
                                }}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                            />
                            <button
                                onClick={() => {
                                    const corrupted = customers.filter(c => !c.name || c.name === 'Customer' || c.name.startsWith('Type') || c.name.startsWith('type')).map(c => c.deviceId).filter(Boolean);
                                    if (corrupted.length === 0) { alert('No corrupted customers found! ✅'); return; }
                                    setSelectedCustomers(corrupted);
                                    alert(`Selected ${corrupted.length} corrupted entries. Now click the red Delete button to remove them.`);
                                }}
                                className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-md text-sm flex items-center gap-2"
                            >
                                🧹 Select Corrupted
                            </button>
                            {selectedCustomers.length > 0 && (
                                <div className="flex gap-2">
                                    <button 
                                        onClick={async () => {
                                            if (!confirm(`Are you sure you want to delete ${selectedCustomers.length} customers?`)) return;
                                            try {
                                                const res = await fetch("/api/admin/crm/customers", {
                                                    method: "DELETE",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ deviceIds: selectedCustomers })
                                                });
                                                if (res.ok) {
                                                    setSelectedCustomers([]);
                                                    fetchCustomers(customerSearch);
                                                }
                                            } catch (e) { console.error(e); }
                                        }}
                                        className="bg-red-500 text-white px-5 py-2 rounded-xl font-bold hover:bg-red-600 transition-all shadow-md text-sm flex items-center gap-2"
                                    >
                                        <i className="fa-solid fa-trash"></i> Delete
                                    </button>
                                    <button 
                                        onClick={handleBulkWhatsApp}
                                        className="bg-emerald-500 text-white px-5 py-2 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-md text-sm flex items-center gap-2"
                                    >
                                        <i className="fa-brands fa-whatsapp"></i> Broadcast ({selectedCustomers.length})
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 w-10">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedCustomers(customers.map(c => c.deviceId).filter(Boolean));
                                                else setSelectedCustomers([]);
                                            }}
                                            checked={selectedCustomers.length === customers.length && customers.length > 0}
                                        />
                                    </th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Customer Details</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Phone (Device ID)</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Joined Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Source/Tag</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {customers.map(customer => {
                                    const isBadName = !customer.name || customer.name === 'Customer' || customer.name.startsWith('Type') || customer.name.startsWith('type');
                                    const isValidIndianMobile = customer.deviceId && /^[6-9]\d{9}$/.test(customer.deviceId);
                                    return (
                                    <tr key={customer.id} className={`hover:bg-slate-50/50 transition-all ${selectedCustomers.includes(customer.deviceId) ? 'bg-emerald-50/30' : ''} ${isBadName ? 'bg-red-50/20' : ''}`}>
                                        <td className="px-8 py-5">
                                            {customer.deviceId && (
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                                                    checked={selectedCustomers.includes(customer.deviceId)}
                                                    onChange={() => toggleCustomerSelection(customer.deviceId)}
                                                />
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-slate-900 flex items-center gap-2">
                                                {customer.name || 'Anonymous'}
                                                {isBadName && <span className="text-[9px] bg-red-100 text-red-500 px-2 py-0.5 rounded-full font-black uppercase">⚠️ Bad Name</span>}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-mono mt-1">{customer.email}</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`font-bold px-3 py-1 rounded-full text-xs ${isValidIndianMobile ? 'text-slate-700 bg-slate-100' : 'text-red-600 bg-red-100'}`}>
                                                {customer.deviceId 
                                                    ? (isValidIndianMobile ? `🇮🇳 +91 ${customer.deviceId}` : `⚠️ ${customer.deviceId} (Not Indian)`)
                                                    : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-xs font-bold text-slate-400">
                                            {new Date(customer.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                                                {customer.referredBy || 'Organic'}
                                            </span>
                                        </td>
                                    </tr>
                                    );
                                })}
                                {customers.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center font-bold text-slate-300">
                                            No customers found. Try adjusting search or import new contacts.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {/* Contact Import Modal */}
            {showContactModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
                    <div style={{ background: '#ffffff', width: '100%', maxWidth: '640px', borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>📱 Import Mobile Friends & Contacts</h3>
                            <button onClick={() => setShowContactModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 700 }}>✕</button>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
                            Paste phone numbers, VCF file text, or CSV rows below. The AI will <strong>filter only Indian (+91) numbers</strong>, clean up names (removes "Friend", "Gym", etc.), register them as Customers, and let you invite them via WhatsApp/SMS!
                        </p>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Contact Source / Tag</label>
                            <select value={contactTag} onChange={e => setContactTag(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}>
                                <option value="Personal Friend">Personal Friend</option>
                                <option value="Wife Friend">Wife's Friend</option>
                                <option value="Family & Relative">Family & Relative</option>
                                <option value="College / Work Friend">College / Work Friend</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Select File from Phone OR Paste Below</label>
                                <label style={{ background: '#e0e7ff', color: '#4338ca', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', border: '1px solid #c7d2fe' }}>
                                    📁 Pick File (.vcf / .csv / .txt)
                                    <input
                                        type="file"
                                        accept=".vcf,.csv,.txt,text/vcard,text/plain"
                                        style={{ display: 'none' }}
                                        onChange={e => {
                                            const file = e.target.files[0];
                                            if (!file) return;
                                            const reader = new FileReader();
                                            reader.onload = (evt) => {
                                                setRawContactText(evt.target.result);
                                            };
                                            reader.readAsText(file);
                                        }}
                                    />
                                </label>
                            </div>
                            <textarea
                                rows={6}
                                value={rawContactText}
                                onChange={e => setRawContactText(e.target.value)}
                                placeholder="Click '📁 Pick File' above to load directly from your phone / USB storage, or paste text here!&#10;&#10;Supported files: .vcf (Contacts export), .csv, .txt"
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontFamily: 'monospace' }}
                            />
                        </div>

                        {importResult && (
                            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '16px', marginBottom: '20px', fontSize: '0.85rem', color: '#166534' }}>
                                <strong>✅ {importResult.message}</strong>
                            </div>
                        )}

                        {importedCustomers.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '10px' }}>⚡ Invite Registered Customers via WhatsApp:</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                                    {importedCustomers.map(c => {
                                        const waMsg = encodeURIComponent(`Hi ${c.name}! Swastik Medicare is now online. Order your daily medicines & health essentials at 10% off: https://swastikmedicare.com/en`);
                                        return (
                                            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', fontSize: '0.82rem' }}>
                                                <div>
                                                    <strong>{c.name}</strong> (+91 {c.phone})
                                                </div>
                                                <a
                                                    href={`https://wa.me/91${c.phone}?text=${waMsg}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ background: '#22c55e', color: '#fff', padding: '4px 12px', borderRadius: '6px', fontWeight: 700, textDecoration: 'none', fontSize: '0.75rem' }}
                                                >
                                                    💬 Send WhatsApp Invite
                                                </a>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                disabled={importingContacts || !rawContactText.trim()}
                                onClick={async () => {
                                    setImportingContacts(true);
                                    setImportResult(null);
                                    try {
                                        const parsed = [];
                                        let currentName = 'Customer';
                                        const lines = rawContactText.split('\n');
                                        for (const line of lines) {
                                            const cleanLine = line.trim();
                                            if (!cleanLine) continue;

                                            // --- NAME EXTRACTION ---
                                            // VCF Full Name tag (most reliable)
                                            if (cleanLine.startsWith('FN:')) {
                                                const fn = cleanLine.substring(3).trim();
                                                if (fn && fn.length > 0) currentName = fn;
                                            } 
                                            // VCF N: tag fallback (Surname;FirstName;Middle;Prefix;Suffix)
                                            else if (cleanLine.startsWith('N:') && currentName === 'Customer') {
                                                const parts = cleanLine.substring(2).split(';').map(p => p.trim()).filter(Boolean);
                                                // N: is often Surname;FirstName — swap them for natural order
                                                if (parts.length >= 2) {
                                                    currentName = `${parts[1]} ${parts[0]}`.trim();
                                                } else if (parts.length === 1 && parts[0].length > 1) {
                                                    currentName = parts[0];
                                                }
                                            }
                                            // Plain text name line (CSV / plain list)
                                            else if (!cleanLine.includes(':') && !cleanLine.includes(';') && /[a-zA-Z]{3,}/.test(cleanLine)) {
                                                currentName = cleanLine.replace(/[\,\;\"]/g, '').trim();
                                            }

                                            // Extract phone numbers carefully to avoid matching inside international numbers
                                            const potentialPhones = cleanLine.match(/(?:\+?\d[\d\-\s]{8,}\d)/g);
                                            if (potentialPhones) {
                                                let validIndianPhone = null;
                                                for (const match of potentialPhones) {
                                                    let clean = match.replace(/[\s\-]/g, '');
                                                    if (clean.startsWith('+')) {
                                                        if (!clean.startsWith('+91')) continue; // Reject non-Indian country codes
                                                        clean = clean.substring(3);
                                                    } else if (clean.startsWith('91') && clean.length === 12) {
                                                        clean = clean.substring(2);
                                                    } else if (clean.startsWith('0') && clean.length === 11) {
                                                        clean = clean.substring(1);
                                                    }
                                                    if (/^[6-9]\d{9}$/.test(clean)) {
                                                        validIndianPhone = clean;
                                                        break;
                                                    }
                                                }

                                                if (validIndianPhone) {
                                                    let nameToUse = currentName;
                                                    
                                                    // Only extract name from phone line if it's clearly a CSV/Plain text and we don't have a good name
                                                    if (!cleanLine.toUpperCase().includes('TEL;') && !cleanLine.toUpperCase().includes('TYPE=')) {
                                                        const textWithoutPhone = cleanLine.replace(validIndianPhone, '').replace(/[\,\;\:\+91\"]/g, '').trim();
                                                        if (textWithoutPhone.length > 2 && /[a-zA-Z]/.test(textWithoutPhone)) {
                                                            nameToUse = textWithoutPhone;
                                                        }
                                                    }
                                                    
                                                    parsed.push({ name: nameToUse, phone: validIndianPhone });
                                                    currentName = 'Customer'; // Reset
                                                }
                                            }
                                        }

                                        if (parsed.length === 0) {
                                            alert("No valid Indian phone numbers (+91) found in the text!");
                                            setImportingContacts(false);
                                            return;
                                        }

                                        // Process in chunks of 100 to avoid Vercel 10-second timeout!
                                        const chunkSize = 100;
                                        let totalImported = 0;
                                        let totalSkipped = 0;
                                        const allNewCustomers = [];

                                        for (let i = 0; i < parsed.length; i += chunkSize) {
                                            const chunk = parsed.slice(i, i + chunkSize);
                                            setImportProgress(`Processing batch ${Math.floor(i/chunkSize) + 1} of ${Math.ceil(parsed.length/chunkSize)}... (${Math.min(i + chunkSize, parsed.length)}/${parsed.length} contacts)`);
                                            const res = await fetch("/api/admin/customers/import", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ contacts: chunk, tag: contactTag })
                                            });
                                            
                                            if (!res.ok) {
                                                const text = await res.text();
                                                throw new Error(text.substring(0, 100)); // Throw first 100 chars of HTML error
                                            }
                                            
                                            const data = await res.json();
                                            if (data.success) {
                                                totalImported += data.importedCount || 0;
                                                totalSkipped += (data.skippedNonIndian || 0) + (data.skippedDuplicates || 0);
                                                allNewCustomers.push(...(data.customers || []));
                                            } else {
                                                throw new Error(data.error || "Failed to import contacts");
                                            }
                                        }

                                        setImportedCustomers(allNewCustomers);
                                        setImportResult({ message: `Successfully registered ${totalImported} Indian (+91) customer contacts! (${totalSkipped} existing/invalid skipped)` });
                                        
                                    } catch (e) {
                                        alert("Error importing contacts: " + e.message);
                                    } finally {
                                        setImportingContacts(false);
                                        setImportProgress("");
                                    }
                                }}
                                style={{ flex: 1, background: importingContacts ? '#cbd5e1' : '#059669', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: 800, cursor: importingContacts ? 'not-allowed' : 'pointer' }}
                            >
                                {importingContacts ? `⏳ ${importProgress || 'Processing & Registering...'}` : '🚀 Register Indian (+91) Customers'}
                            </button>
                            <button onClick={() => setShowContactModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '12px', padding: '14px 24px', fontWeight: 700, cursor: 'pointer' }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
