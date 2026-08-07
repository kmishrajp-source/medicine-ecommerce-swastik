"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import DirectoryCard from "@/components/DirectoryCard";
import { useCart } from "@/context/CartContext";

export default function HomeopathyDoctorsClient() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const { cartCount, toggleCart } = useCart();

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setLoading(true);
                let finalDoctors = [];
                try {
                    const res = await fetch("/api/doctors?city=Gorakhpur");
                    const data = await res.json();
                    if (data.success && data.doctors) {
                        finalDoctors = data.doctors.filter(d => 
                            (d.specialization || "").toLowerCase().includes('homeopath')
                        );
                    }
                } catch (e) {
                    console.warn("DB fetch failed");
                }

                if (finalDoctors.length === 0) {
                    try {
                        const fallbackRes = await fetch("/gorakhpur-healthcare-export.json");
                        const fallbackData = await fallbackRes.json();
                        if (Array.isArray(fallbackData)) {
                            finalDoctors = fallbackData.filter(d => 
                                (d.specialization || "").toLowerCase().includes('homeopath')
                            ).map((doc, idx) => ({
                                id: doc.id || `fallback-doc-${idx}`,
                                doctorName: doc.doctorName || doc.name,
                                specialization: doc.specialization,
                                locality: doc.locality || "Gorakhpur",
                                hospital: doc.name || "",
                                phone: doc.phone || "",
                                rating: doc.rating || 4.5,
                                verified: doc.verified ?? true,
                                isFallback: true
                            }));
                        }
                    } catch (e) {
                        console.error("Fallback JSON failed:", e);
                    }
                }
                
                setDoctors(finalDoctors);
            } catch (error) {
                console.error("Critical error in fetchDoctors:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            
            <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
                <div className="bg-emerald-50 rounded-3xl p-10 mb-12 text-center border border-emerald-100 shadow-sm">
                    <div className="inline-block bg-emerald-200 text-emerald-800 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                        Specialized Care
                    </div>
                    <h1 className="text-4xl font-black text-emerald-900 mb-4">🌿 Homeopathic Doctors</h1>
                    <p className="text-emerald-700 font-medium text-lg max-w-2xl mx-auto">
                        Find and book appointments with verified homeopathic practitioners for natural, holistic healing.
                    </p>
                </div>

                {loading ? (
                    <div className="py-20 text-center"><i className="fa-solid fa-spinner fa-spin text-2xl text-slate-300"></i></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {doctors.map(doctor => (
                            <DirectoryCard 
                                key={doctor.id}
                                item={doctor} 
                                type="doctor" 
                                onBook={(item) => {
                                    window.dispatchEvent(new CustomEvent('swastik:open-chat', { 
                                        detail: { message: `I want to book an appointment with ${item.doctorName || item.name} (${item.specialization}). Please call me back at my number.` }
                                    }));
                                }}
                            />
                        ))}
                        {doctors.length === 0 && (
                            <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm px-6">
                                <i className="fa-solid fa-leaf text-4xl text-emerald-200 mb-6"></i>
                                <p className="text-xl font-black text-slate-400 mb-4">No Homeopathic doctors found.</p>
                                <p className="text-slate-400">Admin needs to add doctors with specialization "Homeopath".</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
