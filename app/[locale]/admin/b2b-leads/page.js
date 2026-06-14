"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function B2BLeadsDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [leads, setLeads] = useState([]);
    const [city, setCity] = useState("");
    const [category, setCategory] = useState("pharmacy");
    
    const [isScraping, setIsScraping] = useState(false);
    const [isSending, setIsSending] = useState(false);
    
    const [selectedLeads, setSelectedLeads] = useState([]);

    useEffect(() => {
        if (status === 'unauthenticated' || (session && session.user.role !== 'ADMIN')) {
            router.push('/admin/login');
        } else if (status === 'authenticated') {
            fetchLeads();
        }
    }, [status, session]);

    const fetchLeads = async () => {
        try {
            const res = await fetch('/api/admin/leads?source=osm_scraper');
            const data = await res.json();
            if (data.success) {
                setLeads(data.leads);
            }
        } catch (e) {
            console.error("Fetch leads failed", e);
        }
    };

    const handleScrape = async (e) => {
        e.preventDefault();
        if (!city.trim()) return alert("Please enter a city name");
        
        setIsScraping(true);
        try {
            const res = await fetch('/api/admin/leads/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ city, category })
            });
            const data = await res.json();
            
            if (data.success) {
                alert(data.message);
                fetchLeads();
            } else {
                alert("Scraping failed: " + data.error);
            }
        } catch (e) {
            console.error(e);
            alert("Error running scraper");
        } finally {
            setIsScraping(false);
        }
    };

    const handleSendInvites = async () => {
        if (selectedLeads.length === 0) return alert("Select at least one lead");
        
        if (!confirm(`Send WhatsApp invites to ${selectedLeads.length} leads?`)) return;

        setIsSending(true);
        try {
            const res = await fetch('/api/admin/leads/outreach', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadIds: selectedLeads })
            });
            const data = await res.json();
            
            if (data.success) {
                alert(data.message);
                setSelectedLeads([]);
                fetchLeads(); // refresh statuses
            } else {
                alert("Failed: " + data.error);
            }
        } catch (e) {
            console.error(e);
            alert("Error sending invites");
        } finally {
            setIsSending(false);
        }
    };

    const toggleLeadSelection = (id) => {
        setSelectedLeads(prev => 
            prev.includes(id) ? prev.filter(leadId => leadId !== id) : [...prev, id]
        );
    };

    const selectAllNew = () => {
        const newLeads = leads.filter(l => l.status === 'new').map(l => l.id);
        setSelectedLeads(newLeads);
    };

    if (status === 'loading') return <div>Loading...</div>;

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                        <i className="fa-solid fa-satellite-dish" style={{ color: '#3b82f6', marginRight: '10px' }}></i>
                        B2B Lead Scraper & Outreach
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '5px' }}>Automatically find local businesses and dispatch WhatsApp invites.</p>
                </div>
            </div>

            {/* Scraper Control Panel */}
            <div style={{ background: '#ffffff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', marginBottom: '40px' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', color: '#1e293b' }}>
                    <i className="fa-solid fa-magnifying-glass-location mr-2"></i> Live Scraper Tool
                </h3>
                <form onSubmit={handleScrape} style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>City Area</label>
                        <input 
                            type="text" 
                            placeholder="e.g., Gorakhpur, Noida, Lucknow" 
                            value={city} 
                            onChange={e => setCity(e.target.value)} 
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                            required
                        />
                    </div>
                    <div style={{ width: '250px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Business Category</label>
                        <select 
                            value={category} 
                            onChange={e => setCategory(e.target.value)}
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem', backgroundColor: 'white' }}
                        >
                            <option value="pharmacy">Pharmacies / Chemists</option>
                            <option value="clinic">Clinics</option>
                            <option value="hospital">Hospitals</option>
                        </select>
                    </div>
                    <button 
                        type="submit" 
                        disabled={isScraping}
                        style={{ padding: '12px 24px', backgroundColor: isScraping ? '#94a3b8' : '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '1rem', cursor: isScraping ? 'not-allowed' : 'pointer', minWidth: '180px' }}
                    >
                        {isScraping ? <span><i className="fa-solid fa-circle-notch fa-spin"></i> Scraping OpenStreetMap...</span> : <span><i className="fa-solid fa-bolt"></i> Scrape Leads</span>}
                    </button>
                </form>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '15px', marginBottom: 0 }}>
                    Powered by OpenStreetMap Overpass API. Only businesses with public phone numbers are imported.
                </p>
            </div>

            {/* Results Table */}
            <div style={{ background: '#ffffff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>
                        <i className="fa-solid fa-users mr-2"></i> Scraped B2B Leads
                    </h3>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button onClick={selectAllNew} style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
                            Select All "New"
                        </button>
                        <button 
                            onClick={handleSendInvites} 
                            disabled={isSending || selectedLeads.length === 0}
                            style={{ padding: '8px 20px', backgroundColor: isSending ? '#94a3b8' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: (isSending || selectedLeads.length === 0) ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                        >
                            {isSending ? <span><i className="fa-solid fa-circle-notch fa-spin"></i> Sending WhatsApps...</span> : <span><i className="fa-brands fa-whatsapp"></i> Send Invites ({selectedLeads.length})</span>}
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.875rem' }}>
                                <th style={{ padding: '12px', width: '40px' }}></th>
                                <th style={{ padding: '12px' }}>Business Name</th>
                                <th style={{ padding: '12px' }}>Category</th>
                                <th style={{ padding: '12px' }}>Phone Number</th>
                                <th style={{ padding: '12px' }}>City Area</th>
                                <th style={{ padding: '12px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                        No scraped leads found. Use the tool above to start finding partners.
                                    </td>
                                </tr>
                            ) : (
                                leads.map(lead => (
                                    <tr key={lead.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedLeads.includes(lead.id)}
                                                onChange={() => toggleLeadSelection(lead.id)}
                                                disabled={lead.status === 'contacted'}
                                            />
                                        </td>
                                        <td style={{ padding: '12px', fontWeight: '500', color: '#0f172a' }}>{lead.guestName}</td>
                                        <td style={{ padding: '12px', textTransform: 'capitalize' }}>{lead.serviceType}</td>
                                        <td style={{ padding: '12px', color: '#3b82f6', fontFamily: 'monospace' }}>+{lead.guestPhone}</td>
                                        <td style={{ padding: '12px', color: '#64748b' }}>{lead.area}</td>
                                        <td style={{ padding: '12px' }}>
                                            {lead.status === 'new' ? (
                                                <span style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '4px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 'bold' }}>NEW</span>
                                            ) : (
                                                <span style={{ backgroundColor: '#dcfce7', color: '#10b981', padding: '4px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 'bold' }}><i className="fa-solid fa-check"></i> CONTACTED</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
