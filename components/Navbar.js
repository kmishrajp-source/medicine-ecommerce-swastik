"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

import { useSession, signOut } from "next-auth/react";

export default function Navbar({ cartCount, openCart }) {
    const { data: session } = useSession() || {};

    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    return (
        <header className="glass-header">
            <div className="container header-content">
                <div className="logo">
                    <i className="fa-solid fa-heart-pulse"></i> Swastik <strong>Medicare</strong>
                </div>
                <nav className="nav">
                    <ul>
                        <li><Link href="/" className="active">Home</Link></li>
                        <li><Link href="/shop">Shop</Link></li>
                        <li><Link href="/shop/ayurvedic" style={{ color: '#10B981' }}>Ayurveda</Link></li>
                        <li><Link href="/doctors">Doctors</Link></li>
                        <li><Link href="/ambulance" style={{ color: '#DC2626' }}>Ambulance</Link></li>
                        <li><Link href="/labs">Lab Tests</Link></li>
                        <li><Link href="/advertise" style={{ color: '#6366F1', fontWeight: 'bold' }}>Advertise</Link></li>
                        {session?.user?.role === 'ADMIN' && (
                            <>
                                <li><Link href="/admin">Admin</Link></li>
                                <li><Link href="/admin/inventory">Inventory</Link></li>
                            </>
                        )}
                        {session?.user?.role === 'DELIVERY' && (
                            <li><Link href="/agent/dashboard" style={{ color: '#F59E0B', fontWeight: 'bold' }}>Agent Dashboard</Link></li>
                        )}
                    </ul>
                </nav>
                <div className="header-actions">
                    <div className="search-bar">
                        <i className="fa-solid fa-search"></i>
                        <input type="text" placeholder="Search medicines..." />
                    </div>
                    <button className="icon-btn cart-btn" onClick={openCart}>
                        <i className="fa-solid fa-shopping-cart"></i>
                        <span className="badge">{cartCount}</span>
                    </button>
                    {session ? (
                        <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{session.user.name}</span>
                            <button onClick={() => signOut()} className="btn-small" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>Logout</button>
                        </div>
                    ) : (
                        <Link href="/login" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Login</Link>
                    )}

                    {deferredPrompt && (
                        <button onClick={handleInstallClick} className="btn" style={{ marginLeft: '10px', padding: '8px 12px', fontSize: '0.8rem', fontWeight: 600, background: '#0D8ABC', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <i className="fa-solid fa-download"></i> Install App
                        </button>
                    )}

                    <Link href="/partner" className="btn glass" style={{ marginLeft: '10px', padding: '8px 12px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                        Partner Portal
                    </Link>
                </div>
            </div>
        </header>
    );
}
