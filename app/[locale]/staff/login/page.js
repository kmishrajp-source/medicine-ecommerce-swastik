"use client";
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isStaff } from "@/lib/permissions";

export default function StaffLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { data: session, status } = useSession();

    // Redirect if already logged in as staff
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role && isStaff(session.user.role)) {
            router.push('/admin');
        }
    }, [session, status]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const result = await signIn("credentials", {
            email: email.trim().toLowerCase(),
            password,
            redirect: false,
        });

        setLoading(false);

        if (result?.error) {
            setError(result.error === "CredentialsSignin"
                ? "Incorrect email or password"
                : result.error);
            return;
        }

        // After sign in, fetch updated session to check role
        router.push("/admin");
    };

    if (status === 'loading') return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F172A' }}>
            <div style={{ color: 'white', fontSize: '1.2rem' }}>⏳ Loading...</div>
        </div>
    );

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
            fontFamily: "'Inter', sans-serif"
        }}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

            <div style={{ width: '100%', maxWidth: '420px', padding: '0 24px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>💊</div>
                    <h1 style={{ color: 'white', fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>Swastik Medicare</h1>
                    <p style={{ color: '#94A3B8', marginTop: '6px', fontSize: '0.9rem' }}>Staff Portal — Secure Login</p>
                </div>

                {/* Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '20px', padding: '36px', backdropFilter: 'blur(12px)'
                }}>
                    <h2 style={{ color: 'white', margin: '0 0 24px', fontSize: '1.2rem', fontWeight: '700' }}>Staff Sign In</h2>

                    {error && (
                        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#991B1B', fontSize: '0.9rem' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ color: '#94A3B8', fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Email Address</label>
                            <input
                                type="email" value={email} onChange={e => setEmail(e.target.value)}
                                required autoComplete="email"
                                placeholder="pharmacist@swastik.com"
                                style={{
                                    width: '100%', padding: '12px 16px', borderRadius: '10px',
                                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                                    color: 'white', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ color: '#94A3B8', fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Password</label>
                            <input
                                type="password" value={password} onChange={e => setPassword(e.target.value)}
                                required autoComplete="current-password"
                                placeholder="••••••••"
                                style={{
                                    width: '100%', padding: '12px 16px', borderRadius: '10px',
                                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                                    color: 'white', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
                            background: loading ? '#334155' : 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                            color: 'white', fontSize: '1rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                            marginTop: '8px', transition: 'all 0.2s'
                        }}>
                            {loading ? '⏳ Signing in...' : '🔐 Sign In'}
                        </button>
                    </form>

                    {/* Role Info */}
                    <div style={{ marginTop: '28px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
                        <p style={{ color: '#64748B', fontSize: '0.78rem', textAlign: 'center', marginBottom: '12px' }}>Staff roles supported:</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                            {[
                                ['🏥', 'Pharmacist', '#16A34A'],
                                ['💰', 'Accounts', '#D97706'],
                                ['🚚', 'Delivery', '#0891B2'],
                                ['👥', 'CRM', '#DB2777'],
                                ['⚙️', 'Operations', '#6B7280'],
                                ['🔧', 'Admin', '#2563EB'],
                            ].map(([icon, label, color]) => (
                                <span key={label} style={{ background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: '20px', padding: '3px 10px', fontSize: '0.75rem', fontWeight: '600' }}>
                                    {icon} {label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <p style={{ color: '#475569', textAlign: 'center', marginTop: '20px', fontSize: '0.8rem' }}>
                    Customer? <a href="/login" style={{ color: '#818CF8', textDecoration: 'none' }}>Login here</a> instead.
                </p>
            </div>
        </div>
    );
}
