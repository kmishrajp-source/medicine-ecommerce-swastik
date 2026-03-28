"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { useSession } from "next-auth/react";

export default function MyHealthRecords() {
    const { cartCount, toggleCart } = useCart();
    const { data: session } = useSession();
    const [records, setRecords] = useState([]);

    useEffect(() => {
        // Mocking some initial records
        setRecords([
            { id: '1', date: '2024-03-24', type: 'Prescription', provider: 'Dr. Tariq Khan', details: 'Fever & Cold Treatment', status: 'Active' },
            { id: '2', date: '2024-03-20', type: 'Lab Report', provider: 'Swastik Diagnostics', details: 'Blood Count Analysis', status: 'Completed' }
        ]);
    }, []);

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <div className="pt-40 max-w-7xl mx-auto px-6 pb-20">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <span className="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
                            Digital Health Passport
                        </span>
                        <h1 className="text-4xl font-black text-slate-900 mb-2">My Health Records</h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Securely managing medical identity for {session?.user?.name || "Patient"}</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 flex items-center gap-2">
                            <i className="fa-solid fa-plus"></i> Upload Record
                        </button>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="text-3xl font-black text-slate-900 mb-1">02</div>
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Records</div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="text-3xl font-black text-indigo-600 mb-1">24x7</div>
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Consult Support</div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="text-3xl font-black text-emerald-600 mb-1">Verified</div>
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Data Privacy</div>
                    </div>
                </div>

                {/* Records Table */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                        <h2 className="text-xl font-black text-slate-900">Medical History</h2>
                        <div className="flex gap-2">
                            {['All', 'Prescriptions', 'Labs'].map(filter => (
                                <button key={filter} className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'All' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-100 text-slate-400'}`}>
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Professional / Clinic</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Summary</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {records.map((rec) => (
                                    <tr key={rec.id} className="hover:bg-slate-50/50 transition-all">
                                        <td className="px-8 py-6 text-sm font-bold text-slate-600">{new Date(rec.date).toLocaleDateString()}</td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${rec.type === 'Prescription' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                {rec.type}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-black text-slate-900">{rec.provider}</td>
                                        <td className="px-8 py-6 text-sm text-slate-400">{rec.details}</td>
                                        <td className="px-8 py-6">
                                            <button className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline">
                                                View PDF
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
