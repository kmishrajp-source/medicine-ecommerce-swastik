"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ROLES_LIST = [
    'OPERATIONS_MANAGER','SALES_MANAGER','MARKETING_MANAGER','PHARMACIST',
    'WAREHOUSE_STAFF','CUSTOMER_SUPPORT','ORDER_PROCESSING','PROCUREMENT_OFFICER',
    'STORE_KEEPER','DISPATCH_TEAM','SOCIAL_MEDIA_EXECUTIVE','DIGITAL_MARKETING_EXECUTIVE',
    'FINANCE_ACCOUNTS','SALES_STAFF'
];

const ROLE_LABELS = {
    OPERATIONS_MANAGER: "Operations Manager",
    SALES_MANAGER: "Sales Manager",
    MARKETING_MANAGER: "Marketing Manager",
    PHARMACIST: "Pharmacist",
    WAREHOUSE_STAFF: "Warehouse Staff",
    CUSTOMER_SUPPORT: "Customer Support",
    ORDER_PROCESSING: "Order Processing",
    PROCUREMENT_OFFICER: "Procurement Officer",
    STORE_KEEPER: "Store Keeper",
    DISPATCH_TEAM: "Dispatch Team",
    SOCIAL_MEDIA_EXECUTIVE: "Social Media Executive",
    DIGITAL_MARKETING_EXECUTIVE: "Digital Marketing Executive",
    FINANCE_ACCOUNTS: "Finance & Accounts",
    SALES_STAFF: "Sales Staff",
};

const ROLE_COLORS = {
    OPERATIONS_MANAGER: "#10b981",
    SALES_MANAGER: "#3b82f6",
    MARKETING_MANAGER: "#f59e0b",
    PHARMACIST: "#8b5cf6",
    WAREHOUSE_STAFF: "#06b6d4",
    CUSTOMER_SUPPORT: "#f43f5e",
    ORDER_PROCESSING: "#60a5fa",
    PROCUREMENT_OFFICER: "#34d399",
    STORE_KEEPER: "#a78bfa",
    DISPATCH_TEAM: "#fb923c",
    SOCIAL_MEDIA_EXECUTIVE: "#e879f9",
    DIGITAL_MARKETING_EXECUTIVE: "#fbbf24",
    FINANCE_ACCOUNTS: "#22d3ee",
    SALES_STAFF: "#4ade80",
};

