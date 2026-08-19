'use client';

import { useState } from 'react';
import { Send, Bot, User, Activity, Loader2, Sparkles, BrainCircuit } from 'lucide-react';
import Link from 'next/link';

export default function AICommandCenter() {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Welcome to the AI Command Center. I am your Swastik Business Executive. How can I assist you with platform data today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/ai-executive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content }),
      });
      const data = await res.json();
      
      if (data.success) {
        setMessages(prev => [...prev, { role: 'system', content: data.message }]);
      } else {
        setMessages(prev => [...prev, { role: 'system', content: `Error: ${data.message}` }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'system', content: 'Connection failed. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row">
      {/* Sidebar / Quick Actions */}
      <div className="w-full md:w-64 bg-white border-r border-gray-200 p-4 flex flex-col gap-4 hidden md:flex">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg mb-4">
          <BrainCircuit className="w-6 h-6" />
          AI Command Center
        </div>

        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Commands</div>
        
        <button onClick={() => setInput("Give me a summary of total orders and revenue.")} className="text-left text-sm p-2 rounded hover:bg-indigo-50 text-gray-700 transition-colors">
          📊 Business Summary
        </button>
        <button onClick={() => setInput("Which medicines are running low on stock?")} className="text-left text-sm p-2 rounded hover:bg-indigo-50 text-gray-700 transition-colors">
          ⚠️ Low Stock Alerts
        </button>
        <button onClick={() => setInput("What are the top 5 pharmacies?")} className="text-left text-sm p-2 rounded hover:bg-indigo-50 text-gray-700 transition-colors">
          ⭐ Top Pharmacies
        </button>
        <button onClick={() => setInput("Show me the current delivery agent status.")} className="text-left text-sm p-2 rounded hover:bg-indigo-50 text-gray-700 transition-colors">
          🛵 Delivery Status
        </button>

        <div className="mt-auto">
          <Link href="/en/admin" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors block p-2">
            ← Back to Main Admin
          </Link>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col max-h-screen">
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-lg text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Business Executive AI</h1>
              <p className="text-xs text-gray-500">Connected to Swastik Data Layer</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-20">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none whitespace-pre-wrap'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white px-5 py-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span className="text-sm text-gray-500">Analyzing business data...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={sendMessage} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about revenue, stock, or delivery status..."
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-full focus:ring-indigo-500 focus:border-indigo-500 block pl-5 pr-12 py-3.5 shadow-inner"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="absolute right-2 text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-full text-sm p-2 text-center inline-flex items-center transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-center text-xs text-gray-400 mt-2">
              AI can make mistakes. Verify critical business numbers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
