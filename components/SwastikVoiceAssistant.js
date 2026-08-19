"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";

const LANG_LABELS = {
  hi: "🇮🇳 हिन्दी",
  "hi-IN": "🇮🇳 हिन्दी",
  bn: "🇧🇩 বাংলা",
  "bn-IN": "🇧🇩 বাংলা",
  en: "🇬🇧 English",
  "en-IN": "🇬🇧 English",
  hindi: "🇮🇳 हिन्दी",
  bengali: "🇧🇩 বাংলা",
  english: "🇬🇧 English",
  urdu: "اردو",
  telugu: "తెలుగు",
  marathi: "मराठी",
  tamil: "தமிழ்",
};

// Language cycling options for the browser SpeechRecognition API
const LANG_OPTIONS = [
  { code: "hi-IN", label: "हिन्दी", flag: "🇮🇳" },
  { code: "bn-IN", label: "বাংলা", flag: "🇧🇩" },
  { code: "en-IN", label: "English", flag: "🇬🇧" },
];

export default function SwastikVoiceAssistant() {
  const { data: session } = useSession();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [understoodIntent, setUnderstoodIntent] = useState("");
  const [detectedLang, setDetectedLang] = useState("");
  const [resultsData, setResultsData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isElderlyMode, setIsElderlyMode] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedLangIdx, setSelectedLangIdx] = useState(0); // 0=Hindi, 1=Bengali, 2=English
  const [interimText, setInterimText] = useState("");

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");

  // Check if browser supports SpeechRecognition
  const isSpeechSupported = () =>
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const speakOutLoud = (text, lang = "") => {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (lang === "hindi" || lang === "hi" || lang === "hi-IN") utterance.lang = "hi-IN";
    else if (lang === "bengali" || lang === "bn" || lang === "bn-IN") utterance.lang = "bn-IN";
    else utterance.lang = "en-IN";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const buildReply = (data) => {
    if (!data) return "I found some results for you.";
    const intent = data.intent;
    if (intent === "MEDICAL_AI") return data.data?.message || data.message || "Here is what I found.";
    if (data.data?.found === false) return data.data.message || "I couldn't find what you were looking for.";
    if (intent === "AMBULANCE") return "🚨 Connecting you to emergency ambulance services immediately!";
    if (intent === "MEDICINE_SEARCH") {
      let reply = "I found the medicine details.";
      if (data.data?.safetyDisclaimer) reply += " " + data.data.safetyDisclaimer;
      return reply;
    }
    if (intent === "HOSPITAL_SEARCH") return "Here are the top hospitals and doctors matching your query.";
    if (intent === "LAB_SEARCH") return "Here are the lab tests available near you.";
    if (intent === "DELIVERY_TRACK") return "To track your order, go to Profile → My Orders or tell me your order ID.";
    if (intent === "GENERAL_HELP") return data.data?.tip || "Hello! I can help you with medicines, doctors, lab tests, hospitals, and ambulances. Just ask!";
    return "I received your request. Let me find that for you.";
  };

  const processTranscriptText = async (text, langCode) => {
    if (!text || !text.trim()) {
      setErrorMsg("I didn't catch that. Please try speaking again.");
      setIsListening(false);
      return;
    }

    setIsProcessing(true);
    setInterimText("");
    setTranscript(text);
    setAiResponse("🧠 Analyzing your question...");

    try {
      const res = await axios.post("/api/speech/recognize", {
        transcript: text,
        detectedLang: langCode,
        userId: session?.user?.id,
      });

      if (res.data.success) {
        const reply = buildReply(res.data);
        setDetectedLang(langCode);
        setUnderstoodIntent(res.data.intent || "");
        setResultsData(res.data.data);
        setAiResponse(reply);
        setChatHistory((prev) => [
          ...prev,
          { role: "user", text, lang: langCode },
          { role: "ai", text: reply, intent: res.data.intent },
        ]);
        speakOutLoud(reply, langCode);
        if (res.data.intent === "AMBULANCE") {
          setTimeout(() => { router.push("/ambulance"); setIsOpen(false); }, 3000);
        }
      } else {
        const errText = "Sorry, I couldn't understand. Please try again.";
        setErrorMsg(errText);
        setAiResponse(errText);
        speakOutLoud(errText);
      }
    } catch (error) {
      console.error("Voice AI Error:", error);
      setErrorMsg("Could not connect. Please check your internet and try again.");
      setAiResponse("Connection error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const startListening = () => {
    if (!isSpeechSupported()) {
      setErrorMsg("Voice recognition is not supported in this browser. Please use Chrome or Edge.");
      setIsOpen(true);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    const currentLang = LANG_OPTIONS[selectedLangIdx];
    recognition.lang = currentLang.code;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    finalTranscriptRef.current = "";

    recognition.onstart = () => {
      setIsListening(true);
      setIsOpen(true);
      setErrorMsg("");
      setInterimText("");
      setAiResponse("");
      setTranscript("");
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript;
        setInterimText("");
      } else {
        setInterimText(interimTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error === "not-allowed") {
        setErrorMsg("Microphone access denied. Please allow mic permissions in your browser.");
      } else if (event.error === "no-speech") {
        setErrorMsg("No speech detected. Please speak clearly and try again.");
      } else if (event.error === "network") {
        setErrorMsg("Network error. Please check your internet connection.");
      } else {
        setErrorMsg(`Error: ${event.error}. Please try again.`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText("");
      const finalText = finalTranscriptRef.current.trim();
      if (finalText) {
        processTranscriptText(finalText, LANG_OPTIONS[selectedLangIdx].code);
      } else if (!errorMsg) {
        setErrorMsg("No speech detected. Tap the mic and try again.");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const cycleLang = () => {
    setSelectedLangIdx((prev) => (prev + 1) % LANG_OPTIONS.length);
  };

  const processTextAction = async (text) => {
    setIsProcessing(true);
    setAiResponse("Thinking...");
    setTranscript(text);
    setIsOpen(true);
    try {
      const res = await axios.post("/api/speech/recognize", {
        transcript: text,
        detectedLang: "en-IN",
        userId: session?.user?.id,
      });
      if (res.data.success) {
        const reply = buildReply(res.data);
        setUnderstoodIntent(res.data.intent || "");
        setResultsData(res.data.data);
        setAiResponse(reply);
        setChatHistory((prev) => [...prev, { role: "user", text }, { role: "ai", text: reply, intent: res.data.intent }]);
        speakOutLoud(reply, "english");
        if (res.data.intent === "AMBULANCE") {
          setTimeout(() => { router.push("/ambulance"); setIsOpen(false); }, 3000);
        }
      }
    } catch (err) {
      setAiResponse("Could not connect. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Floating trigger button
  if (!isOpen && !isListening) {
    return (
      <button
        onClick={startListening}
        className="fixed bottom-24 md:bottom-6 left-4 md:left-6 z-[60] bg-gradient-to-br from-indigo-600 to-violet-600 text-white w-16 h-16 rounded-full flex justify-center items-center shadow-2xl hover:scale-110 transition-all group"
        aria-label="Voice AI Assistant"
      >
        <i className="fa-solid fa-microphone text-2xl group-hover:animate-pulse"></i>
        <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white animate-bounce shadow-sm">AI</span>
      </button>
    );
  }

  const currentLang = LANG_OPTIONS[selectedLangIdx];

  return (
    <div
      className={`fixed bottom-24 md:bottom-6 left-4 md:left-6 z-[60] bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col transition-all duration-300 ${
        isElderlyMode ? "w-[90vw] md:w-96" : "w-[340px]"
      }`}
      style={{ maxHeight: "85vh" }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 flex justify-between items-center text-white shadow-inner flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full bg-rose-400 border border-indigo-400 ${isListening ? "animate-ping" : ""}`}></div>
          <div>
            <span className="font-black text-sm tracking-wide">Swastik Voice AI</span>
            <div className="text-[10px] text-indigo-200 font-semibold mt-0.5">
              {isListening ? `🎙️ Listening in ${currentLang.flag} ${currentLang.label}...` : `${currentLang.flag} ${currentLang.label} · Tap 🌐 to switch`}
            </div>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          {/* Language switcher */}
          <button onClick={cycleLang} className="text-indigo-200 hover:text-white text-sm" title="Switch Language">
            🌐
          </button>
          <button onClick={() => setIsElderlyMode(!isElderlyMode)} className="text-indigo-200 hover:text-white" title="Elderly Mode">
            <i className="fa-solid fa-person-cane text-sm"></i>
          </button>
          <button onClick={() => { setIsOpen(false); setIsListening(false); if (recognitionRef.current) recognitionRef.current.stop(); window.speechSynthesis?.cancel(); }} className="text-indigo-200 hover:text-white">
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-3">
        {/* Initial empty state */}
        {chatHistory.length === 0 && !isProcessing && !transcript && !isListening && (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">🎙️</div>
            <p className={`font-bold text-slate-600 ${isElderlyMode ? "text-lg" : "text-sm"}`}>
              Tap the mic and speak in any language
            </p>
            <p className="text-xs text-slate-400 mt-2">Hindi · Bengali · English · and more</p>
            <div className="flex justify-center gap-2 mt-3">
              {LANG_OPTIONS.map((l, i) => (
                <button
                  key={l.code}
                  onClick={() => setSelectedLangIdx(i)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                    selectedLangIdx === i
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  {l.flag} {l.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Listening animation */}
        {isListening && (
          <div className="flex flex-col items-center py-4 gap-3">
            <div className="flex gap-1 items-end h-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-2 bg-indigo-500 rounded-full animate-bounce" style={{ height: `${12 + (i % 3) * 8}px`, animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>
            <p className={`font-black text-indigo-600 ${isElderlyMode ? "text-xl" : "text-sm"}`}>🔴 Listening... Speak now</p>
            <p className="text-xs text-slate-400">बोलिए • বলুন • Speak</p>
            {interimText && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2 text-xs text-indigo-700 font-semibold max-w-[90%] text-center italic">
                "{interimText}"
              </div>
            )}
          </div>
        )}

        {/* Chat bubbles */}
        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
            {msg.role === "ai" && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0 mt-1">
                <i className="fa-solid fa-robot text-white text-[10px]"></i>
              </div>
            )}
            <div className={`max-w-[80%] ${isElderlyMode ? "text-base" : "text-xs"} font-semibold rounded-2xl px-4 py-3 ${
              msg.role === "user"
                ? "bg-indigo-100 text-indigo-900 rounded-tr-sm"
                : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
            }`}>
              {msg.role === "user" && msg.lang && (
                <div className="text-[9px] text-indigo-400 uppercase tracking-widest mb-1">
                  {LANG_LABELS[msg.lang] || msg.lang}
                </div>
              )}
              {msg.role === "ai" && msg.intent && (
                <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">
                  {msg.intent.replace(/_/g, " ")}
                </div>
              )}
              {msg.text}
            </div>
          </div>
        ))}

        {/* Processing state */}
        {isProcessing && (
          <div className="flex gap-2 justify-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-robot text-white text-[10px] fa-spin"></i>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 text-xs text-slate-500 font-semibold shadow-sm flex items-center gap-2">
              <span className="animate-pulse">Analyzing your question...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-bold text-center">
            <i className="fa-solid fa-triangle-exclamation mr-1"></i>{errorMsg}
          </div>
        )}

        {/* Elderly Mode Quick Actions */}
        {isElderlyMode && !isListening && chatHistory.length === 0 && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button onClick={() => processTextAction("मुझे दवा चाहिए")} className="bg-white border border-slate-200 p-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-indigo-50">💊 दवा</button>
            <button onClick={() => processTextAction("डॉक्टर चाहिए")} className="bg-white border border-slate-200 p-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-indigo-50">👨‍⚕️ डॉक्टर</button>
            <button onClick={() => processTextAction("blood test book karna hai")} className="bg-white border border-slate-200 p-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-indigo-50">🧪 Lab Test</button>
            <button onClick={() => processTextAction("ambulance chahiye")} className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-100">🚑 Ambulance</button>
          </div>
        )}
      </div>

      {/* Mic Control */}
      <div className="p-4 bg-white border-t border-slate-100 flex flex-col items-center gap-2 flex-shrink-0">
        <button
          onClick={toggleVoice}
          disabled={isProcessing}
          className={`${isElderlyMode ? "w-20 h-20 text-3xl" : "w-14 h-14 text-xl"} rounded-full flex items-center justify-center text-white shadow-xl transition-all active:scale-95 border-4 ${
            isProcessing
              ? "bg-slate-400 border-slate-200 cursor-not-allowed"
              : isListening
              ? "bg-rose-500 hover:bg-rose-600 border-rose-200 animate-pulse"
              : "bg-gradient-to-br from-indigo-600 to-violet-600 border-indigo-200 hover:scale-105"
          }`}
        >
          <i className={`fa-solid ${isProcessing ? "fa-spinner fa-spin" : isListening ? "fa-stop" : "fa-microphone"}`}></i>
        </button>
        <p className="text-[10px] text-slate-400 font-semibold">
          {isProcessing ? "Processing..." : isListening ? "Tap to Stop" : chatHistory.length > 0 ? "Tap to ask again" : "Tap to speak"}
        </p>
      </div>
    </div>
  );
}


  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [understoodIntent, setUnderstoodIntent] = useState("");
  const [detectedLang, setDetectedLang] = useState("");
  const [resultsData, setResultsData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isElderlyMode, setIsElderlyMode] = useState(false);
  const [chatHistory, setChatHistory] = useState([]); // running conversation

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const toggleVoice = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg("Voice recording not supported in this browser.");
      setIsOpen(true);
      return;
    }
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      setIsOpen(true);
      setTranscript("");
      setAiResponse("");
      setUnderstoodIntent("");
      setDetectedLang("");
      setResultsData(null);
      setErrorMsg("");
      setIsListening(true);
      setIsProcessing(false);

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        setIsListening(false);
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        processAudioAction(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
    } catch (err) {
      console.error("Microphone error:", err);
      setErrorMsg("Microphone access denied. Please allow permissions.");
      setIsOpen(true);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  /** Speak out the text using browser TTS with correct language locale */
  const speakOutLoud = (text, lang = "") => {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (lang === "hindi") utterance.lang = "hi-IN";
    else if (lang === "bengali") utterance.lang = "bn-IN";
    else if (lang === "tamil") utterance.lang = "ta-IN";
    else if (lang === "telugu") utterance.lang = "te-IN";
    else if (lang === "marathi") utterance.lang = "mr-IN";
    else utterance.lang = "en-IN";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const buildReply = (data) => {
    if (!data) return "I found some results for you.";
    const intent = data.intent;
    if (intent === "MEDICAL_AI") return data.data?.message || data.message || "Here is what I found.";
    if (data.data?.found === false) return data.data.message || "I couldn't find what you were looking for.";
    if (intent === "AMBULANCE") return "🚨 Connecting you to emergency ambulance services immediately!";
    if (intent === "MEDICINE_SEARCH") {
      let reply = "I found the medicine details.";
      if (data.data?.safetyDisclaimer) reply += " " + data.data.safetyDisclaimer;
      return reply;
    }
    if (intent === "HOSPITAL_SEARCH") return "Here are the top hospitals and doctors matching your query.";
    if (intent === "LAB_SEARCH") return "Here are the lab tests available near you.";
    if (intent === "DELIVERY_TRACK") return "To track your order, go to Profile → My Orders or tell me your order ID.";
    if (intent === "GENERAL_HELP") return data.data?.tip || "Hello! I can help you with medicines, doctors, lab tests, hospitals, and ambulances. Just ask!";
    return "I received your request. Let me find that for you.";
  };

  const processAudioAction = async (audioBlob) => {
    setIsProcessing(true);
    setAiResponse("🎙️ Processing your voice...");

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");
      if (session?.user?.id) formData.append("userId", session.user.id);

      const res = await axios.post("/api/speech/recognize-audio", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        const rawText = res.data.rawTranscript || res.data.originalTranscript || "";
        const lang = res.data.detectedLang || "english";
        const reply = buildReply(res.data);

        setTranscript(rawText);
        setDetectedLang(lang);
        setUnderstoodIntent(res.data.intent || "");
        setResultsData(res.data.data);
        setAiResponse(reply);

        // Add to chat history for a running conversation
        setChatHistory((prev) => [
          ...prev,
          { role: "user", text: rawText, lang },
          { role: "ai", text: reply, intent: res.data.intent },
        ]);

        speakOutLoud(reply, lang);

        if (res.data.intent === "AMBULANCE") {
          setTimeout(() => { router.push("/ambulance"); setIsOpen(false); }, 3000);
        }
      } else {
        const errText = "Sorry, I couldn't understand. Please try again.";
        setErrorMsg(errText);
        setAiResponse(errText);
        speakOutLoud(errText);
      }
    } catch (error) {
      console.error("Voice AI Error:", error);
      const errText = "Connection error. Please try again.";
      setErrorMsg(errText);
      setAiResponse(errText);
    } finally {
      setIsProcessing(false);
    }
  };

  /** Text fallback for elderly mode quick actions */
  const processTextAction = async (text) => {
    setIsProcessing(true);
    setAiResponse("Thinking...");
    setTranscript(text);
    try {
      const res = await axios.post("/api/speech/recognize", {
        transcript: text,
        detectedLang: "en",
        userId: session?.user?.id,
      });
      if (res.data.success) {
        const reply = buildReply(res.data);
        setUnderstoodIntent(res.data.intent || "");
        setResultsData(res.data.data);
        setAiResponse(reply);
        setChatHistory((prev) => [...prev, { role: "user", text }, { role: "ai", text: reply, intent: res.data.intent }]);
        speakOutLoud(reply, "english");
        if (res.data.intent === "AMBULANCE") {
          setTimeout(() => { router.push("/ambulance"); setIsOpen(false); }, 3000);
        }
      }
    } catch (err) {
      setAiResponse("Could not connect. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Floating trigger button
  if (!isOpen && !isListening) {
    return (
      <button
        onClick={startListening}
        className="fixed bottom-24 md:bottom-6 left-4 md:left-6 z-[60] bg-gradient-to-br from-indigo-600 to-violet-600 text-white w-16 h-16 rounded-full flex justify-center items-center shadow-2xl hover:scale-110 transition-all group"
        aria-label="Voice AI Assistant"
      >
        <i className="fa-solid fa-microphone text-2xl group-hover:animate-pulse"></i>
        <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white animate-bounce shadow-sm">AI</span>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-24 md:bottom-6 left-4 md:left-6 z-[60] bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col transition-all duration-300 ${
        isElderlyMode ? "w-[90vw] md:w-96" : "w-[340px]"
      }`}
      style={{ maxHeight: "85vh" }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 flex justify-between items-center text-white shadow-inner flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full bg-rose-400 border border-indigo-400 ${isListening ? "animate-ping" : ""}`}></div>
          <div>
            <span className="font-black text-sm tracking-wide">Swastik Voice AI</span>
            {detectedLang && (
              <div className="text-[10px] text-indigo-200 font-semibold mt-0.5">
                🌐 Auto-detected: {LANG_LABELS[detectedLang] || detectedLang}
              </div>
            )}
            {!detectedLang && !isListening && (
              <div className="text-[10px] text-indigo-200">Supports Hindi, Bengali & English</div>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsElderlyMode(!isElderlyMode)} className="text-indigo-200 hover:text-white" title="Elderly Mode">
            <i className="fa-solid fa-person-cane text-sm"></i>
          </button>
          <button onClick={() => { setIsOpen(false); window.speechSynthesis?.cancel(); }} className="text-indigo-200 hover:text-white">
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-3">
        {/* Initial empty state */}
        {chatHistory.length === 0 && !isProcessing && !transcript && (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">🎙️</div>
            <p className={`font-bold text-slate-600 ${isElderlyMode ? "text-lg" : "text-sm"}`}>
              {isListening ? "Listening... Speak now!" : "Tap the mic and speak in any language"}
            </p>
            <p className="text-xs text-slate-400 mt-2">Hindi · Bengali · English · and more</p>
          </div>
        )}

        {/* Listening animation */}
        {isListening && (
          <div className="flex flex-col items-center py-4 gap-3">
            <div className="flex gap-1 items-end h-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-2 bg-indigo-500 rounded-full animate-bounce" style={{ height: `${12 + Math.random() * 20}px`, animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>
            <p className={`font-black text-indigo-600 ${isElderlyMode ? "text-xl" : "text-sm"}`}>🔴 Listening... Speak now</p>
            <p className="text-xs text-slate-400">बोलिए • বলুন • Speak</p>
          </div>
        )}

        {/* Chat bubbles */}
        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
            {msg.role === "ai" && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0 mt-1">
                <i className="fa-solid fa-robot text-white text-[10px]"></i>
              </div>
            )}
            <div className={`max-w-[80%] ${isElderlyMode ? "text-base" : "text-xs"} font-semibold rounded-2xl px-4 py-3 ${
              msg.role === "user"
                ? "bg-indigo-100 text-indigo-900 rounded-tr-sm"
                : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
            }`}>
              {msg.role === "user" && msg.lang && (
                <div className="text-[9px] text-indigo-400 uppercase tracking-widest mb-1">
                  {LANG_LABELS[msg.lang] || msg.lang}
                </div>
              )}
              {msg.role === "ai" && msg.intent && (
                <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">
                  {msg.intent.replace(/_/g, " ")}
                </div>
              )}
              {msg.text}
            </div>
          </div>
        ))}

        {/* Processing state */}
        {isProcessing && (
          <div className="flex gap-2 justify-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-robot text-white text-[10px] fa-spin"></i>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 text-xs text-slate-500 font-semibold shadow-sm flex items-center gap-2">
              <span className="animate-pulse">Analyzing your question...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-bold text-center">
            <i className="fa-solid fa-triangle-exclamation mr-1"></i>{errorMsg}
          </div>
        )}

        {/* Elderly Mode Quick Actions */}
        {isElderlyMode && !isListening && chatHistory.length === 0 && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button onClick={() => processTextAction("मुझे दवा चाहिए")} className="bg-white border border-slate-200 p-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-indigo-50">💊 दवा</button>
            <button onClick={() => processTextAction("डॉक्टर चाहिए")} className="bg-white border border-slate-200 p-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-indigo-50">👨‍⚕️ डॉक्टर</button>
            <button onClick={() => processTextAction("blood test book karna hai")} className="bg-white border border-slate-200 p-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-indigo-50">🧪 Lab Test</button>
            <button onClick={() => processTextAction("ambulance chahiye")} className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-100">🚑 Ambulance</button>
          </div>
        )}
      </div>

      {/* Mic Control */}
      <div className="p-4 bg-white border-t border-slate-100 flex flex-col items-center gap-2 flex-shrink-0">
        <button
          onClick={toggleVoice}
          className={`${isElderlyMode ? "w-20 h-20 text-3xl" : "w-14 h-14 text-xl"} rounded-full flex items-center justify-center text-white shadow-xl transition-all active:scale-95 border-4 ${
            isListening
              ? "bg-rose-500 hover:bg-rose-600 border-rose-200 animate-pulse"
              : "bg-gradient-to-br from-indigo-600 to-violet-600 border-indigo-200 hover:scale-105"
          }`}
        >
          <i className={`fa-solid ${isListening ? "fa-stop" : "fa-microphone"}`}></i>
        </button>
        <p className="text-[10px] text-slate-400 font-semibold">
          {isListening ? "Tap to Stop" : chatHistory.length > 0 ? "Tap to ask again" : "Tap to speak"}
        </p>
      </div>
    </div>
  );
}
