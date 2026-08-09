"use client";
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

const prescriptions = [
  {
    id: 'RX-8930',
    date: '10 Aug 2026',
    doctor: 'Dr. Vivek Sharma',
    hospital: 'AIMS Hospital',
    status: 'ACTIVE',
    medicines: [
      { name: 'Rosuvastatin 10mg', dosage: '1-0-0', duration: '30 Days' },
      { name: 'Telmisartan 40mg', dosage: '1-0-1', duration: '30 Days' }
    ]
  },
  {
    id: 'RX-8812',
    date: '15 Jul 2026',
    doctor: 'Dr. Anjali Verma',
    hospital: 'Swastik Telehealth',
    status: 'EXPIRED',
    medicines: [
      { name: 'Paracetamol 500mg', dosage: '1-1-1 (SOS)', duration: '5 Days' },
      { name: 'Azithromycin 500mg', dosage: '1-0-0', duration: '3 Days' },
      { name: 'Cetirizine 10mg', dosage: '0-0-1', duration: '5 Days' }
    ]
  },
  {
    id: 'RX-7421',
    date: '02 Mar 2026',
    doctor: 'Dr. Rajiv Singh',
    hospital: 'City Clinic',
    status: 'EXPIRED',
    medicines: [
      { name: 'Pantoprazole 40mg', dosage: '1-0-0 (Empty Stomach)', duration: '14 Days' },
      { name: 'Domperidone 30mg', dosage: '1-0-0', duration: '14 Days' }
    ]
  }
];

export default function PrescriptionsClient() {
  const { cartCount, toggleCart } = useCart();

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
      
      <main className="flex-1" style={{ marginTop: '160px' }}>
        
        {/* HEADER */}
        <div className="bg-slate-900 py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.3)_0%,_transparent_70%)]" />
          <div className="container mx-auto px-8 relative z-10 text-center">
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
              Digital <span className="text-blue-400">Prescriptions</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base font-medium max-w-2xl mx-auto">
              View, download, and re-order medicines directly from your ABDM-verified digital prescriptions.
            </p>
          </div>
        </div>

        {/* PRESCRIPTION GRID */}
        <div className="container mx-auto px-8 py-16 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Upload Card */}
            <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-100 transition-colors min-h-[350px]">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl mb-4">
                <i className="fa-solid fa-cloud-arrow-up" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Upload Physical Prescription</h3>
              <p className="text-sm text-slate-500 mb-6">Our AI will automatically scan and digitize your handwritten prescriptions.</p>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/30">
                Browse Files
              </button>
            </div>

            {prescriptions.map((rx) => (
              <div key={rx.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col">
                <div className="p-6 border-b border-slate-100 flex items-start justify-between">
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{rx.date} • {rx.id}</div>
                    <h3 className="text-base font-black text-slate-900 leading-tight mb-1">{rx.doctor}</h3>
                    <div className="text-xs font-bold text-slate-500"><i className="fa-solid fa-hospital text-slate-400 mr-1" /> {rx.hospital}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${rx.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                    {rx.status}
                  </span>
                </div>
                
                <div className="p-6 flex-1 bg-slate-50/50">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Prescribed Medicines</h4>
                  <ul className="space-y-3">
                    {rx.medicines.map((med, i) => (
                      <li key={i} className="flex justify-between items-center text-sm">
                        <div>
                          <div className="font-bold text-slate-800">{med.name}</div>
                          <div className="text-[10px] font-bold text-slate-500">{med.dosage}</div>
                        </div>
                        <div className="text-xs font-black text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">{med.duration}</div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 border-t border-slate-100 flex gap-2">
                  <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors">
                    <i className="fa-solid fa-download mr-1" /> PDF
                  </button>
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-blue-500/30">
                    <i className="fa-solid fa-cart-plus mr-1" /> Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
