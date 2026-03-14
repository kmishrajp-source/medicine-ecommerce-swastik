"use client";
import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import Tesseract from 'tesseract.js';
import Image from 'next/image';

export default function PrescriptionAnalyzer() {
    const { cartCount, toggleCart, addToCart } = useCart();
    const [imagePreview, setImagePreview] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result);
                setResults(null); 
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!imagePreview) return;
        setAnalyzing(true);
        setProgress(0);
        setResults(null);

        try {
            // 1. Run local OCR with Tesseract
            const result = await Tesseract.recognize(
                imagePreview,
                'eng',
                { logger: m => {
                    if(m.status === 'recognizing text') {
                        setProgress(Math.floor(m.progress * 100));
                    }
                }}
            );

            const text = result.data.text;
            
            // 2. Extract potential medicine names (simple heuristic: words > 4 chars, capitalized or specific patterns)
            // In a real app this NLP step would be more robust.
            const words = text.split(/\s+/)
                .map(w => w.replace(/[^a-zA-Z]/g, ''))
                .filter(w => w.length > 4); 
            
            // Deduplicate and take top likely drug names
            const extractedKeywords = [...new Set(words)].slice(0, 10);

            if(extractedKeywords.length === 0) {
                setResults({
                    rawText: text,
                    products: [],
                    message: "Could not clearly identify medicine names. Please ensure the prescription is legible."
                });
                setAnalyzing(false);
                return;
            }

            // 3. Match against the store DB
            const res = await fetch('/api/products/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keywords: extractedKeywords })
            });

            const data = await res.json();

            setResults({
                rawText: text,
                products: data.success ? data.products : [],
                message: data.products?.length > 0 
                  ? "We found the following products matching your prescription." 
                  : "No matching products found in our inventory."
            });

        } catch (error) {
            console.error(error);
            setResults({ error: "Failed to analyze the prescription. Please try another image." });
        } finally {
            setAnalyzing(false);
            setProgress(100);
        }
    };

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            <div className="container" style={{ marginTop: '120px', maxWidth: '900px', padding: '0 20px', marginBottom: '40px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '10px', color: '#047857' }}>
                    <i className="fa-solid fa-file-prescription"></i> AI Prescription Analyzer
                </h1>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
                    Upload a clear photo of your prescription. Our local AI will read it and find the medicines in our store automatically!
                </p>

                <div className="glass" style={{ padding: '30px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                        
                        {/* Upload Area */}
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                width: '100%',
                                maxWidth: '500px',
                                height: '250px',
                                border: '2px dashed #10B981',
                                borderRadius: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: analyzing ? 'not-allowed' : 'pointer',
                                background: '#F0FDF4',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.2s'
                            }}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Prescription" style={{ width: '100%', height: '100%', objectFit: 'contain', zIndex: 1 }} />
                            ) : (
                                <>
                                    <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '3rem', color: '#10B981', marginBottom: '15px' }}></i>
                                    <span style={{ color: '#047857', fontWeight: 'bold' }}>Click to upload prescription</span>
                                    <span style={{ color: '#6EE7B7', fontSize: '0.85rem', marginTop: '5px' }}>JPEG, PNG, WebP</span>
                                </>
                            )}
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                                disabled={analyzing}
                            />
                        </div>

                        {/* Analyze Button */}
                        <button 
                             onClick={handleAnalyze}
                             disabled={analyzing || !imagePreview}
                             style={{
                                 background: analyzing || !imagePreview ? '#9CA3AF' : '#059669',
                                 color: 'white',
                                 padding: '15px 30px',
                                 borderRadius: '12px',
                                 border: 'none',
                                 fontSize: '1.1rem',
                                 fontWeight: 'bold',
                                 cursor: analyzing || !imagePreview ? 'not-allowed' : 'pointer',
                                 transition: 'all 0.2s',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 gap: '10px',
                                 width: '100%',
                                 maxWidth: '500px'
                             }}
                         >
                             {analyzing ? (
                                 <><i className="fa-solid fa-spinner fa-spin"></i> Analyzing image... {progress}%</>
                             ) : (
                                 <><i className="fa-solid fa-microchip"></i> Extract Medicines</>
                             )}
                         </button>
                    </div>

                    {/* Results Area */}
                    {results && !analyzing && (
                        <div style={{ marginTop: '40px', animation: 'fadeIn 0.5s ease-in' }}>
                            <h3 style={{ borderBottom: '2px solid #E5E7EB', paddingBottom: '10px', marginBottom: '20px' }}>
                                Extracted Medicines
                            </h3>
                            
                            {results.error ? (
                                <div style={{ color: '#DC2626', background: '#FEF2F2', padding: '15px', borderRadius: '8px' }}>
                                    {results.error}
                                </div>
                            ) : (
                                <>
                                    <p style={{ color: '#047857', fontWeight: 'bold', marginBottom: '20px' }}>{results.message}</p>
                                    
                                    {results.products?.length > 0 ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                                            {results.products.map(p => (
                                                <div key={p.id} style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', background: 'white' }}>
                                                    <div style={{ width: '100%', height: '120px', position: 'relative' }}>
                                                        <Image src={p.image || "/images/placeholder.jpg"} alt={p.name} fill style={{ objectFit: 'contain' }} />
                                                    </div>
                                                    <div>
                                                        <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem' }}>{p.name}</h4>
                                                        <span style={{ color: '#6B7280', fontSize: '0.85rem' }}>{p.category}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                                        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#059669' }}>₹{p.price.toFixed(2)}</span>
                                                        <button 
                                                            onClick={() => {
                                                                addToCart({ ...p, quantity: 1 });
                                                                toggleCart();
                                                            }}
                                                            style={{ background: '#059669', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                                        >
                                                            Add to Cart
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ background: '#F3F4F6', padding: '15px', borderRadius: '8px', fontSize: '0.9rem', color: '#4B5563' }}>
                                            <strong>Raw text detected:</strong><br/>
                                            {results.rawText || "No text detected."}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                <MedicalDisclaimer />
            </div>
        </>
    );
}
