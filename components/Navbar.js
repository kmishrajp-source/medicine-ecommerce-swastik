"use client";
import Link from "next/link";
import { useState } from "react";

import { useSession, signOut } from "next-auth/react";

export default function Navbar({ cartCount, openCart }) {
    const { data: session } = useSession() || {};

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
                        {session?.user?.role === 'ADMIN' && <li><Link href="/admin">Admin</Link></li>}
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
                </div>
            </div>
        </header>
    );
}
