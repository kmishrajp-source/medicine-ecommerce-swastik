"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function AdminWithdrawals() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        if (status === "unauthenticated" || (session && session.user.role !== "ADMIN")) {
            router.push("/");
            return;
        }

        if (status === "authenticated" && session.user.role === "ADMIN") {
            fetchWithdrawals();
        }
    }, [status, session]);

    const fetchWithdrawals = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/withdrawals");
            const data = await res.json();
            if (Array.isArray(data)) {
                setWithdrawals(data);
            }
        } catch (error) {
            console.error("Failed to load withdrawals:", error);
            alert("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, newStatus) => {
        if (!window.confirm(`Are you sure you want to mark this request as ${newStatus}?`)) return;

        setActionLoading(id);
        try {
            const res = await fetch("/api/admin/withdrawals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ withdrawalId: id, newStatus })
            });

            const data = await res.json();
            if (data.success) {
                // Remove the resolved row from the "Pending" UI locally
                setWithdrawals(withdrawals.filter(w => w.id !== id));
            } else {
                alert(data.error || "Failed to update status");
            }
        } catch (error) {
            alert("Something went wrong");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div style={{ textAlign: "center", marginTop: "100px" }}>Loading Dashboard...</div>;

    return (
        <div style={{ background: "#F3F4F6", minHeight: "100vh" }}>
            <Navbar cartCount={0} openCart={() => { }} />
            <div className="container" style={{ marginTop: "100px", padding: "20px" }}>
                <h1 style={{ fontSize: "2rem", color: "#1F2937", marginBottom: "30px", paddingBottom: "15px", borderBottom: "2px solid #E5E7EB" }}>
                    <i className="fa-solid fa-building-columns text-primary"></i> Pending Payout Requests
                </h1>

                {withdrawals.length === 0 ? (
                    <div style={{ background: "white", padding: "40px", borderRadius: "12px", textAlign: "center", color: "#6B7280" }}>
                        <i className="fa-solid fa-check-circle" style={{ fontSize: "3rem", color: "#10B981", marginBottom: "15px" }}></i>
                        <p style={{ fontSize: "1.2rem", margin: 0 }}>All caught up! No pending withdrawal requests.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto", background: "white", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr style={{ background: "#F9FAFB", borderBottom: "2px solid #E5E7EB" }}>
                                    <th style={{ padding: "15px 20px", color: "#374151" }}>User Details</th>
                                    <th style={{ padding: "15px 20px", color: "#374151" }}>Requested UPI</th>
                                    <th style={{ padding: "15px 20px", color: "#374151", textAlign: "right" }}>Amount</th>
                                    <th style={{ padding: "15px 20px", color: "#374151" }}>Date</th>
                                    <th style={{ padding: "15px 20px", color: "#374151", textAlign: "center" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {withdrawals.map(req => (
                                    <tr key={req.id} style={{ borderBottom: "1px solid #E5E7EB", transition: "0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = '#F9FAFB'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                                        <td style={{ padding: "15px 20px" }}>
                                            <div style={{ fontWeight: "bold", color: "#1F2937" }}>{req.user?.name || "Unknown"}</div>
                                            <div style={{ fontSize: "0.85rem", color: "#6B7280" }}>{req.user?.phone || req.user?.email}</div>
                                        </td>
                                        <td style={{ padding: "15px 20px" }}>
                                            <div style={{ background: "#EFF6FF", color: "#1D4ED8", padding: "6px 12px", borderRadius: "6px", display: "inline-block", fontFamily: "monospace", fontSize: "1rem", border: "1px solid #BFDBFE" }}>
                                                {req.paymentDetails}
                                            </div>
                                        </td>
                                        <td style={{ padding: "15px 20px", textAlign: "right", fontWeight: "bold", fontSize: "1.2rem", color: "#B45309" }}>
                                            ₹{req.amount.toFixed(2)}
                                        </td>
                                        <td style={{ padding: "15px 20px", color: "#6B7280", fontSize: "0.9rem" }}>
                                            {new Date(req.createdAt).toLocaleString()}
                                        </td>
                                        <td style={{ padding: "15px 20px", textAlign: "center" }}>
                                            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                                                <button
                                                    onClick={() => handleAction(req.id, "Completed")}
                                                    disabled={actionLoading === req.id}
                                                    style={{ background: "#10B981", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: actionLoading === req.id ? "not-allowed" : "pointer", fontWeight: "bold", opacity: actionLoading === req.id ? 0.5 : 1 }}
                                                >
                                                    <i className="fa-solid fa-check"></i> Paid
                                                </button>
                                                <button
                                                    onClick={() => handleAction(req.id, "Rejected")}
                                                    disabled={actionLoading === req.id}
                                                    style={{ background: "#EF4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: actionLoading === req.id ? "not-allowed" : "pointer", fontWeight: "bold", opacity: actionLoading === req.id ? 0.5 : 1 }}
                                                >
                                                    <i className="fa-solid fa-xmark"></i> Reject
                                                </button>
                                            </div>
                                            <div style={{ fontSize: "0.75rem", color: "#9CA3AF", marginTop: "5px" }}>*Rejecting refunds the user's wallet</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
