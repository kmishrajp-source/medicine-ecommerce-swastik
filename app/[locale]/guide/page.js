"use client";
import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function HowItWorksGuide() {
    const { cartCount, toggleCart } = useCart();

    const steps = [
        {
            icon: "🔍",
            title: "1. Search for Medicines",
            description: "Use the search bar at the top of the app to find your required medicines. You can search by brand name, generic name, or health condition.",
            actionText: "Shop Medicines",
            actionLink: "/shop",
            color: "from-blue-500 to-cyan-500",
            lightBg: "bg-blue-50"
        },
        {
            icon: "🛒",
            title: "2. Add to Cart",
            description: "Check the price, generic alternatives for up to 80% savings, and add the medicines to your cart. Review your cart items before proceeding.",
            color: "from-emerald-500 to-teal-500",
            lightBg: "bg-emerald-50"
        },
        {
            icon: "📋",
            title: "3. Upload Prescription (If Required)",
            description: "For prescription medicines (Rx), you will be prompted at checkout to upload a clear photo or PDF of your doctor's prescription. Our pharmacists will verify it quickly.",
            color: "from-amber-500 to-orange-500",
            lightBg: "bg-amber-50"
        },
        {
            icon: "💳",
            title: "4. Checkout & Payment",
            description: "Enter your delivery address or share your live GPS location. Choose your preferred payment method: Online (UPI, Cards), Scan QR, or Cash on Delivery (COD).",
            color: "from-purple-500 to-pink-500",
            lightBg: "bg-purple-50"
        },
        {
            icon: "🛵",
            title: "5. Fast Delivery & Live Tracking",
            description: "Once ordered, you can track your delivery rider in real-time from your Profile page! Receive your medicines safely at your doorstep within hours.",
            actionText: "Track My Order",
            actionLink: "/profile",
            color: "from-red-500 to-rose-500",
            lightBg: "bg-red-50"
        }
    ];

    const otherServices = [
        {
            icon: "👨‍⚕️",
            title: "Doctor Consultations",
            desc: "Book top specialists for online video consults or in-person hospital visits.",
            link: "/doctors"
        },
        {
            icon: "🧪",
            title: "Lab Tests",
            desc: "Book blood tests and full body checkups with home sample collection.",
            link: "/lab-tests"
        },
        {
            icon: "🌿",
            title: "Generic Stores",
            desc: "Find PMBJP Jan Aushadhi Kendras near you and save up to 80%.",
            link: "/generic-retailers"
        },
        {
            icon: "🚑",
            title: "Ambulance",
            desc: "Book Basic, ICU, or Advanced life support ambulances instantly.",
            link: "/ambulance"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-32 pb-24 px-6 text-center text-white">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-block bg-white/10 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-6 border border-white/20">
                        📚 Customer Guide
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight leading-tight">
                        How to Order Medicines on <span className="text-blue-400">Swastik Medicare</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
                        A simple, step-by-step guide to finding your medicines, saving money with generics, and getting lightning-fast delivery.
                    </p>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6 py-16 -mt-10 relative z-10">
                {/* Steps Container */}
                <div className="space-y-8">
                    {steps.map((step, index) => (
                        <div key={index} className="bg-white rounded-3xl p-6 md:p-10 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row gap-8 items-center hover:-translate-y-1 transition-transform duration-300">
                            
                            {/* Icon Box */}
                            <div className={`w-24 h-24 md:w-32 md:h-32 rounded-3xl shrink-0 flex items-center justify-center text-5xl md:text-6xl ${step.lightBg} shadow-inner`}>
                                {step.icon}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 text-center md:text-left">
                                <h3 className={`text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${step.color} mb-4`}>
                                    {step.title}
                                </h3>
                                <p className="text-slate-600 text-lg font-medium leading-relaxed mb-6">
                                    {step.description}
                                </p>
                                
                                {step.actionText && (
                                    <Link href={step.actionLink} className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold tracking-wide uppercase text-sm bg-gradient-to-r ${step.color} hover:opacity-90 transition-opacity shadow-md`}>
                                        {step.actionText} <i className="fa-solid fa-arrow-right"></i>
                                    </Link>
                                )}
                            </div>

                        </div>
                    ))}
                </div>

                {/* Other Services Grid */}
                <div className="mt-24 text-center">
                    <h2 className="text-3xl font-black text-slate-900 mb-4">Explore More on Swastik</h2>
                    <p className="text-slate-500 font-medium mb-12 max-w-xl mx-auto">We are more than just a pharmacy. Discover our complete healthcare ecosystem designed for your family's needs.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {otherServices.map((service, idx) => (
                            <Link href={service.link} key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group flex flex-col items-center text-center">
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{service.icon}</div>
                                <h4 className="text-lg font-bold text-slate-900 mb-2">{service.title}</h4>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">{service.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* FAQ / Support Banner */}
                <div className="mt-16 bg-blue-50 rounded-3xl p-8 md:p-12 text-center border border-blue-100">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl mx-auto mb-6">
                        <i className="fa-solid fa-headset"></i>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-4">Still need help?</h3>
                    <p className="text-slate-600 font-medium mb-8 max-w-md mx-auto">Our Swastik Support team and Medical AI are always here to guide you.</p>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button onClick={() => window.dispatchEvent(new CustomEvent('open-medical-ai'))} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                            <i className="fa-solid fa-robot"></i> Ask Voice AI
                        </button>
                        <a href="https://wa.me/917992122974" target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors">
                            <i className="fa-brands fa-whatsapp text-lg"></i> Chat on WhatsApp
                        </a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
