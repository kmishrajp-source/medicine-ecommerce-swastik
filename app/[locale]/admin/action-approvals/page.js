"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ActionApprovalsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const isSuperAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN";

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin/login");
        } else if (status === "authenticated") {
            fetchRequests();
        }
    }, [status, router]);

    const fetchRequests = async () => {
        try {
            const res = await fetch("/api/admin/action-approvals");
            const data = await res.json();
            if (data.success) {
                setRequests(data.requests);
            }
        } catch (error) {
            console.error("Failed to fetch approvals", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId, newStatus) => {
        if (!confirm(`Are you sure you want to ${newStatus.toLowerCase()} this request?`)) return;

        try {
            const res = await fetch("/api/admin/action-approvals", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId, status: newStatus }),
            });
            const data = await res.json();
            if (data.success) {
                // Refresh list
                fetchRequests();
            } else {
                alert(data.error || "Failed to update request");
            }
        } catch (error) {
            console.error("Error updating request", error);
            alert("Error updating request");
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-white">Loading...</div>;
    }

    return (
        <div style={{ minHeight: "100vh", background: "#0f172a", padding: "40px 20px", fontFamily: "'Inter', sans-serif", color: "#f8fafc" }}>
            <main style={{ maxWidth: "1000px", margin: "0 auto" }}>
                <Link href="/admin" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.85rem", marginBottom: "24px", display: "inline-block" }}>
                    ← Back to Dashboard
                </Link>
                
                <h1 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "8px", color: "white" }}>
                    {isSuperAdmin ? "Approval Center" : "My Requests"}
                </h1>
                <p style={{ color: "#94a3b8", marginBottom: "32px" }}>
                    {isSuperAdmin 
                        ? "Review and approve critical actions (Two-Step Approval Process)." 
                        : "Track the status of your pending action requests."}
                </p>

                {requests.length === 0 ? (
                    <div style={{ background: "rgba(30,41,59,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "40px", textAlign: "center" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "16px" }}>✅</div>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "8px" }}>No Pending Requests</h3>
                        <p style={{ color: "#94a3b8" }}>All caught up!</p>
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: "16px" }}>
                        {requests.map(req => (
                            <div key={req.id} style={{ 
                                background: "rgba(30,41,59,0.8)", 
                                border: "1px solid rgba(255,255,255,0.05)", 
                                borderRadius: "16px", 
                                padding: "24px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "16px"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                                            <span style={{ 
                                                padding: "4px 10px", 
                                                borderRadius: "6px", 
                                                fontSize: "0.75rem", 
                                                fontWeight: "700",
                                                background: req.status === "PENDING" ? "rgba(245,158,11,0.2)" : req.status === "APPROVED" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)",
                                                color: req.status === "PENDING" ? "#fbbf24" : req.status === "APPROVED" ? "#34d399" : "#f87171"
                                            }}>
                                                {req.status}
                                            </span>
                                            <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                                                {new Date(req.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#e2e8f0" }}>
                                            Action: {req.actionType}
                                        </h3>
                                        <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "4px" }}>
                                            Requested By: {req.requestedById}
                                        </p>
                                    </div>
                                    
                                    {isSuperAdmin && req.status === "PENDING" && (
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <button 
                                                onClick={() => handleAction(req.id, "APPROVED")}
                                                style={{ padding: "8px 16px", background: "#10b981", color: "white", borderRadius: "8px", fontWeight: "600", border: "none", cursor: "pointer" }}
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleAction(req.id, "REJECTED")}
                                                style={{ padding: "8px 16px", background: "transparent", color: "#f87171", border: "1px solid #f87171", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                                
                                <div style={{ background: "rgba(15,23,42,0.5)", padding: "16px", borderRadius: "12px" }}>
                                    <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#64748b", fontWeight: "700", marginBottom: "8px", letterSpacing: "0.05em" }}>Request Details</h4>
                                    <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: "0.85rem", color: "#cbd5e1", fontFamily: "monospace" }}>
                                        {req.details}
                                    </pre>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
