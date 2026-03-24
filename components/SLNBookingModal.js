"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function SLNBookingModal({ isOpen, onClose, targetItem, serviceType }) {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        guestName: session?.user?.name || "",
        guestPhone: session?.user?.phone || "",
        guestEmail: session?.user?.email || "",
        details: ""
    });

    if (!isOpen) return null;

    const handlePayment = async (leadData) => {
        try {
            const res = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: 100, // Standard 100 INR for booking
                    type: 'lead_booking',
                    targetId: targetItem.id
                })
            });
            const { order } = await res.json();

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Swastik Medicare",
                description: `Booking for ${targetItem.name || targetItem.shopName}`,
                order_id: order.id,
                handler: async (response) => {
                    const verifyRes = await fetch('/api/payments/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...response,
                            type: 'lead_booking',
                            leadId: leadData.id,
                            amount: 100
                        })
                    });
                    if (verifyRes.ok) {
                        alert("Payment successful! Your booking is confirmed.");
                        onClose();
                    }
                }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error("Payment Error:", err);
            alert("Booking submitted, but payment failed. Our team will contact you.");
            onClose();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const publisherId = localStorage.getItem('sln_publisher_id');
            const res = await fetch('/api/sln/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceType,
                    providerId: targetItem.id,
                    userId: session?.user?.id,
                    publisherId,
                    ...formData
                })
            });
            const data = await res.json();
            if (data.success) {
                // For demonstration, all bookings trigger payment
                // In production, this might depend on serviceType or setting
                await handlePayment(data.lead);
            }
        } catch (error) {
            alert("Failed to submit request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                <div className="bg-slate-900 p-8 text-white relative">
                    <button onClick={onClose} className="absolute top-6 right-6 text-white/60 hover:text-white">
                        <i className="fa-solid fa-xmark text-xl"></i>
                    </button>
                    <span className="bg-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">
                        Swastik Lead Network
                    </span>
                    <h2 className="text-2xl font-black">Book via Swastik</h2>
                    <p className="text-white/60 text-sm mt-1">Get priority services and confirmed appointments.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="bg-blue-50 p-4 rounded-2xl flex items-center gap-4 border border-blue-100">
                        <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                            <i className={`fa-solid ${serviceType === 'doctor' ? 'fa-user-doctor' : (serviceType === 'hospital' ? 'fa-hospital' : 'fa-shop')}`}></i>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">Booking For</p>
                            <p className="font-bold text-blue-900">{targetItem.name || targetItem.shopName}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Your Name</label>
                            <input 
                                type="text" required
                                className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500"
                                value={formData.guestName}
                                onChange={e => setFormData({...formData, guestName: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Phone</label>
                            <input 
                                type="tel" required
                                className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500"
                                value={formData.guestPhone}
                                onChange={e => setFormData({...formData, guestPhone: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Additional Details</label>
                        <textarea 
                            className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 h-24"
                            placeholder="e.g. Appointment date or specific requirements..."
                            value={formData.details}
                            onChange={e => setFormData({...formData, details: e.target.value})}
                        ></textarea>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-black transition-all flex justify-center items-center gap-3"
                    >
                        {loading ? 'Submitting...' : '🚀 Submit Booking Request'}
                    </button>
                    <p className="text-center text-[10px] text-gray-400 font-medium italic">
                        * By clicking, you agree to share your details for lead verification.
                    </p>
                </form>
            </div>
        </div>
    );
}
