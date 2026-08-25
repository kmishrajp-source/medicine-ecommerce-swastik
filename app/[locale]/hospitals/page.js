"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import DirectoryCard from "@/components/DirectoryCard";
import SLNBookingModal from "@/components/SLNBookingModal";

export default function HospitalsPage() {
    const { cartCount, toggleCart } = useCart();
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("All");

    useEffect(() => {
        fetchHospitals();
        // Capture Referral Publisher ID
        const urlParams = new URLSearchParams(window.location.search);
        const pubId = urlParams.get('pubId');
        if (pubId) localStorage.setItem('sln_publisher_id', pubId);
    }, []);

    const fetchHospitals = async () => {
        try {
            const res = await fetch('/api/hospitals');
            const data = await res.json();
            if (data.success) setHospitals(data.hospitals);
        } catch (error) {
            console.error("Failed to fetch hospitals", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = (hospital) => {
        setSelectedHospital(hospital);
        setIsBookingOpen(true);
    };

    const categories = ["All", "Multi-Specialty", "Cardiology", "Maternity", "Pediatrics", "Emergency", "Orthopaedics", "Neurology", "Oncology"];

    const filteredHospitals = hospitals.filter(hospital => {
        const matchesSearch = 
            (hospital.name && hospital.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (hospital.address && hospital.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (hospital.specialties && hospital.specialties.toLowerCase().includes(searchQuery.toLowerCase()));
            
        const matchesCategory = filterCategory === "All" || (hospital.specialties && hospital.specialties.toLowerCase().includes(filterCategory.toLowerCase()));
        
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            
            <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                    <div>
                        <div className="inline-block bg-indigo-100 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                            Healthcare Facilities
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 mb-2">Hospitals in Gorakhpur</h1>
                        <p className="text-slate-500 font-medium">Find the best healthcare facilities with specialized treatments.</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 max-w-sm">
                         <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg"><i className="fa-solid fa-building-circle-arrow-right"></i></div>
                         <div>
                            <p className="text-xs font-black text-slate-900 mb-1">Are you a Hospital Owner?</p>
                            <a href="/partner" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Register your facility →</a>
                         </div>
                    </div>
                </div>

                {/* ── SEARCH & FILTER BAR ── */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input 
                            type="text" 
                            placeholder="Search by hospital name, location, or specialty..." 
                            className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* ── FILTER CHIPS ── */}
                <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 hide-scrollbar">
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${filterCategory === cat ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="py-20 text-center"><i className="fa-solid fa-spinner fa-spin text-2xl text-slate-300"></i></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredHospitals.map(hospital => (
                            <DirectoryCard 
                                key={hospital.id} 
                                item={hospital} 
                                type="hospital" 
                                onBook={handleBook}
                            />
                        ))}
                        {filteredHospitals.length === 0 && (
                            <div className="col-span-full py-20 text-center font-bold text-slate-400">
                                No hospitals found matching your criteria.
                            </div>
                        )}
                    </div>
                )}
            </main>

            <SLNBookingModal 
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                targetItem={selectedHospital}
                serviceType="hospital"
            />
        </div>
    );
}
