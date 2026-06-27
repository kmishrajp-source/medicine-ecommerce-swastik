"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SOPVersionControlPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isCreating, setIsCreating] = useState(false);
    const [newDoc, setNewDoc] = useState({ chapter: "", version: "1.0", title: "", content: "" });

    const canManageSOPs = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN";

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin/login");
        } else if (status === "authenticated") {
            fetchDocs();
        }
    }, [status, router]);

    const fetchDocs = async () => {
        try {
            const res = await fetch("/api/admin/sop-docs");
            const data = await res.json();
            if (data.success) {
                setDocs(data.docs);
            }
        } catch (error) {
            console.error("Failed to fetch SOP docs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/sop-docs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newDoc),
            });
            const data = await res.json();
            if (data.success) {
                setIsCreating(false);
                setNewDoc({ chapter: "", version: "1.0", title: "", content: "" });
                fetchDocs();
                alert("New SOP Version Created and Logged.");
            } else {
                alert(data.error || "Failed to create SOP");
            }
        } catch (error) {
            console.error("Error creating SOP", error);
            alert("Error creating SOP");
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-white">Loading...</div>;
    }

    return (
        <div style={{ minHeight: "100vh", background: "#0f172a", padding: "40px 20px", fontFamily: "'Inter', sans-serif", color: "#f8fafc" }}>
            <main style={{ maxWidth: "1000px", margin: "0 auto" }}>
                <Link href="/admin/sop" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.85rem", marginBottom: "24px", display: "inline-block" }}>
                    ← Back to SOP Hub
                </Link>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                    <div>
                        <h1 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "8px", color: "white" }}>
                            SOP Version Control
                        </h1>
                        <p style={{ color: "#94a3b8" }}>
                            Manage active versions of Standard Operating Procedures. Changes trigger audit logs.
                        </p>
                    </div>
                    {canManageSOPs && (
                        <button 
                            onClick={() => setIsCreating(!isCreating)}
                            style={{ background: "#4f46e5", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
                        >
                            {isCreating ? "Cancel" : "+ Create New Version"}
                        </button>
                    )}
                </div>

                {isCreating && (
                    <div style={{ background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "24px", marginBottom: "32px" }}>
                        <h2 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "16px" }}>Draft New SOP Version</h2>
                        <form onSubmit={handleCreate} style={{ display: "grid", gap: "16px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "8px" }}>Chapter (e.g. Chapter 1)</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={newDoc.chapter}
                                        onChange={(e) => setNewDoc({...newDoc, chapter: e.target.value})}
                                        style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", padding: "10px", color: "white" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "8px" }}>Version (e.g. 1.1, 2.0)</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={newDoc.version}
                                        onChange={(e) => setNewDoc({...newDoc, version: e.target.value})}
                                        style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", padding: "10px", color: "white" }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "8px" }}>Title</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newDoc.title}
                                    onChange={(e) => setNewDoc({...newDoc, title: e.target.value})}
                                    style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", padding: "10px", color: "white" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "8px" }}>Content (Markdown/Text)</label>
                                <textarea 
                                    required
                                    rows="10"
                                    value={newDoc.content}
                                    onChange={(e) => setNewDoc({...newDoc, content: e.target.value})}
                                    style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", padding: "10px", color: "white", fontFamily: "monospace" }}
                                />
                            </div>
                            <button type="submit" style={{ background: "#10b981", color: "white", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
                                Save & Publish Version
                            </button>
                        </form>
                    </div>
                )}

                <div style={{ display: "grid", gap: "16px" }}>
                    {docs.length === 0 ? (
                        <p style={{ color: "#64748b", textAlign: "center", padding: "40px" }}>No dynamic SOP versions found in the database. Creating one will supersede hardcoded versions.</p>
                    ) : (
                        docs.map(doc => (
                            <div key={doc.id} style={{ 
                                background: "rgba(30,41,59,0.5)", 
                                border: "1px solid rgba(255,255,255,0.05)", 
                                borderRadius: "12px", 
                                padding: "20px"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                                            <span style={{ padding: "4px 8px", background: "#3b82f630", color: "#60a5fa", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700" }}>
                                                {doc.chapter}
                                            </span>
                                            <span style={{ padding: "4px 8px", background: "#10b98130", color: "#34d399", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700" }}>
                                                v{doc.version}
                                            </span>
                                            {doc.isActive && (
                                                <span style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: "700" }}>● Active</span>
                                            )}
                                        </div>
                                        <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "white" }}>{doc.title}</h3>
                                    </div>
                                    <div style={{ textAlign: "right", fontSize: "0.8rem", color: "#64748b" }}>
                                        <div>Updated: {new Date(doc.createdAt).toLocaleDateString()}</div>
                                        <div>By User ID: {doc.authorId}</div>
                                    </div>
                                </div>
                                <div style={{ background: "rgba(15,23,42,0.8)", padding: "16px", borderRadius: "8px", maxHeight: "150px", overflowY: "auto", fontSize: "0.85rem", color: "#cbd5e1" }}>
                                    {doc.content}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
