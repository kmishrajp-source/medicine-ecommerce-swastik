"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";

export default function ContentLibrary() {
    const { cartCount, toggleCart } = useCart();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        else if (status === "authenticated" && session?.user?.role === "CUSTOMER") router.push("/");
        else if (status === "authenticated") fetchContent();
    }, [status, session, router]);

    const fetchContent = async () => {
        try {
            const res = await fetch("/api/admin/omnichannel/content");
            const data = await res.json();
            if (data.success) {
                setContent(data.content);
            }
        } catch (error) {
            console.error("Failed to load content", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async (id) => {
        if (!window.confirm("Approve and publish this content via viaSocket?")) return;
        
        setActionLoading(id);
        try {
            const res = await fetch(`/api/admin/omnichannel/content/${id}/publish`, { method: "POST" });
            const data = await res.json();
            if (data.success) {
                alert("Successfully dispatched to viaSocket!");
                fetchContent();
            } else {
                alert("Publish failed: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Network error.");
        } finally {
            setActionLoading(null);
        }
    };

    const STATUS_COLORS = {
        DRAFT: { bg: "#3B1F06", text: "#F59E0B", border: "#78350F" },
        PENDING_APPROVAL: { bg: "#4C1D9522", text: "#A78BFA", border: "#6D28D9" },
        PUBLISHED: { bg: "#064E3B", text: "#34D399", border: "#065F46" },
    };

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0A0A0F 0%, #0D1117 50%, #0A0A0F 100%)", color: "white", fontFamily: "'Inter', sans-serif" }}>
            <Navbar cartCount={cartCount} toggleCart={toggleCart} />
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 16px" }}>
                
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
                    <div>
                        <Link href="/admin/omnichannel" style={{ color: "#6B7280", fontSize: "0.85rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                            ← Back to Hub
                        </Link>
                        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "white", margin: 0 }}>
                            📚 Master Content Library
                        </h1>
                        <p style={{ color: "#9CA3AF", marginTop: 6, fontSize: "0.95rem" }}>
                            Manage your omnichannel campaigns and AI-adapted drafts.
                        </p>
                    </div>
                    <Link href="/admin/omnichannel/content/new" style={{
                        background: "linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)",
                        color: "white", padding: "12px 24px", borderRadius: "12px",
                        fontWeight: 700, textDecoration: "none",
                        boxShadow: "0 4px 14px rgba(244,63,94,0.3)"
                    }}>
                        + New AI Campaign
                    </Link>
                </div>

                {/* Content Table */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, overflow: "hidden" }}>
                    {loading ? (
                        <div style={{ padding: 40, textAlign: "center", color: "#6B7280" }}>Loading library...</div>
                    ) : content.length === 0 ? (
                        <div style={{ padding: 60, textAlign: "center", color: "#6B7280" }}>
                            <div style={{ fontSize: "3rem", marginBottom: 16 }}>📝</div>
                            <h3 style={{ color: "white", marginBottom: 8 }}>No content found</h3>
                            <p>Click "New AI Campaign" to create your first omnichannel post.</p>
                        </div>
                    ) : (
                        <div style={{ width: "100%", overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                                <thead style={{ background: "rgba(255,255,255,0.04)", color: "#9CA3AF", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                                    <tr>
                                        <th style={{ padding: "16px 20px", textAlign: "left", fontWeight: 700 }}>Title</th>
                                        <th style={{ padding: "16px 20px", textAlign: "left", fontWeight: 700 }}>Category</th>
                                        <th style={{ padding: "16px 20px", textAlign: "left", fontWeight: 700 }}>Last Updated</th>
                                        <th style={{ padding: "16px 20px", textAlign: "center", fontWeight: 700 }}>Status</th>
                                        <th style={{ padding: "16px 20px", textAlign: "right", fontWeight: 700 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {content.map((item) => {
                                        const c = STATUS_COLORS[item.status] || STATUS_COLORS.DRAFT;
                                        return (
                                            <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                                <td style={{ padding: "16px 20px", fontWeight: 600 }}>{item.title}</td>
                                                <td style={{ padding: "16px 20px", color: "#9CA3AF" }}>{item.category}</td>
                                                <td style={{ padding: "16px 20px", color: "#9CA3AF", fontSize: "0.85rem" }}>
                                                    {new Date(item.updatedAt).toLocaleString()}
                                                </td>
                                                <td style={{ padding: "16px 20px", textAlign: "center" }}>
                                                    <span style={{
                                                        padding: "4px 12px", borderRadius: 99, fontSize: "0.75rem", fontWeight: 700,
                                                        background: c.bg, color: c.text, border: `1px solid ${c.border}`
                                                    }}>
                                                        {item.status.replace("_", " ")}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "16px 20px", textAlign: "right" }}>
                                                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                                        <button style={{
                                                            background: "rgba(255,255,255,0.08)", color: "white",
                                                            border: "none", padding: "6px 16px", borderRadius: 8,
                                                            fontWeight: 600, cursor: "pointer", fontSize: "0.8rem"
                                                        }}>
                                                            View / Edit
                                                        </button>
                                                        {item.status === 'DRAFT' && (
                                                            <button 
                                                                onClick={() => handlePublish(item.id)}
                                                                disabled={actionLoading === item.id}
                                                                style={{
                                                                background: "linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)", color: "white",
                                                                border: "none", padding: "6px 16px", borderRadius: 8,
                                                                fontWeight: 700, cursor: actionLoading === item.id ? "not-allowed" : "pointer", fontSize: "0.8rem",
                                                                boxShadow: "0 4px 10px rgba(244,63,94,0.2)"
                                                            }}>
                                                                {actionLoading === item.id ? "Sending..." : "Approve & Publish"}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
