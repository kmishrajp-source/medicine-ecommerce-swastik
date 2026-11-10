"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

const MONITORING_TYPES = [
  { key: "HbA1c", label: "HbA1c", unit: "%", color: "#6366f1", icon: "fa-droplet" },
  { key: "FastingGlucose", label: "Fasting Glucose", unit: "mg/dL", color: "#0ea5e9", icon: "fa-vial" },
  { key: "PostMealGlucose", label: "Post-Meal Glucose", unit: "mg/dL", color: "#f59e0b", icon: "fa-bowl-food" },
  { key: "eGFR", label: "eGFR", unit: "mL/min/1.73m²", color: "#10b981", icon: "fa-kidney" },
  { key: "UACR", label: "UACR", unit: "mg/g", color: "#a855f7", icon: "fa-flask" },
  { key: "BloodPressure_Systolic", label: "BP Systolic", unit: "mmHg", color: "#ef4444", icon: "fa-heart-pulse" },
];

const STATUS_COLORS = { normal: "#10b981", optimal: "#10b981", desirable: "#10b981", G1: "#10b981", at_target: "#10b981", impaired: "#f59e0b", above_target: "#f59e0b", borderline: "#f59e0b", diabetes: "#ef4444", high: "#ef4444", low: "#ef4444" };

export default function MonitoringPage() {
  const { data: session } = useSession();
  const { cartCount, toggleCart } = useCart();
  const [patientId, setPatientId] = useState("SPH-2026-0018");
  const [type, setType] = useState("FastingGlucose");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastAlert, setLastAlert] = useState(null);

  const fetchEntries = async (pid) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/precision/monitoring?patientId=${pid}`);
      const data = await res.json();
      setEntries(data.entries || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchEntries(patientId); }, [patientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedType = MONITORING_TYPES.find(t => t.key === type);
      const res = await fetch("/api/precision/monitoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, type, value: parseFloat(value), unit: selectedType?.unit, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLastAlert({ alert: data.alert, message: data.message, entry: data.entry });
      setValue("");
      setNotes("");
      fetchEntries(patientId);
    } catch (err) {
      setLastAlert({ alert: true, message: err.message });
    }
    setSubmitting(false);
  };

  const alertEntries = entries.filter(e => e.alert);
  const recentEntries = [...entries].reverse().slice(0, 20);

  return (
    <>
      <Navbar session={session} cartCount={cartCount} toggleCart={toggleCart} />
      <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #0c1a2e 100%)", padding: "40px 20px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ marginBottom: 24 }}>
            <Link href="/precision" style={{ color: "#f59e0b", textDecoration: "none", fontSize: "0.85rem" }}>
              <i className="fa-solid fa-arrow-left mr-2"></i>Precision Dashboard
            </Link>
          </div>
          <h1 style={{ color: "white", fontSize: "1.6rem", fontWeight: 900, marginBottom: 8 }}>
            <i className="fa-solid fa-chart-line" style={{ color: "#f59e0b", marginRight: 10 }}></i>
            Patient Monitoring
          </h1>
          <p style={{ color: "#94a3b8", marginBottom: 28 }}>Track glucose, HbA1c, kidney markers and vitals with automated status alerts.</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
            {/* Log Entry */}
            <div>
              <form onSubmit={handleSubmit} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24 }}>
                <h3 style={{ color: "#f59e0b", margin: "0 0 16px", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: 1 }}>Log Reading</h3>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ color: "#94a3b8", fontSize: "0.8rem", display: "block", marginBottom: 6 }}>Patient MRN</label>
                  <input value={patientId} onChange={e => setPatientId(e.target.value)}
                    style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 12px", color: "white", boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ color: "#94a3b8", fontSize: "0.8rem", display: "block", marginBottom: 6 }}>Measurement Type</label>
                  <select value={type} onChange={e => setType(e.target.value)}
                    style={{ width: "100%", background: "#1e293b", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 12px", color: "white", boxSizing: "border-box" }}>
                    {MONITORING_TYPES.map(t => <option key={t.key} value={t.key}>{t.label} ({t.unit})</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ color: "#94a3b8", fontSize: "0.8rem", display: "block", marginBottom: 6 }}>Value</label>
                  <input type="number" step="0.01" required value={value} onChange={e => setValue(e.target.value)}
                    placeholder={MONITORING_TYPES.find(t => t.key === type)?.unit}
                    style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 12px", color: "white", boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ color: "#94a3b8", fontSize: "0.8rem", display: "block", marginBottom: 6 }}>Notes (optional)</label>
                  <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="After meal, fasting..."
                    style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 12px", color: "white", boxSizing: "border-box" }} />
                </div>
                <button type="submit" disabled={submitting}
                  style={{ width: "100%", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "white", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, cursor: "pointer" }}>
                  {submitting ? "Logging..." : "Log Reading"}
                </button>

                {lastAlert && (
                  <div style={{ marginTop: 14, background: lastAlert.alert ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", border: `1px solid ${lastAlert.alert ? "#ef4444" : "#10b981"}`, borderRadius: 10, padding: 12, color: lastAlert.alert ? "#fca5a5" : "#6ee7b7", fontSize: "0.82rem" }}>
                    {lastAlert.message}
                  </div>
                )}
              </form>

              {/* Alerts */}
              {alertEntries.length > 0 && (
                <div style={{ marginTop: 20, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 16, padding: 20 }}>
                  <h3 style={{ color: "#ef4444", margin: "0 0 12px", fontSize: "0.85rem" }}>⚠️ Active Alerts ({alertEntries.length})</h3>
                  {alertEntries.slice(-5).reverse().map((e, i) => (
                    <div key={i} style={{ color: "#fca5a5", fontSize: "0.8rem", marginBottom: 6, paddingBottom: 6, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      {e.type}: <strong>{e.value} {e.unit}</strong> — {e.status?.replace(/_/g, " ")}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Entry History */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24 }}>
              <h3 style={{ color: "white", margin: "0 0 16px" }}>
                Recent Readings {loading ? <span style={{ color: "#64748b", fontWeight: 400, fontSize: "0.8rem" }}>Loading...</span> : <span style={{ color: "#64748b", fontWeight: 400, fontSize: "0.8rem" }}>({recentEntries.length})</span>}
              </h3>
              {recentEntries.length === 0 ? (
                <div style={{ color: "#64748b", textAlign: "center", padding: "40px 20px" }}>
                  <i className="fa-solid fa-chart-line" style={{ fontSize: 32, marginBottom: 12, display: "block" }}></i>
                  No readings yet. Log the first one.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {recentEntries.map((entry, i) => {
                    const typeInfo = MONITORING_TYPES.find(t => t.key === entry.type);
                    return (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ background: (typeInfo?.color || "#64748b") + "20", borderRadius: 8, padding: 8, color: typeInfo?.color || "#94a3b8" }}>
                            <i className={`fa-solid ${typeInfo?.icon || "fa-chart-line"}`}></i>
                          </div>
                          <div>
                            <div style={{ color: "white", fontWeight: 600 }}>{entry.type?.replace(/_/g, " ")}</div>
                            <div style={{ color: "#64748b", fontSize: "0.75rem" }}>{new Date(entry.recordedAt).toLocaleString("en-IN")}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ color: "white", fontWeight: 700 }}>{entry.value} {entry.unit}</div>
                          <div style={{ color: STATUS_COLORS[entry.status] || "#94a3b8", fontSize: "0.75rem", fontWeight: 600 }}>{entry.status?.replace(/_/g, " ")}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

