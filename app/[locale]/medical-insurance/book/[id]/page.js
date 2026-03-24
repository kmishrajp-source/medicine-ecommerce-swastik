"use client";
import { useState, useEffect, use } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function BookingPage({ params }) {
    const { id } = use(params);
    const { cartCount, toggleCart } = useCart();
    const router = useRouter();
    const { data: session } = useSession();

    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        guestName: "",
        guestPhone: "",
        guestEmail: "",
        healthDetails: "",
        paymentMethod: "UPI"
    });

    useEffect(() => {
        fetchPlan();
        if (session?.user) {
            setFormData(prev => ({
                ...prev,
                guestName: session.user.name || "",
                guestEmail: session.user.email || ""
            }));
        }
    }, [id, session]);

    const fetchPlan = async () => {
        try {
            const res = await fetch(`/api/insurance/plans?id=${id}`);
            const data = await res.json();
            if (data.success && data.plans.length > 0) {
                setPlan(data.plans[0]);
            }
        } catch (error) {
            console.error("Failed to fetch plan", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Create Lead
            const res = await fetch('/api/insurance/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: id,
                    ...formData,
                    userId: session?.user?.id,
                    publisherId: localStorage.getItem('sln_publisher_id') // Check for referral
                })
            });
            const data = await res.json();
            
            if (data.success) {
                // 2. Simulate Payment Redirection
                console.log("Lead created:", data.leadId);
                setStep(3); // Show Payment Simulation
                setTimeout(() => simulatePayment(data.leadId), 2000);
            }
        } catch (error) {
            alert("Booking failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const simulatePayment = async (leadId) => {
        // Mock payment verification
        try {
            const res = await fetch('/api/insurance/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    leadId,
                    paymentId: 'pay_' + Math.random().toString(36).substr(2, 9),
                    status: 'success'
                })
            });
            const data = await res.json();
            if (data.success) {
                router.push(`/medical-insurance/confirmation?leadId=${leadId}`);
            }
        } catch (error) {
            alert("Payment verification failed");
        }
    };

    if (loading && !plan) return <div className="flex justify-center py-40"><i className="fa-solid fa-spinner fa-spin text-4xl text-blue-600"></i></div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">
                <div className="mb-12 text-center">
                    <h1 className="text-3xl font-black text-slate-900">Complete Your Application</h1>
                    <p className="text-slate-500 mt-2">Secure your {plan?.name} policy in just 3 steps.</p>
                    
                    {/* Stepper */}
                    <div className="flex items-center justify-center mt-8 gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                        <div className={`h-1 w-12 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                        <div className={`h-1 w-12 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Form Side */}
                    <div className="md:col-span-2">
                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                            {step === 1 && (
                                <form className="space-y-6">
                                    <h3 className="text-xl font-bold mb-6">Personal Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Full Name</label>
                                            <input 
                                                type="text" required
                                                className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g. John Doe"
                                                value={formData.guestName}
                                                onChange={e => setFormData({...formData, guestName: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Phone Number</label>
                                            <input 
                                                type="tel" required
                                                className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g. 9876543210"
                                                value={formData.guestPhone}
                                                onChange={e => setFormData({...formData, guestPhone: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email Address</label>
                                        <input 
                                            type="email" required
                                            className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g. john@example.com"
                                            value={formData.guestEmail}
                                            onChange={e => setFormData({...formData, guestEmail: e.target.value})}
                                        />
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg mt-4"
                                    >
                                        Continue to Health Info
                                    </button>
                                </form>
                            )}

                            {step === 2 && (
                                <form onSubmit={handleBooking} className="space-y-6">
                                    <h3 className="text-xl font-bold mb-6">Health Information</h3>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Any Pre-existing Conditions?</label>
                                        <textarea 
                                            className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 h-32"
                                            placeholder="Please describe any medical history or current conditions..."
                                            value={formData.healthDetails}
                                            onChange={e => setFormData({...formData, healthDetails: e.target.value})}
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Payment Method</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {['UPI', 'Card', 'NetBanking'].map(m => (
                                                <div 
                                                    key={m}
                                                    onClick={() => setFormData({...formData, paymentMethod: m})}
                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${formData.paymentMethod === m ? 'border-blue-600 bg-blue-50' : 'border-gray-100'}`}
                                                >
                                                    <div className={`w-4 h-4 rounded-full border-2 ${formData.paymentMethod === m ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}></div>
                                                    <span className="text-sm font-bold">{m}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <button 
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="w-1/3 border-2 border-gray-100 text-gray-500 font-bold py-4 rounded-2xl"
                                        >
                                            Back
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50 flex justify-center items-center gap-2"
                                        >
                                            {loading ? 'Processing...' : `Pay ₹${plan?.premium.toLocaleString()}`}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {step === 3 && (
                                <div className="py-20 text-center space-y-6">
                                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-500 text-3xl">
                                        <i className="fa-solid fa-credit-card fa-beat"></i>
                                    </div>
                                    <h3 className="text-2xl font-bold">Verifying Payment...</h3>
                                    <p className="text-slate-500 max-w-xs mx-auto">Please do not refresh the page. We are securely processing your transaction via {formData.paymentMethod}.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Summary Side */}
                    <div className="md:col-span-1">
                        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl sticky top-32">
                            <h4 className="text-lg font-bold mb-6 border-b border-white/10 pb-4">Order Summary</h4>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-blue-400">
                                        <i className="fa-solid fa-file-medical"></i>
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/40 uppercase font-black tracking-tighter">Plan Selected</p>
                                        <p className="font-bold text-sm">{plan?.name}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/40 font-medium">Annual Premium</span>
                                        <span className="font-bold">₹{plan?.premium.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/40 font-medium">Platform Fee</span>
                                        <span className="text-green-400 font-bold">FREE</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/40 font-medium">Estimated Cashback</span>
                                        <span className="text-green-400 font-bold">₹{(plan?.premium * plan?.commissionRate / 100).toFixed(0)}</span>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                                    <span className="text-sm font-bold uppercase text-white/40">Total Amount</span>
                                    <span className="text-2xl font-black text-white">₹{plan?.premium.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
