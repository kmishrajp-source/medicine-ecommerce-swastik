"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { Link } from "@/i18n/navigation";

export default function DeliveryAgentOnboarding() {
    const { cartCount, toggleCart } = useCart();
    
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        area: "Gorakhpur",
        vehicle: "bike",
        availability: "full-time"
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        if (!formData.name || !formData.phone) {
            setError("Name and Phone are required.");
            return;
        }
        
        setSubmitting(true);
        try {
            const res = await fetch("/api/agents/onboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if (data.success) {
                setSuccess(true);
            } else {
                setError(data.message || "Something went wrong.");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            
            <main className="max-w-4xl mx-auto px-6 pt-32 pb-24">
                <div className="bg-indigo-600 rounded-[3rem] overflow-hidden shadow-2xl relative">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 relative z-10">
                        {/* Left Side: Information */}
                        <div className="p-10 md:p-16 text-white flex flex-col justify-center">
                            <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest w-fit mb-6 shadow-md">
                                Hiring Now
                            </span>
                            <h1 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tighter leading-none">
                                Join The Swastik Fleet
                            </h1>
                            <p className="text-indigo-200 font-bold mb-10 text-lg">
                                Deliver medicines to patients across Gorakhpur and earn daily payouts, flexible hours, and guaranteed bonuses.
                            </p>
                            
                            <div className="space-y-6">
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-xl shadow-inner shadow-indigo-400">
                                        <i className="fa-solid fa-indian-rupee-sign"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg">Daily Payouts</h4>
                                        <p className="text-xs font-bold text-indigo-300">Earn per delivery directly to UPI</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-xl shadow-inner shadow-indigo-400">
                                        <i className="fa-solid fa-clock"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg">Flexible Hours</h4>
                                        <p className="text-xs font-bold text-indigo-300">Choose when you want to work</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-xl shadow-inner shadow-indigo-400">
                                        <i className="fa-solid fa-map-location-dot"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg">Local Deliveries</h4>
                                        <p className="text-xs font-bold text-indigo-300">Work within Gorakhpur city limits</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Right Side: Form */}
                        <div className="bg-white p-10 md:p-16 rounded-[3rem] md:rounded-l-[3rem] md:rounded-r-none m-2 md:m-0 md:ml-2 shadow-inner">
                            {success ? (
                                <div className="text-center py-10 animate-in fade-in zoom-in duration-300">
                                    <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">
                                        <i className="fa-solid fa-check"></i>
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Application Received!</h2>
                                    <p className="text-slate-500 font-bold mb-8">
                                        Welcome to Swastik Medicare. Our fleet manager will contact you within 24 hours for document verification.
                                    </p>
                                    <Link href="/" className="inline-block bg-slate-100 text-slate-600 font-black py-4 px-8 rounded-xl text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                                        Back to Home
                                    </Link>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Submit Details</h3>
                                    
                                    {error && (
                                        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold mb-6 border border-red-100">
                                            <i className="fa-solid fa-circle-exclamation mr-2"></i> {error}
                                        </div>
                                    )}
                                    
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                                            <div className="relative">
                                                <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                                                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border whitespace-nowrap border-slate-200 rounded-2xl focus:border-indigo-600 outline-none font-bold text-slate-900 transition-colors" placeholder="Enter name" />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                                            <div className="relative">
                                                <i className="fa-solid fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                                                <input required type="tel" name="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} maxLength="10" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-600 outline-none font-bold text-slate-900 transition-colors" placeholder="10-digit mobile number" />
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Area</label>
                                                <select name="area" value={formData.area} onChange={handleChange} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-600 outline-none font-bold text-slate-900 transition-colors appearance-none">
                                                    <option value="Gorakhpur Central">Gorakhpur Central</option>
                                                    <option value="Gorakhnath">Gorakhnath</option>
                                                    <option value="Medical Road">Medical Road</option>
                                                    <option value="Betiahata">Betiahata</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vehicle Type</label>
                                                <select name="vehicle" value={formData.vehicle} onChange={handleChange} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-600 outline-none font-bold text-slate-900 transition-colors appearance-none">
                                                    <option value="bike">Motorcycle (2-Wheeler)</option>
                                                    <option value="scooter">Scooter (2-Wheeler)</option>
                                                    <option value="cycle">Bicycle</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        type="submit" 
                                        disabled={submitting}
                                        className="w-full mt-8 bg-slate-900 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] shadow-xl shadow-slate-200 hover:bg-indigo-600 hover:shadow-indigo-200 transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? <><i className="fa-solid fa-spinner fa-spin"></i> Submitting...</> : "Submit Application"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
