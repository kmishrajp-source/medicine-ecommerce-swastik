"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function PatientRegisterPage() {
  const { data: session } = useSession();
  const { cartCount, toggleCart } = useCart();
  const [form, setForm] = useState({
    name: "", age: "", gender: "Male", dob: "", phone: "", email: "", address: "", bloodGroup: "B+",
    weight: "", height: "", familyDiabetes: false, currentMedications: "", allergies: "",
    consentData: true, consentAI: true, consentDoctor: true,
  });
  const [status, setStatus] = useState("IDLE"); // IDLE | LOADING | SUCCESS | ERROR
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("LOADING");
    try {
      const res = await fetch("/api/precision/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, age: parseInt(form.age), gender: form.gender, dob: form.dob,
          phone: form.phone, email: form.email, address: form.address, bloodGroup: form.bloodGroup,
          bmi: form.weight && form.height ? Math.round(form.weight / ((form.height / 100) ** 2) * 10) / 10 : null,
          weight: parseFloat(form.weight), height: parseFloat(form.height),
          familyHistory: { diabetes: form.familyDiabetes, type: "T2D", relation: "Parent" },
          currentMedications: form.currentMedications.split(",").map(s => s.trim()).filter(Boolean),
          allergies: form.allergies.split(",").map(s => s.trim()).filter(Boolean),
          consent: { dataStorage: form.consentData, aiAnalysis: form.consentAI, doctorReview: form.consentDoctor, timestamp: new Date().toISOString() },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.patient);
      setStatus("SUCCESS");
    } catch (err) {
      setResult({ error: err.message });
      setStatus("ERROR");
    }
  };

  return (
    <>
      <Navbar session={session} cartCount={cartCount} toggleCart={toggleCart} />
      <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)", padding: "40px 20px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <Link href="/precision" style={{ color: "#6366f1", textDecoration: "none", fontSize: "0.85rem" }}>
              <i className="fa-solid fa-arrow-left mr-2"></i>Precision Dashboard
            </Link>
          </div>
          <h1 style={{ color: "white", fontSize: "1.6rem", fontWeight: 900, marginBottom: 8 }}>
            <i className="fa-solid fa-user-plus" style={{ color: "#6366f1", marginRight: 10 }}></i>
            Patient Registration
          </h1>
          <p style={{ color: "#94a3b8", marginBottom: 28 }}>Register a new patient for Precision Health AI assessment.</p>

          {status === "SUCCESS" ? (
            <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid #10b981", borderRadius: 16, padding: 28, textAlign: "center" }}>
              <i className="fa-solid fa-circle-check" style={{ fontSize: 40, color: "#10b981", marginBottom: 12, display: "block" }}></i>
              <h2 style={{ color: "white", margin: "0 0 8px" }}>Patient Registered!</h2>
              <p style={{ color: "#94a3b8", marginBottom: 4 }}>MRN: <strong style={{ color: "white" }}>{result?.mrn}</strong></p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
                <Link href="/precision/lab/upload" style={{ background: "#6366f1", color: "white", padding: "10px 20px", borderRadius: 10, textDecoration: "none", fontWeight: 700 }}>Upload Lab Report</Link>
                <Link href="/precision" style={{ background: "rgba(255,255,255,0.1)", color: "white", padding: "10px 20px", borderRadius: 10, textDecoration: "none" }}>Back to Dashboard</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Basic Info */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24 }}>
                <h3 style={{ color: "#6366f1", margin: "0 0 16px", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: 1 }}>Basic Information</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[
                    { name: "name", label: "Full Name *", type: "text", required: true },
                    { name: "age", label: "Age *", type: "number", required: true },
                    { name: "dob", label: "Date of Birth", type: "date" },
                    { name: "phone", label: "Phone", type: "tel" },
                    { name: "email", label: "Email", type: "email" },
                    { name: "weight", label: "Weight (kg)", type: "number" },
                    { name: "height", label: "Height (cm)", type: "number" },
                  ].map(field => (
                    <div key={field.name}>
                      <label style={{ color: "#94a3b8", fontSize: "0.8rem", display: "block", marginBottom: 6 }}>{field.label}</label>
                      <input name={field.name} type={field.type} required={field.required} value={form[field.name]} onChange={handleChange}
                        style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 12px", color: "white", boxSizing: "border-box" }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ color: "#94a3b8", fontSize: "0.8rem", display: "block", marginBottom: 6 }}>Gender *</label>
                    <select name="gender" value={form.gender} onChange={handleChange}
                      style={{ width: "100%", background: "#1e293b", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 12px", color: "white" }}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ color: "#94a3b8", fontSize: "0.8rem", display: "block", marginBottom: 6 }}>Blood Group</label>
                    <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}
                      style={{ width: "100%", background: "#1e293b", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 12px", color: "white" }}>
                      {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <label style={{ color: "#94a3b8", fontSize: "0.8rem", display: "block", marginBottom: 6 }}>Address</label>
                  <input name="address" type="text" value={form.address} onChange={handleChange}
                    style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 12px", color: "white", boxSizing: "border-box" }} />
                </div>
              </div>

              {/* Medical History */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24 }}>
                <h3 style={{ color: "#0ea5e9", margin: "0 0 16px", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: 1 }}>Medical History</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ color: "#94a3b8", fontSize: "0.8rem", display: "block", marginBottom: 6 }}>Current Medications (comma-separated)</label>
                    <input name="currentMedications" type="text" placeholder="Metformin 500mg, Aspirin 75mg" value={form.currentMedications} onChange={handleChange}
                      style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 12px", color: "white", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ color: "#94a3b8", fontSize: "0.8rem", display: "block", marginBottom: 6 }}>Known Allergies (comma-separated)</label>
                    <input name="allergies" type="text" placeholder="Sulfa drugs, Penicillin" value={form.allergies} onChange={handleChange}
                      style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 12px", color: "white", boxSizing: "border-box" }} />
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: "#94a3b8" }}>
                    <input type="checkbox" name="familyDiabetes" checked={form.familyDiabetes} onChange={handleChange} />
                    Family history of diabetes (parent/sibling)
                  </label>
                </div>
              </div>

              {/* Consent */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24 }}>
                <h3 style={{ color: "#10b981", margin: "0 0 16px", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: 1 }}>Consent *</h3>
                {[
                  { name: "consentData", label: "I consent to secure storage of my health data" },
                  { name: "consentAI", label: "I consent to AI-assisted analysis of my reports" },
                  { name: "consentDoctor", label: "I consent to doctor review of my AI-generated recommendations" },
                ].map(c => (
                  <label key={c.name} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: "#94a3b8", marginBottom: 10 }}>
                    <input type="checkbox" name={c.name} checked={form[c.name]} onChange={handleChange} required />
                    {c.label}
                  </label>
                ))}
              </div>

              {status === "ERROR" && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid #ef4444", borderRadius: 10, padding: 14, color: "#fca5a5" }}>
                  <i className="fa-solid fa-triangle-exclamation mr-2"></i>{result?.error}
                </div>
              )}

              <button type="submit" disabled={status === "LOADING"}
                style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)", color: "white", border: "none", borderRadius: 12, padding: "14px 28px", fontSize: "1rem", fontWeight: 700, cursor: "pointer", opacity: status === "LOADING" ? 0.7 : 1 }}>
                {status === "LOADING" ? "Registering..." : "Register Patient"}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

