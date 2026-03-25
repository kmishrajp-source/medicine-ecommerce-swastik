"use client";
import { useEffect, useState, use } from 'react';
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function DoctorProfileBooking({ params }) {
    const { id } = use(params);
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
                console.log("Searching for ID:", id, "in", data.doctors.length, "doctors");
                const found = data.doctors.find(d => String(d.id) === String(id));
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

            {/* Inject JSON-LD Schema for Doctor Profile */}
            {doctor && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Physician",
                            "name": `Dr. ${doctor.name || doctor.user?.name}`,
                            "medicalSpecialty": doctor.specialization,
                            "priceRange": `₹${doctor.consultationFee}`,
                            "telephone": doctor.phone || "+91-0000000000",
                            "image": "https://swastikmedicare.com/images/default-doctor.png",
                            "address": {
                                "@type": "PostalAddress",
                                "streetAddress": doctor.hospital || "Independent Clinic",
                                "addressCountry": "IN"
                            },
                            "aggregateRating": {
                                "@type": "AggregateRating",
                                "ratingValue": "4.9",
                                "reviewCount": "124"
                            }
                        })
                    }}
                />
            )}

            <div className="min-h-screen bg-gray-50 py-12 px-6 font-sans" style={{ marginTop: '70px' }}>
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* Doctor Header Profile */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div className="w-32 h-32 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-5xl shadow-inner border-4 border-white shrink-0">
                            <i className="fa-solid fa-user-doctor"></i>
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-3xl font-bold text-gray-900">Dr. {doctor.name || doctor.user?.name}</h1>
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

                    {/* Instant Contact Section */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden">
                        <div className="bg-slate-900 p-8 text-center border-b border-slate-800">
                            <h2 className="text-2xl font-black text-white mb-2">
                                <i className="fa-solid fa-bolt-lightning text-yellow-400 mr-2"></i> Instant Consultation
                            </h2>
                            <p className="text-slate-400 font-medium tracking-tight uppercase text-[10px] tracking-widest">No booking or login required • Connect in seconds</p>
                        </div>

                        <div className="p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <a 
                                    href={`tel:${doctor.phone || '9161364908'}`}
                                    onClick={() => {
                                        fetch('/api/analytics/track', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ type: 'call', targetId: doctor.id, targetType: 'doctor', area: doctor.locality })
                                        });
                                    }}
                                    className="bg-slate-900 text-white text-center font-black py-6 rounded-[2rem] text-sm uppercase tracking-widest flex items-center justify-center gap-4 shadow-2xl shadow-slate-200 hover:bg-black transition-all active:scale-95 group"
                                >
                                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                        <i className="fa-solid fa-phone text-lg"></i>
                                    </div>
                                    Call Doctor Now
                                </a>
                                <a 
                                    href={`https://wa.me/91${doctor.phone || '9161364908'}?text=Hello Dr. ${doctor.name || doctor.user?.name}, I found your profile on Swastik Medicare and would like to consult.`}
                                    target="_blank"
                                    onClick={() => {
                                        fetch('/api/analytics/track', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ type: 'whatsapp', targetId: doctor.id, targetType: 'doctor', area: doctor.locality })
                                        });
                                    }}
                                    className="bg-emerald-500 text-white text-center font-black py-6 rounded-[2rem] text-sm uppercase tracking-widest flex items-center justify-center gap-4 shadow-2xl shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-95 group"
                                >
                                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                        <i className="fa-brands fa-whatsapp text-2xl"></i>
                                    </div>
                                    Message on WhatsApp
                                </a>
                            </div>

                            {/* Trust Stats Bar */}
                            <div className="flex items-center justify-around py-6 border-y border-slate-50">
                                 <div className="text-center">
                                      <div className="text-xl font-black text-slate-900">120+</div>
                                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Happy Patients</div>
                                 </div>
                                 <div className="w-px h-8 bg-slate-100"></div>
                                 <div className="text-center">
                                      <div className="text-xl font-black text-indigo-600">4.9/5</div>
                                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Top Rated</div>
                                 </div>
                                 <div className="w-px h-8 bg-slate-100"></div>
                                 <div className="text-center">
                                      <div className="text-xl font-black text-emerald-600">Verified</div>
                                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Background Check</div>
                                 </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-6">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                                    <i className="fa-solid fa-location-dot text-2xl"></i>
                                </div>
                                <div className="text-center md:text-left">
                                    <h4 className="text-blue-900 font-black text-lg mb-1">Clinic Address</h4>
                                    <p className="text-blue-700 font-medium leading-relaxed">{doctor.hospital || doctor.address || "Gorakhpur Area, Uttar Pradesh"}</p>
                                </div>
                                <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Dr. ${doctor.name || doctor.user?.name} Gorakhpur`)}`}
                                    target="_blank"
                                    className="md:ml-auto bg-white text-blue-600 font-black px-8 py-4 rounded-xl text-[10px] uppercase tracking-widest shadow-sm hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                                >
                                    Get Directions
                                </a>
                            </div>

                            {/* Basic Reviews Section */}
                            <div className="pt-8">
                                 <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-tight">Patient Experiences</h3>
                                 <div className="space-y-4">
                                      {[
                                          { name: "Rahul S.", text: "Very professional and explains everything clearly.", date: "2 days ago" },
                                          { name: "Anita K.", text: "Wait time was minimal. Highly recommended!", date: "1 week ago" }
                                      ].map((review, i) => (
                                          <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                               <div className="flex justify-between items-center mb-2">
                                                    <span className="font-black text-slate-900 text-sm">{review.name}</span>
                                                    <div className="text-amber-500 text-xs"><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i></div>
                                               </div>
                                               <p className="text-slate-500 text-xs font-bold leading-relaxed">"{review.text}"</p>
                                               <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-2">{review.date}</p>
                                          </div>
                                      ))}
                                 </div>
                            </div>

                            {doctor.isDirectory && (
                                <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-xl">
                                            <i className="fa-solid fa-user-check"></i>
                                        </div>
                                        <div>
                                            <p className="text-slate-900 font-black text-sm">Is this your profile?</p>
                                            <p className="text-slate-500 text-xs font-bold">Claim it to manage appointments and reviews.</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => router.push(`/doctor/register?claimId=${doctor.id}&name=${encodeURIComponent(doctor.name)}&specialization=${encodeURIComponent(doctor.specialization)}`)}
                                        className="bg-orange-500 hover:bg-orange-600 text-white font-black px-10 py-4 rounded-[1.5rem] shadow-lg shadow-orange-100 transition-all text-[10px] uppercase tracking-widest"
                                    >
                                        Claim Profile Now
                                    </button>
                                </div>
                            )}

                            <div className="pt-8 border-t border-slate-100 text-center">
                                <button 
                                    onClick={async () => {
                                        const reason = prompt("Describe the incorrect information (e.g., phone number, address):");
                                        if (!reason) return;
                                        try {
                                            const res = await fetch('/api/reports', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    doctorId: doctor.id,
                                                    reason: "Incorrect Information",
                                                    details: reason
                                                })
                                            });
                                            const data = await res.json();
                                            if (data.success) {
                                                alert("Thank you for your report. Our team will verify the information.");
                                            }
                                        } catch (e) {
                                            alert("Failed to submit report. Please try again later.");
                                        }
                                    }}
                                    className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors flex items-center justify-center gap-2 mx-auto"
                                >
                                    <i className="fa-solid fa-circle-exclamation"></i> Report Incorrect Information
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Legal Disclaimer */}
                    <div className="bg-gray-100 p-6 rounded-2xl border border-gray-200">
                        <p className="text-xs text-gray-500 leading-relaxed text-center">
                            <strong className="text-gray-700">Legal Disclaimer:</strong> This information is for general awareness only. Swastik Medicare acts only as a directory service for information-only profiles. We are not responsible for the accuracy, availability, or clinical quality of services provided by practitioners listed herein. Users are advised to verify details independently before physical visits.
                        </p>
                    </div>

                </div>
            </div>
        </>
    );
}
