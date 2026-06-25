"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const SOP_FORMS = [
    { id: "01", name: "Customer Registration", desc: "New customer onboarding form", icon: "👤", path: "/register", status: "LIVE", color: "#10B981" },
    { id: "02", name: "Vendor Registration", desc: "Partner & supplier registration", icon: "🏪", path: "/partner", status: "LIVE", color: "#10B981" },
    { id: "03", name: "Purchase Requisition", desc: "Request procurement of medicines/supplies", icon: "📋", path: "/admin/sop/purchase-requisition", status: "LIVE", color: "#10B981" },
    { id: "04", name: "Purchase Order", desc: "View and manage all orders", icon: "📦", path: "/admin", status: "LIVE", color: "#10B981" },
    { id: "05", name: "Goods Receipt Note", desc: "Log incoming stock deliveries", icon: "🚚", path: "/admin/inventory", status: "LIVE", color: "#10B981" },
    { id: "06", name: "Stock Adjustment", desc: "Manual stock correction (damage/loss/return)", icon: "⚖️", path: "/admin/sop/stock-adjustment", status: "LIVE", color: "#10B981" },
    { id: "07", name: "Customer Complaint", desc: "Log and track customer issues", icon: "📣", path: "/admin/crm", status: "LIVE", color: "#10B981" },
    { id: "08", name: "Return Request", desc: "Process customer return/refund requests", icon: "↩️", path: "/admin/returns", status: "LIVE", color: "#10B981" },
    { id: "09", name: "Daily Sales Report", desc: "Auto-generated daily sales summary", icon: "📊", path: "/admin/sop/reports", status: "LIVE", color: "#10B981" },
    { id: "10", name: "Monthly KPI Dashboard", desc: "Monthly performance indicators", icon: "📈", path: "/admin/sop/reports?type=monthly", status: "LIVE", color: "#10B981" },
];

const QUICK_LINKS = [
    { name: "📦 Inv. Management", path: "/admin/sop/inventory-management", desc: "Chapter 9 SOP" },
    { name: "📊 Reports Hub", path: "/admin/sop/reports", desc: "Daily / Weekly / Monthly" },
    { name: "🛡️ BCP Board", path: "/admin/sop/bcp", desc: "Business Continuity" },
    { name: "📋 Purchase Requisition", path: "/admin/sop/purchase-requisition", desc: "Form 03" },
    { name: "⚖️ Stock Adjustment", path: "/admin/sop/stock-adjustment", desc: "Form 06" },
    { name: "↩️ Returns", path: "/admin/returns", desc: "Form 08" },
    { name: "📦 All Orders", path: "/admin", desc: "Admin Dashboard" },
];

