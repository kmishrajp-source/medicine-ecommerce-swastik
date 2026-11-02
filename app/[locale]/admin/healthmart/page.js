"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { HEALTHMART_CATEGORIES } from "@/lib/healthmart/categories";

export default function AdminHealthMartDashboard() {
  const { cartCount, toggleCart } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("rfqs"); // "rfqs", "categories", "matching", "revenue"
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role === "CUSTOMER") {
      router.push("/");
    } else {
      fetchEnquiries();
    }
  }, [status, session, router]);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/marketplace/enquiries");
      const data = await res.json();
      if (data.success) {
        setEnquiries(data.enquiries);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

      <main className="pt-[110px] md:pt-[130px] pb-16 px-4 sm:px-6 max-w-7xl mx-auto w-full flex-1">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link href="/admin" className="hover:text-emerald-400 font-semibold flex items-center gap-1">
            <i className="fa-solid fa-arrow-left text-[10px]"></i> Main Admin Command Matrix
          </Link>
          <span>/</span>
          <span className="text-slate-300 font-bold">HealthMart Marketplace Control Center</span>
        </div>

        {/* Dashboard Title Card */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 md:p-8 rounded-3xl border border-emerald-500/30 shadow-2xl mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <i className="fa-solid fa-shield-halved mr-1"></i> Admin Command
                </span>
                <span className="text-xs text-slate-300 font-semibold">B2B & B2C Healthcare Operations</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Swastik HealthMart Administration Matrix
              </h1>
              <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Configure 13 healthcare categories, moderate buyer RFQs, inspect transparent provider matching algorithms, audit submitted quotations, and enforce regulatory compliance.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex gap-3 text-center">
              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-700 min-w-[100px]">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total RFQs</div>
                <div className="text-2xl font-black text-emerald-400 mt-0.5">{enquiries.length}</div>
              </div>
              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-700 min-w-[100px]">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Categories</div>
                <div className="text-2xl font-black text-teal-300 mt-0.5">13</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-8 pt-4 border-t border-slate-800 flex gap-2 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab("rfqs")}
              className={`px-4 py-2 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "rfqs"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-slate-900/80 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <i className="fa-solid fa-inbox"></i> Moderate RFQs & Leads ({enquiries.length})
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-4 py-2 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "categories"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-slate-900/80 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <i className="fa-solid fa-shapes"></i> Category Directory Engine
            </button>
            <button
              onClick={() => setActiveTab("matching")}
              className={`px-4 py-2 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "matching"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-slate-900/80 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <i className="fa-solid fa-sliders"></i> Matching & Algorithm Transparency
            </button>
          </div>
        </div>

        {/* TAB 1: RFQ & LEADS MANAGEMENT */}
        {activeTab === "rfqs" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-black text-white uppercase tracking-wider">
                Buyer Requirements & Lead Distribution Status
              </h2>
              <button
                onClick={fetchEnquiries}
                className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1"
              >
                <i className="fa-solid fa-rotate-right"></i> Refresh
              </button>
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <i className="fa-solid fa-circle-notch fa-spin text-3xl text-emerald-500 mb-2"></i>
                <p className="text-xs text-slate-400">Loading requirement matrix...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {enquiries.map(enq => (
                  <div
                    key={enq.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {enq.enquiryNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {enq.serviceType}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          📍 {enq.locationCity}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Status: <strong className="text-white">{enq.status}</strong>
                        </span>
                      </div>

                      <h3 className="text-sm md:text-base font-black text-white">
                        {enq.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1 max-w-2xl">
                        {enq.description}
                      </p>
                      <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
                        <span>Buyer: <strong>{enq.buyerName}</strong> ({enq.buyerOrganization || "Direct"})</span>
                        <span>•</span>
                        <span>Phone: <strong className="font-mono text-emerald-400">{enq.buyerPhone}</strong></span>
                        <span>•</span>
                        <span>Quotations: <strong className="text-emerald-400">{enq.quotesCount || 0}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/healthmart/compare/${enq.id}`}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700"
                      >
                        Inspect Quotes Matrix
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CATEGORY DIRECTORY ENGINE */}
        {activeTab === "categories" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-black text-white uppercase tracking-wider">
                13 Configurable Marketplace Sectors
              </h2>
              <span className="text-xs text-slate-400">
                Independent workflows & custom credential rules
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {HEALTHMART_CATEGORIES.map(cat => (
                <div
                  key={cat.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center text-lg">
                        <i className={cat.icon}></i>
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">{cat.name}</h3>
                        <div className="text-[10px] text-slate-400">{cat.slug}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400">
                      Active
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {cat.description}
                  </p>

                  <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Workflow Model:</span>
                      <span className="font-mono text-emerald-400 font-bold">{cat.permittedWorkflow}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Comparison Matrix:</span>
                      <span className="font-bold text-white">{cat.supportsQuotationComparison ? "Supported" : "Disabled"}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Direct Booking:</span>
                      <span className="font-bold text-white">{cat.supportsDirectBooking ? "Supported" : "Disabled"}</span>
                    </div>
                  </div>

                  <div className="text-[11px]">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Required Credentials:</div>
                    <div className="flex flex-wrap gap-1">
                      {cat.requiredCredentials?.map((cred, i) => (
                        <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                          {cred}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MATCHING ALGORITHM TRANSPARENCY */}
        {activeTab === "matching" && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <i className="fa-solid fa-sliders text-emerald-400"></i> Rules-Based Matching Engine Policy (Phase 7)
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              In strict accordance with architectural requirements, Swastik HealthMart utilizes a deterministic, transparent rules-based scoring model. Leads are never blindly broadcasted to unverified or unrelated providers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-2xl font-black text-emerald-400 mb-1">40 Pts</div>
                <div className="text-xs font-bold text-white uppercase">Category Affinity</div>
                <p className="text-[11px] text-slate-400 mt-1">Exact match between buyer sector & provider service taxonomy.</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-2xl font-black text-teal-400 mb-1">30 Pts</div>
                <div className="text-xs font-bold text-white uppercase">Geographic Coverage</div>
                <p className="text-[11px] text-slate-400 mt-1">Service radius matches buyer target city (Gorakhpur cluster or Pan India).</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-2xl font-black text-cyan-400 mb-1">20 Pts</div>
                <div className="text-xs font-bold text-white uppercase">Credential Audit</div>
                <p className="text-[11px] text-slate-400 mt-1">CDSCO, Drug License, MCI, or NABH documents formally verified.</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-2xl font-black text-amber-400 mb-1">10 Pts</div>
                <div className="text-xs font-bold text-white uppercase">SLA Responsiveness</div>
                <p className="text-[11px] text-slate-400 mt-1">High customer rating (&gt;4.5★) and quote turnaround under 2 hours.</p>
              </div>
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 space-y-1 mt-4">
              <div className="font-bold flex items-center gap-1.5">
                <i className="fa-solid fa-circle-check"></i> Distribution Cap Active
              </div>
              <p>Each submitted RFQ is capped at a maximum of 4 top-scoring verified providers to prevent customer overwhelm and maintain high quotation quality.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

