"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

const BIOMARKER_FIELDS = [
  { key: "HbA1c", label: "HbA1c", unit: "%", placeholder: "7.6", hint: "Target <7.0%" },
  { key: "FastingGlucose", label: "Fasting Glucose", unit: "mg/dL", placeholder: "138", hint: "Normal <100" },
  { key: "PostMealGlucose", label: "Post-Meal Glucose (2h)", unit: "mg/dL", placeholder: "215", hint: "Target <180" },
  { key: "Creatinine", label: "Serum Creatinine", unit: "mg/dL", placeholder: "0.92", hint: "Normal 0.74–1.35" },
  { key: "eGFR", label: "eGFR (or auto-calc)", unit: "mL/min/1.73m²", placeholder: "104", hint: "CKD-EPI computed if blank" },
  { key: "UACR", label: "UACR", unit: "mg/g", placeholder: "18.5", hint: "Normal <30" },
  { key: "CPeptide", label: "C-Peptide", unit: "ng/mL", placeholder: "1.85", hint: "Normal 0.5–2.0" },
  { key: "TotalCholesterol", label: "Total Cholesterol", unit: "mg/dL", placeholder: "192", hint: "Desirable <200" },
  { key: "LDL", label: "LDL Cholesterol", unit: "mg/dL", placeholder: "118", hint: "Optimal <100" },
  { key: "HDL", label: "HDL Cholesterol", unit: "mg/dL", placeholder: "42", hint: "Low if <40" },
  { key: "Triglycerides", label: "Triglycerides", unit: "mg/dL", placeholder: "164", hint: "Normal <150" },
];

const STATUS_COLORS = { normal: "#10b981", optimal: "#10b981", desirable: "#10b981", G1: "#10b981", at_target: "#10b981", impaired: "#f59e0b", above_target: "#f59e0b", borderline: "#f59e0b", diabetes: "#ef4444", high: "#ef4444", low: "#ef4444", very_high: "#ef4444" };

