"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import DirectoryCard from "@/components/DirectoryCard";
import SLNBookingModal from "@/components/SLNBookingModal";
import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics";

export default function AmbulanceDirectoryPage() {
    const { cartCount, toggleCart } = useCart();
    const [ambulances, setAmbulances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSOS, setShowSOS] = useState(false);
    const [selectedAmbulance, setSelectedAmbulance] = useState(null);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    useEffect(() => {
        // Trigger seeding if directory is empty
        fetch('/api/seed/labs-ambulance').catch(() => {});
        fetchAmbulances();
        // Track Funnel: Landing
        trackEvent("funnel_ambulance_step_landing", { path: "/ambulance" });
    }, []);

    // Emergency Keyword Interceptor
    useEffect(() => {
        const criticalKeywords = ['emergency', 'sos', 'accident', 'serious', 'urgent', 'now', 'quickly'];
        const query = searchQuery.toLowerCase();
        if (criticalKeywords.some(k => query.includes(k))) {
            setShowSOS(true);
            trackEvent(ANALYTICS_EVENTS.SOS, { query, page: 'ambulance' });
        } else {
            setShowSOS(false);
        }
    }, [searchQuery]);

    const fetchAmbulances = async () => {
        try {
            const res = await fetch('/api/ambulance');
            const data = await res.json();
            if (data.success) setAmbulances(data.ambulances);
        } catch (error) {
            console.error("Failed to fetch ambulances", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = (ambulance) => {
        setSelectedAmbulance(ambulance);
        setIsBookingOpen(true);
    };

    const filteredAmbulances = ambulances.filter(amb => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (amb.driverName || "").toLowerCase().includes(query) || 
                            (amb.vehicleType || "").toLowerCase().includes(query) ||
                            (amb.vehicleNumber || "").toLowerCase().includes(query);
        return matchesSearch;
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            
            <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <div className="inline-block bg-rose-100 text-rose-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                            Emergency Directory
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 mb-2">24/7 Ambulance Services in Gorakhpur</h1>
                        <p className="text-slate-500 font-medium">Quick response emergency transport, ICU ambulances, and basic life support near you.</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 max-w-sm">
                         <div className="w-12 h-12 bg-rose-600 text-white rounded-xl flex items-center justify-center shadow-lg"><i className="fa-solid fa-truck-medical"></i></div>
                         <div>
                            <p className="text-xs font-black text-slate-900 mb-1">Ambulance Owner?</p>
                            <a href="/partner" className="text-[10px] font-black text-rose-600 uppercase tracking-widest hover:underline">Register vehicle here →</a>
                         </div>
                    </div>
                </div>
                <div className="mb-12">
                    <div className="relative group">
                        <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors"></i>
                        <input 
                            type="text" 
                            placeholder="Search by vehicle type (ICU, Basic) or driver name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-6 pl-16 bg-white border-2 border-slate-100 rounded-[2rem] font-bold text-slate-900 focus:ring-4 focus:ring-rose-50 focus:border-rose-200 transition-all outline-none shadow-sm"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center"><i className="fa-solid fa-spinner fa-spin text-2xl text-slate-300"></i></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredAmbulances.map(ambulance => (
                            <DirectoryCard 
                                key={ambulance.id} 
                                item={ambulance} 
                                type="ambulance" 
                                onBook={handleBook}
                            />
                        ))}
                        {filteredAmbulances.length === 0 && (
                            <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm px-6">
                                <i className="fa-solid fa-truck-slash text-4xl text-slate-200 mb-6"></i>
                                <p className="text-xl font-black text-slate-400 mb-4">No ambulances match your search. Call Dispatch for manual assignment.</p>
                                <a href="tel:+917992122974" className="text-rose-600 font-bold hover:underline">Call Emergency Dispatch</a>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <SLNBookingModal 
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                targetItem={selectedAmbulance}
                serviceType="ambulance"
            />

            {/* Emergency SOS Overlay */}
            {showSOS && (
                <div className="fixed inset-0 z-[100] bg-rose-600/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
                    <div className="max-w-md w-full bg-white rounded-[3rem] p-10 text-center shadow-2xl relative">
                        <div className="w-24 h-24 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center text-4xl mb-8 mx-auto animate-bounce">
                            <i className="fa-solid fa-phone-volume"></i>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4 leading-tight">Critical SOS</h2>
                        <p className="text-slate-500 font-bold mb-10 leading-relaxed">Emergency detected. Our dispatch team is on standby to help you instantly.</p>
                        
                        <div className="space-y-4">
                            <a 
                                href="tel:+917992122974" 
                                onClick={() => trackEvent(ANALYTICS_EVENTS.CONTACT, { method: "emergency_call_direct", query: searchQuery })}
                                className="block w-full bg-rose-600 text-white font-black py-6 rounded-2xl text-lg shadow-xl shadow-rose-200"
                            >
                                <i className="fa-solid fa-phone-volume mr-3"></i> Call Dispatch Now
                            </a>
                            <button onClick={() => setShowSOS(false)} className="text-slate-400 font-bold text-sm hover:underline uppercase tracking-widest">Wait, show me results first</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
