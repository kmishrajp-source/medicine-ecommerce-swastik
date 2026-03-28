"use client";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

export default function PrescribePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const params = useParams();
    const appointmentId = params.id;

    const [appointment, setAppointment] = useState(null);
    const [medicines, setMedicines] = useState([{ name: "", dosage: "", duration: "" }]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch appointment details
        fetch(`/api/appointments/${appointmentId}`).then(res => res.json()).then(data => {
            if (data.success) {
                setAppointment(data.appointment);
            }
        });
    }, [appointmentId]);

    const handleAddMedicine = () => {
        setMedicines([...medicines, { name: "", dosage: "", duration: "" }]);
    };

    const handleMedicineChange = (index, field, value) => {
        const updated = [...medicines];
        updated[index][field] = value;
        setMedicines(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch('/api/doctor/prescription/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patientId: appointment.patientId,
                appointmentId,
                medicines
            })
        });

        const data = await res.json();
        if (data.success) {
            alert("Prescription Generated Successfully!");
            router.push('/doctor/dashboard');
        } else {
            alert("Error: " + data.error);
        }
        setLoading(false);
    };

    if (!appointment) return <div>Loading appointment details...</div>;

    return (
        <>
            <Navbar cartCount={0} />
            <div className="container" style={{ marginTop: "120px", maxWidth: "800px" }}>
                <div className="glass" style={{ padding: "40px", borderRadius: "16px" }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h1>✍️ Generate E-Prescription</h1>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontWeight: 'bold' }}>Patient: {appointment.patient?.name}</p>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>ID: {appointment.id.slice(-6).toUpperCase()}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <h4>Medicines List</h4>
                            {medicines.map((med, idx) => (
                                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 40px', gap: '10px', marginBottom: '10px' }}>
                                    <input 
                                        type="text" placeholder="Medicine Name" value={med.name}
                                        onChange={e => handleMedicineChange(idx, 'name', e.target.value)} required
                                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                    <input 
                                        type="text" placeholder="Dosage (e.g. 1-0-1)" value={med.dosage}
                                        onChange={e => handleMedicineChange(idx, 'dosage', e.target.value)} required
                                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                    <input 
                                        type="text" placeholder="Duration" value={med.duration}
                                        onChange={e => handleMedicineChange(idx, 'duration', e.target.value)} required
                                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                    {idx > 0 && (
                                        <button 
                                            type="button" onClick={() => setMedicines(medicines.filter((_, i) => i !== idx))}
                                            style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: '1.2rem', cursor: 'pointer' }}>
                                            &times;
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button 
                                type="button" onClick={handleAddMedicine}
                                style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                + Add Another Medicine
                            </button>
                        </div>

                        <div style={{ marginTop: '40px', display: 'flex', gap: '15px' }}>
                            <button 
                                type="button" onClick={() => router.back()}
                                style={{ flex: 1, padding: '15px', borderRadius: '8px', border: '1px solid #ddd', background: 'white' }}>
                                Cancel
                            </button>
                            <button 
                                type="submit" disabled={loading}
                                className="btn btn-primary" style={{ flex: 2, padding: '15px', background: '#7C3AED' }}>
                                {loading ? 'Saving...' : 'Generate & Complete Appointment'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
