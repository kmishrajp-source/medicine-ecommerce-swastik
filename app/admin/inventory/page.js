"use client";
import Navbar from "../../../components/Navbar";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Inventory() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        category: "General",
        price: "",
        stock: "",
        description: "",
        requiresPrescription: false,
        image: ""
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (session?.user?.role === 'ADMIN') {
            fetchProducts();
        }
    }, [status, session]);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/admin/inventory');
            const data = await res.json();
            if (data.success) {
                setProducts(data.products);
            }
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
            if (res.ok) {
                setProducts(products.filter(p => p.id !== id));
            } else {
                alert("Failed to delete product");
            }
        } catch (error) {
            console.error("Delete error", error);
        }
    };

    const handleEdit = (product) => {
        setCurrentProduct(product);
        setFormData({
            name: product.name,
            category: product.category,
            price: product.price,
            stock: product.stock,
            description: product.description || "",
            requiresPrescription: product.requiresPrescription,
            image: product.image || ""
        });
        setIsEditing(true);
        setShowForm(true);
    };

    const handleAddNew = () => {
        setCurrentProduct(null);
        setFormData({
            name: "",
            category: "General",
            price: "",
            stock: "",
            description: "",
            requiresPrescription: false,
            image: ""
        });
        setIsEditing(false);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = isEditing ? 'PUT' : 'POST';
        const payload = isEditing ? { ...formData, id: currentProduct.id } : formData;

        try {
            const res = await fetch('/api/admin/inventory', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                fetchProducts();
                setShowForm(false);
            } else {
                alert(data.error || "Operation failed");
            }
        } catch (error) {
            console.error("Submit error", error);
        }
    };

    if (status === 'loading' || loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading Inventory...</div>;
    if (!session || session.user.role !== 'ADMIN') return <p>Access Denied</p>;

    return (
        <>
            <Navbar cartCount={0} openCart={() => { }} />
            <div className="container" style={{ marginTop: '100px', paddingBottom: '60px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2>Inventory Management</h2>
                    <button onClick={handleAddNew} className="btn btn-primary" style={{ borderRadius: '50px', padding: '10px 24px' }}>
                        + Add Product
                    </button>
                </div>

                {showForm && (
                    <div className="glass" style={{ padding: '30px', marginBottom: '40px', borderRadius: '16px' }}>
                        <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label>Product Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                            </div>

                            <div>
                                <label>Category</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                >
                                    {["Pain Relief", "Antibiotics", "Supplements", "Allergy", "Diabetes", "Cardiology", "Dermatology", "Gastrointestinal", "General"].map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label>Price (₹)</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                            </div>

                            <div>
                                <label>Stock Quantity</label>
                                <input
                                    type="number"
                                    value={formData.stock}
                                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                            </div>

                            <div>
                                <label>Image URL</label>
                                <input
                                    type="text"
                                    value={formData.image}
                                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                                    placeholder="https://..."
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}>
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px' }}
                                />
                            </div>

                            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.requiresPrescription}
                                    onChange={e => setFormData({ ...formData, requiresPrescription: e.target.checked })}
                                    id="rx"
                                />
                                <label htmlFor="rx" style={{ cursor: 'pointer' }}>Requires Prescription?</label>
                            </div>

                            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{isEditing ? 'Update' : 'Save'}</button>
                                <button type="button" onClick={() => setShowForm(false)} className="btn" style={{ background: '#eee', flex: 1 }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                <div style={{ background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead style={{ background: 'var(--bg-light)', textAlign: 'left' }}>
                            <tr>
                                <th style={{ padding: '16px' }}>Product</th>
                                <th style={{ padding: '16px' }}>Category</th>
                                <th style={{ padding: '16px' }}>Price</th>
                                <th style={{ padding: '16px' }}>Stock</th>
                                <th style={{ padding: '16px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>No products found. Add one!</td></tr>
                            ) : (
                                products.map(product => (
                                    <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', background: '#eee' }} />
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>{product.name}</div>
                                                {product.requiresPrescription && <span style={{ fontSize: '0.7em', background: '#FEE2E2', color: '#B91C1C', padding: '2px 6px', borderRadius: '4px' }}>Rx Required</span>}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>{product.category}</td>
                                        <td style={{ padding: '16px' }}>₹{product.price}</td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ color: product.stock < 10 ? 'red' : 'green', fontWeight: 'bold' }}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <button onClick={() => handleEdit(product)} style={{ marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'blue' }}>
                                                <i className="fa-solid fa-edit"></i>
                                            </button>
                                            <button onClick={() => handleDelete(product.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red' }}>
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
