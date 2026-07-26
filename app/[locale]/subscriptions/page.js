"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function MySubscriptions() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { cartCount, toggleCart } = useCart();
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login?callbackUrl=/subscriptions");
        } else if (status === "authenticated") {
            fetchSubscriptions();
        }
    }, [status, router]);

    const fetchSubscriptions = async () => {
        try {
            const res = await fetch("/api/subscription");
            const data = await res.json();
            if (data.success) {
                setSubscriptions(data.subscriptions);
            }
        } catch (error) {
            console.error("Failed to load subscriptions", error);
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><i className="fa-solid fa-spinner fa-spin text-3xl text-indigo-500"></i></div>;

    return (
        <div className="bg-slate-50 min-h-screen font-sans pb-20">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <div className="bg-indigo-900 pt-32 pb-20 px-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <div className="inline-block bg-indigo-500/30 text-indigo-200 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-4 border border-indigo-500/50">
                            <i className="fa-solid fa-repeat mr-2"></i> Automated Refills
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                            My Subscriptions
                        </h1>
                        <p className="text-indigo-200 text-lg max-w-xl">
                            Never run out of your essential medicines again. View and manage your automated delivery schedule below.
                        </p>
                    </div>
                    <div className="bg-indigo-800/50 p-6 rounded-2xl border border-indigo-500/30 text-center w-full md:w-auto">
                        <div className="text-4xl font-black text-emerald-400 mb-1">{subscriptions.filter(s => s.status === 'Active').length}</div>
                        <div className="text-indigo-200 text-sm font-bold uppercase tracking-widest">Active Refills</div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 -mt-8 relative z-20">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    {subscriptions.length === 0 ? (
                        <div className="text-center py-20 px-6">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <i className="fa-solid fa-box-open text-4xl text-slate-400"></i>
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-3">No Active Subscriptions</h2>
                            <p className="text-slate-500 mb-8 max-w-md mx-auto">
                                You haven't subscribed to any medicines yet. Subscribing ensures you never miss a dose and locks in the best price!
                            </p>
                            <Link href="/shop-medicines" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-indigo-200 inline-block">
                                Browse Medicines
                            </Link>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-widest border-b border-slate-200">
                                    <th className="p-6 font-black">Medicine</th>
                                    <th className="p-6 font-black">Quantity</th>
                                    <th className="p-6 font-black">Schedule</th>
                                    <th className="p-6 font-black">Next Delivery</th>
                                    <th className="p-6 font-black text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscriptions.map((sub) => (
                                    <tr key={sub.id} className="border-b border-slate-100 hover:bg-slate-50 transition-all">
                                        <td className="p-6 font-black text-slate-800">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500">
                                                    <i className="fa-solid fa-pills"></i>
                                                </div>
                                                {sub.medicineName}
                                            </div>
                                        </td>
                                        <td className="p-6 font-bold text-slate-600 text-lg">{sub.quantity}</td>
                                        <td className="p-6">
                                            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                                                <i className="fa-regular fa-calendar mr-1"></i> {sub.frequency}
                                            </span>
                                        </td>
                                        <td className="p-6 font-bold text-emerald-600">
                                            {new Date(sub.nextDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="p-6 text-right">
                                            {sub.status === 'Active' ? (
                                                <span className="text-emerald-500 font-bold text-sm"><i className="fa-solid fa-circle-check mr-1"></i> Active</span>
                                            ) : (
                                                <span className="text-amber-500 font-bold text-sm"><i className="fa-solid fa-circle-pause mr-1"></i> {sub.status}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
