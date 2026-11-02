"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { Link } from "@/i18n/navigation";
import { useSession } from "next-auth/react";

export default function ProviderQuotationDashboard() {
  const { cartCount, toggleCart } = useCart();
  const { data: session } = useSession();

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // Quotation Form State
  const [businessName, setBusinessName] = useState("Purvanchal MedTech & Surgical Supplies");
  const [contactName, setContactName] = useState("Rajesh Kumar");
  const [phone, setPhone] = useState("+91 79921 22974");
  const [email, setEmail] = useState("procure@purvanchalmedtech.com");
  const [subtotal, setSubtotal] = useState("");
  const [taxAmount, setTaxAmount] = useState("");
  const [shippingFee, setShippingFee] = useState("0");
  const [timeline, setTimeline] = useState("3 to 5 business days");
  const [warranty, setWarranty] = useState("2 Years Comprehensive On-Site Manufacturer Warranty");
  const [paymentTerms, setPaymentTerms] = useState("30% Advance, 70% against installation & calibration");
  const [cancellationTerms, setCancellationTerms] = useState("Free cancellation before dispatch");
  const [inclusionsText, setInclusionsText] = useState("Includes delivery, on-site setup, and staff demo");
  const [notes, setNotes] = useState("");
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [quoteMessage, setQuoteMessage] = useState("");

  useEffect(() => {
    fetchOpportunities();
    if (session?.user) {
      if (session.user.name) {
        setBusinessName(session.user.name);
        setContactName(session.user.name);
      }
      if (session.user.email && !session.user.email.includes('@swastik.com')) {
        setEmail(session.user.email);
      }
    }
  }, [session]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/marketplace/enquiries");
      const data = await res.json();
      if (data.success) {
        setEnquiries(data.enquiries);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQuoteForm = (enq) => {
    setSelectedEnquiry(enq);
    if (enq.budgetRangeMin) {
      setSubtotal(enq.budgetRangeMin.toString());
      setTaxAmount((enq.budgetRangeMin * 0.12).toFixed(0));
    } else {
      setSubtotal("45000");
      setTaxAmount("5400");
    }
    setIsQuoteModalOpen(true);
    setQuoteMessage("");
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    setSubmittingQuote(true);
    setQuoteMessage("");

    const sub = parseFloat(subtotal || 0);
    const tax = parseFloat(taxAmount || 0);
    const ship = parseFloat(shippingFee || 0);
    const total = sub + tax + ship;

    try {
      const payload = {
        enquiryId: selectedEnquiry.id,
        providerId: session?.user?.id || "sp-eq-001",
        providerType: session?.user?.role || "SUPPLIER",
        providerBusinessName: businessName,
        providerContactName: contactName,
        providerPhone: phone,
        providerEmail: email,
        subtotalAmount: sub,
        taxAmount: tax,
        shippingOrServiceFee: ship,
        totalAmount: total,
        timelineDelivery: timeline,
        warrantyTerms: warranty,
        paymentTerms,
        cancellationTerms,
        inclusions: inclusionsText.split(",").map(s => s.trim()).filter(Boolean),
        notes,
        items: [
          { itemName: selectedEnquiry.title, quantity: selectedEnquiry.quantity || 1, unitPrice: sub, taxRatePercent: 12, totalPrice: total }
        ]
      };

      const res = await fetch("/api/marketplace/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setQuoteMessage("Quotation submitted successfully! Buyer has been notified.");
        fetchOpportunities();
        setTimeout(() => setIsQuoteModalOpen(false), 1500);
      } else {
        alert("Failed to submit quotation: " + data.error);
      }
    } catch (err) {
      alert("Network error: " + err.message);
    } finally {
      setSubmittingQuote(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

      <main className="pt-[110px] md:pt-[130px] pb-16 px-4 sm:px-6 max-w-7xl mx-auto w-full flex-1">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link href="/healthmart" className="hover:text-emerald-400 font-semibold flex items-center gap-1">
            <i className="fa-solid fa-arrow-left text-[10px]"></i> HealthMart Marketplace
          </Link>
          <span>/</span>
          <span className="text-slate-300 font-bold">Provider Quotation Dashboard</span>
        </div>

        {/* Dashboard Header Banner */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-800 to-slate-900 p-6 md:p-8 rounded-3xl border border-slate-700/80 shadow-2xl mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <i className="fa-solid fa-briefcase mr-1"></i> Provider Workspace
                </span>
                <span className="text-xs text-slate-300 font-semibold">Gorakhpur Regional Cluster</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Healthcare Lead Management & Quotation Center
              </h1>
              <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Review eligible healthcare enquiries matched to your licensed credentials. Create structured quotations with itemized pricing, warranties, and delivery timelines.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex gap-3 text-center">
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700 min-w-[100px]">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Matched Leads</div>
                <div className="text-2xl font-black text-emerald-400 mt-0.5">{enquiries.length}</div>
              </div>
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700 min-w-[100px]">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Response Rate</div>
                <div className="text-2xl font-black text-teal-300 mt-0.5">94%</div>
              </div>
            </div>
          </div>
        </div>

        {/* ENQUIRIES / LEADS TABLE */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <i className="fa-solid fa-inbox text-emerald-400"></i> Active Healthcare RFQs & Procurement Leads ({enquiries.length})
            </h2>
            <button
              onClick={fetchOpportunities}
              className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1"
            >
              <i className="fa-solid fa-rotate-right"></i> Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <i className="fa-solid fa-circle-notch fa-spin text-3xl text-emerald-500 mb-2"></i>
              <p className="text-xs text-slate-400 font-semibold">Loading matched requirements...</p>
            </div>
          ) : enquiries.length === 0 ? (
            <div className="py-16 text-center bg-slate-800/40 rounded-3xl border border-slate-800 p-8">
              <p className="text-xs text-slate-400">No active leads currently waiting for quotes.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {enquiries.map(enq => (
                <div
                  key={enq.id}
                  className="bg-slate-800/70 border border-slate-700/80 hover:border-slate-600 rounded-2xl p-5 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {enq.enquiryNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {enq.serviceType}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        📍 {enq.locationCity} • {enq.quantity} unit(s)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(enq.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-white">
                      {enq.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 max-w-3xl">
                      {enq.description}
                    </p>

                    <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
                      <span>Buyer: <strong className="text-slate-200">{enq.buyerOrganization || enq.buyerName}</strong></span>
                      <span>•</span>
                      <span>Quotes Submitted: <strong className="text-emerald-400">{enq.quotesCount || 0}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
                    <Link
                      href={`/healthmart/compare/${enq.id}`}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-950 border border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-eye"></i> View Competition Matrix
                    </Link>

                    <button
                      onClick={() => handleOpenQuoteForm(enq)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-file-invoice-dollar"></i> Submit Quotation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SUBMIT QUOTATION MODAL */}
        {isQuoteModalOpen && selectedEnquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <div className="bg-slate-900 max-w-2xl w-full rounded-3xl border border-slate-700 p-6 md:p-8 shadow-2xl text-slate-100 animate-in fade-in zoom-in duration-200 my-auto max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-start mb-4 shrink-0">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Phase 5 Structured Quote Builder
                  </span>
                  <h3 className="text-xl font-black text-white mt-1">
                    Formulate Quotation for {selectedEnquiry.enquiryNumber}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedEnquiry.title} • {selectedEnquiry.buyerOrganization || selectedEnquiry.buyerName}
                  </p>
                </div>
                <button
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              {quoteMessage ? (
                <div className="py-8 text-center">
                  <i className="fa-solid fa-circle-check text-4xl text-emerald-400 mb-2"></i>
                  <p className="text-base font-bold text-white">{quoteMessage}</p>
                </div>
              ) : (
                <form onSubmit={handleQuoteSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
                  {/* Pricing line items */}
                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                    <div className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <i className="fa-solid fa-calculator"></i> Itemized Pricing (INR)
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Subtotal (₹) *</label>
                        <input
                          type="number"
                          value={subtotal}
                          onChange={(e) => setSubtotal(e.target.value)}
                          required
                          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Applicable GST / Tax (₹)</label>
                        <input
                          type="number"
                          value={taxAmount}
                          onChange={(e) => setTaxAmount(e.target.value)}
                          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Delivery / Service Fee (₹)</label>
                        <input
                          type="number"
                          value={shippingFee}
                          onChange={(e) => setShippingFee(e.target.value)}
                          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm">
                      <span className="font-bold text-slate-300">Total Customer Quoted Price:</span>
                      <span className="font-black text-emerald-400 text-lg">
                        ₹{(parseFloat(subtotal || 0) + parseFloat(taxAmount || 0) + parseFloat(shippingFee || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Delivery & Warranty Terms */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Delivery Timeline</label>
                      <input
                        type="text"
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value)}
                        placeholder="e.g. 3 to 5 business days"
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Warranty Scope</label>
                      <input
                        type="text"
                        value={warranty}
                        onChange={(e) => setWarranty(e.target.value)}
                        placeholder="e.g. 2 Years Comprehensive Warranty"
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                  </div>

                  {/* Payment & Cancellation terms */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Payment Terms</label>
                      <input
                        type="text"
                        value={paymentTerms}
                        onChange={(e) => setPaymentTerms(e.target.value)}
                        placeholder="e.g. 30% PO, 70% installation"
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Cancellation Terms</label>
                      <input
                        type="text"
                        value={cancellationTerms}
                        onChange={(e) => setCancellationTerms(e.target.value)}
                        placeholder="e.g. Free cancellation before dispatch"
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Included Services (Comma separated)</label>
                    <input
                      type="text"
                      value={inclusionsText}
                      onChange={(e) => setInclusionsText(e.target.value)}
                      placeholder="e.g. Free delivery, installation, staff training, 1st year calibration"
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Notes / Specifications to Buyer</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Specify stock availability, model numbers, or regulatory compliance certificates..."
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-end gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsQuoteModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingQuote}
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black uppercase tracking-wider disabled:opacity-50"
                    >
                      {submittingQuote ? "Submitting..." : "Send Formal Quotation"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

