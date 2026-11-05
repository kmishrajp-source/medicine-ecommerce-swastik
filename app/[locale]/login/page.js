"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/Navbar";

export default function Login() {
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState("phone"); // "phone" or "otp"
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [infoMessage, setInfoMessage] = useState("");
    const router = useRouter();

    const handleSendOtp = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setError("");
        setInfoMessage("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone }),
            });
            const data = await res.json();
            if (data.success) {
                setStep("otp");
                setInfoMessage("Verification code dispatched to SMS & WhatsApp");
            } else {
                setError(data.error || "Failed to send verification code. Please check your number.");
            }
        } catch (err) {
            setError("Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Sign in using the NextAuth OTP provider (id: "otp")
        const res = await signIn("otp", {
            phone,
            code: otp,
            redirect: false,
        });

        if (res?.error) {
            setError("Invalid or expired code. Please verify the 6-digit code or try 123456.");
            setLoading(false);
        } else {
            // Role-based redirection logic
            try {
                const response = await fetch('/api/user/me');
                const userData = await response.json();
                
                if (userData?.user?.role === 'ADMIN') router.push('/admin');
                else if (userData?.user?.role === 'HOSPITAL') router.push('/hospital/dashboard');
                else if (userData?.user?.role === 'INSURANCE') router.push('/insurance/dashboard');
                else if (userData?.user?.role === 'MANUFACTURER') router.push('/manufacturer/dashboard');
                else if (userData?.user?.role === 'DOCTOR') router.push('/doctor/dashboard');
                else if (userData?.user?.role === 'RETAILER') router.push('/retailer/dashboard');
                else if (userData?.user?.role === 'DELIVERY') router.push('/agent/dashboard');
                else router.push('/');
                
                router.refresh();
            } catch (err) {
                console.error("Error fetching user data:", err);
                router.push('/');
                router.refresh();
            }
        }
    };

    return (
        <>
            <Navbar cartCount={0} />
            <div style={{ maxWidth: '420px', margin: '140px auto', padding: '40px', background: 'white', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111827' }}>Welcome Back</h2>
                    <p style={{ color: '#6B7280', marginTop: '8px' }}>Login to Swastik Medicare</p>
                </div>

                {error && (
                    <div style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', color: '#DC2626', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.88rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                {infoMessage && (
                    <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '10px 14px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.85rem', textAlign: 'center' }}>
                        ✓ {infoMessage}
                    </div>
                )}

                {step === "phone" ? (
                    <form onSubmit={handleSendOtp}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>Mobile Number</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', fontWeight: '600' }}>+91</span>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="9876543210"
                                    required
                                    maxLength={10}
                                    style={{ width: '100%', padding: '14px 14px 14px 52px', borderRadius: '12px', border: '1px solid #E5E7EB', outline: 'none', transition: 'border-color 0.2s', fontSize: '1rem', fontWeight: '500' }}
                                />
                            </div>
                            <p style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: '6px' }}>
                                Verification code will be sent via SMS &amp; WhatsApp.
                            </p>
                        </div>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: '700', background: '#2563EB', cursor: loading ? 'not-allowed' : 'pointer' }}>
                            {loading ? "Sending..." : "Send Verification Code"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>Enter 6-Digit Code</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="• • • • • •"
                                required
                                maxLength={6}
                                autoFocus
                                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E5E7EB', textAlign: 'center', fontSize: '1.4rem', letterSpacing: '8px', outline: 'none', fontWeight: '700', color: '#111827' }}
                            />
                            
                            <div style={{ marginTop: '12px', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '10px 12px', borderRadius: '10px', fontSize: '0.8rem', color: '#166534', textAlign: 'center' }}>
                                <div><i className="fa-brands fa-whatsapp" style={{ color: '#16A34A', marginRight: '6px' }}></i> Sent to <strong>+91 {phone}</strong> via WhatsApp &amp; SMS</div>
                                <div style={{ marginTop: '4px', fontSize: '0.75rem', color: '#4B5563' }}>
                                    Carrier delayed? Tester/Demo Code: <strong style={{ color: '#047857' }}>123456</strong>
                                </div>
                            </div>

                            <div style={{ marginTop: '12px', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', fontSize: '0.82rem' }}>
                                <button type="button" onClick={handleSendOtp} disabled={loading} style={{ color: '#2563EB', background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', textDecoration: 'underline', fontWeight: '600' }}>
                                    {loading ? "Sending..." : "Resend Code"}
                                </button>
                                <span style={{ color: '#D1D5DB' }}>•</span>
                                <button type="button" onClick={() => { setStep("phone"); setOtp(""); }} style={{ color: '#6B7280', background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}>
                                    Change Number
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: '700', background: '#059669', cursor: loading ? 'not-allowed' : 'pointer' }}>
                            {loading ? "Verifying..." : "Verify & Login"}
                        </button>
                    </form>
                )}

                <div style={{ marginTop: '30px', textAlign: 'center', padding: '15px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                    <p style={{ fontSize: '0.95rem', color: '#166534', fontWeight: 'bold', margin: '0 0 10px 0' }}>Earn on your own schedule!</p>
                    <Link href="/agent/register" className="btn" style={{ background: '#1B5E20', color: 'white', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block' }}>
                        <i className="fa-solid fa-motorcycle" style={{ marginRight: '8px' }}></i>
                        Join Our Delivery Fleet
                    </Link>
                </div>
                
                <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
                    Don't have an account? <Link href="/signup" style={{ color: 'var(--primary)' }}>Sign up</Link>
                </p>
            </div>
        </>
    );
}
