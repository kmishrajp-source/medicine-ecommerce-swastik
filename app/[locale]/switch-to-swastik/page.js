"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";

export default function SwitchToSwastik() {
    const t = useTranslations();
    const [file, setFile] = useState(null);
    const [competitorName, setCompetitorName] = useState("");
    const [phone, setPhone] = useState("");
    const [status, setStatus] = useState("idle"); // idle, loading, success, error

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !competitorName) return;

        setStatus("loading");

        try {
            // Upload image to local mock endpoint or Supabase
            // For this implementation, we will simulate a direct URL assignment
            const fakeImageUrl = "https://example.com/uploads/" + file.name.replace(/\s+/g, '-');

            const res = await fetch("/api/competitor-bills", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    imageUrl: fakeImageUrl,
                    competitorName,
                    phone
                })
            });

            if (res.ok) {
                setStatus("success");
                setFile(null);
                setCompetitorName("");
                setPhone("");
            } else {
                setStatus("error");
            }
        } catch (error) {
            console.error("Upload error:", error);
            setStatus("error");
        }
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen pt-24 pb-20">
            <div className="max-w-3xl mx-auto px-6">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                    <div className="bg-gradient-to-r from-cyan-600 to-indigo-600 p-10 text-center">
                        <h1 className="text-4xl font-black text-white mb-4">Switch to Swastik Medicare</h1>
                        <p className="text-cyan-100 font-bold text-lg">Upload your Amazon Pharmacy or 1mg bill and get a guaranteed ₹100 Flat Cashback on your first order!</p>
                    </div>

                    <div className="p-10">
                        {status === "success" ? (
                            <div className="text-center py-10">
                                <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <i className="fa-solid fa-check text-3xl"></i>
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 mb-2">Bill Uploaded Successfully!</h2>
                                <p className="text-slate-500 font-medium">Our team is verifying your bill. You will receive a unique ₹100 coupon code via SMS/WhatsApp shortly.</p>
                                <button 
                                    onClick={() => setStatus("idle")}
                                    className="mt-8 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full transition-all"
                                >
                                    Upload Another Bill
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Which platform are you switching from?</label>
                                    <select 
                                        required
                                        value={competitorName}
                                        onChange={(e) => setCompetitorName(e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-slate-200 focus:border-cyan-500 rounded-xl px-4 py-3 outline-none font-medium text-slate-700 transition-all"
                                    >
                                        <option value="">Select Platform</option>
                                        <option value="Amazon Pharmacy">Amazon Pharmacy</option>
                                        <option value="Tata 1mg">Tata 1mg</option>
                                        <option value="Apollo 24|7">Apollo 24|7</option>
                                        <option value="Pharmeasy">Pharmeasy</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Upload Bill/Invoice Screenshot</label>
                                    <div className="relative">
                                        <input 
                                            type="file" 
                                            required
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="bill-upload"
                                        />
                                        <label 
                                            htmlFor="bill-upload"
                                            className="w-full flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-300 hover:border-cyan-500 rounded-xl p-8 cursor-pointer transition-all"
                                        >
                                            <i className="fa-solid fa-cloud-arrow-up text-4xl text-slate-400 mb-4"></i>
                                            <span className="font-bold text-slate-600">{file ? file.name : "Tap to upload image (JPG, PNG)"}</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">WhatsApp Number (to receive Coupon)</label>
                                    <input 
                                        type="tel" 
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="e.g. 9876543210"
                                        className="w-full bg-slate-50 border-2 border-slate-200 focus:border-cyan-500 rounded-xl px-4 py-3 outline-none font-medium text-slate-700 transition-all"
                                    />
                                </div>

                                {status === "error" && (
                                    <p className="text-red-500 font-bold text-sm text-center">An error occurred. Please try again.</p>
                                )}

                                <button 
                                    type="submit"
                                    disabled={status === "loading"}
                                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all disabled:opacity-50"
                                >
                                    {status === "loading" ? "Uploading..." : "Claim ₹100 Cashback"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
