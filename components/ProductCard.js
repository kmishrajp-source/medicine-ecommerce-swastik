"use client";
import Image from "next/image";
import { useTranslations } from 'next-intl';

export default function ProductCard({ product, onAdd }) {
    const t = useTranslations('Product');
    
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
                    <button
                        onClick={() => onAdd(product)}
                        className="btn-icon-small"
                        title={product.stock > 0 ? t('add_to_cart') : t('out_of_stock')}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--secondary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', border: 'none', cursor: 'pointer' }}>
                        <i className={`fa-solid ${product.stock > 0 ? 'fa-plus' : 'fa-cart-plus'}`}></i>
                    </button>
                </div>
            </div>
        </div>
    );
}
