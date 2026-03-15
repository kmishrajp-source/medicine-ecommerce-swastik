"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DoctorPrescriptions() {
    const { data: session, status } = useSession();
    const router = useRouter();
    
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRx, setSelectedRx] = useState(null);
    const [medicinesInput, setMedicinesInput] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/doctor/login');
        } else if (status === 'authenticated') {
            fetchPrescriptions();
        }
    }, [status, router]);

    const fetchPrescriptions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/doctor/prescriptions');
            const data = await res.json();
            if (data.success) {
                setPrescriptions(data.prescriptions);
            }
        } catch (error) {
            console.error("Failed to fetch prescriptions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedRx || !medicinesInput.trim()) {
            alert("Please type out the prescribed medicines to issue the E-Rx.");
            return;
        }
        setIsSaving(true);
        try {
            const parsedMedicines = medicinesInput.split(',').map(m => m.trim());
            
            const res = await fetch('/api/doctor/prescriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prescriptionId: selectedRx.id,
                    medicinesList: parsedMedicines,
                    status: 'Processed'
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("E-Prescription successfully approved & issued!");
                setSelectedRx(null);
                fetchPrescriptions(); // Refresh list
            } else {
                alert(data.error || "Failed to process prescription.");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <Navbar cartCount={0} />
            <div className="container" style={{ marginTop: "100px", paddingBottom: "50px" }}>
                
                <h1 style={{ fontSize: "2rem", color: "#0f172a", marginBottom: "20px" }}>
                    <i className="fa-solid fa-file-signature" style={{ color: "#2563eb", marginRight: '10px' }}></i> 
                    Digital E-Prescriptions
                </h1>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
                        <p>Loading patient prescriptions...</p>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "30px", alignItems: "start" }}>
                        
                        {/* LEFT: List of Prescriptions */}
                        <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", padding: "20px" }}>
                            <h3 style={{ margin: "0 0 15px 0", color: "#334155", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
                                <i className="fa-solid fa-clock-rotate-left"></i> Pending Reviews
                            </h3>
                            
                            {prescriptions.length === 0 ? (
                                <p style={{ color: "#94a3b8", textAlign: "center", padding: "20px 0" }}>No pending prescriptions found.</p>
                            ) : (
                                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {prescriptions.map(rx => (
                                        <li 
                                            key={rx.id} 
                                            onClick={() => {
                                                setSelectedRx(rx);
                                                // Pre-fill if already processed
                                                if (rx.medicines) {
                                                    try {
                                                        const m = JSON.parse(rx.medicines);
                                                        setMedicinesInput(Array.isArray(m) ? m.join(", ") : rx.medicines);
                                                    } catch(e) {
                                                        setMedicinesInput(rx.medicines);
                                                    }
                                                } else {
                                                    setMedicinesInput("");
                                                }
                                            }}
                                            style={{ 
                                                padding: "15px", 
                                                borderRadius: "8px", 
                                                cursor: "pointer",
                                                border: rx.id === selectedRx?.id ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                                                background: rx.id === selectedRx?.id ? "#eff6ff" : "white",
                                                transition: "all 0.2s ease"
                                            }}
                                        >
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                                                <strong style={{ color: "#1e293b" }}>{rx.patient?.name || "Unknown Patient"}</strong>
                                                <span style={{ 
                                                    fontSize: "0.75rem", 
                                                    padding: "2px 8px", 
                                                    borderRadius: "12px", 
                                                    fontWeight: "bold",
                                                    background: rx.status === "Pending" ? "#fef3c7" : "#dcfce7",
                                                    color: rx.status === "Pending" ? "#d97706" : "#166534"
                                                }}>
                                                    {rx.status}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                                                {new Date(rx.createdAt).toLocaleDateString()} at {new Date(rx.createdAt).toLocaleTimeString()}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* RIGHT: Selected Prescription Editor */}
                        <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", padding: "30px", minHeight: "500px" }}>
                            {!selectedRx ? (
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8" }}>
                                    <i className="fa-solid fa-hand-pointer" style={{ fontSize: "3rem", marginBottom: "15px", color: "#cbd5e1" }}></i>
                                    <h3>Select a prescription</h3>
                                    <p>Click on a patient's upload from the left to review it.</p>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #f1f5f9", paddingBottom: "15px", marginBottom: "20px" }}>
                                        <h2 style={{ margin: 0, color: "#0f172a" }}>Review & Issue E-Rx</h2>
                                        <span style={{ color: "#64748b", fontSize: "0.9rem" }}>Patient: <strong>{selectedRx.patient?.name || "Guest"}</strong></span>
                                    </div>
                                    
                                    <div style={{ display: "flex", gap: "30px" }}>
                                        {/* Image Viewer */}
                                        <div style={{ flex: 1, background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px dashed #cbd5e1", textAlign: "center" }}>
                                            <h4 style={{ margin: "0 0 10px 0", color: "#475569" }}>Uploaded Document</h4>
                                            {selectedRx.imageUrl ? (
                                                <a href={selectedRx.imageUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block" }}>
                                                    <img 
                                                        src={selectedRx.imageUrl} 
                                                        alt="Prescription" 
                                                        style={{ maxWidth: "100%", maxHeight: "400px", objectFit: "contain", borderRadius: "4px" }}
                                                    />
                                                    <p style={{ marginTop: "10px", fontSize: "0.8rem", color: "#2563eb" }}><i className="fa-solid fa-magnifying-glass-plus"></i> Click to enlarge</p>
                                                </a>
                                            ) : (
                                                <p style={{ color: "#ef4444" }}>No image attached.</p>
                                            )}
                                        </div>

                                        {/* Digital Editor */}
                                        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                            <h4 style={{ margin: "0 0 10px 0", color: "#475569" }}>Prescribe Medicines (OCR / Manual)</h4>
                                            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "10px" }}>
                                                Extract medicines from the document and type them here (comma separated). These will automatically be added to the patient's checkout cart.
                                            </p>
                                            
                                            <textarea 
                                                value={medicinesInput}
                                                onChange={(e) => setMedicinesInput(e.target.value)}
                                                placeholder="e.g. Paracetamol 500mg (1-0-1), Amoxicillin 250mg"
                                                style={{ 
                                                    width: "100%", 
                                                    flex: 1, 
                                                    minHeight: "150px", 
                                                    padding: "15px", 
                                                    borderRadius: "8px", 
                                                    border: "1px solid #cbd5e1",
                                                    fontSize: "1rem",
                                                    resize: "vertical",
                                                    fontFamily: "monospace",
                                                    marginBottom: "20px"
                                                }}
                                            />

                                            <button 
                                                onClick={handleApprove}
                                                disabled={isSaving || selectedRx.status === 'Processed'}
                                                style={{ 
                                                    background: selectedRx.status === 'Processed' ? "#10b981" : "#2563eb", 
                                                    color: "white", 
                                                    border: "none", 
                                                    padding: "15px", 
                                                    borderRadius: "8px", 
                                                    fontSize: "1.1rem", 
                                                    fontWeight: "bold", 
                                                    cursor: selectedRx.status === 'Processed' ? "not-allowed" : "pointer",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    gap: "10px",
                                                    transition: "background 0.2s ease"
                                                }}
                                            >
                                                {isSaving ? (
                                                    <><i className="fa-solid fa-spinner fa-spin"></i> Processing...</>
                                                ) : selectedRx.status === 'Processed' ? (
                                                    <><i className="fa-solid fa-check-circle"></i> E-Rx Issued & Approved</>
                                                ) : (
                                                    <><i className="fa-solid fa-signature"></i> Digitally Sign & Approve Rx</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
