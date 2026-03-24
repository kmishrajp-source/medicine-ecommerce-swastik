"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function WalletDashboard() {
    const { data: session } = useSession();
    const [balance, setBalance] = useState(0);
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showWithdrawForm, setShowWithdrawForm] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
    const [accountDetails, setAccountDetails] = useState({ accountHolder: "", accountNo: "", ifsc: "" });

    const fetchWalletData = async () => {
        try {
            const [balRes, witRes] = await Promise.all([
                fetch('/api/wallet/balance'),
                fetch('/api/wallet/withdraw')
            ]);
            const balData = await balRes.json();
            const witData = await witRes.json();
            if (balData.success) setBalance(balData.balance);
            if (witData.success) setWithdrawals(witData.withdrawals);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, []);

    const handleWithdraw = async (e) => {
        e.preventDefault();
        if (parseFloat(withdrawAmount) > balance) {
            alert("Insufficient balance");
            return;
        }
        if (parseFloat(withdrawAmount) < 100) {
            alert("Minimum withdrawal is 100 INR");
            return;
        }

        try {
            const res = await fetch('/api/wallet/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: withdrawAmount,
                    paymentMethod,
                    accountDetails
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Withdrawal request submitted!");
                setShowWithdrawForm(false);
                fetchWalletData();
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert("Failed to submit request");
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading Wallet...</div>;

    return (
        <div className="space-y-8">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <i className="fa-solid fa-wallet text-9xl"></i>
                </div>
                <div className="relative z-10">
                    <p className="text-blue-400 text-sm font-black uppercase tracking-widest mb-2">Available Balance</p>
                    <h2 className="text-6xl font-black mb-6">₹{balance.toFixed(2)}</h2>
                    <button 
                        onClick={() => setShowWithdrawForm(true)}
                        className="bg-white text-slate-900 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all flex items-center gap-2"
                    >
                        <i className="fa-solid fa-paper-plane"></i> Withdraw Funds
                    </button>
                </div>
            </div>

            {/* Withdrawal History */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 mb-6">Withdrawal History</h3>
                <div className="space-y-4">
                    {withdrawals.length === 0 ? (
                        <p className="text-slate-400 italic">No withdrawal requests yet.</p>
                    ) : (
                        withdrawals.map(w => (
                            <div key={w.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div>
                                    <p className="font-bold text-slate-900">₹{w.amount.toFixed(2)}</p>
                                    <p className="text-xs text-slate-500">{new Date(w.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                                    w.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 
                                    (w.status === 'APPROVED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600')
                                }`}>
                                    {w.status}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Withdraw Modal */}
            {showWithdrawForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className="bg-slate-900 p-8 text-white relative">
                            <button onClick={() => setShowWithdrawForm(false)} className="absolute top-6 right-6 text-white/60 hover:text-white">
                                <i className="fa-solid fa-xmark text-xl"></i>
                            </button>
                            <h2 className="text-2xl font-black">Withdraw Funds</h2>
                            <p className="text-white/60 text-sm mt-1">Funds will be credited to your account within 2-3 business days.</p>
                        </div>
                        <form onSubmit={handleWithdraw} className="p-8 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Amount (INR)</label>
                                <input 
                                    type="number" required min="100"
                                    className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500"
                                    value={withdrawAmount}
                                    onChange={e => setWithdrawAmount(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Account Holder Name</label>
                                    <input 
                                        type="text" required
                                        className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500"
                                        value={accountDetails.accountHolder}
                                        onChange={e => setAccountDetails({...accountDetails, accountHolder: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Account Number</label>
                                    <input 
                                        type="text" required
                                        className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500"
                                        value={accountDetails.accountNo}
                                        onChange={e => setAccountDetails({...accountDetails, accountNo: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">IFSC Code</label>
                                    <input 
                                        type="text" required
                                        className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500"
                                        value={accountDetails.ifsc}
                                        onChange={e => setAccountDetails({...accountDetails, ifsc: e.target.value})}
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit"
                                className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all"
                            >
                                Request Payout
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
