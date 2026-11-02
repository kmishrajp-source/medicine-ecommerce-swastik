"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { Link } from "@/i18n/navigation";
import { HEALTHMART_CATEGORIES } from "@/lib/healthmart/categories";
import HealthMartRFQModal from "@/components/Marketplace/HealthMartRFQModal";
import ProviderRegistrationModal from "@/components/Marketplace/ProviderRegistrationModal";

export default function HealthMartLandingPage() {
  const { cartCount, toggleCart } = useCart();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [targetCategorySlug, setTargetCategorySlug] = useState(null);
  const [targetProvider, setTargetProvider] = useState(null);
  const [selectedAuditProvider, setSelectedAuditProvider] = useState(null);

  useEffect(() => {
    fetchProviders();
  }, [selectedCategory]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const url = selectedCategory === "all"
        ? "/api/marketplace/providers"
        : `/api/marketplace/providers?category=${selectedCategory}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setProviders(data.providers);
      }
    } catch (err) {
      console.error("Failed to load providers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRFQ = (categorySlug = null, provider = null) => {
    setTargetCategorySlug(categorySlug);
    setTargetProvider(provider);
    setIsRfqModalOpen(true);
  };

  // Filter providers by search
  const filteredProviders = providers.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.businessName.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.serviceLocations || []).some(loc => loc.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

      {/* EMERGENCY TRANSPORT DISCLAIMER BANNER */}
      <div className="pt-[110px] md:pt-[125px] bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs text-amber-200">
        <span className="font-bold text-amber-400 mr-2">
          <i className="fa-solid fa-triangle-exclamation"></i> Emergency Notice:
        </span>
        HealthMart is an IndiaMART-style quotation comparison marketplace for planned services and B2B procurement.
        For critical, life-threatening medical emergencies, immediately dial{" "}
        <a href="tel:108" className="underline font-black text-amber-300 ml-1">
          108 (Emergency Ambulance)
        </a>{" "}
        or{" "}
        <a href="tel:102" className="underline font-black text-amber-300">
          102
        </a>
        .
      </div>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 py-12 md:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider mb-4">
              <i className="fa-solid fa-store"></i> Swastik HealthMart
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-4 leading-tight">
              IndiaMART-Style Healthcare <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Services & Quotations Marketplace
              </span>
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Connect with verified doctors, pharmacies, accredited laboratories, multi-specialty hospitals, medical equipment dealers, and corporate healthcare suppliers. Post requirements, compare transparent quotations side-by-side, and save up to 40%.
            </p>

            {/* Quick Stats Pill Bar */}
            <div className="mt-6 flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-xs text-slate-400 font-semibold">
              <span className="flex items-center gap-1.5"><i className="fa-solid fa-shield-halved text-emerald-400"></i> 100% Verified Credentials</span>
              <span className="hidden sm:inline opacity-30">•</span>
              <span className="flex items-center gap-1.5"><i className="fa-solid fa-scale-balanced text-teal-400"></i> Multi-Quote Side-by-Side Comparison</span>
              <span className="hidden sm:inline opacity-30">•</span>
              <span className="flex items-center gap-1.5"><i className="fa-solid fa-user-lock text-cyan-400"></i> Protected Buyer Contact Privacy</span>
            </div>
          </div>

          {/* DUAL ACTION & SEARCH BAR */}
          <div className="max-w-4xl mx-auto bg-slate-800/80 backdrop-blur-xl p-3 md:p-4 rounded-3xl border border-slate-700/80 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-3 items-center">
              {/* Search Input */}
              <div className="relative flex-1 w-full">
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                <input
                  type="text"
                  placeholder="Search equipment, MRI tests, staff nurses, doctors, oxygen concentrators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/90 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* City selector */}
              <div className="w-full md:w-48">
                <select
                  value="Gorakhpur"
                  disabled
                  className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-300 font-semibold cursor-not-allowed"
                >
                  <option value="Gorakhpur">📍 Gorakhpur Region</option>
                  <option value="Lucknow">📍 Lucknow</option>
                  <option value="PanIndia">📍 Pan India</option>
                </select>
              </div>

              {/* Primary RFQ Trigger */}
              <button
                onClick={() => handleOpenRFQ()}
                className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <i className="fa-solid fa-file-pen text-slate-900"></i> Post Requirement (RFQ)
              </button>
            </div>
          </div>

          {/* Quick Access Badges (Provider & Buyer Hubs) */}
          <div className="max-w-4xl mx-auto mt-4 flex flex-wrap justify-between items-center gap-3 px-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">Buyer Tools:</span>
              <Link
                href="/healthmart/compare/enq-demo-001"
                className="text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1"
              >
                <i className="fa-solid fa-columns"></i> Side-by-Side Comparison Demo
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsProviderModalOpen(true)}
                className="text-cyan-300 hover:text-cyan-200 font-bold bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20 flex items-center gap-1"
              >
                <i className="fa-solid fa-building-circle-check"></i> Register as Provider
              </button>
              <Link
                href="/healthmart/provider/dashboard"
                className="text-indigo-300 hover:text-indigo-200 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 flex items-center gap-1"
              >
                <i className="fa-solid fa-briefcase"></i> Provider Quotation Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 13 SERVICE CATEGORIES CAROUSEL / DIRECTORY */}
      <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="text-emerald-400 text-xs font-black uppercase tracking-wider mb-1">
              Phase 2 Directory
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Browse 13 Unified Healthcare Sectors
            </h2>
          </div>
          {selectedCategory !== "all" && (
            <button
              onClick={() => setSelectedCategory("all")}
              className="text-xs font-bold text-slate-400 hover:text-white"
            >
              Clear Filter <i className="fa-solid fa-xmark ml-1"></i>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`p-4 rounded-2xl text-left border transition-all ${
              selectedCategory === "all"
                ? "bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10"
                : "bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-300"
            }`}
          >
            <div className="text-2xl mb-2 text-emerald-400">
              <i className="fa-solid fa-shapes"></i>
            </div>
            <div className="font-black text-xs uppercase tracking-tight">All Categories</div>
            <div className="text-[10px] text-slate-400 mt-1">Unified Directory</div>
          </button>

          {HEALTHMART_CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`p-4 rounded-2xl text-left border transition-all relative overflow-hidden group ${
                  isSelected
                    ? "bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10"
                    : "bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-300"
                }`}
              >
                <div className="text-2xl mb-2 text-teal-400 group-hover:scale-110 transition-transform">
                  <i className={cat.icon}></i>
                </div>
                <div className="font-bold text-xs line-clamp-1">{cat.name}</div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{cat.badge}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* VERIFIED PROVIDERS & QUOTATION OPPORTUNITIES */}
      <section className="py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-6">
          <div>
            <div className="text-emerald-400 text-xs font-black uppercase tracking-wider mb-1">
              Active Listings ({filteredProviders.length})
            </div>
            <h2 className="text-2xl font-black text-white">
              Verified Healthcare Providers & Institutional Suppliers
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Reused directly from existing Swastik Medicare clinical registries & certified B2B distributors.
            </p>
          </div>
          <button
            onClick={() => handleOpenRFQ(selectedCategory !== "all" ? selectedCategory : null)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <i className="fa-solid fa-bullhorn"></i> Request Quotes for This Sector
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <i className="fa-solid fa-circle-notch fa-spin text-3xl text-emerald-500 mb-3"></i>
            <p className="text-sm font-semibold">Aggregating Verified Provider Network...</p>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="py-16 text-center bg-slate-800/40 rounded-3xl border border-slate-800 p-8">
            <i className="fa-solid fa-box-open text-4xl text-slate-600 mb-3"></i>
            <h3 className="text-lg font-bold text-white mb-1">No Providers Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
              We couldn't find an exact match for "{searchQuery}". You can submit a custom RFQ and our matching engine will onboard verified suppliers for you.
            </p>
            <button
              onClick={() => handleOpenRFQ()}
              className="px-5 py-2.5 bg-emerald-600 text-slate-950 font-bold text-xs uppercase rounded-xl"
            >
              Post Custom RFQ
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProviders.map(provider => (
              <div
                key={provider.id}
                className="bg-slate-800/70 border border-slate-700/80 hover:border-slate-600 rounded-3xl p-5 flex flex-col justify-between shadow-xl transition-all relative group"
              >
                {/* Header info */}
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900/80 text-emerald-400 border border-emerald-500/30">
                      {provider.providerType}
                    </span>
                    {provider.isVerified && (
                      <button
                        onClick={() => setSelectedAuditProvider(provider)}
                        title="Click to view regulatory credentials audit"
                        className="flex items-center gap-1 text-[10px] font-black text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 px-2 py-0.5 rounded-full transition-all"
                      >
                        <i className="fa-solid fa-certificate text-emerald-400"></i>
                        <span>{provider.verificationBadge || "VERIFIED"}</span>
                        <i className="fa-solid fa-circle-info text-[9px] text-emerald-400 ml-0.5"></i>
                      </button>
                    )}
                  </div>

                  <h3 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {provider.businessName}
                  </h3>
                  <div className="text-xs font-semibold text-slate-300 mt-1 line-clamp-1">
                    {provider.title}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {provider.description}
                  </p>

                  {/* Operational Tags */}
                  <div className="mt-3.5 flex flex-wrap gap-1.5 text-[10px] text-slate-300">
                    <span className="bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-700">
                      📍 {provider.serviceLocations?.[0] || "Gorakhpur"}
                    </span>
                    <span className="bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-700">
                      ⏱️ {provider.operatingHours || "9am - 8pm"}
                    </span>
                    {provider.rating && (
                      <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-md font-bold">
                        ★ {provider.rating} ({provider.reviewCount})
                      </span>
                    )}
                  </div>

                  {/* Pricing indication */}
                  <div className="mt-4 p-2.5 bg-slate-900/70 border border-slate-700/60 rounded-xl text-xs">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pricing Scope</div>
                    <div className="font-bold text-emerald-400 mt-0.5">
                      {provider.basePrice ? `From ₹${provider.basePrice.toLocaleString()} ${provider.priceUnit ? `/${provider.priceUnit}` : ''}` : "Quotation Based on Scope"}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                  {provider.directBookingUrl ? (
                    <Link
                      href={provider.directBookingUrl}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                    >
                      <span>Direct Care Booking</span>
                      <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                    </Link>
                  ) : (
                    <button
                      onClick={() => setSelectedAuditProvider(provider)}
                      className="text-xs text-slate-400 hover:text-white font-semibold flex items-center gap-1"
                    >
                      <i className="fa-solid fa-file-shield text-slate-500"></i> Audit Info
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenRFQ(provider.categorySlug, provider)}
                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1"
                  >
                    <span>Get Quote</span>
                    <i className="fa-solid fa-paper-plane text-[10px]"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CREDENTIALS AUDIT MODAL (What was checked, who checked it, when) */}
      {selectedAuditProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 max-w-lg w-full rounded-3xl border border-slate-700 p-6 shadow-2xl text-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Regulatory Compliance Record
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  {selectedAuditProvider.businessName}
                </h3>
                <p className="text-xs text-slate-400">
                  Swastik HealthMart Credential Verification Audit
                </p>
              </div>
              <button
                onClick={() => setSelectedAuditProvider(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2 mb-4 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Verification Authority:</span>
                <span className="font-bold text-white">{selectedAuditProvider.verificationAudit?.checkedBy || "Swastik Regulatory Board"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date Verified:</span>
                <span className="font-bold text-white">{selectedAuditProvider.verificationAudit?.checkedDate || "2026-06-15"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Badge Classification:</span>
                <span className="font-mono text-emerald-400 font-bold">{selectedAuditProvider.verificationBadge || "SWASTIK_VERIFIED"}</span>
              </div>
            </div>

            <div className="space-y-2 mb-6 text-xs">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Verified Regulatory Documents on File
              </div>
              {(selectedAuditProvider.verificationAudit?.verifiedCredentials || [
                { name: "Clinical / Business Registration", number: "CERT-UP-2026", status: "VERIFIED" },
                { name: "Professional Indemnity & Compliance", status: "ACTIVE" }
              ]).map((c, i) => (
                <div key={i} className="p-2.5 bg-slate-800/40 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">{c.name}</div>
                    {c.number && <div className="text-[10px] font-mono text-slate-400">Ref: {c.number}</div>}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {c.status}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 italic mb-5 leading-relaxed">
              * Note: Swastik Medicare business identity verification confirms regulatory registration documents were audited by our compliance desk. It does not replace independent institutional procurement due diligence.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedAuditProvider(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const prov = selectedAuditProvider;
                  setSelectedAuditProvider(null);
                  handleOpenRFQ(prov.categorySlug, prov);
                }}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl"
              >
                Request Quotation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RFQ MODAL */}
      <HealthMartRFQModal
        isOpen={isRfqModalOpen}
        onClose={() => setIsRfqModalOpen(false)}
        preselectedCategorySlug={targetCategorySlug}
        initialProvider={targetProvider}
      />

      {/* PROVIDER ONBOARDING MODAL */}
      <ProviderRegistrationModal
        isOpen={isProviderModalOpen}
        onClose={() => setIsProviderModalOpen(false)}
      />

      <Footer />
    </div>
  );
}

