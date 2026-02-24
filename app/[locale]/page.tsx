"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";

export default function Home() {
  const { cartCount, toggleCart, addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(data => {
      if (data.success) setProducts(data.products);
    });
  }, []);

  // Simulating different categories from the same list for now
  const bestSelling = products.slice(0, 4);
  const trending = products.slice(4, 8);
  const essentials = products.slice(8, 12);

  return (
    <>
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
      <main style={{ marginTop: '80px' }}>

        {/* BIG OFFERS BANNER */}
        <div style={{ background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)', color: 'white', padding: '60px 20px', textAlign: 'center', marginBottom: '40px', borderRadius: '0 0 50px 50px', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, margin: '0 0 10px 0', textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
            💊 FLAT 20% OFF
          </h1>
          <p style={{ fontSize: '1.5rem', opacity: 0.9 }}>On All Medicines | First Order Discount</p>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '50px', marginTop: '20px', backdropFilter: 'blur(10px)' }}>
            <i className="fa-solid fa-truck-fast"></i> Free Delivery above ₹500
          </div>
          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <Link href="/shop" className="btn" style={{ background: 'white', color: '#4338ca', padding: '15px 40px', borderRadius: '50px', fontSize: '1.2rem', fontWeight: 'bold', border: 'none' }}>
              Shop Now
            </Link>
            <Link href="/upload-prescription" className="btn" style={{ background: 'transparent', border: '2px solid white', color: 'white', padding: '15px 40px', borderRadius: '50px', fontSize: '1.2rem', fontWeight: 'bold' }}>
              Upload Rx
            </Link>
          </div>
          <div style={{ marginTop: '20px' }}>
            <Link href="/doctor/register" style={{ color: 'white', textDecoration: 'underline', fontSize: '1.1rem', fontWeight: 600 }}>
              👨‍⚕️ Join as Doctor – Start Earning Online
            </Link>
          </div>
        </div>

        {/* TRUST SIGNALS */}
        <div style={{ background: '#f8fafc', padding: '20px 0', borderBottom: '1px solid #e2e8f0', marginBottom: '40px' }}>
          <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px', textAlign: 'center' }}>
            <TrustItem icon="fa-user-shield" text="Verified Pharmacy" />
            <TrustItem icon="fa-file-shield" text="Secure Prescription Handling" />
            <TrustItem icon="fa-user-doctor" text="Licensed Pharmacist Available" />
            <TrustItem icon="fa-lock" text="100% Data Privacy Protected" />
          </div>
        </div>

        {/* EMERGENCY AMBULANCE BANNER */}
        <div className="container" style={{ marginBottom: '60px' }}>
          <div style={{ background: 'linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)', borderRadius: '16px', padding: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white', flexWrap: 'wrap', gap: '20px', boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)' }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '10px' }}>🚑 Emergency? Need an Ambulance?</h2>
              <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Book an ambulance instantly. 24/7 Service available in your area.</p>
            </div>
            <Link href="/ambulance" className="btn" style={{ background: 'white', color: '#b91c1c', padding: '15px 30px', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.1rem', border: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-phone-volume"></i> Book Now
            </Link>
          </div>
        </div>

        <div className="container">
          {/* Ad Banner */}
          <AdBanner position="Home-Banner" />

          {/* BEST SELLING */}
          <SectionTitle title="🔥 Best Selling Medicines" />
          <ProductGrid products={bestSelling} addToCart={addToCart} />

          {/* SUBSCRIPTION MODEL BANNER */}
          <div style={{ background: '#ecfdf5', borderRadius: '24px', padding: '40px', margin: '60px 0', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h2 style={{ color: '#064e3b', fontSize: '2rem', marginBottom: '10px' }}>BP / Diabetes Patient?</h2>
              <p style={{ fontSize: '1.1rem', color: '#047857', marginBottom: '20px' }}>
                Get <strong>Monthly Automatic Delivery</strong> of your medicines.
                <br />Save extra 5% + ensure you never run out.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', color: '#065f46' }}>
                <li style={{ marginBottom: '8px' }}><i className="fa-solid fa-check-circle"></i> Auto-Reorder every month</li>
                <li style={{ marginBottom: '8px' }}><i className="fa-solid fa-check-circle"></i> Best market price guaranteed</li>
                <li style={{ marginBottom: '8px' }}><i className="fa-solid fa-check-circle"></i> Free Doctor Consultation included</li>
              </ul>
              <Link href="/subscription" className="btn btn-primary" style={{ background: '#059669' }}>Subscribe Now</Link>
            </div>
            <div style={{ fontSize: '10rem', color: '#10b981', opacity: 0.2 }}>
              <i className="fa-solid fa-calendar-check"></i>
            </div>
          </div>

          {/* TOP BRANDS */}
          <SectionTitle title="✨ Top Brands" />
          <div style={{ display: 'flex', gap: '30px', overflowX: 'auto', padding: '10px 0', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            {['Himalaya', 'Dabur', 'Patanjali', 'Baidyanath', 'Organic India', 'Dr. Morepen'].map((brand, i) => (
              <div key={i} style={{ minWidth: '120px', height: '80px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee', fontWeight: 'bold', color: '#555', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                {brand}
              </div>
            ))}
          </div>

          {/* TRENDING HEALTH PRODUCTS */}
          <SectionTitle title="📈 Trending Health Products" />
          <ProductGrid products={trending} addToCart={addToCart} />


          {/* AYURVEDIC CORNER */}
          <SectionTitle title="🌿 Ayurvedic Corner" />
          <ProductGrid products={products.filter(p => p.category === 'Ayurvedic').slice(0, 4)} addToCart={addToCart} />
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link href="/shop" className="btn" style={{ border: '1px solid #059669', color: '#059669', padding: '10px 30px', borderRadius: '50px' }}>View All Ayurveda</Link>
          </div>

          {/* DAILY ESSENTIALS */}
          <SectionTitle title="☀️ Daily Essentials" />
          <ProductGrid products={essentials} addToCart={addToCart} />

          {/* CUSTOMER REVIEWS */}
          <SectionTitle title="💬 What Our Customers Say" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '60px' }}>
            {[
              { name: 'Rahul Sharma', text: 'Swastik Medicare is a lifesaver! Fast delivery and genuine medicines.', loc: 'Noida' },
              { name: 'Priya Singh', text: 'I love the subscription plan for my parents. Automatic monthly refill is great.', loc: 'Ghaziabad' },
              { name: 'Amit Verma', text: 'Best prices in the market. The discount coupons really help.', loc: 'Delhi' }
            ].map((review, i) => (
              <div key={i} style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
                <div style={{ color: '#fbbf24', marginBottom: '10px' }}><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i></div>
                <p style={{ fontStyle: 'italic', marginBottom: '15px', color: '#555' }}>"{review.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748b' }}>{review.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{review.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#999' }}>{review.loc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* DELIVERY COVERAGE */}
          <div style={{ background: '#eff6ff', borderRadius: '24px', padding: '40px', textAlign: 'center', border: '1px solid #dbeafe', marginBottom: '60px' }}>
            <h2 style={{ color: '#1e40af', marginBottom: '20px' }}>📍 Delivery Areas</h2>
            <p style={{ maxWidth: '600px', margin: '0 auto 30px auto', color: '#475569' }}>We are rapidly expanding! Currently creating smiles and delivering health in the following regions.</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {['Sector 62, Noida', 'Indirapuram', 'Vaishali', 'Greater Noida West', 'Crossing Republik', 'Delhi (South)'].map((area, i) => (
                <div key={i} style={{ background: 'white', padding: '10px 20px', borderRadius: '50px', color: '#1e40af', fontWeight: 600, boxShadow: '0 2px 4px rgba(30, 64, 175, 0.1)' }}>
                  <i className="fa-solid fa-map-pin" style={{ marginRight: '8px' }}></i> {area}
                </div>
              ))}
            </div>
          </div>

          {/* CONTACT DETAILS with WhatsApp */}
          <div style={{ marginTop: '80px', textAlign: 'center', padding: '40px', background: 'white', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '30px' }}>Compare & Contact. We are here 24/7.</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
              <ContactItem icon="phone" title="Call Us" value="+91 98765 43210" color="#3b82f6" href="tel:+919876543210" />
              <ContactItem icon="whatsapp" title="WhatsApp" value="Chat Now" color="#22c55e" href="https://wa.me/919876543210" />
              <ContactItem icon="envelope" title="Email" value="support@swastik.com" color="#ef4444" href="mailto:support@swastik.com" />
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}

function SectionTitle({ title }) {
  return (
    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '60px 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
      {title}
      <div style={{ flex: 1, height: '2px', background: '#f3f4f6' }}></div>
    </h2>
  );
}

function ProductGrid({ products, addToCart }) {
  if (products.length === 0) return <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Loading products...</div>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
      {products.map(p => (
        <ProductCard key={p.id} product={p} onAdd={addToCart} />
      ))}
    </div>
  );
}

function ContactItem({ icon, title, value, color, href }) {
  return (
    <a href={href} target="_blank" style={{ textDecoration: 'none', color: 'inherit', textAlign: 'center', minWidth: '150px' }}>
      <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: `${color}20`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 10px auto' }}>
        <i className={`fa-brands fa-${icon === 'whatsapp' ? 'whatsapp' : ''} fa-${icon !== 'whatsapp' ? icon : ''} ${icon === 'phone' ? 'fa-solid' : ''} ${icon === 'envelope' ? 'fa-solid' : ''}`}></i>
      </div>
      <div style={{ fontWeight: 'bold' }}>{title}</div>
      <div style={{ color: '#666' }}>{value}</div>
    </a>
  );
}

function TrustItem({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontWeight: 600 }}>
      <i className={`fa-solid ${icon}`} style={{ color: '#059669', fontSize: '1.2rem' }}></i>
      <span>{text}</span>
    </div>
  );
}
