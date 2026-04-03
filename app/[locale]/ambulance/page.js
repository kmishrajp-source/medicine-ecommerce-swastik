"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import DirectoryCard from "@/components/DirectoryCard";
import SLNBookingModal from "@/components/SLNBookingModal";

export default function AmbulanceDirectoryPage() {
    const { cartCount, toggleCart } = useCart();
    const [ambulances, setAmbulances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAmbulance, setSelectedAmbulance] = useState(null);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    useEffect(() => {
        // Trigger seeding if directory is empty
        fetch('/api/seed/labs-ambulance').catch(() => {});
        fetchAmbulances();
        // Capture Referral Publisher ID
        const urlParams = new URLSearchParams(window.location.search);
        const pubId = urlParams.get('pubId');
        if (pubId) localStorage.setItem('sln_publisher_id', pubId);
    }, []);

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

                {loading ? (
                    <div className="py-20 text-center"><i className="fa-solid fa-spinner fa-spin text-2xl text-slate-300"></i></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {ambulances.map(ambulance => (
                            <DirectoryCard 
                                key={ambulance.id} 
                                item={ambulance} 
                                type="ambulance" 
                                onBook={handleBook}
                            />
                        ))}
                        {ambulances.length === 0 && (
                            <div className="col-span-full py-20 text-center font-bold text-slate-400">
                                No ambulance services found in Gorakhpur yet.
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
        </div>
    );
}
