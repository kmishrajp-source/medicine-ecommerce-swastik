"use client";
import { useEffect, useState } from 'react';
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function DoctorProfileBooking({ params }) {
    const { id } = params;
    const { cartCount, toggleCart } = useCart();
    const router = useRouter();
    const { data: session } = useSession();

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);

    // Booking Form State
    const [date, setDate] = useState('');
    const [reason, setReason] = useState('');
    const [isBooking, setIsBooking] = useState(false);

    useEffect(() => {
        // Load Razorpay SDK
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        fetchDoctor();
    }, [id]);

    const fetchDoctor = async () => {
        try {
            // Note: In production we would build a dedicated GET /api/doctors/[id]
            const res = await fetch('/api/doctors');
            const data = await res.json();
            if (data.success) {
                const found = data.doctors.find(d => d.id === id);
                setDoctor(found);
            }
        } catch (error) {
            console.error("Failed to fetch doctor", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!session) {
            alert("Please login to book an appointment.");
            router.push('/login');
            return;
        }

        setIsBooking(true);
        try {
            // 1. Create the backend Razorpay Order with 100% Linked Account Transfer
            const res = await fetch('/api/doctors/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctorId: doctor.id,
                    date,
                    reason
                })
            });

            const data = await res.json();

            if (!data.success) {
                alert(data.error || "Failed to initiate booking.");
                setIsBooking(false);
                return;
            }

            // 2. Open Razorpay Checkout GUI
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YourTestKeyHere",
                amount: data.razorpayOrder.amount, // Amount is in currency subunits (Paise)
                currency: "INR",
                name: "Swastik Medicare",
                description: `Consultation with Dr. ${doctor.user.name}`,
                order_id: data.razorpayOrder.id,
                handler: async function (response) {
                    // 3. User successfully paid the Doctor. 
                    // Verify the payment to confirm the Appointment slot
                    const verifyRes = await fetch('/api/verify-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            orderType: 'APPOINTMENT',
                            appointmentId: data.appointment.id
                        })
                    });

                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                        alert("Appointment Confirmed! The doctor has received the payment.");
                        router.push('/profile'); // Redirect patient to their dashboard
                    } else {
                        alert("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: session?.user?.name || "",
                    email: session?.user?.email || "",
                },
                theme: {
                    color: "#2563EB",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", function (response) {
                alert("Payment Failed: " + response.error.description);
            });
            rzp.open();

        } catch (error) {
            console.error("Booking Checkout Error:", error);
            alert("An error occurred during booking.");
        } finally {
            setIsBooking(false);
        }
    };

    if (loading) return <div className="text-center py-32 text-gray-500 font-sans"><i className="fa-solid fa-spinner fa-spin text-3xl"></i></div>;
    if (!doctor) return <div className="text-center py-32 text-red-500 font-sans font-bold">Doctor Profile Not Found</div>;

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <div className="min-h-screen bg-gray-50 py-12 px-6 font-sans" style={{ marginTop: '70px' }}>
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* Doctor Header Profile */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div className="w-32 h-32 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-5xl shadow-inner border-4 border-white shrink-0">
                            <i className="fa-solid fa-user-doctor"></i>
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-3xl font-bold text-gray-900">Dr. {doctor.user?.name}</h1>
                            <p className="text-blue-600 font-semibold text-lg uppercase tracking-wide mt-1">{doctor.specialization}</p>

                            <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                                <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
                                    <i className="fa-solid fa-building text-gray-400 mr-2"></i> {doctor.hospital || "Independent Clinic"}
                                </span>
                                <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
                                    <i className="fa-solid fa-stethoscope text-gray-400 mr-2"></i> {doctor.experience || 0} Years Exp.
                                </span>
                                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Verify Practitioner
                                </span>
                            </div>
                        </div>
                        <div className="bg-blue-600 text-white rounded-2xl p-6 text-center shadow-lg w-full md:w-auto">
                            <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">Consultation Fee</p>
                            <p className="text-4xl font-extrabold">₹{doctor.consultationFee}</p>
                            <p className="text-blue-200 text-xs mt-2 opacity-80">100% Secure Transaction</p>
                        </div>
                    </div>

                    {/* Booking Form */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-white"><i className="fa-regular fa-calendar-check mr-2"></i> Schedule Appointment</h2>
                        </div>

                        <form onSubmit={handleBooking} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full border-2 border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                        min={new Date().toISOString().slice(0, 16)}
                                    />
                                </div>
                                <div className="hidden md:block">
                                    <div className="h-full border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center p-4 bg-gray-50 text-gray-400 text-sm text-center">
                                        Select an upcoming time slot. Instantly secure your appointment by paying via cards, UPI, or net banking.
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Symptoms or Reason for Visit</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Briefly describe what you're experiencing before joining the video call..."
                                    className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isBooking}
                                className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all text-lg flex justify-center items-center gap-3
                                    ${isBooking ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 hover:-translate-y-1'}`}>
                                {isBooking ? (
                                    <><i className="fa-solid fa-circle-notch fa-spin"></i> Processing Secure Checkout...</>
                                ) : (
                                    <><i className="fa-solid fa-lock"></i> Pay ₹{doctor.consultationFee} & Book Appointment</>
                                )}
                            </button>
                            <p className="text-center text-sm text-gray-400 mt-4">
                                By booking, you agree to our Telemedicine Terms of Service.
                                <br />The fee is transferred directly to the Doctor's authorized financial account.
                            </p>
                        </form>
                    </div>

                </div>
            </div>
        </>
    );
}
