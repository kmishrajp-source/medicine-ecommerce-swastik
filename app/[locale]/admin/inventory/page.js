"use client";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ── Pricing Helper ─────────────────────────────────────────────────────────────
const calcSellingPrice = (mrp) => mrp > 0 ? parseFloat((mrp * 0.90).toFixed(2)) : 0;
const calcMargin = (sellingPrice, buyingPrice) => parseFloat((sellingPrice - buyingPrice).toFixed(2));

const URGENCY_STYLE = {
    OUT_OF_STOCK: { bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5', label: '🔴 OUT OF STOCK' },
    CRITICAL:     { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D', label: '🟠 CRITICAL (≤5)' },
    LOW:          { bg: '#DBEAFE', color: '#1E40AF', border: '#93C5FD', label: '🔵 LOW (≤10)' },
    WARNING:      { bg: '#F0FDF4', color: '#166534', border: '#86EFAC', label: '🟡 WARNING (≤20)' },
};

const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' };
const modalStyle = { background: 'white', padding: '32px', borderRadius: '24px', width: '90%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #E2E8F0' };
const inputStyle = { width: '100%', padding: '12px 16px', border: '2px solid #E2E8F0', borderRadius: '12px', fontSize: '1em', outline: 'none', transition: 'border-color 0.2s' };
const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1E293B', fontSize: '0.9em' };

export default function Inventory() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showRestockModal, setShowRestockModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [restockTarget, setRestockTarget] = useState(null);
    const fileInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'reorder' | 'counter-sales'

    // Counter Sale State
    const [showCounterSaleModal, setShowCounterSaleModal] = useState(false);
    const [counterSaleItems, setCounterSaleItems] = useState([{ productId: '', quantity: 1, price: 0, name: '' }]);
    const [counterCustomer, setCounterCustomer] = useState({ name: '', phone: '' });
    const [counterPayment, setCounterPayment] = useState('CASH');
    const [counterLoading, setCounterLoading] = useState(false);
    const [counterResult, setCounterResult] = useState(null);

    // Reorder List State
    const [reorderList, setReorderList] = useState(null);
    const [reorderLoading, setReorderLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "", category: "General", price: "", buyingPrice: "", mrp: "",
        stock: "", description: "", requiresPrescription: false,
        image: "", expiryDate: "", batchNumber: ""
    });

    // Restock Modal State
    const [restockData, setRestockData] = useState({
        quantity: "", buyingPrice: "", mrp: "", batchNumber: "", expiryDate: ""
    });

    // Invoice Upload State
    const [invoiceFile, setInvoiceFile] = useState(null);
    const [invoiceParsing, setInvoiceParsing] = useState(false);
    const [invoiceResults, setInvoiceResults] = useState(null);
    const [selectedInvoiceItems, setSelectedInvoiceItems] = useState([]);

    useEffect(() => {
        if (status === 'loading') return;
        if (status === 'unauthenticated') {
            router.push('/login?error=Please login to access inventory');
        } else if (session?.user?.role === 'ADMIN') {
            fetchProducts();
            fetchReorderList();
        } else {
            setLoading(false);
        }
    }, [status, session]);

    const fetchReorderList = async () => {
        setReorderLoading(true);
        try {
            const res = await fetch('/api/admin/reorder-list');
            const data = await res.json();
            if (data.success) setReorderList(data);
        } catch (e) { console.error(e); }
        finally { setReorderLoading(false); }
    };

    const handleCounterSaleProductChange = (index, productId) => {
        const product = products.find(p => p.id === productId);
        const updated = [...counterSaleItems];
        updated[index] = { ...updated[index], productId, price: product?.price || 0, name: product?.name || '' };
        setCounterSaleItems(updated);
    };

    const submitCounterSale = async () => {
        if (!counterSaleItems[0]?.productId) { alert('Please select at least one medicine'); return; }
        setCounterLoading(true);
        setCounterResult(null);
        try {
            const res = await fetch('/api/admin/counter-sale', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: counterSaleItems.filter(i => i.productId),
                    customerName: counterCustomer.name,
                    customerPhone: counterCustomer.phone,
                    paymentMethod: counterPayment
                })
            });
            const data = await res.json();
            if (data.success) {
                setCounterResult(data);
                fetchProducts(); // refresh stock
                fetchReorderList(); // refresh reorder
                setCounterSaleItems([{ productId: '', quantity: 1, price: 0, name: '' }]);
                setCounterCustomer({ name: '', phone: '' });
            } else { alert(data.error || 'Failed to record sale'); }
        } catch (e) { alert('Error: ' + e.message); }
        finally { setCounterLoading(false); }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/admin/inventory');
            const data = await res.json();
            if (data.success) setProducts(data.products);
        } catch (error) {
            console.error("Failed to load products", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            const res = await fetch(`/api/admin/inventory?id=${id}`, { method: 'DELETE' });
            if (res.ok) setProducts(products.filter(p => p.id !== id));
            else alert("Failed to delete product");
        } catch (error) {
            console.error("Delete error", error);
        }
    };

    const handleEdit = (product) => {
        setCurrentProduct(product);
        setFormData({
            name: product.name,
            category: product.category,
            mrp: product.mrp || "",
            price: product.price,
            buyingPrice: product.buyingPrice || "",
            stock: product.stock,
            description: product.description || "",
            requiresPrescription: product.requiresPrescription,
            image: product.image || "",
            expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : "",
            batchNumber: product.batchNumber || ""
        });
        setIsEditing(true);
        setShowForm(true);
    };

    const handleAddNew = () => {
        setCurrentProduct(null);
        setFormData({ name: "", category: "General", price: "", buyingPrice: "", mrp: "", stock: "", description: "", requiresPrescription: false, image: "", expiryDate: "", batchNumber: "" });
        setIsEditing(false);
        setShowForm(true);
    };

    const handleMrpChange = (mrp) => {
        const sp = calcSellingPrice(parseFloat(mrp) || 0);
        setFormData(f => ({ ...f, mrp, price: sp || f.price }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = isEditing ? 'PUT' : 'POST';
        const payload = isEditing ? { ...formData, id: currentProduct.id } : formData;
        try {
            const res = await fetch('/api/admin/inventory', {
                method, headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) { fetchProducts(); setShowForm(false); }
            else alert(data.error || "Operation failed");
        } catch (error) {
            console.error("Submit error", error);
        }
    };

    // ── Restock Modal ──────────────────────────────────────────────────────────
    const openRestock = (product) => {
        setRestockTarget(product);
        setRestockData({ quantity: "", buyingPrice: product.buyingPrice || "", mrp: product.mrp || "", batchNumber: product.batchNumber || "", expiryDate: "" });
        setShowRestockModal(true);
    };

    const handleRestockMrpChange = (mrp) => {
        setRestockData(d => ({ ...d, mrp }));
    };

    const handleRestock = async () => {
        if (!restockData.quantity) return alert("Enter quantity");
        try {
            const res = await fetch('/api/admin/stock', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: restockTarget.id, ...restockData })
            });
            const data = await res.json();
            if (data.success) {
                const p = data.pricing;
                alert(`✅ Stock updated!\nMRP: ₹${p.mrp} | Selling: ₹${p.sellingPrice} | Margin: ₹${p.margin} (${p.marginPercent}%)`);
                fetchProducts();
                setShowRestockModal(false);
            } else {
                alert("Failed: " + data.error);
            }
        } catch (error) {
            console.error("Restock error", error);
        }
    };

    // ── Invoice Upload ─────────────────────────────────────────────────────────
    const handleInvoiceUpload = async () => {
        if (!invoiceFile) return alert("Please select an invoice image");
        setInvoiceParsing(true);
        setInvoiceResults(null);
        try {
            const fd = new FormData();
            fd.append('image', invoiceFile);
            fd.append('autoApply', 'false'); // Parse only, let admin confirm

            const res = await fetch('/api/admin/purchase-invoice', { method: 'POST', body: fd });
            const data = await res.json();

            if (data.parsedItems?.length > 0) {
                // Enrich with product match from current product list
                const enriched = data.parsedItems.map(item => {
                    const match = products.find(p =>
                        p.name.toLowerCase().includes(item.medicineName.toLowerCase().split(' ')[0]) ||
                        item.medicineName.toLowerCase().includes(p.name.toLowerCase().split(' ')[0])
                    );
                    return { ...item, productId: match?.id || null, productName: match?.name || '✨ New Product (Will Auto-Create)', confirmed: true };
                });
                setInvoiceResults(enriched);
                setSelectedInvoiceItems(enriched.map((_, idx) => idx));
            } else {
                alert(data.message || "Could not parse invoice. Try a clearer image.");
            }
        } catch (err) {
            console.error(err);
            alert("Error processing invoice");
        } finally {
            setInvoiceParsing(false);
        }
    };

    const handleApplyInvoice = async () => {
        const itemsToApply = invoiceResults
            .filter((_, idx) => selectedInvoiceItems.includes(idx));

        if (itemsToApply.length === 0) return alert("No matched items selected");

        try {
            const res = await fetch('/api/admin/purchase-invoice', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: itemsToApply })
            });
            const data = await res.json();
            if (data.success) {
                const updated = data.results.filter(r => r.status === 'UPDATED').length;
                alert(`✅ Applied ${updated} items from invoice! Inventory & prices updated.`);
                fetchProducts();
                setShowInvoiceModal(false);
                setInvoiceResults(null);
                setInvoiceFile(null);
            } else {
                alert("Error: " + data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to apply invoice");
        }
    };

    const toggleInvoiceItem = (idx) => {
        setSelectedInvoiceItems(prev =>
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );
    };

    // ── Render Guards ──────────────────────────────────────────────────────────
    if (status === 'loading' || loading) return (
        <div style={{ padding: '100px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
            Loading Inventory...
        </div>
    );
    if (!session) return (
        <div style={{ padding: '100px', textAlign: 'center' }}>
            <p>You are not logged in.</p>
            <button onClick={() => router.push('/login')} className="btn btn-primary">Login as Admin</button>
        </div>
    );
    if (session.user.role !== 'ADMIN') return (
        <div style={{ padding: '100px', textAlign: 'center' }}>
            <h2>Access Denied</h2>
            <p>This page requires ADMIN access.</p>
        </div>
    );

    // ── Derived Pricing for Form ───────────────────────────────────────────────
    const previewSelling = calcSellingPrice(parseFloat(formData.mrp) || 0) || parseFloat(formData.price) || 0;
    const previewMargin = calcMargin(previewSelling, parseFloat(formData.buyingPrice) || 0);

    return (
        <>
            <Navbar cartCount={0} openCart={() => { }} />
            <div className="container" style={{ marginTop: '180px', paddingBottom: '60px' }}>

                {/* ── Header ─── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h2 style={{ margin: 0 }}>📦 Inventory Management</h2>
                        {reorderList?.summary?.total > 0 && (
                            <span style={{ background: reorderList.summary.outOfStock > 0 ? '#DC2626' : '#D97706', color: 'white', borderRadius: '20px', padding: '3px 12px', fontSize: '0.8rem', fontWeight: '800' }}>
                                ⚠️ {reorderList.summary.total} alerts
                            </span>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button onClick={() => setShowCounterSaleModal(true)}
                            style={{ background: 'linear-gradient(135deg,#16A34A,#15803D)', color: '#fff', border: 'none', borderRadius: '50px', padding: '10px 22px', fontWeight: 'bold', cursor: 'pointer' }}>
                            💵 Counter Sale
                        </button>
                        <button onClick={() => setShowInvoiceModal(true)}
                            style={{ 
                                background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', 
                                color: '#fff', 
                                border: 'none', 
                                borderRadius: '50px', 
                                padding: '15px 30px', 
                                fontSize: '1.2rem',
                                fontWeight: '900', 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px',
                                boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)',
                                transform: 'scale(1.05)'
                            }}>
                            📄 UPLOAD AI INVOICE
                        </button>
                        <button onClick={() => router.push('/admin/bulk-upload')}
                            style={{ background: '#E2E8F0', color: '#1E293B', border: 'none', borderRadius: '50px', padding: '10px 22px', fontWeight: 'bold', cursor: 'pointer' }}>
                            📊 Bulk Import
                        </button>
                        <button onClick={handleAddNew} className="btn btn-primary"
                            style={{ borderRadius: '50px', padding: '10px 22px' }}>
                            + Add Product
                        </button>
                    </div>
                </div>

                {/* ── Pricing Rule Banner ─── */}
                <div style={{ background: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)', border: '1px solid #86EFAC', borderRadius: '12px', padding: '14px 20px', marginBottom: '24px', fontSize: '0.9em', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <span>🏷️ <strong>Pricing Rules:</strong></span>
                    <span>📦 Buy from distributor → set <strong>Buying Price</strong></span>
                    <span>🏪 MRP from invoice → <strong>Selling Price = MRP − 10%</strong></span>
                    <span>🏪 Retailer commission = <strong>10% of Selling Price</strong></span>
                    <span>📊 Margin = Selling Price − Buying Price</span>
                </div>

                {/* ── Tab Navigation ─── */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '2px solid #E2E8F0', paddingBottom: '0' }}>
                    {[['inventory','📦 Inventory', null],['reorder','🚨 Reorder List', reorderList?.summary?.total],['counter-sales','💵 Counter Sales', null]].map(([tab, label, badge]) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{
                            padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
                            fontWeight: activeTab === tab ? '800' : '600',
                            color: activeTab === tab ? '#4F46E5' : '#64748B',
                            borderBottom: activeTab === tab ? '3px solid #4F46E5' : '3px solid transparent',
                            marginBottom: '-2px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                            {label}
                            {badge > 0 && <span style={{ background: '#DC2626', color: 'white', borderRadius: '12px', padding: '1px 8px', fontSize: '0.72rem' }}>{badge}</span>}
                        </button>
                    ))}
                </div>

                {/* ── REORDER LIST TAB ─── */}
                {activeTab === 'reorder' && (
                    <div>
                        {reorderLoading ? <div style={{ textAlign: 'center', padding: '60px' }}>⏳ Loading reorder list...</div> : !reorderList ? <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>No data</div> : (
                            <>
                                {/* Summary Cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '12px', marginBottom: '28px' }}>
                                    {[['OUT_OF_STOCK','🔴','outOfStock','Out of Stock','#FEE2E2','#991B1B'],
                                      ['CRITICAL','🟠','critical','Critical (≤5)','#FEF3C7','#92400E'],
                                      ['LOW','🔵','low','Low (≤10)','#DBEAFE','#1E40AF'],
                                      ['WARNING','🟡','warning','Warning (≤20)','#F0FDF4','#166534']].map(([key,icon,countKey,label,bg,color]) => (
                                        <div key={key} style={{ background: bg, border: `1px solid ${URGENCY_STYLE[key].border}`, borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.6rem' }}>{icon}</div>
                                            <div style={{ fontSize: '1.8rem', fontWeight: '800', color }}>{reorderList.summary[countKey]}</div>
                                            <div style={{ fontSize: '0.8rem', color, fontWeight: '600' }}>{label}</div>
                                        </div>
                                    ))}
                                    <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.6rem' }}>💰</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1E293B' }}>₹{reorderList.summary.totalEstimatedCost?.toLocaleString()}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600' }}>Est. Reorder Cost</div>
                                    </div>
                                </div>

                                {/* Tables by urgency */}
                                {['OUT_OF_STOCK','CRITICAL','LOW','WARNING'].map(urgency => {
                                    const grpItems = reorderList.items[urgency] || [];
                                    if (grpItems.length === 0) return null;
                                    const s = URGENCY_STYLE[urgency];
                                    return (
                                        <div key={urgency} style={{ marginBottom: '28px' }}>
                                            <h4 style={{ color: s.color, marginBottom: '10px' }}>{s.label} ({grpItems.length})</h4>
                                            <div style={{ overflowX: 'auto' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                                                    <thead>
                                                        <tr style={{ background: s.bg }}>
                                                            {['Medicine','Category','Current Stock','Suggest Order','Last Buy Price','Est. Cost','Action'].map(h => (
                                                                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: s.color, fontWeight: '700', borderBottom: `2px solid ${s.border}` }}>{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {grpItems.map((item, i) => (
                                                            <tr key={item.productId} style={{ background: i % 2 === 0 ? 'white' : s.bg + '55', borderBottom: '1px solid #F1F5F9' }}>
                                                                <td style={{ padding: '10px 12px', fontWeight: '700' }}>{item.name}</td>
                                                                <td style={{ padding: '10px 12px', color: '#64748B' }}>{item.category}</td>
                                                                <td style={{ padding: '10px 12px' }}>
                                                                    <span style={{ background: s.bg, color: s.color, padding: '2px 10px', borderRadius: '20px', fontWeight: '800' }}>{item.currentStock}</span>
                                                                </td>
                                                                <td style={{ padding: '10px 12px', fontWeight: '700', color: '#4F46E5' }}>{item.suggestedOrderQty} units</td>
                                                                <td style={{ padding: '10px 12px' }}>₹{item.lastBuyingPrice.toFixed(2)}</td>
                                                                <td style={{ padding: '10px 12px', fontWeight: '700' }}>₹{item.estimatedCost.toFixed(2)}</td>
                                                                <td style={{ padding: '10px 12px' }}>
                                                                    <button onClick={() => { setRestockTarget(item); setShowRestockModal(true); }}
                                                                        style={{ background: '#4F46E5', color: 'white', border: 'none', borderRadius: '20px', padding: '5px 14px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}>
                                                                        + Restock
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    );
                                })}
                                {reorderList.summary.total === 0 && (
                                    <div style={{ textAlign: 'center', padding: '60px', color: '#16A34A' }}>
                                        <div style={{ fontSize: '3rem' }}>✅</div>
                                        <h3>All stock levels are healthy!</h3>
                                        <p style={{ color: '#64748B' }}>No medicines need reordering right now.</p>
                                    </div>
                                )}
                                <button onClick={fetchReorderList} style={{ background: '#E2E8F0', border: 'none', borderRadius: '20px', padding: '8px 20px', cursor: 'pointer', fontWeight: '600' }}>🔄 Refresh</button>
                            </>
                        )}
                    </div>
                )}

                {/* ── COUNTER SALES TAB (placeholder list) ─── */}
                {activeTab === 'counter-sales' && (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💵</div>
                        <h3 style={{ color: '#1E293B' }}>Counter Sales</h3>
                        <p style={{ color: '#64748B', marginBottom: '20px' }}>Record walk-in pharmacy sales using the Counter Sale button above.</p>
                        <button onClick={() => setShowCounterSaleModal(true)}
                            style={{ background: 'linear-gradient(135deg,#16A34A,#15803D)', color: 'white', border: 'none', borderRadius: '50px', padding: '12px 28px', fontWeight: '800', cursor: 'pointer', fontSize: '1rem' }}>
                            💵 New Counter Sale
                        </button>
                    </div>
                )}

                {/* ── Add/Edit Product Form ─── */}
                {showForm && (
                    <div className="glass" style={{ padding: '30px', marginBottom: '40px', borderRadius: '16px', background: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                        <h3 style={{ marginTop: 0 }}>{isEditing ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label>Product Name</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={inputStyle} />
                            </div>
                            <div>
                                <label>Category</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={inputStyle}>
                                    {["Pain Relief", "Antibiotics", "Supplements", "Allergy", "Diabetes", "Cardiology", "Dermatology", "Gastrointestinal", "General"].map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Buying Price (₹) — from distributor</label>
                                <input type="number" step="0.01" value={formData.buyingPrice}
                                    onChange={e => setFormData({ ...formData, buyingPrice: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label>MRP (₹) — from invoice/label</label>
                                <input type="number" step="0.01" value={formData.mrp}
                                    onChange={e => handleMrpChange(e.target.value)} style={inputStyle} />
                            </div>
                            <div>
                                <label>
                                    Selling Price (₹)
                                    <span style={{ marginLeft: '8px', background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '20px', fontSize: '0.75em', fontWeight: 'bold' }}>
                                        = MRP − 10% (auto)
                                    </span>
                                </label>
                                <input type="number" step="0.01" value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })} required style={{ ...inputStyle, background: '#F8FAFC' }} />
                            </div>
                            <div>
                                <label>Stock Quantity</label>
                                <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} required style={inputStyle} />
                            </div>

                            {/* Pricing Preview */}
                            {(formData.mrp || formData.buyingPrice) && (
                                <div style={{ gridColumn: '1 / -1', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px', display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '0.9em' }}>
                                    <span>🏷️ MRP: <strong>₹{parseFloat(formData.mrp || 0).toFixed(2)}</strong></span>
                                    <span>💰 Buying: <strong>₹{parseFloat(formData.buyingPrice || 0).toFixed(2)}</strong></span>
                                    <span>🛒 Selling: <strong style={{ color: '#16A34A' }}>₹{previewSelling.toFixed(2)}</strong></span>
                                    <span>📊 Margin: <strong style={{ color: previewMargin >= 0 ? '#16A34A' : '#DC2626' }}>₹{previewMargin.toFixed(2)}</strong></span>
                                    <span>🏪 Retailer Commission (10%): <strong>₹{(previewSelling * 0.10).toFixed(2)}</strong></span>
                                </div>
                            )}

                            <div><label>Image URL</label><input type="text" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." style={inputStyle} /></div>
                            <div><label>Expiry Date</label><input type="date" value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} style={inputStyle} /></div>
                            <div><label>Batch Number</label><input type="text" value={formData.batchNumber} onChange={e => setFormData({ ...formData, batchNumber: e.target.value })} style={inputStyle} /></div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label>Description</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ ...inputStyle, minHeight: '80px' }} />
                            </div>
                            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input type="checkbox" checked={formData.requiresPrescription} onChange={e => setFormData({ ...formData, requiresPrescription: e.target.checked })} id="rx" />
                                <label htmlFor="rx" style={{ cursor: 'pointer' }}>Requires Prescription?</label>
                            </div>
                            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{isEditing ? '💾 Update Product' : '✅ Save Product'}</button>
                                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, background: '#eee', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── Products Table ─── */}
                <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                        <thead style={{ background: '#F8FAFC', textAlign: 'left' }}>
                            <tr>
                                {['Product', 'Category', 'Batch / Expiry', 'Buy Price', 'MRP', 'Sell Price', 'Margin', 'Stock', 'Restock', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '0.85em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr><td colSpan="10" style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>No products found. Add one!</td></tr>
                            ) : products.map(product => {
                                const sp = calcSellingPrice(product.mrp) || product.price;
                                const margin = calcMargin(sp, product.buyingPrice || 0);
                                return (
                                    <tr key={product.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', background: '#eee' }} onError={e => e.target.src = 'https://placehold.co/40'} />
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '0.9em' }}>{product.name}</div>
                                                {product.requiresPrescription && <span style={{ fontSize: '0.7em', background: '#FEE2E2', color: '#B91C1C', padding: '2px 6px', borderRadius: '4px' }}>Rx</span>}
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: '0.85em', color: '#64748B' }}>{product.category}</td>
                                        <td style={{ padding: '14px 16px', fontSize: '0.82em' }}>
                                            <div style={{ fontWeight: '500' }}>{product.batchNumber || '—'}</div>
                                            <div style={{ color: '#94A3B8' }}>{product.expiryDate ? new Date(product.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }) : '—'}</div>
                                        </td>
                                        <td style={{ padding: '14px 16px', fontWeight: '500', color: '#DC2626' }}>₹{product.buyingPrice ? product.buyingPrice.toFixed(2) : '—'}</td>
                                        <td style={{ padding: '14px 16px', color: '#64748B' }}>₹{product.mrp ? product.mrp.toFixed(2) : '—'}</td>
                                        <td style={{ padding: '14px 16px', fontWeight: '700', color: '#16A34A' }}>₹{sp.toFixed(2)}</td>
                                        <td style={{ padding: '14px 16px', fontWeight: '600', color: margin >= 0 ? '#7C3AED' : '#DC2626', fontSize: '0.85em' }}>
                                            {product.buyingPrice ? `₹${margin.toFixed(2)}` : '—'}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{ color: product.stock < 10 ? '#DC2626' : '#16A34A', fontWeight: 'bold' }}>{product.stock}</span>
                                            {product.stock < 10 && <div style={{ fontSize: '0.7em', color: '#DC2626' }}>Low Stock!</div>}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <button onClick={() => openRestock(product)}
                                                style={{ background: '#F0FDF4', color: '#16A34A', border: '1px solid #86EFAC', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontWeight: '600', fontSize: '0.82em', whiteSpace: 'nowrap' }}>
                                                ➕ Restock
                                            </button>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <button onClick={() => handleEdit(product)} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4F46E5', marginRight: '8px', fontSize: '1.1em' }}>✏️</button>
                                            <button onClick={() => handleDelete(product.id)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontSize: '1.1em' }}>🗑️</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Restock Modal ─────────────────────────────────────────────── */}
            {showRestockModal && restockTarget && (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <h3 style={{ marginTop: 0 }}>➕ Restock: {restockTarget.name}</h3>
                        <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: '1fr 1fr' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Quantity to Add *</label>
                                <input type="number" value={restockData.quantity} onChange={e => setRestockData(d => ({ ...d, quantity: e.target.value }))} style={inputStyle} placeholder="e.g. 100" />
                            </div>
                            <div>
                                <label style={labelStyle}>Buying Price (₹) *</label>
                                <input type="number" step="0.01" value={restockData.buyingPrice} onChange={e => setRestockData(d => ({ ...d, buyingPrice: e.target.value }))} style={inputStyle} placeholder="Purchase price" />
                            </div>
                            <div>
                                <label style={labelStyle}>MRP (₹) from Invoice *</label>
                                <input type="number" step="0.01" value={restockData.mrp} onChange={e => handleRestockMrpChange(e.target.value)} style={inputStyle} placeholder="Label MRP" />
                            </div>
                            <div>
                                <label style={labelStyle}>Batch Number</label>
                                <input type="text" value={restockData.batchNumber} onChange={e => setRestockData(d => ({ ...d, batchNumber: e.target.value }))} style={inputStyle} placeholder="e.g. BCH2025A" />
                            </div>
                            <div>
                                <label style={labelStyle}>Expiry Date</label>
                                <input type="date" value={restockData.expiryDate} onChange={e => setRestockData(d => ({ ...d, expiryDate: e.target.value }))} style={inputStyle} />
                            </div>
                        </div>

                        {/* Live pricing preview */}
                        {(restockData.mrp || restockData.buyingPrice) && (
                            <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '10px', padding: '12px 16px', marginTop: '14px', fontSize: '0.88em', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                {restockData.mrp && <span>🏷️ MRP: <strong>₹{parseFloat(restockData.mrp).toFixed(2)}</strong></span>}
                                {restockData.mrp && <span>🛒 Selling (−10%): <strong style={{ color: '#16A34A' }}>₹{calcSellingPrice(parseFloat(restockData.mrp)).toFixed(2)}</strong></span>}
                                {restockData.buyingPrice && restockData.mrp && (
                                    <span>📊 Margin: <strong style={{ color: '#7C3AED' }}>₹{calcMargin(calcSellingPrice(parseFloat(restockData.mrp)), parseFloat(restockData.buyingPrice)).toFixed(2)}</strong></span>
                                )}
                                {restockData.mrp && <span>🏪 Retailer Commission (10%): <strong>₹{(calcSellingPrice(parseFloat(restockData.mrp)) * 0.10).toFixed(2)}</strong></span>}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button onClick={handleRestock} style={{ flex: 1, background: '#16A34A', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '1em' }}>
                                ✅ Update Stock & Prices
                            </button>
                            <button onClick={() => setShowRestockModal(false)} style={{ flex: 1, background: '#F1F5F9', border: 'none', borderRadius: '10px', padding: '12px', cursor: 'pointer', fontWeight: '600' }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Invoice Upload Modal ─────────────────────────────────────── */}
            {showInvoiceModal && (
                <div style={overlayStyle}>
                    <div style={{ ...modalStyle, maxWidth: '760px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>📄 Upload Purchase Invoice</h3>
                            <button onClick={() => { setShowInvoiceModal(false); setInvoiceResults(null); setInvoiceFile(null); }}
                                style={{ background: 'none', border: 'none', fontSize: '1.5em', cursor: 'pointer', color: '#64748B' }}>✕</button>
                        </div>

                        <p style={{ color: '#64748B', marginTop: 0, fontSize: '0.9em' }}>
                            Upload a photo of your distributor's purchase invoice. The system will use OCR to automatically detect medicine names, batch numbers, buying prices, and MRP — then update your inventory and pricing.
                        </p>

                        {!invoiceResults ? (
                            <>
                                <div style={{ border: '2px dashed #CBD5E1', borderRadius: '12px', padding: '40px', textAlign: 'center', background: '#F8FAFC', marginBottom: '16px' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🧾</div>
                                    <p style={{ margin: '0 0 12px', color: '#64748B' }}>Click below to select invoice image (JPG, PNG)</p>
                                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setInvoiceFile(e.target.files[0])} />
                                    <button onClick={() => fileInputRef.current?.click()}
                                        style={{ background: '#EDE9FE', color: '#7C3AED', border: '1px solid #C4B5FD', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '600' }}>
                                        📁 Choose File
                                    </button>
                                    {invoiceFile && <p style={{ marginTop: '10px', color: '#16A34A', fontWeight: '600' }}>✅ {invoiceFile.name}</p>}
                                </div>
                                <button onClick={handleInvoiceUpload} disabled={!invoiceFile || invoiceParsing}
                                    style={{ width: '100%', background: invoiceParsing ? '#94A3B8' : 'linear-gradient(135deg,#7C3AED,#4F46E5)', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px', fontWeight: '700', cursor: invoiceParsing ? 'not-allowed' : 'pointer', fontSize: '1em' }}>
                                    {invoiceParsing ? '🔍 Scanning Invoice with OCR...' : '🔍 Scan Invoice'}
                                </button>
                            </>
                        ) : (
                            <>
                                <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '0.88em' }}>
                                    ✅ Found <strong>{invoiceResults.length}</strong> items. Select which to apply to inventory:
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85em', marginBottom: '16px' }}>
                                    <thead style={{ background: '#F8FAFC' }}>
                                        <tr>
                                            {['✓', 'Medicine', 'Matched Product', 'Buy ₹', 'MRP ₹', 'Sell ₹', 'Qty', 'Batch'].map(h => (
                                                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoiceResults.map((item, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9', opacity: item.productId ? 1 : 0.5 }}>
                                                <td style={{ padding: '10px 12px' }}>
                                                    <input type="checkbox" checked={selectedInvoiceItems.includes(idx)} onChange={() => toggleInvoiceItem(idx)} disabled={!item.productId} />
                                                </td>
                                                <td style={{ padding: '10px 12px', fontWeight: '500' }}>{item.medicineName}</td>
                                                <td style={{ padding: '10px 12px', color: item.productId ? '#16A34A' : '#DC2626' }}>{item.productName}</td>
                                                <td style={{ padding: '10px 12px', color: '#DC2626', fontWeight: '600' }}>₹{item.purchasePrice?.toFixed(2)}</td>
                                                <td style={{ padding: '10px 12px' }}>₹{item.mrp?.toFixed(2)}</td>
                                                <td style={{ padding: '10px 12px', color: '#16A34A', fontWeight: '700' }}>₹{item.sellingPrice?.toFixed(2)}</td>
                                                <td style={{ padding: '10px 12px' }}>{item.qty}</td>
                                                <td style={{ padding: '10px 12px', color: '#94A3B8' }}>{item.batchNumber || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={handleApplyInvoice}
                                        style={{ flex: 2, background: 'linear-gradient(135deg,#16A34A,#15803D)', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px', fontWeight: '700', cursor: 'pointer', fontSize: '1em' }}>
                                        ✅ Apply {selectedInvoiceItems.length} Items to Inventory
                                    </button>
                                    <button onClick={() => { setInvoiceResults(null); setInvoiceFile(null); }}
                                        style={{ flex: 1, background: '#F1F5F9', border: 'none', borderRadius: '10px', padding: '14px', cursor: 'pointer', fontWeight: '600' }}>
                                        🔄 Re-scan
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ════════════ COUNTER SALE MODAL ════════════ */}
            {showCounterSaleModal && (
                <div style={overlayStyle} onClick={e => e.target === e.currentTarget && setShowCounterSaleModal(false)}>
                    <div style={{ ...modalStyle, maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>💵 Counter Sale Entry</h3>
                            <button onClick={() => { setShowCounterSaleModal(false); setCounterResult(null); }} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
                        </div>

                        {counterResult ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✅</div>
                                <h3 style={{ color: '#16A34A' }}>Sale Recorded!</h3>
                                <p><strong>Ref:</strong> {counterResult.saleRef}</p>
                                <p><strong>Total:</strong> ₹{counterResult.total}</p>
                                <p><strong>Items Sold:</strong> {counterResult.itemsSold}</p>
                                <p><strong>Payment:</strong> {counterResult.paymentMethod}</p>
                                {counterResult.alerts?.length > 0 && (
                                    <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '8px', padding: '12px', marginTop: '12px', textAlign: 'left' }}>
                                        <strong>⚠️ Low Stock Alerts Sent:</strong>
                                        {counterResult.alerts.map((a, i) => (
                                            <div key={i} style={{ color: '#92400E', fontSize: '0.88rem', marginTop: '4px' }}>
                                                {a.medicine}: {a.stock} units left ({a.urgency})
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button onClick={() => setCounterResult(null)}
                                    style={{ marginTop: '16px', background: '#4F46E5', color: 'white', border: 'none', borderRadius: '20px', padding: '10px 24px', cursor: 'pointer', fontWeight: '700' }}>
                                    + New Sale
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Customer Info */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                    <div>
                                        <label style={labelStyle}>Customer Name (optional)</label>
                                        <input style={inputStyle} placeholder="Walk-in customer" value={counterCustomer.name}
                                            onChange={e => setCounterCustomer(c => ({ ...c, name: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Phone (optional)</label>
                                        <input style={inputStyle} placeholder="+91 XXXXXXXXXX" value={counterCustomer.phone}
                                            onChange={e => setCounterCustomer(c => ({ ...c, phone: e.target.value }))} />
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={labelStyle}>Payment Method</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {['CASH','UPI','CARD'].map(m => (
                                            <button key={m} onClick={() => setCounterPayment(m)}
                                                style={{ flex: 1, padding: '8px', border: `2px solid ${counterPayment === m ? '#4F46E5' : '#E2E8F0'}`, borderRadius: '8px', background: counterPayment === m ? '#EEF2FF' : 'white', cursor: 'pointer', fontWeight: '700', color: counterPayment === m ? '#4F46E5' : '#64748B' }}>
                                                {m === 'CASH' ? '💵' : m === 'UPI' ? '📱' : '💳'} {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Items */}
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={labelStyle}>Medicines Sold</label>
                                    {counterSaleItems.map((item, idx) => (
                                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                                            <select value={item.productId}
                                                onChange={e => handleCounterSaleProductChange(idx, e.target.value)}
                                                style={{ ...inputStyle, color: item.productId ? '#1E293B' : '#94A3B8' }}>
                                                <option value="">Select Medicine</option>
                                                {products.filter(p => p.stock > 0).map(p => (
                                                    <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                                                ))}
                                            </select>
                                            <input type="number" min="1" value={item.quantity} placeholder="Qty"
                                                onChange={e => { const u = [...counterSaleItems]; u[idx].quantity = parseInt(e.target.value) || 1; setCounterSaleItems(u); }}
                                                style={inputStyle} />
                                            <input type="number" step="0.01" value={item.price} placeholder="Rate"
                                                onChange={e => { const u = [...counterSaleItems]; u[idx].price = parseFloat(e.target.value) || 0; setCounterSaleItems(u); }}
                                                style={inputStyle} />
                                            <button onClick={() => setCounterSaleItems(items => items.filter((_, i) => i !== idx))}
                                                disabled={counterSaleItems.length === 1}
                                                style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontWeight: '700' }}>✕</button>
                                        </div>
                                    ))}
                                    <button onClick={() => setCounterSaleItems(i => [...i, { productId: '', quantity: 1, price: 0, name: '' }])}
                                        style={{ background: '#F1F5F9', border: '1px dashed #94A3B8', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', color: '#64748B', fontWeight: '600', width: '100%' }}>
                                        + Add Another Medicine
                                    </button>
                                </div>

                                {/* Total Preview */}
                                <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '700', color: '#166534' }}>Total Amount:</span>
                                    <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#166534' }}>
                                        ₹{counterSaleItems.reduce((s, i) => s + ((i.price || 0) * (i.quantity || 1)), 0).toFixed(2)}
                                    </span>
                                </div>

                                <button onClick={submitCounterSale} disabled={counterLoading}
                                    style={{ width: '100%', background: 'linear-gradient(135deg,#16A34A,#15803D)', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: '800', fontSize: '1rem', cursor: counterLoading ? 'not-allowed' : 'pointer', opacity: counterLoading ? 0.7 : 1 }}>
                                    {counterLoading ? '⏳ Recording...' : '✅ Record Counter Sale'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

// ── Shared Styles ──────────────────────────────────────────────────────────────
const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #E2E8F0', boxSizing: 'border-box',
    fontSize: '0.95em', outline: 'none'
};
const labelStyle = {
    display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.85em', color: '#374151'
};
const overlayStyle = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '20px'
};
const modalStyle = {
    background: 'white', borderRadius: '16px',
    padding: '30px', width: '100%', maxWidth: '540px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
};
