"use client";
import Link from 'next/link';

// Simple mock data for enterprise CMS demo
const applications = [
  { id: '101', name: 'Swastik Medicare Corporate', type: 'ISO 27001', status: 'In Audit', date: '01 Aug 2026' },
  { id: '102', name: 'AIMS Hospital', type: 'Partner Onboarding', status: 'Pending Review', date: '04 Aug 2026' },
  { id: '103', name: 'City Diagnostic Labs', type: 'NABL Verification', status: 'Approved', date: '07 Aug 2026' },
];

export default function EnterpriseAdminPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar (Mock) */}
      <div className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <div className="text-xl font-black text-emerald-400 uppercase tracking-tighter">Swastik<br />Enterprise</div>
        </div>
        <div className="p-4 space-y-2 flex-1">
          <Link href="/admin/enterprise" className="block px-4 py-3 bg-indigo-600 rounded-xl font-bold text-sm">Dashboard</Link>
          <div className="block px-4 py-3 text-slate-400 hover:text-white cursor-not-allowed font-bold text-sm">Partner Approvals</div>
          <div className="block px-4 py-3 text-slate-400 hover:text-white cursor-not-allowed font-bold text-sm">Compliance Tracker</div>
          <div className="block px-4 py-3 text-slate-400 hover:text-white cursor-not-allowed font-bold text-sm">Media Center Uploads</div>
        </div>
        <div className="p-6">
          <Link href="/" className="block text-center px-4 py-2 border border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-800">Back to Website</Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-black text-slate-900">Enterprise CMS & Compliance Tracker</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-slate-500">Super Admin</span>
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black">SA</div>
          </div>
        </header>

        <main className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Partners</div>
              <div className="text-3xl font-black text-slate-900">184</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Approvals</div>
              <div className="text-3xl font-black text-slate-900">12</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-indigo-500">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Compliance Score</div>
              <div className="text-3xl font-black text-slate-900">92%</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">Recent Applications & Audits</h2>
              <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400">
                    <th className="px-6 py-4 font-black">ID</th>
                    <th className="px-6 py-4 font-black">Name</th>
                    <th className="px-6 py-4 font-black">Type</th>
                    <th className="px-6 py-4 font-black">Date</th>
                    <th className="px-6 py-4 font-black">Status</th>
                    <th className="px-6 py-4 font-black text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {applications.map(app => (
                    <tr key={app.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-slate-500">#{app.id}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{app.name}</td>
                      <td className="px-6 py-4 text-slate-600">{app.type}</td>
                      <td className="px-6 py-4 text-slate-500">{app.date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${app.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : app.status === 'Pending Review' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-indigo-600 font-bold hover:underline">Review</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
