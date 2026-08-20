import prisma from "@/lib/prisma";

export default async function VoiceOrdersDashboard() {
  const voiceOrders = await prisma.voiceOrderIntent.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, phone: true } },
      prescription: true,
      retailer: { select: { name: true, phone: true } },
      order: true,
      inventoryResponses: true
    },
    take: 50
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Speak-to-Buy AI Intelligence</h1>
        <p className="text-slate-500">Real-time audit log and state machine tracker for all voice-initiated medicine orders.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Timeline</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Raw Transcript</th>
                <th className="px-6 py-4">AI Extraction</th>
                <th className="px-6 py-4">Current State</th>
                <th className="px-6 py-4">Retailer Check</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {voiceOrders.map((intent) => (
                <tr key={intent.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{new Date(intent.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs text-slate-500">{new Date(intent.createdAt).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-indigo-600">
                    {intent.user?.name || "Unknown"}
                    <div className="text-xs text-slate-400 font-normal">{intent.user?.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-[200px] text-xs bg-slate-100 p-2 rounded-lg italic">
                      "{intent.rawTranscript}"
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-800">{intent.medicineName || "N/A"}</span>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded w-max">
                        {intent.strength || "-"} x {intent.quantity || 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                      intent.state === 'INITIATED' ? 'bg-amber-100 text-amber-700' :
                      intent.state === 'RX_CHECK' ? 'bg-rose-100 text-rose-700' :
                      intent.state === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
                      intent.state === 'CANCELLED' ? 'bg-slate-200 text-slate-700' :
                      'bg-indigo-100 text-indigo-700'
                    }`}>
                      {intent.state}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {intent.retailer ? (
                      <div>
                        <div className="font-bold text-slate-900">{intent.retailer.name}</div>
                        <div className="text-xs text-slate-500">{intent.inventoryResponses?.length || 0} pings sent</div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-xs">Waiting for discovery...</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-indigo-600 hover:text-indigo-900 font-bold text-xs uppercase tracking-widest">
                      View Audit Log
                    </button>
                  </td>
                </tr>
              ))}
              {voiceOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500 font-semibold">
                    <i className="fa-solid fa-microphone-lines text-4xl text-slate-300 mb-4 block"></i>
                    No voice orders processed yet. Try asking the Voice AI for a medicine.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
