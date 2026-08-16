"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function AdminRiderDetailPage() {
    const { id } = useParams();
    const { data: session } = useSession();
    const [rider, setRider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchRider = async () => {
        try {
            const res = await fetch(`/api/admin/riders/${id}`);
            if (res.ok) setRider((await res.json()).rider);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (session?.user?.role === "ADMIN") fetchRider();
    }, [id, session]);

    const handleAction = async (action, docId = null, extraData = {}) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/riders/${id}/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, docId, ...extraData })
            });
            if (res.ok) await fetchRider();
            else alert("Action failed.");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading rider profile...</div>;
    if (!rider) return <div className="p-8 text-white">Rider not found</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
            <Link href="/en/admin/riders" className="text-green-500 hover:underline mb-4 inline-block">← Back to Directory</Link>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{rider.name || "Unnamed Rider"}</h1>
                    <div className="text-gray-400">{rider.phone} • {rider.city} • Joined {new Date(rider.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-2">
                    {rider.onboardingStatus !== "Active" && rider.onboardingStatus !== "Suspended" && (
                        <button onClick={() => handleAction("PROMOTE")} disabled={actionLoading} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition">
                            Promote to Next Stage
                        </button>
                    )}
                    {rider.onboardingStatus !== "Suspended" && (
                        <button onClick={() => handleAction("SUSPEND")} disabled={actionLoading} className="px-4 py-2 bg-red-900/50 hover:bg-red-900 border border-red-800 text-red-400 font-bold rounded-lg transition">
                            Suspend Rider
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                    {/* Performance */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-lg font-bold mb-4">Performance Metrics</h2>
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { label: "Deliveries", val: rider.totalDeliveries },
                                { label: "Score", val: `${rider.reliabilityScore}/100` },
                                { label: "Acceptance", val: `${rider.acceptanceRate}%` },
                                { label: "Completion", val: `${rider.completionRate}%` }
                            ].map((s, i) => (
                                <div key={i} className="bg-gray-900 p-4 rounded-lg border border-gray-800 text-center">
                                    <div className="text-xs text-gray-500 uppercase mb-1">{s.label}</div>
                                    <div className="text-xl font-bold">{s.val}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-lg font-bold mb-4">Verification Documents</h2>
                        {rider.documents.length === 0 ? <p className="text-gray-500">No documents uploaded.</p> : (
                            <div className="space-y-4">
                                {rider.documents.map(doc => (
                                    <div key={doc.id} className="flex justify-between items-center bg-gray-900 p-4 rounded-lg border border-gray-700">
                                        <div>
                                            <div className="font-bold">{doc.docType}</div>
                                            <div className="text-xs text-gray-500">Uploaded {new Date(doc.uploadedAt).toLocaleString()}</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded ${doc.status === "APPROVED" ? "bg-green-900 text-green-400" : doc.status === "REJECTED" ? "bg-red-900 text-red-400" : "bg-yellow-900 text-yellow-400"}`}>
                                                {doc.status}
                                            </span>
                                            <a href={doc.docUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-sm">View</a>
                                            {doc.status === "PENDING" && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleAction("APPROVE", doc.id)} className="px-3 py-1 bg-green-600 rounded text-sm font-bold">Approve</button>
                                                    <button onClick={() => handleAction("REJECT", doc.id, { rejectionReason: prompt("Reason for rejection:") })} className="px-3 py-1 bg-red-600 rounded text-sm font-bold">Reject</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Jobs */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-lg font-bold mb-4">Recent Deliveries</h2>
                        <div className="space-y-2">
                            {rider.deliveryJobs.map(job => (
                                <div key={job.id} className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
                                    <div>
                                        <div className="text-sm font-bold">Order #{job.orderId.slice(-6).toUpperCase()}</div>
                                        <div className="text-xs text-gray-400">{job.order?.address}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-green-400">₹{job.order?.total}</div>
                                        <div className="text-xs text-gray-500">{job.status}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Status Box */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-lg font-bold mb-4">Current Status</h2>
                        <div className="mb-4">
                            <div className="text-xs text-gray-500 uppercase mb-1">Onboarding Stage</div>
                            <div className="text-lg font-bold text-blue-400">{rider.onboardingStatus.replace("_", " ")}</div>
                        </div>
                        <div className="mb-4">
                            <div className="text-xs text-gray-500 uppercase mb-1">Availability</div>
                            <div className="text-lg font-bold">{rider.isAvailable ? "🟢 Available" : rider.isOnline ? "🟡 Online (Busy)" : "⚫ Offline"}</div>
                        </div>
                    </div>

                    {/* Earnings */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-lg font-bold mb-4">Earnings</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between"><span className="text-gray-400">Total Earned</span><span className="font-bold text-white">₹{rider.totalEarnings}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Paid Out</span><span className="font-bold text-green-400">₹{rider.paidEarnings}</span></div>
                            <div className="flex justify-between border-t border-gray-700 pt-3"><span className="text-gray-400">Pending Pay</span><span className="font-bold text-yellow-400">₹{rider.pendingEarnings}</span></div>
                        </div>
                    </div>

                    {/* Fraud Flags */}
                    {rider.fraudFlags.length > 0 && (
                        <div className="bg-red-900/20 p-6 rounded-xl border border-red-900/50">
                            <h2 className="text-lg font-bold mb-4 text-red-400">Fraud Flags</h2>
                            <div className="space-y-3">
                                {rider.fraudFlags.map(flag => (
                                    <div key={flag.id} className="bg-gray-900 p-3 rounded-lg border border-red-900">
                                        <div className="font-bold text-sm text-red-400">{flag.flagType}</div>
                                        <div className="text-xs text-gray-400 mt-1">{flag.details?.detail || "No details"}</div>
                                        <div className="text-xs text-gray-500 mt-2">Status: {flag.status}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
