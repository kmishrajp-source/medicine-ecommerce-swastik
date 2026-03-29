"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function LeadCaptureModal({ isOpen, onClose, providerId, serviceType, providerName, onSuccess }) {
    const { data: session } = useSession();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [need, setNeed] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Auto-fill logged in user details
    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || "");
            // If phone exists in session, set it here (depends on session setup)
        }
    }, [session]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!name || !phone || !need) {
            setError("All fields are required.");
            return;
        }

        if (phone.length < 10) {
            setError("Please enter a valid phone number.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/marketplace/enquiry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    providerId,
                    serviceType,
                    guestName: name,
                    guestPhone: phone,
                    need,
                    area: "Gorakhpur" // Or pass dynamic area
                }),
            });

            const data = await res.json();
            if (data.success) {
                if (onSuccess) onSuccess(data.leadId);
                else alert("Your request has been submitted successfully! We will contact you soon.");
                onClose();
            } else {
                setError(data.message || "Failed to submit request.");
            }
        } catch (err) {
            console.error(err);
            setError("A network error occurred.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-indigo-600 p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Contact Request</h3>
                        <p className="text-indigo-200 text-sm font-bold">For {providerName || "Service Provider"}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex gap-2 items-center">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Your Name</label>
                            <div className="relative">
                                <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all font-bold text-slate-900" 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Mobile Number</label>
                            <div className="relative">
                                <i className="fa-solid fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                <input 
                                    type="tel" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                    placeholder="10-digit mobile number"
                                    maxLength={10}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all font-bold text-slate-900 tracking-wider" 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">How can we help?</label>
                            <textarea 
                                value={need}
                                onChange={(e) => setNeed(e.target.value)}
                                placeholder={`E.g., "Need an appointment for tomorrow" or "Is this test available?"`}
                                rows={3}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all font-bold text-slate-900 resize-none" 
                            ></textarea>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full mt-6 bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-600 active:scale-95 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {submitting ? (
                            <><i className="fa-solid fa-spinner fa-spin"></i> Submitting...</>
                        ) : (
                            <>Submit Request <i className="fa-solid fa-arrow-right"></i></>
                        )}
                    </button>
                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">
                        <i className="fa-solid fa-shield-halved text-emerald-500 mr-1"></i> Your data is safe & private
                    </p>
                </form>
            </div>
        </div>
    );
}
