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
    const tFooter = useTranslations('Footer');
    const router = useRouter();

    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <header className="glass-header" style={{ display: 'flex', flexDirection: 'column', padding: 0, position: 'fixed', top: 0, width: '100%', zIndex: 1000, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <MiniHeader />
            
            {/* MAIN NAVBAR ROW: Logo, Search, Primary Actions */}
            <div className="bg-white border-b border-gray-50 w-full">
                <div className="max-w-7xl mx-auto" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px', gap: '20px', width: '100%' }}>
                    {/* Brand Logo */}
                    <Link href="/" className="logo" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px', minWidth: 'fit-content' }}>
                        <i className="fa-solid fa-heart-pulse text-blue-600"></i> Swastik Medicare
                    </Link>

                    {/* Compact Search Bar */}
                    <div className="search-bar" style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
                        <i className="fa-solid fa-search" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.8rem' }}></i>
                        <input 
                            type="text" 
                            placeholder="Try 'fever', 'heart', or 'medicine name'..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '8px 40px 8px 35px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.8rem', outline: 'none' }}
                        />
                        <button onClick={() => alert("Listening...")} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#6366f1' }}>
                            <i className="fa-solid fa-microphone"></i>
                        </button>
                        
                        {/* Dropdown results stay as is */}
                        {searchQuery.length > 1 && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 2000, marginTop: '8px', border: '1px solid #e2e8f0', maxHeight: '300px', overflowY: 'auto' }}>
                                {isSearching ? <div className="p-4 text-center text-xs text-slate-400">Searching...</div> : 
                                 searchResults.length > 0 ? (
                                    <ul className="list-none p-0 m-0">
                                        {searchResults.map(item => (
                                            <li key={item.id} className="border-b border-slate-50 last:border-0">
                                                <button onClick={() => { router.push(`/medicine/${item.id}`); setSearchQuery(""); }} className="w-full text-left p-3 hover:bg-slate-50 transition-colors flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center overflow-hidden">
                                                        {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <i className="fa-solid fa-pills text-slate-300"></i>}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                                                            <span>{item.name} {item.isAiSuggested && <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded ml-1">AI</span>}</span>
                                                            <span className="text-emerald-600">₹{item.price}</span>
                                                        </div>
                                                        <div className="text-[10px] text-slate-400">{item.brand || item.manufacturer}</div>
                                                    </div>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                 ) : <div className="p-4 text-center text-xs text-slate-400">No results found</div>}
                            </div>
                        )}
                    </div>

                    {/* Account & Cart Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        <Link href="/support" className="hidden xl:block text-[9px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest">{t('support')}</Link>
                        <button onClick={openCart} className="p-2 text-slate-600 hover:text-blue-600 relative flex items-center gap-1">
                            <span className="text-xs font-bold">{cartCount}</span>
                            <i className="fa-solid fa-cart-shopping"></i>
                        </button>
                        {session ? (
                            <div className="flex items-center gap-2">
                                <Link href="/profile" className="hidden border border-blue-100 md:flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-bold text-[10px]">
                                    <i className="fa-solid fa-user-circle"></i> {session.user.name.split(' ')[0]}
                                </Link>
                                <button onClick={() => signOut()} className="hidden md:block text-[9px] font-bold text-red-500 hover:text-red-700 uppercase tracking-tighter" title={t('logout')}>
                                    <i className="fa-solid fa-power-off"></i>
                                </button>
                            </div>
                        ) : (
                             <Link href="/login" className="hidden md:block text-[10px] font-bold text-slate-500 hover:text-blue-600 uppercase tracking-tighter">{t('login')}</Link>
                        )}
                        <Link href="/partner" className="px-3 py-1.5 bg-indigo-600 text-white rounded-full font-bold text-[9px] uppercase tracking-wider whitespace-nowrap hidden lg:block">{t('growth_partner')}</Link>
                        <div className="hidden md:block">
                            <LanguageSwitcher />
                        </div>
                        {/* Mobile Toggle */}
                        <button className="md:hidden p-2 text-slate-800" onClick={() => setIsMobileMenuOpen(true)}>
                            <i className="fa-solid fa-bars" style={{ fontSize: '1.2rem' }}></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* SECONDARY ROW: Services & Utilities (Desktop Only) */}
            <nav className="hidden md:block bg-indigo-900 text-white/90 w-full">
                <div className="max-w-7xl mx-auto" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 20px', overflowX: 'auto', width: '100%' }}>
                    <ul style={{ display: 'flex', gap: '15px', listStyle: 'none', margin: 0, padding: 0, fontSize: '0.65rem', fontWeight: 600, whiteSpace: 'nowrap', width: '100%', justifyContent: 'center', flexWrap: 'nowrap' }}>
                        <li><Link href="/" className="hover:text-white transition-colors">{t('home')}</Link></li>
                        <li><Link href="/shop-medicines" className="hover:text-emerald-400 transition-colors font-bold text-emerald-300">{tHome('shop_medicines')}</Link></li>
                        <li><Link href="/upload-prescription" className="hover:text-indigo-300 transition-colors font-bold text-indigo-300">{t('my_rx')}</Link></li>
                        <li><Link href="/refer" className="hover:text-white transition-colors">{t('refer_earn')}</Link></li>
                        <li><Link href="/doctors" className="hover:text-white transition-colors">{t('doctor_consult')}</Link></li>
                        <li><Link href="/hospitals" className="hover:text-white transition-colors">{t('hospitals')}</Link></li>
                        <li><Link href="/retailers" className="hover:text-white transition-colors">{t('inventory')}</Link></li>
                        <li><Link href="/ambulance" className="text-red-300 hover:text-red-100 transition-colors font-bold">{t('ambulance')}</Link></li>
                        <li><Link href="/labs" className="hover:text-white transition-colors">{t('labs')}</Link></li>
                        <li><Link href="/ai-assistant" className="text-blue-300 hover:text-blue-100 transition-colors font-bold">{t('ai_assistant')}</Link></li>
                        <li className="opacity-40">|</li>
                        <li><Link href="/symptom-checker" className="hover:text-white opacity-80 transition-opacity flex items-center gap-1"><i className="fa-solid fa-wand-sparkles text-[9px]"></i> {t('symptom_checker')}</Link></li>
                        <li><Link href="/prescription-analyzer" className="hover:text-white opacity-80 transition-opacity flex items-center gap-1"><i className="fa-solid fa-file-medical text-[9px]"></i> {t('rx_analyzer')}</Link></li>
                        <li><Link href="/drug-interaction-checker" className="hover:text-white opacity-80 transition-opacity flex items-center gap-1"><i className="fa-solid fa-capsules text-[9px]"></i> {t('interaction_checker')}</Link></li>
                        <li className="opacity-10 md:hidden">|</li>
                        <li><Link href="/support" className="hover:text-white transition-colors md:hidden">{t('support')}</Link></li>
                        <li><Link href="/blog" className="hover:text-orange-300 transition-colors">{tHome('top_brands')}</Link></li>
                    </ul>
                </div>
            </nav>

            {/* MOBILE MENU TRAY */}
            {isMobileMenuOpen && (
                <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '280px', background: '#1e3a8a', zIndex: 3000, boxShadow: '-5px 0 15px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', color: 'white', overflowY: 'auto', transition: 'transform 0.3s' }}>
                    <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ fontWeight: 'bold' }}>Menu</span>
                        <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                    </div>
                    
                    <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <LanguageSwitcher />
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' }}>
                         <li style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><Link href="/" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none' }}>{t('home')}</Link></li>
                         <li style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><Link href="/shop-medicines" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#6ee7b7', textDecoration: 'none', fontWeight: 'bold' }}>{tHome('shop_medicines')}</Link></li>
                         <li style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><Link href="/upload-prescription" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#a5b4fc', textDecoration: 'none', fontWeight: 'bold' }}>{t('my_rx')}</Link></li>
                         <li style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><Link href="/doctors" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none' }}>{t('doctor_consult')}</Link></li>
                         <li style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><Link href="/hospitals" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none' }}>{t('hospitals')}</Link></li>
                         <li style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><Link href="/ambulance" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#fca5a5', textDecoration: 'none', fontWeight: 'bold' }}>{t('ambulance')}</Link></li>
                         <li style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><Link href="/labs" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none' }}>{t('labs')}</Link></li>
                         <li style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><Link href="/ai-assistant" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 'bold' }}>{t('ai_assistant')}</Link></li>
                         
                         {/* Services */}
                         <li style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Tools</span>
                            <Link href="/symptom-checker" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Symptom Checker</Link>
                            <Link href="/prescription-analyzer" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Rx Analyzer</Link>
                         </li>

                         {!session && (
                             <li style={{ padding: '20px' }}>
                                 <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'block', background: 'white', color: '#1e3a8a', textAlign: 'center', padding: '10px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none' }}>Login / Register</Link>
                             </li>
                         )}
                         {session && (
                             <li style={{ padding: '20px' }}>
                                 <button onClick={() => { signOut(); setIsMobileMenuOpen(false); }} style={{ display: 'block', width: '100%', background: '#ef4444', color: 'white', border: 'none', textAlign: 'center', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Logout</button>
                             </li>
                         )}
                    </ul>
                </div>
            )}
            
            {isMobileMenuOpen && (
                <div onClick={() => setIsMobileMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2999 }}></div>
            )}
        </header >
    );

}
