"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function DoctorReviewPage() {
  const { data: session } = useSession();
  const { cartCount, toggleCart } = useCart();
  const [form, setForm] = useState({
    patientId: "SPH-2026-0018",
    doctorId: "", doctorName: "", qualification: "MD, DM Endocrinology",
    registrationNumber: "", decision: "APPROVED", notes: "", modifications: "",
  });
  const [status, setStatus] = useState("IDLE");
  const [result, setResult] = useState(null);
  const [clinicalData, setClinicalData] = useState(null);
  const [loadingClinical, setLoadingClinical] = useState(false);

  const loadClinical = async () => {
    setLoadingClinical(true);
    try {
      const res = await fetch("/api/precision/clinical/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: form.patientId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setClinicalData(data.clinicalRecord);
    } catch (err) {
      setClinicalData({ error: err.message });
    } finally {
      setLoadingClinical(false);
    }
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("LOADING");
    try {
      const res = await fetch("/api/precision/clinical/doctor-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: form.patientId, doctorId: form.doctorId, doctorName: form.doctorName,
          qualification: form.qualification, registrationNumber: form.registrationNumber,
          decision: form.decision, notes: form.notes,
          modifications: form.modifications.split("\n").filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      setStatus("SUCCESS");
    } catch (err) {
      setResult({ error: err.message });
      setStatus("ERROR");
    }
  };

  const DECISION_STYLES = {
    APPROVED: { bg: "rgba(16,185,129,0.15)", border: "#10b981", color: "#10b981", icon: "fa-circle-check" },
    REJECTED: { bg: "rgba(239,68,68,0.15)", border: "#ef4444", color: "#ef4444", icon: "fa-circle-xmark" },
    NEEDS_REVISION: { bg: "rgba(245,158,11,0.15)", border: "#f59e0b", color: "#f59e0b", icon: "fa-circle-exclamation" },
  };

  return (
    <>
      <Navbar session={session} cartCount={cartCount} toggleCart={toggleCart} />
      <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #022c22 100%)", padding: "40px 20px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ marginBottom: 24 }}>
            <Link href="/precision" style={{ color: "#10b981", textDecoration: "none", fontSize: "0.85rem" }}>
              <i className="fa-solid fa-arrow-left mr-2"></i>Precision Dashboard
            </Link>
          </div>
          <h1 style={{ color: "white", fontSize: "1.6rem", fontWeight: 900, marginBottom: 8 }}>
            <i className="fa-solid fa-user-doctor" style={{ color: "#10b981", marginRight: 10 }}></i>
            Doctor Review & Clinical Sign-Off
          </h1>
          <p style={{ color: "#94a3b8", marginBottom: 28 }}>Physician review and cryptographically signed approval of AI clinical recommendations.</p>

          {/* Load Clinical Data */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label style={{ color: "#94a3b8", fontSize: "0.8rem", display: "block", marginBottom: 6 }}>Patient MRN</label>
                <input name="patientId" value={form.patientId} onChange={handleChange}
                  style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 12px", color: "white", boxSizing: "border-box" }} />
              </div>
              <button onClick={loadClinical} disabled={loadingClinical}
                style={{ background: "#10b981", color: "white", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                {loadingClinical ? "Loading..." : "Load Patient Data"}
              </button>
            </div>

            {clinicalData && !clinicalData.error && (
              <div style={{ marginTop: 16, background: "rgba(16,185,129,0.08)", borderRadius: 12, padding: 16 }}>
                <div style={{ color: "#10b981", fontWeight: 700, marginBottom: 8 }}>AI Evaluation — Pending Doctor Review</div>
                <div style={{ color: "white", fontSize: "1.1rem", fontWeight: 800, marginBottom: 4 }}>{clinicalData.evaluation?.primaryDiagnosis}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.82rem", marginBottom: 8 }}>Confidence: {Math.round((clinicalData.evaluation?.confidence || 0) * 100)}% | CKD: {clinicalData.evaluation?.ckdStage}</div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Suggested Therapy</div>
                  {clinicalData.evaluation?.suggestedTherapy?.slice(0, 3).map((s, i) => (
                    <div key={i} style={{ color: "#c7d2fe", fontSize: "0.82rem", marginBottom: 4 }}>• {s}</div>
                  ))}
                </div>
                {clinicalData.evaluation?.contraindications?.length > 0 && (
                  <div>
                    <div style={{ color: "#ef4444", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Contraindications</div>
                    {clinicalData.evaluation.contraindications.map((c, i) => <div key={i} style={{ color: "#fca5a5", fontSize: "0.82rem", marginBottom: 4 }}>⛔ {c}</div>)}
                  </div>
                )}
              </div>
            )}
          </div>

          {status !== "SUCCESS" ? (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24 }}>
                <h3 style={{ color: "#10b981", margin: "0 0 16px", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: 1 }}>Physician Details</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[
                    { name: "doctorId", label: "Doctor ID *", required: true },
                    { name: "doctorName", label: "Full Name *", required: true },
                    { name: "qualification", label: "Qualification", required: false },
                    { name: "registrationNumber", label: "MCI Registration No.", required: false },
                  ].map(f => (
                    <div key={f.name}>
                      <label style={{ color: "#94a3b8", fontSize: "0.8rem", display: "block", marginBottom: 6 }}>{f.label}</label>
                      <input name={f.name} value={form[f.name]} onChange={handleChange} required={f.required}
                        style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 12px", color: "white", boxSizing: "border-box" }} />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24 }}>
                <h3 style={{ color: "#10b981", margin: "0 0 16px", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: 1 }}>Decision *</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                  {Object.entries(DECISION_STYLES).map(([d, s]) => (
                    <label key={d} style={{ cursor: "pointer" }}>
                      <input type="radio" name="decision" value={d} checked={form.decision === d} onChange={handleChange} style={{ display: "none" }} />
                      <div style={{ background: form.decision === d ? s.bg : "rgba(255,255,255,0.03)", border: `2px solid ${form.decision === d ? s.border : "rgba(255,255,255,0.1)"}`, borderRadius: 12, padding: "14px", textAlign: "center", transition: "all 0.2s" }}>
                        <i className={`fa-solid ${s.icon}`} style={{ color: s.color, fontSize: 20, marginBottom: 6, display: "block" }}></i>
                        <div style={{ color: "white", fontWeight: 700, fontSize: "0.85rem" }}>{d.replace(/_/g, " ")}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ color: "#94a3b8", fontSize: "0.8rem", display: "block", marginBottom: 6 }}>Clinical Notes</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Clinical observations, rationale for decision..."
                    style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 12px", color: "white", boxSizing: "border-box", resize: "vertical" }} />
                </div>
                <div>
                  <label style={{ color: "#94a3b8", fontSize: "0.8rem", display: "block", marginBottom: 6 }}>Modifications (one per line)</label>
                  <textarea name="modifications" value={form.modifications} onChange={handleChange} rows={3} placeholder="Adjust Glipizide dose to 2.5mg OD&#10;Add Aspirin 75mg for CVD prophylaxis"
                    style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 12px", color: "white", boxSizing: "border-box", resize: "vertical" }} />
                </div>
              </div>

              {status === "ERROR" && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid #ef4444", borderRadius: 10, padding: 14, color: "#fca5a5" }}>{result?.error}</div>}

              <button type="submit" disabled={status === "LOADING"}
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "white", border: "none", borderRadius: 12, padding: "14px 28px", fontSize: "1rem", fontWeight: 700, cursor: "pointer" }}>
                {status === "LOADING" ? "Signing..." : "Submit Physician Sign-Off"}
              </button>
            </form>
          ) : null}

          {status === "SUCCESS" && result && (
            <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid #10b981", borderRadius: 16, padding: 28 }}>
              <i className="fa-solid fa-circle-check" style={{ fontSize: 36, color: "#10b981", marginBottom: 12, display: "block" }}></i>
              <h2 style={{ color: "white", margin: "0 0 8px" }}>Clinical Record {result.review?.decision}</h2>
              <p style={{ color: "#94a3b8", marginBottom: 16 }}>Reviewed by Dr. {result.review?.doctorName} · {new Date(result.review?.reviewedAt).toLocaleString("en-IN")}</p>
              <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: 14, fontFamily: "monospace", fontSize: "0.72rem", color: "#64748b", wordBreak: "break-all", marginBottom: 16 }}>
                <div style={{ color: "#94a3b8", marginBottom: 4 }}>SHA-256 Audit Signature:</div>
                {result.review?.signature}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ color: result.signatureValid ? "#10b981" : "#ef4444", fontSize: "0.8rem", fontWeight: 700 }}>
                  <i className={`fa-solid ${result.signatureValid ? "fa-shield-check" : "fa-shield-xmark"} mr-1`}></i>
                  Signature {result.signatureValid ? "Valid" : "Invalid"}
                </span>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

