"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import interactionsData from "@/data/interactions.json";

export default function InteractionChecker() {
    const { cartCount, toggleCart } = useCart();
    const [med1, setMed1] = useState("");
    const [med2, setMed2] = useState("");
    const [results, setResults] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    const handleAnalyze = (e) => {
        e.preventDefault();
        setAnalyzing(true);
        setResults(null);

        setTimeout(() => {
            const m1 = med1.toLowerCase().trim();
            const m2 = med2.toLowerCase().trim();
            
            const combo1 = `${m1},${m2}`;
            const combo2 = `${m2},${m1}`;
            
            let matchedKey = interactionsData[combo1] ? combo1 : (interactionsData[combo2] ? combo2 : null);

            if (matchedKey) {
                setResults({
                   combo: matchedKey,
                   ...interactionsData[matchedKey]
                });
            } else {
                setResults({
                   combo: "Unknown",
                   ...interactionsData["default"]
                });
            }
            
            setAnalyzing(false);
        }, 800);
    };

    const getSeverityColor = (severity) => {
        switch(severity.toLowerCase()) {
            case 'low': return { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' };
            case 'moderate': return { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' };
            case 'high': return { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' };
            case 'critical': return { bg: '#7F1D1D', text: '#FEF2F2', border: '#450A0A' };
            default: return { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' };
        }
    };

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            <div className="container" style={{ marginTop: '120px', maxWidth: '800px', padding: '0 20px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '10px', color: '#B45309' }}>
                    <i className="fa-solid fa-pills"></i> Drug Interaction Checker
                </h1>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
                    Enter two medicines below to check for potential interaction warnings.
                </p>

                <MedicalDisclaimer />

                <div className="glass" style={{ padding: '30px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                    <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                         <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                             <div style={{ flex: '1 1 300px' }}>
                                 <label style={{ fontWeight: '600', marginBottom: '10px', display: 'block', color: '#333' }}>
                                     Medicine 1
                                 </label>
                                 <input 
                                     type="text"
                                     value={med1}
                                     onChange={(e) => setMed1(e.target.value)}
                                     placeholder="e.g. Paracetamol"
                                     required
                                     style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #E5E7EB', fontSize: '1rem', outline: 'none' }}
                                 />
                             </div>
                             <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '10px' }}>
                                 <span style={{ fontSize: '1.5rem', color: '#9CA3AF', fontWeight: 'bold' }}>+</span>
                             </div>
                             <div style={{ flex: '1 1 300px' }}>
                                 <label style={{ fontWeight: '600', marginBottom: '10px', display: 'block', color: '#333' }}>
                                     Medicine 2
                                 </label>
                                 <input 
                                     type="text"
                                     value={med2}
                                     onChange={(e) => setMed2(e.target.value)}
                                     placeholder="e.g. Ibuprofen"
                                     required
                                     style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #E5E7EB', fontSize: '1rem', outline: 'none' }}
                                 />
                             </div>
                         </div>

                         <button 
                             type="submit" 
                             disabled={analyzing || !med1.trim() || !med2.trim()}
                             style={{
                                 background: analyzing || !med1.trim() || !med2.trim() ? '#9CA3AF' : '#D97706',
                                 color: 'white',
                                 padding: '15px',
                                 borderRadius: '12px',
                                 border: 'none',
                                 fontSize: '1.1rem',
                                 fontWeight: 'bold',
                                 cursor: analyzing || !med1.trim() || !med2.trim() ? 'not-allowed' : 'pointer',
                                 transition: 'all 0.2s',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 gap: '10px',
                                 marginTop: '10px'
                             }}
                         >
                             {analyzing ? (
                                 <><i className="fa-solid fa-circle-notch fa-spin"></i> Checking Interactions...</>
                             ) : (
                                 <><i className="fa-solid fa-shield-halved"></i> Check Interactions</>
                             )}
                         </button>
                    </form>

                    {results && (
                        <div style={{ marginTop: '30px', animation: 'fadeIn 0.5s ease-in' }}>
                            <h3 style={{ borderBottom: '2px solid #E5E7EB', paddingBottom: '10px', marginBottom: '15px' }}>
                                Interaction Results
                            </h3>
                            
                            <div style={{ 
                                background: getSeverityColor(results.severity).bg, 
                                padding: '20px', 
                                borderRadius: '12px', 
                                border: `1px solid ${getSeverityColor(results.severity).border}`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                     <h4 style={{ color: getSeverityColor(results.severity).text, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                         {results.severity === 'Low' ? <i className="fa-solid fa-circle-check"></i> : <i className="fa-solid fa-triangle-exclamation"></i>}
                                         {med1} + {med2}
                                     </h4>
                                     <span style={{ 
                                         padding: '4px 12px', 
                                         borderRadius: '20px', 
                                         background: 'rgba(0,0,0,0.05)', 
                                         color: getSeverityColor(results.severity).text,
                                         fontSize: '0.8rem',
                                         fontWeight: 'bold',
                                         textTransform: 'uppercase'
                                     }}>
                                         Severity: {results.severity}
                                     </span>
                                </div>
                                <p style={{ color: getSeverityColor(results.severity).text, lineHeight: '1.6', fontSize: '1.05rem', marginTop: '15px' }}>
                                     {results.warning}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
