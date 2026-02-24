"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Checkout() {
    const { cart, cartTotal, clearCart, toggleCart, cartCount } = useCart();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('ONLINE');
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [location, setLocation] = useState(null);
    const [gettingLocation, setGettingLocation] = useState(false);
    const { data: session } = useSession();

    // Coupon Handler
    const applyCoupon = () => {
        if (couponCode === 'FIRST100') {
            if (!session) {
                alert("Please Login to use this coupon.");
                setDiscount(0);
                return;
            }
            // In real app, verify with API. Here we assume validation happens on submit too.
            // But we should probably check if user has orders? 
            // For UI feedback, let's just apply it. Backend will reject if invalid.
            if (cartTotal > 100) {
                setDiscount(100);
            } else {
                alert("Cart value must be above ₹100");
                setDiscount(0);
            }
        } else {
            alert("Invalid Coupon Code");
            setDiscount(0);
        }
    };

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    // Load user data if logged in
    useEffect(() => {
        if (session?.user) {
            setFormData(prev => ({
                ...prev,
                name: session.user.name || '',
                email: session.user.email || ''
            }));
        }
    }, [session]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGetLocation = () => {
        setGettingLocation(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setGettingLocation(false);
                    // Minimal alert so it isn't annoying, or just rely on the button state change
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert("Could not get your location. Please check browser permissions.");
                    setGettingLocation(false);
                }
            );
        } else {
            alert("Geolocation is not supported by your browser");
            setGettingLocation(false);
        }
    };

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

        // VALIDATION
        if (!formData.name || !formData.phone || !formData.address) {
            alert("Please fill in all required shipping details.");
            return;
        }

        setIsProcessing(true);

        // --- HANDLE COD ---
        if (paymentMethod === 'COD') {
            try {
                const res = await fetch('/api/create-cod-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: cartTotal - discount,
                        couponCode: discount > 0 ? couponCode : null,
                        items: cart,
                        guestName: formData.name,
                        guestEmail: formData.email,
                        guestPhone: formData.phone,
                        address: formData.address,
                        lat: location?.lat,
                        lng: location?.lng
                    }),
                });

                const data = await res.json();

                if (data.success) {
                    alert(`Order Placed Successfully! \n\nYour Secret Delivery Code is: ${data.deliveryCode}\n\nPlease save this code. You will need it to receive your delivery.`);
                    clearCart();
                    // If guest, maybe redirect to home or a thank you page. If user, profile.
                    router.push(session ? '/profile' : '/');
                } else {
                    alert(data.error || "Failed to place COD order");
                }
            } catch (err) {
                console.error(err);
                alert("Something went wrong with COD order.");
            } finally {
                setIsProcessing(false);
            }
            return;
        }

        // --- HANDLE QR SCAN ---
        if (paymentMethod === 'QR') {
            try {
                // We use the COD API structure but will mark it differently on backend if needed.
                // For now, simpler to treat as "Manual Order" similar to COD but with a note.
                const res = await fetch('/api/create-cod-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: cartTotal - discount,
                        couponCode: discount > 0 ? couponCode : null,
                        items: cart,
                        guestName: formData.name,
                        guestEmail: formData.email,
                        guestPhone: formData.phone,
                        address: formData.address,
                        paymentMethod: 'QR_SCAN',
                        lat: location?.lat,
                        lng: location?.lng
                    }),
                });

                const data = await res.json();

                if (data.success) {
                    alert(`Order Placed! \n\nPlease ensure you have paid ₹${(cartTotal - discount).toFixed(2)} to the QR Code.\nYour Order ID: ${data.deliveryCode} (Use this as reference).`);
                    clearCart();
                    router.push(session ? '/profile' : '/');
                } else {
                    alert(data.error || "Failed to place order");
                }
            } catch (err) {
                console.error(err);
                alert("Something went wrong with QR order.");
            } finally {
                setIsProcessing(false);
            }
            return;
        }

        // --- HANDLE RAZORPAY ---
        if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
            alert("Error: NEXT_PUBLIC_RAZORPAY_KEY_ID is missing. Please add it to Vercel and Redeploy.");
            setIsProcessing(false);
            return;
        }

        const res = await loadRazorpay();
        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            setIsProcessing(false);
            return;
        }

        try {
            // Note: create-order API (Razorpay) might still need updates to handle guests if you want Razorpay for guests too.
            // For now, let's assume Razorpay requires login or strictly follows logic:
            // Login check removed for Guest Checkout

            // ... (Existing Razorpay Logic - Assuming it uses session)
            const orderRes = await fetch('/api/create-order', {
                method: 'POST',
                body: JSON.stringify({
                    amount: cartTotal - discount,
                    couponCode: discount > 0 ? couponCode : null
                }),
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
                    try {
                        const verifyRes = await fetch('/api/verify-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                orderCreationId: orderData.id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                                razorpaySignature: response.razorpay_signature,
                                amount: cartTotal - discount,
                                items: cart,
                                address: formData.address,
                                guestName: formData.name,
                                guestEmail: formData.email,
                                guestPhone: formData.phone,
                                couponCode: discount > 0 ? couponCode : null,
                                lat: location?.lat,
                                lng: location?.lng
                            })
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyData.success) {
                            // Success Handler
                            const newOrder = {
                                id: verifyData.orderId || orderData.id,
                                total: cartTotal,
                                items: [...cart],
                                status: 'Processing',
                                date: new Date().toLocaleDateString(),
                                userId: session?.user?.id
                            };

                            const orders = JSON.parse(localStorage.getItem('swastik_orders') || '[]');
                            orders.unshift(newOrder);
                            localStorage.setItem('swastik_orders', JSON.stringify(orders));

                            clearCart();
                            alert("Payment Successful! Order Placed.");
                            router.push(session ? '/profile' : '/');
                        } else {
                            alert("Payment Verification Failed: " + verifyData.error);
                        }
                    } catch (err) {
                        console.error(err);
                        alert("Verification Error: " + err.message);
                    }
                },
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone
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
                <h2 style={{ marginBottom: '24px' }}>Checkout {session ? '' : '(Guest)'}</h2>

                <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                    <form onSubmit={handleOrderSubmit}>
                        <h3 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Shipping Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email (Optional)"
                                value={formData.email}
                                onChange={handleInputChange}
                                style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Phone Number"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                            />
                        </div>
                        <input
                            type="text"
                            name="address"
                            placeholder="Full Address (House, Street, City, Pincode)"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px' }}
                        />

                        {hasRxItems && (
                            <div style={{ background: '#FFF3E0', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #FFE0B2' }}>
                                <h4 style={{ color: '#F57C00', marginBottom: '10px' }}><i className="fa-solid fa-file-medical"></i> Prescription Required</h4>
                                <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Some items in your cart require a doctor's prescription.</p>
                                <input type="file" required style={{ background: 'white', padding: '10px', borderRadius: '8px', width: '100%' }} />
                            </div>
                        )}

                        <div style={{ background: '#E3F2FD', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                                <h4 style={{ color: '#1565C0', margin: '0 0 5px 0' }}><i className="fa-solid fa-location-dot"></i> Fast Delivery Routing</h4>
                                <p style={{ fontSize: '0.85rem', margin: 0, color: '#333' }}>Share your live location to auto-assign your order to the nearest pharmacy.</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleGetLocation}
                                disabled={gettingLocation || location}
                                style={{ background: location ? '#4CAF50' : '#1976D2', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' }}>
                                {location ? "Location Captured ✓" : (gettingLocation ? "Locating..." : "Get Live Location")}
                            </button>
                        </div>

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

                            {/* Option 3: PhonePe QR */}
                            <label style={{ display: 'flex', alignItems: 'start', gap: '10px', padding: '15px', border: `1px solid ${paymentMethod === 'QR' ? 'var(--primary)' : '#ddd'}`, borderRadius: '8px', background: 'var(--secondary)', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="QR"
                                    checked={paymentMethod === 'QR'}
                                    onChange={() => setPaymentMethod('QR')}
                                    style={{ marginTop: '5px' }}
                                />
                                <div>
                                    <strong>Scan & Pay (PhonePe)</strong>
                                    <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>Scan the QR code to pay instantly.</div>
                                    {paymentMethod === 'QR' && (
                                        <div style={{ marginTop: '15px', textAlign: 'center' }}>
                                            <img src="/phonepe-qr.jpg" alt="PhonePe QR" style={{ width: '200px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>Scan with any UPI App</p>
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>

                        <div className="order-summary" style={{ background: 'var(--bg-light)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                            {/* Coupon Section */}
                            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    placeholder="Coupon Code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                                <button type="button" onClick={applyCoupon} style={{ padding: '0 20px', background: '#333', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                    Apply
                                </button>
                            </div>
                            {discount > 0 && (
                                <div style={{ color: 'green', fontSize: '0.9rem', marginBottom: '10px' }}>
                                    Coupon Applied! You saved ₹{discount}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span>Subtotal</span>
                                <span>₹{cartTotal.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'green' }}>
                                    <span>Discount</span>
                                    <span>- ₹{discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.2rem', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                                <span>Total to Pay</span>
                                <span>₹{(cartTotal - discount).toFixed(2)}</span>
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
