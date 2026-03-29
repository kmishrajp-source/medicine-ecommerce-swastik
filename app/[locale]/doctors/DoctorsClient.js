"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import DirectoryCard from "../../../components/DirectoryCard";
import { useCart } from "../../../context/CartContext";

const specialties = ["All", "General Physician", "Gynaecologist", "Paediatrician", "Orthopaedic", "Dermatologist", "Neurologist", "Cardiologist", "Urologist", "ENT Specialist"];
const areas = ["All", "Betiahata", "Golghar", "Gorakhnath", "Medical College", "Asuran", "Shahpur", "Basharatpur", "Kunraghat"];

export default function DoctorsClient() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterSpecialty, setFilterSpecialty] = useState("All");
    const [filterArea, setFilterArea] = useState("All");
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const { cartCount, toggleCart } = useCart();

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await fetch('/api/doctors');
                const data = await res.json();
                if (data.success) {
                    setDoctors(data.doctors);
                }
            } catch (error) {
                console.error("Failed to fetch doctors");
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    const filteredDoctors = doctors.filter(doc => {
        const matchesSearch = (doc.name || doc.doctorName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (doc.specialization || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSpecialty = filterSpecialty === "All" || doc.specialization === filterSpecialty;
        const matchesArea = filterArea === "All" || doc.locality === filterArea;
        return matchesSearch && matchesSpecialty && matchesArea;
    });

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            
            <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <div className="inline-block bg-blue-100 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                            Healthcare Directory
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 mb-2">Verified Doctors in Gorakhpur</h1>
                        <p className="text-slate-500 font-medium">Find and connect with top-rated specialists instantly.</p>
                    </div>

                    <Link href="/partner" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 max-w-sm hover:border-blue-200 transition-colors group">
                         <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><i className="fa-solid fa-user-doctor"></i></div>
                         <div>
                            <p className="text-xs font-black text-slate-900 mb-1">Are you a Doctor?</p>
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest group-hover:underline">Join our network →</span>
                         </div>
                    </Link>
                </div>

                <div className="mb-12 space-y-8">
                    <div className="relative group">
                        <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"></i>
                        <input 
                            type="text" 
                            placeholder="Search by doctor name or specialization..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-6 pl-16 bg-white border-2 border-slate-100 rounded-[2rem] font-bold text-slate-900 focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all outline-none shadow-sm"
                        />
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Filter by Specialization</p>
                        <div className="flex flex-wrap gap-3">
                            {specialties.map(s => (
                                <button 
                                    key={s}
                                    onClick={() => setFilterSpecialty(s)}
                                    className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${filterSpecialty === s ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-100'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Filter by Locality</p>
                        <div className="flex flex-wrap gap-3">
                            {areas.map(a => (
                                <button 
                                    key={a}
                                    onClick={() => setFilterArea(a)}
                                    className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${filterArea === a ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-100'}`}
                                >
                                    {a}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center"><i className="fa-solid fa-spinner fa-spin text-2xl text-slate-300"></i></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredDoctors.map(doctor => (
                            <DirectoryCard 
                                key={doctor.id} 
                                item={doctor} 
                                type="doctor" 
                            />
                        ))}
                        {filteredDoctors.length === 0 && (
                            <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                                <i className="fa-solid fa-user-slash text-4xl text-slate-200 mb-6"></i>
                                <p className="text-xl font-black text-slate-400">No doctors match your search filters.</p>
                                <button onClick={() => {setSearchQuery(""); setFilterSpecialty("All"); setFilterArea("All");}} className="mt-4 text-blue-600 font-bold hover:underline">Reset all filters</button>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-24 pt-24 border-t border-slate-200">
                    <h2 className="text-3xl font-black text-slate-900 mb-12">Recently Added Specialists</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {doctors.slice(0, 4).map(doc => (
                            <Link key={doc.id} href={`/doctors/${doc.id}`} className="bg-white p-6 rounded-3xl border border-slate-100 hover:shadow-lg transition-all flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                                    <i className="fa-solid fa-user-doctor"></i>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-black text-slate-900 truncate">{doc.doctorName || doc.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 truncate">{doc.specialization}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="mt-24 bg-slate-100 p-8 rounded-3xl border border-slate-200">
                    <p className="text-[10px] text-slate-400 leading-relaxed text-center font-medium uppercase tracking-widest">
                        <strong className="text-slate-600">Legal Disclaimer:</strong> Swastik Medicare acts only as a directory service for information-only profiles. We are not responsible for the accuracy or clinical quality of services provided by practitioners listed. Users are advised to verify details independently.
                    </p>
                </div>

            </main>
        </div>
    );
}
