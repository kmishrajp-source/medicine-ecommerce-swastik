"use client";
import { MEDICINES } from "../../../data/medicines";
import Navbar from "../../../components/Navbar";
import { useCart } from "../../../context/CartContext";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProductDetails() {
    const params = useParams();
    const router = useRouter();
    const { addToCart, cartCount, toggleCart } = useCart();
    const [product, setProduct] = useState<any>(null);

    useEffect(() => {
        if (params.id) {
            const found = MEDICINES.find(m => m.id === parseInt(params.id as string));
            if (found) setProduct(found);
        }
    }, [params.id]);

    if (!product) return <div className="container" style={{ padding: '100px' }}>Loading...</div>;

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            <main className="container" style={{ marginTop: '120px', paddingBottom: '60px' }}>
                <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--text-light)' }}>
                    <i className="fa-solid fa-arrow-left"></i> Back to Shop
                </Link>

                <div className="glass" style={{ display: 'flex', flexDirection: 'column', gap: '40px', padding: '40px', borderRadius: '32px' }}>

                    {/* Image Section */}
                    <div style={{ flex: 1, borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-md)', minHeight: '300px' }}>
                        <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    {/* Details Section */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <span style={{ background: 'var(--secondary)', color: 'var(--primary)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600 }}>
                                {product.category}
                            </span>
                            {product.requiresPrescription && (
                                <span style={{ marginLeft: '10px', background: '#FFF4E6', color: '#FF9F43', padding: '6px 14px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600 }}>
                                    Rx Required
                                </span>
                            )}
                        </div>

                        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--text-dark)' }}>{product.name}</h1>
                        <p style={{ color: 'var(--text-light)', fontSize: '1.1rem', marginBottom: '32px', lineHeight: '1.6' }}>
                            {product.description} <br />
                            Contains active ingredients for effective treatment. Consult your physician for dosage.
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>₹{product.price}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button
                                onClick={() => addToCart(product)}
                                className="btn btn-primary"
                                style={{ padding: '16px 32px', fontSize: '1.1rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            >
                                <i className="fa-solid fa-cart-plus"></i> Add to Cart
                            </button>

                            {product.requiresPrescription && (
                                <button className="btn" style={{ padding: '16px', border: '2px solid var(--primary)', borderRadius: '16px', color: 'var(--primary)', fontWeight: 600 }}>
                                    <i className="fa-solid fa-file-upload"></i> Upload Rx
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