export default function StaffApprovalsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [staff, setStaff] = useState([]);
    const [filter, setFilter] = useState("pending");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "PHARMACIST" });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/admin/login");
        else if (status === "authenticated") fetchStaff();
    }, [status, filter]);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/staff-approvals?filter=${filter}`);
            const data = await res.json();
            if (data.success) setStaff(data.staff);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleApproval = async (userId, approve) => {
        setActionLoading(userId);
        try {
            const res = await fetch("/api/admin/staff-approvals", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, approve }),
            });
            const data = await res.json();
            if (data.success) fetchStaff();
            else alert(data.error || "Failed");
        } catch (e) { console.error(e); }
        finally { setActionLoading(null); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await fetch("/api/admin/staff-approvals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                alert(`✅ Staff account created for ${data.staff.name}`);
                setShowCreate(false);
                setForm({ name: "", email: "", password: "", role: "PHARMACIST" });
                setFilter("approved");
                fetchStaff();
            } else alert(data.error || "Failed to create account");
        } catch (e) { console.error(e); }
        finally { setCreating(false); }
    };

    const card = { background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px" };

    return (
        <div style={{ minHeight: "100vh", background: "#0f172a", padding: "40px 20px", fontFamily: "'Inter', sans-serif", color: "#f8fafc" }}>
            <style>{`
                .filter-btn { border:none; padding:8px 18px; border-radius:8px; font-size:0.85rem; font-weight:600; cursor:pointer; transition:all 0.2s; }
                .filter-btn.active { background:#4f46e5; color:white; }
                .filter-btn:not(.active) { background:rgba(255,255,255,0.05); color:#94a3b8; }
                .action-btn { border:none; padding:8px 16px; border-radius:8px; font-size:0.8rem; font-weight:700; cursor:pointer; transition:all 0.2s; }
                .input-field { width:100%; background:#0f172a; border:1px solid #334155; border-radius:8px; padding:10px 14px; color:white; font-size:0.9rem; }
                select.input-field { appearance:none; }
                .input-field:focus { outline:none; border-color:#4f46e5; }
            `}</style>

            <main style={{ maxWidth: "1000px", margin: "0 auto" }}>
                <Link href="/admin" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem", display: "inline-block", marginBottom: "24px" }}>← Admin Dashboard</Link>

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                        <h1 style={{ fontSize: "2rem", fontWeight: "800", margin: 0, background: "linear-gradient(to right, #fff, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            👥 Staff Access Control
                        </h1>
                        <p style={{ color: "#64748b", marginTop: "8px", fontSize: "0.9rem" }}>
                            Approve new staff logins. One approval = permanent access until revoked.
                        </p>
                    </div>
                    <button onClick={() => setShowCreate(!showCreate)} style={{ background: showCreate ? "transparent" : "#4f46e5", color: showCreate ? "#94a3b8" : "white", border: showCreate ? "1px solid #334155" : "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>
                        {showCreate ? "✕ Cancel" : "+ Create Staff Account"}
                    </button>
                </div>

                {/* Create Staff Form */}
                {showCreate && (
                    <div style={{ ...card, marginBottom: "28px", borderColor: "rgba(79,70,229,0.3)" }}>
                        <h2 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "20px", color: "#818cf8" }}>Create New Staff Login</h2>
                        <form onSubmit={handleCreate} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", marginBottom: "6px", fontWeight: "600" }}>FULL NAME</label>
                                <input required className="input-field" type="text" placeholder="e.g. Ravi Sharma" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", marginBottom: "6px", fontWeight: "600" }}>EMAIL ADDRESS</label>
                                <input required className="input-field" type="email" placeholder="ravi@swastikmedicare.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", marginBottom: "6px", fontWeight: "600" }}>TEMPORARY PASSWORD</label>
                                <input required className="input-field" type="text" placeholder="Ask them to change after first login" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", marginBottom: "6px", fontWeight: "600" }}>ROLE / DEPARTMENT</label>
                                <select className="input-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                    {ROLES_LIST.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                                </select>
                            </div>
                            <div style={{ gridColumn: "1/-1" }}>
                                <button type="submit" disabled={creating} style={{ background: "#10b981", color: "white", border: "none", padding: "12px 28px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", width: "100%", fontSize: "0.95rem" }}>
                                    {creating ? "Creating..." : "✓ Create & Auto-Approve Account"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Filter Tabs */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
                    {["pending", "approved", "all"].map(f => (
                        <button key={f} className={`filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                            {f === "pending" ? "⏳ Pending Approval" : f === "approved" ? "✅ Approved" : "📋 All Staff"}
                        </button>
                    ))}
                </div>

                {/* Staff List */}
                {loading ? (
                    <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>Loading staff accounts...</div>
                ) : staff.length === 0 ? (
                    <div style={{ ...card, textAlign: "center", padding: "60px" }}>
                        <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>{filter === "pending" ? "🎉" : "👥"}</div>
                        <h3 style={{ fontWeight: "600", color: "#e2e8f0" }}>{filter === "pending" ? "No Pending Approvals" : "No Staff Found"}</h3>
                        <p style={{ color: "#64748b", marginTop: "8px" }}>
                            {filter === "pending" ? "All staff accounts are approved." : "Create a new staff account above."}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: "12px" }}>
                        {staff.map(member => (
                            <div key={member.id} style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                    {/* Avatar */}
                                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: `${ROLE_COLORS[member.role] || "#6366f1"}22`, border: `1px solid ${ROLE_COLORS[member.role] || "#6366f1"}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>
                                        {member.name?.[0]?.toUpperCase() || "?"}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: "700", fontSize: "1rem", color: "white" }}>{member.name || "No Name"}</div>
                                        <div style={{ color: "#64748b", fontSize: "0.82rem", marginTop: "2px" }}>{member.email}</div>
                                        <div style={{ display: "flex", gap: "8px", marginTop: "6px", flexWrap: "wrap" }}>
                                            <span style={{ padding: "2px 10px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "700", background: `${ROLE_COLORS[member.role] || "#6366f1"}25`, color: ROLE_COLORS[member.role] || "#818cf8" }}>
                                                {ROLE_LABELS[member.role] || member.role}
                                            </span>
                                            <span style={{ padding: "2px 10px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "700", background: member.isApproved ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", color: member.isApproved ? "#34d399" : "#fbbf24" }}>
                                                {member.isApproved ? "✓ Approved" : "⏳ Pending"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                    <div style={{ fontSize: "0.75rem", color: "#475569", textAlign: "right" }}>
                                        <div>Joined</div>
                                        <div style={{ fontWeight: "600", color: "#94a3b8" }}>{new Date(member.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    {!member.isApproved ? (
                                        <button
                                            className="action-btn"
                                            disabled={actionLoading === member.id}
                                            onClick={() => handleApproval(member.id, true)}
                                            style={{ background: "#10b981", color: "white", minWidth: "90px" }}
                                        >
                                            {actionLoading === member.id ? "..." : "✓ Approve"}
                                        </button>
                                    ) : (
                                        <button
                                            className="action-btn"
                                            disabled={actionLoading === member.id}
                                            onClick={() => { if (confirm(`Revoke access for ${member.name}? They won't be able to login.`)) handleApproval(member.id, false); }}
                                            style={{ background: "transparent", color: "#f87171", border: "1px solid rgba(248,113,113,0.4)", minWidth: "90px" }}
                                        >
                                            {actionLoading === member.id ? "..." : "Revoke"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
