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
            <style jsx global>{`
                @keyframes premiumShine {
                    0% { filter: brightness(1) drop-shadow(0 0 0px transparent); }
                    50% { filter: brightness(1.4) drop-shadow(0 0 6px rgba(255,255,255,0.6)); transform: scale(1.02); }
                    100% { filter: brightness(1) drop-shadow(0 0 0px transparent); }
                }
                .nav-shining-link li {
                    animation: premiumShine 3s infinite ease-in-out;
                }
                .nav-shining-link li:nth-child(odd) {
                    animation-delay: 1.5s;
                }
            `}</style>
            <MiniHeader />
            
            {/* MAIN NAVBAR ROW: Logo, Search, Primary Actions */}
            <div className="bg-white border-b border-gray-50 w-full">
                <div className="max-w-7xl mx-auto" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px', gap: '20px', width: '100%' }}>
                    {/* Brand Logo */}
                    <Link href="/" className="logo" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px', minWidth: 'fit-content' }}>
                        <i className="fa-solid fa-heart-pulse text-blue-600"></i> Swastik Medicare
                    </Link>

                    {/* Compact Search Bar (Desktop) */}
                    <div className="search-bar hidden md:block" style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
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
                        
                        {/* Search Results Dropdown */}
                        {searchQuery.length > 1 && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 2000, marginTop: '8px', border: '1px solid #e2e8f0', maxHeight: '300px', overflowY: 'auto' }}>
                                {isSearching ? (
                                    <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                                        <i className="fa-solid fa-spinner fa-spin"></i> Searching...
                                    </div>
                                ) : searchResults.length > 0 ? (
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
                                ) : searchQuery.length >= 2 && (
                                    <div className="p-4 text-center text-xs text-slate-400">No results found</div>
                                )}
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
                        {session && (
                            <Link href="/subscriptions" className="hidden lg:flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1.5 rounded-full transition-all uppercase tracking-widest border border-indigo-100">
                                <i className="fa-solid fa-repeat"></i> Subscriptions
                            </Link>
                        )}
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
                        <Link href="/partners" className="px-3 py-1.5 bg-indigo-600 text-white rounded-full font-bold text-[9px] uppercase tracking-wider whitespace-nowrap hidden lg:block">{t('growth_partner')}</Link>
                        <div className="hidden md:block">
                            <LanguageSwitcher />
                        </div>
                        {/* Mobile Toggle */}
                        <button className="md:hidden p-2 text-slate-800" onClick={() => setIsMobileMenuOpen(true)}>
                            <i className="fa-solid fa-bars" style={{ fontSize: '1.2rem' }}></i>
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar Row */}
                <div className="md:hidden px-4 pb-3 w-full">
                    <div className="search-bar" style={{ position: 'relative', width: '100%' }}>
                        <i className="fa-solid fa-search" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.8rem' }}></i>
                        <input 
                            type="text" 
                            placeholder="Try 'fever', 'heart', or 'medicine name'..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '10px 40px 10px 35px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.8.5rem', outline: 'none' }}
                        />
                        <button onClick={() => alert("Listening...")} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#6366f1' }}>
                            <i className="fa-solid fa-microphone"></i>
                        </button>
                        
                        {/* Search Results Dropdown Mobile */}
                        {searchQuery.length > 1 && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 2000, marginTop: '8px', border: '1px solid #e2e8f0', maxHeight: '300px', overflowY: 'auto' }}>
                                {isSearching ? (
                                    <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                                        <i className="fa-solid fa-spinner fa-spin"></i> Searching...
                                    </div>
                                ) : searchResults.length > 0 ? (
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
                                ) : searchQuery.length >= 2 && (
                                    <div className="p-4 text-center text-xs text-slate-400">No results found</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* SECONDARY ROW: Services & Utilities (Desktop Only - Explicitly hidden on smaller screens) */}
            <nav className="hidden lg:block w-full border-b border-indigo-800 shadow-sm" style={{ background: 'linear-gradient(90deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)' }}>
                <div className="max-w-7xl mx-auto" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '12px 20px', overflowX: 'auto', width: '100%' }}>
                    <ul className="nav-shining-link" style={{ display: 'flex', gap: '12px', listStyle: 'none', margin: 0, padding: 0, fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', width: '100%', justifyContent: 'flex-start', flexWrap: 'nowrap', color: 'rgba(255,255,255,0.9)', alignItems: 'center' }}>
                        <li><Link href="/" className="hover:text-white hover:bg-white/10 px-2 py-1.5 rounded-lg transition-all">{t('home')}</Link></li>
                        <li className="relative group cursor-pointer">
                            <span className="hover:text-white hover:bg-white/10 px-2 py-1.5 rounded-lg transition-all flex items-center gap-1">Company <i className="fa-solid fa-chevron-down text-[10px]"></i></span>
                            <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-xl shadow-xl shadow-indigo-900/20 border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden flex flex-col">
                                <div className="px-4 pt-3 pb-2 bg-slate-50 border-b border-slate-100">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">About Us</span>
                                </div>
                                <Link href="/about" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-bullseye w-4 text-slate-400"></i> About Swastik Medicare</Link>
                                <Link href="/company/leadership" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-users w-4 text-slate-400"></i> Leadership Team</Link>
                                <Link href="/company/timeline" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-timeline w-4 text-slate-400"></i> Innovation Timeline</Link>
                                <Link href="/innovation" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-microchip w-4 text-slate-400"></i> Innovation & Technology</Link>
                                <Link href="/company/ai-healthcare" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-robot w-4 text-blue-400"></i> AI Healthcare Platform</Link>
                                <Link href="/digital-health" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-shield-halved w-4 text-indigo-400"></i> Digital Health Mission</Link>
                                <Link href="/company/government" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-building-columns w-4 text-amber-500"></i> Government Recognition</Link>
                                <Link href="/government-partnership" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-handshake w-4 text-emerald-600"></i> Gov Partnerships</Link>
                                <Link href="/rural-health" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-seedling w-4 text-green-500"></i> Rural Digital Health</Link>
                                <div className="px-4 pt-3 pb-2 bg-slate-50 border-b border-slate-100 border-t border-t-slate-100">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enterprise & Revenue</span>
                                </div>
                                <Link href="/prime" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-crown w-4 text-yellow-500"></i> Swastik Prime</Link>
                                <Link href="/corporate" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-building w-4 text-indigo-500"></i> Corporate Wellness</Link>
                                <Link href="/hospital-saas" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-hospital-user w-4 text-sky-500"></i> Hospital SaaS</Link>
                                <Link href="/company/ecosystem" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-network-wired w-4 text-indigo-500"></i> Interactive Ecosystem</Link>
                                <Link href="/programs" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-notes-medical w-4 text-pink-500"></i> Healthcare Programs</Link>
                                <Link href="/company/security" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-lock w-4 text-emerald-500"></i> Patient Data Security</Link>
                                <Link href="/developer/api-portal" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-code w-4 text-indigo-500"></i> Developer API</Link>
                                <Link href="/trust-compliance" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-shield-check w-4 text-slate-400"></i> Trust & Compliance</Link>
                                <Link href="/partners" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-handshake w-4 text-slate-400"></i> Partner Network</Link>
                                <Link href="/investor-relations" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-chart-line w-4 text-indigo-500"></i> Investor Relations</Link>
                                <Link href="/impact" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-globe w-4 text-emerald-500"></i> Social Impact</Link>
                                <Link href="/media" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-newspaper w-4 text-slate-400"></i> News & Media</Link>
                                <Link href="/downloads" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm flex items-center gap-2"><i className="fa-solid fa-cloud-arrow-down w-4 text-blue-500"></i> Download Center</Link>
                            </div>
                        </li>
                        <li className="relative group">
                            <button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white px-3 py-1.5 rounded-lg transition-all font-black shadow-lg shadow-indigo-500/20 uppercase tracking-tighter border border-indigo-400 flex items-center gap-1">
                                <i className="fa-solid fa-shield-halved mr-1"></i> My Health <i className="fa-solid fa-chevron-down text-[10px] ml-1"></i>
                            </button>
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 flex flex-col py-2">
                                <Link href="/my-health-records/abha" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-id-card w-4 text-emerald-500"></i> ABHA Login</Link>
                                <Link href="/my-health-records/timeline" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-timeline w-4 text-blue-500"></i> EHR Timeline</Link>
                                <Link href="/my-health-records/prescriptions" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-file-prescription w-4 text-red-500"></i> Prescriptions</Link>
                                <Link href="/profile/family" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-users w-4 text-indigo-500"></i> Family Profiles</Link>
                                <div className="px-4 pt-3 pb-2 bg-slate-50 border-b border-slate-100 border-t border-t-slate-100">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Information</span>
                                </div>
                                <Link href="/digital-health" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm flex items-center gap-2"><i className="fa-solid fa-circle-info w-4 text-slate-400"></i> What is ABDM?</Link>
                            </div>
                        </li>
                        <li className="relative group">
                            <button className="bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-400 hover:to-fuchsia-500 text-white px-3 py-1.5 rounded-lg transition-all font-black shadow-lg shadow-purple-500/20 uppercase tracking-tighter border border-purple-400 flex items-center gap-1">
                                <i className="fa-solid fa-wand-magic-sparkles mr-1"></i> AI Tools <i className="fa-solid fa-chevron-down text-[10px] ml-1"></i>
                            </button>
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 flex flex-col py-2">
                                <Link href="/upload-prescription" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-purple-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-file-image w-4 text-indigo-500"></i> AI Prescription Reader</Link>
                                <Link href="/symptom-helper" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-purple-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-stethoscope w-4 text-blue-500"></i> AI Symptom Triage</Link>
                                <Link href="/drug-interaction-checker" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-purple-600 font-bold text-sm border-b border-slate-50 flex items-center gap-2"><i className="fa-solid fa-pills w-4 text-emerald-500"></i> Drug Interaction Checker</Link>
                                <Link href="/lab-interpretation" className="px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-purple-600 font-bold text-sm flex items-center gap-2"><i className="fa-solid fa-microscope w-4 text-purple-500"></i> AI Lab Interpreter</Link>
                            </div>
                        </li>
                        <li><Link href="/switch" className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-slate-900 px-3 py-1.5 rounded-lg transition-all font-black shadow-lg shadow-orange-500/20 uppercase tracking-tighter"><i className="fa-solid fa-bolt mr-1"></i> Switch & Save ₹100</Link></li>
                        <li><Link href="/shop-medicines" className="hover:text-emerald-300 hover:bg-emerald-900/40 px-2 py-1.5 rounded-lg transition-all font-bold text-emerald-400">{tHome('shop_medicines')}</Link></li>
                        <li><Link href="/shop-medicines/homeopathy" className="hover:text-cyan-300 hover:bg-cyan-900/40 px-2 py-1.5 rounded-lg transition-all font-bold text-cyan-400"><i className="fa-solid fa-leaf mr-1"></i>Homeopathy</Link></li>
                        <li><Link href="/generic-medicines" className="hover:text-yellow-300 hover:bg-yellow-900/40 px-2 py-1.5 rounded-lg transition-all font-black text-yellow-400"><i className="fa-solid fa-pills mr-1"></i>Generic Meds</Link></li>
                        <li><Link href="/upload-prescription" className="hover:text-indigo-200 hover:bg-indigo-900/50 px-2 py-1.5 rounded-lg transition-all font-bold text-indigo-300">{t('my_rx')}</Link></li>
                        <li><Link href="/refer" className="hover:text-white hover:bg-white/10 px-2 py-1.5 rounded-lg transition-all">{t('refer_earn')}</Link></li>
                        <li><Link href="/doctors" className="hover:text-white hover:bg-white/10 px-2 py-1.5 rounded-lg transition-all">{t('doctor_consult')}</Link></li>
                        <li><Link href="/doctors/homeopathy" className="hover:text-emerald-300 hover:bg-emerald-900/40 px-2 py-1.5 rounded-lg transition-all font-bold text-emerald-300"><i className="fa-solid fa-user-doctor mr-1"></i>Homeopaths</Link></li>
                        <li><Link href="/hospitals" className="hover:text-white hover:bg-white/10 px-2 py-1.5 rounded-lg transition-all">{t('hospitals')}</Link></li>
                        <li><Link href="/retailers" className="hover:text-white hover:bg-white/10 px-2 py-1.5 rounded-lg transition-all">{t('inventory')}</Link></li>
                        <li><Link href="/ambulance" className="text-red-300 hover:text-red-100 hover:bg-red-900/30 px-2 py-1.5 rounded-lg transition-all font-bold">{t('ambulance')}</Link></li>
                        <li><Link href="/labs" className="hover:text-white hover:bg-white/10 px-2 py-1.5 rounded-lg transition-all">{t('labs')}</Link></li>
                        <li><Link href="/ai-assistant" className="text-blue-300 hover:text-blue-100 hover:bg-blue-900/40 px-2 py-1.5 rounded-lg transition-all font-bold">{t('ai_assistant')}</Link></li>
                        <li className="opacity-40 self-center">|</li>
                        <li><Link href="/symptom-checker" className="hover:text-white opacity-90 transition-all flex items-center gap-2 hover:bg-white/10 px-2 py-1.5 rounded-lg"><i className="fa-solid fa-wand-sparkles text-[11px]"></i> {t('symptom_checker')}</Link></li>
                        <li><Link href="/prescription-analyzer" className="hover:text-white opacity-90 transition-all flex items-center gap-2 hover:bg-white/10 px-2 py-1.5 rounded-lg"><i className="fa-solid fa-file-medical text-[11px]"></i> {t('rx_analyzer')}</Link></li>
                        <li><Link href="/drug-interaction-checker" className="hover:text-white opacity-90 transition-all flex items-center gap-2 hover:bg-white/10 px-2 py-1.5 rounded-lg"><i className="fa-solid fa-capsules text-[11px]"></i> {t('interaction_checker')}</Link></li>
                        <li className="opacity-10 md:hidden self-center">|</li>
                        <li><Link href="/support" className="hover:text-white transition-all md:hidden hover:bg-white/10 px-2 py-1.5 rounded-lg">{t('support')}</Link></li>
                        <li><Link href="/top-brands" className="hover:text-orange-300 transition-all hover:bg-orange-900/30 px-2 py-1.5 rounded-lg font-bold">{tHome('top_brands')}</Link></li>
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
                         
                         {/* Mobile Company Menu */}
                         <li style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '10px' }}>Company</div>
                            <div className="flex flex-col pl-4 gap-3 mt-2 border-l border-white/10">
                                <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 text-sm hover:text-white">About Swastik Medicare</Link>
                                <Link href="/innovation" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 text-sm hover:text-white">Innovation & Technology</Link>
                                <Link href="/company/ai-healthcare" onClick={() => setIsMobileMenuOpen(false)} className="text-blue-300 text-sm font-bold hover:text-blue-200"><i className="fa-solid fa-robot mr-1"></i> AI Healthcare Platform</Link>
                                <Link href="/digital-health" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 text-sm hover:text-white">Digital Health Mission</Link>
                                <Link href="/government-partnership" onClick={() => setIsMobileMenuOpen(false)} className="text-amber-300 text-sm font-bold hover:text-amber-200"><i className="fa-solid fa-building-columns mr-1"></i> Gov Partnerships</Link>
                                <Link href="/rural-health" onClick={() => setIsMobileMenuOpen(false)} className="text-green-300 text-sm font-bold hover:text-green-200"><i className="fa-solid fa-seedling mr-1"></i> Rural Health</Link>
                                <Link href="/trust-compliance" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 text-sm hover:text-white">Trust & Compliance</Link>
                                <Link href="/partners" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 text-sm hover:text-white">Partner Network</Link>
                                <Link href="/investor-relations" onClick={() => setIsMobileMenuOpen(false)} className="text-emerald-300 text-sm font-bold hover:text-emerald-200">Investor Relations</Link>
                                <Link href="/impact" onClick={() => setIsMobileMenuOpen(false)} className="text-emerald-300 text-sm hover:text-white">Social Impact</Link>
                                <Link href="/media" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 text-sm hover:text-white">News & Media</Link>
                                <Link href="/downloads" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 text-sm hover:text-white">Download Center</Link>
                                <div className="mt-2 mb-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enterprise & Revenue</span>
                                </div>
                                <Link href="/prime" onClick={() => setIsMobileMenuOpen(false)} className="text-yellow-400 text-sm font-bold hover:text-yellow-300"><i className="fa-solid fa-crown mr-1"></i> Swastik Prime</Link>
                                <Link href="/corporate" onClick={() => setIsMobileMenuOpen(false)} className="text-indigo-400 text-sm font-bold hover:text-indigo-300"><i className="fa-solid fa-building mr-1"></i> Corporate Wellness</Link>
                                <Link href="/hospital-saas" onClick={() => setIsMobileMenuOpen(false)} className="text-sky-400 text-sm font-bold hover:text-sky-300"><i className="fa-solid fa-hospital-user mr-1"></i> Hospital SaaS</Link>
                            </div>
                         </li>

                         <li style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(90deg, #3b82f6 0%, #4f46e5 100%)' }}>
                            <div style={{ color: 'white', fontWeight: '900', marginBottom: '10px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fa-solid fa-shield-halved text-white"></i> My Health Records</div>
                            <div className="flex flex-col pl-6 gap-3 mt-3 border-l border-white/20">
                                <Link href="/my-health-records/abha" onClick={() => setIsMobileMenuOpen(false)} className="text-emerald-300 text-sm font-bold"><i className="fa-solid fa-id-card w-4"></i> ABHA Login</Link>
                                <Link href="/my-health-records/timeline" onClick={() => setIsMobileMenuOpen(false)} className="text-blue-300 text-sm font-bold"><i className="fa-solid fa-timeline w-4"></i> EHR Timeline</Link>
                                <Link href="/my-health-records/prescriptions" onClick={() => setIsMobileMenuOpen(false)} className="text-red-300 text-sm font-bold"><i className="fa-solid fa-file-prescription w-4"></i> Prescriptions</Link>
                                <Link href="/my-health-records/consent" onClick={() => setIsMobileMenuOpen(false)} className="text-amber-300 text-sm font-bold"><i className="fa-solid fa-handshake-angle w-4"></i> Consent Manager</Link>
                                <Link href="/profile/family" onClick={() => setIsMobileMenuOpen(false)} className="text-indigo-300 text-sm font-bold"><i className="fa-solid fa-users w-4"></i> Family Profiles</Link>
                                <Link href="/digital-health" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 text-xs mt-2"><i className="fa-solid fa-circle-info w-4"></i> What is ABDM?</Link>
                            </div>
                         </li>
                         <li style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(90deg, #a855f7 0%, #c026d3 100%)' }}>
                            <div style={{ color: 'white', fontWeight: '900', marginBottom: '10px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fa-solid fa-wand-magic-sparkles text-white"></i> AI Tools</div>
                            <div className="flex flex-col pl-6 gap-3 mt-3 border-l border-white/20">
                                <Link href="/upload-prescription" onClick={() => setIsMobileMenuOpen(false)} className="text-fuchsia-200 text-sm font-bold"><i className="fa-solid fa-file-image w-4"></i> AI Prescription Reader</Link>
                                <Link href="/symptom-helper" onClick={() => setIsMobileMenuOpen(false)} className="text-purple-300 text-sm font-bold"><i className="fa-solid fa-stethoscope w-4"></i> AI Symptom Triage</Link>
                                <Link href="/drug-interaction-checker" onClick={() => setIsMobileMenuOpen(false)} className="text-pink-300 text-sm font-bold"><i className="fa-solid fa-pills w-4"></i> Drug Interactions</Link>
                                <Link href="/lab-interpretation" onClick={() => setIsMobileMenuOpen(false)} className="text-fuchsia-300 text-sm font-bold"><i className="fa-solid fa-microscope w-4"></i> AI Lab Interpreter</Link>
                            </div>
                         </li>
                         <li style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(90deg, #f59e0b 0%, #f97316 100%)' }}><Link href="/switch" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#1e293b', textDecoration: 'none', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}><i className="fa-solid fa-bolt text-white"></i> Switch & Save ₹100</Link></li>
                         <li style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><Link href="/shop-medicines" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#6ee7b7', textDecoration: 'none', fontWeight: 'bold' }}>{tHome('shop_medicines')}</Link></li>
                         <li style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><Link href="/shop-medicines/homeopathy" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#22d3ee', textDecoration: 'none', fontWeight: 'bold' }}><i className="fa-solid fa-leaf mr-2"></i>Homeopathy Shop</Link></li>
                         <li style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><Link href="/generic-medicines" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#fde047', textDecoration: 'none', fontWeight: 'bold' }}>Generic Meds</Link></li>
                         <li style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><Link href="/upload-prescription" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#a5b4fc', textDecoration: 'none', fontWeight: 'bold' }}>{t('my_rx')}</Link></li>
                         {session && (
                             <li style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><Link href="/subscriptions" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#c7d2fe', textDecoration: 'none', fontWeight: 'bold' }}><i className="fa-solid fa-repeat mr-2"></i>Subscriptions</Link></li>
                         )}
                         <li style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><Link href="/doctors" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none' }}>{t('doctor_consult')}</Link></li>
                         <li style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><Link href="/doctors/homeopathy" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#6ee7b7', textDecoration: 'none', fontWeight: 'bold' }}><i className="fa-solid fa-user-doctor mr-2"></i>Homeopathic Doctors</Link></li>
                         <li style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><Link href="/hospitals" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none' }}>{t('hospitals')}</Link></li>
                         <li style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(90deg, #dc2626 0%, #9f1239 100%)' }}><Link href="/emergency-response" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}><i className="fa-solid fa-truck-medical text-white"></i> Emergency Response</Link></li>
                         <li style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><Link href="/ambulance" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#fca5a5', textDecoration: 'none', fontWeight: 'bold' }}>Ambulance Services</Link></li>
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
