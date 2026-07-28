"use client";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ── Pricing Helper ─────────────────────────────────────────────────────────────
const calcSellingPrice = (mrp) => mrp > 0 ? parseFloat((mrp * 0.90).toFixed(2)) : 0;
const calcMargin = (sellingPrice, buyingPrice) => parseFloat((sellingPrice - buyingPrice).toFixed(2));

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
        } else {
            setLoading(false);
        }
    }, [status, session]);

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
                    return { ...item, productId: match?.id || null, productName: match?.name || '❌ Not Found', confirmed: !!match };
                });
                setInvoiceResults(enriched);
                setSelectedInvoiceItems(enriched.filter(i => i.confirmed).map((_, idx) => idx));
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
            .filter((_, idx) => selectedInvoiceItems.includes(idx))
            .filter(i => i.productId);

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
            <div className="container" style={{ marginTop: '100px', paddingBottom: '60px' }}>

                {/* ── Header ─── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '12px' }}>
                    <h2 style={{ margin: 0 }}>📦 Inventory Management</h2>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button onClick={() => setShowInvoiceModal(true)}
                            style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', color: '#fff', border: 'none', borderRadius: '50px', padding: '10px 22px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            📄 Upload Purchase Invoice
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
