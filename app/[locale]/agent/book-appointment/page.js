"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AgentBookAppointment() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [doctors, setDoctors] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [formData, setFormData] = useState({
        doctorId: "",
        patientName: "",
        patientPhone: "",
        date: "",
        reason: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && !['ADMIN', 'AGENT', 'SUPER_ADMIN'].includes(session.user.role)) {
            router.push("/");
        }
    }, [status]);

    // Fetch doctors based on search query
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await fetch(`/api/doctors?q=${searchQuery}`);
                const data = await res.json();
                if (data.success) {
                    setDoctors(data.doctors);
                }
            } catch (err) {
                console.error("Error fetching doctors", err);
            }
        };
        const timeoutId = setTimeout(() => {
            fetchDoctors();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        try {
            const res = await fetch("/api/agent/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setMessage({ type: "success", text: "Appointment successfully booked!" });
                setFormData({ doctorId: "", patientName: "", patientPhone: "", date: "", reason: "" });
            } else {
                setMessage({ type: "error", text: data.error || "Failed to book appointment" });
            }
        } catch (error) {
            setMessage({ type: "error", text: "An unexpected error occurred." });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === "loading") return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="bg-[#f8fafc] min-h-screen pb-20">
            {/* Header Section */}
            <div className="bg-white border-b border-slate-200 px-8 py-10 mb-8 shadow-sm">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">
                        <i className="fa-solid fa-calendar-check text-indigo-600 mr-3"></i>
                        Agent Booking Portal
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                        Book appointments for customers on their behalf
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-8">
                {message && (
                    <div className={`p-4 mb-6 rounded-2xl font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {message.text}
                    </div>
                )}

                <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Doctor Selection */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">1. Select Doctor</label>
                                <input 
                                    type="text" 
                                    placeholder="Search doctor by name or specialty..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                            
                            {doctors.length > 0 && (
                                <div className="bg-slate-50 border border-slate-200 rounded-2xl max-h-60 overflow-y-auto p-2">
                                    {doctors.map(doc => (
                                        <div 
                                            key={doc.id}
                                            onClick={() => setFormData({...formData, doctorId: doc.id})}
                                            className={`p-3 rounded-xl cursor-pointer transition-colors border-2 ${formData.doctorId === doc.id ? 'border-indigo-500 bg-indigo-50' : 'border-transparent hover:bg-slate-100'}`}
                                        >
                                            <p className="font-bold text-slate-900">{doc.name}</p>
                                            <p className="text-xs text-slate-500">{doc.specialization} • {doc.hospital || "Private Clinic"} • {doc.isDirectory ? "(Directory Listing)" : "(Registered Partner)"}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Patient Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">2. Patient Name</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="e.g. Rahul Kumar"
                                    value={formData.patientName}
                                    onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">3. Patient Mobile</label>
                                <input 
                                    type="tel" 
                                    required
                                    placeholder="10-digit mobile number"
                                    value={formData.patientPhone}
                                    onChange={(e) => setFormData({...formData, patientPhone: e.target.value})}
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Appointment Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">4. Appointment Date & Time</label>
                                <input 
                                    type="datetime-local" 
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">5. Reason / Symptoms</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Fever, Consultation"
                                    value={formData.reason}
                                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting || !formData.doctorId}
                            className={`w-full p-5 mt-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all ${isSubmitting || !formData.doctorId ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-500/20'}`}
                        >
                            {isSubmitting ? "Booking..." : "Confirm Booking"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
