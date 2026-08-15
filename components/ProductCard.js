"use client";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product, onAdd }) {
    const t = useTranslations('Product');
    const { data: session } = useSession();
    const router = useRouter();
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        if (typeof onAdd === 'function') {
            onAdd(product);
        } else if (typeof addToCart === 'function') {
            addToCart(product);
        }
    };

    const [showSubModal, setShowSubModal] = useState(false);
    const [subQuantity, setSubQuantity] = useState(1);
    const [subFreq, setSubFreq] = useState('Monthly');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDosage, setShowDosage] = useState(false);
    const [dosageInfo, setDosageInfo] = useState(null);
    const [isDosageLoading, setIsDosageLoading] = useState(false);

    const fetchDosage = async () => {
        if (dosageInfo !== null) { setShowDosage(v => !v); return; } // Already loaded
        setShowDosage(true);
        setIsDosageLoading(true);
        try {
            // Use the salt/composition or name as the search key
            const searchTerm = (product.salt || product.composition || product.name).split(/[,+]/)[0].trim();
            const res = await fetch(`https://api.fda.gov/drug/label.json?search=active_ingredient:"${encodeURIComponent(searchTerm)}"&limit=1`);
            const data = await res.json();
            if (data.results && data.results.length > 0) {
                const info = data.results[0];
                setDosageInfo({
                    dosage: info.dosage_and_administration?.[0]?.substring(0, 400) || null,
                    warnings: info.warnings?.[0]?.substring(0, 300) || null,
                    indications: info.indications_and_usage?.[0]?.substring(0, 300) || null,
                });
            } else {
                setDosageInfo({ dosage: null, warnings: null, indications: null });
            }
        } catch (e) {
            setDosageInfo({ dosage: null, warnings: null, indications: null });
        } finally {
            setIsDosageLoading(false);
        }
    };

    const handleSubscribe = async () => {
        if (!session) {
            router.push('/login?callbackUrl=/shop-medicines');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    medicineName: product.name,
                    quantity: subQuantity,
                    frequency: subFreq
                })
            });
            const data = await res.json();
            if (data.success) {
                setShowSubModal(false);
                router.push('/subscriptions');
            } else {
                alert(data.error || "Failed to subscribe");
            }
        } catch (error) {
            alert("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="product-card" style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.3s', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', width: '100%', height: '140px', backgroundColor: '#f1f5f9' }}>
                <Image 
                    src={product.image || "/images/default-medicine.png"} 
                    alt={product.name} 
                    fill 
                    style={{ objectFit: 'contain', padding: '10px' }}
                    sizes="(max-width: 768px) 100vw, 300px"
                    loading="lazy"
                />
                <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-start', zIndex: 10 }}>
                    {product.requiresPrescription && (
                        <span style={{ background: '#FF9F43', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>Rx Required</span>
                    )}
                    {product.isScheduleH1 && (
                        <span style={{ background: '#000000', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>Schedule H1</span>
                    )}
                    {product.isColdChain && (
                        <span style={{ background: '#3B82F6', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}><i className="fa-solid fa-snowflake" style={{ marginRight: '4px' }}></i>Cold Chain</span>
                    )}
                    {product.isOTC && (
                        <span style={{ background: '#10B981', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>OTC</span>
                    )}
                </div>
            </div>
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '4px' }}>{product.category === 'General' ? t('general_category') : product.category}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: product.stock > 0 ? '#10B981' : '#F59E0B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {product.stock > 0 ? (
                            <><i className="fa-solid fa-bolt"></i> {t('immediate_delivery')}</>
                        ) : (
                            <><i className="fa-solid fa-clock"></i> Available in 3-5 Hours</>
                        )}
                    </div>
                </div>
                 <h3 style={{ marginBottom: '4px', fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{product.name}</h3>

                <div className="space-y-1 mb-3">
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        <span style={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '10px' }}>Manufacturer:</span> {product.manufacturer || product.brand || 'Verified Pharma'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        <span style={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '10px' }}>Salt:</span> {product.salt || product.composition || 'Clinical Grade'}
                    </div>
                </div>

                {product.uses && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '4px', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        <strong style={{ color: 'var(--text-dark)' }}>{t('uses')}:</strong> {product.uses}
                    </div>
                )}
                {product.sideEffects && (
                    <div style={{ fontSize: '0.8rem', color: '#EF4444', marginBottom: '8px', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        <strong>{t('side_effects')}:</strong> {product.sideEffects}
                    </div>
                )}

                {/* Dosage & Info Collapsible Section */}
                <div style={{ marginBottom: '8px' }}>
                    <button
                        onClick={fetchDosage}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: showDosage ? '#eef2ff' : '#f8fafc', border: '1px solid', borderColor: showDosage ? '#a5b4fc' : '#e2e8f0', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, color: showDosage ? '#4f46e5' : '#64748b', cursor: 'pointer', width: '100%', justifyContent: 'space-between', transition: 'all 0.2s' }}
                    >
                        <span><i className="fa-solid fa-capsules" style={{ marginRight: '5px' }}></i>Dosage &amp; Info</span>
                        <i className={`fa-solid ${showDosage ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ fontSize: '10px' }}></i>
                    </button>

                    {showDosage && (
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '12px', fontSize: '0.75rem', color: '#475569', lineHeight: '1.6', maxHeight: '180px', overflowY: 'auto' }}>
                            {isDosageLoading ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                                    <span style={{ width: '12px', height: '12px', border: '2px solid #a5b4fc', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }}></span>
                                    Fetching dosage information...
                                </div>
                            ) : dosageInfo ? (
                                <>
                                    {dosageInfo.indications && (
                                        <div style={{ marginBottom: '8px' }}>
                                            <span style={{ fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em' }}>✅ Indications</span>
                                            <p style={{ margin: '4px 0 0 0' }}>{dosageInfo.indications}</p>
                                        </div>
                                    )}
                                    {dosageInfo.dosage && (
                                        <div style={{ marginBottom: '8px' }}>
                                            <span style={{ fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em' }}>💊 Dosage</span>
                                            <p style={{ margin: '4px 0 0 0' }}>{dosageInfo.dosage}</p>
                                        </div>
                                    )}
                                    {dosageInfo.warnings && (
                                        <div>
                                            <span style={{ fontWeight: 800, color: '#EF4444', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em' }}>⚠️ Warnings</span>
                                            <p style={{ margin: '4px 0 0 0', color: '#EF4444' }}>{dosageInfo.warnings}</p>
                                        </div>
                                    )}
                                    {!dosageInfo.dosage && !dosageInfo.indications && (
                                        <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No detailed dosage info found. Please consult the medicine label or your pharmacist.</p>
                                    )}
                                    <p style={{ marginTop: '8px', fontSize: '10px', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>Source: OpenFDA • Always follow doctor&apos;s prescription.</p>
                                </>
                            ) : null}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>₹{product.price.toFixed(2)}</span>
                            {product.mrp > product.price && (
                                <span style={{ fontSize: '0.9rem', color: '#94a3b8', textDecoration: 'line-through' }}>₹{product.mrp.toFixed(2)}</span>
                            )}
                        </div>
                        {product.discount > 0 && (
                            <div style={{ color: '#10B981', fontSize: '0.75rem', fontWeight: 700 }}>
                                <i className="fa-solid fa-tag"></i> {product.discount}% OFF
                            </div>
                        )}
                        {product.packSize && (
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>Pack Size: {product.packSize}</div>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setShowSubModal(true)}
                            className="btn-icon-small"
                            title="Subscribe & Save"
                            style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', border: 'none', cursor: 'pointer' }}>
                            <i className="fa-solid fa-repeat"></i>
                        </button>
                        <button
                            onClick={handleAddToCart}
                            className="btn-icon-small"
                            title={product.stock > 0 ? t('add_to_cart') : t('out_of_stock')}
                            style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--secondary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', border: 'none', cursor: 'pointer' }}>
                            <i className={`fa-solid ${product.stock > 0 ? 'fa-plus' : 'fa-cart-plus'}`}></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Subscribe Modal */}
            {showSubModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>Subscribe to {product.name}</h3>
                            <button onClick={() => setShowSubModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quantity per delivery</label>
                            <input 
                                type="number" 
                                min="1"
                                value={subQuantity} 
                                onChange={(e) => setSubQuantity(e.target.value)}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontWeight: 600 }}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivery Frequency</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button 
                                    onClick={() => setSubFreq('Monthly')}
                                    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: subFreq === 'Monthly' ? '2px solid #6366f1' : '1px solid #e2e8f0', background: subFreq === 'Monthly' ? '#eef2ff' : 'white', color: subFreq === 'Monthly' ? '#4f46e5' : '#64748b', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                                >
                                    Monthly
                                </button>
                                <button 
                                    onClick={() => setSubFreq('Weekly')}
                                    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: subFreq === 'Weekly' ? '2px solid #6366f1' : '1px solid #e2e8f0', background: subFreq === 'Weekly' ? '#eef2ff' : 'white', color: subFreq === 'Weekly' ? '#4f46e5' : '#64748b', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                                >
                                    Weekly
                                </button>
                            </div>
                        </div>

                        <button 
                            onClick={handleSubscribe}
                            disabled={isSubmitting}
                            style={{ width: '100%', padding: '16px', borderRadius: '12px', background: isSubmitting ? '#cbd5e1' : '#4f46e5', color: 'white', fontWeight: 900, border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: '1rem', transition: 'all 0.2s' }}
                        >
                            {isSubmitting ? 'Setting up...' : 'Confirm Subscription'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
