"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import DirectoryCard from "@/components/DirectoryCard";
import SLNBookingModal from "@/components/SLNBookingModal";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/context/CartContext";

export default function AreaStoresPage({ params }) {
    const [area, setArea] = useState("");
    const [decodedArea, setDecodedArea] = useState("");
    const [formattedArea, setFormattedArea] = useState("");
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStore, setSelectedStore] = useState(null);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const { cartCount, toggleCart } = useCart();

    useEffect(() => {
        // Resolve params (may be a Promise in Next.js 15)
        Promise.resolve(params).then((resolved) => {
            const rawArea = resolved.area || "";
            const decoded = decodeURIComponent(rawArea).replace(/-/g, " ");
            const formatted = decoded
                .split(" ")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ");

            setArea(rawArea);
            setDecodedArea(decoded);
            setFormattedArea(formatted);

            fetchStores(decoded);
        });
    }, []);

    const fetchStores = async (areaName) => {
        try {
            const res = await fetch("/api/retailers");
            const data = await res.json();
            if (data.success) {
                // Filter by area/locality client-side (API filters by city only)
                const filtered = data.retailers.filter(
                    (s) =>
                        s.locality?.toLowerCase() === areaName.toLowerCase() ||
                        s.address?.toLowerCase().includes(areaName.toLowerCase()) ||
                        s.city?.toLowerCase() === areaName.toLowerCase()
                );
                // If no area-specific results, show all Gorakhpur retailers
                setStores(filtered.length > 0 ? filtered : data.retailers);
            }
        } catch (error) {
            console.error("Failed to fetch stores:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = (store) => {
        setSelectedStore(store);
        setIsBookingOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <main className="max-w-7xl mx-auto px-6 pt-44 pb-24">
                <div className="mb-12">
                    <div className="inline-block bg-emerald-100 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                        Medicine Hub Directory
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-2 tracking-tighter uppercase">
                        Best Medical Stores in{" "}
                        <span className="text-emerald-600">
                            {formattedArea || "Gorakhpur"}
                        </span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                        Verified local pharmacies and chemists near you in Gorakhpur.
                    </p>
                </div>

                {loading ? (
                    <div className="py-20 text-center">
                        <i className="fa-solid fa-spinner fa-spin text-2xl text-slate-300"></i>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {stores.map((store) => (
                            <DirectoryCard
                                key={store.id}
                                item={store}
                                type="retailer"
                                onBook={handleBook}
                            />
                        ))}
                        {stores.length === 0 && (
                            <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm px-6">
                                <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-slate-200 text-4xl">
                                    <i className="fa-solid fa-store-slash"></i>
                                </div>
                                <p className="text-2xl font-black text-slate-900 mb-4">
                                    No partner stores in {formattedArea} yet.
                                </p>
                                <p className="text-slate-400 font-bold mb-10">
                                    We are currently onboarding new pharmacies in this area.
                                </p>
                                <Link
                                    href="/retailers"
                                    className="bg-slate-900 text-white font-black px-12 py-5 rounded-2xl hover:bg-black transition-all shadow-xl text-[10px] uppercase tracking-widest"
                                >
                                    Browse all Gorakhpur Pharmacies
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* SEO Content Layer */}
                <section className="mt-32 pt-24 border-t border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tighter">
                                Trusted Medicine Delivery in {formattedArea || "Gorakhpur"}
                            </h2>
                            <p className="text-slate-600 font-medium leading-relaxed mb-8">
                                Swastik Medicare connects you with the most reliable medical
                                stores in {formattedArea || "Gorakhpur"}. Our directory is
                                designed for speed—just find a store, click call or WhatsApp,
                                and place your order. No login, no complicated forms, just
                                direct healthcare commerce.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-lg">
                                    <i className="fa-solid fa-circle-check text-emerald-500"></i>{" "}
                                    Verified License
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-lg">
                                    <i className="fa-solid fa-truck text-emerald-500"></i> Fast
                                    Home Delivery
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                            <h3 className="text-xl font-black text-slate-900 mb-6">
                                Are you a Chemist in {formattedArea || "Gorakhpur"}?
                            </h3>
                            <p className="text-slate-500 font-medium text-sm mb-10 leading-relaxed">
                                Join Gorakhpur's fastest-growing healthcare network and list
                                your store for free to reach thousands of customers in your
                                locality.
                            </p>
                            <Link
                                href="/partner"
                                className="block w-full bg-emerald-600 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest text-center hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
                            >
                                Register Your Store Now
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <SLNBookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                targetItem={selectedStore}
                serviceType="retailer"
            />
        </div>
    );
}
