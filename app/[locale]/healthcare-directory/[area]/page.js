"use client";
import { useState, useEffect, use } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import DirectoryCard from "@/components/DirectoryCard";
import { Link } from "@/i18n/navigation";

export default function AreaDoctorsPage({ params }) {
    const { area } = use(params);
    const { cartCount, toggleCart } = useCart();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    const decodedArea = decodeURIComponent(area).replace(/-/g, ' ');
    const formattedArea = decodedArea.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    useEffect(() => {
        fetchDoctors();
    }, [area]);

    const fetchDoctors = async () => {
        try {
            const res = await fetch('/api/doctors');
            const data = await res.json();
            if (data.success) {
                // Filter by area
                const filtered = data.doctors.filter(d => 
                    d.locality?.toLowerCase() === decodedArea.toLowerCase() || 
                    d.address?.toLowerCase().includes(decodedArea.toLowerCase())
                );
                setDoctors(filtered);
            }
        } catch (error) {
            console.error("Failed to fetch area doctors:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            
            <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
                <div className="mb-12">
                    <div className="inline-block bg-blue-100 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                        Local Healthcare Directory
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2">Best Doctors in {formattedArea}, Gorakhpur</h1>
                    <p className="text-slate-500 font-medium">Verified local specialists and clinics near you in {formattedArea}.</p>
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
                            />
                        ))}
                        {doctors.length === 0 && (
                            <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 text-3xl">
                                    <i className="fa-solid fa-map-location-dot"></i>
                                </div>
                                <p className="text-xl font-black text-slate-400 mb-4">No specialists found in {formattedArea} yet.</p>
                                <Link href="/doctors" className="text-blue-600 font-bold hover:underline">
                                    View all doctors in Gorakhpur →
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* SEO Text Content */}
                <section className="mt-24 pt-24 border-t border-slate-200">
                    <div className="max-w-3xl">
                        <h2 className="text-3xl font-black text-slate-900 mb-6">Finding the Right Doctor in {formattedArea}</h2>
                        <p className="text-slate-600 font-medium leading-relaxed mb-6">
                            Swastik Medicare helps you discover and connect with top-rated medical professionals located specifically in the {formattedArea} area of Gorakhpur. Whether you're looking for a General Physician, Pediatrician, or Specialist, our verified directory ensures you get accurate contact details including Phone and WhatsApp for instant communication.
                        </p>
                        <p className="text-slate-600 font-medium leading-relaxed">
                            No login is required to access doctor details. Simply browse the list, check verified badges, and click "Call Now" to book your consultation directly.
                        </p>
                    </div>
                </section>

            </main>
        </div>
    );
}
