"use client";
import { useState, useEffect, useRef } from 'react';
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProviderWallet from "@/components/wallet/ProviderWallet";

export default function DeliveryDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { cartCount, toggleCart } = useCart();

    const [agent, setAgent] = useState(null);
    const [activeOrder, setActiveOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusUpdating, setStatusUpdating] = useState(false);
    // --- Phase 2: Delivery Photo State ---
    const [photoBase64, setPhotoBase64] = useState(null);
    const photoInputRef = useRef(null);

    // --- Onboarding Popup State ---
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push('/login');
        } else if (session?.user?.role !== "DELIVERY") {
            router.push('/');
        } else {
            fetchDashboardData();
            // Check if they have watched the onboarding video
            if (!localStorage.getItem('deliveryOnboardingWatched')) {
                setShowOnboarding(true);
            }
        }
    }, [session, status]);

    const handleCloseOnboarding = () => {
        localStorage.setItem('deliveryOnboardingWatched', 'true');
        setShowOnboarding(false);
    };

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
        if (newStatus === 'Delivered' && !photoBase64) {
            alert("⚠️ Please capture a photo of the delivered package at the door first!");
            return;
        }

        try {
            const res = await fetch('/api/agent/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: activeOrder.id,
                    newStatus,
                    deliveryProofBase64: photoBase64 // Append to payload
                })
            });
            const data = await res.json();

            if (data.success) {
                alert(data.message || `Order successfully updated to ${newStatus}`);
                setPhotoBase64(null); // Clear camera cache
                fetchDashboardData();
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert("Error updating target delivery status.");
        }
    };

    const handlePhotoCapture = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPhotoBase64(reader.result);
            reader.readAsDataURL(file);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading Rider Console...</div>;

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            <div className="container" style={{ marginTop: '100px', padding: '0 15px', maxWidth: '800px' }}>

                {agent && !agent.verified && (
                    <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', padding: '20px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ fontSize: '2rem', color: '#EA580C' }}>
                            <i className="fa-solid fa-clock-rotate-left"></i>
                        </div>
                        <div>
                            <h3 style={{ margin: 0, color: '#9A3412' }}>Verification Pending</h3>
                            <p style={{ margin: '5px 0 0 0', color: '#C2410C', fontSize: '0.9rem' }}>
                                Your identity documents are currently being reviewed by our team. You will be able to start taking orders once your account is verified.
                            </p>
                        </div>
                    </div>
                )}

                {/* Header Profile */}
                <div style={{ background: '#1B5E20', color: 'white', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <h2 style={{ margin: 0 }}>Driver Dashboard</h2>
                        <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Vehicle: {agent?.vehicleNumber}</p>
                    </div>
                </div>

                {/* Earnings & Wallet Module */}
                <div className="mt-6">
                    <ProviderWallet />
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
                        disabled={statusUpdating || activeOrder || !agent?.verified} // Cannot go offline if order is pending OR not verified
                        style={{
                            background: !agent?.verified ? '#ccc' : (agent?.isOnline ? '#F44336' : '#4CAF50'),
                            color: 'white', border: 'none', padding: '10px 20px', borderRadius: '50px',
                            cursor: (statusUpdating || activeOrder || !agent?.verified) ? 'not-allowed' : 'pointer', fontWeight: 'bold'
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
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div style={{ border: '2px dashed #9CA3AF', padding: '20px', borderRadius: '8px', textAlign: 'center', background: '#F9FAFB' }}>
                                        {photoBase64 ? (
                                            <div>
                                                <img src={photoBase64} alt="Delivery Proof" style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} />
                                                <button onClick={() => setPhotoBase64(null)} style={{ background: '#EF4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                                    <i className="fa-solid fa-rotate-right"></i> Retake Photo
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                <i className="fa-solid fa-camera" style={{ fontSize: '3rem', color: '#6B7280', marginBottom: '10px' }}></i>
                                                <p style={{ margin: '0 0 15px 0', color: '#4B5563', fontWeight: 'bold' }}>Photo Proof Required</p>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    capture="environment"
                                                    ref={photoInputRef}
                                                    onChange={handlePhotoCapture}
                                                    style={{ display: 'none' }}
                                                />
                                                <button onClick={() => photoInputRef.current.click()} style={{ background: '#1F2937', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                                    Open Camera
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => updateOrderStatus('Delivered')}
                                        disabled={!photoBase64}
                                        style={{ background: photoBase64 ? '#4CAF50' : '#D1D5DB', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', cursor: photoBase64 ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center' }}>
                                        <span>Swipe to Mark Delivered</span>
                                        {photoBase64 && <span style={{ background: '#2E7D32', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem' }}>Earn ₹50</span>}
                                    </button>
                                </div>
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

            {/* --- Onboarding Video Popup --- */}
            {showOnboarding && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(5px)' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', animation: 'slideUp 0.4s ease-out' }}>

                        {/* Video Header Area */}
                        <div style={{ background: '#1e293b', padding: '20px', color: 'white', textAlign: 'center' }}>
                            <div style={{ background: '#10b981', display: 'inline-block', padding: '8px 16px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px' }}>
                                NEW RIDER TRAINING
                            </div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Start Earning as a Delivery Partner</h2>
                        </div>

                        {/* Video Embed */}
                        <div style={{ width: '100%', aspectRatio: '16/9', background: '#0f172a', position: 'relative' }}>
                            <iframe
                                width="100%"
                                height="100%"
                                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1" // Placeholder Training Video
                                title="Swastik Delivery Training"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{ position: 'absolute', top: 0, left: 0 }}
                            ></iframe>
                        </div>

                        {/* Earning Info */}
                        <div style={{ padding: '25px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                <div style={{ background: '#ecfdf5', border: '1px solid #10b981', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                                    <div style={{ color: '#047857', fontSize: '1.5rem', marginBottom: '5px' }}><i className="fa-solid fa-wallet"></i></div>
                                    <h3 style={{ margin: 0, color: '#065f46', fontSize: '1.2rem' }}>₹800 - ₹1200</h3>
                                    <p style={{ margin: 0, color: '#059669', fontSize: '0.8rem', fontWeight: 'bold' }}>Est. Daily Earning</p>
                                </div>
                                <div style={{ background: '#eff6ff', border: '1px solid #3b82f6', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                                    <div style={{ color: '#1d4ed8', fontSize: '1.5rem', marginBottom: '5px' }}><i className="fa-solid fa-users"></i></div>
                                    <h3 style={{ margin: 0, color: '#1e40af', fontSize: '1.2rem' }}>₹50 Bonus</h3>
                                    <p style={{ margin: 0, color: '#2563eb', fontSize: '0.8rem', fontWeight: 'bold' }}>Per Referred Rider</p>
                                </div>
                            </div>

                            <ul style={{ margin: '0 0 25px 0', padding: '0 0 0 20px', color: '#475569', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                <li><strong>Always</strong> verify the package before picking it up.</li>
                                <li><strong>Never</strong> ask for cash on prepaid <strong>(✅)</strong> orders.</li>
                                <li><strong>Upload</strong> a clear photo of the package at the door.</li>
                            </ul>

                            <button onClick={handleCloseOnboarding} style={{ width: '100%', background: '#10b981', color: 'white', border: 'none', padding: '18px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4)' }}>
                                <i className="fa-solid fa-circle-play"></i> Watch Training & Start Delivering
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
