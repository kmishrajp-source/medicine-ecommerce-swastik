"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const TrackingMap = dynamic(() => import("@/components/CustomerTrackingMap"), { ssr: false });

const STATUS_STEPS = [
    { key: "Received", label: "Order Placed" },
    { key: "Pharmacist_Approved", label: "Order Confirmed" },
    { key: "Ready_for_Packing", label: "Pharmacy Preparing" },
    { key: "Out_for_Delivery", label: "On the way" },
    { key: "Delivered", label: "Delivered" }
];

export default function CustomerTrackingPage({ params }) {
    const orderId = params?.orderId;
    const [tracking, setTracking] = useState(null);
    const [loading, setLoading] = useState(true);
    const intervalRef = useRef(null);

    // Form states
    const [instructions, setInstructions] = useState("");
    const [savingInstructions, setSavingInstructions] = useState(false);
    const [tip, setTip] = useState(0);
    const [savingTip, setSavingTip] = useState(false);

    const fetchTracking = useCallback(async () => {
        if (!orderId) return;
        try {
            const res = await fetch(`/api/rider/location?orderId=${orderId}`);
            const data = await res.json();
            if (data.success) {
                setTracking(data);
                if (data.deliveryInstructions && !instructions) setInstructions(data.deliveryInstructions);
                if (data.tipAmount && tip === 0) setTip(data.tipAmount);
            }
        } catch (e) {
            console.error("Tracking fetch error:", e);
        } finally {
            setLoading(false);
        }
    }, [orderId]); // remove dependencies that cause reset

    useEffect(() => {
        fetchTracking();
        // Polling every 5 seconds for live tracking updates
        intervalRef.current = setInterval(fetchTracking, 5000);
        return () => clearInterval(intervalRef.current);
    }, [fetchTracking]);

    const handleSaveInstructions = async () => {
        if (!instructions.trim()) return;
        setSavingInstructions(true);
        try {
            const res = await fetch(`/api/orders/tracking/${orderId}/instructions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ instructions })
            });
            const data = await res.json();
            if (data.success) alert("Instructions saved!");
            else alert("Failed to save instructions.");
        } catch(e) {
            alert("Error saving instructions.");
        }
        setSavingInstructions(false);
    };

    const handleTip = async (amount) => {
        setSavingTip(true);
        try {
            const res = await fetch(`/api/orders/tracking/${orderId}/tip`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            });
            const data = await res.json();
            if (data.success) {
                setTip(amount);
                alert(`₹${amount} tip added!`);
            }
        } catch(e) {
            alert("Failed to add tip.");
        }
        setSavingTip(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading your tracking details...</p>
            </div>
        );
    }

    if (!tracking) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
                <div className="text-4xl mb-4">❌</div>
                <h2 className="text-xl font-bold text-gray-800">Order not found</h2>
                <p className="text-gray-500 mt-2">We couldn't load tracking information for this order.</p>
                <Link href="/" className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-md">
                    Return to Home
                </Link>
            </div>
        );
    }

    const currentStepIndex = STATUS_STEPS.findIndex(s => tracking.orderStatus?.toLowerCase().includes(s.key.toLowerCase()));
    const isOutForDelivery = tracking.orderStatus === "Out_for_Delivery";
    const isDelivered = tracking.orderStatus === "Delivered";

    // Dynamic Header text
    let headerTitle = "Order Placed";
    if (isDelivered) headerTitle = "Order Delivered";
    else if (isOutForDelivery) {
        headerTitle = tracking.etaMinutes !== null 
            ? `Arriving in ${tracking.etaMinutes} minutes` 
            : "Order is on the way";
    } else if (currentStepIndex >= 2) headerTitle = "Pharmacy Preparing";
    else if (currentStepIndex === 1) headerTitle = "Order Confirmed";

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-800">
            
            {/* Top Fixed Header */}
            <div className="bg-white shadow-sm sticky top-0 z-50 p-4 flex items-center gap-3">
                <Link href="/" className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-600">
                    ←
                </Link>
                <div>
                    <h1 className="font-bold text-lg leading-tight">{headerTitle}</h1>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Order #{orderId.slice(-8)}
                    </p>
                </div>
            </div>

            <div className="max-w-md mx-auto w-full">
                
                {/* Live Map Area */}
                {isOutForDelivery && tracking.riderLat && tracking.riderLng && (
                    <div className="h-64 w-full bg-gray-200 relative overflow-hidden">
                        <TrackingMap
                            riderLat={tracking.riderLat}
                            riderLng={tracking.riderLng}
                            riderHeading={tracking.riderHeading}
                            customerLat={tracking.customerLat}
                            customerLng={tracking.customerLng}
                            retailerLat={tracking.retailerLat}
                            retailerLng={tracking.retailerLng}
                        />
                        <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-full shadow-lg text-xs font-bold text-green-600 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            LIVE
                        </div>
                    </div>
                )}

                {/* Delivered state graphic */}
                {isDelivered && (
                    <div className="bg-green-50 p-8 text-center border-b border-green-100">
                        <div className="text-5xl mb-4">🎉</div>
                        <h2 className="text-2xl font-black text-green-700">Delivered!</h2>
                        <p className="text-green-600 font-medium mt-1">Thank you for choosing Swastik Medicare.</p>
                    </div>
                )}

                <div className="p-4 space-y-4">

                    {/* Timeline */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4">Delivery Status</h3>
                        <div className="relative border-l-2 border-gray-100 ml-3 space-y-6">
                            {STATUS_STEPS.map((step, idx) => {
                                const isActive = idx === currentStepIndex;
                                const isDone = idx <= currentStepIndex || isDelivered;
                                return (
                                    <div key={step.key} className="relative pl-6">
                                        <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white ${
                                            isDone ? 'border-green-500' : 'border-gray-200'
                                        }`}>
                                            {isDone && <div className="w-2 h-2 bg-green-500 rounded-full m-[2px]" />}
                                        </div>
                                        <div>
                                            <p className={`font-semibold text-sm ${isActive ? 'text-gray-900' : isDone ? 'text-gray-600' : 'text-gray-400'}`}>
                                                {step.label}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Delivery Partner */}
                    {(isOutForDelivery || isDelivered) && tracking.riderName && (
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl overflow-hidden shadow-inner">
                                    🏍️
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{tracking.riderName}</p>
                                    <p className="text-xs text-gray-500 font-medium">Your delivery partner</p>
                                </div>
                            </div>
                            {tracking.riderPhone && !isDelivered && (
                                <a href={`tel:${tracking.riderPhone}`} className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center transition-colors active:bg-green-200">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                </a>
                            )}
                        </div>
                    )}

                    {/* Delivery OTP */}
                    {tracking.deliveryCode && !isDelivered && (
                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Delivery OTP</p>
                            <p className="text-3xl font-black text-blue-900 tracking-widest">{tracking.deliveryCode}</p>
                            <p className="text-xs text-blue-700 mt-2">Share this with the rider to receive your order.</p>
                        </div>
                    )}

                    {/* Pharmacy Info */}
                    {tracking.retailerName && (
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center">
                                <div className="flex gap-3 items-center">
                                    <div className="text-2xl">🏪</div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">{tracking.retailerName}</p>
                                        <p className="text-xs text-gray-500 font-medium">
                                            {tracking.distancePharmacyToCustomerKm ? `${tracking.distancePharmacyToCustomerKm} km away` : 'Your local Swastik partner'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tip Section */}
                    {isOutForDelivery && (
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 text-sm mb-3">Say thanks with a tip</h3>
                            <div className="flex gap-2">
                                {[20, 30, 50].map((amt) => (
                                    <button
                                        key={amt}
                                        onClick={() => handleTip(amt)}
                                        disabled={savingTip || tip > 0}
                                        className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${
                                            tip === amt 
                                                ? 'bg-green-500 text-white shadow-md'
                                                : tip > 0 
                                                    ? 'bg-gray-50 text-gray-400 border border-gray-100'
                                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                                        }`}
                                    >
                                        ₹{amt}
                                    </button>
                                ))}
                            </div>
                            {tip > 0 && <p className="text-xs text-center text-green-600 font-bold mt-3">Thanks for tipping ₹{tip}!</p>}
                        </div>
                    )}

                    {/* Delivery Instructions */}
                    {!isDelivered && (
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 text-sm mb-2">Delivery Instructions</h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="e.g. Ring the bell, leave at door..."
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
                                />
                                <button
                                    onClick={handleSaveInstructions}
                                    disabled={savingInstructions}
                                    className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold active:scale-95 transition-transform"
                                >
                                    {savingInstructions ? '...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Order Details & Contact */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Delivery Address</p>
                            <p className="text-sm text-gray-800 font-medium">{tracking.address || 'Address hidden'}</p>
                        </div>
                        
                        <div className="h-px bg-gray-100"></div>

                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Customer Contact</p>
                            <p className="text-sm text-gray-800 font-medium">{tracking.customerName} · {tracking.customerPhone}</p>
                        </div>

                        {tracking.items && tracking.items.length > 0 && (
                            <>
                                <div className="h-px bg-gray-100"></div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Your Order</p>
                                    </div>
                                    <div className="space-y-2">
                                        {tracking.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="text-gray-700">{item.quantity}x {item.name || 'Medicine'}</span>
                                                <span className="font-medium text-gray-900">₹{item.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Support Button */}
                    <Link href="/support" className="block w-full bg-white border border-gray-200 text-center py-3 rounded-2xl font-bold text-sm text-gray-700 shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors">
                        Need Help? Chat with Support
                    </Link>

                </div>
            </div>
        </div>
    );
}
