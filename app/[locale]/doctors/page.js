"use client";
import { useEffect, useState } from 'react';
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function DoctorDirectory() {
    const { cartCount, toggleCart } = useCart();
    const router = useRouter();

    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    // Smart Routing State
    const [smartSearchSymptoms, setSmartSearchSymptoms] = useState("");
    const [smartSearchSpecialty, setSmartSearchSpecialty] = useState("General Physician");
    const [isMatching, setIsMatching] = useState(false);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/doctors');
            const data = await res.json();
            if (data.success) {
                setDoctors(data.doctors);
            }
        } catch (error) {
            console.error("Failed to fetch doctors", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSmartMatch = async (e) => {
        e.preventDefault();
        setIsMatching(true);

        try {
            // Assume the user is logged in for generating the appointment.
            // In a real app we'd trigger a login modal here if not authenticated.
            const sessionRes = await fetch('/api/auth/session');
            const sessionData = await sessionRes.json();
            
            if (!sessionData || !sessionData.user) {
                alert("Please login to book an appointment.");
                setIsMatching(false);
                return;
            }

            // Estimate tomorrow 10am for default instant slot
            const tmr = new Date();
            tmr.setDate(tmr.getDate() + 1);
            tmr.setHours(10, 0, 0, 0);

            const matchRes = await fetch("/api/appointments/match", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    specialization: smartSearchSpecialty,
                    appointmentDate: tmr.toISOString(),
                    userId: sessionData.user.id,
                    symptoms: smartSearchSymptoms
                })
            });

            const matchData = await matchRes.json();

            if (matchData.success) {
                alert(`Found the perfect match! You are booked with Dr. ${matchData.doctorSelected.name}. Please pay the ₹${matchData.doctorSelected.fee} fee to confirm.`);
                // Route to a checkout page or their dashboard
                router.push(`/profile`); 
            } else {
                alert(matchData.error || "Could not find a match.");
            }
        } catch (err) {
            alert("Matching failed. Try booking manually below.");
        } finally {
            setIsMatching(false);
        }
    };

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <div className="bg-blue-50 py-16 px-6" style={{ marginTop: '70px' }}>
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 tracking-tight">
                        Consult Top Specialists Online
                    </h1>
                    <p className="mt-4 text-xl text-blue-700 max-w-2xl mx-auto mb-10">
                        Skip the waiting room. Book secure, private video consultations with verified doctors right from your home.
                    </p>

                    {/* SMART ROUTING SEARCH BOX */}
                    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-xl border border-blue-100 text-left">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-wand-magic-sparkles text-blue-600"></i> Auto-Match with the Best Doctor
                        </h3>
                        <form onSubmit={handleSmartMatch} className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Specialty</label>
                                <select 
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    value={smartSearchSpecialty}
                                    onChange={(e) => setSmartSearchSpecialty(e.target.value)}
                                >
                                    <option value="General Physician">General Physician</option>
                                    <option value="Cardiologist">Cardiologist</option>
                                    <option value="Dermatologist">Dermatologist</option>
                                    <option value="Pediatrician">Pediatrician</option>
                                    <option value="Gynecologist">Gynecologist</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Describe Symptoms</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Mild fever and headache"
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    value={smartSearchSymptoms}
                                    onChange={(e) => setSmartSearchSymptoms(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex items-end">
                                <button 
                                    type="submit" 
                                    disabled={isMatching}
                                    className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-70"
                                >
                                    {isMatching ? "Finding Match..." : "Find Doctor"}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 md:p-12 font-sans">
                {loading ? (
                    <div className="text-center py-20 text-gray-500 text-lg">
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading Verified Specialists...
                    </div>
                ) : doctors.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-gray-500 text-lg">No verified doctors are currently accepting appointments.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {doctors.map((doctor) => (
                            <div key={doctor.id} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all hover:-translate-y-1">
                                <div className="h-32 bg-gradient-to-r from-blue-400 to-indigo-500 relative"></div>
                                <div className="px-8 pb-8 relative">
                                    <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-md mx-auto -mt-12 flex items-center justify-center text-4xl text-blue-500 z-10 relative overflow-hidden">
                                        <i className="fa-solid fa-user-doctor"></i>
                                    </div>
                                    <div className="text-center mt-4 space-y-1">
                                        <h3 className="text-2xl font-bold text-gray-900">Dr. {doctor.name}</h3>
                                        <p className="text-indigo-600 font-semibold tracking-wide uppercase text-sm">{doctor.specialization}</p>
                                        <p className="text-gray-500 text-sm"><i className="fa-solid fa-building text-gray-300 mr-1"></i> {doctor.hospital || "Independent Practice"}</p>
                                        {doctor.isDirectory && (
                                            <p className="text-orange-600 bg-orange-50 py-1 px-3 rounded-full text-xs font-bold inline-block mt-2 border border-orange-100 uppercase">
                                                Information Only
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
                                        <div className="text-left">
                                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Experience</p>
                                            <p className="font-semibold text-gray-800">{doctor.experience || 0} Years</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{doctor.isDirectory ? "Consultation" : "Fee"}</p>
                                            <p className="font-bold text-gray-900 text-lg">{doctor.isDirectory ? "Visit Clinic" : `₹${doctor.consultationFee}`}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => router.push(`/doctors/${doctor.id}`)}
                                        className={`w-full mt-8 font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2 ${doctor.isDirectory ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                                        {doctor.isDirectory ? "View Clinic Info" : "Book Appointment"} <i className="fa-solid fa-arrow-right"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
