"use client";
import React, { useState } from 'react';
import { MessageSquare, X, Phone, MessageCircle, HelpCircle, Package, Send } from 'lucide-react';

const SupportHub = () => {
    const [isOpen, setIsOpen] = useState(false);
    
    const phoneNumber = '917992122974';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent("Hello! I need help with Swastik Medicare.")}`;
    
    const toggleHub = () => setIsOpen(!isOpen);

    const supportOptions = [
        {
            icon: <MessageCircle size={20} className="text-emerald-500" />,
            title: "WhatsApp Support",
            description: "Chat with us instantly",
            link: whatsappUrl,
            color: "hover:bg-emerald-50"
        },
        {
            icon: <Phone size={20} className="text-blue-500" />,
            title: "Emergency Call",
            description: "Talk to a representative",
            link: `tel:+${phoneNumber}`,
            color: "hover:bg-blue-50"
        },
        {
            icon: <Package size={20} className="text-orange-500" />,
            title: "Request Medicine",
            description: "Tell us what you need",
            link: "/en/request-medicine",
            color: "hover:bg-orange-50"
        }
    ];

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
            {/* Hub Menu */}
            {isOpen && (
                <div className="mb-4 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-indigo-600 p-4 text-white">
                        <h3 className="font-bold text-sm">Swastik Support Hub</h3>
                        <p className="text-[10px] opacity-80 uppercase tracking-widest font-black">How can we help you today?</p>
                    </div>
                    
                    <div className="p-2">
                        {supportOptions.map((option, index) => (
                            <a 
                                key={index}
                                href={option.link}
                                target={option.link.startsWith('http') ? "_blank" : "_self"}
                                rel={option.link.startsWith('http') ? "noopener noreferrer" : ""}
                                className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${option.color} group`}
                            >
                                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-50">
                                    {option.icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xs font-bold text-slate-800">{option.title}</h4>
                                    <p className="text-[10px] text-slate-400">{option.description}</p>
                                </div>
                                <i className="fa-solid fa-chevron-right text-[10px] text-slate-300 group-hover:translate-x-1 transition-transform"></i>
                            </a>
                        ))}
                    </div>
                    
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Verified Business</span>
                        <div className="flex gap-2">
                            <i className="fa-brands fa-whatsapp text-slate-300"></i>
                            <i className="fa-solid fa-shield-halved text-slate-300"></i>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button 
                onClick={toggleHub}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 ${
                    isOpen ? 'bg-slate-900 text-white rotate-90' : 'bg-indigo-600 text-white'
                }`}
            >
                {isOpen ? <X size={28} /> : <HelpCircle size={28} />}
                
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-bounce"></span>
                )}
            </button>
        </div>
    );
};

export default SupportHub;
