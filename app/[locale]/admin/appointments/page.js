"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminAppointments() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
            router.push("/");
        } else if (status === "authenticated") {
            fetchAppointments();
        }
    }, [status]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/appointments");
            const data = await res.json();
            if (data.success) {
                setAppointments(data.appointments);
            }
        } catch (error) {
            console.error("Fetch Appointments Error:", error);
        }
        setLoading(false);
    };

    const updateStatus = async (id, newStatus) => {
        setUpdating(id);
        try {
            const res = await fetch("/api/admin/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                setAppointments(appointments.map(a => a.id === id ? { ...a, status: newStatus } : a));
            } else {
                alert(data.error || "Failed to update");
            }
        } catch (error) {
            console.error("Update error:", error);
        }
        setUpdating(null);
    };

    if (loading) return <div className="p-10 text-center text-slate-500 font-bold uppercase">Loading Appointments...</div>;

    return (
        <div className="bg-[#f8fafc] min-h-screen pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-10 mb-8 shadow-sm">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">
                            <i className="fa-solid fa-stethoscope text-indigo-600 mr-3"></i>
                            Doctor Appointments
                        </h1>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                            Manage online and agent-booked appointments
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8">
                <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID / Date</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Details</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor Details</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-10 text-center text-slate-400 font-bold">No appointments found.</td>
                                    </tr>
                                ) : appointments.map((appt) => (
                                    <tr key={appt.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                        <td className="p-6">
                                            <p className="text-xs font-black text-slate-900 mb-1">#{appt.id.slice(-6).toUpperCase()}</p>
                                            <p className="text-xs font-bold text-slate-500">{new Date(appt.date).toLocaleString()}</p>
                                        </td>
                                        <td className="p-6">
                                            <p className="text-sm font-bold text-slate-900">{appt.patient?.name || "N/A"}</p>
                                            <p className="text-xs font-bold text-slate-500">{appt.patient?.phone || appt.patient?.email || "N/A"}</p>
                                        </td>
                                        <td className="p-6">
                                            <p className="text-sm font-bold text-indigo-600">{appt.doctor?.name || "N/A"}</p>
                                            <p className="text-xs font-bold text-slate-500">{appt.doctor?.specialization} - {appt.doctor?.hospital || "Clinic"}</p>
                                            {appt.doctor?.isDirectory && <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black uppercase rounded">Directory</span>}
                                        </td>
                                        <td className="p-6">
                                            <p className="text-xs text-slate-600 font-bold max-w-[150px] truncate" title={appt.reason}>{appt.reason || "-"}</p>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border-2 ${
                                                appt.status === 'Confirmed' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' :
                                                appt.status === 'Cancelled' ? 'border-red-100 bg-red-50 text-red-600' :
                                                appt.status === 'Pending_Payment' ? 'border-blue-100 bg-blue-50 text-blue-600' :
                                                appt.status === 'Agent_Booked' ? 'border-purple-100 bg-purple-50 text-purple-600' :
                                                'border-amber-100 bg-amber-50 text-amber-600'
                                            }`}>
                                                {appt.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <select
                                                disabled={updating === appt.id}
                                                value={appt.status}
                                                onChange={(e) => updateStatus(appt.id, e.target.value)}
                                                className="p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none cursor-pointer hover:border-indigo-500 transition-colors"
                                            >
                                                <option value="Manual_Coordination">Manual Coordination</option>
                                                <option value="Agent_Booked">Agent Booked</option>
                                                <option value="Pending_Payment">Pending Payment</option>
                                                <option value="Confirmed">Confirmed</option>
                                                <option value="Cancelled">Cancelled</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