export default function LabUploadPage() {
  const { data: session } = useSession();
  const { cartCount, toggleCart } = useCart();
  const [patientId, setPatientId] = useState("SPH-2026-0018");
  const [labName, setLabName] = useState("Dr. Lal PathLabs");
  const [collectionDate, setCollectionDate] = useState(new Date().toISOString().slice(0, 10));
  const [values, setValues] = useState({});
  const [status, setStatus] = useState("IDLE");
  const [result, setResult] = useState(null);
  const [evaluated, setEvaluated] = useState(null);

  const handleValue = (key, val) => setValues(v => ({ ...v, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("LOADING");
    const biomarkers = {};
    for (const [key, val] of Object.entries(values)) {
      if (val) biomarkers[key] = { value: parseFloat(val), unit: BIOMARKER_FIELDS.find(f => f.key === key)?.unit };
    }
    try {
      const res = await fetch("/api/precision/labs/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, collectionDate, lab: labName, biomarkers }),
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

  const handleEvaluate = async () => {
    setStatus("EVALUATING");
    try {
      const res = await fetch("/api/precision/clinical/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEvaluated(data);
      setStatus("EVALUATED");
    } catch (err) {
      setResult(r => ({ ...r, evalError: err.message }));
      setStatus("SUCCESS");
    }
  };

  return (
    <>
      <Navbar session={session} cartCount={cartCount} toggleCart={toggleCart} />
      <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #0c1a2e 100%)", padding: "40px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ marginBottom: 24 }}>
            <Link href="/precision" style={{ color: "#0ea5e9", textDecoration: "none", fontSize: "0.85rem" }}>
              <i className="fa-solid fa-arrow-left mr-2"></i>Precision Dashboard
            </Link>
          </div>
          <h1 style={{ color: "white", fontSize: "1.6rem", fontWeight: 900, marginBottom: 8 }}>
            <i className="fa-solid fa-flask" style={{ color: "#0ea5e9", marginRight: 10 }}></i>Laboratory Intelligence
          </h1>
          <p style={{ color: "#94a3b8", marginBottom: 28 }}>Enter biomarker values for AI analysis — CKD-EPI eGFR auto-computed from Creatinine.</p>

          {status !== "EVALUATED" ? (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24 }}>
                <h3 style={{ color: "#0ea5e9", margin: "0 0 16px", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: 1 }}>Report Details</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ color: "#94a3b8", fontSize: "0.8rem", display: "block", marginBottom: 6 }}>Patient MRN</label>
                    <input value={patientId} onChange={e => setPatientId(e.target.value)} required
                      style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 12px", color: "white", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ color: "#94a3b8", fontSize: "0.8rem", display: "block", marginBottom: 6 }}>Laboratory Name</label>
                    <input value={labName} onChange={e => setLabName(e.target.value)}
                      style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 12px", color: "white", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ color: "#94a3b8", fontSize: "0.8rem", display: "block", marginBottom: 6 }}>Collection Date</label>
                    <input type="date" value={collectionDate} onChange={e => setCollectionDate(e.target.value)}
                      style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 12px", color: "white", boxSizing: "border-box" }} />
                  </div>
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24 }}>
                <h3 style={{ color: "#0ea5e9", margin: "0 0 16px", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: 1 }}>Biomarker Values</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                  {BIOMARKER_FIELDS.map(field => (
                    <div key={field.key}>
                      <label style={{ color: "#94a3b8", fontSize: "0.8rem", display: "block", marginBottom: 4 }}>{field.label}</label>
                      <div style={{ display: "flex", gap: 6 }}>
                        <input type="number" step="0.01" placeholder={field.placeholder} value={values[field.key] || ""} onChange={e => handleValue(field.key, e.target.value)}
                          style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 10px", color: "white" }} />
                        <span style={{ color: "#64748b", fontSize: "0.75rem", padding: "8px 0", whiteSpace: "nowrap" }}>{field.unit}</span>
                      </div>
                      <div style={{ color: "#475569", fontSize: "0.72rem", marginTop: 3 }}>{field.hint}</div>
                    </div>
                  ))}
                </div>
              </div>

              {status === "ERROR" && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid #ef4444", borderRadius: 10, padding: 14, color: "#fca5a5" }}>{result?.error}</div>}

              <button type="submit" disabled={["LOADING","EVALUATING"].includes(status)}
                style={{ background: "linear-gradient(135deg, #0ea5e9, #6366f1)", color: "white", border: "none", borderRadius: 12, padding: "14px 28px", fontSize: "1rem", fontWeight: 700, cursor: "pointer" }}>
                {status === "LOADING" ? "Analysing..." : "Analyse Lab Report"}
              </button>
            </form>
          ) : null}

          {status === "SUCCESS" && result?.analysis && (
            <div style={{ marginTop: 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24 }}>
              <h3 style={{ color: "white", margin: "0 0 16px" }}>Analysis Results</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
                {Object.entries(result.analysis.results || {}).map(([key, data]) => (
                  <div key={key} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 12 }}>
                    <div style={{ color: "#64748b", fontSize: "0.72rem", textTransform: "uppercase", marginBottom: 4 }}>{key}</div>
                    <div style={{ color: "white", fontWeight: 700 }}>{data.value} {data.unit}</div>
                    <div style={{ color: STATUS_COLORS[data.status] || "#94a3b8", fontSize: "0.75rem", fontWeight: 600 }}>{data.status?.replace(/_/g, " ")}</div>
                  </div>
                ))}
              </div>
              {result.analysis.flags?.length > 0 && (
                <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: 14, marginBottom: 16 }}>
                  <div style={{ color: "#ef4444", fontWeight: 700, marginBottom: 8 }}>⚠️ Flagged Biomarkers</div>
                  {result.analysis.flags.map(f => (
                    <div key={f.biomarker} style={{ color: "#fca5a5", fontSize: "0.85rem", marginBottom: 4 }}>• {f.biomarker}: {f.value} {f.unit} — {f.status?.replace(/_/g, " ")}</div>
                  ))}
                </div>
              )}
              <button onClick={handleEvaluate}
                style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)", color: "white", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 700, cursor: "pointer" }}>
                Run Clinical Evaluation →
              </button>
            </div>
          )}

          {status === "EVALUATED" && evaluated && (
            <div style={{ marginTop: 24, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 16, padding: 24 }}>
              <h3 style={{ color: "white", margin: "0 0 4px" }}>Clinical Evaluation Complete</h3>
              <p style={{ color: "#94a3b8", marginBottom: 20 }}>Pending doctor review before clinical use.</p>
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <div style={{ color: "#a855f7", fontWeight: 800, fontSize: "1.2rem" }}>{evaluated.clinicalRecord?.evaluation?.primaryDiagnosis}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: 4 }}>Confidence: {Math.round((evaluated.clinicalRecord?.evaluation?.confidence || 0) * 100)}% | CKD: {evaluated.clinicalRecord?.evaluation?.ckdStage}</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: "#10b981", fontWeight: 700, marginBottom: 8 }}>Suggested Therapy</div>
                {evaluated.clinicalRecord?.evaluation?.suggestedTherapy?.map((s, i) => (
                  <div key={i} style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: 6 }}>• {s}</div>
                ))}
              </div>
              <Link href="/precision/doctor/review" style={{ background: "#10b981", color: "white", padding: "10px 20px", borderRadius: 10, textDecoration: "none", fontWeight: 700 }}>
                Submit for Doctor Review →
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

