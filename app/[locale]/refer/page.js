"use client";
import { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';
import Navbar from "@/components/Navbar";
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
    const [loading, setLoading] = useState(true);

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
        const text = `Hey! I'm using Swastik Medicare for fast medicine delivery. Sign up using my referral code *${referralCode}* to get special discounts! Link: https://swastik-medicare.vercel.app/signup`;
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
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
                            <div style={{ fontSize: '1.1rem', color: 'var(--text-dark)', marginBottom: '10px', fontWeight: 600 }}>
                                {t('your_code')}
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '2px', marginBottom: '20px' }}>
                                {referralCode}
                            </div>
                            <p style={{ margin: '0 0 15px 0', fontSize: '1.2rem', color: '#1B5E20', fontWeight: 'bold' }}>
                                Wallet Balance: ₹{walletBalance.toFixed(2)}
                            </p>
                            <button
                                onClick={shareOnWhatsApp}
                                className="btn btn-primary"
                                style={{ background: '#25D366', fontSize: '1.1rem', padding: '15px 30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%' }}
                            >
                                <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.4rem' }}></i> {t('share_whatsapp')}
                            </button>
                        </div>
                    )}

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

                            {/* Referral Network */}
                            <h3 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '15px', paddingBottom: '10px', borderBottom: '2px solid #E5E7EB' }}>
                                <i className="fa-solid fa-users" style={{ color: '#3B82F6' }}></i> Your Network (Tier 1)
                            </h3>
                            {network.length > 0 ? (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ background: '#F3F4F6' }}>
                                                <th style={{ padding: '12px', borderBottom: '2px solid #E5E7EB', color: '#374151' }}>User Name</th>
                                                <th style={{ padding: '12px', borderBottom: '2px solid #E5E7EB', color: '#374151' }}>Joined Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {network.map((user, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                                    <td style={{ padding: '12px', color: '#4B5563', fontWeight: 'bold' }}>{user.name || "Anonymous User"}</td>
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
