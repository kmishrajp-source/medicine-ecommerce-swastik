"use client";
import { Link, useRouter } from "@/i18n/navigation";
import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';

import { useSession, signOut } from "next-auth/react";
import LanguageSwitcher from "./LanguageSwitcher";
import MiniHeader from "./MiniHeader";

export default function Navbar({ cartCount, openCart }) {
    const { data: session } = useSession() || {};
    const t = useTranslations('Navigation');
    const tHome = useTranslations('Homepage');
    const tProduct = useTranslations('Product');
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
        <header className="glass-header" style={{ padding: 0, position: 'fixed', top: 0, width: '100%', zIndex: 1000, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <MiniHeader />
            
            {/* ROW 2: PRIMARY SERVICES */}
            <div className="bg-white border-b border-gray-100">
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px' }}>
                    <div className="logo" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fa-solid fa-heart-pulse text-blue-600"></i> Swastik <strong>Medicare</strong>
                    </div>
                    <nav className="nav">
                        <ul style={{ display: 'flex', gap: '20px', listStyle: 'none', margin: 0, padding: 0, fontSize: '0.85rem', fontWeight: 700 }}>
                            <li><Link href="/" className="hover:text-blue-600 transition-colors">{t('home')}</Link></li>
                            <li><Link href="/refer" className="hover:text-blue-600 transition-colors">{t('refer_earn')}</Link></li>
                            <li><Link href="/doctors" className="hover:text-blue-600 transition-colors">{t('doctor_consult')}</Link></li>
                            <li><Link href="/hospitals" className="hover:text-blue-600 transition-colors">Hospitals</Link></li>
                            <li><Link href="/retailers" className="hover:text-blue-600 transition-colors">Chemists</Link></li>
                            <li><Link href="/ambulance" style={{ color: '#ef4444' }}>{t('ambulance')}</Link></li>
                            <li><Link href="/labs" className="hover:text-blue-600 transition-colors">{t('labs')}</Link></li>
                            <li><Link href="/ai-assistant" style={{ color: '#3b82f6' }}>{t('ai_assistant')}</Link></li>
                            {session?.user?.role === 'ADMIN' && (
                                <>
                                    <li><Link href="/admin/leads" style={{ color: '#4338ca' }}>Leads</Link></li>
                                    <li><Link href="/admin" style={{ color: '#7C3AED' }}>Admin</Link></li>
                                </>
                            )}
                            {(session?.user?.role === 'AGENT' || session?.user?.role === 'DELIVERY') && (
                                <li><Link href="/agent/dashboard" style={{ color: '#f59e0b' }}>Dashboard</Link></li>
                            )}
                        </ul>
                    </nav>
                </div>
            </div>

            {/* ROW 3: AI TOOLS & SEARCH & ACTIONS */}
            <div className="bg-slate-50/80 backdrop-blur-md">
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px', gap: '20px' }}>
                    <nav className="ai-tools-nav">
                        <ul style={{ display: 'flex', gap: '15px', listStyle: 'none', margin: 0, padding: 0, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <li><Link href="/symptom-checker" style={{ color: '#2563eb' }}><i className="fa-solid fa-stethoscope mr-1"></i> {t('symptom_checker')}</Link></li>
                            <li><Link href="/prescription-analyzer" style={{ color: '#059669' }}><i className="fa-solid fa-file-medical mr-1"></i> {t('rx_analyzer')}</Link></li>
                            <li><Link href="/drug-interaction-checker" style={{ color: '#d97706' }}><i className="fa-solid fa-capsules mr-1"></i> {t('interaction_checker')}</Link></li>
                            <li><Link href="/support" style={{ color: '#6366f1' }}><i className="fa-solid fa-headset mr-1"></i> {t('support')}</Link></li>
                        </ul>
                    </nav>

                    <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1, justifyContent: 'flex-end' }}>
                        <div className="search-bar" style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                            <i className="fa-solid fa-search" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.9rem' }}></i>
                            <input 
                                type="text" 
                                placeholder="Search Doctors, Medicines, Labs..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ width: '100%', padding: '10px 15px 10px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.85rem', outline: 'none', transition: 'box-shadow 0.2s' }}
                            />
                            
                            {/* Autocomplete Dropdown */}
                            {searchQuery.length > 1 && (
                                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 2000, marginTop: '10px', border: '1px solid #e2e8f0', maxHeight: '350px', overflowY: 'auto' }}>
                                    {isSearching ? (
                                        <div style={{ padding: '15px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                                            <i className="fa-solid fa-circle-notch fa-spin"></i> {tHome('searching')}
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {searchResults.map((item) => (
                                                <li key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <button 
                                                        onClick={() => { router.push(`/medicine/${item.id}`); setSearchQuery(""); }}
                                                        style={{ width: '100%', textAlign: 'left', padding: '12px 15px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
                                                    >
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                            {item.imageUrl ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <i className="fa-solid fa-pills text-slate-400"></i>}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem' }}>{item.name}</span>
                                                                <span style={{ fontWeight: 800, color: '#059669', fontSize: '0.85rem' }}>₹{item.price}</span>
                                                            </div>
                                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.brand || item.manufacturer}</div>
                                                        </div>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div style={{ padding: '15px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>{tHome('no_medicines_found')}</div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors" onClick={openCart}>
                                <i className="fa-solid fa-cart-shopping text-xl"></i>
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">{cartCount}</span>
                            </button>

                            {session ? (
                                <div className="flex items-center gap-2">
                                    <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100 font-bold text-xs hover:bg-blue-600 hover:text-white transition-all">
                                        <i className="fa-solid fa-user-circle"></i> {session.user.name.split(' ')[0]}
                                    </Link>
                                    <button onClick={() => signOut()} className="p-2 text-slate-400 hover:text-red-500"><i className="fa-solid fa-power-off"></i></button>
                                </div>
                            ) : (
                                <Link href="/login" className="px-5 py-2 text-slate-500 font-black text-xs hover:text-indigo-600 transition-all uppercase tracking-wider">
                                    {t('login')}
                                </Link>
                            )}
                            
                            <Link href="/join" className="px-6 py-2.5 bg-indigo-600 text-white rounded-full font-black text-[10px] shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest whitespace-nowrap">
                                <i className="fa-solid fa-rocket mr-2"></i> Join as Partner
                            </Link>
                            
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>
            </div>
        </header >
    );
}
