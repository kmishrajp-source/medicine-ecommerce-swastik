"use client";
import { useCart } from "@/context/CartContext";
import { Link } from '@/i18n/navigation';

export default function CartDrawer() {
    const { cart, isCartOpen, toggleCart, removeFromCart, cartTotal } = useCart();

    return (
        <>
            <div
                className={`cart-backdrop ${isCartOpen ? 'cart-open' : ''}`}
                onClick={() => toggleCart(false)}
                style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', zIndex: 1001,
                    opacity: isCartOpen ? 1 : 0, pointerEvents: isCartOpen ? 'auto' : 'none',
                    transition: 'opacity 0.3s'
                }}
            ></div>

            <aside
                className={`cart-sidebar ${isCartOpen ? 'cart-open' : ''}`}
                style={{
                    position: 'fixed', top: 0, right: isCartOpen ? 0 : '-400px', width: '400px', height: '100%',
                    background: 'white', zIndex: 1002, boxShadow: '-5px 0 20px rgba(0,0,0,0.1)',
                    transition: 'right 0.3s cubic-bezier(0.16, 1, 0.3, 1)', display: 'flex', flexDirection: 'column'
                }}
            >
                <div className="cart-header" style={{ padding: '20px', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Your Cart</h2>
                    <button onClick={() => toggleCart(false)} style={{ background: 'transparent', fontSize: '1.2rem', color: '#64748b' }}>
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>

                <div className="cart-items" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#64748b', marginTop: '40px' }}>Your cart is empty.</div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="cart-item" style={{ display: 'flex', gap: '16px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px dashed #eee' }}>
                                <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>{item.name}</h4>
                                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>₹{item.price.toFixed(2)} x {item.quantity}</div>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} style={{ color: '#FF6B6B', background: 'none' }}>
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="cart-footer" style={{ padding: '24px', background: '#f8fafc', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <div className="total" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>
                        <span>Total</span>
                        <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                    {cart.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="fa-solid fa-motorcycle" style={{ color: '#059669', fontSize: '1.2rem' }}></i>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: '#065f46', fontWeight: 'bold' }}>10-Min Fast Delivery Guaranteed</div>
                                    <div style={{ fontSize: '0.75rem', color: '#047857' }}>Arriving at your doorstep shortly.</div>
                                </div>
                            </div>
                            
                            <Link
                                href="/checkout"
                                onClick={() => toggleCart(false)}
                                className="btn btn-primary full-width"
                                style={{ width: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '14px', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}
                            >
                                Proceed to Secure Checkout <i className="fa-solid fa-arrow-right"></i>
                            </Link>

                            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                                <i className="fa-solid fa-lock" style={{ color: '#10b981' }}></i> 256-bit SSL Encrypted Transaction
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
