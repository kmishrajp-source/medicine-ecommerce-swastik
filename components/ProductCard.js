"use client";

export default function ProductCard({ product, onAdd }) {
    return (
        <div className="product-card" style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.3s', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '200px', background: `url('${product.image}') center/cover`, position: 'relative' }}>
                {product.requiresPrescription && (
                    <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#FF9F43', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                        Rx Required
                    </span>
                )}
            </div>
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '4px' }}>{product.category}</div>
                <h3 style={{ marginBottom: '8px', fontSize: '1.2rem', flex: 1 }}>{product.name}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary)' }}>₹{product.price.toFixed(2)}</span>
                    <button
                        onClick={() => onAdd(product)}
                        className="btn-icon-small"
                        style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--secondary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', border: 'none', cursor: 'pointer' }}>
                        <i className="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}