export default function SOPHubPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/admin/login");
    }, [status, router]);

    useEffect(() => {
        fetch("/api/admin/sop/reports?type=daily")
            .then(r => r.json())
            .then(d => { if (d.success) setStats(d.report); })
            .catch(() => {});
    }, []);

    if (status === "loading") {
        return <div style={{ height: "100vh", background: "#090d16", display: "flex", alignItems: "center", justifyContent: "center", color: "#10B981", fontFamily: "'Inter', sans-serif", fontWeight: "bold" }}>LOADING SOP COMMAND CENTER...</div>;
    }

    return (
        <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top left, #052e16, #090d16, #05070f)", padding: "40px 20px 60px", fontFamily: "'Inter', sans-serif", color: "#f8fafc" }}>
            <main style={{ maxWidth: "1300px", margin: "0 auto" }}>
                {/* Header */}
                <div style={{ marginBottom: "40px" }}>
                    <Link href="/admin" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" }}>
                        ← Back to Admin Dashboard
                    </Link>
                    <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                        <div style={{ width: "60px", height: "60px", background: "linear-gradient(135deg, #10B981, #059669)", borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", flexShrink: 0 }}>📋</div>
                        <div>
                            <h1 style={{ fontSize: "2rem", fontWeight: "800", background: "linear-gradient(to right, #ffffff, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 }}>
                                SOP OPERATIONS HUB
                            </h1>
                            <p style={{ color: "#94a3b8", margin: "4px 0 0" }}>Swastik Medicare — Standard Operating Procedures v1.0</p>
                        </div>
                    </div>
                </div>

                {/* Live Stats Bar */}
                {stats && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px", marginBottom: "40px" }}>
                        {[
                            { label: "Today's Orders", value: stats.sales.totalOrders, color: "#10B981", icon: "📦" },
                            { label: "Today's Revenue", value: `₹${(stats.sales.totalRevenue || 0).toLocaleString("en-IN")}`, color: "#34d399", icon: "💰" },
                            { label: "Pending Orders", value: stats.sales.pendingOrders, color: "#F59E0B", icon: "⏳" },
                            { label: "Low Stock Items", value: stats.inventory.lowStockItems, color: "#EF4444", icon: "⚠️" },
                            { label: "New Customers", value: stats.customers.new, color: "#60a5fa", icon: "👤" },
                            { label: "Pending Returns", value: stats.returns.pending, color: "#f472b6", icon: "↩️" },
                        ].map(stat => (
                            <div key={stat.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "16px", textAlign: "center" }}>
                                <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>{stat.icon}</div>
                                <div style={{ fontSize: "1.4rem", fontWeight: "800", color: stat.color }}>{stat.value}</div>
                                <div style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "4px" }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Quick Links */}
                <div style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "20px", padding: "24px", marginBottom: "40px" }}>
                    <h2 style={{ color: "#34d399", fontSize: "0.8rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 16px" }}>⚡ Quick Access</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
                        {QUICK_LINKS.map(link => (
                            <Link key={link.name} href={link.path} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "14px 16px", textDecoration: "none", color: "white", display: "flex", flexDirection: "column", gap: "4px", transition: "all 0.2s" }}
                                onMouseOver={e => { e.currentTarget.style.background = "rgba(16,185,129,0.12)"; e.currentTarget.style.borderColor = "rgba(16,185,129,0.4)"; }}
                                onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}>
                                <span style={{ fontWeight: "700", fontSize: "0.9rem" }}>{link.name}</span>
                                <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{link.desc}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* All 10 SOP Forms */}
                <h2 style={{ color: "white", fontSize: "1.2rem", fontWeight: "800", marginBottom: "20px" }}>📋 All SOP Forms (Form 01–10)</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "40px" }}>
                    {SOP_FORMS.map(form => (
                        <Link key={form.id} href={form.path} style={{ background: "rgba(15,23,42,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "24px", textDecoration: "none", color: "white", display: "flex", flexDirection: "column", gap: "12px", transition: "all 0.2s", backdropFilter: "blur(10px)" }}
                            onMouseOver={e => { e.currentTarget.style.borderColor = "#10B981"; e.currentTarget.style.background = "rgba(16,185,129,0.08)"; }}
                            onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(15,23,42,0.5)"; }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div style={{ width: "48px", height: "48px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>
                                    {form.icon}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                                    <span style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", fontSize: "0.65rem", fontWeight: "800", padding: "3px 8px", borderRadius: "20px", border: "1px solid rgba(16,185,129,0.3)", textTransform: "uppercase" }}>
                                        ● LIVE
                                    </span>
                                    <span style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: "700" }}>Form {form.id}</span>
                                </div>
                            </div>
                            <div>
                                <h3 style={{ margin: "0 0 4px", fontSize: "1rem", fontWeight: "800", color: "white" }}>{form.name}</h3>
                                <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8", lineHeight: "1.4" }}>{form.desc}</p>
                            </div>
                            <div style={{ color: "#34d399", fontSize: "0.75rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                                Open Form →
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Footer note */}
                <div style={{ textAlign: "center", color: "#334155", fontSize: "0.75rem", fontWeight: "600", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Swastik Medicare SOP v1.0 — Prepared by Kaushlesh Mishra, Director
                </div>
            </main>
        </div>
    );
}
