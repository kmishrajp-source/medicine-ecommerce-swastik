"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const type = searchParams.get('type') || 'doctor';

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        // Extra fields
        specialization: "",
        hospital: "",
        experience: "",
        address: "",
        companyName: ""
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/partner/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, type })
            });
            const data = await res.json();
            if (data.success) {
                alert("Registration Successful!");
                router.push("/login");
            } else {
                alert("Error: " + data.error);
            }
        } catch (err) {
            alert("Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const typeLabels = {
        'doctor': 'Doctor',
        'retailer': 'Medicine Retailer',
        'insurance': 'Insurance Provider',
        'lab': 'Diagnostic Lab'
    };

    return (
        <div className="max-w-xl mx-auto p-12 bg-white rounded-[3rem] shadow-2xl border border-slate-100">
            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-100">
                    <i className="fa-solid fa-user-plus text-2xl"></i>
                </div>
                <h2 className="text-3xl font-black text-slate-900">Join as a {typeLabels[type]}</h2>
                <p className="text-slate-500 mt-2 font-medium">Create your partner account to get started.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-2 block">Full Name</label>
                        <input type="text" placeholder="Dr. John Doe" required
                            className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-2 block">Phone</label>
                        <input type="text" placeholder="+91 98XXX XXXX" required
                            className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-2 block">Email Address</label>
                    <input type="email" placeholder="john@example.com" required
                        className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-2 block">Secure Password</label>
                    <input type="password" placeholder="••••••••" required
                        className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        onChange={e => setFormData({ ...formData, password: e.target.value })} />
                </div>

                {/* Conditional Fields */}
                {type === 'doctor' && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-2 block">Specialization</label>
                                <input type="text" placeholder="MBBS, MS" required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 outline-none"
                                    onChange={e => setFormData({ ...formData, specialization: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-2 block">Exp (Years)</label>
                                <input type="number" placeholder="5" required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 outline-none"
                                    onChange={e => setFormData({ ...formData, experience: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-2 block">Hospital / Clinic</label>
                            <input type="text" placeholder="Apex Hospital" required
                                className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 outline-none"
                                onChange={e => setFormData({ ...formData, hospital: e.target.value })} />
                        </div>
                    </>
                )}

                {type === 'retailer' && (
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-2 block">Store Address</label>
                        <textarea placeholder="Shop No. 5, Medical Chowk..." required rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 outline-none"
                            onChange={e => setFormData({ ...formData, address: e.target.value })} />
                    </div>
                )}

                {type === 'insurance' && (
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-2 block">Insurance Agency / Company Name</label>
                        <input type="text" placeholder="Star Health Agency" required
                            className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 outline-none"
                            onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
                    </div>
                )}

                <button type="submit" disabled={loading}
                    className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:shadow-2xl transition-all disabled:bg-slate-300">
                    {loading ? <i className="fa-solid fa-sync fa-spin"></i> : `Complete Registration`}
                </button>
            </form>
        </div>
    );
}

export default function PartnerRegisterPage() {
    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Navbar cartCount={0} />
            <div className="pt-32 px-6">
                <Suspense fallback={<div className="text-center py-20">Loading Form...</div>}>
                    <RegisterForm />
                </Suspense>
            </div>
        </div>
    );
}
