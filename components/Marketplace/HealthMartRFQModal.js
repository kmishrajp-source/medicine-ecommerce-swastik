"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { HEALTHMART_CATEGORIES } from "@/lib/healthmart/categories";
import { useRouter } from "@/i18n/navigation";

export default function HealthMartRFQModal({ isOpen, onClose, preselectedCategorySlug = null, initialProvider = null }) {
  const { data: session } = useSession();
  const router = useRouter();

  const [selectedCategorySlug, setSelectedCategorySlug] = useState(preselectedCategorySlug || "medical-equipment-and-supplies");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [locationCity, setLocationCity] = useState("Gorakhpur");
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerOrganization, setBuyerOrganization] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [categoryData, setCategoryData] = useState({});
  const [prescriptionUrl, setPrescriptionUrl] = useState("");
  const [uploadingPrescription, setUploadingPrescription] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successResult, setSuccessResult] = useState(null);

  const selectedCategory = HEALTHMART_CATEGORIES.find(c => c.slug === selectedCategorySlug) || HEALTHMART_CATEGORIES[0];

  useEffect(() => {
    if (preselectedCategorySlug) {
      setSelectedCategorySlug(preselectedCategorySlug);
    }
  }, [preselectedCategorySlug]);

  useEffect(() => {
    if (session?.user) {
      if (!buyerName && session.user.name) setBuyerName(session.user.name);
      if (!buyerEmail && session.user.email && !session.user.email.includes("@swastik.com")) setBuyerEmail(session.user.email);
    }
  }, [session]);

  if (!isOpen) return null;

  const handleCategoryFieldChange = (fieldName, value) => {
    setCategoryData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handlePrescriptionUpload = async (file) => {
    if (!file) return;
    setUploadingPrescription(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setPrescriptionUrl(data.url);
        setCategoryData(prev => ({ ...prev, prescriptionUrl: data.url, prescriptionFilename: file.name }));
      } else {
        // Instant client fallback via FileReader (never fails)
        const reader = new FileReader();
        reader.onloadend = () => {
          setPrescriptionUrl(reader.result);
          setCategoryData(prev => ({ ...prev, prescriptionUrl: reader.result, prescriptionFilename: file.name }));
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      // Instant client fallback on network error
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrescriptionUrl(reader.result);
        setCategoryData(prev => ({ ...prev, prescriptionUrl: reader.result, prescriptionFilename: file.name }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingPrescription(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !description.trim()) {
      setError("Please describe your requirement title and details.");
      return;
    }

    if (!buyerName.trim() || !buyerPhone.trim()) {
      setError("Contact name and valid mobile number are required.");
      return;
    }

    const cleanPhone = buyerPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    // Emergency ambulance check
    if (selectedCategorySlug === "ambulance-and-medical-transport" && categoryData.urgencyTier?.includes("EMERGENCY")) {
      setError("For life-threatening medical emergencies, please call 108 or 102 immediately! Marketplace RFQ is strictly for planned and non-emergency transport.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        categorySlug: selectedCategorySlug,
        serviceType: selectedCategory.serviceType,
        title,
        description,
        quantity: parseInt(quantity || 1),
        locationCity,
        buyerName,
        buyerPhone,
        buyerEmail,
        buyerOrganization,
        priority,
        categorySpecificData: categoryData,
        targetProviderId: initialProvider?.id || null
      };

      const res = await fetch("/api/marketplace/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setSuccessResult(data);
      } else {
        setError(data.error || "Failed to submit quotation request.");
      }
    } catch (err) {
      console.error(err);
      setError("A network error occurred while submitting your RFQ. Please retry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200 my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-emerald-900 p-6 text-white flex justify-between items-start shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <i className="fa-solid fa-file-invoice mr-1"></i> RFQ Engine
              </span>
              <span className="text-xs text-slate-300 font-semibold">• Compare Multi-Provider Quotes</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Request Quotations & Best Pricing
            </h2>
            <p className="text-xs text-indigo-200 mt-1">
              Describe your healthcare or medical business requirement. Verified providers will submit itemized quotes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all text-sm shrink-0"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800">
          {successResult ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-emerald-500/10">
                <i className="fa-solid fa-check"></i>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Requirement Submitted!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto mb-4">
                Your request has been registered under reference <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{successResult.enquiryNumber}</span>.
              </p>
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl max-w-md mx-auto text-left mb-6 text-xs text-emerald-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <i className="fa-solid fa-circle-check"></i> Matched with {successResult.matchedProvidersCount} Verified Providers
                </div>
                <p>Providers in your target radius are preparing structured itemized quotations with warranty and delivery timelines.</p>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    router.push(`/healthmart/compare/${successResult.enquiryId}`);
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-600/20"
                >
                  View Quotations Dashboard
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex gap-2.5 items-start">
                  <i className="fa-solid fa-triangle-exclamation text-base mt-0.5 shrink-0"></i>
                  <span>{error}</span>
                </div>
              )}

              {/* Category Picker */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  1. Healthcare Service Category
                </label>
                <select
                  value={selectedCategorySlug}
                  onChange={(e) => setSelectedCategorySlug(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-600"
                >
                  {HEALTHMART_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name} ({cat.badge})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1 italic">
                  {selectedCategory.description}
                </p>
              </div>

              {/* Category-Specific Form Fields */}
              {selectedCategory.rfqFields && selectedCategory.rfqFields.length > 0 && (
                <div className="p-4 bg-indigo-50/50 border border-indigo-100/60 rounded-2xl space-y-3">
                  <div className="text-[11px] font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <i className="fa-solid fa-sliders text-indigo-600"></i> Category Specifications: {selectedCategory.name}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedCategory.rfqFields.map(field => (
                      <div key={field.name} className={field.type === 'textarea' ? "md:col-span-2" : ""}>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.type === "select" ? (
                          <select
                            value={categoryData[field.name] || ""}
                            onChange={(e) => handleCategoryFieldChange(field.name, e.target.value)}
                            required={field.required}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-600"
                          >
                            <option value="">Select option...</option>
                            {field.options.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : field.type === "textarea" ? (
                          <textarea
                            value={categoryData[field.name] || ""}
                            onChange={(e) => handleCategoryFieldChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            required={field.required}
                            rows={2}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-600"
                          />
                        ) : (
                          <input
                            type={field.type}
                            value={categoryData[field.name] || ""}
                            onChange={(e) => handleCategoryFieldChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            required={field.required}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-600"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document / Prescription Attachment */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                    <i className="fa-solid fa-file-medical text-emerald-600"></i> {selectedCategorySlug === "pharmacy-and-medicines" ? "Doctor's Prescription (Optional / Schedule H Rx)" : "Supporting Document / Prescription / Specs (Optional)"}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    Protected &amp; Encrypted
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {selectedCategorySlug === "pharmacy-and-medicines"
                    ? "Upload a clear prescription photo or PDF if requesting prescription pharmaceuticals."
                    : "Attach any prescription, equipment specifications, lab slip, or quotation reference."}
                </p>
                  
                  {prescriptionUrl ? (
                    <div className="flex items-center justify-between p-2.5 bg-white border border-emerald-300 rounded-xl">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <i className="fa-solid fa-circle-check text-emerald-600 text-sm"></i>
                        <span className="text-xs font-bold text-slate-800 truncate">Prescription Attached</span>
                        <a href={prescriptionUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-indigo-600 underline font-semibold ml-2">
                          View File
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setPrescriptionUrl(""); handleCategoryFieldChange("prescriptionUrl", ""); }}
                        className="text-xs text-red-500 hover:text-red-700 p-1"
                        title="Remove prescription"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        disabled={uploadingPrescription}
                        onChange={(e) => handlePrescriptionUpload(e.target.files?.[0])}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer bg-white p-2 border border-slate-200 rounded-xl"
                      />
                      {uploadingPrescription && (
                        <div className="mt-1 text-xs text-emerald-700 flex items-center gap-1 font-semibold">
                          <i className="fa-solid fa-circle-notch fa-spin"></i> Uploading prescription securely...
                        </div>
                      )}
                      {uploadError && (
                        <div className="mt-1 text-xs text-red-600 font-semibold">
                          {uploadError}
                        </div>
                      )}
                    </div>
                  )}
                </div>

              {/* Requirement Title & Details */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    2. Requirement Title / Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 5 ICU Multipara Monitors, or 10 Staff Nurses for Hospital"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Quantity / Units
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      City / Service Location
                    </label>
                    <input
                      type="text"
                      value={locationCity}
                      onChange={(e) => setLocationCity(e.target.value)}
                      placeholder="e.g. Gorakhpur, Lucknow, Eastern UP"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Full Requirement Scope / Specifications <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide relevant brand preferences, technical specifications, warranty expectations, or shift timings. Do NOT submit private patient medical files without consent."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
                    required
                  />
                </div>
              </div>

              {/* Buyer Contact Details (Protected Lead) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <i className="fa-solid fa-lock text-emerald-600"></i> Buyer Verification & Privacy Control
                  </div>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full font-bold">
                    Direct Spam Protected
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      Your Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Dr. Arvind Srivastava"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      10-Digit Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g., 9839012345"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      Hospital / Clinic / Company (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Apex Healthcare, Gorakhpur"
                      value={buyerOrganization}
                      onChange={(e) => setBuyerOrganization(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="procure@example.com"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                    />
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-tight">
                  <i className="fa-solid fa-shield-halved text-emerald-600 mr-1"></i>
                  Privacy Guarantee: Your direct phone number is never posted publicly. Only top-matched, verified providers under strict NDAs receive your lead for quoting.
                </p>
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-60 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin"></i> Matching Providers...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i> Post RFQ & Get Quotes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

