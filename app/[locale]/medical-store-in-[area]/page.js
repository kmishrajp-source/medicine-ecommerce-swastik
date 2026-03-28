"use client";
import { useState, useEffect, use } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import DirectoryCard from "@/components/DirectoryCard";
import { Link } from "@/i18n/navigation";

export default function AreaMedicalStorePage({ params }) {
    const { area } = use(params);
    const { cartCount, toggleCart } = useCart();
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);

    const decodedArea = decodeURIComponent(area).replace(/-/g, ' ');
    const formattedArea = decodedArea.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    useEffect(() => {
        fetchStores();
    }, [area]);

    const fetchStores = async () => {
        try {
            const res = await fetch('/api/retailers');
            const data = await res.json();
            if (data.success) {
                // Filter by area
                const filtered = data.retailers.filter(s => 
                    s.locality?.toLowerCase() === decodedArea.toLowerCase() || 
                    s.address?.toLowerCase().includes(decodedArea.toLowerCase())
                );
                setStores(filtered);
            }
        } catch (error) {
            console.error("Failed to fetch area stores:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            
            <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
                <div className="mb-12">
                    <div className="inline-block bg-emerald-100 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                        Medicine & Pharmacy Directory
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2">Medical Stores in {formattedArea}, Gorakhpur</h1>
                    <p className="text-slate-500 font-medium">Find shops selling medicines, healthcare products, and surgicals in {formattedArea}.</p>
                </div>

                {loading ? (
                    <div className="py-20 text-center"><i className="fa-solid fa-spinner fa-spin text-2xl text-slate-300"></i></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {stores.map(store => (
                            <DirectoryCard 
                                key={store.id} 
                                item={store} 
                                type="retailer" 
                                onBook={() => {}}
                            />
                        ))}
                        {stores.length === 0 && (
                            <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 text-3xl">
                                    <i className="fa-solid fa-store-slash"></i>
                                </div>
                                <p className="text-xl font-black text-slate-400 mb-4">No medical stores found in {formattedArea} yet.</p>
                                <Link href="/pharmacy" className="text-blue-600 font-bold hover:underline">
                                    View all medical stores in Gorakhpur →
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* SEO Text Content */}
                <section className="mt-24 pt-24 border-t border-slate-200">
                    <div className="max-w-3xl">
                        <h2 className="text-3xl font-black text-slate-900 mb-6">Pharmacy & Health Stores in {formattedArea}</h2>
                        <p className="text-slate-600 font-medium leading-relaxed mb-6">
                            Finding a pharmacy in {formattedArea} is now easier. Swastik Medicare directory lists all verified medical stores near you, making it simple to find medicines, bandages, baby care products, and surgical items in Gorakhpur.
                        </p>
                        <p className="text-slate-600 font-medium leading-relaxed">
                            Check for the "Verified" badge to ensure you're connecting with an authorized pharmacy. You can call the store directly using the "Call Now" button for medicine availability.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}
