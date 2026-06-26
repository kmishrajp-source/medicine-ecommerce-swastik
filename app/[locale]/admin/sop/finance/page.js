"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const DAILY_TASKS = [
    { icon: "💳", task: "Sales Reconciliation", desc: "Match POS/online sales with bank credits", time: "9:00 AM" },
    { icon: "💵", task: "Cash Reconciliation", desc: "Verify cash drawer against daily sales", time: "6:00 PM" },
    { icon: "🏦", task: "Bank Reconciliation", desc: "Match bank statement to ledger entries", time: "7:00 PM" },
];

const MONTHLY_TASKS = [
    { icon: "📊", task: "GST Filing", desc: "GSTR-1 & GSTR-3B submission", deadline: "20th" },
    { icon: "📈", task: "Profit & Loss Statement", desc: "Revenue vs expenses summary", deadline: "5th" },
    { icon: "⚖️", task: "Balance Sheet", desc: "Assets, liabilities & equity", deadline: "7th" },
    { icon: "💧", task: "Cash Flow Statement", desc: "Operating, investing & financing flows", deadline: "10th" },
];

const KPIS = [
    { icon: "📊", label: "Gross Margin", formula: "(Revenue - COGS) / Revenue × 100", target: "≥ 25%", color: "#10B981" },
    { icon: "💰", label: "Net Margin", formula: "Net Profit / Revenue × 100", target: "≥ 8%", color: "#34d399" },
    { icon: "🔄", label: "Working Capital Cycle", formula: "DIO + DSO - DPO", target: "< 45 Days", color: "#F59E0B" },
];

export default function FinanceSOPPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [today, setToday] = useState(new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }));
    const [checkedDaily, setCheckedDaily] = useState({});

    useEffect(() => {
        if (status === "unauthenticated") router.push("/admin/login");
    }, [status, router]);

    return (
        <div style={{ minHeight: "100vh", background: "radial-gradient(circle at bottom left, #14532d, #090d16, #0a0a0a)", padding: "40px 20px 60px", fontFamily: "'Inter', sans-serif", color: "#f8fafc" }}>
            <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <Link href="/admin/sop" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>← Back to SOP Hub</Link>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
                    <div style={{ width: "56px", height: "56px", background: "linear-gradient(135deg, #22c55e, #16a34a)", borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>💹</div>
                    <div>
                        <div style={{ color: "#4ade80", fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.12em" }}>CHAPTER 15</div>
                        <h1 style={{ margin: 0, fontSize: "1.9rem", fontWeight: "800", color: "white" }}>Finance & Accounts SOP</h1>
                        <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>Daily reconciliation · Monthly reporting · Financial KPIs</p>
                    </div>
                    <div style={{ marginLeft: "auto", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "10px 16px", textAlign: "right" }}>
                        <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Today</div>
                        <div style={{ fontWeight: "800", color: "white", fontSize: "0.9rem" }}>{today}</div>
                    </div>
                </div>

                {/* Daily Tasks */}
                <h2 style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>📅 Daily Reconciliation Checklist</h2>
                <div style={{ display: "grid", gap: "12px", marginBottom: "40px" }}>
                    {DAILY_TASKS.map(task => (
                        <div
                            key={task.task}
                            onClick={() => setCheckedDaily(prev => ({ ...prev, [task.task]: !prev[task.task] }))}
                            style={{ display: "flex", alignItems: "center", gap: "16px", background: checkedDaily[task.task] ? "rgba(34,197,94,0.08)" : "rgba(15,23,42,0.6)", border: `1px solid ${checkedDaily[task.task] ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: "16px", padding: "18px 24px", cursor: "pointer", transition: "all 0.2s", backdropFilter: "blur(20px)" }}
                        >
                            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: checkedDaily[task.task] ? "#22c55e" : "rgba(255,255,255,0.08)", border: `2px solid ${checkedDaily[task.task] ? "#22c55e" : "rgba(255,255,255,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>
                                {checkedDaily[task.task] ? "✓" : ""}
                            </div>
                            <div style={{ fontSize: "1.6rem" }}>{task.icon}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: "800", color: checkedDaily[task.task] ? "#4ade80" : "white", fontSize: "0.95rem" }}>{task.task}</div>
                                <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "2px" }}>{task.desc}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Due by</div>
                                <div style={{ fontWeight: "800", color: "#4ade80", fontSize: "0.9rem" }}>{task.time}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Monthly Reports */}
                <h2 style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>📆 Monthly Financial Reports</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px", marginBottom: "40px" }}>
                    {MONTHLY_TASKS.map(task => (
                        <div key={task.task} style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(34,197,94,0.12)", borderRadius: "20px", padding: "24px", backdropFilter: "blur(20px)" }}>
                            <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{task.icon}</div>
                            <div style={{ fontWeight: "800", color: "white", marginBottom: "6px" }}>{task.task}</div>
                            <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: "12px", lineHeight: "1.5" }}>{task.desc}</div>
                            <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "8px", padding: "6px 12px", display: "inline-flex", gap: "6px", alignItems: "center" }}>
                                <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "700" }}>Deadline:</span>
                                <span style={{ fontWeight: "800", color: "#4ade80", fontSize: "0.85rem" }}>{task.deadline} of month</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Financial KPIs */}
                <h2 style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>📈 Financial KPIs</h2>
                <div style={{ display: "grid", gap: "16px", marginBottom: "40px" }}>
                    {KPIS.map(kpi => (
                        <div key={kpi.label} style={{ background: "rgba(15,23,42,0.6)", border: `1px solid ${kpi.color}20`, borderRadius: "18px", padding: "24px 28px", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <div style={{ fontSize: "2rem" }}>{kpi.icon}</div>
                                <div>
                                    <div style={{ fontWeight: "800", color: "white", fontSize: "1rem" }}>{kpi.label}</div>
                                    <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "4px", fontFamily: "monospace" }}>{kpi.formula}</div>
                                </div>
                            </div>
                            <div style={{ background: `${kpi.color}15`, border: `1px solid ${kpi.color}30`, borderRadius: "10px", padding: "8px 16px" }}>
                                <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "700" }}>TARGET</div>
                                <div style={{ fontWeight: "800", color: kpi.color, fontSize: "1.1rem" }}>{kpi.target}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: "center", color: "#334155", fontSize: "0.75rem", fontWeight: "600", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Swastik Medicare SOP v1.0 — Chapter 15: Finance & Accounts
                </div>
            </main>
        </div>
    );
}
