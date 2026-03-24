"use client";
import { useState } from "react";

export default function RazorpayPayment({ amount = 1, type = "unlock", targetId = "", onSuccess = () => {} }) {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);

        try {
            // 1. Create Order
            const res = await fetch("/api/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount, receipt: `rcpt_${type}_${targetId}_${Date.now()}` }),
            });

            const order = await res.json();
            if (order.error) throw new Error(order.error);

            // 2. Open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
                amount: order.amount,
                currency: order.currency,
                name: "Swastik Medicare",
                description: `Payment for ${type.replace('_', ' ')}`,
                order_id: order.id,
                handler: async function (response) {
                    // 3. Verify Payment
                    const verifyRes = await fetch("/api/verify-payment", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            orderCreationId: order.id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            amount: amount,
                            orderType: type.toUpperCase(),
                            targetId: targetId,
                            targetType: targetId.startsWith('doc') ? 'doctor' : (targetId.startsWith('hosp') ? 'hospital' : 'retailer')
                        }),
                    });

                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                        alert("Payment Successful!");
                        onSuccess(verifyData);
                        window.location.reload();
                    } else {
                        alert("Verification Failed: " + verifyData.error);
                    }
                },
                theme: { color: "#4338ca" }, // Premium Blue
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error("Payment Process Error:", error);
            alert("Payment failed: " + error.message);
        }
        setLoading(false);
    };

    return (
        <button 
            onClick={handlePayment} 
            disabled={loading}
            style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
                color: 'white',
                fontWeight: 'bold',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
        >
            {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-spinner fa-spin"></i> Processing...
                </span>
            ) : (
                <>
                    <i className="fa-solid fa-shield-halved" style={{ marginRight: '8px' }}></i>
                    Pay & Continue
                </>
            )}
        </button>
    );
}
