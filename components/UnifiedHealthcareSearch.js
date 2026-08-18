'use client';
import { useState } from 'react';
import axios from 'axios';

const SUGGESTION_CHIPS = [
  { label: "💊 Generic for Glycomet", query: "Generic alternative for Glycomet 500" },
  { label: "🏥 Hospital with Cardiology", query: "Find hospital with cardiology near me" },
  { label: "🧪 Book CBC Blood Test", query: "Book CBC blood test with home collection" },
  { label: "🚑 I need ambulance", query: "I need an ambulance emergency" },
  { label: "🛡️ Insurance network check", query: "Does my insurance work at this hospital" },
  { label: "👨‍⚕️ Find doctor", query: "Find a skin specialist doctor" },
];

function GeneralHelpResult({ result, onSuggestionClick }) {
  return (
    <div>
      <p style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
        {result.message}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '1.5rem' }}>
        {(result.services || []).map((s, i) => (
          <button key={i} onClick={() => onSuggestionClick(s.query)}
            style={{
              background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px',
              padding: '14px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{s.icon}</div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>{s.label}</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px', lineHeight: 1.4 }}>
              {s.examples.join(' · ')}
            </div>
          </button>
        ))}
      </div>
      {result.tip && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '10px 14px', fontSize: '0.8rem', color: '#1e40af', fontWeight: 600 }}>
          💡 {result.tip}
        </div>
      )}
    </div>
  );
}

