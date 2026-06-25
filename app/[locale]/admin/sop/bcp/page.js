"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const BCP_SCENARIOS = [
    {
        id: "website_failure",
        title: "Website Failure / Server Down",
        icon: "🌐",
        color: "#EF4444",
        symptoms: ["Site not loading", "500 errors", "Vercel build failed"],
        procedures: [
            { step: "Immediately check Vercel Dashboard for build errors", link: "https://vercel.com/dashboard" },
            { step: "Enable maintenance mode — post status on WhatsApp group" },
            { step: "Contact Kaushlesh Mishra (Director) immediately" },
            { step: "Rollback to last stable deployment in Vercel" },
            { step: "If DB issue — check Neon/Supabase dashboard" },
            { step: "Restore from last backup within 2 hours SLA" },
        ],
        contacts: [{ name: "Director", phone: "+91-7992122974" }, { name: "IT Support", phone: "+91-7992122974" }]
    },
    {
        id: "supply_chain",
        title: "Supply Chain Disruption",
        icon: "🚚",
        color: "#F59E0B",
        symptoms: ["Supplier non-responsive", "Stock-out on critical medicines", "Logistics failure"],
        procedures: [
            { step: "Immediately check low-stock alert list in Inventory" },
            { step: "Contact alternate suppliers — see approved vendor list" },
            { step: "Mark affected products as 'Out of Stock' on website" },
            { step: "Notify customers with pending orders via SMS/WhatsApp" },
            { step: "Place emergency Purchase Requisition (Form 03)" },
            { step: "Update ETA on website within 24 hours" },
        ],
        contacts: [{ name: "Primary Supplier", phone: "+91-XXXXXXXXXX" }, { name: "Backup Supplier", phone: "+91-XXXXXXXXXX" }]
    },
    {
        id: "data_loss",
        title: "Data Loss / Database Failure",
        icon: "💾",
        color: "#8B5CF6",
        symptoms: ["Database connection error", "Missing orders", "Login failures", "Data corruption"],
        procedures: [
            { step: "Do NOT write any new data until issue is assessed" },
            { step: "Check database health at Neon/Prisma dashboard" },
            { step: "Contact database administrator immediately" },
            { step: "Restore from last automated backup (daily backups)" },
            { step: "Verify data integrity with spot-check on 10 random orders" },
            { step: "Document incident in system health log" },
        ],
        contacts: [{ name: "DB Admin", phone: "+91-7992122974" }]
    },
    {
        id: "payment_failure",
        title: "Payment Gateway Failure",
        icon: "💳",
        color: "#6366f1",
        symptoms: ["Orders not completing", "Payment timeouts", "Razorpay errors"],
        procedures: [
            { step: "Enable COD (Cash on Delivery) as fallback immediately" },
            { step: "Check Razorpay dashboard for status" },
            { step: "Post notice on website: 'Use COD for now'" },
            { step: "Notify operations team via WhatsApp" },
            { step: "Contact Razorpay support: 1800-266-0401" },
            { step: "Resume normal payment once confirmed stable" },
        ],
        contacts: [{ name: "Razorpay Support", phone: "1800-266-0401" }]
    },
    {
        id: "power_outage",
        title: "Power Outage / Infrastructure",
        icon: "⚡",
        color: "#10B981",
        symptoms: ["Office power out", "Local internet down", "Warehouse operational issue"],
        procedures: [
            { step: "Switch to mobile data hotspot for critical operations" },
            { step: "Website remains online (cloud-hosted — no impact)" },
            { step: "Use WhatsApp for urgent customer communications" },
            { step: "Halt warehouse dispatch until power restored" },
            { step: "Activate generator / contact electrician" },
            { step: "Document downtime for insurance purposes" },
        ],
        contacts: [{ name: "Electrician", phone: "+91-XXXXXXXXXX" }, { name: "ISP Support", phone: "1800-XXX-XXXX" }]
    },
];

const EMERGENCY_CONTACTS = [
    { role: "Director / MD", name: "Kaushlesh Mishra", phone: "+91-7992122974", available: "24/7" },
    { role: "Customer Service Head", name: "Operations Team", phone: "+91-7992122974", available: "9AM–9PM" },
    { role: "IT / Website", name: "Tech Support", phone: "+91-7992122974", available: "On-Call" },
    { role: "Logistics Partner", name: "Delivery Manager", phone: "+91-XXXXXXXXXX", available: "8AM–8PM" },
    { role: "Police Emergency", name: "Local Police", phone: "100", available: "24/7" },
    { role: "Medical Emergency", name: "Ambulance", phone: "108", available: "24/7" },
];

