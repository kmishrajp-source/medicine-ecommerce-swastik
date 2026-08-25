'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

const SUPPLIER_TYPES = [
  { value: 'MANUFACTURER', label: '🏭 Manufacturer', desc: 'Direct production of medicines/devices' },
  { value: 'SUPER_STOCKIST', label: '🏬 Super Stockist', desc: 'State-level bulk distributor' },
  { value: 'DISTRIBUTOR', label: '📦 Distributor', desc: 'Regional medicine distribution' },
  { value: 'WHOLESALER', label: '⚖️ Wholesaler', desc: 'Bulk wholesale supplier' },
];

const CATEGORIES = ['Tablets', 'Capsules', 'Injectables', 'Syrups', 'OTC Products', 'Surgical Items', 'Medical Devices', 'Nutraceuticals', 'Homeopathy', 'Ayurvedic'];

export default function B2BSupplierRegisterPage() {
  const [step, setStep] = useState(1);
  const [supplierType, setSupplierType] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '', ownerName: '', phone: '', email: '',
    address: '', city: '', pincode: '', state: 'Uttar Pradesh',
    gstin: '', drugLicenseNo: '', brands: '', coverageArea: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplierType) return alert('Please select your supplier type');
    if (selectedCategories.length === 0) return alert('Please select at least one product category');
    
    setLoading(true);
    try {
      const res = await fetch('/api/b2b/supplier-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, supplierType, productCategories: selectedCategories })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data);
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (e) {
      alert('Error submitting registration');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Outfit', sans-serif" }}>
        <Navbar cartCount={0} />
        <div style={{ maxWidth: '600px', margin: '120px auto 60px', padding: '40px', background: 'white', borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '12px' }}>Application Received!</h2>
          <p style={{ color: '#64748b', marginBottom: '20px', lineHeight: 1.6 }}>{success.message}</p>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', marginBottom: '8px', textTransform: 'uppercase' }}>Application ID</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>{success.applicationId}</div>
          </div>
          <ul style={{ textAlign: 'left', paddingLeft: '20px', color: '#475569', marginBottom: '24px', lineHeight: 1.8 }}>
            {success.nextSteps?.map((step, i) => <li key={i}>{step}</li>)}
          </ul>
          <Link href="/b2b" style={{ display: 'inline-block', background: '#3b82f6', color: 'white', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}>
            Explore B2B Marketplace →
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Outfit', sans-serif" }}>
      <Navbar cartCount={0} />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white', padding: '120px 20px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '8px 18px', borderRadius: '999px', display: 'inline-block', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '20px' }}>
            BECOME A SWASTIK B2B SUPPLIER
          </div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: '20px', lineHeight: 1.1 }}>Register as a Verified Supplier</h1>
          <p style={{ fontSize: '1rem', color: '#cbd5e1' }}>
            Connect your business with thousands of pharmacies, hospitals, clinics, and diagnostic centres across the Swastik Medicare network.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 20px 60px' }}>
        
        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', justifyContent: 'center' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', background: step >= s ? '#3b82f6' : '#e2e8f0', color: step >= s ? 'white' : '#94a3b8' }}>{s}</div>
              {s < 3 && <div style={{ width: '60px', height: '2px', background: step > s ? '#3b82f6' : '#e2e8f0' }} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '20px' }}>

            {/* STEP 1: Supplier Type */}
            {step === 1 && (
              <>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>What type of supplier are you?</h2>
                <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.9rem' }}>Select the option that best describes your business.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  {SUPPLIER_TYPES.map(st => (
                    <button type="button" key={st.value} onClick={() => setSupplierType(st.value)}
                      style={{ padding: '20px', borderRadius: '14px', border: `2px solid ${supplierType === st.value ? '#3b82f6' : '#e2e8f0'}`, background: supplierType === st.value ? '#eff6ff' : 'white', cursor: 'pointer', textAlign: 'left' }}>
                      <div style={{ fontSize: '1.2rem', marginBottom: '6px' }}>{st.label}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{st.desc}</div>
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '12px', textTransform: 'uppercase' }}>Product Categories You Supply</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {CATEGORIES.map(cat => (
                      <button type="button" key={cat} onClick={() => toggleCategory(cat)}
                        style={{ padding: '8px 16px', borderRadius: '999px', border: `1.5px solid ${selectedCategories.includes(cat) ? '#3b82f6' : '#cbd5e1'}`, background: selectedCategories.includes(cat) ? '#eff6ff' : 'white', color: selectedCategories.includes(cat) ? '#1d4ed8' : '#64748b', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* STEP 2: Business Details */}
            {step === 2 && (
              <>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginBottom: '24px' }}>Business & Compliance Details</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Company / Firm Name *</label>
                    <input name="companyName" value={formData.companyName} onChange={handleChange} required placeholder="Sharma Medical Distributors" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Owner Name *</label>
                    <input name="ownerName" value={formData.ownerName} onChange={handleChange} required placeholder="Raj Sharma" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Mobile / WhatsApp *</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} required placeholder="9876543210" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Email</label>
                    <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="contact@yourbusiness.com" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>GST Number</label>
                    <input name="gstin" value={formData.gstin} onChange={handleChange} placeholder="27AAAAA0000A1Z5" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Drug Licence No.</label>
                    <input name="drugLicenseNo" value={formData.drugLicenseNo} onChange={handleChange} placeholder="DL-XX/XXXX" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '16px' }}>⚠️ GST or Drug Licence is required for verification. Both are preferred for faster approval.</p>
              </>
            )}

            {/* STEP 3: Coverage & Brands */}
            {step === 3 && (
              <>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginBottom: '24px' }}>Location & Coverage</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Registered Address *</label>
                    <input name="address" value={formData.address} onChange={handleChange} required placeholder="Full address" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>City *</label>
                    <input name="city" value={formData.city} onChange={handleChange} required placeholder="Gorakhpur" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>State</label>
                    <input name="state" value={formData.state} onChange={handleChange} placeholder="Uttar Pradesh" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Coverage Districts / Areas</label>
                    <input name="coverageArea" value={formData.coverageArea} onChange={handleChange} placeholder="Gorakhpur, Basti, Deoria, Maharajganj..." style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Brands You Distribute (comma separated)</label>
                    <input name="brands" value={formData.brands} onChange={handleChange} placeholder="Sun Pharma, Cipla, Mankind, Torrent..." style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '16px', marginTop: '20px' }}>
                  <p style={{ fontSize: '0.85rem', color: '#92400e', fontWeight: 600, margin: 0 }}>
                    ⚠️ Important: By submitting this registration, you confirm that your business holds all required licences to distribute pharmaceutical products as per applicable Indian law, including relevant Drug & Cosmetics Act provisions.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {step > 1 ? (
              <button type="button" onClick={() => setStep(s => s - 1)} style={{ padding: '14px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}>
                ← Back
              </button>
            ) : <div />}
            
            {step < 3 ? (
              <button type="button" onClick={() => {
                if (step === 1 && !supplierType) return alert('Please select a supplier type');
                setStep(s => s + 1);
              }} style={{ padding: '14px 28px', borderRadius: '12px', background: '#3b82f6', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                Next Step →
              </button>
            ) : (
              <button type="submit" disabled={loading} style={{ padding: '14px 28px', borderRadius: '12px', background: '#0f172a', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Submitting...' : 'Submit Supplier Application'}
              </button>
            )}
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
