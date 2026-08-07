"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EmergencySOS() {
    const params = useParams();
    const locale = params?.locale || "en";

    const [formData, setFormData] = useState({
        contactName: "",
        contactPhone: "",
        entityType: "UNREGISTERED",
        medicineName: "",
        quantity: "",
        location: "",
        pincode: "",
        notes: ""
    });
    
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/sos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.success) {
                setSuccess(true);
            } else {
                setError(data.error || "Failed to submit SOS. Please call the helpline.");
            }
        } catch (err) {
            console.error(err);
            setError("Network error. Please check your connection or call the helpline.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-slate-800 rounded-3xl p-10 text-center border-2 border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                    <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="fa-solid fa-check text-5xl text-red-500"></i>
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">SOS Received</h1>
                    <p className="text-slate-300 font-medium mb-8">
                        Your emergency request has been broadcasted to our network. Our team will contact you at <strong>{formData.contactPhone}</strong> immediately.
                    </p>
                    <Link href={`/${locale}`} className="inline-block px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-sm rounded-full transition-all">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 py-20 px-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-6 animate-pulse">
                        <i className="fa-solid fa-truck-medical text-4xl text-red-500"></i>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
                        Emergency <span className="text-red-500">SOS</span>
                    </h1>
                    <p className="text-slate-400 font-bold max-w-lg mx-auto">
                        For unregistered retailers, stockists, and hospitals facing critical medicine shortages. We will connect you with a supplier immediately.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-slate-800 rounded-3xl p-8 md:p-10 border border-slate-700 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-bl-full pointer-events-none"></div>
                    
                    {error && (
                        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 font-bold mb-8 text-center text-sm">
                            <i className="fa-solid fa-triangle-exclamation mr-2"></i> {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Entity Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Contact Name *</label>
                                <input required type="text" name="contactName" value={formData.contactName} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors" placeholder="Your Name" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number *</label>
                                <input required type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors" placeholder="10-digit number" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">You Are A *</label>
                            <select name="entityType" value={formData.entityType} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors appearance-none">
                                <option value="UNREGISTERED">Unregistered / Independent individual</option>
                                <option value="RETAILER">Retail Pharmacy</option>
                                <option value="STOCKIST">Wholesaler / Stockist</option>
                                <option value="HOSPITAL">Hospital / Clinic</option>
                            </select>
                        </div>

                        {/* Medicine Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Medicine Required *</label>
                                <input required type="text" name="medicineName" value={formData.medicineName} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors" placeholder="e.g. Remdesivir 100mg" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Quantity *</label>
                                <input required type="text" name="quantity" value={formData.quantity} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors" placeholder="e.g. 50 vials" />
                            </div>
                        </div>

                        {/* Location Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Location / Area *</label>
                                <input required type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors" placeholder="City, Area Name" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Pincode</label>
                                <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors" placeholder="Optional" />
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Additional Notes (Optional)</label>
                            <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="3" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors" placeholder="Any specific urgency or brand preference?"></textarea>
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-4 mt-6 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] disabled:opacity-50 flex items-center justify-center"
                        >
                            {loading ? (
                                <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Broadcasting...</>
                            ) : (
                                <><i className="fa-solid fa-satellite-dish mr-2"></i> Broadcast SOS Request</>
                            )}
                        </button>
                    </div>
                </form>
                
                <div className="text-center mt-8 text-slate-500 text-sm font-bold">
                    In case of life-threatening emergencies, please dial 108 or your local emergency services directly.
                </div>
            </div>
        </div>
    );
}
