'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function DoctorProfile() {
    const params = useParams()
    const router = useRouter()
    const doctorId = params.id

    const [doctor, setDoctor] = useState(null)
    const [loading, setLoading] = useState(true)
    const [bookingStatus, setBookingStatus] = useState('idle') // idle, booking, success, error

    // The patient/user ID is hardcoded for prototype (normally fetched from auth session)
    const MOCK_PATIENT_ID = '00000000-0000-0000-0000-000000000002'

    useEffect(() => {
        async function fetchDoctorProfile() {
            const { data, error } = await supabase
                .from('doctors')
                .select('*')
                .eq('id', doctorId)
                .single()

            if (data) setDoctor(data)
            setLoading(false)
        }

        if (doctorId) fetchDoctorProfile()
    }, [doctorId])

    const handleBookAppointment = async () => {
        setBookingStatus('booking')

        // Create the appointment using our backend API
        try {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctorId: doctor.id,
                    patientId: MOCK_PATIENT_ID,
                    consultationFee: doctor.consultation_fee
                })
            })

            const result = await res.json()

            if (res.ok) {
                setBookingStatus('success')
                // In a real app, integrate Payment Gateway here to route 100% to doctor bank
                // window.location.href = result.payment_link 
            } else {
                throw new Error(result.error)
            }
        } catch (error) {
            console.error(error)
            setBookingStatus('error')
        }
    }

    if (loading) return <div className="p-12 text-center text-xl text-gray-500 animate-pulse">Loading Doctor Profile...</div>
    if (!doctor) return <div className="p-12 text-center text-xl text-red-500 font-bold">Doctor not found in the directory.</div>

    return (
        <div className="min-h-screen bg-white">
            {/* Top Banner */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 w-full h-48 md:h-64 relative"></div>

            <div className="max-w-4xl mx-auto px-6 pb-24 -mt-20 relative z-10">

                {/* Doctor Identity Card */}
                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 flex flex-col md:flex-row gap-8 items-start">

                    <div className="h-32 w-32 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-5xl font-bold flex-shrink-0 shadow-inner border-4 border-white pb-2">
                        {doctor.full_name.charAt(0)}
                    </div>

                    <div className="flex-grow">
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-1">
                            Dr. {doctor.full_name}
                        </h1>
                        <p className="text-xl text-blue-600 font-medium mb-4">{doctor.specialization}</p>

                        <div className="grid grid-cols-2 gap-4 text-sm font-semibold text-gray-600 bg-gray-50 rounded-2xl p-4">
                            <div>
                                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Experience</p>
                                <p className="text-gray-900 text-lg">{doctor.experience_years} Years</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Consultation Fee</p>
                                <p className="text-gray-900 text-lg">₹{doctor.consultation_fee}</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bio Section */}
                <div className="mt-8 bg-gray-50 rounded-3xl p-8 border border-gray-100">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">About Dr. {doctor.full_name}</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                        {doctor.bio || "This verified professional provider has not updated their public bio yet."}
                    </p>
                </div>

                {/* Availability & Booking Box */}
                <div className="mt-8 bg-white rounded-3xl p-8 border border-blue-100 shadow-md">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Book Video Consultation</h3>
                    <p className="text-gray-500 mb-6">100% of your fee is routed directly to {doctor.full_name}'s secure account.</p>

                    {bookingStatus === 'success' ? (
                        <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl p-6 text-center">
                            <h4 className="text-xl font-bold mb-2">✅ Appointment Scheduled!</h4>
                            <p>Your payment flow would begin here in production.</p>
                            <button onClick={() => router.push('/doctors')} className="mt-4 text-green-700 underline font-semibold">
                                Return to Directory
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleBookAppointment}
                            disabled={bookingStatus === 'booking'}
                            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-full text-lg shadow-lg transition-transform hover:-translate-y-1 transform disabled:bg-gray-400"
                        >
                            {bookingStatus === 'booking' ? 'Processing...' : `Pay ₹${doctor.consultation_fee} to Book`}
                        </button>
                    )}
                    {bookingStatus === 'error' && <p className="text-red-500 mt-4 font-bold text-center">Failed to create appointment.</p>}
                </div>

            </div>
        </div>
    )
}
