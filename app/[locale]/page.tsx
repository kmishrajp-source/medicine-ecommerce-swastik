"use client";
import { Link } from '@/i18n/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';

// Sub-components moved to top for better scoping
function SectionTitle({ title }) {
  return (
    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '60px 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
      {title}
      <div style={{ flex: 1, height: '2px', background: '#f3f4f6' }}></div>
    </h2>
  );
}

function ProductGrid({ products, addToCart }) {
  const t = useTranslations('Homepage');
  if (products.length === 0) return <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>{t('searching')}</div>;
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

function FeatureCard({ href, icon, title, desc, color }) {
  return (
    <Link href={href} style={{ 
      textDecoration: 'none', 
      color: 'inherit',
      background: 'white',
      padding: '25px',
      borderRadius: '20px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      border: '1px solid #f0f0f0',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
    }}>
      <div style={{ 
        width: '60px', 
        height: '60px', 
        borderRadius: '50%', 
        background: `${color}15`, 
        color: color, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: '1.5rem', 
        marginBottom: '15px' 
      }}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#1e293b' }}>{title}</h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>{desc}</p>
    </Link>
  );
}


export default function Home() {
  const { cartCount, toggleCart, addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const t = useTranslations('Homepage');
  const tTrust = useTranslations('Trust');
  const tEmergency = useTranslations('Emergency');
  const tSub = useTranslations('Subscription');
  const tContact = useTranslations('Contact');
  const tSections = useTranslations('Sections');
  const tReviews = useTranslations('Reviews');

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
            💊 {t('hero_title')}
          </h1>
          <p style={{ fontSize: '1.5rem', opacity: 0.9 }}>{t('hero_subtitle')}</p>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '50px', marginTop: '20px', backdropFilter: 'blur(10px)' }}>
            <i className="fa-solid fa-truck-fast"></i> {t('free_delivery')}
          </div>
          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <Link href="/shop" className="btn" style={{ background: 'white', color: '#4338ca', padding: '15px 40px', borderRadius: '50px', fontSize: '1.2rem', fontWeight: 'bold', border: 'none' }}>
              {t('search_placeholder').split(' ')[0]} Now
            </Link>
            <Link href="/upload-prescription" className="btn" style={{ background: 'transparent', border: '2px solid white', color: 'white', padding: '15px 40px', borderRadius: '50px', fontSize: '1.2rem', fontWeight: 'bold' }}>
              Upload Rx
            </Link>
          </div>
        </div>

        {/* TRUST SIGNALS */}
        <div style={{ background: '#f8fafc', padding: '20px 0', borderBottom: '1px solid #e2e8f0', marginBottom: '40px' }}>
          <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px', textAlign: 'center' }}>
            <TrustItem icon="fa-user-shield" text={tTrust('verified_pharmacy')} />
            <TrustItem icon="fa-file-shield" text={tTrust('secure_rx')} />
            <TrustItem icon="fa-user-doctor" text={tTrust('licensed_pharmacist')} />
            <TrustItem icon="fa-lock" text={tTrust('data_privacy')} />
          </div>
        </div>

        {/* EMERGENCY AMBULANCE BANNER */}
        <div className="container" style={{ marginBottom: '60px' }}>
          <div style={{ background: 'linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)', borderRadius: '16px', padding: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white', flexWrap: 'wrap', gap: '20px', boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)' }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '10px' }}>🚑 {tEmergency('title')}</h2>
              <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>{tEmergency('subtitle')}</p>
            </div>
            <Link href="/ambulance" className="btn" style={{ background: 'white', color: '#b91c1c', padding: '15px 30px', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.1rem', border: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-phone-volume"></i> {tEmergency('book_now')}
            </Link>
          </div>
        </div>

        <div className="container">
          <AdBanner position="Home-Banner" />
          
          {/* SMART HEALTHCARE TOOLS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', margin: '40px 0' }}>
            <FeatureCard 
              href="/ai-assistant" 
              icon="fa-robot" 
              title="AI Medicine Assistant" 
              desc="Ask about dosages, side effects & drug info."
              color="#3B82F6"
            />
            <FeatureCard 
              href="/symptom-checker" 
              icon="fa-stethoscope" 
              title="Symptom Checker" 
              desc="Get instant guidance based on your symptoms."
              color="#2563EB"
            />
            <FeatureCard 
              href="/prescription-analyzer" 
              icon="fa-file-medical" 
              title="Rx Analyzer" 
              desc="Understand your prescription details better."
              color="#059669"
            />
            <FeatureCard 
              href="/drug-interaction-checker" 
              icon="fa-pills" 
              title="Interaction Checker" 
              desc="Check if your medicines are safe together."
              color="#D97706"
            />
          </div>

          {/* BEST SELLING */}
          <SectionTitle title={`🔥 ${tSections('best_selling')}`} />
          <ProductGrid products={bestSelling} addToCart={addToCart} />

          {/* SUBSCRIPTION MODEL BANNER */}
          <div style={{ background: '#ecfdf5', borderRadius: '24px', padding: '40px', margin: '60px 0', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h2 style={{ color: '#064e3b', fontSize: '2rem', marginBottom: '10px' }}>{tSub('title')}</h2>
              <p style={{ fontSize: '1.1rem', color: '#047857', marginBottom: '20px' }}>
                {tSub('subtitle')}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', color: '#065f46' }}>
                <li style={{ marginBottom: '8px' }}><i className="fa-solid fa-check-circle"></i> {tSub('feature_1')}</li>
                <li style={{ marginBottom: '8px' }}><i className="fa-solid fa-check-circle"></i> {tSub('feature_2')}</li>
                <li style={{ marginBottom: '8px' }}><i className="fa-solid fa-check-circle"></i> {tSub('feature_3')}</li>
              </ul>
              <Link href="/subscription" className="btn btn-primary" style={{ background: '#059669' }}>{tSub('subscribe_now')}</Link>
            </div>
            <div style={{ fontSize: '10rem', color: '#10b981', opacity: 0.2 }}>
              <i className="fa-solid fa-calendar-check"></i>
            </div>
          </div>

          {/* TOP BRANDS */}
          <SectionTitle title={`✨ ${t('top_brands')}`} />
          <div style={{ display: 'flex', gap: '30px', overflowX: 'auto', padding: '10px 0', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            {['Himalaya', 'Dabur', 'Patanjali', 'Baidyanath', 'Organic India', 'Dr. Morepen'].map((brand, i) => (
              <div key={i} style={{ minWidth: '120px', height: '80px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee', fontWeight: 'bold', color: '#555', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                {brand}
              </div>
            ))}
          </div>

          {/* TRENDING HEALTH PRODUCTS */}
          <SectionTitle title={`📈 ${tSections('trending')}`} />
          <ProductGrid products={trending} addToCart={addToCart} />


          {/* AYURVEDIC CORNER */}
          <SectionTitle title={`🌿 ${tSections('ayurvedic')}`} />
          <ProductGrid products={products.filter(p => p.category === 'Ayurvedic').slice(0, 4)} addToCart={addToCart} />
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link href="/shop" className="btn" style={{ border: '1px solid #059669', color: '#059669', padding: '10px 30px', borderRadius: '50px' }}>{tSections('view_all')} Ayurveda</Link>
          </div>

          {/* DAILY ESSENTIALS */}
          <SectionTitle title={`☀️ ${tSections('essentials')}`} />
          <ProductGrid products={essentials} addToCart={addToCart} />

          {/* CUSTOMER REVIEWS */}
          <SectionTitle title={`💬 ${t('customer_reviews')}`} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '60px' }}>
            {[
              { name: tReviews('review_1_name'), text: tReviews('review_1_text'), loc: tReviews('review_1_loc') },
              { name: tReviews('review_2_name'), text: tReviews('review_2_text'), loc: tReviews('review_2_loc') },
              { name: tReviews('review_3_name'), text: tReviews('review_3_text'), loc: tReviews('review_3_loc') }
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
            <h2 style={{ color: '#1e40af', marginBottom: '20px' }}>📍 {tSections('delivery_areas')}</h2>
            <p style={{ maxWidth: '600px', margin: '0 auto 30px auto', color: '#475569' }}>{tSections('delivery_areas_desc')}</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {[
                { key: 'gorakhpur', label: tSections('gorakhpur') },
                { key: 'delhi', label: tSections('delhi') },
                { key: 'noida', label: tSections('noida') },
                { key: 'indirapuram', label: tSections('indirapuram') },
                { key: 'vaishali', label: tSections('vaishali') },
                { key: 'greaternoida', label: tSections('greaternoida') }
              ].map((area, i) => (
                <div key={i} style={{ 
                  background: area.key === 'gorakhpur' ? '#2563eb' : 'white', 
                  padding: '10px 20px', 
                  borderRadius: '50px', 
                  color: area.key === 'gorakhpur' ? 'white' : '#1e40af', 
                  fontWeight: 600, 
                  boxShadow: '0 4px 10px rgba(30, 64, 175, 0.2)',
                  border: area.key === 'gorakhpur' ? 'none' : '1px solid #dbeafe',
                  transform: area.key === 'gorakhpur' ? 'scale(1.05)' : 'none'
                }}>
                  <i className="fa-solid fa-location-dot" style={{ marginRight: '8px' }}></i> {area.label}
                </div>
              ))}
            </div>
          </div>

          {/* CONTACT DETAILS with WhatsApp */}
          <div style={{ marginTop: '80px', textAlign: 'center', padding: '40px', background: 'white', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '30px' }}>{tContact('title')}</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
              <ContactItem icon="phone" title={tContact('call_us')} value="+91 79921 22974" color="#3b82f6" href="tel:+917992122974" />
              <ContactItem icon="whatsapp" title={tContact('whatsapp')} value={tContact('chat_now')} color="#22c55e" href="https://wa.me/917992122974" />
              <ContactItem icon="envelope" title={tContact('email')} value={tContact('support_email')} color="#ef4444" href={`mailto:${tContact('support_email')}`} />
            </div>
          </div>

        </div>
      </main>
      <Footer />
      <div id="deployment-canary" style={{ display: 'none' }}>2026-03-11-V5</div>
    </>
  );
}

