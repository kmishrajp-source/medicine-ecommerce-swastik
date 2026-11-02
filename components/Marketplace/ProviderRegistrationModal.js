"use client";
import { useState } from "react";
import { HEALTHMART_CATEGORIES } from "@/lib/healthmart/categories";

export default function ProviderRegistrationModal({ isOpen, onClose }) {
  const [providerType, setProviderType] = useState("SUPPLIER");
  const [categorySlug, setCategorySlug] = useState("medical-equipment-and-supplies");
  const [businessName, setBusinessName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Gorakhpur");
  const [servicesOffered, setServicesOffered] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-white max-w-xl w-full rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200 my-auto">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-6 text-white flex justify-between items-start">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-emerald-200">
              Grow Your Healthcare Business
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white mt-1">
              Join Swastik HealthMart as a Provider
            </h2>
            <p className="text-xs text-emerald-100 mt-1">
              Connect with institutional buyers, hospitals, doctors, and patients in Gorakhpur and across Eastern UP.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="p-6 text-slate-800">
          {success ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
                <i className="fa-solid fa-shield-check"></i>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-1">Application Received!</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto mb-5">
                Our verification desk will review your regulatory license credentials within 24 hours. Your listing will activate once verified.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Provider Type
                  </label>
                  <select
                    value={providerType}
                    onChange={(e) => setProviderType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="SUPPLIER">Medical Equipment / Consumables Supplier</option>
                    <option value="PHARMACY">Licensed Retail / Wholesale Pharmacy</option>
                    <option value="DOCTOR">Doctor / Specialist Clinic</option>
                    <option value="LAB">Diagnostic Lab / Imaging Center</option>
                    <option value="HOSPITAL">Hospital / Nursing Home</option>
                    <option value="AMBULANCE">Ambulance Operator</option>
                    <option value="STAFFING">Healthcare Staffing Bureau</option>
                    <option value="HEALTHCARE_IT">Healthcare IT / ABDM Software</option>
                    <option value="BUSINESS_SERVICES">Biomedical Waste / Specialized Services</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Primary Category
                  </label>
                  <select
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    {HEALTHMART_CATEGORIES.map(c => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Business / Clinical Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Purvanchal MedTech or Dr. Sharma Clinic"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Authorized Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="Name"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Phone / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Regulatory License / Reg. No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DL / MCI / CEA / CDSCO No."
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    City / Primary Base
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gorakhpur, Lucknow"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Products & Services Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="Outline your inventory, clinical specialties, brand authorizations, or service capabilities..."
                  value={servicesOffered}
                  onChange={(e) => setServicesOffered(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-600/20 disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Register Provider Profile"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

