'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function DoctorsDirectory() {
    const [doctors, setDoctors] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchDoctors() {
            // Fetch all verified doctors from the Phase 5 schema
            const { data, error } = await supabase
                .from('doctors')
                .select('*')
                .eq('is_verified', true)
                .order('created_at', { ascending: false })

            if (data) setDoctors(data)
            setLoading(false)
        }

        fetchDoctors()
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header section */}
                <div className="text-center space-y-3">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 tracking-tight">
                        Consult Specialist Doctors Online
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Book highly qualified, verified Indian doctors. Safe, secure, and 100% of your fee goes directly to the doctor.
                    </p>
                </div>

                {/* Loading / Empty States */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : doctors.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-700">No doctors available yet.</h3>
                        <p className="text-gray-500 mt-2">Checking the database for new verified medical professionals...</p>
                    </div>
                ) : (
                    /* Grid of Doctor Cards */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
                        {doctors.map((doc) => (
                            <div key={doc.id} className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow border border-gray-100 flex flex-col h-full">

                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                                        {doc.full_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Dr. {doc.full_name}</h2>
                                        <p className="text-blue-600 font-medium">{doc.specialization}</p>
                                    </div>
                                </div>

                                <div className="text-gray-600 text-sm mb-6 flex-grow space-y-2">
                                    <p>✓ {doc.experience_years}+ Years Experience</p>
                                    <p className="line-clamp-2">{doc.bio}</p>
                                </div>

                                <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Consultation Fee</p>
                                        <p className="text-2xl font-black text-gray-900">₹{doc.consultation_fee}</p>
                                    </div>
                                    <Link href={`/doctors/${doc.id}`} passHref>
                                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold shadow-sm transition-colors">
                                            Book Now
                                        </button>
                                    </Link>
                                </div>

                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}
