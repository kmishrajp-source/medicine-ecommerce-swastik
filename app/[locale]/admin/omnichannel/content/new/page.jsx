"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";

export default function NewCampaign() {
    const { cartCount, toggleCart } = useCart();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [adapting, setAdapting] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [masterContent, setMasterContent] = useState("");

    // AI Outputs
    const [versions, setVersions] = useState({
        facebookBody: "",
        instagramBody: "",
        whatsappBody: "",
        emailBody: ""
    });

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        else if (status === "authenticated" && session?.user?.role === "CUSTOMER") router.push("/");

        // Check if we arrived from the AI Assistant Chat
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get("fromDraft") === "true") {
            const draft = localStorage.getItem("omnichannel_master_draft");
            if (draft) {
                setMasterContent(draft);
                // clear it out so a fresh reload doesn't populate it randomly
                localStorage.removeItem("omnichannel_master_draft");
            }
        }
    }, [status, session, router]);

    const handleAdapt = async () => {
        if (!title || !masterContent) return alert("Title and Master Content are required.");
        setAdapting(true);
        try {
            const res = await fetch("/api/admin/omnichannel/adapt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, contentType: category, masterContent })
            });
            const data = await res.json();
            if (data.success && data.adaptedContent) {
                setVersions({
                    facebookBody: data.adaptedContent.facebook || "",
                    instagramBody: data.adaptedContent.instagram || "",
                    whatsappBody: data.adaptedContent.whatsapp || "",
                    emailBody: (data.adaptedContent.email?.subject ? `SUBJECT: ${data.adaptedContent.email.subject}\n\n` : "") + (data.adaptedContent.email?.body || "")
                });
            } else {
                alert("AI Adapter failed: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Network error.");
        } finally {
            setAdapting(false);
        }
    };

    const handleSave = async () => {
        if (!title || !masterContent) return alert("Title and Master Content are required.");
        setLoading(true);
        try {
            const res = await fetch("/api/admin/omnichannel/content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    category,
                    contentType: "GENERAL",
                    websiteBody: masterContent,
                    facebookBody: versions.facebookBody,
                    instagramBody: versions.instagramBody,
                    whatsappBody: versions.whatsappBody,
                    emailBody: versions.emailBody
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Saved as Draft successfully!");
                router.push("/admin/omnichannel/content");
            } else {
                alert("Save failed: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Network error.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: "100%", padding: "12px 16px", borderRadius: 10,
        background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)",
        color: "white", outline: "none", fontSize: "0.95rem", fontFamily: "'Inter', sans-serif"
    };
    const labelStyle = { display: "block", color: "#9CA3AF", fontSize: "0.85rem", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" };

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0A0A0F 0%, #0D1117 50%, #0A0A0F 100%)", color: "white", fontFamily: "'Inter', sans-serif" }}>
            <Navbar cartCount={cartCount} toggleCart={toggleCart} />
            <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 16px" }}>

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
                    <div>
                        <Link href="/admin/omnichannel/content" style={{ color: "#6B7280", fontSize: "0.85rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                            ← Back to Library
                        </Link>
                        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "white", margin: 0 }}>
                            ✨ AI Campaign Creator
                        </h1>
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                        <button onClick={handleSave} disabled={loading} style={{
                            background: "linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)",
                            color: "white", padding: "12px 24px", borderRadius: "12px",
                            fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer",
                            boxShadow: "0 4px 14px rgba(244,63,94,0.3)"
                        }}>
                            {loading ? "Saving..." : "Save as Draft"}
                        </button>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                    {/* Left Column: Master Content */}
                    <div>
                        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 24 }}>
                            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 24px 0", color: "white" }}>1. Master Content</h2>
                            
                            <div style={{ marginBottom: 20 }}>
                                <label style={labelStyle}>Internal Title</label>
                                <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., September CBC Test Promo" />
                            </div>
                            
                            <div style={{ marginBottom: 20 }}>
                                <label style={labelStyle}>Category (Optional)</label>
                                <input style={inputStyle} value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g., Offers, Health Education" />
                            </div>

                            <div style={{ marginBottom: 24 }}>
                                <label style={labelStyle}>Master Article / Website Content</label>
                                <textarea 
                                    style={{ ...inputStyle, minHeight: 300, resize: "vertical" }} 
                                    value={masterContent} 
                                    onChange={e => setMasterContent(e.target.value)}
                                    placeholder="Write the full, detailed version of the content here. The AI will adapt this for social media."
                                />
                            </div>

                            <button onClick={handleAdapt} disabled={adapting || !masterContent} style={{
                                width: "100%", background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
                                color: "white", padding: "14px", borderRadius: "12px",
                                fontWeight: 700, border: "none", cursor: (adapting || !masterContent) ? "not-allowed" : "pointer",
                                opacity: (!masterContent) ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10
                            }}>
                                {adapting ? "🤖 AI is thinking..." : "✨ Adapt with AI"}
                            </button>
                            <p style={{ fontSize: "0.75rem", color: "#6B7280", textAlign: "center", marginTop: 12 }}>
                                AI uses real Swastik data. It will not invent prices or diagnose.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: AI Output */}
                    <div>
                        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, padding: 24 }}>
                            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 24px 0", color: "#9CA3AF" }}>2. Channel Versions (Review)</h2>
                            
                            <div style={{ marginBottom: 20 }}>
                                <label style={{...labelStyle, color: "#1877F2"}}>📘 Facebook</label>
                                <textarea style={{ ...inputStyle, minHeight: 120, borderColor: "#1877F244" }} 
                                    value={versions.facebookBody} onChange={e => setVersions({...versions, facebookBody: e.target.value})} />
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label style={{...labelStyle, color: "#E1306C"}}>📸 Instagram</label>
                                <textarea style={{ ...inputStyle, minHeight: 100, borderColor: "#E1306C44" }} 
                                    value={versions.instagramBody} onChange={e => setVersions({...versions, instagramBody: e.target.value})} />
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label style={{...labelStyle, color: "#25D366"}}>💬 WhatsApp</label>
                                <textarea style={{ ...inputStyle, minHeight: 100, borderColor: "#25D36644" }} 
                                    value={versions.whatsappBody} onChange={e => setVersions({...versions, whatsappBody: e.target.value})} />
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label style={{...labelStyle, color: "#6366F1"}}>📧 Email Newsletter</label>
                                <textarea style={{ ...inputStyle, minHeight: 180, borderColor: "#6366F144" }} 
                                    value={versions.emailBody} onChange={e => setVersions({...versions, emailBody: e.target.value})} />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
