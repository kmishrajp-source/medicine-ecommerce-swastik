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
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCity, setSelectedCity] = useState("All");

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

    const cities = ["All", ...new Set(retailers.map(r => r.city).filter(Boolean))];

    const filteredRetailers = retailers.filter(r => {
        const matchesCity = selectedCity === "All" || (r.city && r.city.toLowerCase() === selectedCity.toLowerCase());
        const matchesSearch = !searchQuery || 
            (r.shopName && r.shopName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (r.address && r.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (r.city && r.city.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCity && matchesSearch;
    });

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
                        Generic Medicine Retailers & PMBJP Kendras
                    </h1>
                    <p className="text-lg text-emerald-100 font-medium max-w-2xl mx-auto leading-relaxed">
                        Connect directly with verified PMBJP Kendras and Generic Medicine Stores. Save up to 80% on high-quality Jan Aushadhi and generic healthcare.
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-16">
                {/* Search & Filter Bar */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 mb-12 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-1/2">
                        <i className="fa-solid fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input 
                            type="text" 
                            placeholder="Search store name, area, or city..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 rounded-full border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium text-sm"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 whitespace-nowrap">City:</span>
                        {cities.map(city => (
                            <button
                                key={city}
                                onClick={() => setSelectedCity(city)}
                                className={`px-4 py-2 rounded-full text-xs font-black transition-all whitespace-nowrap ${selectedCity === city ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Verified Generic Stores</h2>
                        <p className="text-slate-500 font-medium">Showing {filteredRetailers.length} of {retailers.length} stores in the network.</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 flex items-center gap-4 max-w-sm">
                         <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                             <i className="fa-solid fa-store"></i>
                         </div>
                         <div>
                            <p className="text-xs font-black text-slate-900 mb-1">Are you a Generic Store?</p>
                            <a href="/distributor/register" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">Register on platform →</a>
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
                        {filteredRetailers.map(retailer => (
                            <GenericRetailerCard 
                                key={retailer.id} 
                                retailer={retailer} 
                            />
                        ))}
                        
                        {filteredRetailers.length === 0 && (
                            <div className="col-span-full py-20 bg-white rounded-3xl border border-slate-200 text-center shadow-sm">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i className="fa-solid fa-shop-slash text-3xl text-slate-300"></i>
                                </div>
                                <h3 className="text-xl font-bold text-slate-700 mb-2">No Stores Found</h3>
                                <p className="text-slate-500 max-w-md mx-auto">No generic medicine stores matched your search criteria. Try clearing search filters.</p>
                                <button 
                                    onClick={() => { setSearchQuery(""); setSelectedCity("All"); }}
                                    className="mt-4 px-6 py-2.5 bg-emerald-600 text-white rounded-full text-xs font-bold uppercase tracking-wider"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
