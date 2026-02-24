"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";

export default function PartnerPortal() {
    const { cartCount, toggleCart } = useCart();

    const modules = [
        {
            title: "Admin Dashboard",
            icon: "fa-user-shield",
            color: "#333",
            desc: "Manage orders, inventory, and analytics.",
            link: "/admin",
            btnText: "Admin Access"
        },
        {
            title: "Ayurvedic Brand",
            icon: "fa-leaf",
            color: "#059669",
            desc: "List herbal products & verified supplements.",
            link: "/stockist/login", // Reuse stockist for now or new role
            register: "/stockist/register",
            btnText: "Partner Login"
        },
        {
            title: "Ambulance Driver",
            icon: "fa-truck-medical",
            color: "#DC2626",
            desc: "Register vehicle & accept emergency trips.",
            link: "/ambulance/dashboard",
            register: "/ambulance/register",
            btnText: "Driver Login"
        },
        {
            title: "Pharma Company",
            icon: "fa-building",
            color: "#4F46E5",
            desc: "Launch products & run ad campaigns.",
            link: "/pharma-portal",
            register: "/pharma/register",
            btnText: "Company Login"
        },
        {
            title: "Medical Rep",
            icon: "fa-briefcase",
            color: "#0EA5E9",
            desc: "Manage doctor visits & reporting.",
            link: "/mr-portal",
            register: "/partner/register?type=mr",
            btnText: "MR Access"
        },
        {
            title: "Doctors",
            icon: "fa-user-doctor",
            color: "#3B82F6",
            desc: "View appointments and patient records.",
            link: "/doctor/login",
            register: "/doctor/register",
            btnText: "Doctor Login"
        },
        {
            title: "Diagnostic Labs",
            icon: "fa-flask",
            color: "#8B5CF6",
            desc: "Manage test bookings and reports.",
            link: "/lab/login",
            register: "/lab/register",
            btnText: "Lab Login"
        },
        {
            title: "Retail Pharmacy",
            icon: "fa-shop",
            color: "#10B981",
            desc: "Order stock and manage local sales.",
            link: "/retailer/login",
            register: "/retailer/register",
            btnText: "Retailer Login"
        },
        {
            title: "Stockist / Distributor",
            icon: "fa-boxes-stacked",
            color: "#F59E0B",
            desc: "Supply bulk medicines to retailers.",
            link: "/stockist/login",
            register: "/stockist/register",
            btnText: "Stockist Login"
        },
        {
            title: "Delivery Agent",
            icon: "fa-truck-fast",
            color: "#EF4444",
            desc: "Delivery tracking and verification.",
            link: "/delivery",
            btnText: "Delivery Login"
        }
    ];

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <main className="container" style={{ marginTop: '120px', paddingBottom: '60px', maxWidth: '1200px' }}>
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '10px' }}>Healthcare Partner Portal</h1>
                    <p style={{ color: '#666', fontSize: '1.2rem' }}>Access your dedicated dashboard.</p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '30px',
                    padding: '20px'
                }}>
                    {modules.map((mod, index) => (
                        <div key={index} style={{
                            background: 'white',
                            padding: '30px',
                            borderRadius: '16px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            textAlign: 'center',
                            borderTop: `4px solid ${mod.color}`,
                            transition: 'transform 0.2s',
                            cursor: 'pointer'
                        }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ fontSize: '2.5rem', color: mod.color, marginBottom: '20px' }}>
                                <i className={`fa-solid ${mod.icon}`}></i>
                            </div>
                            <h3 style={{ marginBottom: '10px', color: '#1F2937' }}>{mod.title}</h3>
                            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '20px' }}>{mod.desc}</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <Link href={mod.link} className="btn" style={{ background: mod.color, color: 'white', width: '100%', display: 'block', textDecoration: 'none' }}>
                                    {mod.btnText}
                                </Link>
                                {mod.register && (
                                    <Link href={mod.register} style={{ fontSize: '0.8rem', color: '#6B7280', textDecoration: 'underline' }}>
                                        Register new account
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </>
    );
}
