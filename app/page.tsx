"use client";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

export default function Home() {
  const { cartCount, toggleCart } = useCart();

  return (
    <>
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
      <main>
        <div className="hero-section">
          <div className="hero-content">
            <h1>Your Health,<br />Delivered.</h1>
            <p>Experience the new standard in online pharmacy. fast delivery, secure payments, and expert care.</p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link href="/shop" className="btn btn-primary">Browse Medicines</Link>
              <Link href="/upload" className="btn glass" style={{ padding: '12px 24px', borderRadius: '16px', fontWeight: 600 }}>Upload Prescription</Link>
            </div>
          </div>
          <div className="hero-image">
            {/* Abstract Background Shape could go here */}
            <div className="floating-card" style={{ top: '30%', left: '10%' }}>
              <i className="fa-solid fa-truck-medical"></i>
              <div>
                <div style={{ fontWeight: 'bold' }}>Express Delivery</div>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>Usually within 2 hrs</div>
              </div>
            </div>
            <div className="floating-card delay-1">
              <i className="fa-solid fa-file-prescription"></i>
              <div>
                <div style={{ fontWeight: 'bold' }}>Valid Rx</div>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>Verified Pharmacists</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
