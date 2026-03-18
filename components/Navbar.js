"use client";
import { Link, useRouter } from "@/i18n/navigation";
import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';

import { useSession, signOut } from "next-auth/react";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar({ cartCount, openCart }) {
    const { data: session } = useSession() || {};
    const t = useTranslations('Navigation');
    const tHome = useTranslations('Homepage');
    const router = useRouter();

    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

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

    // Smart Autocomplete Logic
    useEffect(() => {
        const fetchResults = async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                if (data.success) {
                    setSearchResults(data.results);
                }
            } catch (error) {
                console.error("Autocomplete failed:", error);
            }
            setIsSearching(false);
        };

        const timeoutId = setTimeout(fetchResults, 300); // 300ms debounce
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    return (
        <header className="glass-header">
            <div className="container header-content">
                <div className="logo">
                    <i className="fa-solid fa-heart-pulse"></i> Swastik <strong>Medicare</strong>
                </div>
                <nav className="nav">
                    <ul>
                        <li><Link href="/">{t('home')}</Link></li>
                        <li><Link href="/refer">{t('refer_earn')}</Link></li>
                        <li><Link href="/doctors">{t('doctor_consult')}</Link></li>
                        <li><Link href="/ambulance" style={{ color: '#DC2626' }}>{t('ambulance')}</Link></li>
                        <li><Link href="/labs">{t('labs')}</Link></li>
                        <li><Link href="/ai-assistant" style={{ color: '#3B82F6', fontWeight: 'bold' }}>{t('ai_assistant')}</Link></li>
                        <li><Link href="/symptom-checker" style={{ color: '#2563EB', fontWeight: 'bold' }}>{t('symptom_checker')}</Link></li>
                        <li><Link href="/prescription-analyzer" style={{ color: '#059669', fontWeight: 'bold' }}>{t('rx_analyzer')}</Link></li>
                        <li><Link href="/drug-interaction-checker" style={{ color: '#D97706', fontWeight: 'bold' }}>{t('interaction_checker')}</Link></li>
                        <li><Link href="/admin" style={{ color: '#7C3AED', fontWeight: 'bold' }}>{t('admin_panel')}</Link></li>
                        <li><Link href="/admin/inventory">{t('inventory')}</Link></li>
                        <li><Link href="/support" style={{ color: '#2563eb', fontWeight: 'bold' }}>{t('support')}</Link></li>
                        {session?.user?.role === 'DELIVERY' && (
                            <li><Link href="/agent/dashboard" style={{ color: '#F59E0B', fontWeight: 'bold' }}>{t('delivery_agent')}</Link></li>
                        )}
                    </ul>
                </nav>
                <div className="header-actions">
                    <div className="search-bar" style={{ position: 'relative' }}>
                        <i className="fa-solid fa-search"></i>
                        <input 
                            type="text" 
                            placeholder={tHome('search_placeholder')} 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        
                        {/* Autocomplete Dropdown */}
                        {searchQuery.length > 1 && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                background: 'white',
                                borderRadius: '8px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                zIndex: 50,
                                marginTop: '8px',
                                border: '1px solid #e5e7eb',
                                maxHeight: '400px',
                                overflowY: 'auto'
                            }}>
                                {isSearching ? (
                                    <div style={{ padding: '15px', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
                                        <i className="fa-solid fa-circle-notch fa-spin"></i> {tHome('searching')}
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {searchResults.map((item) => (
                                            <li key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <button 
                                                    onClick={() => {
                                                        router.push(`/medicine/${item.id}`);
                                                        setSearchQuery("");
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        textAlign: 'left',
                                                        padding: '12px 15px',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                        {item.imageUrl ? (
                                                            <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <i className="fa-solid fa-pills" style={{ color: '#9ca3af' }}></i>
                                                        )}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.95rem' }}>
                                                                {item.name}
                                                            </span>
                                                            <span style={{ fontWeight: 'bold', color: '#059669', fontSize: '0.95rem' }}>
                                                                ₹{item.price}
                                                            </span>
                                                        </div>
                                                        {(item.salt || item.brand) && (
                                                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px', display: 'flex', gap: '8px' }}>
                                                                {item.brand && <span>Brand: {item.brand}</span>}
                                                                {item.salt && <span>Salt: {item.salt.substring(0, 30)}{item.salt.length > 30 ? '...' : ''}</span>}
                                                            </div>
                                                        )}
                                                        {item.isRecommended && (
                                                            <span style={{ display: 'inline-block', marginTop: '4px', background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                                                <i className="fa-solid fa-star"></i> Swastik Recommended
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div style={{ padding: '15px', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
                                        {tHome('no_medicines_found')}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <button className="icon-btn cart-btn" onClick={openCart}>
                        <i className="fa-solid fa-shopping-cart"></i>
                        <span className="badge">{cartCount}</span>
                    </button>
                    {session ? (
                        <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{session.user.name}</span>
                            <Link href="/profile" className="btn-small" style={{ fontSize: '0.8rem', padding: '4px 8px', background: '#e0e7ff', color: '#4338ca', border: '1px solid #6366f1', textDecoration: 'none' }} title={t('profile')}>
                                <i className="fa-solid fa-user"></i> {t('profile')}
                            </Link>
                            <Link href="/my-prescriptions" className="btn-small" style={{ fontSize: '0.8rem', padding: '4px 8px', background: '#f5f3ff', color: '#7c3aed', border: '1px solid #c084fc', textDecoration: 'none' }} title={t('my_rx')}>
                                <i className="fa-solid fa-file-prescription"></i> {t('my_rx')}
                            </Link>
                            <Link href="/wallet" className="btn-small" style={{ fontSize: '0.8rem', padding: '4px 8px', background: '#ecfdf5', color: '#047857', border: '1px solid #10b981', textDecoration: 'none' }} title={t('wallet', { balance: "0" })}>
                                <i className="fa-solid fa-wallet"></i> {t('wallet', { balance: "0" })}
                            </Link>
                            <Link href="/partner-growth" className="btn-small" style={{ fontSize: '0.8rem', padding: '4px 8px', background: '#fef3c7', color: '#d97706', border: '1px solid #f59e0b', textDecoration: 'none' }} title={t('growth_partner')}>
                                <i className="fa-solid fa-chart-line"></i> {t('growth_partner')}
                            </Link>
                            <button onClick={() => signOut()} className="btn-small" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>{t('logout')}</button>
                        </div>
                    ) : (
                        <Link href="/login" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>{t('login')}</Link>
                    )}

                    {deferredPrompt && (
                        <button onClick={handleInstallClick} className="btn" style={{ marginLeft: '10px', padding: '8px 12px', fontSize: '0.8rem', fontWeight: 600, background: '#0D8ABC', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <i className="fa-solid fa-download"></i> {t('install_app')}
                        </button>
                    )}

                    <Link href="/partner" className="btn glass" style={{ marginLeft: '10px', padding: '8px 12px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                        {t('growth_partner')}
                    </Link>

                    {/* Next-Intl Language Translator Switch */}
                    <LanguageSwitcher />
                </div>
            </div>
        </header >
    );
}
