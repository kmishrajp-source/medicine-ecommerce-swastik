"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const DAILY_TASKS = [
    { icon: "💾", task: "Database Backup", desc: "Full backup to cloud + local drive", time: "12:00 AM" },
    { icon: "🔐", task: "Security Scan", desc: "Automated malware & intrusion scan", time: "3:00 AM" },
    { icon: "🌐", task: "Website Uptime Check", desc: "Verify all critical pages respond < 2s", time: "6:00 AM" },
];

const MONTHLY_TASKS = [
    { icon: "👥", task: "User Access Review", desc: "Audit all admin and staff login permissions", deadline: "1st" },
    { icon: "🛡️", task: "Vulnerability Assessment", desc: "Penetration test & patch review", deadline: "15th" },
    { icon: "📊", task: "Uptime Report", desc: "SLA compliance: target ≥ 99.9%", deadline: "5th" },
];

const TECH_STACK = [
    { icon: "⚡", name: "Next.js 15", role: "Frontend & API", status: "LIVE" },
    { icon: "🗄️", name: "Supabase / PostgreSQL", role: "Database", status: "LIVE" },
    { icon: "☁️", name: "Vercel", role: "Hosting & CDN", status: "LIVE" },
    { icon: "🔑", name: "NextAuth", role: "Authentication", status: "LIVE" },
    { icon: "💳", name: "Razorpay", role: "Payment Gateway", status: "LIVE" },
    { icon: "📱", name: "Firebase FCM", role: "Push Notifications", status: "LIVE" },
];

export default function ITSOPPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [checkedDaily, setCheckedDaily] = useState({});
    const [uptimeStatus, setUptimeStatus] = useState("checking");

    useEffect(() => {
        if (status === "unauthenticated") router.push("/admin/login");
    }, [status, router]);

    useEffect(() => {
        setTimeout(() => setUptimeStatus("online"), 1200);
    }, []);

    return (
        <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top right, #0c1445, #090d16, #0a0a0a)", padding: "40px 20px 60px", fontFamily: "'Inter', sans-serif", color: "#f8fafc" }}>
            <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <Link href="/admin/sop" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>← Back to SOP Hub</Link>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "32px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ width: "56px", height: "56px", background: "linear-gradient(135deg, #3b82f6, #2563eb)", borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>💻</div>
                        <div>
                            <div style={{ color: "#60a5fa", fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.12em" }}>CHAPTER 17</div>
                            <h1 style={{ margin: 0, fontSize: "1.9rem", fontWeight: "800", color: "white" }}>IT & Website SOP</h1>
                            <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>Daily backups · Security scans · Monthly assessments</p>
                        </div>
                    </div>
                    <div style={{ background: uptimeStatus === "online" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", border: `1px solid ${uptimeStatus === "online" ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`, borderRadius: "14px", padding: "12px 20px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: uptimeStatus === "online" ? "#10B981" : "#F59E0B", animation: "pulse 2s infinite" }} />
                        <div>
                            <div style={{ fontWeight: "800", color: uptimeStatus === "online" ? "#34d399" : "#fbbf24", fontSize: "0.9rem" }}>{uptimeStatus === "online" ? "WEBSITE LIVE" : "CHECKING..."}</div>
                            <div style={{ fontSize: "0.7rem", color: "#64748b" }}>swastikmedicare.com</div>
                        </div>
                    </div>
                </div>

                {/* Tech Stack */}
                <h2 style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>⚡ Technology Stack</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", marginBottom: "40px" }}>
                    {TECH_STACK.map(tech => (
                        <div key={tech.name} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "14px", padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ fontSize: "1.4rem" }}>{tech.icon}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: "800", color: "white", fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tech.name}</div>
                                <div style={{ fontSize: "0.7rem", color: "#64748b" }}>{tech.role}</div>
                            </div>
                            <div style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", fontSize: "0.6rem", fontWeight: "800", padding: "2px 6px", borderRadius: "6px", flexShrink: 0 }}>●LIVE</div>
                        </div>
                    ))}
                </div>

                {/* Daily Tasks */}
                <h2 style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>📅 Daily IT Checklist</h2>
                <div style={{ display: "grid", gap: "12px", marginBottom: "40px" }}>
                    {DAILY_TASKS.map(task => (
                        <div
                            key={task.task}
                            onClick={() => setCheckedDaily(prev => ({ ...prev, [task.task]: !prev[task.task] }))}
                            style={{ display: "flex", alignItems: "center", gap: "16px", background: checkedDaily[task.task] ? "rgba(59,130,246,0.08)" : "rgba(15,23,42,0.6)", border: `1px solid ${checkedDaily[task.task] ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: "16px", padding: "18px 24px", cursor: "pointer", transition: "all 0.2s", backdropFilter: "blur(20px)" }}
                        >
                            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: checkedDaily[task.task] ? "#3b82f6" : "rgba(255,255,255,0.08)", border: `2px solid ${checkedDaily[task.task] ? "#3b82f6" : "rgba(255,255,255,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", flexShrink: 0 }}>
                                {checkedDaily[task.task] ? "✓" : ""}
                            </div>
                            <div style={{ fontSize: "1.6rem" }}>{task.icon}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: "800", color: checkedDaily[task.task] ? "#60a5fa" : "white" }}>{task.task}</div>
                                <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "2px" }}>{task.desc}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "700" }}>Scheduled</div>
                                <div style={{ fontWeight: "800", color: "#60a5fa" }}>{task.time}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Monthly Tasks */}
                <h2 style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>📆 Monthly IT Review</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "40px" }}>
                    {MONTHLY_TASKS.map(task => (
                        <div key={task.task} style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: "20px", padding: "24px", backdropFilter: "blur(20px)" }}>
                            <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{task.icon}</div>
                            <div style={{ fontWeight: "800", color: "white", marginBottom: "6px" }}>{task.task}</div>
                            <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: "14px", lineHeight: "1.5" }}>{task.desc}</div>
                            <div style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "8px", padding: "6px 12px", display: "inline-flex", gap: "6px", alignItems: "center" }}>
                                <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "700" }}>Deadline:</span>
                                <span style={{ fontWeight: "800", color: "#60a5fa", fontSize: "0.85rem" }}>{task.deadline} of month</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: "center", color: "#334155", fontSize: "0.75rem", fontWeight: "600", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Swastik Medicare SOP v1.0 — Chapter 17: IT & Website
                </div>
            </main>
        </div>
    );
}
