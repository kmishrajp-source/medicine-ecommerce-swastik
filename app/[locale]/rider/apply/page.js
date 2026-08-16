"use client";
import { useState } from "react";
import Link from "next/link";

const VEHICLE_TYPES = [
    { value: "MOTORCYCLE", label: "🏍️ Motorcycle / Scooter", desc: "Most common, ideal for all routes" },
    { value: "BICYCLE", label: "🚲 Bicycle", desc: "Great for short distances" },
    { value: "ELECTRIC_SCOOTER", label: "⚡ Electric Scooter", desc: "Eco-friendly delivery" },
    { value: "CAR", label: "🚗 Car", desc: "For bulk / high-capacity deliveries" }
];

export default function RiderApplyPage({ searchParams }) {
    const refCode = searchParams?.ref || "";
    const [form, setForm] = useState({ name: "", phone: "", city: "Gorakhpur", area: "", vehicleType: "MOTORCYCLE", referralCode: refCode });
    const [step, setStep] = useState(1); // 1 = form, 2 = success
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!form.name.trim() || !form.phone.trim()) { setError("Name and phone are required."); return; }
        if (!/^\d{10}$/.test(form.phone)) { setError("Please enter a valid 10-digit mobile number."); return; }

        setLoading(true);
        try {
            const res = await fetch("/api/rider/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!res.ok || data.error) { setError(data.error || "Submission failed. Please try again."); return; }
            setStep(2);
        } catch (err) {
            setError("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0f1c 0%, #0d1b2e 50%, #0a1628 100%)", fontFamily: "'Inter', sans-serif", color: "white" }}>
            {/* Header */}
            <div style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "1.4rem", fontWeight: 900, background: "linear-gradient(135deg, #22c55e, #16a34a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>💊 Swastik Medicare</span>
                </Link>
                <span style={{ fontSize: "0.8rem", color: "#9CA3AF" }}>Delivery Partner Program</span>
            </div>

            <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem 1.5rem" }}>

                {step === 2 ? (
                    // Success State
                    <div style={{ textAlign: "center", padding: "3rem 2rem", background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "24px", marginTop: "2rem" }}>
                        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
                        <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#22c55e", marginBottom: "0.5rem" }}>Application Submitted!</h1>
                        <p style={{ color: "#9CA3AF", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                            Thank you for applying to become a Swastik Medicare Delivery Partner.<br />
                            Our team will review your application and contact you on <strong style={{ color: "white" }}>{form.phone}</strong> within <strong style={{ color: "#22c55e" }}>24–48 hours</strong>.
                        </p>
                        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "1rem", marginBottom: "1.5rem", textAlign: "left" }}>
                            <div style={{ fontSize: "0.8rem", color: "#6B7280", marginBottom: "0.5rem", textTransform: "uppercase", fontWeight: 700 }}>Next Steps</div>
                            {["Our team will call you for a brief phone interview", "You'll be asked to upload your documents (Aadhaar, DL, Vehicle RC)", "After verification, you'll receive your activation confirmation", "Start earning by delivering medicines in your area!"].map((step, i) => (
                                <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "0.6rem" }}>
                                    <span style={{ color: "#22c55e", fontWeight: 900, flexShrink: 0 }}>{i + 1}.</span>
                                    <span style={{ color: "#D1D5DB", fontSize: "0.9rem" }}>{step}</span>
                                </div>
                            ))}
                        </div>
                        <Link href="/" style={{ color: "#22c55e", textDecoration: "none", fontSize: "0.9rem" }}>← Back to Homepage</Link>
                    </div>
                ) : (
                    <>
                        {/* Hero Section */}
                        <div style={{ textAlign: "center", padding: "2rem 0 1.5rem" }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "20px", padding: "6px 16px", fontSize: "0.8rem", color: "#22c55e", fontWeight: 700, marginBottom: "1rem" }}>
                                🚴 NOW RECRUITING IN GORAKHPUR
                            </div>
                            <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.5rem)", fontWeight: 900, lineHeight: 1.2, marginBottom: "0.75rem" }}>
                                Become a <span style={{ background: "linear-gradient(135deg, #22c55e, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Delivery Partner</span>
                            </h1>
                            <p style={{ color: "#9CA3AF", fontSize: "1rem", maxWidth: "460px", margin: "0 auto", lineHeight: 1.6 }}>
                                Earn by delivering medicines to patients in your neighbourhood. Flexible hours, good pay, meaningful work.
                            </p>
                        </div>

                        {/* Benefits */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "2rem" }}>
                            {[
                                { icon: "⏱️", title: "Flexible Hours", desc: "Work when you want" },
                                { icon: "💰", title: "Earn Per Delivery", desc: "Payment per delivery + bonuses" },
                                { icon: "🏥", title: "Meaningful Work", desc: "Help patients get medicine" },
                                { icon: "📱", title: "Simple App", desc: "Easy-to-use delivery dashboard" }
                            ].map((b, i) => (
                                <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1rem" }}>
                                    <div style={{ fontSize: "1.5rem", marginBottom: "4px" }}>{b.icon}</div>
                                    <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "2px" }}>{b.title}</div>
                                    <div style={{ color: "#9CA3AF", fontSize: "0.78rem" }}>{b.desc}</div>
                                </div>
                            ))}
                        </div>

                        {/* Eligibility */}
                        <div style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "2rem" }}>
                            <div style={{ fontWeight: 700, color: "#60A5FA", marginBottom: "0.5rem", fontSize: "0.85rem" }}>✅ ELIGIBILITY</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                {["18+ years old", "Own vehicle (bike/cycle/car)", "Valid Driving License", "Aadhaar Card", "Smartphone", "Willing to serve local area"].map(req => (
                                    <span key={req} style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "20px", padding: "4px 12px", fontSize: "0.78rem", color: "#93C5FD" }}>{req}</span>
                                ))}
                            </div>
                        </div>

                        {/* Application Form */}
                        <form onSubmit={handleSubmit} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "1.75rem" }}>
                            <h2 style={{ fontSize: "1.1rem", fontWeight: 900, marginBottom: "1.5rem", color: "#E5E7EB" }}>📋 Apply Now — It's Free</h2>

                            {[
                                { label: "Full Name *", key: "name", type: "text", placeholder: "Your full name" },
                                { label: "Mobile Number *", key: "phone", type: "tel", placeholder: "10-digit mobile number" },
                                { label: "City *", key: "city", type: "text", placeholder: "e.g. Gorakhpur" },
                                { label: "Area / Locality", key: "area", type: "text", placeholder: "e.g. Betiahata, Medical College Road" }
                            ].map(field => (
                                <div key={field.key} style={{ marginBottom: "1rem" }}>
                                    <label style={{ display: "block", fontSize: "0.8rem", color: "#9CA3AF", fontWeight: 600, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{field.label}</label>
                                    <input
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        value={form[field.key]}
                                        onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                                        style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", color: "white", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
                                    />
                                </div>
                            ))}

                            {/* Vehicle Type */}
                            <div style={{ marginBottom: "1rem" }}>
                                <label style={{ display: "block", fontSize: "0.8rem", color: "#9CA3AF", fontWeight: 600, marginBottom: "8px", textTransform: "uppercase" }}>Vehicle Type *</label>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                    {VEHICLE_TYPES.map(v => (
                                        <button key={v.value} type="button" onClick={() => setForm(p => ({ ...p, vehicleType: v.value }))}
                                            style={{ padding: "10px", background: form.vehicleType === v.value ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${form.vehicleType === v.value ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: "10px", color: "white", cursor: "pointer", textAlign: "left" }}>
                                            <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{v.label}</div>
                                            <div style={{ fontSize: "0.7rem", color: "#6B7280" }}>{v.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Referral Code */}
                            <div style={{ marginBottom: "1rem" }}>
                                <label style={{ display: "block", fontSize: "0.8rem", color: "#9CA3AF", fontWeight: 600, marginBottom: "6px", textTransform: "uppercase" }}>Referral Code (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="Enter referral code if you have one"
                                    value={form.referralCode}
                                    onChange={e => setForm(p => ({ ...p, referralCode: e.target.value }))}
                                    style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", color: "white", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
                                />
                            </div>

                            {error && (
                                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "10px 14px", color: "#FCA5A5", fontSize: "0.85rem", marginBottom: "1rem" }}>
                                    ⚠️ {error}
                                </div>
                            )}

                            {/* Disclaimer */}
                            <p style={{ fontSize: "0.72rem", color: "#6B7280", marginBottom: "1rem", lineHeight: 1.5 }}>
                                ⚠️ <strong>Important:</strong> Earnings depend on delivery volume in your area and are not guaranteed. Swastik Medicare is a technology platform connecting patients with delivery partners. By applying, you agree to our terms of service.
                            </p>

                            <button type="submit" disabled={loading}
                                style={{ width: "100%", padding: "14px", background: loading ? "rgba(34,197,94,0.4)" : "linear-gradient(135deg, #22c55e, #16a34a)", border: "none", borderRadius: "12px", color: "white", fontWeight: 900, fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
                                {loading ? "Submitting..." : "🚀 Submit Application"}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
