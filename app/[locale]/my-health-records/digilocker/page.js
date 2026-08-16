import Link from 'next/link';

export const metadata = {
  title: 'DigiLocker Integration | Swastik Medicare',
  description: 'Connect your DigiLocker account to seamlessly import health records and vaccination certificates.',
};

export default function DigiLockerPage({ searchParams }) {
  const status = searchParams.status;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/en/my-health-records" className="text-sm font-bold text-slate-500 hover:text-emerald-600 mb-4 inline-block">
            <i className="fa-solid fa-arrow-left mr-2"></i> Back to Health Records
          </Link>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
              <img src="https://upload.wikimedia.org/wikipedia/commons/d/d4/DigiLocker_Logo.png" alt="DigiLocker" className="w-8" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">DigiLocker Integration</h1>
          </div>
          <p className="text-slate-500">Securely import your official health documents, IDs, and vaccination certificates directly from the Government of India's DigiLocker platform.</p>
        </div>

        {/* Integration Status Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                <i className="fa-solid fa-lock-clock text-xl"></i>
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest mb-3">
                  <i className="fa-solid fa-circle-notch fa-spin"></i> Coming Soon
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Awaiting API Credentials</h2>
                <p className="text-slate-600 mb-6 text-sm">
                  The integration architecture is complete, but we are currently waiting for official API access approval from the National e-Governance Division (NeGD) to activate the live connection.
                </p>

                {status === 'pending_credentials' && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium mb-6">
                    <i className="fa-solid fa-triangle-exclamation mr-2"></i> 
                    Connection attempt failed: Live API credentials are not yet configured.
                  </div>
                )}

                <button 
                  disabled
                  className="bg-slate-100 text-slate-400 font-bold px-6 py-3 rounded-xl cursor-not-allowed flex items-center gap-2"
                >
                  <i className="fa-brands fa-digital-ocean"></i> Connect DigiLocker
                </button>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 p-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-4">What you'll be able to do:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-slate-600">
                <i className="fa-solid fa-check text-emerald-500 mt-0.5"></i>
                <span>Import your COVID-19 Vaccination Certificates</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600">
                <i className="fa-solid fa-check text-emerald-500 mt-0.5"></i>
                <span>Verify your identity using Aadhaar instantly</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600">
                <i className="fa-solid fa-check text-emerald-500 mt-0.5"></i>
                <span>Link ABHA records automatically</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
