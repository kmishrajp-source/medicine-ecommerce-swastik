"use client";
import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";

export default function AIAssistant() {
    const { cartCount, toggleCart } = useCart();
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm your Swastik AI Assistant. You can ask me about medicines, dosages, or general health concerns. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const res = await fetch('/api/ai-assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage })
            });

            const data = await res.json();
            if (data.success) {
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: data.response,
                    sources: data.sources,
                    disclaimer: data.disclaimer 
                }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble processing that right now. Please try again or consult a doctor." }]);
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: "An error occurred. Please check your connection." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            <div className="container" style={{ marginTop: '100px', maxWidth: '900px', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', padding: '20px' }}>
                
                <div style={{ marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '1.8rem', color: '#1E3A8A', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="fa-solid fa-robot" style={{ color: '#3B82F6' }}></i> Swastik AI Medicine Assistant
                    </h1>
                    <MedicalDisclaimer />
                </div>

                {/* Chat Area */}
                <div className="glass" style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.3)' }}>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{ 
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '80%',
                                background: msg.role === 'user' ? '#3B82F6' : 'white',
                                color: msg.role === 'user' ? 'white' : '#1F2937',
                                padding: '12px 18px',
                                borderRadius: msg.role === 'user' ? '18px 18px 0 18px' : '18px 18px 18px 0',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                                lineContent: '1.5',
                                position: 'relative'
                            }}>
                                <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
                                    {msg.content}
                                </div>
                                {msg.sources && msg.sources.length > 0 && (
                                    <div style={{ fontSize: '0.75rem', marginTop: '8px', opacity: 0.7, fontStyle: 'italic' }}>
                                        Source: {msg.sources.join(", ")}
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div style={{ alignSelf: 'flex-start', background: 'white', padding: '12px 18px', borderRadius: '18px 18px 18px 0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                <i className="fa-solid fa-ellipsis fa-fade"></i> AI is thinking...
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} style={{ padding: '20px', borderTop: '1px solid #E5E7EB', background: 'white', display: 'flex', gap: '12px' }}>
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about Paracetamol dosage, fever advice..."
                            style={{
                                flex: 1,
                                padding: '12px 20px',
                                borderRadius: '25px',
                                border: '2px solid #E5E7EB',
                                outline: 'none',
                                fontSize: '1rem',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                            onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                        />
                        <button 
                            type="submit" 
                            disabled={loading || !input.trim()}
                            style={{
                                background: '#3B82F6',
                                color: 'white',
                                width: '45px',
                                height: '45px',
                                borderRadius: '50%',
                                border: 'none',
                                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                                transition: 'transform 0.1s'
                            }}
                            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
                            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <i className="fa-solid fa-paper-plane"></i>
                        </button>
                    </form>
                </div>

                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '10px' }}>
                    Powered by Swastik Health Engine & OpenFDA API
                </p>
            </div>
        </>
    );
}
