"use client";
import React, { useState, useRef, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ResearchAIAssistant() {
    const { cartCount, toggleCart } = useCart();
    const [messages, setMessages] = useState([
        { 
            role: 'assistant', 
            content: 'Hello. I am the Swastik AI Research & Bioinformatics Assistant. How can I assist you today with literature review, genomic data interpretation, or clinical research analysis? \n\n*Please note: I provide research insights, not medical advice.*' 
        }
    ]);
    const [input, setInput] = useState('');
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
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            // Send only the conversation history (excluding the hardcoded initial greeting to save tokens, or include it if small)
            const res = await fetch('/api/research/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages })
            });

            const data = await res.json();
            
            if (data.success && data.message) {
                setMessages([...newMessages, data.message]);
            } else {
                setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error while processing your research query. Please try again.' }]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages([...newMessages, { role: 'assistant', content: 'Network error. Could not reach the research servers.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            {/* Header */}
            <div className="bg-indigo-900 pt-28 pb-8 px-6 text-white border-b border-indigo-800">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black mb-1 flex items-center gap-3">
                            <i className="fa-solid fa-microscope text-indigo-400"></i>
                            AI Research Assistant
                        </h1>
                        <p className="text-indigo-200 text-sm">Bioinformatics & Clinical Literature Intelligence</p>
                    </div>
                    <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold border border-white/20 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Model Active
                    </div>
                </div>
            </div>

            {/* Chat Interface */}
            <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8 flex flex-col h-[calc(100vh-250px)]">
                {/* Messages Area */}
                <div className="flex-grow bg-white rounded-t-2xl shadow-sm border border-slate-200 p-6 overflow-y-auto mb-0 scrollbar-thin scrollbar-thumb-slate-200">
                    <div className="space-y-6">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                                    msg.role === 'user' 
                                    ? 'bg-indigo-600 text-white rounded-br-sm shadow-md' 
                                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-sm'
                                }`}>
                                    <div className="flex items-center gap-2 mb-2 opacity-80 text-xs font-bold uppercase tracking-wider">
                                        {msg.role === 'user' ? (
                                            <><i className="fa-solid fa-user"></i> You</>
                                        ) : (
                                            <><i className="fa-solid fa-robot"></i> Swastik AI</>
                                        )}
                                    </div>
                                    <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-800 prose-pre:text-slate-100">
                                        {msg.role === 'user' ? (
                                            msg.content
                                        ) : (
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.content}
                                            </ReactMarkdown>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-bl-sm px-5 py-4 flex items-center gap-3">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                                    </div>
                                    <span className="text-xs font-medium text-slate-500">Analyzing literature...</span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="bg-white rounded-b-2xl shadow-sm border border-slate-200 border-t-0 p-4">
                    <form onSubmit={handleSend} className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about biomarkers, clinical trials, or genomic data..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-14 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 text-white w-10 h-10 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                            <i className="fa-solid fa-paper-plane text-sm"></i>
                        </button>
                    </form>
                    <p className="text-center text-[10px] text-slate-400 mt-3 font-medium uppercase tracking-wider">
                        AI can make mistakes. Always verify scientific and clinical information.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
