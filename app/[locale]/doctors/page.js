"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import DirectoryCard from "@/components/DirectoryCard";
import SLNBookingModal from "@/components/SLNBookingModal";
import { useRouter } from "next/navigation";

export default function DoctorsPage() {
    const { cartCount, toggleCart } = useCart();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const router = useRouter();

    // Smart Routing State
    const [smartSearchSymptoms, setSmartSearchSymptoms] = useState("");
    const [smartSearchSpecialty, setSmartSearchSpecialty] = useState("General Physician");
    const [isMatching, setIsMatching] = useState(false);

    useEffect(() => {
        fetchDoctors();
        // Capture Referral Publisher ID
        const urlParams = new URLSearchParams(window.location.search);
        const pubId = urlParams.get('pubId');
        if (pubId) localStorage.setItem('sln_publisher_id', pubId);
    }, []);

    const fetchDoctors = async () => {
        try {
            const res = await fetch('/api/doctors');
            const data = await res.json();
            if (data.success) setDoctors(data.doctors);
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
            const sessionRes = await fetch('/api/auth/session');
            const sessionData = await sessionRes.json();
            
            if (!sessionData || !sessionData.user) {
                alert("Please login to book an appointment.");
                setIsMatching(false);
                return;
            }

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
                alert(`Found the perfect match! You are booked with Dr. ${matchData.doctorSelected.name}. Please pay the fee to confirm.`);
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

    const handleBook = (doctor) => {
        setSelectedDoctor(doctor);
        setIsBookingOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            
            <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <div className="inline-block bg-blue-100 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                            Healthcare Directory
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 mb-2">Verified Doctors in Gorakhpur</h1>
                        <p className="text-slate-500 font-medium">Book consultations or unlock contact details for top-rated specialists.</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 max-w-sm">
                         <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg"><i className="fa-solid fa-user-doctor"></i></div>
                         <div>
                            <p className="text-xs font-black text-slate-900 mb-1">Are you a Doctor?</p>
                            <a href="/partner" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Click here to register →</a>
                         </div>
                    </div>
                </div>

                {/* SMART ROUTING SEARCH BOX */}
                <div className="mb-16 bg-white p-8 rounded-[2rem] shadow-xl border border-blue-50">
                    <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                        <i className="fa-solid fa-wand-magic-sparkles text-blue-600"></i> Auto-Match with Local Doctors
                    </h3>
                    <form onSubmit={handleSmartMatch} className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Specialty</label>
                            <select 
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
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
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Describe Symptoms</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Mild fever and headache"
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                                value={smartSearchSymptoms}
                                onChange={(e) => setSmartSearchSymptoms(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex items-end">
                            <button 
                                type="submit" 
                                disabled={isMatching}
                                className="w-full md:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-200 transition-all disabled:opacity-70"
                            >
                                {isMatching ? "Matching..." : "Match Doctor"}
                            </button>
                        </div>
                    </form>
                </div>

                {loading ? (
                    <div className="py-20 text-center"><i className="fa-solid fa-spinner fa-spin text-2xl text-slate-300"></i></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {doctors.map(doctor => (
                            <DirectoryCard 
                                key={doctor.id} 
                                item={doctor} 
                                type="doctor" 
                                onBook={handleBook}
                            />
                        ))}
                        {doctors.length === 0 && (
                            <div className="col-span-full py-20 text-center font-bold text-slate-400">
                                No doctors found in Gorakhpur yet.
                            </div>
                        )}
                    </div>
                )}

                {/* Legal Disclaimer */}
                <div className="mt-16 bg-slate-100 p-8 rounded-3xl border border-slate-200">
                    <p className="text-[10px] text-slate-400 leading-relaxed text-center font-medium uppercase tracking-widest">
                        <strong className="text-slate-600">Legal Disclaimer:</strong> Swastik Medicare acts only as a directory service for information-only profiles. We are not responsible for the accuracy or clinical quality of services provided by practitioners listed. Users are advised to verify details independently.
                    </p>
                </div>
            </main>

            <SLNBookingModal 
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                targetItem={selectedDoctor}
                serviceType="doctor"
            />
        </div>
    );
}
