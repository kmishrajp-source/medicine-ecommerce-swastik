"use client";
import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';

export default function WithdrawalModal({ isOpen, onClose, walletBalance, onSuccess }) {
    const t = useTranslations('Referral');
    const [amount, setAmount] = useState("");
    const [upiId, setUpiId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [minWithdrawal, setMinWithdrawal] = useState(100);

    useEffect(() => {
        if (isOpen) {
            fetch('/api/settings/public')
                .then(res => res.json())
                .then(data => {
                    if (data.minimumWithdrawal) {
                        setMinWithdrawal(data.minimumWithdrawal);
                    }
                })
                .catch(console.error);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (walletBalance < minWithdrawal) {
            setError(`You need at least ₹${minWithdrawal} to withdraw.`);
            return;
        }

        if (Number(amount) > walletBalance) {
            setError("You cannot withdraw more than your current balance.");
            return;
        }

        if (Number(amount) < minWithdrawal) {
            setError(`Minimum withdrawal amount is ₹${minWithdrawal}.`);
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/wallet/withdraw", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: Number(amount), upiId }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setError(data.error || "Failed to process withdrawal");
            } else {
                onSuccess(data.data.newBalance);
                onClose();
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', position: 'relative' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#6B7280' }}
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>

                <h2 style={{ margin: '0 0 20px 0', color: '#1F2937', fontSize: '1.5rem' }}>Withdraw Earnings</h2>

                <div style={{ background: '#F3F4F6', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
                    <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9rem' }}>Available Balance</p>
                    <p style={{ margin: 0, color: '#10B981', fontSize: '1.8rem', fontWeight: 'bold' }}>₹{walletBalance.toFixed(2)}</p>
                </div>

                {error && <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem', border: '1px solid #FECACA' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontWeight: 'bold' }}>Amount (₹)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder={`Min ₹${minWithdrawal}`}
                            min={minWithdrawal}
                            max={walletBalance}
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '1rem' }}
                        />
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontWeight: 'bold' }}>Your UPI ID</label>
                        <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="e.g. 9999999999@ybl"
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '1rem' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || walletBalance < minWithdrawal}
                        style={{ width: '100%', padding: '14px', background: walletBalance >= minWithdrawal ? '#3B82F6' : '#9CA3AF', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: walletBalance >= minWithdrawal ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}
                    >
                        {loading ? 'Processing...' : 'Request Withdrawal'}
                    </button>
                    {walletBalance < minWithdrawal && <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#EF4444', margin: '10px 0 0 0' }}>Minimum ₹{minWithdrawal} required to withdraw.</p>}
                </form>
            </div>
        </div>
    );
}
