"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function AdminSettings() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    const [settings, setSettings] = useState({
        welcomeBonusAmount: 50.0,
        referralBonusAmount: 50.0,
        minimumWithdrawal: 100.0,
        deliveryAgentFee: 50.0
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin/login");
        } else if (session?.user?.role !== "ADMIN" && status !== "loading") {
            router.push("/");
        } else if (status === "authenticated") {
            fetchSettings();
        }
    }, [session, status, router]);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/admin/settings");
            const data = await res.json();
            if (data.success && data.settings) {
                setSettings({
                    welcomeBonusAmount: data.settings.welcomeBonusAmount,
                    referralBonusAmount: data.settings.referralBonusAmount,
                    minimumWithdrawal: data.settings.minimumWithdrawal,
                    deliveryAgentFee: data.settings.deliveryAgentFee
                });
            }
        } catch (error) {
            console.error("Error fetching admin settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            });

            const data = await res.json();
            if (data.success) {
                setMessage({ type: "success", text: "Global Configurations Updated Successfully!" });
            } else {
                setMessage({ type: "error", text: data.error || "Failed to update settings" });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Something went wrong saving settings." });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    if (loading || status === "loading") return <div style={{ padding: '40px', textAlign: 'center' }}>Loading System Configurations...</div>;

    return (
        <div style={{ background: "#F3F4F6", minHeight: "100vh" }}>
            <Navbar cartCount={0} openCart={() => { }} />

            <div className="container" style={{ marginTop: "100px", padding: "20px" }}>
                <h1 style={{ fontSize: "2rem", color: "#1F2937", marginBottom: "30px", paddingBottom: "15px", borderBottom: "2px solid #E5E7EB" }}>
                    <i className="fa-solid fa-sliders text-primary"></i> Global System Controls
                </h1>

                <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ background: '#E0E7FF', padding: '15px', borderRadius: '12px', color: '#4F46E5', fontSize: '1.5rem' }}>
                            <i className="fa-solid fa-money-bill-transfer"></i>
                        </div>
                        <div>
                            <h2 style={{ margin: 0, color: '#111827', fontSize: '1.5rem' }}>Payout & Referral Algorithms</h2>
                            <p style={{ margin: '5px 0 0 0', color: '#6B7280', fontSize: '0.9rem' }}>Tune the exact rupee amounts injected into user and agent wallets automatically.</p>
                        </div>
                    </div>

                    {message && (
                        <div style={{ padding: '15px', marginBottom: '20px', borderRadius: '8px', background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2', color: message.type === 'success' ? '#059669' : '#DC2626', border: `1px solid ${message.type === 'success' ? '#A7F3D0' : '#FECACA'}` }}>
                            <i className={`fa-solid ${message.type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}`} style={{ marginRight: '8px' }}></i>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginBottom: '30px' }}>

                            {/* Welcome Bonus Card */}
                            <div style={{ border: '1px solid #E5E7EB', padding: '20px', borderRadius: '12px', background: '#F9FAFB' }}>
                                <h3 style={{ margin: '0 0 10px 0', color: '#374151', fontSize: '1.1rem' }}>New User Welcome Bonus</h3>
                                <p style={{ margin: '0 0 15px 0', color: '#6B7280', fontSize: '0.85rem' }}>Amount credited to a newly registered user immediately upon their first completed delivery.</p>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-50%)', color: '#6B7280', fontWeight: 'bold' }}>₹</span>
                                    <input
                                        type="number"
                                        name="welcomeBonusAmount"
                                        value={settings.welcomeBonusAmount}
                                        onChange={handleInputChange}
                                        step="0.1"
                                        min="0"
                                        required
                                        style={{ width: '100%', padding: '12px 12px 12px 35px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '1.2rem', fontWeight: 'bold', color: '#1F2937' }}
                                    />
                                </div>
                            </div>

                            {/* Referral Bonus Card */}
                            <div style={{ border: '1px solid #E5E7EB', padding: '20px', borderRadius: '12px', background: '#F9FAFB' }}>
                                <h3 style={{ margin: '0 0 10px 0', color: '#374151', fontSize: '1.1rem' }}>Network Referral Bonus</h3>
                                <p style={{ margin: '0 0 15px 0', color: '#6B7280', fontSize: '0.85rem' }}>Amount credited to the original Referrer when their invited friend completes their fast order.</p>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-50%)', color: '#6B7280', fontWeight: 'bold' }}>₹</span>
                                    <input
                                        type="number"
                                        name="referralBonusAmount"
                                        value={settings.referralBonusAmount}
                                        onChange={handleInputChange}
                                        step="0.1"
                                        min="0"
                                        required
                                        style={{ width: '100%', padding: '12px 12px 12px 35px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '1.2rem', fontWeight: 'bold', color: '#1F2937' }}
                                    />
                                </div>
                            </div>

                            {/* Delivery Agent Fee Card */}
                            <div style={{ border: '1px solid #E5E7EB', padding: '20px', borderRadius: '12px', background: '#F9FAFB' }}>
                                <h3 style={{ margin: '0 0 10px 0', color: '#374151', fontSize: '1.1rem' }}>Agent Delivery Fee</h3>
                                <p style={{ margin: '0 0 15px 0', color: '#6B7280', fontSize: '0.85rem' }}>Base pay added to the Delivery Agent's wallet immediately upon successful order completion.</p>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-50%)', color: '#6B7280', fontWeight: 'bold' }}>₹</span>
                                    <input
                                        type="number"
                                        name="deliveryAgentFee"
                                        value={settings.deliveryAgentFee}
                                        onChange={handleInputChange}
                                        step="0.1"
                                        min="0"
                                        required
                                        style={{ width: '100%', padding: '12px 12px 12px 35px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '1.2rem', fontWeight: 'bold', color: '#1F2937' }}
                                    />
                                </div>
                            </div>

                            {/* Minimum Withdrawal Card */}
                            <div style={{ border: '1px solid #E5E7EB', padding: '20px', borderRadius: '12px', background: '#F9FAFB' }}>
                                <h3 style={{ margin: '0 0 10px 0', color: '#374151', fontSize: '1.1rem' }}>Minimum Bank Withdrawal</h3>
                                <p style={{ margin: '0 0 15px 0', color: '#6B7280', fontSize: '0.85rem' }}>The wallet floor limit users must cross before the "Request UPI Withdrawal" button activates.</p>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-50%)', color: '#6B7280', fontWeight: 'bold' }}>₹</span>
                                    <input
                                        type="number"
                                        name="minimumWithdrawal"
                                        value={settings.minimumWithdrawal}
                                        onChange={handleInputChange}
                                        step="1"
                                        min="10"
                                        required
                                        style={{ width: '100%', padding: '12px 12px 12px 35px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '1.2rem', fontWeight: 'bold', color: '#1F2937' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                padding: '16px 30px', background: '#111827', color: 'white', border: 'none', borderRadius: '8px',
                                fontSize: '1.1rem', fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer', width: '100%',
                                opacity: saving ? 0.7 : 1, transition: 'all 0.2s'
                            }}
                        >
                            {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>}
                            {saving ? "Updating Live Systems..." : "Save Global Configurations"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
