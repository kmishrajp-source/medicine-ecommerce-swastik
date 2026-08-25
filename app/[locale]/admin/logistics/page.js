'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const STATUS_COLOR = {
  LIVE: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', text: '#10b981' },
  CONFIGURED: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', text: '#f59e0b' },
  INTEGRATION_REQUIRED: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', text: '#ef4444' },
};

const KNOWN_PROVIDERS = [
  { name: 'SHADOWFAX', icon: '🏍️', desc: 'Pan-India logistics, strong in Tier 2/3 cities', baseFee: 39, perKmFee: 8, modes: ['BIKE', 'CAR'] },
  { name: 'PORTER', icon: '🚛', desc: 'Intra-city delivery, good for bulk/medical supplies', baseFee: 50, perKmFee: 12, modes: ['BIKE', 'CAR', 'MINI_TRUCK'] },
  { name: 'DUNZO', icon: '⚡', desc: 'Hyperlocal 30-min delivery, major metros', baseFee: 45, perKmFee: 10, modes: ['BIKE'] },
  { name: 'DELHIVERY', icon: '📦', desc: 'Surface + air, good for B2B medical supplies', baseFee: 60, perKmFee: 15, modes: ['BIKE', 'VAN', 'TRUCK'] },
];

export default function AdminLogisticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [providers, setProviders] = useState([]);
  const [swastikStats, setSwastikStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newProvider, setNewProvider] = useState({
    name: '', apiUrl: '', apiKey: '', baseFee: 40, perKmFee: 10, priority: 2,
    serviceCities: 'Gorakhpur'
  });

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') fetchData();
  }, [status]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/logistics/providers');
      const data = await res.json();
      if (data.success) {
        setProviders(data.providers || []);
        setSwastikStats(data.swastikRiders);
      }
    } catch (e) {
      console.error('Failed to load logistics data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (provider) => {
    try {
      const res = await fetch('/api/logistics/providers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: provider.id, isActive: !provider.isActive, status: !provider.isActive ? 'LIVE' : 'CONFIGURED' })
      });
      const data = await res.json();
      if (data.success) fetchData();
    } catch (e) { alert('Failed to update provider'); }
  };

  const handleAddProvider = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...newProvider,
        serviceCities: newProvider.serviceCities.split(',').map(c => c.trim())
      };
      const res = await fetch('/api/logistics/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewProvider({ name: '', apiUrl: '', apiKey: '', baseFee: 40, perKmFee: 10, priority: 2, serviceCities: 'Gorakhpur' });
        fetchData();
        alert(`✅ ${data.message}`);
      } else {
        alert(data.error || 'Failed');
      }
    } catch (e) { alert('Error saving provider'); }
    finally { setSaving(false); }
  };

  const applyTemplate = (template) => {
    setNewProvider(prev => ({
      ...prev,
      name: template.name,
      baseFee: template.baseFee,
      perKmFee: template.perKmFee
    }));
    setSelectedTemplate(template.name);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', fontFamily: "'Outfit', sans-serif" }}>
      
      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/admin" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem' }}>← Admin</Link>
          <span style={{ color: '#475569' }}>/</span>
          <span style={{ fontWeight: 800, fontSize: '1rem' }}>🚚 Logistics Control Center</span>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
        >
          + Add 3PL Partner
        </button>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

        {/* Delivery Priority Diagram */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.08em' }}>Delivery Priority Cascade</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0', flexWrap: 'wrap', gap: '8px' }}>
            {[
              { step: '1', label: 'Swastik Rider', sub: 'Own fleet', color: '#10b981', icon: '🏍️' },
              { step: '→', label: '', color: '#334155' },
              { step: '2', label: 'External 3PL', sub: 'Shadowfax / Porter', color: '#3b82f6', icon: '🚛' },
              { step: '→', label: '', color: '#334155' },
              { step: '3', label: 'Retailer Delivery', sub: 'Pharmacy self-delivers', color: '#f59e0b', icon: '🏪' },
              { step: '→', label: '', color: '#334155' },
              { step: '4', label: 'Customer Pickup', sub: 'Last resort', color: '#ef4444', icon: '🙋' },
            ].map((item, i) => (
              item.icon ? (
                <div key={i} style={{ background: `rgba(${item.color === '#10b981' ? '16,185,129' : item.color === '#3b82f6' ? '59,130,246' : item.color === '#f59e0b' ? '245,158,11' : '239,68,68'},0.1)`, border: `1px solid ${item.color}30`, borderRadius: '12px', padding: '12px 16px', textAlign: 'center', minWidth: '140px' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{item.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: item.color }}>Priority {item.step}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'white' }}>{item.label}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.sub}</div>
                </div>
              ) : (
                <div key={i} style={{ color: '#475569', fontSize: '1.2rem', fontWeight: 700 }}>→</div>
              )
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Active Swastik Riders</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white', marginTop: '4px' }}>{loading ? '...' : (swastikStats?.active || 0)}</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>Online right now</div>
          </div>
          <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em' }}>3PL Partners</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white', marginTop: '4px' }}>{providers.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>{providers.filter(p => p.isActive).length} active</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>3PL Jobs Dispatched</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white', marginTop: '4px' }}>{providers.reduce((sum, p) => sum + (p.totalJobs || 0), 0)}</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>All time via 3PL</div>
          </div>
        </div>

        {/* Providers List */}
        <div style={{ marginBottom: '1rem', fontWeight: 800, fontSize: '1.1rem' }}>3PL Delivery Partners</div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>Loading providers...</div>
        ) : providers.length === 0 ? (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏗️</div>
            <p style={{ color: '#9ca3af', fontWeight: 600, marginBottom: '8px' }}>No 3PL partners configured yet.</p>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '20px' }}>Add your first delivery partner to enable fallback delivery when Swastik riders are unavailable.</p>
            <button onClick={() => setShowAddModal(true)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
              Configure First 3PL Partner
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {providers.map(p => {
              const sc = STATUS_COLOR[p.status] || STATUS_COLOR.CONFIGURED;
              return (
                <div key={p.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>{p.name}</div>
                      <span style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text, fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', borderRadius: '999px' }}>
                        {p.status}
                      </span>
                      {p.isActive && <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', borderRadius: '999px' }}>✓ ACTIVE</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '20px', fontSize: '0.8rem', color: '#9ca3af', flexWrap: 'wrap' }}>
                      <span>Base Fee: ₹{p.baseFee}</span>
                      <span>Per KM: ₹{p.perKmFee}</span>
                      <span>Priority: #{p.priority}</span>
                      <span>Cities: {p.serviceCities?.join(', ')}</span>
                      <span>Jobs: {p.totalJobs} ({p.successRate} success)</span>
                      <span>API Key: {p.hasApiKey ? '✅ Set' : '⚠️ Missing'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                      onClick={() => handleToggleActive(p)}
                      style={{
                        padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', border: 'none',
                        background: p.isActive ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                        color: p.isActive ? '#ef4444' : '#10b981'
                      }}
                    >
                      {p.isActive ? '⏸ Deactivate' : '▶ Activate'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Provider Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', width: '100%', maxWidth: '640px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900 }}>Configure 3PL Delivery Partner</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Quick Templates */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>Quick Templates</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {KNOWN_PROVIDERS.map(tp => (
                  <button key={tp.name} onClick={() => applyTemplate(tp)}
                    style={{ padding: '8px 14px', borderRadius: '10px', border: `1.5px solid ${selectedTemplate === tp.name ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`, background: selectedTemplate === tp.name ? 'rgba(59,130,246,0.15)' : 'transparent', color: 'white', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                    {tp.icon} {tp.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddProvider}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Provider Name *</label>
                  <input value={newProvider.name} onChange={e => setNewProvider(p => ({ ...p, name: e.target.value.toUpperCase() }))} required placeholder="SHADOWFAX" style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>API Base URL</label>
                  <input value={newProvider.apiUrl} onChange={e => setNewProvider(p => ({ ...p, apiUrl: e.target.value }))} placeholder="https://api.provider.com" style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>API Key (stored securely)</label>
                  <input type="password" value={newProvider.apiKey} onChange={e => setNewProvider(p => ({ ...p, apiKey: e.target.value }))} placeholder="sk_live_..." style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Base Fee (₹)</label>
                  <input type="number" value={newProvider.baseFee} onChange={e => setNewProvider(p => ({ ...p, baseFee: parseFloat(e.target.value) }))} style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Per KM Fee (₹)</label>
                  <input type="number" value={newProvider.perKmFee} onChange={e => setNewProvider(p => ({ ...p, perKmFee: parseFloat(e.target.value) }))} style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Service Cities (comma separated)</label>
                  <input value={newProvider.serviceCities} onChange={e => setNewProvider(p => ({ ...p, serviceCities: e.target.value }))} placeholder="Gorakhpur, Lucknow, Varanasi" style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px', padding: '12px', marginBottom: '20px' }}>
                <p style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600, margin: 0 }}>
                  ⚠️ Provider will be saved as CONFIGURED (inactive). Test your API integration and then Activate from the control panel. Do not activate in production without successful integration testing.
                </p>
              </div>

              <button type="submit" disabled={saving} style={{ width: '100%', padding: '14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : 'Save Provider Configuration'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
