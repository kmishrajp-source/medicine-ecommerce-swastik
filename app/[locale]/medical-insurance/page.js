"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function MedicalInsurancePage() {
    const { cartCount, toggleCart } = useCart();
    const router = useRouter();

    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        coverageType: "",
        minPremium: "",
        maxPremium: "",
        companyId: ""
    });
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        fetchCompanies();
        fetchPlans();
        
        // Capture Referral Publisher ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const pubId = urlParams.get('pubId');
        if (pubId) {
            localStorage.setItem('sln_publisher_id', pubId);
            console.log("SLN Referral tracked for publisher:", pubId);
        }
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [filters]);

    const fetchCompanies = async () => {
        try {
            const res = await fetch('/api/insurance/companies');
            const data = await res.json();
            if (data.success) setCompanies(data.companies);
        } catch (error) {
            console.error("Failed to fetch companies", error);
        }
    };

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams(filters).toString();
            const res = await fetch(`/api/insurance/plans?${query}`);
            const data = await res.json();
            if (data.success) setPlans(data.plans);
        } catch (error) {
            console.error("Failed to fetch plans", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-900 to-indigo-800 text-white py-20 px-6 pt-32">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
                    <div className="md:w-1/2 space-y-6">
                        <span className="bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                            🛡️ Swastik Lead Network (SLN)
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                            Secure Your Future with Medical Insurance
                        </h1>
                        <p className="text-xl text-blue-100 opacity-90 max-w-lg">
                            Compare top health plans, get instant quotes, and earn rewards through our verified medical lead network.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <button className="bg-white text-blue-900 px-8 py-4 rounded-2xl font-bold shadow-2xl hover:bg-blue-50 transition-all flex items-center gap-2">
                                View Plans <i className="fa-solid fa-arrow-down"></i>
                            </button>
                            <button className="bg-transparent border-2 border-white/20 px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all">
                                How it Works
                            </button>
                        </div>
                    </div>
                    <div className="md:w-1/2 mt-12 md:mt-0 relative">
                        <div className="absolute inset-0 bg-blue-500 rounded-full filter blur-3xl opacity-20 -z-10"></div>
                        <img 
                            src="https://images.unsplash.com/photo-1576091160550-217359f4ecf8?auto=format&fit=crop&q=80&w=2070" 
                            alt="Insurance" 
                            className="rounded-3xl shadow-2xl border-4 border-white/10"
                        />
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="max-w-7xl mx-auto px-6 -mt-10 mb-12 relative z-10">
                <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Coverage Type</label>
                        <select 
                            className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 font-medium"
                            value={filters.coverageType}
                            onChange={(e) => setFilters({...filters, coverageType: e.target.value})}
                        >
                            <option value="">All Types</option>
                            <option value="Individual">Individual</option>
                            <option value="Family">Family</option>
                            <option value="Hospitalization">Hospitalization Only</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Insurance Company</label>
                        <select 
                            className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 font-medium"
                            value={filters.companyId}
                            onChange={(e) => setFilters({...filters, companyId: e.target.value})}
                        >
                            <option value="">All Companies</option>
                            {companies.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Premium Range (Max)</label>
                        <input 
                            type="number" 
                            placeholder="e.g. 5000"
                            className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 font-medium"
                            value={filters.maxPremium}
                            onChange={(e) => setFilters({...filters, maxPremium: e.target.value})}
                        />
                    </div>
                    <div className="flex items-end">
                        <button 
                            onClick={() => setFilters({coverageType: "", minPremium: "", maxPremium: "", companyId: ""})}
                            className="w-full py-4 text-sm font-bold text-blue-600 hover:text-blue-800"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="max-w-7xl mx-auto px-6 pb-24">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900">Recommended Plans</h2>
                        <p className="text-slate-500">Based on your filters and current network offers.</p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                        <span className="text-sm font-bold text-slate-600">Sort by:</span>
                        <select className="border-none text-xs font-bold text-blue-600 focus:ring-0 cursor-pointer">
                            <option>Premium: Low to High</option>
                            <option>Commission: High to Low</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <i className="fa-solid fa-spinner fa-spin text-4xl text-blue-500"></i>
                    </div>
                ) : plans.length === 0 ? (
                    <div className="bg-white py-20 rounded-3xl border border-dashed border-gray-200 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="fa-solid fa-face-frown text-3xl text-gray-300"></i>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">No matching plans found</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-2">Try adjusting your filters to see more medical insurance options.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {plans.map((plan) => (
                            <div key={plan.id} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all hover:-translate-y-2 group">
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-gray-100">
                                            {plan.company.logoUrl ? (
                                                <img src={plan.company.logoUrl} alt={plan.company.name} className="max-h-12 max-w-12 object-contain" />
                                            ) : (
                                                <i className="fa-solid fa-building-shield text-2xl text-slate-400"></i>
                                            )}
                                        </div>
                                        <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                            {plan.coverageType}
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold text-slate-900 mb-2 truncate">{plan.name}</h3>
                                    <p className="text-slate-500 text-sm line-clamp-2 mb-6">{plan.description}</p>

                                    <div className="space-y-3 mb-8">
                                        {plan.features?.slice(0, 3).map((f, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                                <i className="fa-solid fa-circle-check text-green-500 text-xs"></i> {f}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-end justify-between border-t border-slate-50 pt-6">
                                        <div>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Premium / Year</span>
                                            <p className="text-3xl font-black text-slate-900">₹{plan.premium.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-md mb-1 inline-block uppercase tracking-tighter">
                                                Earn ₹{(plan.premium * plan.commissionRate / 100).toFixed(0)}*
                                            </span>
                                            <p className="text-xs text-slate-400">Cashback</p>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => router.push(`/medical-insurance/book/${plan.id}`)}
                                        className="w-full mt-8 bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg group-hover:bg-blue-700 transition-all flex justify-center items-center gap-2"
                                    >
                                        Buy Now <i className="fa-solid fa-arrow-right"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Trust Section */}
            <div className="bg-slate-900 py-24 px-6 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black mb-16">The SLN Advantage</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="space-y-4 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto text-blue-400 text-2xl">
                                <i className="fa-solid fa-shield-halved"></i>
                            </div>
                            <h4 className="text-xl font-bold">Verified Insurers</h4>
                            <p className="text-white/60">We only partner with IRDA approved companies providing 100% genuine medical policies.</p>
                        </div>
                        <div className="space-y-4 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto text-green-400 text-2xl">
                                <i className="fa-solid fa-wallet"></i>
                            </div>
                            <h4 className="text-xl font-bold">Guaranteed Cashback</h4>
                            <p className="text-white/60">Receive up to 10% of your premium back into your Swastik wallet on every successful policy.</p>
                        </div>
                        <div className="space-y-4 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto text-purple-400 text-2xl">
                                <i className="fa-solid fa-headset"></i>
                            </div>
                            <h4 className="text-xl font-bold">24/7 Claim Support</h4>
                            <p className="text-white/60">Our dedicated team assists you during emergencies to ensure smooth cashless hospitalizations.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
