"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSpecialtiesFromQuery } from "@/lib/medical-intent";

export default function VoiceAIAssistant() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    
    // next/navigation's useRouter is safe to use in client components
    const router = useRouter(); 
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.lang = "en-IN";

                recognition.onresult = (event) => {
                    const current = event.resultIndex;
                    const result = event.results[current][0].transcript;
                    setTranscript(result);
                    processVoiceAction(result);
                };

                recognition.onerror = (event) => {
                    console.error("Speech recognition error", event.error);
                    stopListening();
                };

                recognition.onend = () => {
                    setIsListening(false);
                };

                recognitionRef.current = recognition;
            }
        }
    }, []);

    const toggleVoice = () => {
        if (!recognitionRef.current) {
            alert("Your browser does not support voice recognition.");
            return;
        }

        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const startListening = () => {
        setIsOpen(true);
        setTranscript("");
        setAiResponse("Listening... Please tell me your symptoms or requirements.");
        setIsListening(true);
        recognitionRef.current.start();
    };

    const stopListening = () => {
        setIsListening(false);
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    const speakOutLoud = (text) => {
        if (typeof window !== 'undefined' && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "en-IN";
            utterance.pitch = 1.1;
            utterance.rate = 1;
            window.speechSynthesis.speak(utterance);
        }
    };

    const processVoiceAction = (text) => {
        const query = text.toLowerCase();
        let reply = "I didn't quite catch that. Could you please specify your symptoms or a doctor?";
        let redirectUrl = null;

        const specialties = getSpecialtiesFromQuery(query);

        // Advanced local intent system mimicking an LLM 
        if (specialties.length > 0) {
            const targetSpecialty = specialties[0];
            reply = `I understand. You might need a ${targetSpecialty}. Let me find the top verified specialists for you now.`;
            redirectUrl = `/en/doctors?q=${encodeURIComponent(text)}`;
        } else if (query.includes("ambulance") || query.includes("emergency") || query.includes("accident")) {
            reply = "This sounds critical. I am connecting you to the 24/7 Emergency Ambulance directory immediately.";
            redirectUrl = "/en/ambulance";
        } else if (query.includes("lab") || query.includes("blood test") || query.includes("test") || query.includes("pathology")) {
            reply = "Sure, I am locating the best diagnostic labs nearby for your physical tests.";
            redirectUrl = "/en/labs";
        } else if (query.includes("medicine") || query.includes("pill") || query.includes("pharmacy")) {
            reply = "I will connect you to our Swastik pharmacy platform to order your medicine right away.";
            redirectUrl = "/en/medicine";
        } else if (query.includes("home") || query.includes("dashboard")) {
            reply = "Taking you back to the main dashboard.";
            redirectUrl = "/en";
        } else {
            reply = "Searching our Swastik directory for " + text;
            redirectUrl = `/en/doctors?q=${encodeURIComponent(text)}`;
        }

        setAiResponse(reply);
        speakOutLoud(reply);

        if (redirectUrl) {
            // Give user 3.5 seconds to hear the voice before navigating entirely
            setTimeout(() => {
                router.push(redirectUrl);
                setIsOpen(false);
            }, 3500);
        }
    };

    if (!isOpen && !isListening) {
        return (
            <button 
                onClick={startListening}
                className="fixed bottom-6 left-6 z-[60] bg-indigo-600 text-white w-16 h-16 rounded-full flex justify-center items-center shadow-xl hover:scale-110 hover:bg-indigo-700 transition-all group"
                aria-label="Voice AI Assistant"
            >
                <i className="fa-solid fa-microphone text-2xl group-hover:animate-pulse"></i>
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white animate-bounce shadow-sm">AI</span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 left-6 z-[60] w-80 bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col transition-all duration-300 animate-in slide-in-from-bottom-5 translate-y-0">
            <div className="bg-indigo-600 p-5 flex justify-between items-center text-white relative overflow-hidden shadow-inner">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-rose-400 border border-indigo-400 ${isListening ? 'animate-ping' : ''}`}></div>
                    <span className="font-black text-xs uppercase tracking-widest relative z-10 text-indigo-50">Swastik Voice AI</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-indigo-200 hover:text-white relative z-10 active:scale-90 transition-transform">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>
            
            <div className="p-6 bg-slate-50 flex flex-col gap-5 min-h-[160px] justify-end relative">
                <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-black/5 to-transparent"></div>
                {transcript && (
                    <div className="self-end max-w-[85%] bg-indigo-100 p-4 rounded-3xl rounded-br-sm border border-indigo-200 shadow-sm animate-in fade-in slide-in-from-right-4">
                        <p className="text-xs font-bold text-indigo-900 leading-relaxed">
                            "{transcript}"
                        </p>
                    </div>
                )}
                
                <div className="flex gap-3 animate-in fade-in slide-in-from-left-4">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 border-2 border-indigo-100 shadow-sm">
                        <i className="fa-solid fa-robot text-indigo-500 text-xs"></i>
                    </div>
                    <div className="bg-white p-4 rounded-3xl rounded-tl-sm border border-slate-200 shadow-sm max-w-[80%]">
                        <p className="text-[11px] font-bold text-slate-600 leading-relaxed">
                            {aiResponse}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-5 bg-white border-t border-slate-100 flex justify-center pb-8 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
                <button 
                    onClick={toggleVoice} 
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all active:scale-95 border-4 \${isListening ? 'bg-rose-500 hover:bg-rose-600 border-rose-200 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700 border-indigo-200'}`}
                >
                    <i className={`fa-solid \${isListening ? 'fa-stop' : 'fa-microphone'} text-2xl`}></i>
                </button>
            </div>
        </div>
    );
}
