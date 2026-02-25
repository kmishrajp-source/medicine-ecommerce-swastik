"use client";
import { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';
import Navbar from "@/components/Navbar";
import WithdrawalModal from "./WithdrawalModal";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";

export default function ReferPage() {
    const t = useTranslations('Referral');
    const { cartCount, toggleCart } = useCart();
    const { data: session, status } = useSession();
    const router = useRouter();

    const [referralCode, setReferralCode] = useState("");
    const [walletBalance, setWalletBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [network, setNetwork] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (status === "authenticated") {
            fetch('/api/user/me')
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.user) {
                        setReferralCode(data.user.referralCode || "N/A");
                        setWalletBalance(data.user.walletBalance || 0);
                        setTransactions(data.user.transactions || []);
                        setNetwork(data.user.referredNetwork || []);
                        setWithdrawals(data.user.withdrawals || []);
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to load user profile:", err);
                    setLoading(false);
                });
        }
    }, [status, session, router]);

    const shareOnWhatsApp = () => {
        const text = `Hey! I'm using Swastik Medicare for fast medicine delivery. Sign up using my referral code *${referralCode}* and we both get a bonus! Link: https://swastik-medicare.vercel.app/signup`;
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            <div className="container" style={{ marginTop: '120px', minHeight: '60vh' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '16px', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', color: 'var(--success)', marginBottom: '20px' }}>
                        <i className="fa-solid fa-gift"></i>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '15px' }}>
                        {t('title')}
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-light)', marginBottom: '40px', lineHeight: 1.6 }}>
                        {t('subtitle')}
                    </p>

                    {loading ? (
                        <div style={{ padding: '20px', color: '#666' }}>Loading your unique code...</div>
                    ) : (
                        <div style={{ background: 'var(--bg-light)', padding: '30px', borderRadius: '12px', border: '2px dashed var(--primary-light)', marginBottom: '40px' }}>
                            <div style={{ fontSize: '1.2rem', color: 'var(--text-dark)', marginBottom: '10px', fontWeight: 600 }}>
                                {t('your_code')}
                            </div>

                            <div
                                onClick={copyToClipboard}
                                style={{ background: 'white', border: '2px solid var(--primary)', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', cursor: 'pointer', marginBottom: '20px', transition: 'all 0.2s ease' }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#F3F4F6'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                            >
                                <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '2px' }}>
                                    {referralCode}
                                </span>
                                <i className={`fa-solid ${copied ? 'fa-check text-success' : 'fa-copy'}`} style={{ fontSize: '1.5rem', color: copied ? '#10B981' : '#6B7280' }}></i>
                            </div>
                            {copied && <p style={{ color: '#10B981', fontWeight: 'bold', marginTop: '-10px', marginBottom: '15px' }}>Copied to clipboard!</p>}

                            {/* Earnings Potential Calculator */}
                            <div style={{ background: '#FEF3C7', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #F59E0B' }}>
                                <p style={{ margin: '0 0 5px 0', color: '#B45309', fontWeight: 'bold' }}><i className="fa-solid fa-chart-line"></i> Earnings Potential</p>
                                <p style={{ margin: 0, color: '#92400E', fontSize: '0.95rem' }}>Invite 10 friends who place an order = <strong>Earn ₹500</strong> directly to your bank!</p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '15px', background: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                                <p style={{ margin: 0, fontSize: '1.3rem', color: '#1B5E20', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <i className="fa-solid fa-wallet"></i> Wallet Balance: ₹{walletBalance.toFixed(2)}
                                </p>
                                <button
                                    onClick={() => setIsWithdrawModalOpen(true)}
                                    disabled={walletBalance < 100}
                                    style={{ background: walletBalance >= 100 ? '#10B981' : '#D1D5DB', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: walletBalance >= 100 ? 'pointer' : 'not-allowed', transition: '0.2s' }}
                                >
                                    Withdraw
                                </button>
                            </div>

                            <button
                                onClick={shareOnWhatsApp}
                                className="btn btn-primary"
                                style={{ background: '#25D366', fontSize: '1.1rem', padding: '15px 30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', border: 'none' }}
                            >
                                <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.4rem' }}></i> Send via WhatsApp
                            </button>
                        </div>
                    )}

                    <WithdrawalModal
                        isOpen={isWithdrawModalOpen}
                        onClose={() => setIsWithdrawModalOpen(false)}
                        walletBalance={walletBalance}
                        onSuccess={(newBalance) => {
                            setWalletBalance(newBalance);
                            // Refresh the page data silently to show the new pending withdrawal
                            fetch('/api/user/me').then(res => res.json()).then(data => {
                                if (data.success && data.user) {
                                    setTransactions(data.user.transactions || []);
                                    setWithdrawals(data.user.withdrawals || []);
                                }
                            });
                        }}
                    />

                    {!loading && (
                        <div style={{ textAlign: 'left', marginTop: '20px' }}>
                            {/* Earnings History */}
                            <h3 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '15px', paddingBottom: '10px', borderBottom: '2px solid #E5E7EB' }}>
                                <i className="fa-solid fa-coins" style={{ color: '#F59E0B' }}></i> Earnings History
                            </h3>
                            {transactions.length > 0 ? (
                                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '30px' }}>
                                    {transactions.map(tx => (
                                        <li key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#F9FAFB', borderRadius: '8px', marginBottom: '10px', borderLeft: `4px solid ${tx.type === 'CREDIT' ? '#10B981' : '#EF4444'}` }}>
                                            <div>
                                                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#374151' }}>{tx.description}</p>
                                                <small style={{ color: '#6B7280' }}>{new Date(tx.createdAt).toLocaleDateString()}</small>
                                            </div>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: tx.type === 'CREDIT' ? '#10B981' : '#EF4444' }}>
                                                {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p style={{ color: '#6B7280', marginBottom: '30px', fontStyle: 'italic' }}>No earnings history yet. Share your code to start earning!</p>
                            )}

                            {/* Withdrawal Requests */}
                            {withdrawals.length > 0 && (
                                <>
                                    <h3 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '15px', paddingBottom: '10px', borderBottom: '2px solid #E5E7EB' }}>
                                        <i className="fa-solid fa-building-columns" style={{ color: '#8B5CF6' }}></i> Withdrawal Requests
                                    </h3>
                                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: '40px' }}>
                                        {withdrawals.map(w => (
                                            <li key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'white', borderRadius: '8px', marginBottom: '10px', border: '1px solid #E5E7EB' }}>
                                                <div>
                                                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#374151' }}>To: {w.paymentDetails}</p>
                                                    <small style={{ color: '#6B7280' }}>{new Date(w.createdAt).toLocaleDateString()}</small>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '1.1rem' }}>₹{w.amount.toFixed(2)}</p>
                                                    <span style={{
                                                        fontSize: '0.8rem', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold',
                                                        background: w.status === 'Pending' ? '#FEF3C7' : w.status === 'Completed' ? '#D1FAE5' : '#FEE2E2',
                                                        color: w.status === 'Pending' ? '#D97706' : w.status === 'Completed' ? '#059669' : '#DC2626'
                                                    }}>
                                                        {w.status}
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}

                            {/* Referral Network */}
                            <h3 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '15px', paddingBottom: '10px', borderBottom: '2px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span><i className="fa-solid fa-users" style={{ color: '#3B82F6' }}></i> Your Network (Tier 1)</span>
                                <div style={{ fontSize: '1rem', display: 'flex', gap: '15px' }}>
                                    <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '5px 10px', borderRadius: '20px' }}>Total Invited: <strong>{network.length}</strong></span>
                                    {network.length > 0 && <span style={{ background: '#ECFDF5', color: '#047857', padding: '5px 10px', borderRadius: '20px' }}>Active Buyers: <strong>{network.filter(u => u.isActive).length}</strong></span>}
                                </div>
                            </h3>
                            {network.length > 0 ? (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ background: '#F3F4F6' }}>
                                                <th style={{ padding: '12px', borderBottom: '2px solid #E5E7EB', color: '#374151' }}>User Name</th>
                                                <th style={{ padding: '12px', borderBottom: '2px solid #E5E7EB', color: '#374151' }}>Status</th>
                                                <th style={{ padding: '12px', borderBottom: '2px solid #E5E7EB', color: '#374151' }}>Joined Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {network.map((user, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                                    <td style={{ padding: '12px', color: '#4B5563', fontWeight: 'bold' }}>{user.name || "Anonymous User"}</td>
                                                    <td style={{ padding: '12px' }}>
                                                        {user.isActive
                                                            ? <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '0.9rem' }}><i className="fa-solid fa-check-circle"></i> Active Buyer</span>
                                                            : <span style={{ color: '#F59E0B', fontSize: '0.9rem' }}><i className="fa-solid fa-clock"></i> Pending order</span>}
                                                    </td>
                                                    <td style={{ padding: '12px', color: '#6B7280' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p style={{ color: '#6B7280', fontStyle: 'italic' }}>Nobody has signed up with your code yet.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
