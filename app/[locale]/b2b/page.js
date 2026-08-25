'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function B2BMarketplace() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [rfqCart, setRfqCart] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRfqModal, setShowRfqModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (query = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/b2b/catalogue?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (e) {
      console.error('Failed to load B2B catalogue', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(search);
  };

  const addToRfq = (product) => {
    setRfqCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + product.moq } : item);
      }
      return [...prev, { ...product, quantity: product.moq, targetPrice: product.b2bPrice }];
    });
  };

  const removeFromRfq = (id) => {
    setRfqCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, newQty) => {
    setRfqCart(prev => prev.map(item => item.id === id ? { ...item, quantity: parseInt(newQty) || 1 } : item));
  };

  const submitRfq = async (e) => {
    e.preventDefault();
    if (rfqCart.length === 0) return alert('Your RFQ list is empty');
    
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.target);
      const payload = {
        buyerName: formData.get('buyerName'),
        buyerPhone: formData.get('buyerPhone'),
        buyerEmail: formData.get('buyerEmail') || session?.user?.email,
        deliveryLocation: formData.get('deliveryLocation'),
        requiredByDate: formData.get('requiredByDate'),
        notes: formData.get('notes'),
        items: rfqCart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          targetPrice: item.targetPrice
        }))
      };

      const res = await fetch('/api/b2b/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        alert(`✅ RFQ Submitted Successfully!\nReference: ${data.rfqRef}\nSuppliers will contact you shortly.`);
        setRfqCart([]);
        setShowRfqModal(false);
      } else {
        alert(data.error || 'Failed to submit RFQ');
      }
    } catch (e) {
      alert('Error submitting RFQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Outfit', sans-serif" }}>
      <Navbar cartCount={rfqCart.length} />

      {/* Hero Section */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', padding: '120px 20px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa', padding: '8px 16px', borderRadius: '999px', display: 'inline-block', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '20px' }}>
            SWASTIK B2B MARKETPLACE
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '20px', lineHeight: 1.1 }}>Procure Medical Supplies at Wholesale Scale</h1>
          <p style={{ fontSize: '1.1rem', color: '#cbd5e1', marginBottom: '30px' }}>
            Request Quotations (RFQ) from verified manufacturers and super-stockists directly. 
            Enjoy transparent pricing, verified suppliers, and Swastik logistics support.
          </p>

          <form onSubmit={handleSearch} style={{ display: 'flex', background: 'white', padding: '6px', borderRadius: '16px', maxWidth: '600px', margin: '0 auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <span style={{ padding: '12px 16px', fontSize: '1.2rem' }}>🔍</span>
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by generic name, brand, or category..." 
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem', color: '#0f172a' }}
            />
            <button type="submit" style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
              Search B2B
            </button>
          </form>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* Main Catalogue */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Wholesale Catalogue</h2>
            <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Showing {products.length} products</div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '1.2rem', fontWeight: 600 }}>
              Loading wholesale inventory...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {products.map(p => (
                <div key={p.id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', transition: 'all 0.2s' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', marginBottom: '6px' }}>{p.sku}</div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{p.name}</h3>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px' }}>{p.salt || p.brand}</div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Est. B2B Price</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#16a34a' }}>₹{p.b2bPrice}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', textDecoration: 'line-through' }}>MRP: ₹{p.mrp}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>MOQ</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>{p.moq} units</div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => addToRfq(p)}
                    style={{ background: '#0f172a', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', width: '100%' }}
                  >
                    + Add to RFQ List
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floating RFQ Cart */}
        {rfqCart.length > 0 && (
          <div style={{ width: '350px', background: 'white', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', position: 'sticky', top: '100px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ background: '#1e293b', color: 'white', padding: '16px 20px', fontWeight: 800 }}>
              RFQ List ({rfqCart.length} items)
            </div>
            
            <div style={{ padding: '20px', maxHeight: '400px', overflowY: 'auto' }}>
              {rfqCart.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{item.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Target: ₹{item.targetPrice} / unit</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Qty:</span>
                      <input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, e.target.value)}
                        style={{ width: '60px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>
                  <button onClick={() => removeFromRfq(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}>×</button>
                </div>
              ))}
            </div>

            <div style={{ padding: '20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <button 
                onClick={() => setShowRfqModal(true)}
                style={{ width: '100%', background: '#3b82f6', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}
              >
                Request Quotations →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RFQ Submission Modal */}
      {showRfqModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '600px', padding: '30px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>Finalize RFQ</h2>
              <button onClick={() => setShowRfqModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>

            <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #bfdbfe' }}>
              <p style={{ fontSize: '0.9rem', color: '#1e40af', fontWeight: 600, margin: 0 }}>
                💡 Your RFQ will be broadcasted to verified distributors in your region. They will reply with their best prices and availability.
              </p>
            </div>

            <form onSubmit={submitRfq}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Contact Name *</label>
                  <input name="buyerName" required placeholder="Dr. Sharma / Pharmacy Name" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>WhatsApp Number *</label>
                  <input name="buyerPhone" required placeholder="+91 98765..." style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Delivery District / Pincode *</label>
                  <input name="deliveryLocation" required placeholder="e.g. Gorakhpur 273001" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Required By Date</label>
                  <input type="date" name="requiredByDate" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Additional Notes (Optional)</label>
                <textarea name="notes" rows={3} placeholder="Any specific brand preferences or delivery instructions..." style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', resize: 'vertical' }} />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ width: '100%', background: '#0f172a', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? 'Submitting RFQ...' : 'Submit Request for Quotation'}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
