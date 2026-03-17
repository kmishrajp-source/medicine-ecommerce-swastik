"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function MyPrescriptions() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selecting, setSelecting] = useState(null);

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
        else if (status === 'authenticated') fetchPrescriptions();
    }, [status]);

    const fetchPrescriptions = async () => {
        try {
            const res = await fetch('/api/user/quotes');
            const data = await res.json();
            if (data.success) setPrescriptions(data.prescriptions);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSelectQuote = async (quoteId) => {
        setSelecting(quoteId);
        try {
            const res = await fetch('/api/user/select-quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quoteId })
            });
            const data = await res.json();
            if (data.success) {
                alert("Quote selected! Redirecting to checkout...");
                // In a real flow, we'd redirect to a specialized checkout for this quote
                router.push('/checkout?source=prescription&quoteId=' + quoteId);
            } else {
                alert(data.error);
            }
        } catch (e) { alert("Selection failed"); }
        finally { setSelecting(null); }
    };

    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading your prescriptions...</div>;

    return (
        <div style={{ background: '#f9fafb', minHeight: '100vh' }}>
            <Navbar />
            <main className="container" style={{ paddingTop: '120px', paddingBottom: '60px', maxWidth: '1000px' }}>
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>My Prescriptions</h1>
                    <p style={{ color: '#6b7280' }}>Track your uploads and choose the best pharmacy quotes.</p>
                </div>

                {prescriptions.length === 0 ? (
                    <div style={{ background: 'white', padding: '60px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontSize: '3rem', color: '#d1d5db', marginBottom: '20px' }}><i className="fa-solid fa-file-invoice"></i></div>
                        <h3>No prescriptions found</h3>
                        <p style={{ color: '#6b7280', marginBottom: '20px' }}>Upload a prescription to get quotes from local pharmacies.</p>
                        <button onClick={() => router.push('/prescription-upload')} className="btn btn-primary">Upload Now</button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '30px' }}>
                        {prescriptions.map((p) => (
                            <div key={p.id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                <div style={{ display: 'flex', borderBottom: '1px solid #f3f4f6' }}>
                                    <div style={{ width: '150px', height: '150px', overflow: 'hidden', flexShrink: 0 }}>
                                        <img src={p.imageUrl} alt="Prescription" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ padding: '20px', flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID: #{p.id.slice(-8).toUpperCase()}</span>
                                                <h3 style={{ margin: '5px 0', fontSize: '1.25rem' }}>Uploaded on {new Date(p.createdAt).toLocaleDateString()}</h3>
                                            </div>
                                            <span style={{ 
                                                background: p.status === 'Processed' ? '#dcfce7' : '#fef3c7',
                                                color: p.status === 'Processed' ? '#166534' : '#92400e',
                                                padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600'
                                            }}>
                                                {p.status}
                                            </span>
                                        </div>
                                        <div style={{ marginTop: '10px', color: '#4b5563', fontSize: '0.875rem' }}>
                                            {p.quotes.length} Pharmacy Quotes Received
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '20px', background: '#f8fafc' }}>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '15px', color: '#374151' }}>Available Quotes</h4>
                                    {p.quotes.length === 0 ? (
                                        <div style={{ color: '#6b7280', fontSize: '0.9rem', italic: 'true' }}>
                                            Waiting for local pharmacies to review and quote...
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', gap: '15px' }}>
                                            {p.quotes.map((quote) => (
                                                <div key={quote.id} style={{ 
                                                    background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb',
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                                }}>
                                                    <div>
                                                        <div style={{ fontWeight: 'bold', color: '#111827' }}>{quote.retailer.shopName}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{quote.retailer.address}</div>
                                                        <div style={{ marginTop: '8px', color: '#059669', fontWeight: 'bold', fontSize: '1.1rem' }}>₹{quote.quotedAmount.toFixed(2)}</div>
                                                        {quote.items && (
                                                            <div style={{ fontSize: '0.75rem', color: '#4b5563', marginTop: '5px', background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>
                                                                {quote.items}
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {quote.status === 'SELECTED' ? (
                                                        <button 
                                                            disabled
                                                            style={{ background: '#059669', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold' }}
                                                        >
                                                            Selected <i className="fa-solid fa-check"></i>
                                                        </button>
                                                    ) : p.status === 'Processed' ? null : (
                                                        <button 
                                                            onClick={() => handleSelectQuote(quote.id)}
                                                            disabled={selecting === quote.id}
                                                            style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                                                        >
                                                            {selecting === quote.id ? 'Processing...' : 'Select & Order'}
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
