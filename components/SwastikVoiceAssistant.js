"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";

export default function SwastikVoiceAssistant() {
    const { data: session } = useSession();
    const router = useRouter();

    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // UI State
    const [transcript, setTranscript] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [understoodIntent, setUnderstoodIntent] = useState("");
    const [resultsData, setResultsData] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [isElderlyMode, setIsElderlyMode] = useState(false);

    // Settings
    const [selectedLang, setSelectedLang] = useState("auto"); // auto, en, hi, bn

    const recognitionRef = useRef(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = false;
                
                // Set language based on selection or fallback to auto/en-IN
                if (selectedLang === 'hi') recognition.lang = "hi-IN";
                else if (selectedLang === 'bn') recognition.lang = "bn-IN";
                else recognition.lang = "en-IN"; // Browser's default for auto might be tricky

                recognition.onresult = (event) => {
                    const current = event.resultIndex;
                    const result = event.results[current][0].transcript;
                    setTranscript(result);
                    processVoiceAction(result);
                };

                recognition.onerror = (event) => {
                    console.error("Speech recognition error", event.error);
                    setErrorMsg("I couldn't hear you clearly. Please try again.");
                    stopListening();
                };

                recognition.onend = () => {
                    setIsListening(false);
                };

                recognitionRef.current = recognition;
            }
        }
    }, [selectedLang]);

    const toggleVoice = () => {
        if (!recognitionRef.current) {
            setErrorMsg("VOICE ENGINE – BROWSER NOT SUPPORTED");
            setIsOpen(true);
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
        setAiResponse("Listening...");
        setUnderstoodIntent("");
        setResultsData(null);
        setErrorMsg("");
        setIsListening(true);
        setIsProcessing(false);
        recognitionRef.current.start();
    };

    const stopListening = () => {
        setIsListening(false);
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    const speakOutLoud = async (text, forceBrowserFallback = true) => {
        if (!text) return;

        // Try to use our backend TTS service
        try {
            const res = await axios.post('/api/speech/synthesize', { text, lang: selectedLang });
            if (res.data.success && res.data.audioUrl) {
                const audio = new Audio(res.data.audioUrl);
                audio.play();
                return;
            }
            if (res.data.error === "CONFIGURATION_REQUIRED") {
                setErrorMsg(res.data.message);
            }
        } catch (e) {
            console.error("TTS Backend Error", e);
        }

        // Fallback to browser TTS if backend is unconfigured
        if (forceBrowserFallback && typeof window !== 'undefined' && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            
            if (selectedLang === 'hi') utterance.lang = "hi-IN";
            else if (selectedLang === 'bn') utterance.lang = "bn-IN";
            else utterance.lang = "en-IN";
            
            window.speechSynthesis.speak(utterance);
        }
    };

    const processVoiceAction = async (text) => {
        setIsProcessing(true);
        setAiResponse("Understanding...");
        
        try {
            const res = await axios.post('/api/speech/recognize', { 
                transcript: text, 
                detectedLang: selectedLang,
                userId: session?.user?.id 
            });

            if (res.data.success) {
                setUnderstoodIntent(res.data.intent || "Unknown Intent");
                setResultsData(res.data.data);
                
                // Generate a conversational reply based on the structured data
                let reply = "I found some results for you.";
                
                if (res.data.data?.found === false) {
                    reply = res.data.data.message;
                } else if (res.data.intent === "AMBULANCE") {
                    reply = "Connecting you to emergency ambulance services immediately.";
                } else if (res.data.intent === "MEDICINE_SEARCH") {
                    reply = "I found the medicine details. Would you like to order it?";
                    // Speak the safety disclaimer if present
                    if (res.data.data?.safetyDisclaimer) {
                        reply += " " + res.data.data.safetyDisclaimer;
                    }
                } else if (res.data.intent === "HOSPITAL_SEARCH") {
                    reply = "Here are the top hospitals matching your criteria.";
                } else if (res.data.intent === "LAB_SEARCH") {
                    reply = "I found the lab tests you requested.";
                }

                setAiResponse(reply);
                speakOutLoud(reply);

                // Handle Auto-Routing for certain intents
                if (res.data.intent === "AMBULANCE") {
                    setTimeout(() => { router.push("/ambulance"); setIsOpen(false); }, 3000);
                }

            } else {
                setErrorMsg("Processing failed. Please try again.");
                setAiResponse("I'm sorry, I couldn't process that.");
            }
        } catch (error) {
            console.error(error);
            setErrorMsg("Network Error.");
            setAiResponse("I'm sorry, I couldn't connect to the server.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen && !isListening) {
        return (
            <button 
                onClick={startListening}
                className="fixed bottom-24 md:bottom-6 left-4 md:left-6 z-[60] bg-indigo-600 text-white w-16 h-16 rounded-full flex justify-center items-center shadow-xl hover:scale-110 hover:bg-indigo-700 transition-all group"
                aria-label="Voice AI Assistant"
            >
                <i className="fa-solid fa-microphone text-2xl group-hover:animate-pulse"></i>
                <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white animate-bounce shadow-sm">AI</span>
            </button>
        );
    }

    return (
        <div className={`fixed bottom-24 md:bottom-6 left-4 md:left-6 z-[60] bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col transition-all duration-300 animate-in slide-in-from-bottom-5 translate-y-0 \${isElderlyMode ? 'w-[90vw] md:w-96 min-h-[500px]' : 'w-80 min-h-[350px]'}`}>
            
            {/* Header */}
            <div className="bg-indigo-600 p-5 flex justify-between items-center text-white shadow-inner">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-rose-400 border border-indigo-400 \${isListening ? 'animate-ping' : ''}`}></div>
                    <span className="font-black text-xs uppercase tracking-widest text-indigo-50">Voice Intelligence</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsElderlyMode(!isElderlyMode)} className="text-indigo-200 hover:text-white" title="Elderly Mode">
                        <i className="fa-solid fa-person-cane"></i>
                    </button>
                    <button onClick={() => setIsOpen(false)} className="text-indigo-200 hover:text-white">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>

            {/* Language Selector */}
            {!isListening && !transcript && (
                <div className="bg-slate-100 p-2 flex justify-center gap-2 border-b border-slate-200">
                    <select 
                        value={selectedLang} 
                        onChange={(e) => setSelectedLang(e.target.value)}
                        className="bg-white border border-slate-300 text-xs font-bold rounded-lg px-2 py-1 outline-none text-slate-700"
                    >
                        <option value="auto">Auto Detect Language</option>
                        <option value="en">English</option>
                        <option value="hi">हिन्दी (Hindi)</option>
                        <option value="bn">বাংলা (Bengali)</option>
                    </select>
                </div>
            )}
            
            {/* Main Content Area */}
            <div className="p-6 bg-slate-50 flex flex-col gap-4 flex-1 overflow-y-auto">
                
                {/* Configuration Error */}
                {errorMsg && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-bold text-center">
                        <i className="fa-solid fa-triangle-exclamation mr-1"></i> {errorMsg}
                    </div>
                )}

                {/* What I heard */}
                {transcript && (
                    <div className="self-end max-w-[85%] bg-indigo-100 p-4 rounded-3xl rounded-br-sm border border-indigo-200 shadow-sm animate-in fade-in slide-in-from-right-4">
                        <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">What I heard</div>
                        <p className="text-xs font-bold text-indigo-900 leading-relaxed">
                            "{transcript}"
                        </p>
                    </div>
                )}
                
                {/* What I understood & Results */}
                {(isProcessing || aiResponse) && (
                    <div className="flex gap-3 animate-in fade-in slide-in-from-left-4">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 border-2 border-indigo-100 shadow-sm">
                            <i className={`fa-solid fa-robot text-indigo-500 text-xs \${isProcessing ? 'fa-spin' : ''}`}></i>
                        </div>
                        <div className="bg-white p-4 rounded-3xl rounded-tl-sm border border-slate-200 shadow-sm w-full">
                            {understoodIntent && (
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                    Intent: {understoodIntent}
                                </div>
                            )}
                            <p className="\${isElderlyMode ? 'text-lg font-black' : 'text-[11px] font-bold'} text-slate-700 leading-relaxed">
                                {aiResponse}
                            </p>

                            {/* Show basic structured result if available */}
                            {resultsData && resultsData.found !== false && (
                                <div className="mt-3 bg-slate-50 p-2 rounded-xl text-[10px] text-slate-600 border border-slate-100">
                                    Result loaded. Check main screen or say "Confirm".
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Elderly Mode Prompts */}
                {isElderlyMode && !transcript && !isListening && (
                    <div className="mt-auto grid grid-cols-2 gap-2">
                        <button onClick={() => processVoiceAction("I want to order medicine")} className="bg-white border border-slate-200 p-2 rounded-xl text-xs font-bold text-slate-600">Medicine</button>
                        <button onClick={() => processVoiceAction("Find a doctor")} className="bg-white border border-slate-200 p-2 rounded-xl text-xs font-bold text-slate-600">Doctor</button>
                        <button onClick={() => processVoiceAction("Book a lab test")} className="bg-white border border-slate-200 p-2 rounded-xl text-xs font-bold text-slate-600">Lab Test</button>
                        <button onClick={() => processVoiceAction("I need an ambulance")} className="bg-rose-50 border border-rose-200 text-rose-600 p-2 rounded-xl text-xs font-bold">Ambulance</button>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="p-5 bg-white border-t border-slate-100 flex justify-center pb-8 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
                <button 
                    onClick={toggleVoice} 
                    className={`\${isElderlyMode ? 'w-24 h-24 text-4xl' : 'w-16 h-16 text-2xl'} rounded-full flex items-center justify-center text-white shadow-xl transition-all active:scale-95 border-4 \${isListening ? 'bg-rose-500 hover:bg-rose-600 border-rose-200 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700 border-indigo-200'}`}
                >
                    <i className={`fa-solid \${isListening ? 'fa-stop' : 'fa-microphone'}`}></i>
                </button>
            </div>
        </div>
    );
}
