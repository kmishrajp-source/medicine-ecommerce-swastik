"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const REPORT_TYPES = [
    { key: "daily", label: "📅 Daily Report", desc: "Form 09 — Today's sales summary", color: "#10B981" },
    { key: "weekly", label: "📆 Weekly Report", desc: "Last 7 days overview", color: "#6366f1" },
    { key: "monthly", label: "📊 Monthly KPI", desc: "Form 10 — Monthly performance dashboard", color: "#F59E0B" },
];

function downloadCSV(report) {
    const rows = [
        ["Swastik Medicare - Management Report", "", "", ""],
        ["Report Type", report.type.toUpperCase(), "", ""],
        ["Period", `${new Date(report.period.from).toLocaleDateString("en-IN")} to ${new Date(report.period.to).toLocaleDateString("en-IN")}`, "", ""],
        ["Generated At", new Date(report.generatedAt).toLocaleString("en-IN"), "", ""],
        ["", "", "", ""],
        ["=== SALES SUMMARY ===", "", "", ""],
        ["Total Orders", report.sales.totalOrders, "", ""],
        ["Total Revenue (₹)", report.sales.totalRevenue, "", ""],
        ["Delivered Orders", report.sales.deliveredOrders, "", ""],
        ["Delivered Revenue (₹)", report.sales.deliveredRevenue, "", ""],
        ["Pending Orders", report.sales.pendingOrders, "", ""],
        ["", "", "", ""],
        ["=== INVENTORY ===", "", "", ""],
        ["Low Stock Items", report.inventory.lowStockItems, "", ""],
        ["Out of Stock Items", report.inventory.outOfStockItems, "", ""],
        ["", "", "", ""],
        ["Product Name", "Category", "Stock Remaining", "Status"],
        ...report.inventory.lowStockList.map(p => [p.name, p.category, p.stock, p.stock === 0 ? "OUT OF STOCK" : "LOW STOCK"]),
        ["", "", "", ""],
        ["=== RETURNS & COMPLAINTS ===", "", "", ""],
        ["Total Returns", report.returns.total, "", ""],
        ["Pending Returns", report.returns.pending, "", ""],
        ["New Leads/Complaints", report.customers.leads, "", ""],
        ["", "", "", ""],
        ["=== CUSTOMERS ===", "", "", ""],
        ["New Registrations", report.customers.new, "", ""],
        ["Prescriptions Uploaded", report.prescriptions, "", ""],
    ];

    const csvContent = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `swastik-${report.type}-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadPDF(report) {
    const printWindow = window.open("", "_blank");
    const fromDate = new Date(report.period.from).toLocaleDateString("en-IN");
    const toDate = new Date(report.period.to).toLocaleDateString("en-IN");
    const genAt = new Date(report.generatedAt).toLocaleString("en-IN");

    printWindow.document.write(`
        <!DOCTYPE html><html><head>
        <title>Swastik Medicare - ${report.type.toUpperCase()} Report</title>
        <style>
            body { font-family: Arial, sans-serif; color: #1f2937; max-width: 800px; margin: 0 auto; padding: 40px; }
            h1 { color: #065f46; border-bottom: 3px solid #10B981; padding-bottom: 12px; }
            h2 { color: #1f2937; background: #f0fdf4; padding: 10px 16px; border-left: 4px solid #10B981; border-radius: 4px; margin-top: 30px; }
            .meta { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; }
            .stat-box { background: #f0fdf4; border: 1px solid #d1fae5; border-radius: 8px; padding: 16px; text-align: center; }
            .stat-val { font-size: 2rem; font-weight: 800; color: #065f46; }
            .stat-label { font-size: 0.8rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th { background: #065f46; color: white; padding: 10px; text-align: left; font-size: 0.8rem; }
            td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 0.85rem; }
            .alert { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 8px 12px; color: #dc2626; }
            .footer { margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 16px; color: #9ca3af; font-size: 0.75rem; text-align: center; }
            @media print { .no-print { display: none; } }
        </style></head><body>
        <button class="no-print" onclick="window.print()" style="background:#065f46;color:white;border:none;padding:10px 24px;border-radius:8px;cursor:pointer;font-size:1rem;margin-bottom:20px;">🖨️ Print / Save as PDF</button>
        <h1>🏥 Swastik Medicare</h1>
        <h2 style="background:none;border:none;padding:0;margin:0 0 8px;">${report.type.toUpperCase()} MANAGEMENT REPORT</h2>
        <div class="meta">
            <strong>Period:</strong> ${fromDate} → ${toDate} &nbsp;|&nbsp;
            <strong>Generated:</strong> ${genAt} &nbsp;|&nbsp;
            <strong>Form:</strong> ${report.type === "daily" ? "Form 09 – Daily Sales Report" : report.type === "monthly" ? "Form 10 – Monthly KPI Dashboard" : "Weekly Management Review"}
        </div>
        <h2>📦 Sales Performance</h2>
        <div class="grid">
            <div class="stat-box"><div class="stat-val">${report.sales.totalOrders}</div><div class="stat-label">Total Orders</div></div>
            <div class="stat-box"><div class="stat-val">₹${(report.sales.totalRevenue || 0).toLocaleString("en-IN")}</div><div class="stat-label">Total Revenue</div></div>
            <div class="stat-box"><div class="stat-val">${report.sales.deliveredOrders}</div><div class="stat-label">Delivered Orders</div></div>
            <div class="stat-box"><div class="stat-val">${report.sales.pendingOrders}</div><div class="stat-label">Pending Orders</div></div>
        </div>
        <h2>📦 Inventory Status</h2>
        ${report.inventory.outOfStockItems > 0 ? `<div class="alert">🔴 ${report.inventory.outOfStockItems} products are OUT OF STOCK — immediate reorder required!</div>` : ""}
        <p>Low stock items: <strong>${report.inventory.lowStockItems}</strong> &nbsp;|&nbsp; Out of stock: <strong>${report.inventory.outOfStockItems}</strong></p>
        <table><thead><tr><th>Product Name</th><th>Category</th><th>Stock Remaining</th><th>Status</th></tr></thead>
        <tbody>${report.inventory.lowStockList.map(p => `<tr><td>${p.name}</td><td>${p.category || "—"}</td><td>${p.stock}</td><td>${p.stock === 0 ? '<span style="color:#dc2626;font-weight:700;">OUT OF STOCK</span>' : '<span style="color:#d97706;font-weight:700;">LOW STOCK</span>'}</td></tr>`).join("") || "<tr><td colspan='4' style='text-align:center;color:#6b7280;'>All items well stocked ✅</td></tr>"}</tbody></table>
        <h2>↩️ Returns & Complaints</h2>
        <p>Total Returns: <strong>${report.returns.total}</strong> &nbsp;|&nbsp; Pending Returns: <strong>${report.returns.pending}</strong> &nbsp;|&nbsp; New Leads: <strong>${report.customers.leads}</strong></p>
        <h2>👤 Customers</h2>
        <p>New Registrations: <strong>${report.customers.new}</strong> &nbsp;|&nbsp; Prescriptions Uploaded: <strong>${report.prescriptions}</strong></p>
        <div class="footer">Prepared for: Swastik Medicare &nbsp;|&nbsp; Prepared by: Kaushlesh Mishra, Director &nbsp;|&nbsp; SOP v1.0 — CONFIDENTIAL</div>
        </body></html>
    `);
    printWindow.document.close();
}

export default function ReportsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeType, setActiveType] = useState(searchParams.get("type") || "daily");
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/admin/login");
    }, [status, router]);

    const fetchReport = useCallback(async (type) => {
        setLoading(true);
        setError(null);
        setReport(null);
        try {
            const res = await fetch(`/api/admin/sop/reports?type=${type}`);
            const data = await res.json();
            if (data.success) setReport(data.report);
            else setError(data.error || "Failed to load report");
        } catch (err) {
            setError("Network error — please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReport(activeType);
    }, [activeType, fetchReport]);

    const statCard = (icon, label, value, color = "#10B981") => (
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>{icon}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: "800", color }}>{value}</div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "4px" }}>{label}</div>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top left, #1e1b4b, #090d16, #052e16)", padding: "40px 20px 60px", fontFamily: "'Inter', sans-serif", color: "#f8fafc" }}>
            <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <Link href="/admin/sop" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>← Back to SOP Hub</Link>

                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
                    <div style={{ width: "52px", height: "52px", background: "linear-gradient(135deg, #6366f1, #8B5CF6)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" }}>📊</div>
                    <div>
                        <div style={{ color: "#a78bfa", fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em" }}>FORM 09 / FORM 10</div>
                        <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: "800", color: "white" }}>Management Reports Hub</h1>
                        <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>Daily · Weekly · Monthly — Downloadable as CSV & PDF</p>
                    </div>
                </div>

                {/* Report Type Selector */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap" }}>
                    {REPORT_TYPES.map(rt => (
                        <button key={rt.key} onClick={() => setActiveType(rt.key)} style={{ padding: "12px 24px", borderRadius: "12px", border: "none", cursor: "pointer", fontWeight: "800", fontSize: "0.9rem", background: activeType === rt.key ? rt.color : "rgba(255,255,255,0.06)", color: activeType === rt.key ? "white" : "#94a3b8", transition: "all 0.2s", boxShadow: activeType === rt.key ? `0 4px 20px ${rt.color}33` : "none" }}>
                            {rt.label}
                        </button>
                    ))}
                </div>

                {loading && <div style={{ textAlign: "center", padding: "60px", color: "#64748b", fontSize: "1.1rem" }}>⏳ Generating report from live data...</div>}
                {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "16px", padding: "24px", color: "#f87171", textAlign: "center" }}>❌ {error}<br /><small style={{ color: "#94a3b8" }}>Tip: Make sure you are logged in as Admin.</small></div>}

                {report && !loading && (
                    <>
                        {/* Download Actions */}
                        <div style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "16px", padding: "20px", marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                            <div>
                                <div style={{ fontWeight: "700", color: "white" }}>
                                    {activeType === "daily" ? "Form 09 — Daily Sales Report" : activeType === "monthly" ? "Form 10 — Monthly KPI Dashboard" : "Weekly Management Report"}
                                </div>
                                <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "4px" }}>
                                    Period: {new Date(report.period.from).toLocaleDateString("en-IN")} → {new Date(report.period.to).toLocaleDateString("en-IN")}
                                    &nbsp; | Generated: {new Date(report.generatedAt).toLocaleString("en-IN")}
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <button onClick={() => downloadCSV(report)} style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontWeight: "800", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                                    ⬇️ Download CSV
                                </button>
                                <button onClick={() => downloadPDF(report)} style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a78bfa", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontWeight: "800", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                                    🖨️ Print / PDF
                                </button>
                            </div>
                        </div>

                        {/* Sales Stats */}
                        <h2 style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>📦 Sales Performance</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px", marginBottom: "32px" }}>
                            {statCard("📦", "Total Orders", report.sales.totalOrders, "#10B981")}
                            {statCard("💰", "Total Revenue", `₹${(report.sales.totalRevenue || 0).toLocaleString("en-IN")}`, "#34d399")}
                            {statCard("✅", "Delivered Orders", report.sales.deliveredOrders, "#10B981")}
                            {statCard("💵", "Delivered Revenue", `₹${(report.sales.deliveredRevenue || 0).toLocaleString("en-IN")}`, "#6ee7b7")}
                            {statCard("⏳", "Pending Orders", report.sales.pendingOrders, "#F59E0B")}
                            {statCard("🧾", "Prescriptions", report.prescriptions, "#60a5fa")}
                        </div>

                        {/* Inventory */}
                        <h2 style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>⚠️ Inventory Alerts</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px", marginBottom: "20px" }}>
                            {statCard("⚠️", "Low Stock Items", report.inventory.lowStockItems, "#F59E0B")}
                            {statCard("🔴", "Out of Stock", report.inventory.outOfStockItems, "#EF4444")}
                            {statCard("↩️", "Total Returns", report.returns.total, "#f472b6")}
                            {statCard("🔔", "Pending Returns", report.returns.pending, "#f87171")}
                            {statCard("👤", "New Customers", report.customers.new, "#60a5fa")}
                            {statCard("📣", "New Leads", report.customers.leads, "#a78bfa")}
                        </div>

                        {/* Low Stock Table */}
                        {report.inventory.lowStockList.length > 0 && (
                            <div style={{ background: "rgba(15,23,42,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", overflow: "hidden", marginTop: "24px" }}>
                                <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontWeight: "700", color: "#FCD34D", fontSize: "0.9rem" }}>
                                    📋 Low Stock Product List (Immediate Reorder Required)
                                </div>
                                <div style={{ overflowX: "auto" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                                                {["Product Name", "Category", "Stock Left", "Status"].map(h => (
                                                    <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.inventory.lowStockList.map((p, i) => (
                                                <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                                                    <td style={{ padding: "12px 20px", fontWeight: "600", color: "white" }}>{p.name}</td>
                                                    <td style={{ padding: "12px 20px", color: "#94a3b8", fontSize: "0.85rem" }}>{p.category || "—"}</td>
                                                    <td style={{ padding: "12px 20px", fontWeight: "800", color: p.stock === 0 ? "#EF4444" : "#F59E0B" }}>{p.stock}</td>
                                                    <td style={{ padding: "12px 20px" }}>
                                                        <span style={{ background: p.stock === 0 ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)", color: p.stock === 0 ? "#EF4444" : "#F59E0B", padding: "3px 10px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase" }}>
                                                            {p.stock === 0 ? "Out of Stock" : "Low Stock"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
