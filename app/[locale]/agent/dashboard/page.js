"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AgentDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [leads, setLeads] = useState([]);
    const [stats, setStats] = useState({ total: 0, contacted: 0, interested: 0, converted: 0 });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchLeads();
        }
    }, [status]);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/agent/leads");
            const data = await res.json();
            if (data.success) {
                setLeads(data.leads);
                setStats(data.stats);
            }
        } catch (error) {
            console.error("Fetch Leads Error:", error);
        }
        setLoading(false);
    };

    const updateLead = async (leadId, newStatus, notes) => {
        setUpdating(leadId);
        try {
            const res = await fetch("/api/agent/lead/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leadId, status: newStatus, notes })
            });
            const data = await res.json();
            if (data.success) {
                fetchLeads(); // Refresh list
            }
        } catch (error) {
            console.error("Update Lead Error:", error);
        }
        setUpdating(null);
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading Leads...</div>;

    return (
        <div className="agent-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', background: '#f9fafb', minHeight: '100vh' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#111827' }}>Agent Dashboard</h1>
            
            {/* Stats Header */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                <div style={{ background: 'white', padding: '15px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase' }}>Total</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>{stats.total}</div>
                </div>
                <div style={{ background: 'white', padding: '15px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase' }}>Contacted</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3b82f6' }}>{stats.contacted}</div>
                </div>
                <div style={{ background: 'white', padding: '15px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase' }}>Interested</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.interested}</div>
                </div>
                <div style={{ background: 'white', padding: '15px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase' }}>Converted</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>{stats.converted}</div>
                </div>
            </div>

            {/* Lead List */}
            <div className="leads-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {leads.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '12px', color: '#6b7280' }}>
                        No leads assigned to you yet.
                    </div>
                ) : leads.map(lead => (
                    <div key={lead.id} className="lead-card" style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>{lead.guestName || "No Name"}</h3>
                                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                    <span style={{ fontWeight: 600, color: '#4338ca' }}>{lead.serviceType.toUpperCase()}</span> • {lead.area || "Gorakhpur"}
                                </div>
                            </div>
                            <span style={{ 
                                padding: '4px 10px', 
                                borderRadius: '20px', 
                                fontSize: '0.75rem', 
                                fontWeight: 'bold',
                                color: lead.status === 'new' ? '#ef4444' : lead.status === 'contacted' ? '#3b82f6' : lead.status === 'interested' ? '#f59e0b' : '#10b981',
                                background: lead.status === 'new' ? '#fee2e2' : lead.status === 'contacted' ? '#dbeafe' : lead.status === 'interested' ? '#fef3c7' : '#d1fae5'
                            }}>
                                {lead.status.toUpperCase()}
                            </span>
                        </div>

                        <div style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '15px' }}>
                            <i className="fa-solid fa-phone" style={{ marginRight: '8px', color: '#9ca3af' }}></i> {lead.guestPhone}
                        </div>

                        {lead.notes && (
                            <div style={{ fontSize: '0.85rem', color: '#6b7280', background: '#f9fafb', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontStyle: 'italic' }}>
                                "{lead.notes}"
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {/* Action Buttons */}
                            <a href={`tel:${lead.guestPhone}`} className="btn" style={{ flex: 1, padding: '10px', textAlign: 'center', background: '#ecfdf5', color: '#047857', borderRadius: '8px', border: '1px solid #10b981', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                <i className="fa-solid fa-phone"></i> Call
                            </a>
                            <a href={`https://wa.me/${lead.guestPhone.replace(/\D/g, '')}?text=Hi ${lead.guestName}, this is Swastik Medicare team...`} target="_blank" className="btn" style={{ flex: 1, padding: '10px', textAlign: 'center', background: '#f0fdf4', color: '#16a34a', borderRadius: '8px', border: '1px solid #22c55e', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                <i className="fa-brands fa-whatsapp"></i> WhatsApp
                            </a>
                            
                            {/* Status Select */}
                            <select 
                                disabled={updating === lead.id}
                                value={lead.status}
                                onChange={(e) => updateLead(lead.id, e.target.value, lead.notes)}
                                style={{ flex: 2, minWidth: '150px', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', color: '#374151', outline: 'none' }}
                            >
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="interested">Interested</option>
                                <option value="converted">Converted</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        {/* Note Input (Simplified for Demo) */}
                        <div style={{ marginTop: '15px' }}>
                            <input 
                                type="text" 
                                placeholder="Add note and press enter..." 
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        updateLead(lead.id, lead.status, e.currentTarget.value);
                                        e.currentTarget.value = "";
                                    }
                                }}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #f3f4f6', fontSize: '0.85rem' }}
                            />
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Leaderboard Callout */}
            <div style={{ marginTop: '30px', background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)', padding: '20px', borderRadius: '16px', color: 'white' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>Top Agents Leaderboard</h3>
                <p style={{ margin: '5px 0 0 0', opacity: 0.8, fontSize: '0.9rem' }}>You are currently #4 in Gorakhpur. 3 more conversions to reach Top 3!</p>
            </div>
        </div>
    );
}
