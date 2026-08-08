"use client";
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

const downloadCategories = [
  {
    id: 'corporate',
    title: 'Corporate Profiles',
    icon: 'fa-building',
    files: [
      { name: 'Swastik Medicare Corporate Overview', size: '2.4 MB', type: 'PDF' },
      { name: 'AI Healthcare Platform Architecture', size: '1.8 MB', type: 'PDF' },
      { name: 'Franchise Model Deck', size: '3.1 MB', type: 'PDF' }
    ]
  },
  {
    id: 'investor',
    title: 'Investor Relations',
    icon: 'fa-chart-pie',
    files: [
      { name: '2026 Pitch Deck (Seed Round)', size: '4.5 MB', type: 'PDF' },
      { name: 'Market Sizing & Opportunity Analysis', size: '1.2 MB', type: 'PDF' },
      { name: 'Financial Projections (2026-2029)', size: '800 KB', type: 'XLSX' }
    ]
  },
  {
    id: 'compliance',
    title: 'Certificates & Compliance',
    icon: 'fa-certificate',
    files: [
      { name: 'ISO 27001 Roadmap & Readiness', size: '1.1 MB', type: 'PDF' },
      { name: 'Patient Data Privacy Policy Framework', size: '500 KB', type: 'PDF' },
      { name: 'ABDM Integration Certificate', size: 'Pending', type: 'PDF' }
    ]
  },
  {
    id: 'media',
    title: 'Media Kit',
    icon: 'fa-camera',
    files: [
      { name: 'Brand Logos (SVG & PNG)', size: '5.2 MB', type: 'ZIP' },
      { name: 'Executive Team Headshots', size: '12 MB', type: 'ZIP' },
      { name: 'Platform UI Screenshots', size: '18 MB', type: 'ZIP' }
    ]
  }
];

export default function DownloadsClient() {
  const { cartCount, toggleCart } = useCart();

  const handleDownload = (e, fileName) => {
    e.preventDefault();
    // Simulate a download action or alert since actual files aren't uploaded yet
    alert(`Downloading ${fileName}... (Placeholder)`);
  };

  return (
    <>
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
      <main style={{ marginTop: '160px' }}>

        {/* HERO */}
        <div className="relative bg-slate-900 py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.15)_0%,_transparent_60%)] pointer-events-none" />
          <div className="container mx-auto px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8">
              <i className="fa-solid fa-cloud-arrow-down" /> Resource Library
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-6">
              Download <br /><span className="text-blue-400">Center</span>
            </h1>
            <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto">
              Access official corporate profiles, investor decks, compliance certificates, and media resources.
            </p>
          </div>
        </div>

        {/* DOWNLOAD LISTS */}
        <div className="container mx-auto px-8 py-20 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {downloadCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 hover:shadow-xl transition-all">
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl">
                    <i className={`fa-solid ${category.icon}`} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{category.title}</h2>
                </div>

                <div className="space-y-4">
                  {category.files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <i className={`fa-solid ${file.type === 'PDF' ? 'fa-file-pdf text-red-500' : file.type === 'ZIP' ? 'fa-file-zipper text-amber-500' : 'fa-file-excel text-emerald-500'} text-lg`} />
                        <div>
                          <h3 className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{file.name}</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{file.size} • {file.type}</p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => handleDownload(e, file.name)}
                        disabled={file.size === 'Pending'}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${file.size === 'Pending' ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-50 text-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-600/30'}`}
                      >
                        <i className="fa-solid fa-download" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
