"use client";
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

const familyMembers = [
  {
    id: 1,
    name: 'Suman Sharma',
    relation: 'Mother',
    age: 68,
    bloodGroup: 'O+',
    abhaLinked: true,
    chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
    recentActivity: 'Prescription Refilled (2 days ago)'
  },
  {
    id: 2,
    name: 'Aarav Sharma',
    relation: 'Son',
    age: 12,
    bloodGroup: 'B+',
    abhaLinked: false,
    chronicConditions: ['Asthma'],
    recentActivity: 'Vaccination Due (Next Week)'
  }
];

export default function FamilyClient() {
  const { cartCount, toggleCart } = useCart();

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
      
      <main className="flex-1" style={{ marginTop: '160px' }}>
        
        {/* HEADER */}
        <div className="bg-white border-b border-slate-200">
          <div className="container mx-auto px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <i className="fa-solid fa-users" /> My Account
              </div>
              <h1 className="text-3xl font-black text-slate-900 mb-2">Family Health Profiles</h1>
              <p className="text-slate-500 text-sm font-medium">
                Manage your dependents, track their chronic conditions, and access their health records securely.
              </p>
            </div>
            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/30 transition-all flex-shrink-0">
              <i className="fa-solid fa-plus mr-2" /> Add Family Member
            </button>
          </div>
        </div>

        {/* FAMILY GRID */}
        <div className="container mx-auto px-8 py-12 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {familyMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform" />
                
                <div className="p-8 relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-2xl border-4 border-white shadow-sm overflow-hidden">
                        <img src={`https://ui-avatars.com/api/?name=${member.name.replace(' ', '+')}&background=random&color=fff`} alt={member.name} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900">{member.name}</h2>
                        <div className="text-xs font-bold text-slate-500">{member.relation} • {member.age} yrs • Blood: {member.bloodGroup}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 flex items-center justify-between bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                    <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
                      <i className="fa-solid fa-id-card text-slate-400" /> ABHA Link Status
                    </div>
                    {member.abhaLinked ? (
                      <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-1 rounded flex items-center gap-1">
                        <i className="fa-solid fa-check" /> Linked
                      </span>
                    ) : (
                      <button className="text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 hover:bg-amber-200 px-2 py-1 rounded transition-colors flex items-center gap-1">
                        Link Now
                      </button>
                    )}
                  </div>

                  <div className="mb-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Chronic Conditions / Alerts</h3>
                    <div className="flex flex-wrap gap-2">
                      {member.chronicConditions.map((condition, idx) => (
                        <span key={idx} className="bg-red-50 border border-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                          <i className="fa-solid fa-triangle-exclamation" /> {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-sm font-bold text-slate-600 flex items-center gap-2 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                    <i className="fa-regular fa-clock text-indigo-400" /> {member.recentActivity}
                  </div>
                </div>

                <div className="border-t border-slate-100 flex relative z-10 bg-slate-50">
                  <button className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors border-r border-slate-200">
                    View Records
                  </button>
                  <button className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors">
                    Book Doctor
                  </button>
                </div>
              </div>
            ))}

            {/* Add Member Placeholder */}
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-all min-h-[350px]">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 text-2xl shadow-sm mb-4">
                <i className="fa-solid fa-user-plus" />
              </div>
              <h3 className="text-lg font-black text-slate-700 mb-2">Add Dependent</h3>
              <p className="text-sm text-slate-500 font-medium max-w-xs">Easily manage health records for your children, spouse, or parents.</p>
            </div>

          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
