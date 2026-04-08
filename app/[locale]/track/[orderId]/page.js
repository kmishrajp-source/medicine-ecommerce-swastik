"use client";
import { useEffect, useState, useRef } from 'react';
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";

export default function OrderTracking({ params }) {
    const { orderId } = params;
    const { cartCount, toggleCart } = useCart();

    const [order, setOrder] = useState(null);
    const [agentLocation, setAgentLocation] = useState(null);
    const [loading, setLoading] = useState(true);

    const mapRef = useRef(null);

    useEffect(() => {
        // Initial Fetch
        fetchOrderDetails();

        // Set up Live GPS Polling (Every 10 Seconds)
        const interval = setInterval(() => {
            fetchOrderDetails();
        }, 10000);

        return () => clearInterval(interval);
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const res = await fetch(`/api/orders/${orderId}/track`);
            const data = await res.json();
            if (data.success) {
                setOrder(data.order);
                if (data.agentLocation) {
                    setAgentLocation(data.agentLocation);
                }
            }
        } catch (error) {
            console.error("Tracking Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyIntegrity = async (status, notes = "") => {
        try {
            const res = await fetch('/api/orders/verify-integrity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status, notes })
            });
            const data = await res.json();
            if (data.success) {
                alert("Security check recorded. Thank you for verifying.");
                fetchOrderDetails();
            } else {
                alert("Error: " + data.error);
            }
        } catch (e) {
            console.error("Integrity check failed", e);
        }
    };

    if (loading) return <div className="text-center py-32"><i className="fa-solid fa-spinner fa-spin text-3xl text-blue-500"></i></div>;
    if (!order) return <div className="text-center py-32 text-red-500 font-bold">Order Not Found</div>;

    const getStatusBlock = () => {
        const statuses = ["Processing", "Pending_Retailer_Acceptance", "Preparing", "Agent_Assigned", "Out_For_Delivery", "Delivered"];
        const currentIndex = statuses.indexOf(order.status);

        return (
            <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mt-6 relative overflow-hidden">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Fulfillment Process</h3>
                <div className="flex flex-col space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">

                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${currentIndex >= 0 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                            <i className="fa-solid fa-receipt"></i>
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 shadow">
                            <div className="flex items-center justify-between mb-1">
                                <div className="font-bold text-slate-900">Order Placed</div>
                            </div>
                            <div className="text-slate-500 text-sm">We've received your medicine request and payment.</div>
                        </div>
                    </div>

                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${currentIndex >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                            <i className="fa-solid fa-box-open"></i>
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 shadow">
                            <div className="flex items-center justify-between mb-1">
                                <div className="font-bold text-slate-900">Pharmacy Preparing</div>
                            </div>
                            <div className="text-slate-500 text-sm">The nearest vendor ({order.assignedRetailer?.shopName || 'assigning...'}) is securely packing your items.</div>
                        </div>
                    </div>

                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${currentIndex >= 4 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                            <i className="fa-solid fa-motorcycle"></i>
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 shadow bg-blue-50 border-blue-100">
                            <div className="flex items-center justify-between mb-1">
                                <div className="font-bold text-blue-900">Out for Delivery</div>
                            </div>
                            <div className="text-blue-700 text-sm">
                                {order.isRetailerDelivering 
                                    ? `Pharmacy ${order.assignedRetailer?.shopName} is delivering your order.` 
                                    : order.deliveryAgent 
                                    ? `Agent ${order.deliveryAgent.user?.name} is on the way!` 
                                    : 'Assigning rider...'}
                            </div>
                        </div>
                    </div>

                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${currentIndex === 5 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                            <i className="fa-solid fa-house-chimney-medical"></i>
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 shadow">
                            <div className="flex items-center justify-between mb-1">
                                <div className="font-bold text-slate-900">Delivered</div>
                            </div>
                            <div className="text-slate-500 text-sm">Safely handed over to you.</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    };

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <div className="min-h-screen bg-gray-50 py-12 px-6 font-sans" style={{ marginTop: '70px' }}>
                <div className="max-w-5xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <p className="text-sm text-gray-500 tracking-wider uppercase font-bold">Live Tracking</p>
                            <h1 className="text-3xl font-extrabold text-gray-900">Order #{orderId.slice(-6).toUpperCase()}</h1>
                        </div>
                        <div className="bg-blue-100 text-blue-800 px-6 py-3 rounded-full font-bold text-lg flex items-center gap-3">
                            {order.status === 'Delivered' ? (
                                <><i className="fa-solid fa-circle-check text-green-500"></i> DELIVERED</>
                            ) : (
                                <><i className="fa-solid fa-satellite-dish animate-pulse"></i> {order.status.replace(/_/g, ' ')}</>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Map Section */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 relative h-[500px]">
                                {order.status === 'Delivered' ? (
                                    <div className="absolute inset-0 bg-green-50 flex flex-col items-center justify-center p-8 text-center text-green-800">
                                        <i className="fa-solid fa-box-check text-6xl mb-4"></i>
                                        <h2 className="text-2xl font-bold">Delivery Complete</h2>
                                        <p className="mt-2">Your package has arrived at its destination.</p>
                                    </div>
                                ) : agentLocation ? (
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        src={`https://maps.google.com/maps?q=${agentLocation.lat},${agentLocation.lng}&z=15&output=embed`}
                                    ></iframe>
                                ) : (
                                    <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center p-8 text-center text-gray-500">
                                        <i className="fa-solid fa-map-location-dot text-6xl mb-4 opacity-50"></i>
                                        <h2 className="text-xl font-bold">Waiting for Driver Location</h2>
                                        <p className="mt-2 text-sm max-w-sm">The live map will appear here as soon as a delivery agent is assigned and starts moving.</p>
                                    </div>
                                )}
                            </div>

                            {/* Tracking Milestones */}
                            {getStatusBlock()}

                            {/* Package Security & Code Verification */}
                            {(order.status === 'Ready_for_Pickup' || order.status === 'Agent_Assigned' || order.status === 'Out_For_Delivery' || order.status === 'Delivered') && (
                                <div className="mt-8 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-1 text-xs bg-blue-50 text-blue-400 font-bold uppercase tracking-widest rounded-bl-xl border-l border-b border-blue-100 px-4">Security Verification</div>
                                    <div className="flex flex-col md:flex-row gap-8 items-start">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                <i className="fa-solid fa-shield-halved text-blue-500"></i> Tamper-Evident Seal
                                            </h3>
                                            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                                                Your package is secured with a unique tamper-evident joint. Verify that the code on your physical package matches the one below.
                                            </p>

                                            <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                                                <span className="text-gray-400 text-xs font-bold uppercase block mb-1">Official Seal Code</span>
                                                <span className="text-3xl font-mono font-black text-slate-800 tracking-widest select-all">
                                                    {order.tamperSealCode || "PENDING"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex-1 w-full">
                                            {order.integrityStatus === 'PENDING' ? (
                                                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                                    <h4 className="font-bold text-blue-900 mb-4">How is the package?</h4>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        <button 
                                                            onClick={() => handleVerifyIntegrity("INTACT")}
                                                            className="w-full bg-white text-blue-600 border-2 border-blue-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                                            <i className="fa-solid fa-check-circle"></i> SEAL IS INTACT
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                const notes = prompt("Describe the damage/tampering found:");
                                                                if (notes) handleVerifyIntegrity("TAMPERED", notes);
                                                            }}
                                                            className="w-full bg-red-50 text-red-600 border-2 border-red-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all shadow-sm group">
                                                            <i className="fa-solid fa-triangle-exclamation animate-pulse"></i> BROKEN / TAMPERED
                                                        </button>
                                                    </div>
                                                    <p className="text-[10px] text-blue-400 mt-4 text-center italic">Package integrity affects liability and platform safety.</p>
                                                </div>
                                            ) : (
                                                <div className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center text-center ${order.integrityStatus === 'INTACT' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                                    <i className={`fa-solid ${order.integrityStatus === 'INTACT' ? 'fa-circle-check' : 'fa-circle-exclamation'} text-4xl mb-3`}></i>
                                                    <h4 className="font-bold text-lg">Integrated Verified: {order.integrityStatus}</h4>
                                                    <p className="text-sm opacity-80 mt-1">Verified at: {new Date(order.integrityCheckAt).toLocaleString()}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-4">Order Details</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Total Amount</span>
                                        <span className="font-bold text-gray-900">₹{order.total}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Payment</span>
                                        <span className={`font-bold ${order.isPaid ? 'text-green-600' : 'text-orange-600'}`}>
                                            {order.isPaid ? 'PAID ONLINE' : 'CASH ON DELIVERY'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Items</span>
                                        <span className="font-bold text-gray-900">{order.items?.length || 0} Units</span>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100">
                                        <span className="text-gray-500 block mb-1">Delivery Address</span>
                                        <span className="font-medium text-gray-800 leading-tight block">
                                            {order.address}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {order.isRetailerDelivering && order.status !== 'Delivered' && (
                                <div className="bg-green-600 text-white rounded-3xl p-6 shadow-lg border border-green-500">
                                    <h3 className="text-lg font-bold mb-4 opacity-90"><i className="fa-solid fa-store mr-2"></i> Self-Delivering Pharmacy</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-white text-green-600 rounded-full flex items-center justify-center text-xl shadow-inner font-bold">
                                            <i className="fa-solid fa-truck-ramp-box"></i>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-lg leading-tight">{order.assignedRetailer?.shopName}</p>
                                            <p className="text-green-100 text-xs mt-1">Direct from store for faster delivery</p>
                                        </div>
                                    </div>
                                    {order.assignedRetailer?.phone && (
                                        <a href={`tel:${order.assignedRetailer.phone}`} className="mt-6 w-full bg-white text-green-600 font-bold py-3 rounded-xl shadow transition-colors flex justify-center items-center gap-2 hover:bg-green-50">
                                            <i className="fa-solid fa-phone"></i> Contact Store
                                        </a>
                                    )}
                                </div>
                            )}

                            {!order.isRetailerDelivering && order.deliveryAgent && order.status !== 'Delivered' && (
                                <div className="bg-blue-600 text-white rounded-3xl p-6 shadow-lg border border-blue-500">
                                    <h3 className="text-lg font-bold mb-4 opacity-90"><i className="fa-solid fa-helmet-safety mr-2"></i> Your Agent</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-white text-blue-600 rounded-full flex items-center justify-center text-xl shadow-inner font-bold">
                                            {order.deliveryAgent.user?.name?.charAt(0) || 'D'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{order.deliveryAgent.user?.name}</p>
                                            <p className="text-blue-200 text-sm">{order.deliveryAgent.vehicleNumber}</p>
                                        </div>
                                    </div>
                                    {order.deliveryAgent.phone && (
                                        <a href={`tel:${order.deliveryAgent.phone}`} className="mt-6 w-full bg-white text-blue-600 font-bold py-3 rounded-xl shadow transition-colors flex justify-center items-center gap-2 hover:bg-blue-50">
                                            <i className="fa-solid fa-phone"></i> Call Agent
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
