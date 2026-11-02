"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";

export default function EnquiryStatusPage() {
  const { cartCount, toggleCart } = useCart();
  const params = useParams();
  const enquiryNumber = params?.enquiryNumber;

  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (enquiryNumber) {
      fetchEnquiry();
    }
  }, [enquiryNumber]);

  const fetchEnquiry = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/marketplace/enquiries/${enquiryNumber}`);
      const data = await res.json();
      if (data.success) {
        setEnquiry(data.enquiry);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const WORKFLOW_STEPS = [
    { key: "SUBMITTED", label: "Requirement Submitted", icon: "fa-solid fa-file-arrow-up" },
    { key: "MATCHING_PROVIDERS", label: "Rules-Based Matching", icon: "fa-solid fa-sliders" },
    { key: "SENT_TO_PROVIDERS", label: "Sent to Verified Providers", icon: "fa-solid fa-paper-plane" },
    { key: "QUOTATIONS_AVAILABLE", label: "Quotations Available", icon: "fa-solid fa-scale-balanced" },
    { key: "ACCEPTED", label: "Quotation Accepted & Order Active", icon: "fa-solid fa-circle-check" }
  ];

  const getStepStatus = (stepKey, currentStatus) => {
    const order = ["SUBMITTED", "MATCHING_PROVIDERS", "SENT_TO_PROVIDERS", "QUOTATIONS_AVAILABLE", "ACCEPTED"];
    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepKey);

    if (stepIndex < currentIndex || currentStatus === "ACCEPTED") return "COMPLETED";
    if (stepIndex === currentIndex) return "CURRENT";
    return "PENDING";
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

      <main className="pt-[110px] md:pt-[130px] pb-16 px-4 sm:px-6 max-w-5xl mx-auto w-full flex-1">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link href="/healthmart" className="hover:text-emerald-400 font-semibold flex items-center gap-1">
            <i className="fa-solid fa-arrow-left text-[10px]"></i> HealthMart
          </Link>
          <span>/</span>
          <span className="text-slate-300 font-bold">Enquiry Status Tracking</span>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <i className="fa-solid fa-circle-notch fa-spin text-3xl text-emerald-500 mb-2"></i>
            <p className="text-xs text-slate-400">Loading requirement status...</p>
          </div>
        ) : !enquiry ? (
          <div className="py-16 text-center bg-slate-800/50 rounded-3xl border border-slate-700 p-8">
            <h2 className="text-base font-bold text-white mb-2">Enquiry Reference Not Found</h2>
            <Link href="/healthmart" className="text-xs text-emerald-400 underline font-bold">
              Return to Marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header info */}
            <div className="bg-slate-800/80 p-6 md:p-8 rounded-3xl border border-slate-700 shadow-2xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {enquiry.enquiryNumber}
                  </span>
                  <h1 className="text-xl md:text-2xl font-black text-white mt-1.5">
                    {enquiry.title}
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Submitted on {new Date(enquiry.createdAt).toLocaleDateString()} • City: {enquiry.locationCity}
                  </p>
                </div>

                <div className="shrink-0">
                  <Link
                    href={`/healthmart/compare/${enquiry.id}`}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-scale-balanced"></i> Compare {enquiry.quotations?.length || 0} Quotes
                  </Link>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="mt-8 pt-6 border-t border-slate-700/60">
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {WORKFLOW_STEPS.map((step) => {
                    const st = getStepStatus(step.key, enquiry.status);
                    return (
                      <div
                        key={step.key}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          st === "COMPLETED"
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                            : st === "CURRENT"
                            ? "bg-indigo-600/30 border-indigo-400 text-white font-bold ring-2 ring-indigo-400/30"
                            : "bg-slate-900/40 border-slate-800 text-slate-500"
                        }`}
                      >
                        <div className="text-lg mb-1">
                          <i className={step.icon}></i>
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider">
                          {step.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Requirement Summary & Matched Providers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-slate-800/60 p-6 rounded-3xl border border-slate-700/80">
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">
                  Requirement Specifications
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {enquiry.description}
                </p>

                {enquiry.categorySpecificData && Object.keys(enquiry.categorySpecificData).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-2 gap-3 text-xs">
                    {Object.entries(enquiry.categorySpecificData).map(([k, v]) => (
                      <div key={k} className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{k}</div>
                        <div className="text-slate-200 font-semibold mt-0.5">{String(v)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700/80 space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Contact & Privacy Audit
                </h3>
                <div className="text-xs space-y-2 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Buyer Name:</span>
                    <span className="font-bold">{enquiry.buyerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Organization:</span>
                    <span className="font-bold">{enquiry.buyerOrganization || "Direct Individual"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Privacy Mode:</span>
                    <span className="font-mono text-emerald-400 font-bold">{enquiry.privacyMode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quotes Available:</span>
                    <span className="font-bold text-emerald-400">{enquiry.quotations?.length || 0}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700/50">
                  <Link
                    href={`/healthmart/compare/${enquiry.id}`}
                    className="block w-full text-center py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-emerald-500/20"
                  >
                    View Side-by-Side Matrix
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

