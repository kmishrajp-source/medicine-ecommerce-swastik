"use client";
import WalletDashboard from "@/components/WalletDashboard";

export default function PartnerWalletPage() {
    return (
        <div className="max-w-4xl mx-auto p-6 md:p-12">
            <div className="mb-12">
                <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">
                    Financial Portal
                </span>
                <h1 className="text-4xl font-black text-slate-900">Your Wallet</h1>
                <p className="text-slate-500 mt-2">Manage your earnings, track commissions, and request payouts.</p>
            </div>
            
            <WalletDashboard />
        </div>
    );
}
