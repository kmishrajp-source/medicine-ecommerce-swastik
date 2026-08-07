"use client";
import React, { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

export default function SwitchAndSave() {
    const { cartCount, toggleCart } = useCart();
    
    const [phone, setPhone] = useState("");
    const [competitorName, setCompetitorName] = useState("Amazon Pharmacy");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const fileInputRef = useRef(null);

    const competitors = [
        "Amazon Pharmacy",
        "1mg",
        "Apollo Pharmacy",
        "PharmEasy",
        "Netmeds",
        "Other Local Pharmacy"
    ];

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        
        if (!file) {
            setErrorMsg("Please upload an image of your bill.");
            return;
        }
        if (phone.length < 10) {
            setErrorMsg("Please enter a valid 10-digit mobile number.");
            return;
        }

        setLoading(true);

        try {
            // 1. Upload the image
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const uploadData = await uploadRes.json();

            if (!uploadData.success) {
                throw new Error(uploadData.error || "Failed to upload image. Please try again.");
            }

            const imageUrl = uploadData.url;

            // 2. Submit the competitor bill
            const billRes = await fetch("/api/competitor-bills", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    imageUrl,
                    competitorName,
                    phone
                })
            });

            const billData = await billRes.json();

            if (!billData.success) {
                throw new Error(billData.error || "Failed to submit bill. Please try again.");
            }

            setSuccess(true);
        } catch (error) {
            console.error("Submission error:", error);
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 pt-32 pb-24 px-6 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="inline-block bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-6 border border-emerald-500/30">
                        <i className="fa-solid fa-bolt mr-2 text-yellow-400"></i> Limited Time Offer
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black mb-6 tracking-tight leading-tight">
                        Switch to Swastik & <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">Save ₹100</span>
                    </h1>
                    <p className="text-lg md:text-xl text-indigo-200 font-medium max-w-2xl mx-auto leading-relaxed">
                        Are you buying your monthly medicines from Amazon, 1mg, or Apollo? Upload your last bill below, and we guarantee to beat their price PLUS give you a flat ₹100 cashback on your first order.
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 -mt-12 relative z-20 pb-20">
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 md:p-12">
                    {success ? (
                        <div className="text-center py-10">
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <i className="fa-solid fa-check text-4xl text-emerald-500"></i>
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 mb-4">Bill Received!</h2>
                            <p className="text-slate-500 text-lg mb-8">
                                Our pharmacists are reviewing your bill right now. You will receive a WhatsApp message on <strong className="text-slate-800">{phone}</strong> within 15 minutes with your custom ₹100 OFF coupon code!
                            </p>
                            <button 
                                onClick={() => window.location.href = '/shop-medicines'}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-xl transition-all"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div className="text-center mb-4">
                                <h2 className="text-2xl font-black text-slate-800">Upload Your Bill</h2>
                                <p className="text-slate-500 font-medium mt-1">Takes less than 30 seconds.</p>
                            </div>

                            {errorMsg && (
                                <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                                    <i className="fa-solid fa-circle-exclamation"></i>
                                    {errorMsg}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Which pharmacy did you buy from?</label>
                                <select 
                                    value={competitorName}
                                    onChange={(e) => setCompetitorName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium text-slate-800 appearance-none"
                                >
                                    {competitors.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Your WhatsApp Number (for the coupon)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold">
                                        +91
                                    </div>
                                    <input 
                                        type="tel" 
                                        placeholder="Enter 10-digit number" 
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium text-slate-800"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Upload Bill Image (Screenshot or Photo)</label>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`w-full border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${file ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50'}`}
                                >
                                    {file ? (
                                        <div>
                                            <i className="fa-solid fa-file-image text-4xl text-emerald-500 mb-2"></i>
                                            <p className="font-bold text-emerald-700">{file.name}</p>
                                            <p className="text-xs text-emerald-600 mt-1">Click to change file</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <i className="fa-solid fa-cloud-arrow-up text-4xl text-slate-400 mb-3"></i>
                                            <p className="font-bold text-slate-600">Click to browse files</p>
                                            <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WEBP</p>
                                        </div>
                                    )}
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/jpeg, image/png, image/webp"
                                    className="hidden" 
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className={`w-full mt-4 py-4 rounded-xl font-black text-lg transition-all flex justify-center items-center gap-2 ${loading ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-indigo-500/30'}`}
                            >
                                {loading ? (
                                    <><i className="fa-solid fa-spinner fa-spin"></i> Uploading...</>
                                ) : (
                                    <>Claim My ₹100 Cashback <i className="fa-solid fa-arrow-right"></i></>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="fa-solid fa-upload text-indigo-600 text-xl"></i>
                        </div>
                        <h3 className="font-bold text-slate-800 mb-2">1. Upload Bill</h3>
                        <p className="text-sm text-slate-500">Take a screenshot of your previous order from any major pharmacy.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="fa-solid fa-magnifying-glass-dollar text-yellow-600 text-xl"></i>
                        </div>
                        <h3 className="font-bold text-slate-800 mb-2">2. We Review</h3>
                        <p className="text-sm text-slate-500">Our pharmacists will instantly verify the bill and beat their pricing.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="fa-brands fa-whatsapp text-emerald-600 text-xl"></i>
                        </div>
                        <h3 className="font-bold text-slate-800 mb-2">3. Get Coupon</h3>
                        <p className="text-sm text-slate-500">Receive a custom ₹100 coupon code directly on your WhatsApp.</p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
