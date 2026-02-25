"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

export default function RetailerDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [inventory, setInventory] = useState([]);
    const [newItem, setNewItem] = useState({ medicineName: "", stock: "", price: "", deliveryArea: "" });
    const [showInvForm, setShowInvForm] = useState(false);

    // --- Phase 1: Polling State ---
    const [pendingOrders, setPendingOrders] = useState([]);
    const [countdownTimer, setCountdownTimer] = useState(60);
    const [isResponding, setIsResponding] = useState(false);

    useEffect(() => {
        let pollingInterval;
        if (status === 'authenticated' && session?.user?.role === 'RETAILER') {
            fetchInventory();
            fetchPendingOrders(); // Initial fetch
            pollingInterval = setInterval(fetchPendingOrders, 10000); // Poll every 10 seconds
        }
        return () => clearInterval(pollingInterval);
    }, [status, session]);

    // Visually decay the countdown when there's an active order
    useEffect(() => {
        let timer;
        if (pendingOrders.length > 0 && countdownTimer > 0) {
            timer = setInterval(() => setCountdownTimer(prev => prev - 1), 1000);
        } else if (pendingOrders.length === 0) {
            setCountdownTimer(60); // Reset timer if no orders
        }
        return () => clearInterval(timer);
    }, [pendingOrders, countdownTimer]);

    const fetchPendingOrders = async () => {
        try {
            const res = await fetch('/api/retailer/orders');
            const data = await res.json();
            if (data.success && data.pendingOrders.length > 0) {
                // If a new order comes in, restart the local visual timer
                if (pendingOrders.length === 0 || pendingOrders[0].id !== data.pendingOrders[0].id) {
                    setCountdownTimer(60);
                }
                setPendingOrders(data.pendingOrders);
            } else {
                setPendingOrders([]);
            }
        } catch (e) { console.error("Polling error", e); }
    };

    const handleAcceptOrder = async (orderId) => {
        setIsResponding(true);
        try {
            const res = await fetch('/api/retailer/orders/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId })
            });
            const data = await res.json();
            if (data.success) {
                alert("Order Accepted! Please prepare the items. A driver is on the way.");
                setPendingOrders(prev => prev.filter(o => o.id !== orderId));
            } else {
                alert(data.error);
                fetchPendingOrders(); // Refresh state if it failed
            }
        } finally { setIsResponding(false); }
    };

    const handleRejectOrder = async (orderId) => {
        setIsResponding(true);
        try {
            const res = await fetch('/api/retailer/orders/reject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId })
            });
            const data = await res.json();
            if (data.success) {
                setPendingOrders(prev => prev.filter(o => o.id !== orderId));
            } else {
                alert(data.error);
            }
        } finally { setIsResponding(false); }
    };

    const fetchInventory = async () => {
        const res = await fetch('/api/retailer/inventory');
        const data = await res.json();
        if (data.success) setInventory(data.inventory);
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/retailer/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItem)
        });
        const data = await res.json();
        if (data.success) {
            alert("Item added successfully!");
            setNewItem({ medicineName: "", stock: "", price: "", deliveryArea: "" });
            setShowInvForm(false);
            fetchInventory();
        } else {
            alert("Failed to add item: " + data.error);
        }
    };

    if (status === 'loading') return <div>Loading...</div>;

    return (
        <>
            <Navbar cartCount={0} />
            <div className="container" style={{ marginTop: "100px", maxWidth: "1200px" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h2 style={{ marginBottom: '5px' }}>Pharmacy Partner Dashboard</h2>
                        <p style={{ color: '#666' }}>Welcome back, {session?.user?.name}</p>
                    </div>
                </div>

                {/* --- Incoming Order Polling Alert --- */}
                {pendingOrders.length > 0 && (
                    <div style={{ background: '#FFF7ED', border: '2px solid #F97316', padding: '30px', borderRadius: '16px', marginBottom: '40px', boxShadow: '0 10px 15px -3px rgba(249, 115, 22, 0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                                    <h2 style={{ color: '#C2410C', margin: 0 }}>🚨 New Incoming Order!</h2>
                                    <span style={{ background: countdownTimer < 15 ? '#DC2626' : '#EA580C', color: 'white', padding: '5px 15px', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <i className="fa-solid fa-clock"></i> 00:{countdownTimer < 10 ? `0${countdownTimer}` : countdownTimer}
                                    </span>
                                </div>
                                <p style={{ color: '#9A3412', fontSize: '1.1rem', margin: 0 }}>Accept quickly before it bypasses to the next pharmacy.</p>
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button
                                    onClick={() => handleRejectOrder(pendingOrders[0].id)}
                                    disabled={isResponding}
                                    style={{ background: 'transparent', color: '#DC2626', border: '2px solid #DC2626', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: isResponding ? 'not-allowed' : 'pointer' }}>
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleAcceptOrder(pendingOrders[0].id)}
                                    disabled={isResponding}
                                    style={{ background: '#16A34A', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem', cursor: isResponding ? 'not-allowed' : 'pointer', boxShadow: '0 4px 6px rgba(22, 163, 74, 0.3)' }}>
                                    {isResponding ? "Processing..." : "ACCEPT ORDER"}
                                </button>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #FED7AA' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Order Details #{pendingOrders[0].id.slice(-6).toUpperCase()}</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Customer</p>
                                    <p style={{ margin: 0, fontWeight: 'bold' }}>{pendingOrders[0].guestName || pendingOrders[0].user?.name} ({pendingOrders[0].guestPhone || pendingOrders[0].user?.phone})</p>
                                </div>
                                <div>
                                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Total Value</p>
                                    <p style={{ margin: 0, fontWeight: 'bold', color: '#16A34A', fontSize: '1.2rem' }}>₹{pendingOrders[0].total.toFixed(2)}</p>
                                </div>
                            </div>
                            <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem' }}>Items Requested:</p>
                                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                    {pendingOrders[0].items.map(item => (
                                        <li key={item.id}>
                                            <strong>{item.quantity}x</strong> {item.product.name} (₹{item.price})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "40px" }}>
                    {/* Card 1: View Orders */}
                    <div style={{ padding: "25px", border: "1px solid #e5e7eb", borderRadius: "16px", background: "#f0fdf4" }}>
                        <div style={{ fontSize: '2rem', color: '#16a34a', marginBottom: '10px' }}><i className="fa-solid fa-clipboard-list"></i></div>
                        <h3>Local Orders</h3>
                        <p style={{ color: '#666', marginBottom: '15px' }}>View orders in your area ({inventory.length > 0 ? 'Active' : 'Setup Required'}).</p>
                        <button style={{ padding: "8px 16px", background: "#16a34a", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                            View Orders
                        </button>
                    </div>

                    {/* Card 2: Request Stock */}
                    <div style={{ padding: "25px", border: "1px solid #e5e7eb", borderRadius: "16px", background: "#fff" }}>
                        <div style={{ fontSize: '2rem', color: '#333', marginBottom: '10px' }}><i className="fa-solid fa-boxes-stacked"></i></div>
                        <h3>Restock Inventory</h3>
                        <p style={{ color: '#666', marginBottom: '15px' }}>Order bulk medicines from Stockists.</p>
                        <button style={{ padding: "8px 16px", background: "#333", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                            Place Bulk Order
                        </button>
                    </div>

                    {/* Card 3: Profile */}
                    <div style={{ padding: "25px", border: "1px solid #e5e7eb", borderRadius: "16px", background: "#fff" }}>
                        <div style={{ fontSize: '2rem', color: '#333', marginBottom: '10px' }}><i className="fa-solid fa-shop"></i></div>
                        <h3>Shop Profile</h3>
                        <p style={{ color: '#666', marginBottom: '15px' }}>Update license and address details.</p>
                        <button style={{ padding: "8px 16px", background: "#333", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                            Edit Profile
                        </button>
                    </div>
                </div>

                {/* --- Inventory Section --- */}
                <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3>📦 My Inventory & Coverage</h3>
                        <button onClick={() => setShowInvForm(!showInvForm)} className="btn btn-primary" style={{ background: '#2563eb' }}>
                            {showInvForm ? 'Close Form' : '+ Add Medicine'}
                        </button>
                    </div>

                    {showInvForm && (
                        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ marginBottom: '15px' }}>Add New Stock</h4>
                            <form onSubmit={handleAddItem} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                <input type="text" placeholder="Medicine Name" required
                                    value={newItem.medicineName} onChange={e => setNewItem({ ...newItem, medicineName: e.target.value })}
                                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                <input type="number" placeholder="Stock Qty" required
                                    value={newItem.stock} onChange={e => setNewItem({ ...newItem, stock: e.target.value })}
                                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                <input type="number" placeholder="Price (₹)" required
                                    value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                <input type="text" placeholder="Delivery Area (e.g. Sector 62)" required
                                    value={newItem.deliveryArea} onChange={e => setNewItem({ ...newItem, deliveryArea: e.target.value })}
                                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                <button type="submit" style={{ background: '#2563eb', color: 'white', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                                    Save Item
                                </button>
                            </form>
                        </div>
                    )}

                    {inventory.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>No inventory added yet. Add items to start selling.</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                                        <th style={{ padding: '12px' }}>Medicine Name</th>
                                        <th style={{ padding: '12px' }}>Stock</th>
                                        <th style={{ padding: '12px' }}>Price</th>
                                        <th style={{ padding: '12px' }}>Delivery Area</th>
                                        <th style={{ padding: '12px' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventory.map((item) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '12px', fontWeight: '500' }}>{item.medicineName}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{ padding: '4px 8px', borderRadius: '12px', background: item.stock > 10 ? '#dcfce7' : '#fee2e2', color: item.stock > 10 ? '#166534' : '#991b1b', fontSize: '0.85rem' }}>
                                                    {item.stock} units
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px' }}>₹{item.price}</td>
                                            <td style={{ padding: '12px', color: '#64748b' }}>{item.deliveryArea}</td>
                                            <td style={{ padding: '12px' }}>Active</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
