"use client";
import Navbar from "../../../components/Navbar";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Inventory() {
    const { data: session, status } = useSession() || {};
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (session?.user?.role === 'ADMIN') {
            fetchProducts();
        }
    }, [status, session]);

    const fetchProducts = async () => {
        // In a real app, this would be an API call
        // const res = await fetch('/api/products');
        // const data = await res.json();
        // setProducts(data);

        // For now, using mock data from localized constants or DB if successfully seeded.
        // Let's assume we can fetch from an internal API we will create.
        setLoading(false);
    };

    if (status === 'loading' || loading) return <div>Loading...</div>;

    if (!session || session.user.role !== 'ADMIN') return <p>Access Denied</p>;

    return (
        <>
            <Navbar cartCount={0} openCart={() => { }} />
            <div className="container" style={{ marginTop: '100px' }}>
                <h2>Inventory Management</h2>
                <p>Coming Soon: Full CRUD for Products.</p>
                {/* Table implementation to follow */}
            </div>
        </>
    );
}