function MedicineResult({ result }) {
  return (
    <div>
      {result.safetyDisclaimer && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px', marginBottom: '12px', fontSize: '0.85rem', color: '#92400e', fontWeight: 600 }}>
          ⚠️ {result.safetyDisclaimer}
        </div>
      )}
      {result.primaryMedicine && (
        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Primary Medicine Found</div>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{result.primaryMedicine.name}</div>
          <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>
            {result.primaryMedicine.activeIngredient && <span>Active: {result.primaryMedicine.activeIngredient} · </span>}
            {result.primaryMedicine.price && <span>₹{result.primaryMedicine.price}</span>}
            {result.primaryMedicine.requiresPrescription && <span style={{ color: '#ef4444', marginLeft: '8px' }}>Rx Required</span>}
          </div>
        </div>
      )}
      {result.exactEquivalents?.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', marginBottom: '8px' }}>✅ Generic Equivalents</div>
          {result.exactEquivalents.map((e, i) => (
            <div key={i} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '10px 12px', marginBottom: '6px', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 700 }}>{e.name}</span>
              {e.manufacturer && <span style={{ color: '#64748b' }}> · {e.manufacturer}</span>}
              {e.price && <span style={{ color: '#16a34a', fontWeight: 700, float: 'right' }}>₹{e.price}</span>}
            </div>
          ))}
        </div>
      )}
      {result.therapeuticAlternatives?.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', marginBottom: '8px' }}>⚡ Therapeutic Alternatives (Consult Doctor First)</div>
          {result.therapeuticAlternatives.map((t, i) => (
            <div key={i} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '10px 12px', marginBottom: '6px', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 700 }}>{t.name}</span>
              {t.price && <span style={{ color: '#d97706', fontWeight: 700, float: 'right' }}>₹{t.price}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HospitalResult({ result }) {
  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      {(result.hospitals || []).map((h, i) => (
        <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{h.name}</div>
            {h.verified && <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: '999px' }}>✅ VERIFIED</span>}
          </div>
          {h.address && <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>📍 {h.address}</div>}
          {h.services?.length > 0 && <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '6px' }}>Services: {h.services.join(', ')}</div>}
          {h.contact && <a href={`tel:${h.contact}`} style={{ display: 'inline-block', marginTop: '8px', background: '#6366f1', color: 'white', padding: '6px 14px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>📞 Call</a>}
        </div>
      ))}
    </div>
  );
}

function AmbulanceResult({ result }) {
  return (
    <div>
      {result.isEmergency && (
        <div style={{ background: '#fef2f2', border: '2px solid #ef4444', borderRadius: '12px', padding: '14px', marginBottom: '12px', fontWeight: 700, color: '#b91c1c' }}>
          🚨 {result.disclaimer || "If life-threatening, call 108 immediately!"}
        </div>
      )}
      {(result.ambulances || []).map((a, i) => (
        <div key={i} style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '14px', marginBottom: '8px' }}>
          <div style={{ fontWeight: 800 }}>{a.vehicleType} Ambulance</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Driver: {a.driverName} · ETA: {a.estimatedArrivalTime}</div>
          {a.phone && <a href={`tel:${a.phone}`} style={{ display: 'inline-block', marginTop: '8px', background: '#ef4444', color: 'white', padding: '6px 14px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>📞 Call Now</a>}
        </div>
      ))}
      {result.action === 'CALL_108_IMMEDIATELY' && (
        <a href="tel:108" style={{ display: 'block', textAlign: 'center', background: '#ef4444', color: 'white', padding: '14px', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', textDecoration: 'none', marginTop: '8px' }}>
          🚨 CALL 108 NOW
        </a>
      )}
    </div>
  );
}

function DeliveryResult({ result }) {
  return (
    <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🚚</div>
      <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>{result.message}</p>
      {result.link && (
        <a href={result.link} style={{ background: '#6366f1', color: 'white', padding: '10px 24px', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
          View My Orders →
        </a>
      )}
    </div>
  );
}

function InsuranceResult({ result }) {
  return (
    <div>
      {result.checklist && (
        <div>
          <p style={{ fontWeight: 700, marginBottom: '10px' }}>{result.message}</p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {result.checklist.map((item, i) => (
              <li key={i} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                ✅ {item}
              </li>
            ))}
          </ul>
        </div>
      )}
      {result.disclaimer && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '10px', marginTop: '12px', fontSize: '0.8rem', color: '#1e40af', fontWeight: 600 }}>
          ℹ️ {result.disclaimer}
        </div>
      )}
    </div>
  );
}

export default function UnifiedHealthcareSearch({ userId }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSearch = async (q = query) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post('/api/healthcare-intelligence/search', { query: searchQuery, userId });
      setResult(res.data);
    } catch (error) {
      console.error("Search failed:", error);
      setResult({ error: "Failed to process request. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (chipQuery) => {
    setQuery(chipQuery);
    handleSearch(chipQuery);
  };

  const renderResult = () => {
    if (!result) return null;
    const { intent, result: r, error } = result;

    if (error && !r) return <p style={{ color: '#ef4444', fontWeight: 600 }}>{error}</p>;
    if (!r) return null;

    if (!r.found) return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🤔</div>
        <p style={{ color: '#64748b', fontWeight: 600 }}>{r.message}</p>
        <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '6px' }}>Try rephrasing — e.g. "find hospital with cardiology" or "Glycomet generic"</p>
      </div>
    );

    switch (intent) {
      case 'GENERAL_HELP': return <GeneralHelpResult result={r} onSuggestionClick={handleChipClick} />;
      case 'MEDICINE_SEARCH': return <MedicineResult result={r} />;
      case 'HOSPITAL_SEARCH': return <HospitalResult result={r} />;
      case 'AMBULANCE': return <AmbulanceResult result={r} />;
      case 'INSURANCE': return <InsuranceResult result={r} />;
      case 'DELIVERY_TRACK': return <DeliveryResult result={r} />;
      case 'LAB_SEARCH': return <HospitalResult result={{ hospitals: r.labs || [] }} />;
      default: return <GeneralHelpResult result={r} onSuggestionClick={handleChipClick} />;
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '860px', margin: '0 auto', fontFamily: "'Outfit', sans-serif" }}>

      {/* Emergency Quick Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <button
          onClick={() => handleChipClick("I need an emergency ambulance")}
          style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', padding: '8px 20px', borderRadius: '999px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          🚨 Emergency Assist
        </button>
      </div>

      {/* Search Box */}
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
        style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', overflow: 'hidden', backdropFilter: 'blur(8px)' }}
      >
        <span style={{ display: 'flex', alignItems: 'center', padding: '0 16px', color: '#94a3b8', fontSize: '1rem' }}>✨</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Try: "how can you help me", "find hospital cardiology", "generic for Glycomet"'
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '0.95rem', padding: '16px 8px', fontFamily: 'inherit' }}
        />
        <button type="submit" disabled={loading}
          style={{ background: '#6366f1', color: 'white', border: 'none', padding: '0 24px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? '...' : 'Search'}
        </button>
      </form>

      {/* Suggestion Chips */}
      {!result && !loading && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px', justifyContent: 'center' }}>
          {SUGGESTION_CHIPS.map((chip, i) => (
            <button key={i} onClick={() => handleChipClick(chip.query)}
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#cbd5e1', padding: '6px 14px', borderRadius: '999px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {(result || loading) && (
        <div style={{ marginTop: '20px', background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🔍</div>
              Searching Swastik Healthcare Network...
            </div>
          )}
          {result && !loading && (
            <>
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: '999px' }}>
                  {result.intent?.replace(/_/g, ' ')}
                </span>
                {result.isEmergency && (
                  <span style={{ background: '#fef2f2', color: '#ef4444', fontSize: '0.7rem', fontWeight: 800, padding: '4px 12px', borderRadius: '999px', border: '1px solid #fecaca' }}>🚨 EMERGENCY</span>
                )}
                <button onClick={() => { setResult(null); setQuery(''); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}>✕ Clear</button>
              </div>
              {renderResult()}
            </>
          )}
        </div>
      )}
    </div>
  );
}
