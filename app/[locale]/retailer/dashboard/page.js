"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ProviderWallet from "@/components/wallet/ProviderWallet";

export default function RetailerDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [inventory, setInventory] = useState([]);
    const [newItem, setNewItem] = useState({ medicineName: "", stock: "", price: "", deliveryArea: "" });
    const [showInvForm, setShowInvForm] = useState(false);
    
    // Prescription Quoting State
    const [prescriptions, setPrescriptions] = useState([]);
    const [quotingRx, setQuotingRx] = useState(null); 
    const [quoteItems, setQuoteItems] = useState([{ id: '', name: '', price: 0, quantity: 1 }]);
    const [isQuoting, setIsQuoting] = useState(false);

    // Incoming Orders State
    const [pendingOrders, setPendingOrders] = useState([]);
    const [preparingOrders, setPreparingOrders] = useState([]);
    const [countdownTimer, setCountdownTimer] = useState(60);
    const [isResponding, setIsResponding] = useState(false);
    
    // Packing Modal State
    const [packingOrder, setPackingOrder] = useState(null);
    const [sealCode, setSealCode] = useState("");
    const [isPacking, setIsPacking] = useState(false);

    // Training Video Popup State
    const [showVideoPopup, setShowVideoPopup] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const dismissed = localStorage.getItem('retailerTrainingDismissed');
            if (!dismissed) setShowVideoPopup(true);
        }
    }, []);

    const closeVideoPopup = () => {
        if (dontShowAgain && typeof window !== 'undefined') {
            localStorage.setItem('retailerTrainingDismissed', 'true');
        }
        setShowVideoPopup(false);
    };

    useEffect(() => {
        let pollingInterval;
        if (status === 'authenticated' && session?.user?.role === 'RETAILER') {
            fetchInventory();
            fetchPendingOrders();
            fetchPreparingOrders();
            fetchPrescriptions();
            pollingInterval = setInterval(() => {
                fetchPendingOrders();
                fetchPreparingOrders();
                fetchPrescriptions();
            }, 10000); 
        }
        return () => clearInterval(pollingInterval);
    }, [status, session]);

    useEffect(() => {
        let timer;
        if (pendingOrders.length > 0 && countdownTimer > 0) {
            timer = setInterval(() => setCountdownTimer(prev => prev - 1), 1000);
        } else if (pendingOrders.length === 0) {
            setCountdownTimer(60);
        }
        return () => clearInterval(timer);
    }, [pendingOrders, countdownTimer]);

    const fetchPendingOrders = async () => {
        try {
            const res = await fetch('/api/retailer/orders');
            const data = await res.json();
            if (data.success && data.pendingOrders.length > 0) {
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
                fetchPendingOrders();
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

    const fetchPreparingOrders = async () => {
        try {
            const res = await fetch('/api/retailer/orders?status=Preparing');
            const data = await res.json();
            if (data.success) setPreparingOrders(data.preparingOrders);
        } catch (e) { console.error("Preparing fetch error", e); }
    };

    const handlePackOrder = async (e) => {
        e.preventDefault();
        if (!packingOrder || !sealCode) return;
        setIsPacking(true);
        try {
            const res = await fetch('/api/retailer/orders/pack', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: packingOrder.id, tamperSealCode: sealCode })
            });
            const data = await res.json();
            if (data.success) {
                alert("Order status updated: Ready for Pickup");
                setPreparingOrders(prev => prev.filter(o => o.id !== packingOrder.id));
                setPackingOrder(null);
                setSealCode("");
            } else {
                alert("Error: " + data.error);
            }
        } finally { setIsPacking(false); }
    };

    const fetchPrescriptions = async () => {
        try {
            const res = await fetch('/api/retailer/prescriptions');
            const data = await res.json();
            if (data.success) setPrescriptions(data.prescriptions);
        } catch (e) { console.error("Rx fetch error", e); }
    };

    const handleQuoteSubmit = async (e) => {
        e.preventDefault();
        if (!quotingRx) return;
        setIsQuoting(true);

        const total = quoteItems.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity)), 0);

        try {
            const res = await fetch('/api/retailer/prescriptions/quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prescriptionId: quotingRx.id,
                    patientId: quotingRx.patientId,
                    items: quoteItems.filter(i => i.id),
                    total
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Quote Sent! Customer will be notified to pay.");
                setQuotingRx(null);
                setQuoteItems([{ id: '', name: '', price: 0, quantity: 1 }]);
                fetchPrescriptions();
            } else {
                alert("Failed: " + data.error);
            }
        } finally { setIsQuoting(false); }
    };

    const addQuoteItem = () => setQuoteItems([...quoteItems, { id: '', name: '', price: 0, quantity: 1 }]);

    const fetchInventory = async () => {
        try {
            const res = await fetch('/api/retailer/inventory');
            const data = await res.json();
            if (data.success) setInventory(data.inventory);
        } catch (e) { console.error("Inventory fetch error", e); }
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

            {/* Training Video Popup */}
            {showVideoPopup && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
                    <div style={{ background: '#ffffff', borderRadius: '24px', width: '90%', maxWidth: '700px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                        <div style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)', padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}><i className="fa-solid fa-graduation-cap"></i> Retailer Training</h2>
                            </div>
                            <button onClick={closeVideoPopup} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer' }}>
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>
                        <div style={{ padding: '30px' }}>
                            <p style={{ color: '#475569', marginBottom: '20px' }}>Welcome! Watch this guide to understand how to handle orders and quotes.</p>
                            <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: '16px', overflow: 'hidden', background: '#0f172a' }}>
                                <iframe style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} src="https://www.youtube.com/embed/jfKfPfyJRdk" allowFullScreen></iframe>
                            </div>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ cursor: 'pointer', color: '#64748b' }}>
                                <input type="checkbox" checked={dontShowAgain} onChange={(e) => setDontShowAgain(e.target.checked)} /> Don't show again
                            </label>
                            <button onClick={closeVideoPopup} style={{ background: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', border: 'none' }}>Start Using Dashboard</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="container" style={{ marginTop: "100px", maxWidth: "1200px" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h2>Pharmacy Partner Dashboard</h2>
                        <p style={{ color: '#666' }}>Welcome back, {session?.user?.name}</p>
                    </div>
                </div>

                <div className="mb-8">
                    <ProviderWallet />
                </div>

                {/* Incoming Orders Area */}
                {pendingOrders.length > 0 && (
                    <div style={{ background: '#FFF7ED', border: '2px solid #F97316', padding: '30px', borderRadius: '16px', marginBottom: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ color: '#C2410C', margin: 0 }}>🚨 New Incoming Order!</h2>
                            <span style={{ background: '#EA580C', color: 'white', padding: '5px 15px', borderRadius: '50px', fontWeight: 'bold' }}>
                                {countdownTimer}s Left
                            </span>
                        </div>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
                            <p><strong>Total Value:</strong> ₹{pendingOrders[0].total.toFixed(2)}</p>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                <button onClick={() => handleAcceptOrder(pendingOrders[0].id)} disabled={isResponding} style={{ flex: 2, background: '#16A34A', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}>ACCEPT</button>
                                <button onClick={() => handleRejectOrder(pendingOrders[0].id)} disabled={isResponding} style={{ flex: 1, background: '#DC2626', color: 'white', padding: '12px', borderRadius: '8px', border: 'none' }}>Reject</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Orders in Preparation */}
                {preparingOrders.length > 0 && (
                    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #e5e7eb', marginBottom: '40px' }}>
                        <h3 className="flex items-center gap-2"><i className="fa-solid fa-box-open text-blue-500"></i> Active Preparations</h3>
                        <p className="text-sm text-gray-500 mb-4">You have accepted these orders. Please pack them and apply a tamper-evident seal.</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {preparingOrders.map(order => (
                                <div key={order.id} style={{ border: '1px solid #f1f5f9', borderRadius: '12px', padding: '20px', background: '#f8fafc' }}>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="font-bold text-gray-900">Order #{order.id.slice(-6).toUpperCase()}</span>
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">PREPARING</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4"><i className="fa-solid fa-calendar mr-2"></i> {new Date(order.createdAt).toLocaleDateString()}</p>
                                    <button 
                                        onClick={() => setPackingOrder(order)}
                                        style={{ width: '100%', background: '#2563eb', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}>
                                        MARK AS PACKED & SEALED
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Packing Modal */}
                {packingOrder && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', maxWidth: '500px', width: '90%' }}>
                            <h3 className="mb-2">Seal Order #{packingOrder.id.slice(-6).toUpperCase()}</h3>
                            <p className="text-sm text-gray-600 mb-6 font-medium">Please enter the unique code from the tamper-evident seal/joint applied to the package.</p>
                            
                            <form onSubmit={handlePackOrder}>
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Tamper-Evident Seal Code</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-4 border rounded-xl bg-gray-50" 
                                        placeholder="Enter Unique Seal Identification"
                                        value={sealCode}
                                        onChange={e => setSealCode(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="p-4 bg-yellow-50 rounded-xl mb-6 border border-yellow-100 italic text-xs text-yellow-800">
                                    "I confirm that this order is correctly packed as per the prescription and a unique tamper-evident joint/seal has been applied."
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isPacking}
                                    style={{ width: '100%', padding: '15px', background: '#059669', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}>
                                    {isPacking ? 'Processing...' : 'CONFIRM PACKED & SEALED'}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => { setPackingOrder(null); setSealCode(""); }} 
                                    style={{ width: '100%', marginTop: '10px', padding: '10px', background: '#eee', borderRadius: '12px', border: 'none' }}>
                                    Cancel
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Prescription Bidding Area */}
                <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #e5e7eb', marginBottom: '40px' }}>
                    <h3>📄 Pending Prescriptions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
                        {prescriptions.map(rx => (
                            <div key={rx.id} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '15px' }}>
                                <img src={rx.imageUrl} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} onClick={() => window.open(rx.imageUrl)}/>
                                <p><strong>User:</strong> {rx.patient?.name}</p>
                                <button onClick={() => setQuotingRx(rx)} className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>Quote Price</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quoting Modal */}
                {quotingRx && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', maxWidth: '600px', width: '90%' }}>
                            <h3>Quote for {quotingRx.patient?.name}</h3>
                            <div style={{ marginTop: '20px' }}>
                                {quoteItems.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                        <select 
                                            value={item.id}
                                            onChange={e => {
                                                const p = inventory.find(inv => inv.id === e.target.value);
                                                const newItems = [...quoteItems];
                                                newItems[idx] = { ...newItems[idx], id: p.id, name: p.medicineName, price: p.price };
                                                setQuoteItems(newItems);
                                            }}
                                            style={{ flex: 2, padding: '8px' }}>
                                            <option value="">-- Select Product --</option>
                                            {inventory.map(inv => <option key={inv.id} value={inv.id}>{inv.medicineName}</option>)}
                                        </select>
                                        <input type="number" value={item.quantity} onChange={e => {
                                            const newItems = [...quoteItems];
                                            newItems[idx].quantity = e.target.value;
                                            setQuoteItems(newItems);
                                        }} style={{ width: '60px', padding: '8px' }} />
                                    </div>
                                ))}
                                <button onClick={addQuoteItem} style={{ color: '#2563eb', border: 'none', background: 'none' }}>+ Add Row</button>
                            </div>
                            <button onClick={handleQuoteSubmit} disabled={isQuoting} style={{ width: '100%', marginTop: '20px', padding: '15px', background: '#16a34a', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}>
                                {isQuoting ? 'Sending...' : 'Send Quote'}
                            </button>
                            <button onClick={() => setQuotingRx(null)} style={{ width: '100%', marginTop: '10px', padding: '10px', background: '#eee', borderRadius: '8px', border: 'none' }}>Cancel</button>
                        </div>
                    </div>
                )}

                {/* Inventory Area */}
                <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3>📦 My Inventory</h3>
                        <button onClick={() => setShowInvForm(!showInvForm)} className="btn btn-primary">{showInvForm ? 'Close' : '+ Add Item'}</button>
                    </div>
                    {showInvForm && (
                        <form onSubmit={handleAddItem} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                            <input type="text" placeholder="Name" value={newItem.medicineName} onChange={e => setNewItem({...newItem, medicineName: e.target.value})} required/>
                            <input type="number" placeholder="Stock" value={newItem.stock} onChange={e => setNewItem({...newItem, stock: e.target.value})} required/>
                            <input type="number" placeholder="Price" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} required/>
                            <input type="text" placeholder="Area" value={newItem.deliveryArea} onChange={e => setNewItem({...newItem, deliveryArea: e.target.value})} required/>
                            <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px', borderRadius: '8px' }}>Save</button>
                        </form>
                    )}
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}><th style={{ padding: '10px' }}>Name</th><th style={{ padding: '10px' }}>Stock</th><th style={{ padding: '10px' }}>Price</th></tr></thead>
                        <tbody>
                            {inventory.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>{item.medicineName}</td>
                                    <td style={{ padding: '10px' }}>{item.stock}</td>
                                    <td style={{ padding: '10px' }}>₹{item.price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
