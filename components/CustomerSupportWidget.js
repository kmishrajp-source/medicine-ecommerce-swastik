"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Menu, ThumbsUp, Paperclip, Smile, MessageSquare, X } from 'lucide-react';

const CustomerSupportWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "👋 Hi! How can we help?", sender: "agent" }
    ]);
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef(null);

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = (text = inputValue) => {
        if (!text.trim()) return;
        
        // Add user message
        const newMsg = { id: Date.now(), text: text.trim(), sender: "user" };
        setMessages(prev => [...prev, newMsg]);
        setInputValue("");

        // Simulate agent typing
        setTimeout(() => {
            setMessages(prev => [...prev, { 
                id: Date.now(), 
                text: "Thanks for reaching out! A support agent will be with you shortly.", 
                sender: "agent" 
            }]);
        }, 1500);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    const handleQuickReply = (text) => {
        handleSend(text);
    };

    return (
        <div style={{ position: 'fixed', bottom: '6rem', right: '2rem', zIndex: 9998, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            
            {/* Chat Popup Window */}
            <div style={{
                display: isOpen ? 'flex' : 'none',
                flexDirection: 'column',
                width: '350px',
                height: '520px',
                backgroundColor: '#f6f8f9',
                borderRadius: '12px',
                boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                overflow: 'hidden',
                marginBottom: '1rem',
                transformOrigin: 'bottom right',
                animation: 'popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                <style>{`
                    @keyframes popIn {
                        from { opacity: 0; transform: scale(0.9) translateY(20px); }
                        to { opacity: 1; transform: scale(1) translateY(0); }
                    }
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 5px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background-color: rgba(0,0,0,0.1);
                        border-radius: 10px;
                    }
                `}</style>
                
                {/* Header */}
                <div style={{ 
                    backgroundColor: '#0ba360', 
                    color: 'white', 
                    padding: '16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    zIndex: 2
                }}>
                    <div style={{ width: '24px' }}></div> {/* Spacer to center title if needed, or keep Chevron */}
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '500', letterSpacing: '0.3px', flex: 1, textAlign: 'center' }}>
                        Customer Support
                    </h3>
                    <button onClick={toggleChat} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }} title="Minimize">
                        <X size={24} />
                    </button>
                </div>

                {/* Chat Body */}
                <div className="custom-scrollbar" style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    padding: '20px 15px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px',
                    position: 'relative'
                }}>
                    {messages.map((msg, idx) => (
                        <div key={msg.id} style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            marginTop: (idx === 0 || messages[idx-1].sender !== msg.sender) ? '10px' : '0'
                        }}>
                            {msg.sender === 'agent' && (idx === 0 || messages[idx-1].sender !== 'agent') && (
                                <span style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px', marginLeft: '45px' }}>
                                    Customer Support
                                </span>
                            )}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', maxWidth: '85%' }}>
                                {msg.sender === 'agent' && (
                                    <div style={{ 
                                        width: '35px', 
                                        height: '35px', 
                                        borderRadius: '50%', 
                                        backgroundColor: '#e5e7eb', 
                                        flexShrink: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        border: '1px solid #f3f4f6'
                                    }}>
                                        {/* Generic Avatar Image resembling the boy in the mockup */}
                                        <img 
                                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=e5e7eb" 
                                            alt="Agent" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}
                                
                                <div style={{
                                    padding: '10px 14px',
                                    borderRadius: '12px',
                                    backgroundColor: msg.sender === 'user' ? '#0ba360' : '#0ba360',
                                    color: 'white',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.4',
                                    borderBottomLeftRadius: msg.sender === 'agent' ? '4px' : '12px',
                                    borderBottomRightRadius: msg.sender === 'user' ? '4px' : '12px',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Quick Replies (Only show if last message is agent's first message) */}
                    {messages.length === 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', marginTop: '10px' }}>
                            <button 
                                onClick={() => handleQuickReply("I have a question")}
                                style={{
                                    backgroundColor: 'white',
                                    color: '#0ba360',
                                    border: '1px solid #0ba360',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}
                            >
                                I have a question
                            </button>
                            <button 
                                onClick={() => handleQuickReply("Tell me more")}
                                style={{
                                    backgroundColor: 'white',
                                    color: '#0ba360',
                                    border: '1px solid #0ba360',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}
                            >
                                Tell me more
                            </button>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{ 
                    backgroundColor: 'white', 
                    padding: '12px 16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    borderTop: '1px solid #e5e7eb',
                    gap: '10px'
                }}>
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type here and press enter.." 
                        style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            fontSize: '0.95rem',
                            color: '#374151',
                            background: 'transparent'
                        }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4b5563' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex' }}>
                            <ThumbsUp size={20} strokeWidth={1.5} />
                        </button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex' }}>
                            <Paperclip size={20} strokeWidth={1.5} />
                        </button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex' }}>
                            <Smile size={20} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating Trigger Button */}
            {!isOpen && (
                <button 
                    onClick={toggleChat}
                    style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        backgroundColor: '#0ba360',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(11, 163, 96, 0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    aria-label="Open Customer Support"
                >
                    <MessageSquare size={28} />
                </button>
            )}
        </div>
    );
};

export default CustomerSupportWidget;
