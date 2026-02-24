"use client";
import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DeliveryDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { cartCount, toggleCart } = useCart();

    const [agent, setAgent] = useState(null);
    const [activeOrder, setActiveOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusUpdating, setStatusUpdating] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push('/login');
        } else if (session?.user?.role !== "DELIVERY") {
            router.push('/');
        } else {
            fetchDashboardData();
        }
    }, [session, status]);

    // Live Foreground GPS Polling Engine (Triggered only when ON-DUTY)
    useEffect(() => {
        let watchId = null;

        if (agent?.isOnline && "geolocation" in navigator) {
            console.log("Starting Live GPS Tracking...");
            watchId = navigator.geolocation.watchPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    // Silently post the driver's new coordinates back to the Prisma Table
                    try {
                        await fetch('/api/agent/status', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ isOnline: true, lat, lng })
                        });
                    } catch (error) {
                        console.error("Silent GPS Sync Failed", error);
                    }
                },
                (error) => {
                    console.error("GPS Watch Error:", error);
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 5000,
                    timeout: 10000
                }
            );
        }

        return () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                console.log("Stopped Live GPS Tracking.");
            }
        };
    }, [agent?.isOnline]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [statusRes, ordersRes] = await Promise.all([
                fetch('/api/agent/status'),
                fetch('/api/agent/orders')
            ]);

            const statusData = await statusRes.json();
            const ordersData = await ordersRes.json();

            if (statusData.success) setAgent(statusData.agent);
            if (ordersData.success) setActiveOrder(ordersData.activeDelivery);
        } catch (error) {
            console.error("Failed to load generic dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async () => {
        setStatusUpdating(true);
        let currentLat = agent.lat;
        let currentLng = agent.lng;

        // If toggling ON, grab fresh GPS coordinates
        if (!agent.isOnline) {
            if ("geolocation" in navigator) {
                try {
                    const position = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject);
                    });
                    currentLat = position.coords.latitude;
                    currentLng = position.coords.longitude;
                } catch (err) {
                    alert("⚠️ You must allow GPS access to go ON-DUTY.");
                    setStatusUpdating(false);
                    return;
                }
            } else {
                alert("Geolocation is not supported by your browser");
                setStatusUpdating(false);
                return;
            }
        }

        try {
            const res = await fetch('/api/agent/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isOnline: !agent.isOnline,
                    lat: currentLat,
                    lng: currentLng
                })
            });
            const data = await res.json();
            if (data.success) {
                setAgent(data.agent);
            }
        } catch (error) {
            alert("Error updating duty status.");
        } finally {
            setStatusUpdating(false);
        }
    };

    const updateOrderStatus = async (newStatus) => {
        try {
            const res = await fetch('/api/agent/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: activeOrder.id, newStatus })
            });
            const data = await res.json();

            if (data.success) {
                alert(data.message || `Order successfully updated to ${newStatus}`);
                fetchDashboardData(); // Refresh to see ₹50 wallet bump or clear active order
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert("Error updating target delivery status.");
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading Rider Console...</div>;

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            <div className="container" style={{ marginTop: '100px', padding: '0 15px', maxWidth: '800px' }}>

                {/* Header Profile & Wallet Card */}
                <div style={{ background: '#1B5E20', color: 'white', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <h2 style={{ margin: 0 }}>Driver Dashboard</h2>
                        <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Vehicle: {agent?.vehicleNumber}</p>
                    </div>
                    <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px' }}>
                        <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem' }}>Wallet Earnings</p>
                        <h2 style={{ margin: 0, color: '#4CAF50' }}>₹{agent?.walletBalance?.toFixed(2)}</h2>
                    </div>
                </div>

                {/* Duty Toggle Panel */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginTop: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>Current Status</h3>
                        {agent?.isOnline ? (
                            <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>🟢 ON-DUTY (Receiving Orders)</span>
                        ) : (
                            <span style={{ color: '#F44336', fontWeight: 'bold' }}>🔴 OFF-DUTY</span>
                        )}
                    </div>
                    <button
                        onClick={toggleStatus}
                        disabled={statusUpdating || activeOrder} // Cannot go offline if order is pending
                        style={{
                            background: agent?.isOnline ? '#F44336' : '#4CAF50',
                            color: 'white', border: 'none', padding: '10px 20px', borderRadius: '50px',
                            cursor: (statusUpdating || activeOrder) ? 'not-allowed' : 'pointer', fontWeight: 'bold'
                        }}>
                        {statusUpdating ? "Syncing..." : (agent?.isOnline ? "Go Offline" : "Go Online")}
                    </button>
                </div>

                {/* Active Assignment Widget */}
                <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Current Assignment</h3>
                {activeOrder ? (
                    <div style={{ background: '#FFF3E0', padding: '20px', borderRadius: '12px', border: '1px solid #FFE0B2' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <span style={{ background: '#FF9800', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                {activeOrder.status === 'Agent_Assigned' ? "NEW PICKUP" : "OUT FOR DELIVERY"}
                            </span>
                            <strong>#{activeOrder.id.slice(-6).toUpperCase()}</strong>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {/* Pickup Info */}
                            <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                                <p style={{ color: '#757575', fontSize: '0.85rem', margin: '0 0 5px 0' }}><i className="fa-solid fa-store"></i> 1. PICKUP</p>
                                <h4 style={{ margin: 0, color: '#333' }}>{activeOrder.assignedRetailer.shopName}</h4>
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>{activeOrder.assignedRetailer.address}</p>
                                <a href={`tel:${activeOrder.assignedRetailer.phone}`} style={{ display: 'inline-block', marginTop: '10px', color: '#1976D2', fontSize: '0.9rem', fontWeight: 'bold', textDecoration: 'none' }}>
                                    <i className="fa-solid fa-phone"></i> Call Pharmacy
                                </a>
                            </div>

                            {/* Dropoff Info */}
                            <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                                <p style={{ color: '#757575', fontSize: '0.85rem', margin: '0 0 5px 0' }}><i className="fa-solid fa-house"></i> 2. DROPOFF</p>
                                <h4 style={{ margin: 0, color: '#333' }}>{activeOrder.guestName || activeOrder.user?.name}</h4>
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>{activeOrder.address}</p>
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#666' }}>Payment: {activeOrder.paymentMethod === 'COD' ? <strong style={{ color: '#D32F2F' }}>Collect ₹{activeOrder.total} Cash</strong> : <strong style={{ color: '#388E3C' }}>Paid Online ✅</strong>}</p>
                                <a href={`tel:${activeOrder.guestPhone || activeOrder.user?.phone}`} style={{ display: 'inline-block', marginTop: '10px', color: '#1976D2', fontSize: '0.9rem', fontWeight: 'bold', textDecoration: 'none' }}>
                                    <i className="fa-solid fa-phone"></i> Call Customer
                                </a>
                            </div>

                            {/* Action Buttons */}
                            {activeOrder.status === 'Agent_Assigned' ? (
                                <button onClick={() => updateOrderStatus('Picked_Up')} style={{ background: '#1565C0', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                    Confirm Package Picked Up
                                </button>
                            ) : (
                                <button onClick={() => updateOrderStatus('Delivered')} style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                    Swipe to Mark Delivered (Earn ₹50)
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ background: '#f5f5f5', padding: '40px 20px', borderRadius: '12px', textAlign: 'center', color: '#757575' }}>
                        <i className="fa-solid fa-box-open" style={{ fontSize: '3rem', marginBottom: '15px', opacity: 0.5 }}></i>
                        <p style={{ margin: 0, fontSize: '1.1rem' }}>{agent?.isOnline ? "Waiting for new deliveries nearby... Keep your GPS on." : "You are currently offline. Go ON-DUTY to receive orders."}</p>
                    </div>
                )}
            </div>
            <div style={{ marginBottom: '100px' }}></div>
        </>
    );
}
