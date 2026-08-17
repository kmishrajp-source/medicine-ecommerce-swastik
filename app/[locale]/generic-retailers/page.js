"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import GenericRetailerCard from "@/components/GenericRetailerCard";
import Footer from "@/components/Footer";

export default function GenericRetailersDirectoryPage() {
    const { cartCount, toggleCart } = useCart();
    const [retailers, setRetailers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGenericRetailers();
    }, []);

    const fetchGenericRetailers = async () => {
        try {
            const res = await fetch('/api/generic-retailers');
            const data = await res.json();
            if (data.success) {
                setRetailers(data.retailers);
            }
        } catch (error) {
            console.error("Failed to fetch generic retailers", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            
            {/* Hero Section */}
            <div className="bg-emerald-700 pt-32 pb-20 px-6 text-center text-white">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-block bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-6">
                        <i className="fa-solid fa-leaf mr-2"></i> Swastik Platform Mediator
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-tight">
                        Generic Medicine Retailers
                    </h1>
                    <p className="text-lg text-emerald-100 font-medium max-w-2xl mx-auto leading-relaxed">
                        Connect directly with verified PMBJP Kendras and Generic Medicine Stores. Swastik acts as a technology mediator, allowing you to order directly from the stores for maximum savings.
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-16">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Verified Generic Stores</h2>
                        <p className="text-slate-500 font-medium">Found {retailers.length} stores in the network.</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 flex items-center gap-4 max-w-sm">
                         <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                             <i className="fa-solid fa-store"></i>
                         </div>
                         <div>
                            <p className="text-xs font-black text-slate-900 mb-1">Are you a Generic Store?</p>
                            <a href="/partner" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">Register on platform →</a>
                         </div>
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center flex flex-col items-center">
                        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-emerald-500 mb-4"></i>
                        <p className="text-slate-500 font-bold">Loading generic stores...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {retailers.map(retailer => (
                            <GenericRetailerCard 
                                key={retailer.id} 
                                retailer={retailer} 
                            />
                        ))}
                        
                        {retailers.length === 0 && (
                            <div className="col-span-full py-20 bg-white rounded-3xl border border-slate-200 text-center shadow-sm">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i className="fa-solid fa-shop-slash text-3xl text-slate-300"></i>
                                </div>
                                <h3 className="text-xl font-bold text-slate-700 mb-2">No Generic Retailers Found</h3>
                                <p className="text-slate-500 max-w-md mx-auto">We are currently onboarding PMBJP Kendras and Generic Retailers in this area. Please check back later.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
