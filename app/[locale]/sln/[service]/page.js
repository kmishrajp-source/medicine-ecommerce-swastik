"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import SLNBookingModal from "@/components/SLNBookingModal";

export default function SLNServicePage() {
    const { service } = useParams();
    const { cartCount, toggleCart } = useCart();
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    const serviceInfo = {
        doctor: { title: "Expert Doctor Consultation", icon: "fa-user-doctor", color: "blue" },
        ambulance: { title: "24/7 Emergency Ambulance", icon: "fa-truck-medical", color: "red" },
        lab: { title: "Home Collection Lab Tests", icon: "fa-microscope", color: "indigo" },
        insurance: { title: "Medical Insurance Plans", icon: "fa-shield-halved", color: "green" }
    }[service] || { title: "Healthcare Service", icon: "fa-hand-holding-medical", color: "blue" };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            
            <main className="max-w-4xl mx-auto px-6 pt-40 pb-24 text-center">
                <div className={`w-24 h-24 bg-${serviceInfo.color}-600 rounded-[2rem] flex items-center justify-center text-4xl text-white mx-auto mb-8 shadow-2xl shadow-${serviceInfo.color}-200 animate-bounce-subtle`}>
                    <i className={`fa-solid ${serviceInfo.icon}`}></i>
                </div>
                
                <h1 className="text-5xl font-black text-slate-900 mb-4">{serviceInfo.title}</h1>
                <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto">
                    Get priority booking and verified specialists through the Swastik Lead Network. Fast, reliable, and secure.
                </p>

                <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 mb-12">
                    <h3 className="text-2xl font-black text-slate-900 mb-8">Ready to Book?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                             <h4 className="font-bold text-slate-800 mb-2">Why via Swastik?</h4>
                             <ul className="text-sm text-slate-500 space-y-2">
                                <li><i className="fa-solid fa-check text-green-500 mr-2"></i> Priority Appointment</li>
                                <li><i className="fa-solid fa-check text-green-500 mr-2"></i> Verified Providers</li>
                                <li><i className="fa-solid fa-check text-green-500 mr-2"></i> 24/7 Support</li>
                             </ul>
                        </div>
                        <div className="flex flex-col justify-center">
                            <button 
                                onClick={() => setIsBookingOpen(true)}
                                className={`w-full bg-${serviceInfo.color}-600 text-white font-black py-5 rounded-2xl hover:opacity-90 transition-all shadow-xl text-lg`}
                            >
                                Book Now
                            </button>
                        </div>
                    </div>
                </div>

                <div className="text-slate-400 text-sm italic font-medium">
                    "Bridging the gap between quality healthcare and Gorakhpur residents."
                </div>
            </main>

            <SLNBookingModal 
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                targetItem={{ id: 'global', name: serviceInfo.title }}
                serviceType={service}
            />
        </div>
    );
}
