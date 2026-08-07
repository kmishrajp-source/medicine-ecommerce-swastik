"use client";
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import genericMedicines from "@/data/generic-medicines.json";

export default function GenericMedicineDirectory() {
    const { cartCount, toggleCart } = useCart();
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [visibleCount, setVisibleCount] = useState(12);

    const categories = ["All", ...new Set(genericMedicines.map(m => m.category))];

    const filteredMedicines = genericMedicines.filter(med => {
        const matchesSearch = med.genericName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              med.commonBrand.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              med.useCase.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "All" || med.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const displayedMedicines = filteredMedicines.slice(0, visibleCount);

    const handleOrderWhatsApp = (med) => {
        const message = `Hello Swastik Medicare! I want to order the Generic Medicine: ${med.genericName} (Substitute for ${med.commonBrand}). Please let me know the availability.`;
        window.open(`https://wa.me/919876543210?text=${encodeURIComponent(message)}`, "_blank");
    };

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 12);
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            {/* Hero Section */}
            <div className="bg-emerald-600 pt-32 pb-20 px-6 text-center text-white">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-block bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-6">
                        <i className="fa-solid fa-indian-rupee-sign mr-2"></i> Save up to 90% on PMBJP Medicines
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight leading-tight">
                        Generic Medicine Directory
                    </h1>
                    <p className="text-lg md:text-xl text-emerald-100 font-medium max-w-2xl mx-auto leading-relaxed">
                        Why pay for a brand name? Discover affordable, high-quality generic medicines under the Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) scheme. Same quality, fraction of the price!
                    </p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <i className="fa-solid fa-search"></i>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search by Generic Name, Brand (e.g. Dolo), or Disease..." 
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setVisibleCount(12); // Reset on search
                            }}
                            className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-700"
                        />
                    </div>
                    <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 flex gap-2">
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => {
                                    setCategoryFilter(cat);
                                    setVisibleCount(12); // Reset on filter
                                }}
                                className={`px-5 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${categoryFilter === cat ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Directory Grid */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-slate-800">Showing {displayedMedicines.length} of {filteredMedicines.length} Medicines</h2>
                </div>

                {filteredMedicines.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <i className="fa-solid fa-pills text-6xl text-slate-200 mb-4"></i>
                        <h3 className="text-xl font-bold text-slate-600">No medicines found.</h3>
                        <p className="text-slate-400 mt-2">Try searching for a different brand or generic name.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {displayedMedicines.map((med) => {
                                const savingsPercent = Math.round(((med.brandedPrice - med.genericPrice) / med.brandedPrice) * 100);
                                
                                return (
                                    <div key={med.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full relative overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest shadow-sm">
                                            Save {savingsPercent}%
                                        </div>
                                        
                                        <div className="mb-4 mt-2">
                                            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">{med.category}</div>
                                            <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">{med.genericName}</h3>
                                            <p className="text-slate-500 text-sm font-medium h-10 line-clamp-2">{med.description}</p>
                                        </div>

                                        <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 flex-1">
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Equivalent To</div>
                                            <div className="font-bold text-slate-700 mb-3">{med.commonBrand}</div>
                                            
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Common Use</div>
                                            <div className="font-medium text-slate-700">{med.useCase}</div>
                                        </div>

                                        <div className="flex items-end justify-between mb-6">
                                            <div>
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Branded Price</div>
                                                <div className="text-sm font-bold text-slate-400 line-through">₹{med.brandedPrice.toFixed(2)}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Generic Price</div>
                                                <div className="text-3xl font-black text-emerald-600">₹{med.genericPrice.toFixed(2)}</div>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => handleOrderWhatsApp(med)}
                                            className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all mt-auto"
                                        >
                                            <i className="fa-brands fa-whatsapp text-lg"></i>
                                            Order via WhatsApp
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                        
                        {visibleCount < filteredMedicines.length && (
                            <div className="mt-12 text-center">
                                <button 
                                    onClick={handleLoadMore}
                                    className="bg-white border-2 border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 font-black px-10 py-4 rounded-xl transition-all shadow-sm"
                                >
                                    Load More Medicines
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <Footer />
        </div>
    );
}
