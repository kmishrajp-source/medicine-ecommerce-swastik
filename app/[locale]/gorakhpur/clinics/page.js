"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';

export default function ClinicDirectory() {
    const { cartCount, toggleCart } = useCart();
    const [clinics, setClinics] = useState([]);
    const [stats, setStats] = useState({ min: 200, avg: 450, max: 1200 });

    const mockClinics = [
        {
            id: '1',
            name: 'Dr Tariq Khan Clinic',
            type: 'Sexology Clinic',
            location: 'B.R.D Medical College, Gorakhpur',
            fee: 500,
            specialties: 1,
            doctorsCount: 1,
            openingHours: '12:00 AM - 5:00 PM',
            rating: 3.5,
            ratingCount: 18,
            doctor: {
                name: 'Dr. Tariq Khan',
                specialty: 'Sexologist',
                experience: 15,
                recommendation: 78,
                stories: 18,
                photo: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png'
            }
        },
        {
            id: '2',
            name: 'Life Ayurveda Clinic',
            type: 'Ayurvedic Center',
            location: 'Civil Lines, Gorakhpur',
            fee: 300,
            specialties: 3,
            doctorsCount: 2,
            openingHours: '10:00 AM - 8:00 PM',
            rating: 4.8,
            ratingCount: 142,
            doctor: {
                name: 'Dr. Shalini Singh',
                specialty: 'Ayurveda Expert',
                experience: 12,
                recommendation: 95,
                stories: 64,
                photo: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png'
            }
        }
    ];

    useEffect(() => {
        setClinics(mockClinics);
    }, []);

    return (
        <div className="min-h-screen bg-[#f0f0f5] font-sans text-[#414146]">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            {/* Breadcrumbs & Navigation Hub */}
            <div className="bg-white pt-24 pb-6 px-6 border-b border-slate-200">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Home / Healthcare Directory / Uttar Pradesh / <span className="text-slate-900">Gorakhpur</span>
                        </div>
                        <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">
                            639 Verified Specialists in Gorakhpur
                        </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 mb-2">Clinics in Gorakhpur</h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <i className="fa-solid fa-circle-check text-emerald-500"></i> Local & Verified Medical Facilities
                            </p>
                        </div>
                        
                        <div className="flex gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:w-48">
                                <i className="fa-solid fa-map-pin absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                                <input 
                                    type="text" 
                                    placeholder="Enter Pin-code" 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-10 pr-4 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-black transition-all">
                                Filter Results
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Main Results Container */}
                <div className="lg:col-span-8 space-y-8">
                    {clinics.map((clinic) => (
                        <div key={clinic.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-xl">
                            {/* Visual/Image Placeholder */}
                            <div className="w-full md:w-48 bg-slate-50 flex items-center justify-center border-r border-slate-50 min-h-[150px]">
                                <i className="fa-solid fa-hospital text-4xl text-slate-200"></i>
                            </div>

                            {/* Clinic Information */}
                            <div className="flex-1 p-8">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-2xl font-black text-indigo-900 mb-1">{clinic.name}</h2>
                                        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
                                            <span>{clinic.type}</span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                                            <span className="flex items-center gap-1"><i className="fa-solid fa-location-dot text-indigo-500"></i> {clinic.location}</span>
                                        </div>
                                    </div>
                                    <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-2">
                                        <i className="fa-solid fa-star"></i> {clinic.rating} ({clinic.ratingCount} rated)
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 mb-8 text-xs font-black uppercase tracking-widest text-slate-500">
                                    <span className="text-slate-900">₹{clinic.fee} Consultation</span>
                                    <span>{clinic.specialties} Specialties</span>
                                    <span>{clinic.doctorsCount} Doctor</span>
                                    <span className="text-emerald-500"><i className="fa-solid fa-clock"></i> Open {clinic.openingHours}</span>
                                </div>

                                {/* Nested Doctor Card */}
                                <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 flex items-center gap-6 mb-8">
                                    <img src={clinic.doctor.photo} className="w-14 h-14 rounded-full border-2 border-white shadow-sm" alt="dr" />
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900">{clinic.doctor.name}</h4>
                                        <p className="text-xs font-bold text-slate-400 mb-2">{clinic.doctor.specialty} | {clinic.doctor.experience} years exp</p>
                                        <div className="flex items-center gap-4 text-[10px] font-black text-emerald-600">
                                            <span><i className="fa-solid fa-thumbs-up"></i> {clinic.doctor.recommendation}%</span>
                                            <span className="text-slate-300">|</span>
                                            <span>{clinic.doctor.stories} Patient Stories</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-indigo-100 shadow-xl hover:scale-105 transition-all">
                                        Book Clinic Visit
                                    </button>
                                    <button className="flex-1 border-2 border-slate-100 text-slate-900 py-4 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                        <i className="fa-solid fa-phone text-indigo-500"></i> Call Clinic
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar Stats & Filters */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Clinic Overview</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                                <span className="text-xs font-bold text-slate-500">Average Fee</span>
                                <span className="text-lg font-black text-slate-900">₹{stats.avg}</span>
                            </div>
                            <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                                <span className="text-xs font-bold text-slate-500">Wait Time</span>
                                <span className="text-lg font-black text-slate-900">30 - 60 min</span>
                            </div>
                            <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                                <span className="text-xs font-bold text-slate-500">Top Rating</span>
                                <span className="text-lg font-black text-emerald-600">4.8 <i className="fa-solid fa-star"></i></span>
                            </div>
                        </div>
                        <div className="mt-8 pt-8 border-t border-slate-50">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Pricing Spectrum</h4>
                            <div className="flex justify-between text-[10px] font-black">
                                <span>₹{stats.min} (Min)</span>
                                <span className="text-indigo-600">₹{stats.avg} (Avg)</span>
                                <span>₹{stats.max} (Max)</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '45%' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Nearby Cities Sidebar */}
                    <div className="bg-slate-900 rounded-3xl p-8 text-white">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Clinics in Top Cities</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {['Patna', 'Lucknow', 'Varanasi', 'Jaipur', 'Bhopal'].map(city => (
                                <a key={city} href="#" className="flex justify-between items-center group">
                                    <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-all">Clinics in {city}</span>
                                    <i className="fa-solid fa-chevron-right text-[10px] text-slate-600"></i>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
