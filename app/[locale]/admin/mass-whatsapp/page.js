"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const CUSTOMER_TEMPLATES = [
    {
        id: "c1",
        label: "🎉 Grand Welcome Offer",
        message: `🎉 *SWASTIK MEDICARE — SPECIAL OFFER!*

Hello! We have great news for you.

✅ Order your medicines online with *Swastik Medicare* and get:
💊 *10% OFF* on all generic medicines
🚚 *FREE Home Delivery* in your area
⚡ Same-day delivery available

📱 Order now: https://swastikmedicare.com/en

Save this number and never run out of medicines again! 🙏`
    },
    {
        id: "c2",
        label: "💊 Generic Medicine Savings",
        message: `💊 *Did you know?*

Generic medicines work exactly like branded ones, but cost *50-80% LESS!*

🏥 *Swastik Medicare* offers certified generic medicines:
✅ Same salt, same quality
✅ Doctor approved
✅ Home delivery available

🛒 Start saving on medicines today:
👉 https://swastikmedicare.com/en

Your health, our priority. 🙏`
    },
    {
        id: "c3",
        label: "📦 Refill Reminder",
        message: `⏰ *Medicine Refill Reminder from Swastik Medicare*

Hi! It's time to refill your monthly medicines! 💊

🔄 Order in minutes:
👉 https://swastikmedicare.com/en

We offer:
✅ 10% discount on all orders
✅ Home delivery at your door
✅ Genuine medicines, best prices

Stay healthy! 🌿 — Team Swastik Medicare`
    },
    {
        id: "c4",
        label: "🎁 Festival Special Discount",
        message: `🎊 *Swastik Medicare — Festival Special!*

This festive season, we care for your health! 💚

🎁 *SPECIAL OFFER:*
• 15% off on orders above ₹500
• Free delivery on all orders this week!
• Extra 5% for senior citizens

🛒 Shop now: https://swastikmedicare.com/en

Wishing you good health and happiness! 🙏`
    }
];

const RETAILER_TEMPLATES = [
    {
        id: "r1",
        label: "🤝 Join as Partner (Primary)",
        message: `🏪 *OPPORTUNITY FOR MEDICAL STORE OWNERS!*

Hello! We are *Swastik Medicare* — a growing online medicine platform.

We are looking for pharmacy partners to join our network!

✅ *Benefits for you:*
• List your store on our platform FREE
• Get online orders from local customers
• Increase your daily revenue
• No upfront investment needed
• Dedicated business dashboard

📞 Join 100+ pharmacies already earning more with us!

👉 Register here: https://swastikmedicare.com/en/retailer-register

Or WhatsApp us to know more! 💬`
    },
    {
        id: "r2",
        label: "💰 Revenue Growth Pitch",
        message: `💰 *Earn More from Your Medical Store!*

Dear Pharmacy Owner,

Are you looking to grow your business? 

*Swastik Medicare* helps local pharmacies like yours reach MORE customers online!

📈 *What we offer:*
✅ Free listing on our medicine app
✅ Orders delivered directly from your store
✅ Real-time inventory management system
✅ No commission on the first 50 orders!
✅ Dedicated partner support team

🏆 Already 100+ stores growing with us!

📱 Join in 5 minutes:
👉 https://swastikmedicare.com/en/retailer-register

Call/WhatsApp: +91-XXXXXXXXXX`
    },
    {
        id: "r3",
        label: "🚀 Digital Pharmacy Upgrade",
        message: `🚀 *Take Your Pharmacy Online with Swastik Medicare!*

Namaste! 🙏

In today's world, customers order everything online — including medicines.

*Don't miss out! Join Swastik Medicare and get:*

✅ Your own digital storefront
✅ Online payment collection
✅ Home delivery support
✅ WhatsApp order notifications
✅ Business analytics dashboard

💊 Trusted by pharmacies across the region!

📲 Register FREE today:
https://swastikmedicare.com/en/retailer-register

Questions? Just reply to this message! 💬`
    },
    {
        id: "r4",
        label: "🏥 B2B Bulk Supply Offer",
        message: `🏥 *Swastik Medicare — B2B Supply Partner Program*

Dear Medical Store Owner,

Looking for a *reliable medicine supplier* at wholesale prices?

*Swastik Medicare B2B Network offers:*
✅ Bulk medicines at distributor rates
✅ Pan-India delivery within 48 hours
✅ GST invoices for every order
✅ 500+ branded & generic medicines
✅ Dedicated account manager

📦 Minimum order: Just ₹2,000

🤝 Join our partner network today!

📞 WhatsApp: Send "PARTNER" to this number
🌐 Register: https://swastikmedicare.com/en/retailer-register`
    }
];

