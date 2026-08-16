"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function AdminRidersDirectory() {
    const { data: session } = useSession();
    const [riders, setRiders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: "", status: "", verified: "" });

    useEffect(() => {
        const fetchRiders = async () => {
            setLoading(true);
            try {
                const q = new URLSearchParams(filters).toString();
                const res = await fetch(`/api/admin/riders?${q}`);
                if (res.ok) {
                    const data = await res.json();
                    setRiders(data.riders || []);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        if (session?.user?.role === "ADMIN") fetchRiders();
    }, [filters, session]);

    if (!session || session.user.role !== "ADMIN") return <div>Unauthorized</div>;

    const getStatusColor = (status) => {
        const map = {
            "Applied": "bg-gray-500", "Docs_Submitted": "bg-blue-500",
            "Under_Verification": "bg-yellow-500", "Verified": "bg-indigo-500",
            "Active": "bg-green-500", "Suspended": "bg-red-500"
        };
        return map[status] || "bg-gray-500";
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">Rider Fleet Directory</h1>
                    <p className="text-gray-400 mt-1">Manage delivery partners, verification, and performance</p>
                </div>
                <Link href="/en/admin/rider-intelligence" className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 text-sm font-semibold transition">
                    ← AI Command Center
                </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6 bg-gray-800 p-4 rounded-xl border border-gray-700">
                <input
                    type="text"
                    placeholder="Search name, phone, license..."
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500"
                    value={filters.search}
                    onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
                />
                <select
                    className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500"
                    value={filters.status}
                    onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}
                >
                    <option value="">All Statuses</option>
                    <option value="Applied">Applied</option>
                    <option value="Docs_Submitted">Docs Submitted</option>
                    <option value="Under_Verification">Under Verification</option>
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                </select>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading fleet data...</div>
            ) : riders.length === 0 ? (
                <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700 text-gray-400">No delivery partners found matching your filters.</div>
            ) : (
                <div className="grid gap-4">
                    {riders.map(rider => (
                        <Link href={`/en/admin/riders/${rider.id}`} key={rider.id} className="block bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-green-500 transition duration-200">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-xl">
                                        {rider.vehicleType === "BICYCLE" ? "🚲" : "🏍️"}
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg">{rider.name || rider.user?.name || "Unnamed Rider"}</div>
                                        <div className="text-sm text-gray-400">{rider.phone} • {rider.city} {rider.area ? `(${rider.area})` : ""}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 text-sm">
                                    <div className="text-center">
                                        <div className="text-gray-400 text-xs uppercase mb-1">Score</div>
                                        <div className={`font-bold ${rider.reliabilityScore >= 80 ? "text-green-400" : rider.reliabilityScore >= 60 ? "text-yellow-400" : "text-red-400"}`}>{rider.reliabilityScore}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-gray-400 text-xs uppercase mb-1">Status</div>
                                        <div className={`px-2 py-1 rounded text-xs font-bold text-white ${getStatusColor(rider.onboardingStatus)}`}>
                                            {rider.onboardingStatus.replace("_", " ")}
                                        </div>
                                    </div>
                                    {rider._count?.fraudFlags > 0 && (
                                        <div className="text-red-400 font-bold bg-red-400/10 px-2 py-1 rounded">⚠️ {rider._count.fraudFlags} Flags</div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
