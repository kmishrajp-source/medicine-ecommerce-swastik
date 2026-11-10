"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

const DEMO_VCF = `##fileformat=VCFv4.2
##source=SwastikPrecisionHealthAI_v1
##reference=GRCh38
#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO
12\t121416678\trs1801261\tG\tA\t999\tPASS\tGENE=HNF1A
19\t45425941\trs7903146\tC\tT\t850\tPASS\tGENE=TCF7L2
10\t96741053\trs1799853\tC\tT\t920\tPASS\tGENE=CYP2C9`;

export default function GeneticsPage() {
  const { data: session } = useSession();
  const { cartCount, toggleCart } = useCart();
  const [patientId, setPatientId] = useState("SPH-2026-0018");
  const [testType, setTestType] = useState("Targeted Gene Panel");
  const [labName, setLabName] = useState("MedGenome Labs");
  const [vcfText, setVcfText] = useState("");
  const [status, setStatus] = useState("IDLE");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("LOADING");
    try {
      const res = await fetch("/api/precision/genetics/upload-vcf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, vcfText: vcfText || DEMO_VCF, testType, lab: labName }),
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

  const CLASS_COLORS = { PATHOGENIC: "#ef4444", LIKELY_PATHOGENIC: "#f97316", PHARMACOGENOMIC: "#6366f1", RISK_VARIANT: "#f59e0b", VARIANT_OF_UNCERTAIN_SIGNIFICANCE: "#64748b" };

  return (
    <>
      <Navbar session={session} cartCount={cartCount} toggleCart={toggleCart} />
      <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1a0533 100%)", padding: "40px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ marginBottom: 24 }}>
            <Link href="/precision" style={{ color: "#a855f7", textDecoration: "none", fontSize: "0.85rem" }}>
              <i className="fa-solid fa-arrow-left mr-2"></i>Precision Dashboard
            </Link>
          </div>
          <h1 style={{ color: "white", fontSize: "1.6rem", fontWeight: 900, marginBottom: 8 }}>
            <i className="fa-solid fa-dna" style={{ color: "#a855f7", marginRight: 10 }}></i>
            Genetics Intelligence & Pharmacogenomics
          </h1>
          <p style={{ color: "#94a3b8", marginBottom: 28 }}>Submit VCF data or gene panel results for MODY classification, variant annotation, and CPIC PGx analysis.</p>

          {status !== "SUCCESS" ? (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24 }}>
                <h3 style={{ color: "#a855f7", margin: "0 0 16px", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: 1 }}>Test Details</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  {[
                    { label: "Patient MRN", val: patientId, set: setPatientId },
                    { label: "Test Type", val: testType, set: setTestType },
                    { label: "Laboratory", val: labName, set: setLabName },
                  ].map(f => (
                    <div key={f.label}>
                      <label style={{ color: "#94a3b8", fontSize: "0.8rem", display: "block", marginBottom: 6 }}>{f.label}</label>
                      <input value={f.val} onChange={e => f.set(e.target.value)}
                        style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 12px", color: "white", boxSizing: "border-box" }} />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24 }}>
                <h3 style={{ color: "#a855f7", margin: "0 0 8px", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: 1 }}>VCF Data</h3>
                <p style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: 12 }}>Paste VCF 4.2 content below, or leave empty to use demo data (Rajesh Mishra — HNF1A MODY3).</p>
                <textarea rows={8} value={vcfText} onChange={e => setVcfText(e.target.value)} placeholder={DEMO_VCF}
                  style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "12px", color: "#c084fc", fontFamily: "monospace", fontSize: "0.8rem", boxSizing: "border-box", resize: "vertical" }} />
                <button type="button" onClick={() => setVcfText(DEMO_VCF)}
                  style={{ marginTop: 8, background: "rgba(168,85,247,0.2)", color: "#c084fc", border: "1px solid #a855f740", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: "0.8rem" }}>
                  Load Demo VCF
                </button>
              </div>

              {status === "ERROR" && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid #ef4444", borderRadius: 10, padding: 14, color: "#fca5a5" }}>{result?.error}</div>}

              <button type="submit" disabled={status === "LOADING"}
                style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)", color: "white", border: "none", borderRadius: 12, padding: "14px 28px", fontSize: "1rem", fontWeight: 700, cursor: "pointer" }}>
                {status === "LOADING" ? "Processing VCF..." : "Analyse Genetic Report"}
              </button>
            </form>
          ) : null}

          {status === "SUCCESS" && result && (
            <div style={{ marginTop: 24 }}>
              {/* Summary */}
              <div style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
                <h3 style={{ color: "white", margin: "0 0 12px" }}>VCF Summary</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
                  {Object.entries(result.parsedSummary || {}).map(([k, v]) => (
                    <div key={k} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                      <div style={{ color: "white", fontWeight: 800, fontSize: "1.4rem" }}>{v}</div>
                      <div style={{ color: "#94a3b8", fontSize: "0.72rem", textTransform: "capitalize" }}>{k.replace(/([A-Z])/g, " $1").trim()}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Variants */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
                <h3 style={{ color: "white", margin: "0 0 12px" }}>Annotated Variants</h3>
                {(result.record?.variants || []).map((v, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 16px", marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <span style={{ color: "white", fontWeight: 700, marginRight: 8 }}>{v.gene || "Unknown"}</span>
                        <span style={{ color: "#64748b", fontSize: "0.8rem" }}>{v.rsId || v.id} | {v.ref}→{v.alt} | Chr{v.chrom}:{v.pos}</span>
                      </div>
                      <span style={{ background: (CLASS_COLORS[v.classification] || "#64748b") + "30", color: CLASS_COLORS[v.classification] || "#94a3b8", padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700 }}>{v.classification?.replace(/_/g, " ")}</span>
                    </div>
                    {v.condition && <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: 4 }}>{v.condition} {v.hgvs ? `· ${v.hgvs}` : ""} {v.protein ? `· ${v.protein}` : ""}</div>}
                  </div>
                ))}
              </div>

              {/* PGx */}
              {result.pgxReport?.recommendations?.length > 0 && (
                <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
                  <h3 style={{ color: "white", margin: "0 0 12px" }}>Pharmacogenomic Recommendations (CPIC)</h3>
                  {result.pgxReport.recommendations.map((rec, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "12px 16px", marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ color: "#6366f1", fontWeight: 700 }}>{rec.gene} — {rec.phenotype}</span>
                        <span style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc", padding: "2px 8px", borderRadius: 10, fontSize: "0.72rem" }}>CPIC Level {rec.cpicLevel}</span>
                      </div>
                      <div style={{ color: "#94a3b8", fontSize: "0.82rem", marginBottom: 4 }}><strong style={{ color: "white" }}>Drugs:</strong> {rec.drugs?.join(", ")}</div>
                      <div style={{ color: "#c7d2fe", fontSize: "0.82rem" }}>{rec.recommendation}</div>
                    </div>
                  ))}
                </div>
              )}

              {result.pgxReport?.modyGuidance?.length > 0 && (
                <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
                  <h3 style={{ color: "#ef4444", margin: "0 0 12px" }}>⚠️ MODY-Specific Drug Guidance</h3>
                  {result.pgxReport.modyGuidance.map((g, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "12px 16px", marginBottom: 10 }}>
                      <div style={{ color: "white", fontWeight: 700, marginBottom: 6 }}>{g.gene} — {g.modyType}</div>
                      <div style={{ color: "#94a3b8", fontSize: "0.82rem", marginBottom: 4 }}><strong style={{ color: "#10b981" }}>Preferred:</strong> {g.preferredDrug}</div>
                      <div style={{ color: "#94a3b8", fontSize: "0.82rem", marginBottom: 4 }}><strong style={{ color: "#ef4444" }}>Avoid:</strong> {g.avoidDrugs?.join(", ")}</div>
                      <div style={{ color: "#c7d2fe", fontSize: "0.8rem" }}>{g.notes}</div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setStatus("IDLE")}
                  style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "none", borderRadius: 10, padding: "10px 20px", cursor: "pointer" }}>
                  Upload Another
                </button>
                <Link href="/precision/doctor/review" style={{ background: "#10b981", color: "white", padding: "10px 20px", borderRadius: 10, textDecoration: "none", fontWeight: 700 }}>
                  Request Doctor Review →
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

