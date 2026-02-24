"use client";
import { useEffect, useState } from 'react';
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function WalletDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { cartCount, toggleCart } = useCart();

    const [walletData, setWalletData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [withdrawModal, setWithdrawModal] = useState(false);
    const [withdrawForm, setWithdrawForm] = useState({ amount: '', method: 'UPI', details: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push('/login');
        } else if (status === "authenticated") {
            fetchWalletData();
        }
    }, [status]);

    async function fetchWalletData() {
        setLoading(true);
        try {
            const res = await fetch('/api/wallet');
            const data = await res.json();
            if (data.success) {
                setWalletData(data.wallet);
            }
        } catch (error) {
            console.error("Failed to load wallet data.");
        } finally {
            setLoading(false);
        }
    }

    const formatINR = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'DEBIT': return <i className="fa-solid fa-arrow-down text-red-500"></i>;
            case 'CREDIT': return <i className="fa-solid fa-arrow-up text-green-500"></i>;
            default: return <i className="fa-solid fa-indian-rupee-sign"></i>;
        }
    };

    const copyReferralCode = () => {
        if (!walletData?.referralCode) return;
        const link = `${window.location.origin}/register?ref=${walletData.referralCode}`;
        navigator.clipboard.writeText(link);
        alert(`Referral Link Copied!\n\n${link}\n\nShare this with friends to earn 5% of their margins for life!`);
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        if (withdrawForm.amount < 100) {
            return alert("Minimum withdrawal is ₹100");
        }
        if (withdrawForm.amount > walletData.balance) {
            return alert("Insufficient Balance");
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/wallet/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(withdrawForm.amount),
                    paymentMethod: withdrawForm.method,
                    paymentDetails: withdrawForm.details
                })
            });
            const data = await res.json();

            if (data.success) {
                alert("Withdrawal request submitted! It will be verified by admin within 24 hours.");
                setWithdrawModal(false);
                fetchWalletData(); // Refresh balances
                setWithdrawForm({ amount: '', method: 'UPI', details: '' });
            } else {
                alert(data.error || "Failed to submit withdrawal");
            }
        } catch (error) {
            alert("Network error.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading Secure Wallet...</div>;

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans" style={{ marginTop: '70px' }}>
                <div className="max-w-3xl mx-auto space-y-6">

                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Earnings Wallet</h1>
                        <p className="text-gray-500 mt-1">Track your referral commissions and delivery payouts.</p>
                    </div>

                    {/* Balance Card */}
                    <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-20 text-9xl"><i className="fa-solid fa-wallet"></i></div>
                        <p className="text-green-100 font-medium tracking-wide uppercase text-sm">Available Balance</p>
                        <h2 className="text-5xl font-extrabold mt-2 tracking-tight">{formatINR(walletData?.balance || 0)}</h2>

                        <div className="mt-8 flex gap-4 flex-wrap">
                            <button
                                onClick={() => setWithdrawModal(true)}
                                className="bg-white text-teal-700 px-6 py-3 rounded-full font-semibold shadow hover:bg-green-50 transition-colors">
                                <i className="fa-solid fa-bank mr-2"></i> Withdraw to Bank
                            </button>
                            <button
                                onClick={copyReferralCode}
                                className="bg-teal-700 bg-opacity-50 text-white px-6 py-3 rounded-full font-semibold hover:bg-opacity-70 transition-colors">
                                <i className="fa-solid fa-share-nodes mr-2"></i> Share Referral Link
                            </button>
                        </div>

                        {walletData?.referralCode && (
                            <p className="mt-4 text-sm opacity-80">
                                Your Code: <strong>{walletData.referralCode}</strong>
                                (Invite friends: Earn 5% on their orders, 2% on friends-of-friends!)
                            </p>
                        )}
                    </div>

                    {/* Pending Withdrawals (If any) */}
                    {walletData?.withdrawals?.length > 0 && walletData.withdrawals.some(w => w.status === 'Pending') && (
                        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                            <h4 className="text-orange-800 font-bold mb-2"><i className="fa-solid fa-clock"></i> Pending Withdrawals</h4>
                            {walletData.withdrawals.filter(w => w.status === 'Pending').map(w => (
                                <div key={w.id} className="text-sm flex justify-between text-orange-700">
                                    <span>{new Date(w.createdAt).toLocaleDateString()} via {w.paymentMethod}</span>
                                    <strong>{formatINR(w.amount)}</strong>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Transactions Ledger */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {!walletData?.transactions || walletData.transactions.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">No transactions found in this wallet.</div>
                            ) : (
                                walletData.transactions.map((tx) => (
                                    <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center text-xl shadow-sm border border-gray-200">
                                                {getTransactionIcon(tx.type)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{tx.description}</p>
                                                <p className="text-sm text-gray-500 mt-0.5">
                                                    {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`font-bold text-lg ${tx.type === 'DEBIT' ? 'text-red-500' : 'text-green-600'}`}>
                                                {tx.type === 'DEBIT' ? '-' : '+'}{formatINR(tx.amount)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Withdrawal Modal Screen */}
            {withdrawModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h2 className="text-xl font-bold mb-4">Express Withdrawal</h2>
                        <form onSubmit={handleWithdraw}>
                            <div className="mb-4">
                                <label className="block text-sm text-gray-700 mb-1">Amount to Withdraw (₹)</label>
                                <input
                                    type="number"
                                    required
                                    min="100"
                                    max={walletData?.balance || 0}
                                    value={withdrawForm.amount}
                                    onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                                    className="w-full border border-gray-300 p-2 rounded"
                                    placeholder="Min ₹100"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm text-gray-700 mb-1">Payout Method</label>
                                <select
                                    value={withdrawForm.method}
                                    onChange={(e) => setWithdrawForm({ ...withdrawForm, method: e.target.value })}
                                    className="w-full border border-gray-300 p-2 rounded">
                                    <option value="UPI">UPI ID</option>
                                    <option value="BANK_TRANSFER">Bank Account (NEFT/IMPS)</option>
                                </select>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm text-gray-700 mb-1">
                                    {withdrawForm.method === 'UPI' ? 'Enter UPI Address' : 'Account Details (A/C + IFSC)'}
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={withdrawForm.details}
                                    onChange={(e) => setWithdrawForm({ ...withdrawForm, details: e.target.value })}
                                    className="w-full border border-gray-300 p-2 rounded"
                                    placeholder={withdrawForm.method === 'UPI' ? "e.g., 9876543210@ybl" : "A/C: XXXX, IFSC: XXXX"}
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setWithdrawModal(false)}
                                    className="w-1/2 p-3 bg-gray-200 text-gray-800 rounded-xl font-bold">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-1/2 p-3 bg-green-600 text-white rounded-xl font-bold">
                                    {isSubmitting ? "Processing..." : "Submit Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, padding: '20px'
};

const modalContentStyle = {
    backgroundColor: '#fff', padding: '30px', borderRadius: '15px', width: '100%', maxWidth: '400px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
};
