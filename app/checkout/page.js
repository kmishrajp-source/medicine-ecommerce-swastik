"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Checkout() {
    const { cart, cartTotal, clearCart, toggleCart, cartCount } = useCart();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('ONLINE');
    const { data: session } = useSession(); // Ensure import

    // Check if any item requires prescription
    const hasRxItems = cart.some(item => item.requiresPrescription);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleOrderSubmit = async (e) => {
        e.preventDefault();

        if (!session) {
            alert("Please login to place an order.");
            router.push("/login");
            return;
        }

        // DEBUG: Check if key is available
        if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
            alert("Error: NEXT_PUBLIC_RAZORPAY_KEY_ID is missing. Please add it to Vercel and Redeploy.");
            return;
        }

        setIsProcessing(true);

        const res = await loadRazorpay();
        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            setIsProcessing(false);
            return;
        }

        try {
            // Create Order on Server
            const orderRes = await fetch('/api/create-order', {
                method: 'POST',
                body: JSON.stringify({ amount: cartTotal }),
            });

            if (!orderRes.ok) {
                const errorText = await orderRes.text();
                throw new Error(errorText || "Server responded with an error");
            }

            const orderData = await orderRes.json();

            if (orderData.error) {
                alert("Order Creation Failed: " + orderData.error);
                setIsProcessing(false);
                return;
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Swastik Medicare",
                description: "Medicine Purchase",
                order_id: orderData.id,
                handler: async function (response) {
                    // Success Handler
                    const newOrder = {
                        id: orderData.id,
                        total: cartTotal,
                        items: [...cart],
                        status: 'Processing',
                        date: new Date().toLocaleDateString(),
                        userId: session.user.id
                    };

                    const orders = JSON.parse(localStorage.getItem('swastik_orders') || '[]');
                    orders.unshift(newOrder);
                    localStorage.setItem('swastik_orders', JSON.stringify(orders));

                    clearCart();
                    router.push('/profile');
                },
                prefill: {
                    name: session.user.name,
                    email: session.user.email,
                    contact: "9999999999"
                },
                theme: {
                    color: "#0D8ABC"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (err) {
            console.error(err);
            alert("Something went wrong: " + err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (cart.length === 0) {
        return (
            <>
                <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
                <main className="container" style={{ marginTop: '100px', textAlign: 'center' }}>
                    <h2>Your cart is empty</h2>
                    <button className="btn btn-primary" onClick={() => router.push('/shop')} style={{ marginTop: '20px' }}>Go to Shop</button>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <main className="container" style={{ marginTop: '100px', paddingBottom: '60px', maxWidth: '800px' }}>
                <h2 style={{ marginBottom: '24px' }}>Checkout</h2>

                <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                    <form onSubmit={handleOrderSubmit}>
                        <h3 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Shipping Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <input type="text" placeholder="Full Name" required style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} />
                            <input type="tel" placeholder="Phone Number" required style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} />
                        </div>
                        <input type="text" placeholder="Address" required style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px' }} />

                        {hasRxItems && (
                            <div style={{ background: '#FFF3E0', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #FFE0B2' }}>
                                <h4 style={{ color: '#F57C00', marginBottom: '10px' }}><i className="fa-solid fa-file-medical"></i> Prescription Required</h4>
                                <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Some items in your cart require a doctor's prescription.</p>
                                <input type="file" required style={{ background: 'white', padding: '10px', borderRadius: '8px', width: '100%' }} />
                            </div>
                        )}

                        <h3 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: '30px' }}>Payment Method</h3>
                        <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {/* Option 1: Razorpay */}
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: `1px solid ${paymentMethod === 'ONLINE' ? 'var(--primary)' : '#ddd'}`, borderRadius: '8px', background: 'var(--secondary)', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="ONLINE"
                                    checked={paymentMethod === 'ONLINE'}
                                    onChange={() => setPaymentMethod('ONLINE')}
                                />
                                <div>
                                    <strong>Razorpay Secure Payment</strong>
                                    <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>UPI, Cards, Netbanking, Wallets</div>
                                </div>
                            </label>

                            {/* Option 2: Cash on Delivery */}
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: `1px solid ${paymentMethod === 'COD' ? 'var(--primary)' : '#ddd'}`, borderRadius: '8px', background: 'var(--secondary)', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="COD"
                                    checked={paymentMethod === 'COD'}
                                    onChange={() => setPaymentMethod('COD')}
                                />
                                <div>
                                    <strong>Cash on Delivery (COD)</strong>
                                    <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>Pay cash upon delivery. Verify with Secret Code via SMS.</div>
                                </div>
                            </label>
                        </div>

                        <div className="order-summary" style={{ background: 'var(--bg-light)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'spaceBetween', fontWeight: 700, fontSize: '1.2rem' }}>
                                <span>Total to Pay</span>
                                <span>₹{cartTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary full-width" disabled={isProcessing} style={{ width: '100%' }}>
                            {isProcessing ? 'Processing...' : (paymentMethod === 'COD' ? 'Place Order with Cash' : 'Pay Now')}
                        </button>
                    </form>
                </div>
            </main>
        </>
    );
}
