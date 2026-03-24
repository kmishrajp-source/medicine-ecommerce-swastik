"use client";
import React from 'react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { Link } from '@/i18n/navigation';

export default function MedicalFacilities() {
    const { cartCount, toggleCart } = useCart();

    const categories = [
        { id: 'doctors', name: 'Doctors', count: '639+', icon: 'fa-user-doctor', color: '#4338ca', link: '/gorakhpur/clinics' },
        { id: 'clinics', name: 'Clinics', count: '105+', icon: 'fa-hospital', color: '#059669', link: '/gorakhpur/clinics' },
        { id: 'labs', name: 'Labs & Diagnostics', count: '42+', icon: 'fa-flask', color: '#d97706', link: '/labs' },
        { id: 'hospitals', name: 'Hospitals', count: '28+', icon: 'fa-building-medical', color: '#dc2626', link: '/hospitals' }
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <div className="pt-40 max-w-7xl mx-auto px-6 pb-20">
                {/* SEO Breadcrumbs */}
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                    Home / Healthcare Directory / <span className="text-slate-900">Medical Facilities & Services</span>
                </div>

                <div className="mb-16">
                    <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Medical Facilities in Gorakhpur</h1>
                    <p className="text-xl text-slate-500 font-medium max-w-3xl">Find and book appointments with verified healthcare providers near you. Choose from 800+ standardized medical services.</p>
                </div>

                {/* Category Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {categories.map((cat) => (
                        <Link 
                            key={cat.id} 
                            href={cat.link}
                            className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2 group"
                        >
                            <div className={`w-16 h-16 rounded-3xl mb-8 flex items-center justify-center text-2xl transition-all group-hover:scale-110`} style={{ background: `${cat.color}15`, color: cat.color }}>
                                <i className={`fa-solid ${cat.icon}`}></i>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">{cat.name}</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{cat.count} listings</span>
                                <i className="fa-solid fa-arrow-right text-slate-200 group-hover:text-slate-900 transition-colors"></i>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Authority Message */}
                <div className="mt-20 bg-slate-900 rounded-[3.5rem] p-12 text-white relative overflow-hidden">
                    <div className="relative z-10 max-w-2xl">
                        <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">
                            Premium Directory
                        </span>
                        <h2 className="text-4xl font-black mb-6">Want to list your facility?</h2>
                        <p className="text-slate-400 text-lg mb-8">Join Gorakhpur's fastest growing medical network. Get verified leads, manage appointments, and digitize your practice today.</p>
                        <Link href="/partner" className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-sm inline-block shadow-xl">
                            Register as Partner
                        </Link>
                    </div>
                    <i className="fa-solid fa-heart-pulse absolute -right-10 -bottom-10 text-[20rem] text-white/5 opacity-10"></i>
                </div>
            </div>
        </div>
    );
}
