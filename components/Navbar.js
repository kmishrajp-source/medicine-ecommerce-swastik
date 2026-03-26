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
            
            {/* MAIN NAVBAR ROW: Logo, Search, Primary Actions */}
            <div className="bg-white border-b border-gray-50">
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px', gap: '20px' }}>
                    {/* Brand Logo */}
                    <Link href="/" className="logo" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 'fit-content' }}>
                        <i className="fa-solid fa-heart-pulse text-blue-600"></i> Swastik<span className="hidden sm:inline">Medicare</span>
                    </Link>

                    {/* Compact Search Bar */}
                    <div className="search-bar" style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
                        <i className="fa-solid fa-search" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.8rem' }}></i>
                        <input 
                            type="text" 
                            placeholder="Search symptoms, medicines, doctors..." 
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={openCart} className="p-2 text-slate-600 hover:text-blue-600 relative">
                            <i className="fa-solid fa-cart-shopping"></i>
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cartCount}</span>
                        </button>
                        {session ? (
                             <Link href="/profile" className="hidden border border-blue-100 md:flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-bold text-[11px]">
                                <i className="fa-solid fa-user-circle"></i> {session.user.name.split(' ')[0]}
                             </Link>
                        ) : (
                             <Link href="/login" className="hidden md:block text-xs font-bold text-slate-500 hover:text-blue-600 uppercase tracking-tighter">Login</Link>
                        )}
                        <Link href="/join" className="px-4 py-2 bg-indigo-600 text-white rounded-full font-bold text-[10px] uppercase tracking-wider whitespace-nowrap hidden lg:block">Join Partner</Link>
                        <LanguageSwitcher />
                    </div>
                </div>
            </div>

            {/* SECONDARY ROW: Services & Utilities (Desktop Only) */}
            <nav className="hidden md:block bg-indigo-900 text-white/90">
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 20px', overflowX: 'auto' }}>
                    <ul style={{ display: 'flex', gap: '24px', listStyle: 'none', margin: 0, padding: 0, fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        <li><Link href="/" className="hover:text-white transition-colors">{t('home')}</Link></li>
                        <li><Link href="/shop" className="hover:text-emerald-400 transition-colors font-bold text-emerald-300">Shop Medicines</Link></li>
                        <li><Link href="/upload-prescription" className="hover:text-indigo-300 transition-colors font-bold text-indigo-300">Upload Rx</Link></li>
                        <li><Link href="/doctors" className="hover:text-white transition-colors">{t('doctor_consult')}</Link></li>
                        <li><Link href="/hospitals" className="hover:text-white transition-colors">Hospitals</Link></li>
                        <li><Link href="/retailers" className="hover:text-white transition-colors">Chemists</Link></li>
                        <li><Link href="/ambulance" className="text-red-300 hover:text-red-100 transition-colors font-bold">Ambulance</Link></li>
                        <li><Link href="/labs" className="hover:text-white transition-colors">{t('labs')}</Link></li>
                        <li><Link href="/ai-assistant" className="text-blue-300 hover:text-blue-100 transition-colors font-bold"><i className="fa-solid fa-sparkles mr-1"></i>AI Guide</Link></li>
                        <li className="opacity-40">|</li>
                        <li><Link href="/symptom-checker" className="hover:text-white opacity-80 transition-opacity">Symptom Search</Link></li>
                        <li><Link href="/prescription-analyzer" className="hover:text-white opacity-80 transition-opacity">Rx Analyzer</Link></li>
                        <li><Link href="/blog" className="hover:text-orange-300 transition-colors">Health Blogs</Link></li>
                    </ul>
                </div>
            </nav>
        </header >
    );

}
