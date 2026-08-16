"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function AdminRiderReferralsPage() {
    const { data: session } = useSession();
    const [data, setData] = useState({ referrals: [], leaderboard: [], fraudSummary: { openFlags: 0, highSeverity: 0, flagsByType: [] } });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/admin/rider-referrals");
            if (res.ok) setData(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (session?.user?.role === "ADMIN") fetchData();
    }, [session]);

    const handleAction = async (referralId, action) => {
        if (action === "FLAG_FRAUD" && !confirm("Flag this referral as fraud and cancel reward?")) return;
        if (action === "MARK_PAID" && !confirm("Mark reward as paid via bank transfer?")) return;
        
        setActionLoading(true);
        try {
            const res = await fetch("/api/admin/rider-referrals", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ referralId, action })
            });
            if (res.ok) await fetchData();
            else alert((await res.json()).error || "Action failed");
        } finally { setActionLoading(false); }
    };

    if (!session || session.user.role !== "ADMIN") return <div>Unauthorized</div>;

    const { referrals, leaderboard, fraudSummary } = data;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
            <h1 className="text-3xl font-bold text-purple-400 mb-8">Referrals & Fraud Queue</h1>

            <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Pending Rewards */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-gray-400 font-bold mb-2 uppercase text-sm">Rewards Pending Payment</h2>
                    <div className="text-3xl font-bold text-green-400">
                        ₹{referrals.filter(r => r.status === "QUALIFIED").reduce((acc, r) => acc + r.rewardAmount, 0)}
                    </div>
                </div>

                {/* Fraud Summary */}
                <div className="bg-red-900/20 p-6 rounded-xl border border-red-900/50">
                    <h2 className="text-red-400 font-bold mb-2 uppercase text-sm">Open Fraud Flags</h2>
                    <div className="text-3xl font-bold text-red-500">{fraudSummary.openFlags}</div>
                    {fraudSummary.highSeverity > 0 && <div className="text-sm text-red-400 mt-1">⚠️ {fraudSummary.highSeverity} High Severity</div>}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2">
                    <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Referral Pipeline</h2>
                    <div className="space-y-4">
                        {referrals.map(r => (
                            <div key={r.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="font-bold">{r.application?.name || "Unknown"}</div>
                                        <span className="text-xs bg-gray-700 px-2 rounded">Referred by {r.referrerType} {r.referrerId.slice(0, 8)}</span>
                                    </div>
                                    <div className="text-sm text-gray-400">{r.application?.phone} • Code: {r.referralCode}</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 uppercase">Status</div>
                                        <div className={`font-bold ${r.status === "QUALIFIED" ? "text-yellow-400" : r.status === "REWARD_PAID" ? "text-green-400" : "text-gray-300"}`}>{r.status}</div>
                                    </div>
                                    {r.status === "QUALIFIED" && (
                                        <div className="flex gap-2">
                                            <button onClick={() => handleAction(r.id, "MARK_PAID")} disabled={actionLoading} className="px-3 py-1 bg-green-600 rounded text-sm font-bold">Mark Paid (₹{r.rewardAmount})</button>
                                            <button onClick={() => handleAction(r.id, "FLAG_FRAUD")} disabled={actionLoading} className="px-3 py-1 bg-red-600 rounded text-sm font-bold">Flag Fraud</button>
                                        </div>
                                    )}
                                    {r.fraudFlag && <div className="text-red-400 font-bold bg-red-400/10 px-2 py-1 rounded">⚠️ Fraud Flagged</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Top Referrers</h2>
                    <div className="space-y-2">
                        {leaderboard.map((l, i) => (
                            <div key={i} className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <div className="text-sm font-bold">{l.referrerType}</div>
                                    <div className="text-xs text-gray-400">{l.referrerId.slice(0, 10)}...</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-green-400">{l.active} Active</div>
                                    <div className="text-xs text-gray-500">{l.total} Total Invites</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