export default function MassWhatsAppAdmin() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [counts, setCounts] = useState({ CUSTOMERS: 0, DOCTORS: 0, RETAILERS: 0, CAMPAIGN_LEADS: 0 });
    const [loading, setLoading] = useState(true);

    // Customer Broadcast State
    const [custTemplate, setCustTemplate] = useState(CUSTOMER_TEMPLATES[0]);
    const [custCustomMsg, setCustCustomMsg] = useState("");
    const [custMethod, setCustMethod] = useState("WHATSAPP");
    const [custSending, setCustSending] = useState(false);
    const [custResult, setCustResult] = useState(null);

    // Retailer Broadcast State
    const [retailTemplate, setRetailTemplate] = useState(RETAILER_TEMPLATES[0]);
    const [retailCustomMsg, setRetailCustomMsg] = useState("");
    const [retailMethod, setRetailMethod] = useState("WHATSAPP");
    const [retailSending, setRetailSending] = useState(false);
    const [retailResult, setRetailResult] = useState(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
            router.push("/");
        }
    }, [status]);

    useEffect(() => {
        fetch("/api/admin/mass-whatsapp")
            .then(r => r.json())
            .then(data => {
                if (data.success) setCounts(data.counts);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const sendBroadcast = async ({ audience, message, method, setSending, setResult }) => {
        if (!message.trim()) return;
        setSending(true);
        setResult(null);
        try {
            const res = await fetch("/api/admin/mass-whatsapp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ audience, message, method })
            });
            const data = await res.json();
            if (data.success) {
                setResult({ type: "success", msg: `✅ Broadcast queued for ${data.targetCount} contacts! Messages are sending in the background.` });
            } else {
                setResult({ type: "error", msg: `❌ Error: ${data.error || "Failed to send broadcast"}` });
            }
        } catch (e) {
            setResult({ type: "error", msg: "❌ Network error. Please try again." });
        } finally {
            setSending(false);
        }
    };

    if (status === "loading" || loading) return (
        <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.2rem", fontWeight: 800 }}>
            Loading Broadcast Engine...
        </div>
    );

    const custFinalMsg = custCustomMsg.trim() || custTemplate.message;
    const retailFinalMsg = retailCustomMsg.trim() || retailTemplate.message;

    return (
        <div style={{ background: "linear-gradient(135deg, #0f172a, #090d1a)", minHeight: "100vh", paddingBottom: "60px", fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ background: "rgba(30,41,59,0.95)", borderBottom: "1px solid rgba(16,185,129,0.2)", padding: "30px 40px", backdropFilter: "blur(10px)" }}>
                <div style={{ maxWidth: "1300px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ fontSize: "1.8rem" }}>📡</span> Broadcast Control Center
                        </h1>
                        <p style={{ color: "#34d399", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: "8px 0 0 0" }}>
                            Send targeted WhatsApp & SMS broadcasts to customers and retailers
                        </p>
                    </div>
                    <button
                        onClick={() => router.push(`/${session?.user?.locale || 'en'}/admin/mass-whatsapp/logs`)}
                        style={{
                            background: "rgba(99, 102, 241, 0.15)", color: "#a5b4fc", border: "1px solid rgba(99, 102, 241, 0.3)",
                            padding: "12px 20px", borderRadius: "12px", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s"
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = "rgba(99, 102, 241, 0.25)"; e.currentTarget.style.color = "#c7d2fe"; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = "rgba(99, 102, 241, 0.15)"; e.currentTarget.style.color = "#a5b4fc"; }}
                    >
                        <i className="fa-solid fa-clock-rotate-left"></i> View Broadcast History
                    </button>
                </div>
            </div>

            <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "40px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(580px, 1fr))", gap: "30px" }}>

                {/* ===== CUSTOMER BROADCAST PANEL ===== */}
                <div style={{ background: "rgba(16,185,129,0.06)", border: "2px solid rgba(16,185,129,0.3)", borderRadius: "24px", overflow: "hidden" }}>
                    {/* Panel Header */}
                    <div style={{ background: "linear-gradient(135deg, #065f46, #047857)", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
                                <span>🛒</span> Customer Broadcast
                            </div>
                            <div style={{ color: "#a7f3d0", fontSize: "0.8rem", fontWeight: 700, marginTop: "4px" }}>
                                Send promotional offers to your customers
                            </div>
                        </div>
                        <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px 18px", borderRadius: "12px", textAlign: "center" }}>
                            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#fff" }}>{counts.CUSTOMERS}</div>
                            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#6ee7b7", textTransform: "uppercase" }}>Customers</div>
                        </div>
                    </div>

                    <div style={{ padding: "28px" }}>
                        {/* Method Toggle */}
                        <div style={{ marginBottom: "20px" }}>
                            <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#6ee7b7", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>Delivery Method</div>
                            <div style={{ display: "flex", gap: "10px" }}>
                                {["WHATSAPP", "SMS"].map(m => (
                                    <button key={m} onClick={() => setCustMethod(m)} style={{
                                        flex: 1, padding: "10px", borderRadius: "12px", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", border: "2px solid",
                                        borderColor: custMethod === m ? "#10b981" : "rgba(255,255,255,0.1)",
                                        background: custMethod === m ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.05)",
                                        color: custMethod === m ? "#6ee7b7" : "#94a3b8"
                                    }}>
                                        {m === "WHATSAPP" ? "💬 WhatsApp" : "📱 SMS"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Template Selector */}
                        <div style={{ marginBottom: "20px" }}>
                            <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#6ee7b7", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
                                Choose Message Template
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {CUSTOMER_TEMPLATES.map(t => (
                                    <button key={t.id} onClick={() => { setCustTemplate(t); setCustCustomMsg(""); }} style={{
                                        textAlign: "left", padding: "12px 16px", borderRadius: "12px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
                                        border: "2px solid",
                                        borderColor: custTemplate.id === t.id ? "#10b981" : "rgba(255,255,255,0.08)",
                                        background: custTemplate.id === t.id ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
                                        color: custTemplate.id === t.id ? "#d1fae5" : "#94a3b8",
                                        transition: "all 0.2s"
                                    }}>
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message Preview / Custom Edit */}
                        <div style={{ marginBottom: "20px" }}>
                            <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#6ee7b7", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
                                Message Preview (Edit to Customise)
                            </div>
                            <textarea
                                rows={8}
                                value={custCustomMsg || custTemplate.message}
                                onChange={e => setCustCustomMsg(e.target.value)}
                                style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "2px solid rgba(16,185,129,0.3)", background: "rgba(0,0,0,0.3)", color: "#e2e8f0", fontSize: "0.85rem", fontFamily: "monospace", resize: "vertical", boxSizing: "border-box" }}
                            />
                            {custCustomMsg && (
                                <button onClick={() => setCustCustomMsg("")} style={{ marginTop: "6px", color: "#f87171", fontWeight: 700, fontSize: "0.75rem", background: "none", border: "none", cursor: "pointer" }}>
                                    ↩ Reset to template
                                </button>
                            )}
                        </div>

                        {/* Result */}
                        {custResult && (
                            <div style={{ marginBottom: "16px", padding: "14px", borderRadius: "12px", background: custResult.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${custResult.type === "success" ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"}`, color: custResult.type === "success" ? "#6ee7b7" : "#fca5a5", fontWeight: 700, fontSize: "0.85rem" }}>
                                {custResult.msg}
                            </div>
                        )}

                        {/* Send Button */}
                        <button
                            disabled={custSending}
                            onClick={() => sendBroadcast({ audience: "CUSTOMERS", message: custFinalMsg, method: custMethod, setSending: setCustSending, setResult: setCustResult })}
                            style={{
                                width: "100%", padding: "16px", borderRadius: "14px", fontWeight: 900, fontSize: "1rem", cursor: custSending ? "not-allowed" : "pointer",
                                background: custSending ? "rgba(16,185,129,0.4)" : "linear-gradient(135deg, #10b981, #059669)",
                                color: "#fff", border: "none", opacity: custSending ? 0.7 : 1,
                                boxShadow: "0 0 30px rgba(16,185,129,0.4)", transition: "all 0.2s", letterSpacing: "0.05em"
                            }}
                        >
                            {custSending ? "⏳ Sending Broadcast..." : `🚀 Send to All ${counts.CUSTOMERS} Customers`}
                        </button>
                    </div>
                </div>

                {/* ===== RETAILER BROADCAST PANEL ===== */}
                <div style={{ background: "rgba(245,158,11,0.06)", border: "2px solid rgba(245,158,11,0.3)", borderRadius: "24px", overflow: "hidden" }}>
                    {/* Panel Header */}
                    <div style={{ background: "linear-gradient(135deg, #78350f, #92400e)", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
                                <span>🏪</span> Retailer Broadcast
                            </div>
                            <div style={{ color: "#fde68a", fontSize: "0.8rem", fontWeight: 700, marginTop: "4px" }}>
                                Invite pharmacies to join Swastik Medicare
                            </div>
                        </div>
                        <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px 18px", borderRadius: "12px", textAlign: "center" }}>
                            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#fff" }}>{counts.RETAILERS}</div>
                            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#fcd34d", textTransform: "uppercase" }}>Retailers</div>
                        </div>
                    </div>

                    <div style={{ padding: "28px" }}>
                        {/* Method Toggle */}
                        <div style={{ marginBottom: "20px" }}>
                            <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#fcd34d", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>Delivery Method</div>
                            <div style={{ display: "flex", gap: "10px" }}>
                                {["WHATSAPP", "SMS"].map(m => (
                                    <button key={m} onClick={() => setRetailMethod(m)} style={{
                                        flex: 1, padding: "10px", borderRadius: "12px", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", border: "2px solid",
                                        borderColor: retailMethod === m ? "#f59e0b" : "rgba(255,255,255,0.1)",
                                        background: retailMethod === m ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.05)",
                                        color: retailMethod === m ? "#fde68a" : "#94a3b8"
                                    }}>
                                        {m === "WHATSAPP" ? "💬 WhatsApp" : "📱 SMS"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Template Selector */}
                        <div style={{ marginBottom: "20px" }}>
                            <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#fcd34d", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
                                Choose Message Template
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {RETAILER_TEMPLATES.map(t => (
                                    <button key={t.id} onClick={() => { setRetailTemplate(t); setRetailCustomMsg(""); }} style={{
                                        textAlign: "left", padding: "12px 16px", borderRadius: "12px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
                                        border: "2px solid",
                                        borderColor: retailTemplate.id === t.id ? "#f59e0b" : "rgba(255,255,255,0.08)",
                                        background: retailTemplate.id === t.id ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.04)",
                                        color: retailTemplate.id === t.id ? "#fef3c7" : "#94a3b8",
                                        transition: "all 0.2s"
                                    }}>
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message Preview / Custom Edit */}
                        <div style={{ marginBottom: "20px" }}>
                            <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#fcd34d", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
                                Message Preview (Edit to Customise)
                            </div>
                            <textarea
                                rows={8}
                                value={retailCustomMsg || retailTemplate.message}
                                onChange={e => setRetailCustomMsg(e.target.value)}
                                style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "2px solid rgba(245,158,11,0.3)", background: "rgba(0,0,0,0.3)", color: "#e2e8f0", fontSize: "0.85rem", fontFamily: "monospace", resize: "vertical", boxSizing: "border-box" }}
                            />
                            {retailCustomMsg && (
                                <button onClick={() => setRetailCustomMsg("")} style={{ marginTop: "6px", color: "#f87171", fontWeight: 700, fontSize: "0.75rem", background: "none", border: "none", cursor: "pointer" }}>
                                    ↩ Reset to template
                                </button>
                            )}
                        </div>

                        {/* Result */}
                        {retailResult && (
                            <div style={{ marginBottom: "16px", padding: "14px", borderRadius: "12px", background: retailResult.type === "success" ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${retailResult.type === "success" ? "rgba(245,158,11,0.4)" : "rgba(239,68,68,0.4)"}`, color: retailResult.type === "success" ? "#fde68a" : "#fca5a5", fontWeight: 700, fontSize: "0.85rem" }}>
                                {retailResult.msg}
                            </div>
                        )}

                        {/* Send Button */}
                        <button
                            disabled={retailSending}
                            onClick={() => sendBroadcast({ audience: "RETAILERS", message: retailFinalMsg, method: retailMethod, setSending: setRetailSending, setResult: setRetailResult })}
                            style={{
                                width: "100%", padding: "16px", borderRadius: "14px", fontWeight: 900, fontSize: "1rem", cursor: retailSending ? "not-allowed" : "pointer",
                                background: retailSending ? "rgba(245,158,11,0.4)" : "linear-gradient(135deg, #f59e0b, #d97706)",
                                color: "#fff", border: "none", opacity: retailSending ? 0.7 : 1,
                                boxShadow: "0 0 30px rgba(245,158,11,0.4)", transition: "all 0.2s", letterSpacing: "0.05em"
                            }}
                        >
                            {retailSending ? "⏳ Sending Broadcast..." : `🚀 Send to All ${counts.RETAILERS} Retailers`}
                        </button>
                    </div>
                </div>

            </div>

            {/* Info Footer */}
            <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 20px" }}>
                <div style={{ background: "rgba(30,41,59,0.6)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "20px 28px", display: "flex", gap: "30px", flexWrap: "wrap" }}>
                    <div style={{ color: "#64748b", fontSize: "0.8rem", fontWeight: 700 }}>
                        💡 <strong style={{ color: "#94a3b8" }}>Tips:</strong> You can edit any template before sending. WhatsApp supports *bold*, _italic_ formatting.
                    </div>
                    <div style={{ color: "#64748b", fontSize: "0.8rem", fontWeight: 700 }}>
                        ⚡ Messages are sent in the background — you won't have to wait!
                    </div>
                    <div style={{ color: "#64748b", fontSize: "0.8rem", fontWeight: 700 }}>
                        📊 Customer count updates every time you import new contacts from the CRM.
                    </div>
                </div>
            </div>
        </div>
    );
}
