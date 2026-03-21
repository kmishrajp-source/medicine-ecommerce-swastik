"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res.error) {
            setError("Invalid email or password");
        } else {
            // Role-based redirection logic
            const response = await fetch('/api/user/me'); // Get user role from server
            const userData = await response.json();
            
            if (userData.user.role === 'ADMIN') router.push('/admin');
            else if (userData.user.role === 'HOSPITAL') router.push('/hospital/dashboard');
            else if (userData.user.role === 'INSURANCE') router.push('/insurance/dashboard');
            else if (userData.user.role === 'MANUFACTURER') router.push('/manufacturer/dashboard');
            else if (userData.user.role === 'DOCTOR') router.push('/doctor/dashboard');
            else if (userData.user.role === 'RETAILER') router.push('/retailer/dashboard');
            else router.push('/');
        }
    };

    return (
        <>
            <Navbar cartCount={0} openCart={() => { }} />
            <div style={{ maxWidth: '400px', margin: '120px auto', padding: '40px', background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
                <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Login</h2>
                {error && <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary full-width">Login</button>
                </form>
                <div style={{ marginTop: '15px', textAlign: 'center' }}>
                    <Link href="/forgot-password" style={{ color: '#666', fontSize: '0.85rem', textDecoration: 'underline' }}>Forgot Password?</Link>
                </div>
                <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
                    Don't have an account? <Link href="/signup" style={{ color: 'var(--primary)' }}>Sign up</Link>
                </p>
                <div style={{ marginTop: '20px', textAlign: 'center', padding: '15px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                    <p style={{ fontSize: '0.95rem', color: '#166534', fontWeight: 'bold', margin: '0 0 10px 0' }}>Earn on your own schedule!</p>
                    <Link href="/agent/register" className="btn" style={{ background: '#1B5E20', color: 'white', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block' }}>
                        <i className="fa-solid fa-motorcycle" style={{ marginRight: '8px' }}></i>
                        Join Our Delivery Fleet
                    </Link>
                </div>
            </div>
        </>
    );
}
