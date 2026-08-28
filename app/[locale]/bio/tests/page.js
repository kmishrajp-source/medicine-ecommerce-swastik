"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function GeneticTestsDiscovery() {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLab, setSelectedLab] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({ name: "", phone: "", test: "" });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async (query = "") => {
    setLoading(true);
    try {
      const res = await fetch('/api/labs');
      const data = await res.json();
      if (data.success) {
        let filtered = data.labs;
        if (query) {
          const q = query.toLowerCase();
          filtered = data.labs.filter(lab =>
            lab.name?.toLowerCase().includes(q) ||
            lab.address?.toLowerCase().includes(q) ||
            lab.specialties?.toLowerCase().includes(q)
          );
        }
        setLabs(filtered);
      }
    } catch (error) {
      console.error("Failed to load labs", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLabs(searchQuery);
  };

  const openBooking = (lab) => {
    setSelectedLab(lab);
    setBookingSuccess(false);
    setBookingOpen(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/sln/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: "lab",
          serviceProviderId: selectedLab.id,
          customerName: bookingForm.name,
          customerPhone: bookingForm.phone,
          notes: `Test requested: ${bookingForm.test}`,
        }),
      });
      setBookingSuccess(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Navigation */}
        <div className="mb-8">
          <Link href="/bio" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
            <span className="mr-2">←</span> Back to Bio-Health Hub
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            🧪 Genetic & Molecular Test Labs
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find verified diagnostic laboratories offering genetic, molecular, and biomarker testing. Book a test directly.
            <span className="block mt-2 text-sm font-semibold text-rose-600">
              Note: Always consult a healthcare professional before booking a genetic test.
            </span>
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search by lab name, location, or specialty..."
              className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition">
              Search
            </button>
          </form>
        </div>

        {/* Quick Test Chips */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {["BRCA", "NGS", "Whole Exome", "Pharmacogenomics", "Diabetes Panel"].map(tag => (
            <span
              key={tag}
              onClick={() => { setSearchQuery(tag); fetchLabs(tag); }}
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-medium cursor-pointer hover:bg-blue-100 transition text-sm border border-blue-100"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : labs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg mb-4">No labs found matching your search.</p>
            <button onClick={() => fetchLabs("")} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
              Show All Labs
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {labs.map(lab => (
              <div key={lab.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl">
                      <i className="fa-solid fa-flask-vial"></i>
                    </div>
                    {lab.verified && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                        <i className="fa-solid fa-circle-check text-[10px]"></i> Verified
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{lab.name}</h3>
                  <p className="text-sm text-blue-600 font-semibold mb-3">{lab.specialties || "Diagnostic Center"}</p>
                  <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                    <p className="flex items-start gap-2"><i className="fa-solid fa-location-dot mt-0.5 text-gray-400"></i>{lab.address}</p>
                    {lab.phone && <p className="flex items-center gap-2"><i className="fa-solid fa-phone text-gray-400"></i>
                      <a href={`tel:${lab.phone}`} className="text-blue-600 hover:underline">{lab.phone}</a>
                    </p>}
                  </div>
                </div>
                <div className="p-6 pt-0 grid grid-cols-2 gap-3">
                  <a
                    href={`tel:${lab.phone}`}
                    className="text-center bg-slate-100 text-slate-800 font-bold py-2.5 rounded-lg hover:bg-slate-200 transition text-xs uppercase tracking-wider"
                  >
                    <i className="fa-solid fa-phone mr-1"></i> Call
                  </a>
                  <button
                    onClick={() => openBooking(lab)}
                    className="text-center bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition text-xs uppercase tracking-wider"
                  >
                    <i className="fa-solid fa-calendar-check mr-1"></i> Book Test
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingOpen && selectedLab && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setBookingOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8" onClick={e => e.stopPropagation()}>
            {bookingSuccess ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  <i className="fa-solid fa-circle-check"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Requested!</h3>
                <p className="text-gray-500 mb-6">The lab will contact you on the phone number you provided.</p>
                <button onClick={() => setBookingOpen(false)} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-xl hover:bg-blue-700 transition">Close</button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Book a Test</h3>
                <p className="text-sm text-blue-600 font-semibold mb-6">{selectedLab.name}</p>
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label>
                    <input required type="text" value={bookingForm.name} onChange={e => setBookingForm({ ...bookingForm, name: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                    <input required type="tel" value={bookingForm.phone} onChange={e => setBookingForm({ ...bookingForm, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Test Required</label>
                    <input type="text" value={bookingForm.test} onChange={e => setBookingForm({ ...bookingForm, test: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., BRCA1/2, Exome Sequencing..." />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setBookingOpen(false)} className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition">Cancel</button>
                    <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">Confirm Booking</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
