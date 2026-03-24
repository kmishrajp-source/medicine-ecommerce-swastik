"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import DirectoryCard from "@/components/DirectoryCard";
import SLNBookingModal from "@/components/SLNBookingModal";

export default function RetailersPage() {
    const { cartCount, toggleCart } = useCart();
    const [retailers, setRetailers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRetailer, setSelectedRetailer] = useState(null);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    useEffect(() => {
        fetchRetailers();
        // Capture Referral Publisher ID
        const urlParams = new URLSearchParams(window.location.search);
        const pubId = urlParams.get('pubId');
        if (pubId) localStorage.setItem('sln_publisher_id', pubId);
    }, []);

    const fetchRetailers = async () => {
        try {
            const res = await fetch('/api/retailers');
            const data = await res.json();
            if (data.success) setRetailers(data.retailers);
        } catch (error) {
            console.error("Failed to fetch retailers", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = (retailer) => {
        setSelectedRetailer(retailer);
        setIsBookingOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            
            <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <div className="inline-block bg-green-100 text-green-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                            Medicine Directory
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 mb-2">Chemists & Retailers in Gorakhpur</h1>
                        <p className="text-slate-500 font-medium font-medium">Find reliable local pharmacies and medical stores across Gorakhpur.</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 max-w-sm">
                         <div className="w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center shadow-lg"><i className="fa-solid fa-store"></i></div>
                         <div>
                            <p className="text-xs font-black text-slate-900 mb-1">Are you a Retailer?</p>
                            <a href="/partner" className="text-[10px] font-black text-green-600 uppercase tracking-widest hover:underline">Register store here →</a>
                         </div>
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center"><i className="fa-solid fa-spinner fa-spin text-2xl text-slate-300"></i></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {retailers.map(retailer => (
                            <DirectoryCard 
                                key={retailer.id} 
                                item={retailer} 
                                type="retailer" 
                                onBook={handleBook}
                            />
                        ))}
                        {retailers.length === 0 && (
                            <div className="col-span-full py-20 text-center font-bold text-slate-400">
                                No retailers found in Gorakhpur yet.
                            </div>
                        )}
                    </div>
                )}
            </main>

            <SLNBookingModal 
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                targetItem={selectedRetailer}
                serviceType="retailer"
            />
        </div>
    );
}
