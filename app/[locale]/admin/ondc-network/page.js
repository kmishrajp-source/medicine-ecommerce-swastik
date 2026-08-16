import Link from 'next/link';

export const metadata = {
  title: 'ONDC Network Status | Swastik Admin',
};

export default function OndcAdminPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">ONDC Network Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage Swastik Medicare's integration with the Open Network for Digital Commerce.</p>
        </div>
        <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2">
          <i className="fa-solid fa-tower-broadcast fa-fade"></i> Network Status: Offline
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Status Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shrink-0">
                  <img src="https://ondc.org/assets/theme/images/ondc_registered_logo.svg" alt="ONDC" className="w-10" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Integration Ready</h2>
                  <p className="text-slate-600 mb-6 text-sm">
                    The Swastik ONDC Provider Platform (BPP) architecture is successfully built. We are currently pending official onboarding approval and production keys from the ONDC Network.
                  </p>
                  
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 mb-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Gateway Endpoints Configured</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">Domain</span>
                        <span className="text-slate-900 font-mono text-xs bg-white px-2 py-1 rounded border border-slate-200">ONDC:RET11 (Health & Wellness)</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">BPP Search Webhook</span>
                        <span className="text-emerald-600 font-mono text-xs bg-emerald-50 px-2 py-1 rounded border border-emerald-100">/api/ondc/search</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">Crypto Signatures</span>
                        <span className="text-amber-600 font-mono text-xs bg-amber-50 px-2 py-1 rounded border border-amber-100">Pending Keys</span>
                      </div>
                    </div>
                  </div>

                  <button disabled className="bg-slate-900 text-white opacity-50 cursor-not-allowed font-bold px-6 py-3 rounded-xl flex items-center gap-2">
                    Activate Network Broadcasting <i className="fa-solid fa-lock"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements List */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Onboarding Checklist</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <i className="fa-solid fa-circle-check text-emerald-500 mt-1"></i>
                <span className="text-sm text-slate-600">Map Medicine Catalog to ONDC taxonomy</span>
              </li>
              <li className="flex gap-3">
                <i className="fa-solid fa-circle-check text-emerald-500 mt-1"></i>
                <span className="text-sm text-slate-600">Implement Beckn Search Protocol</span>
              </li>
              <li className="flex gap-3">
                <i className="fa-solid fa-spinner fa-spin text-amber-500 mt-1"></i>
                <span className="text-sm text-slate-600">Acquire ED25519 Cryptographic Keys</span>
              </li>
              <li className="flex gap-3">
                <i className="fa-regular fa-circle text-slate-300 mt-1"></i>
                <span className="text-sm text-slate-600">Complete Network Participant Agreement</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
