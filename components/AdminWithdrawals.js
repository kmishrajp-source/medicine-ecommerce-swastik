"use client";
import { useState, useEffect } from "react";

export default function AdminWithdrawals() {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/admin/withdrawals');
            const data = await res.json();
            if (data.success) setWithdrawals(data.withdrawals);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (id, status) => {
        const adminNote = prompt("Enter note for user (Optional):") || "";
        try {
            const res = await fetch('/api/admin/withdrawals', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status, adminNote })
            });
            if (res.ok) fetchRequests();
        } catch (error) {
            alert("Action failed");
        }
    };

    if (loading) return <div className="p-8">Loading requests...</div>;

    return (
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-8">Payout Requests</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="pb-4 font-black text-xs uppercase text-slate-400">User</th>
                            <th className="pb-4 font-black text-xs uppercase text-slate-400">Amount</th>
                            <th className="pb-4 font-black text-xs uppercase text-slate-400">Details</th>
                            <th className="pb-4 font-black text-xs uppercase text-slate-400">Status</th>
                            <th className="pb-4 font-black text-xs uppercase text-slate-400">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {withdrawals.map(w => (
                            <tr key={w.id} className="group hover:bg-slate-50 transition-colors">
                                <td className="py-4">
                                    <p className="font-bold text-slate-900">{w.user.name || w.user.email}</p>
                                    <p className="text-[10px] text-slate-500">{w.user.role}</p>
                                </td>
                                <td className="py-4 font-black text-blue-600">₹{w.amount.toFixed(2)}</td>
                                <td className="py-4">
                                    <p className="text-xs text-slate-600 line-clamp-1">{w.accountDetails}</p>
                                </td>
                                <td className="py-4">
                                    <span className={`text-[10px] font-black px-2 py-1 rounded-md ${
                                        w.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 
                                        (w.status === 'APPROVED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600')
                                    }`}>
                                        {w.status}
                                    </span>
                                </td>
                                <td className="py-4">
                                    {w.status === 'PENDING' && (
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleAction(w.id, 'APPROVED')}
                                                className="bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-lg hover:bg-green-600"
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleAction(w.id, 'REJECTED')}
                                                className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-lg hover:bg-red-600"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
