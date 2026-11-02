"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";

export default function QuotationComparisonPage() {
  const { cartCount, toggleCart } = useCart();
  const params = useParams();
  const enquiryId = params?.id;

  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    if (enquiryId) {
      fetchEnquiryDetails();
    }
  }, [enquiryId]);

  const fetchEnquiryDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/marketplace/enquiries/${enquiryId}`);
      const data = await res.json();
      if (data.success) {
        setEnquiry(data.enquiry);
      } else {
        setError(data.error || "Failed to load enquiry details.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error fetching quotation matrix.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuotationAction = async (quoteId, status) => {
    const confirmText = status === "ACCEPTED"
      ? "Accept this quotation? The provider will be officially notified and will initiate order fulfillment."
      : "Decline this quotation?";
    if (!window.confirm(confirmText)) return;

    setActionLoading(true);
    setActionMessage("");
    try {
      const res = await fetch(`/api/marketplace/quotations/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        fetchEnquiryDetails();
      } else {
        alert("Action failed: " + data.error);
      }
    } catch (err) {
      alert("Network error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

      <main className="pt-[110px] md:pt-[130px] pb-16 px-4 sm:px-6 max-w-7xl mx-auto w-full flex-1">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link href="/healthmart" className="hover:text-emerald-400 font-semibold flex items-center gap-1">
            <i className="fa-solid fa-arrow-left text-[10px]"></i> Back to HealthMart
          </Link>
          <span>/</span>
          <span className="text-slate-300 font-bold">Quotation Comparison Matrix</span>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <i className="fa-solid fa-circle-notch fa-spin text-4xl text-emerald-500 mb-3"></i>
            <p className="text-sm font-bold text-slate-400">Loading side-by-side quotation matrix...</p>
          </div>
        ) : error || !enquiry ? (
          <div className="py-16 text-center bg-slate-800/50 rounded-3xl border border-slate-700 p-8 max-w-lg mx-auto">
            <i className="fa-solid fa-triangle-exclamation text-3xl text-amber-400 mb-3"></i>
            <h2 className="text-lg font-black text-white mb-2">Requirement Not Found</h2>
            <p className="text-xs text-slate-400 mb-4">{error || "The requested RFQ could not be located."}</p>
            <Link
              href="/healthmart"
              className="px-5 py-2.5 bg-emerald-500 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider"
            >
              Return to Marketplace
            </Link>
          </div>
        ) : (
          <div>
            {/* Header Card */}
            <div className="bg-gradient-to-r from-slate-800 to-indigo-950/60 p-6 md:p-8 rounded-3xl border border-slate-700/80 shadow-2xl mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Ref: {enquiry.enquiryNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Status: {enquiry.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      📍 {enquiry.locationCity}, {enquiry.locationState}
                    </span>
                  </div>
                  <h1 className="text-xl md:text-3xl font-black text-white tracking-tight">
                    {enquiry.title}
                  </h1>
                  <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
                    {enquiry.description}
                  </p>
                </div>

                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700/80 text-right shrink-0">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Quotations Received</div>
                  <div className="text-3xl font-black text-emerald-400 mt-0.5">
                    {enquiry.quotations?.length || 0}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Multi-Supplier Bidding</div>
                </div>
              </div>

              {actionMessage && (
                <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
                  <i className="fa-solid fa-circle-check"></i> {actionMessage}
                </div>
              )}
            </div>

            {/* SIDE BY SIDE COMPARISON MATRIX */}
            {(!enquiry.quotations || enquiry.quotations.length === 0) ? (
              <div className="py-16 text-center bg-slate-800/40 rounded-3xl border border-slate-800 p-8">
                <i className="fa-solid fa-hourglass-half text-3xl text-amber-400 mb-3"></i>
                <h3 className="text-lg font-bold text-white mb-1">Awaiting Quotations</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                  Eligible verified suppliers have been notified and are formulating itemized bids. Quotations will appear here side-by-side as they arrive.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <i className="fa-solid fa-scale-balanced text-emerald-400"></i> Side-by-Side Quotation Comparison ({enquiry.quotations.length})
                  </h2>
                  <span className="text-xs text-slate-400 italic">
                    Compare pricing, warranty, and terms before accepting.
                  </span>
                </div>

                {/* COMPARISON GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enquiry.quotations.map((quote, idx) => {
                    const isAccepted = quote.status === "ACCEPTED";
                    const isRejected = quote.status === "REJECTED";

                    return (
                      <div
                        key={quote.id}
                        className={`rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-2xl relative ${
                          isAccepted
                            ? "bg-slate-800/95 border-emerald-500 ring-2 ring-emerald-500/30"
                            : isRejected
                            ? "bg-slate-900/60 border-slate-800 opacity-60"
                            : "bg-slate-800/80 border-slate-700/80 hover:border-slate-600"
                        }`}
                      >
                        {/* Top banner tag */}
                        <div className={`p-4 ${isAccepted ? "bg-emerald-600/30 border-b border-emerald-500/40" : "bg-slate-900/80 border-b border-slate-700/60"}`}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-mono text-[10px] text-slate-400 font-bold">
                              {quote.quoteNumber}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isAccepted
                                ? "bg-emerald-500 text-slate-950"
                                : isRejected
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            }`}>
                              {quote.status}
                            </span>
                          </div>

                          <h3 className="text-base font-black text-white line-clamp-1">
                            {quote.providerBusinessName}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-xs">
                            <span className="text-amber-400 font-bold">★ {quote.rating || 4.8}</span>
                            <span className="text-slate-400 text-[10px]">• {quote.verificationBadge || "SWASTIK_VERIFIED"}</span>
                            {quote.isRevised && (
                              <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.2 rounded font-bold">
                                Rev v{quote.versionNumber}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Middle: Key Quotation Fields */}
                        <div className="p-5 space-y-4 flex-1 text-xs">
                          {/* Price Display */}
                          <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-700/60">
                            <div className="text-[10px] uppercase font-black tracking-wider text-slate-400">Total Quoted Price</div>
                            <div className="text-2xl font-black text-emerald-400 mt-0.5">
                              ₹{quote.totalAmount?.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                              <span>Subtotal: ₹{quote.subtotalAmount?.toLocaleString()}</span>
                              <span>Tax/GST: ₹{quote.taxAmount?.toLocaleString()}</span>
                            </div>
                            {quote.shippingOrServiceFee > 0 ? (
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Delivery Fee: ₹{quote.shippingOrServiceFee}
                              </div>
                            ) : (
                              <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                                ✓ Free Freight / Delivery Included
                              </div>
                            )}
                          </div>

                          {/* Line Items */}
                          {quote.items && quote.items.length > 0 && (
                            <div>
                              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                                Itemized Breakdown
                              </div>
                              <div className="space-y-1 bg-slate-900/40 p-2.5 rounded-xl border border-slate-700/50">
                                {quote.items.map((item, i) => (
                                  <div key={i} className="flex justify-between text-[11px] text-slate-300">
                                    <span className="truncate pr-2">{item.quantity}x {item.itemName}</span>
                                    <span className="font-bold shrink-0">₹{item.totalPrice?.toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Delivery & Availability */}
                          <div className="space-y-2 text-[11px]">
                            <div className="flex justify-between items-center py-1 border-b border-slate-700/40">
                              <span className="text-slate-400">Delivery Timeline:</span>
                              <span className="font-bold text-white">{quote.timelineDelivery || "3-5 days"}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-slate-700/40">
                              <span className="text-slate-400">Quote Validity:</span>
                              <span className="font-mono text-slate-300">
                                {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : "14 Days"}
                              </span>
                            </div>
                          </div>

                          {/* Warranty & Terms */}
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                              Warranty & Service Terms
                            </div>
                            <p className="text-[11px] text-slate-300 bg-slate-900/40 p-2.5 rounded-xl border border-slate-700/50 leading-relaxed">
                              🛡️ {quote.warrantyTerms || "Standard Warranty"}
                            </p>
                          </div>

                          {/* Inclusions */}
                          {quote.inclusions && quote.inclusions.length > 0 && (
                            <div>
                              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400 mb-1">
                                Inclusions
                              </div>
                              <ul className="text-[11px] text-slate-300 space-y-1">
                                {quote.inclusions.map((inc, i) => (
                                  <li key={i} className="flex items-center gap-1.5">
                                    <i className="fa-solid fa-circle-check text-emerald-400 text-[9px]"></i>
                                    <span>{inc}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Payment Terms */}
                          <div className="text-[11px] text-slate-400">
                            <span className="font-bold text-slate-300">Payment: </span>
                            {quote.paymentTerms || "Standard Payment Terms"}
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="p-4 bg-slate-900/90 border-t border-slate-700/60 flex items-center justify-between gap-2">
                          {isAccepted ? (
                            <div className="w-full text-center py-2 bg-emerald-500/20 text-emerald-400 rounded-xl font-black text-xs uppercase tracking-wider border border-emerald-500/40">
                              ✓ Quotation Accepted
                            </div>
                          ) : isRejected ? (
                            <div className="w-full text-center py-2 bg-red-500/10 text-red-400 rounded-xl font-bold text-xs">
                              Quotation Declined
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => handleQuotationAction(quote.id, "REJECTED")}
                                disabled={actionLoading}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => handleQuotationAction(quote.id, "ACCEPTED")}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                              >
                                <i className="fa-solid fa-check"></i> Accept Quotation
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

