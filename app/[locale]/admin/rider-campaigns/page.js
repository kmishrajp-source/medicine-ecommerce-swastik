"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function AdminRiderCampaignsPage() {
    const { data: session } = useSession();
    const [data, setData] = useState({ campaigns: [], shortageZones: [] });
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState({ title: "", channel: "WHATSAPP", targetArea: "", targetCity: "Gorakhpur", generateContent: true });

    const fetchData = async () => {
        try {
            const res = await fetch("/api/admin/rider-campaigns");
            if (res.ok) setData(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (session?.user?.role === "ADMIN") fetchData();
    }, [session]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/rider-campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                setIsCreating(false);
                fetchData();
            } else alert("Failed to create campaign");
        } catch (err) { console.error(err); }
    };

    if (!session || session.user.role !== "ADMIN") return <div>Unauthorized</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-blue-400">Recruitment Campaigns</h1>
                    <p className="text-gray-400 mt-1">Manage delivery partner acquisition channels</p>
                </div>
                <button onClick={() => setIsCreating(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition">
                    + New Campaign
                </button>
            </div>

            {/* Recommended Shortage Zones */}
            {data.shortageZones.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-bold mb-4 text-gray-400">High Priority Zones (Shortage Detected)</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {data.shortageZones.map(z => (
                            <div key={z.id} className="bg-red-900/20 border border-red-900/50 p-4 rounded-xl cursor-pointer hover:border-red-500 transition"
                                onClick={() => {
                                    setForm(p => ({ ...p, targetArea: z.area, targetCity: z.city, title: `Recruitment - ${z.area}` }));
                                    setIsCreating(true);
                                }}>
                                <div className="font-bold text-red-400">{z.area}, {z.city}</div>
                                <div className="text-sm text-gray-400 mt-1">Needs {z.recommendedRiderCount} riders immediately</div>
                                <div className="mt-4 text-xs font-bold text-blue-400">Launch Campaign →</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {isCreating && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <form onSubmit={handleCreate} className="bg-gray-800 p-6 rounded-xl border border-gray-700 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Create Campaign</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Campaign Title</label>
                                <input type="text" required className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 outline-none focus:border-blue-500 text-white"
                                    value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Target Area</label>
                                <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 outline-none focus:border-blue-500 text-white"
                                    value={form.targetArea} onChange={e => setForm(p => ({ ...p, targetArea: e.target.value }))} />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Channel</label>
                                <select className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 outline-none focus:border-blue-500 text-white"
                                    value={form.channel} onChange={e => setForm(p => ({ ...p, channel: e.target.value }))}>
                                    <option value="WHATSAPP">WhatsApp</option>
                                    <option value="SMS">SMS</option>
                                    <option value="QR_CODE">QR Code Poster</option>
                                    <option value="REFERRAL_LINK">Referral Link</option>
                                    <option value="SOCIAL">Social Media</option>
                                </select>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                                <input type="checkbox" checked={form.generateContent} onChange={e => setForm(p => ({ ...p, generateContent: e.target.checked }))} />
                                Auto-generate copy/content
                            </label>
                        </div>
                        <div className="flex gap-2 justify-end mt-6">
                            <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-bold">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold">Create</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Campaign List */}
            <div className="grid gap-4">
                {data.campaigns.map(c => (
                    <div key={c.id} className="bg-gray-800 border border-gray-700 p-6 rounded-xl flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="font-bold text-lg">{c.title}</div>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${c.status === "ACTIVE" ? "bg-green-900 text-green-400" : "bg-gray-700 text-gray-400"}`}>{c.status}</span>
                            </div>
                            <div className="text-sm text-gray-400">{c.channel} • {c.targetArea ? `${c.targetArea}, ` : ""}{c.targetCity}</div>
                            {c.campaignContent?.message && (
                                <div className="mt-3 text-xs text-gray-500 bg-gray-900 p-2 rounded whitespace-pre-wrap max-w-2xl border border-gray-800">
                                    {c.campaignContent.message}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-6 text-center">
                            <div><div className="text-xs text-gray-500 uppercase">Impressions</div><div className="font-bold">{c.impressions}</div></div>
                            <div><div className="text-xs text-gray-500 uppercase">Applications</div><div className="font-bold">{c._count?.applications_rel || c.applications}</div></div>
                            <div><div className="text-xs text-gray-500 uppercase">Activated</div><div className="font-bold text-green-400">{c.activatedRiders}</div></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
