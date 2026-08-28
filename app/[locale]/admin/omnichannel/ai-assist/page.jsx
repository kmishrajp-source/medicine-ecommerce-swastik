"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import ReactMarkdown from 'react-markdown';

export default function AIMarketingAssistant() {
    const { cartCount, toggleCart } = useCart();
    const { data: session, status } = useSession();
    const router = useRouter();
    
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hi there! 👋 I'm Sofiya, your Marketing Strategist. What kind of campaign are we building today? (e.g. 'Draft a post about a 10% discount on diabetes meds' or 'Give me 3 ideas for a winter health campaign')." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        else if (status === "authenticated" && session?.user?.role === "CUSTOMER") router.push("/");
    }, [status, session, router]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = { role: "user", content: input };
        const newHistory = [...messages, userMsg];
        setMessages(newHistory);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/admin/omnichannel/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newHistory.map(m => ({ role: m.role, content: m.content })) })
            });
            const data = await res.json();
            
            if (data.success) {
                setMessages([...newHistory, { role: "assistant", content: data.reply }]);
            } else {
                setMessages([...newHistory, { role: "assistant", content: "⚠️ Sorry, I encountered an error: " + data.error }]);
            }
        } catch (err) {
            setMessages([...newHistory, { role: "assistant", content: "⚠️ Network error connecting to the AI." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAction = (text) => {
        setInput(text);
    };

    // Helper to extract a "Draft" from the markdown to send to the editor
    const copyToEditor = (content) => {
        // We'll store it in localStorage so the next page can pick it up
        localStorage.setItem("omnichannel_master_draft", content);
        router.push("/admin/omnichannel/content/new?fromDraft=true");
    };

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0A0A0F 0%, #0D1117 50%, #0A0A0F 100%)", color: "white", fontFamily: "'Inter', sans-serif" }}>
            <Navbar cartCount={cartCount} toggleCart={toggleCart} />
            <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 16px", height: "calc(100vh - 80px)", display: "flex", flexDirection: "column" }}>
                
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
                    <div>
                        <Link href="/admin/omnichannel" style={{ color: "#6B7280", fontSize: "0.85rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                            ← Back to Hub
                        </Link>
                        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "white", margin: 0 }}>
                            🤖 AI Marketing Assistant
                        </h1>
                        <p style={{ color: "#9CA3AF", marginTop: 6, fontSize: "0.95rem" }}>
                            Brainstorm ideas and draft Master Content with Sofiya.
                        </p>
                    </div>
                </div>

                {/* Chat Container */}
                <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    
                    {/* Message Log */}
                    <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{ 
                                display: "flex", 
                                flexDirection: "column",
                                alignItems: m.role === "user" ? "flex-end" : "flex-start" 
                            }}>
                                <div style={{
                                    maxWidth: "80%",
                                    padding: "12px 18px",
                                    borderRadius: "18px",
                                    background: m.role === "user" ? "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)" : "rgba(255,255,255,0.05)",
                                    color: "white",
                                    border: m.role === "user" ? "none" : "1px solid rgba(255,255,255,0.1)",
                                    fontSize: "0.95rem",
                                    lineHeight: "1.5"
                                }}>
                                    {m.role === 'assistant' ? (
                                        <div className="markdown-body" style={{ color: "white" }}>
                                            <ReactMarkdown>{m.content}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        m.content
                                    )}
                                </div>
                                {m.role === "assistant" && i > 0 && (
                                    <button onClick={() => copyToEditor(m.content)} style={{
                                        marginTop: 8, background: "rgba(52,211,153,0.1)", color: "#34D399",
                                        border: "1px solid rgba(52,211,153,0.2)", padding: "4px 12px", borderRadius: 8,
                                        fontSize: "0.75rem", fontWeight: 700, cursor: "pointer"
                                    }}>
                                        📝 Use this Draft in Content Library
                                    </button>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div style={{ alignSelf: "flex-start", padding: "12px 18px", borderRadius: "18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                                <span style={{ color: "#9CA3AF" }}>Sofiya is typing...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    {messages.length === 1 && (
                        <div style={{ padding: "0 24px 16px", display: "flex", gap: 10, flexWrap: "wrap" }}>
                            {["Draft a CBC Test promo", "Give me 3 Diwali campaign ideas", "Write an article about Hydration"].map(txt => (
                                <button key={txt} onClick={() => handleQuickAction(txt)} style={{
                                    background: "rgba(255,255,255,0.05)", color: "#D1D5DB", border: "1px solid rgba(255,255,255,0.1)",
                                    padding: "6px 14px", borderRadius: 99, fontSize: "0.8rem", cursor: "pointer", transition: "0.2s"
                                }} onMouseOver={e=>e.target.style.background="rgba(255,255,255,0.1)"} onMouseOut={e=>e.target.style.background="rgba(255,255,255,0.05)"}>
                                    {txt}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <div style={{ padding: 20, background: "rgba(0,0,0,0.2)", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 12 }}>
                        <input 
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="Ask Sofiya to draft a campaign..."
                            style={{
                                flex: 1, padding: "14px 20px", borderRadius: 14,
                                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                                color: "white", fontSize: "0.95rem", outline: "none"
                            }}
                        />
                        <button onClick={handleSend} disabled={loading || !input.trim()} style={{
                            background: "linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)",
                            color: "white", padding: "0 24px", borderRadius: 14,
                            fontWeight: 700, border: "none", cursor: (loading || !input.trim()) ? "not-allowed" : "pointer",
                            opacity: (loading || !input.trim()) ? 0.6 : 1
                        }}>
                            Send
                        </button>
                    </div>

                </div>
            </div>
            {/* Global style to make markdown look ok in dark mode without full tailwind typography */}
            <style jsx global>{`
                .markdown-body p { margin-top: 0; margin-bottom: 0.8em; }
                .markdown-body p:last-child { margin-bottom: 0; }
                .markdown-body h1, .markdown-body h2, .markdown-body h3 { margin-top: 0; font-weight: bold; margin-bottom: 0.5em; }
                .markdown-body ul, .markdown-body ol { margin-top: 0; padding-left: 20px; }
            `}</style>
        </div>
    );
}
