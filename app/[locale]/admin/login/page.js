"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/Navbar";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("Invalid email or password");
            } else {
                // Verify admin role and redirect
                const response = await fetch('/api/user/me');
                const userData = await response.json();
                
                if (userData?.user?.role === 'ADMIN') {
                    router.push('/admin');
                } else {
                    setError("Access denied. You do not have admin privileges.");
                }
                router.refresh();
            }
        } catch (err) {
            setError("Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar cartCount={0} />
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                fontFamily: "'Inter', 'Segoe UI', sans-serif"
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '420px',
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '40px',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
                }}>
                    {/* Logo / Header */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{
                            width: '60px', height: '60px',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            borderRadius: '16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px',
                            fontSize: '28px'
                        }}>🛡️</div>
                        <h2 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: '800', margin: 0 }}>Admin Portal</h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '8px', fontSize: '0.9rem' }}>
                            Login with your administrator credentials
                        </p>
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(220,38,38,0.15)',
                            border: '1px solid rgba(220,38,38,0.4)',
                            color: '#fca5a5',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            marginBottom: '20px',
                            fontSize: '0.875rem',
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        {/* Email field */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block', marginBottom: '8px',
                                fontSize: '0.85rem', fontWeight: '600',
                                color: 'rgba(255,255,255,0.7)',
                                letterSpacing: '0.5px'
                            }}>Email Address / Username</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{
                                    position: 'absolute', left: '14px', top: '50%',
                                    transform: 'translateY(-50%)', fontSize: '16px'
                                }}>📧</span>
                                <input
                                    id="admin-email"
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@swastik.com"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '14px 14px 14px 44px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        background: 'rgba(255,255,255,0.08)',
                                        color: '#fff',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(102,126,234,0.8)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{
                                display: 'block', marginBottom: '8px',
                                fontSize: '0.85rem', fontWeight: '600',
                                color: 'rgba(255,255,255,0.7)',
                                letterSpacing: '0.5px'
                            }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{
                                    position: 'absolute', left: '14px', top: '50%',
                                    transform: 'translateY(-50%)', fontSize: '16px'
                                }}>🔒</span>
                                <input
                                    id="admin-password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '14px 44px 14px 44px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        background: 'rgba(255,255,255,0.08)',
                                        color: '#fff',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(102,126,234,0.8)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '14px', top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none', border: 'none',
                                        cursor: 'pointer', fontSize: '16px',
                                        color: 'rgba(255,255,255,0.5)',
                                        padding: '4px'
                                    }}
                                    title={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password link */}
                        <div style={{ textAlign: 'right', marginBottom: '24px' }}>
                            <Link
                                href="/forgot-password"
                                style={{
                                    color: '#a78bfa',
                                    fontSize: '0.85rem',
                                    textDecoration: 'none',
                                    fontWeight: '500',
                                }}
                            >
                                Forgot your password?
                            </Link>
                        </div>

                        {/* Login button */}
                        <button
                            id="admin-login-btn"
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '15px',
                                borderRadius: '12px',
                                fontWeight: '700',
                                fontSize: '1rem',
                                background: loading
                                    ? 'rgba(102,126,234,0.4)'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                letterSpacing: '0.5px',
                                boxShadow: loading ? 'none' : '0 4px 15px rgba(102,126,234,0.4)',
                            }}
                        >
                            {loading ? "Authenticating..." : "🔐 Login to Dashboard"}
                        </button>
                    </form>

                    {/* Admin credentials hint */}
                    <div style={{
                        marginTop: '20px',
                        padding: '12px',
                        background: 'rgba(255,255,255,0.04)',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        fontSize: '0.8rem',
                        color: 'rgba(255,255,255,0.4)',
                        textAlign: 'center'
                    }}>
                        <strong style={{ color: 'rgba(255,255,255,0.55)' }}>Admin Emails:</strong><br/>
                        kmishrajp@gmail.com &nbsp;|&nbsp; admin@swastik.com
                    </div>

                    {/* Footer links */}
                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem', marginBottom: '10px' }}>
                            — Secure Admin Access —
                        </p>
                        <Link
                            href="/login"
                            style={{
                                color: 'rgba(255,255,255,0.45)',
                                textDecoration: 'none',
                                fontSize: '0.85rem',
                            }}
                        >
                            ← Back to User Login
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
