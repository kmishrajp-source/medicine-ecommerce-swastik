"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

export default function ShortagePredictor() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alerting, setAlerting] = useState(null);

    useEffect(() => {
        fetchIntelligence();
    }, []);

    const fetchIntelligence = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/shortage-predictor");
            const result = await res.json();
            if (result.success) setData(result.data);
        } catch (error) {
            console.error("Failed to load predictor data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAlert = async (drugName) => {
        setAlerting(drugName);
        try {
            // Note: Reusing the existing broadcast route by passing a specific search term
            // This is a quick Phase 1 integration. It will text the whole directory.
            const res = await fetch("/api/admin/market-intelligence/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customMessage: `🚨 URGENT STOCK ALERT 🚨\n${drugName} is projected to run out of stock soon due to high demand. Please secure your supply immediately or check for alternatives on Swastik Medicare.` })
            });
            const result = await res.json();
            if (result.success) {
                alert(`Broadcast sent to ${result.sentCount} retailers/stockists!`);
            } else {
                alert("Failed to send broadcast.");
            }
        } catch (e) {
            alert("Error sending alert.");
        } finally {
            setAlerting(null);
        }
    };

    const getRiskColor = (level) => {
        switch (level) {
            case "CRITICAL": return "#EF4444"; // Red
            case "HIGH": return "#F97316"; // Orange
            case "MEDIUM": return "#F59E0B"; // Yellow
            case "LOW": return "#10B981"; // Green
            default: return "#6B7280";
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6' }}>
            <Sidebar />
            <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                            🧠 AI Shortage Predictor <span style={{fontSize: '1rem', background: '#3B82F6', color: 'white', padding: '4px 8px', borderRadius: '12px', verticalAlign: 'middle'}}>BETA</span>
                        </h1>
                        <p style={{ color: '#6B7280', marginTop: '5px' }}>Proactive supply chain intelligence based on real-time sales velocity.</p>
                    </div>
                    <button onClick={fetchIntelligence} style={{ padding: '10px 20px', background: 'white', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Refresh Data
                    </button>
                </div>

                <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>Analyzing market data...</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#374151' }}>
                                    <th style={{ padding: '1rem' }}>Medicine</th>
                                    <th style={{ padding: '1rem' }}>Stock Left</th>
                                    <th style={{ padding: '1rem' }}>30D Velocity</th>
                                    <th style={{ padding: '1rem' }}>Depletion Est.</th>
                                    <th style={{ padding: '1rem' }}>Risk Score</th>
                                    <th style={{ padding: '1rem' }}>Suggested Alternatives</th>
                                    <th style={{ padding: '1rem' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '1rem', fontWeight: '500' }}>
                                            {item.name}
                                            <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{item.salt || "No salt data"}</div>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 'bold', color: item.currentStock === 0 ? 'red' : 'black' }}>
                                            {item.currentStock}
                                        </td>
                                        <td style={{ padding: '1rem', color: '#4B5563' }}>
                                            {item.salesLast30Days} sold <br/>
                                            <span style={{ fontSize: '0.8rem' }}>({item.dailyVelocity}/day)</span>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                                            {item.daysLeft === 999 ? "∞ Stable" : `${item.daysLeft} Days`}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ 
                                                background: `${getRiskColor(item.riskLevel)}20`, 
                                                color: getRiskColor(item.riskLevel), 
                                                padding: '6px 12px', 
                                                borderRadius: '20px',
                                                fontWeight: 'bold',
                                                fontSize: '0.85rem'
                                            }}>
                                                {item.riskLevel}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                                            {item.alternatives?.length > 0 ? (
                                                <ul style={{ margin: 0, paddingLeft: '20px', color: '#059669' }}>
                                                    {item.alternatives.map((alt, i) => (
                                                        <li key={i}>{alt.name} (Stock: {alt.stock})</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span style={{ color: '#9CA3AF' }}>None available</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {(item.riskLevel === "HIGH" || item.riskLevel === "CRITICAL") && (
                                                <button 
                                                    onClick={() => handleAlert(item.name)}
                                                    disabled={alerting === item.name}
                                                    style={{ 
                                                        background: '#EF4444', color: 'white', border: 'none', 
                                                        padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
                                                        fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px',
                                                        opacity: alerting === item.name ? 0.7 : 1
                                                    }}>
                                                    {alerting === item.name ? "Sending..." : "🚨 Alert Network"}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {data.length === 0 && (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No data available.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