export default function BCPPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [siteStatus, setSiteStatus] = useState("checking");
    const [systemLogs, setSystemLogs] = useState([]);
    const [activeScenario, setActiveScenario] = useState(null);
    const [checkedSteps, setCheckedSteps] = useState({});

    useEffect(() => {
        if (status === "unauthenticated") router.push("/admin/login");
    }, [status, router]);

    // Check site health
    useEffect(() => {
        fetch("/api/admin/system-health")
            .then(r => r.json())
            .then(d => {
                setSystemLogs(d.logs?.slice(0, 5) || []);
                const hasCritical = d.stats?.totalCritical > 0;
                setSiteStatus(hasCritical ? "critical" : d.stats?.totalUnresolved > 0 ? "degraded" : "operational");
            })
            .catch(() => setSiteStatus("unknown"));
    }, []);

    const toggleStep = (scenarioId, stepIdx) => {
        const key = `${scenarioId}_${stepIdx}`;
        setCheckedSteps(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const statusColor = { operational: "#10B981", degraded: "#F59E0B", critical: "#EF4444", checking: "#6366f1", unknown: "#94a3b8" };
    const statusLabel = { operational: "✅ All Systems Operational", degraded: "⚠️ Degraded — Some Issues Detected", critical: "🚨 CRITICAL ISSUES DETECTED", checking: "⏳ Checking System Status...", unknown: "❓ Status Unknown" };

    return (
        <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top left, #1f0530, #090d16, #0f172a)", padding: "40px 20px 60px", fontFamily: "'Inter', sans-serif", color: "#f8fafc" }}>
            <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <Link href="/admin/sop" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>← Back to SOP Hub</Link>

                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
                    <div style={{ width: "52px", height: "52px", background: "linear-gradient(135deg, #7C3AED, #6D28D9)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" }}>🛡️</div>
                    <div>
                        <div style={{ color: "#c4b5fd", fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em" }}>SOP SECTION 25</div>
                        <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: "800", color: "white" }}>Business Continuity Plan</h1>
                        <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>Emergency procedures, recovery checklists & contact directory</p>
                    </div>
                </div>

                {/* Live Status Banner */}
                <div style={{ background: `${statusColor[siteStatus]}11`, border: `1px solid ${statusColor[siteStatus]}44`, borderRadius: "16px", padding: "20px 24px", marginBottom: "32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                        <div style={{ fontSize: "1rem", fontWeight: "800", color: statusColor[siteStatus] }}>{statusLabel[siteStatus]}</div>
                        <div style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "4px" }}>Real-time system health · Last checked: {new Date().toLocaleTimeString("en-IN")}</div>
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <Link href="/admin/system-health" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "white", padding: "10px 18px", textDecoration: "none", fontWeight: "700", fontSize: "0.8rem" }}>
                            View System Logs →
                        </Link>
                        <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "10px", color: "#818cf8", padding: "10px 18px", textDecoration: "none", fontWeight: "700", fontSize: "0.8rem" }}>
                            Vercel Dashboard →
                        </a>
                    </div>
                </div>

                {/* Recent System Issues */}
                {systemLogs.length > 0 && (
                    <div style={{ background: "rgba(15,23,42,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "20px 24px", marginBottom: "32px" }}>
                        <h2 style={{ margin: "0 0 16px", fontSize: "0.85rem", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Recent System Issues</h2>
                        {systemLogs.map((log, i) => (
                            <div key={i} style={{ display: "flex", gap: "12px", padding: "10px 0", borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems: "flex-start" }}>
                                <span style={{ fontSize: "0.7rem", fontWeight: "800", padding: "2px 8px", borderRadius: "20px", background: log.severity === "CRITICAL" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)", color: log.severity === "CRITICAL" ? "#EF4444" : "#F59E0B", flexShrink: 0 }}>{log.severity}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: "600", color: "#e2e8f0", fontSize: "0.85rem" }}>{log.component} — {log.message}</div>
                                    <div style={{ color: "#64748b", fontSize: "0.75rem", marginTop: "2px" }}>{new Date(log.createdAt).toLocaleString("en-IN")}</div>
                                </div>
                                {log.resolvedAt && <span style={{ color: "#10B981", fontSize: "0.7rem", fontWeight: "800", flexShrink: 0 }}>✅ Resolved</span>}
                            </div>
                        ))}
                    </div>
                )}

                {/* Emergency Scenarios */}
                <h2 style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>🚨 Emergency Scenarios & Recovery Procedures</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px", marginBottom: "40px" }}>
                    {BCP_SCENARIOS.map(scenario => (
                        <div key={scenario.id} style={{ background: "rgba(15,23,42,0.6)", border: `1px solid ${activeScenario === scenario.id ? scenario.color : "rgba(255,255,255,0.08)"}`, borderRadius: "20px", overflow: "hidden", transition: "all 0.2s", backdropFilter: "blur(10px)" }}>
                            <button onClick={() => setActiveScenario(activeScenario === scenario.id ? null : scenario.id)} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "20px", textAlign: "left", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                                <div style={{ width: "44px", height: "44px", background: `${scenario.color}18`, border: `1px solid ${scenario.color}44`, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>{scenario.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: "800", color: "white", fontSize: "0.95rem", marginBottom: "6px" }}>{scenario.title}</div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                        {scenario.symptoms.map(s => (
                                            <span key={s} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", padding: "2px 8px", borderRadius: "20px", fontSize: "0.65rem" }}>{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <span style={{ color: scenario.color, fontSize: "1.2rem", flexShrink: 0 }}>{activeScenario === scenario.id ? "▲" : "▼"}</span>
                            </button>
                            {activeScenario === scenario.id && (
                                <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${scenario.color}22` }}>
                                    <p style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", margin: "16px 0 10px" }}>Recovery Checklist:</p>
                                    {scenario.procedures.map((proc, idx) => {
                                        const key = `${scenario.id}_${idx}`;
                                        const done = checkedSteps[key];
                                        return (
                                            <div key={idx} onClick={() => toggleStep(scenario.id, idx)} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "8px 0", cursor: "pointer", borderBottom: idx < scenario.procedures.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                                                <div style={{ width: "20px", height: "20px", borderRadius: "6px", border: `2px solid ${done ? scenario.color : "rgba(255,255,255,0.2)"}`, background: done ? scenario.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px", transition: "all 0.2s" }}>
                                                    {done && <span style={{ color: "white", fontSize: "0.7rem", fontWeight: "800" }}>✓</span>}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <span style={{ color: done ? "#64748b" : "#e2e8f0", fontSize: "0.85rem", textDecoration: done ? "line-through" : "none" }}>{proc.step}</span>
                                                    {proc.link && <a href={proc.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display: "block", color: scenario.color, fontSize: "0.75rem", marginTop: "2px" }}>{proc.link} →</a>}
                                                </div>
                                                <span style={{ color: "#475569", fontSize: "0.7rem", flexShrink: 0 }}>Step {idx + 1}</span>
                                            </div>
                                        );
                                    })}
                                    <p style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", margin: "16px 0 10px" }}>Emergency Contacts:</p>
                                    {scenario.contacts.map((c, i) => (
                                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < scenario.contacts.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                                            <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>{c.name}</span>
                                            <a href={`tel:${c.phone}`} style={{ color: scenario.color, fontWeight: "700", fontSize: "0.85rem", textDecoration: "none" }}>{c.phone}</a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Emergency Contacts Directory */}
                <h2 style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>📞 Emergency Contact Directory</h2>
                <div style={{ background: "rgba(15,23,42,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", overflow: "hidden" }}>
                    {EMERGENCY_CONTACTS.map((contact, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: i < EMERGENCY_CONTACTS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", flexWrap: "wrap", gap: "8px" }}>
                            <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
                                <div>
                                    <div style={{ fontWeight: "700", color: "white", fontSize: "0.9rem" }}>{contact.name}</div>
                                    <div style={{ color: "#64748b", fontSize: "0.75rem" }}>{contact.role}</div>
                                </div>
                                <span style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399", padding: "2px 10px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "700" }}>{contact.available}</span>
                            </div>
                            <a href={`tel:${contact.phone}`} style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399", padding: "8px 20px", borderRadius: "10px", textDecoration: "none", fontWeight: "800", fontSize: "0.9rem", letterSpacing: "0.05em" }}>
                                📞 {contact.phone}
                            </a>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: "32px", background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "16px", padding: "20px 24px", fontSize: "0.8rem", color: "#94a3b8", lineHeight: "1.6" }}>
                    <strong style={{ color: "#c4b5fd" }}>📋 BCP Review Schedule:</strong> This plan should be reviewed quarterly. Last review: Q2 2025.
                    Target RTO (Recovery Time Objective): <strong style={{ color: "white" }}>2 hours</strong> for website, <strong style={{ color: "white" }}>24 hours</strong> for supply chain.
                    Target RPO (Recovery Point Objective): <strong style={{ color: "white" }}>24 hours</strong> for data (daily backups).
                </div>
            </main>
        </div>
    );
}
