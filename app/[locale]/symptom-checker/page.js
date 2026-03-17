"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import symptomsData from "@/data/symptoms.json";

export default function SymptomChecker() {
    const { cartCount, toggleCart } = useCart();
    const [input, setInput] = useState("");
    const [results, setResults] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    const handleAnalyze = (e) => {
        e.preventDefault();
        setAnalyzing(true);
        setResults(null);

        // Simulate a slight AI thinking delay
        setTimeout(() => {
            const lowerInput = input.toLowerCase();
            let matchedKey = null;

            // Simple keyword matching against the JSON keys
            for (const key of Object.keys(symptomsData)) {
                if (key !== "default" && lowerInput.includes(key)) {
                    matchedKey = key;
                    break;
                }
            }

            if (matchedKey) {
                setResults({
                   symptom: matchedKey,
                   ...symptomsData[matchedKey]
                });
            } else {
                setResults({
                   symptom: "Unknown",
                   ...symptomsData["default"]
                });
            }
            
            setAnalyzing(false);
        }, 800);
    };

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            <div className="container" style={{ marginTop: '120px', maxWidth: '800px', padding: '0 20px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '10px', color: '#1E3A8A' }}>
                    <i className="fa-solid fa-stethoscope"></i> AI Health Guidance
                </h1>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
                    Describe your concerns, and we'll provide general wellness information and recommended next steps. This is NOT a medical diagnosis.
                </p>

                <MedicalDisclaimer />

                <div className="glass" style={{ padding: '30px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                    <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                         <div>
                             <label style={{ fontWeight: '600', marginBottom: '10px', display: 'block', color: '#333' }}>
                                 What symptoms are you experiencing?
                             </label>
                             <textarea 
                                 value={input}
                                 onChange={(e) => setInput(e.target.value)}
                                 placeholder="E.g., I have a headache and a slight fever..."
                                 rows="4"
                                 required
                                 style={{
                                     width: '100%',
                                     padding: '15px',
                                     borderRadius: '12px',
                                     border: '2px solid #E5E7EB',
                                     fontSize: '1rem',
                                     resize: 'vertical',
                                     outline: 'none',
                                     transition: 'border-color 0.2s'
                                 }}
                             />
                         </div>

                         <button 
                             type="submit" 
                             disabled={analyzing || !input.trim()}
                             style={{
                                 background: analyzing || !input.trim() ? '#9CA3AF' : '#2563EB',
                                 color: 'white',
                                 padding: '15px',
                                 borderRadius: '12px',
                                 border: 'none',
                                 fontSize: '1.1rem',
                                 fontWeight: 'bold',
                                 cursor: analyzing || !input.trim() ? 'not-allowed' : 'pointer',
                                 transition: 'all 0.2s',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 gap: '10px'
                             }}
                         >
                             {analyzing ? (
                                 <><i className="fa-solid fa-circle-notch fa-spin"></i> Analyzing...</>
                             ) : (
                                 <><i className="fa-solid fa-wand-magic-sparkles"></i> Get Guidance</>
                             )}
                         </button>
                    </form>

                    {results && (
                        <div style={{ marginTop: '30px', animation: 'fadeIn 0.5s ease-in' }}>
                            <h3 style={{ borderBottom: '2px solid #E5E7EB', paddingBottom: '10px', marginBottom: '15px' }}>
                                Analysis Results
                            </h3>
                            
                            <div style={{ background: '#F0FDF4', padding: '20px', borderRadius: '12px', border: '1px solid #BBF7D0', marginBottom: '20px' }}>
                                <h4 style={{ color: '#166534', marginBottom: '10px' }}>General Wellness Information regarding "{results.symptom}":</h4>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', color: '#15803D' }}>
                                    {results.conditions.map((c, i) => (
                                        <li key={i} style={{ marginBottom: '5px' }}>{c}</li>
                                    ))}
                                </ul>
                            </div>

                            <div style={{ background: '#EFF6FF', padding: '20px', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                                <h4 style={{ color: '#1E40AF', marginBottom: '10px' }}>Advice:</h4>
                                <p style={{ color: '#1D4ED8', lineHeight: '1.6' }}>{results.guidance}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
