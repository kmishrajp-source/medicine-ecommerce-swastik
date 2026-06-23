"use client";
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function SwastikChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "assistant", text: "Hi! I'm Sofiya, your Swastik AI Assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Listen for external trigger (e.g. from AIRecoveryAssistant "Talk to Dispatch" button)
    useEffect(() => {
        const handleExternalOpen = async (e) => {
            setIsOpen(true);
            if (e.detail?.message) {
                const autoMsg = e.detail.message;
                setMessages(prev => [...prev, { role: "user", text: autoMsg }]);
                setIsLoading(true);
                try {
                    const res = await fetch("/api/ai-assistant", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ message: autoMsg })
                    });
                    const data = await res.json();
                    if (data.success) {
                        setMessages(prev => [...prev, { role: "assistant", text: data.response }]);
                    }
                } catch (err) {
                    setMessages(prev => [...prev, { role: "assistant", text: "Our team has been alerted. Please also try WhatsApp at +91-7992122974 for instant support." }]);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        window.addEventListener('swastik:open-chat', handleExternalOpen);
        return () => window.removeEventListener('swastik:open-chat', handleExternalOpen);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userText = input.trim();
        setMessages(prev => [...prev, { role: "user", text: userText }]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/ai-assistant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userText })
            });
            const data = await res.json();
            
            if (data.success) {
                setMessages(prev => [...prev, { role: "assistant", text: data.response }]);
            } else {
                setMessages(prev => [...prev, { role: "assistant", text: "Sorry, I encountered an error." }]);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { role: "assistant", text: "Network error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="w-80 sm:w-96 h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 border border-slate-200 animate-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="bg-indigo-600 text-white p-4 flex justify-between items-center shadow-md z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <i className="fa-solid fa-robot text-xl"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Swastik AI Support</h3>
                                <p className="text-xs text-indigo-200 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-400"></span> Online
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-indigo-200 hover:text-white transition-colors p-2">
                            <i className="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl ${
                                    msg.role === "user" 
                                    ? "bg-indigo-600 text-white rounded-br-sm" 
                                    : "bg-white text-slate-700 border border-slate-200 rounded-bl-sm shadow-sm"
                                }`}>
                                    <div className="text-sm prose prose-sm max-w-none prose-p:leading-relaxed prose-a:text-indigo-500">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm p-3 shadow-sm flex items-center gap-1">
                                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-slate-200">
                        <form onSubmit={handleSend} className="relative flex items-center">
                            <input 
                                type="text" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..." 
                                className="w-full bg-slate-100 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-0 rounded-full py-2.5 pl-4 pr-12 text-sm transition-all"
                            />
                            <button 
                                type="submit" 
                                disabled={!input.trim() || isLoading}
                                className="absolute right-1 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center disabled:opacity-50 hover:bg-indigo-700 transition-colors"
                            >
                                <i className="fa-solid fa-paper-plane text-xs relative -left-0.5"></i>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-indigo-600 rounded-full shadow-2xl flex justify-center items-center text-white hover:scale-110 hover:bg-indigo-700 transition-all group relative"
                >
                    <i className="fa-solid fa-comment-dots text-2xl group-hover:scale-110 transition-transform"></i>
                    <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-white rounded-full animate-ping"></span>
                    <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-white rounded-full"></span>
                </button>
            )}
        </div>
    );
}
