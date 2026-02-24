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

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <div className="bg-blue-50 py-16 px-6" style={{ marginTop: '70px' }}>
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 tracking-tight">
                        Consult Top Specialists Online
                    </h1>
                    <p className="mt-4 text-xl text-blue-700 max-w-2xl mx-auto">
                        Skip the waiting room. Book secure, private video consultations with verified doctors right from your home.
                    </p>
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
                                        <h3 className="text-2xl font-bold text-gray-900">Dr. {doctor.user?.name}</h3>
                                        <p className="text-indigo-600 font-semibold tracking-wide uppercase text-sm">{doctor.specialization}</p>
                                        <p className="text-gray-500 text-sm"><i className="fa-solid fa-building text-gray-300 mr-1"></i> {doctor.hospital || "Independent Practice"}</p>
                                    </div>

                                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
                                        <div className="text-left">
                                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Experience</p>
                                            <p className="font-semibold text-gray-800">{doctor.experience || 0} Years</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Fee</p>
                                            <p className="font-bold text-gray-900 text-lg">₹{doctor.consultationFee}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => router.push(`/doctors/${doctor.id}`)}
                                        className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2">
                                        Book Appointment <i className="fa-solid fa-arrow-right"></i>
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
