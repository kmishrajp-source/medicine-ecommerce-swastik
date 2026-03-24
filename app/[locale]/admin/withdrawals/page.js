"use client";
import AdminWithdrawals from "@/components/AdminWithdrawals";

export default function AdminWithdrawalsPage() {
    return (
        <div className="max-w-6xl mx-auto p-6 md:p-12">
            <div className="mb-12">
                <span className="bg-red-100 text-red-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">
                    Finance Admin
                </span>
                <h1 className="text-4xl font-black text-slate-900">Withdrawal Management</h1>
                <p className="text-slate-500 mt-2">Review and process payout requests from partners and publishers.</p>
            </div>
            
            <AdminWithdrawals />
        </div>
    );
}
