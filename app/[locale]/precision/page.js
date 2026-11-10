"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function PrecisionDashboardPage() {
  const { data: session } = useSession();
  const { cartCount, toggleCart } = useCart();
  const [demoData, setDemoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load demo patient data
    fetch("/api/precision/patients?id=SPH-2026-0018")
      .then(r => r.json())
      .then(d => { setDemoData(d.patient); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const modules = [
    { href: "/precision/patient/register", icon: "fa-user-plus", color: "#6366f1", bg: "rgba(99,102,241,0.15)", label: "Patient Registration", desc: "Register patient & manage profile" },
    { href: "/precision/lab/upload", icon: "fa-flask", color: "#0ea5e9", bg: "rgba(14,165,233,0.15)", label: "Lab Intelligence", desc: "Upload & analyse lab reports" },
    { href: "/precision/genetics", icon: "fa-dna", color: "#a855f7", bg: "rgba(168,85,247,0.15)", label: "Genetics & VCF", desc: "Genetic variants, MODY, PGx" },
    { href: "/precision/doctor/review", icon: "fa-user-doctor", color: "#10b981", bg: "rgba(16,185,129,0.15)", label: "Doctor Review", desc: "Clinical sign-off & approvals" },
    { href: "/precision/monitoring", icon: "fa-chart-line", color: "#f59e0b", bg: "rgba(245,158,11,0.15)", label: "Patient Monitoring", desc: "Track glucose, HbA1c & more" },
  ];

  return (
    <>
      <Navbar session={session} cartCount={cartCount} toggleCart={toggleCart} />

      <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)", padding: "40px 20px" }}>
        {/* Header */}
        <div style={{ maxWidth: 1100, margin: "0 auto 40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
            <div style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)", borderRadius: 16, padding: 14, fontSize: 28 }}>
              <i className="fa-solid fa-dna" style={{ color: "white" }}></i>
            </div>
            <div>
              <h1 style={{ color: "white", fontSize: "1.8rem", fontWeight: 900, margin: 0 }}>Swastik Precision Health AI</h1>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.9rem" }}>Genetics · Diabetes · Pharmacogenomics · Doctor-Supervised</p>
            </div>
          </div>
          <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 12, padding: "12px 20px", display: "flex", gap: 8, alignItems: "center" }}>
            <i className="fa-solid fa-shield-halved" style={{ color: "#6366f1" }}></i>
            <span style={{ color: "#c7d2fe", fontSize: "0.85rem" }}>All clinical recommendations require physician review before use. Demo data shown — Rajesh Mishra, MODY3 case.</span>
          </div>
        </div>

        {/* Demo Patient Card */}
        {demoData && (
          <div style={{ maxWidth: 1100, margin: "0 auto 32px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ color: "white", margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
                <i className="fa-solid fa-user-circle" style={{ color: "#6366f1", marginRight: 8 }}></i>
                Demo Patient: {demoData.name}
              </h2>
              <span style={{ background: "rgba(16,185,129,0.2)", color: "#10b981", padding: "4px 12px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700 }}>MODY3 — HNF1A Pathogenic</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
              {[
                { label: "MRN", val: demoData.mrn },
                { label: "Age / Sex", val: `${demoData.age}Y ${demoData.gender}` },
                { label: "BMI", val: `${demoData.bmi} kg/m²` },
                { label: "Blood Group", val: demoData.bloodGroup },
                { label: "Location", val: demoData.address?.split(",")[0] },
                { label: "Current Rx", val: demoData.currentMedications?.[0] },
              ].map(item => (
                <div key={item.label} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 14px" }}>
                  <div style={{ color: "#64748b", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ color: "white", fontWeight: 600, fontSize: "0.9rem" }}>{item.val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Module Cards */}
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
          {modules.map(m => (
            <Link key={m.href} href={m.href} style={{ textDecoration: "none" }}>
              <div style={{ background: m.bg, border: `1px solid ${m.color}40`, borderRadius: 16, padding: 24, cursor: "pointer", transition: "transform 0.2s", textAlign: "center" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                <div style={{ fontSize: 32, marginBottom: 12, color: m.color }}>
                  <i className={`fa-solid ${m.icon}`}></i>
                </div>
                <div style={{ color: "white", fontWeight: 700, fontSize: "1rem", marginBottom: 6 }}>{m.label}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>{m.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Key Metrics Banner */}
        <div style={{ maxWidth: 1100, margin: "32px auto 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {[
            { label: "HbA1c", val: "7.6%", status: "Above Target", color: "#f59e0b" },
            { label: "eGFR (CKD-EPI 2021)", val: "104 mL/min", status: "G1 — Normal", color: "#10b981" },
            { label: "MODY Gene", val: "HNF1A", status: "PATHOGENIC", color: "#ef4444" },
            { label: "CYP2C9 PGx", val: "*1/*2", status: "Intermediate Metaboliser", color: "#f59e0b" },
            { label: "Diagnosis", val: "MODY3", status: "Confidence 91%", color: "#6366f1" },
          ].map(item => (
            <div key={item.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16 }}>
              <div style={{ color: "#64748b", fontSize: "0.72rem", textTransform: "uppercase", marginBottom: 4 }}>{item.label}</div>
              <div style={{ color: "white", fontWeight: 800, fontSize: "1.2rem" }}>{item.val}</div>
              <div style={{ color: item.color, fontSize: "0.75rem", fontWeight: 600, marginTop: 2 }}>{item.status}</div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}

