"use client";
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

const healthEvents = [
  {
    id: 1,
    date: '10 Aug 2026',
    type: 'PRESCRIPTION',
    title: 'Cardiology Consultation',
    doctor: 'Dr. Vivek Sharma',
    hospital: 'AIMS Hospital',
    icon: 'fa-file-prescription',
    color: 'bg-blue-500',
    tags: ['E-Prescription', 'ABDM Verified'],
    details: 'Prescribed Rosuvastatin 10mg and Telmisartan 40mg. Follow up in 30 days.'
  },
  {
    id: 2,
    date: '02 Aug 2026',
    type: 'LAB_REPORT',
    title: 'Comprehensive Lipid Profile',
    doctor: 'Self Booked',
    hospital: 'Swastik Diagnostics',
    icon: 'fa-flask',
    color: 'bg-purple-500',
    tags: ['Abnormal Results', 'Digital Report'],
    details: 'Total Cholesterol: 240 mg/dL (High). LDL: 160 mg/dL (High).'
  },
  {
    id: 3,
    date: '15 Jan 2026',
    type: 'VACCINE',
    title: 'COVID-19 Booster',
    doctor: 'Govt. Dispensary',
    hospital: 'Gorakhpur Health Center',
    icon: 'fa-syringe',
    color: 'bg-emerald-500',
    tags: ['Immunization'],
    details: 'Administered Covishield Booster Dose.'
  },
  {
    id: 4,
    date: '12 Nov 2025',
    type: 'CONSULTATION',
    title: 'Telemedicine Session',
    doctor: 'Dr. Anjali Verma',
    hospital: 'Swastik Telehealth',
    icon: 'fa-video',
    color: 'bg-indigo-500',
    tags: ['General Physician'],
    details: 'Consultation for viral fever and throat infection. Prescribed Paracetamol 500mg.'
  }
];

export default function TimelineClient() {
  const { cartCount, toggleCart } = useCart();

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
      
      <main className="flex-1" style={{ marginTop: '160px' }}>
        
        {/* HEADER */}
        <div className="bg-white border-b border-slate-200">
          <div className="container mx-auto px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-2xl border-4 border-white shadow-sm">
                <i className="fa-solid fa-user" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 mb-1">Rohan Sharma</h1>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md"><i className="fa-solid fa-check-circle" /> ABHA Linked</span>
                  <span>Male, 45 yrs</span>
                  <span>Blood Group: O+</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/my-health-records/prescriptions" className="px-5 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 shadow-sm transition-all">
                <i className="fa-solid fa-file-pdf mr-2 text-red-500" /> Prescriptions
              </Link>
              <button className="px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/30 transition-all">
                <i className="fa-solid fa-plus mr-2" /> Upload Record
              </button>
            </div>
          </div>
        </div>

        {/* TIMELINE */}
        <div className="container mx-auto px-8 py-12 max-w-4xl">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Longitudinal Health Record</h2>
            <select className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 shadow-sm">
              <option>All Records</option>
              <option>Prescriptions</option>
              <option>Lab Reports</option>
              <option>Vaccinations</option>
            </select>
          </div>

          <div className="relative border-l-2 border-slate-200 ml-4 md:ml-8">
            {healthEvents.map((event) => (
              <div key={event.id} className="mb-12 last:mb-0 relative pl-8 md:pl-12 group">
                
                {/* Timeline Dot */}
                <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full border-4 border-slate-50 ${event.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                  <i className={`fa-solid ${event.icon} text-[10px]`} />
                </div>

                {/* Event Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${event.color}`} />
                  
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{event.date}</div>
                      <h3 className="text-lg font-black text-slate-900 mb-1">{event.title}</h3>
                      <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                        <i className="fa-solid fa-user-doctor text-slate-400" /> {event.doctor} 
                        <span className="text-slate-300">•</span> 
                        <i className="fa-solid fa-hospital text-slate-400" /> {event.hospital}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, i) => (
                        <span key={i} className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${tag.includes('Abnormal') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 border border-slate-100 mb-4">
                    {event.details}
                  </div>

                  <div className="flex items-center gap-4">
                    <button className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors">
                      <i className="fa-solid fa-eye mr-1" /> View Document
                    </button>
                    <button className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
                      <i className="fa-solid fa-share-nodes mr-1" /> Share
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
             <button className="px-6 py-3 bg-white border border-slate-200 rounded-full text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 shadow-sm transition-all">
                Load Older Records
             </button>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
