'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Mail, Phone, Send, Search, 
  CheckCheck, Clock, User
} from 'lucide-react';

const CommunicationsDashboard = () => {
  const [comms, setComms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // New Message State
  const [isComposing, setIsComposing] = useState(false);
  const [composeForm, setComposeForm] = useState({
    type: 'Email',
    recipientId: '',
    subject: '',
    content: ''
  });

  const fetchComms = async () => {
    try {
      const res = await fetch('/api/admin/bas/crm/communications');
      const data = await res.json();
      setComms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComms();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/bas/crm/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...composeForm,
          direction: 'Outbound',
          senderId: 'Admin'
        })
      });
      setIsComposing(false);
      setComposeForm({ type: 'Email', recipientId: '', subject: '', content: '' });
      fetchComms();
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'Email': return <Mail className="w-5 h-5 text-blue-500" />;
      case 'WhatsApp': return <Phone className="w-5 h-5 text-green-500" />;
      case 'SMS': return <MessageSquare className="w-5 h-5 text-purple-500" />;
      default: return <MessageSquare className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredComms = comms.filter(c => 
    c.content?.toLowerCase().includes(search.toLowerCase()) || 
    c.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto h-[calc(100vh-80px)] flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            Communication Center
          </h1>
          <p className="text-gray-500 mt-1">Unified inbox and outbox for Email, WhatsApp, and SMS.</p>
        </div>
        <button 
          onClick={() => setIsComposing(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Send className="w-4 h-4" /> Compose Message
        </button>
      </div>

      <div className="flex bg-white rounded-xl shadow-sm border overflow-hidden flex-1">
        {/* Left Sidebar - Message List */}
        <div className="w-1/3 border-r flex flex-col bg-gray-50/50">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-lg"></div>)}
              </div>
            ) : (
              <div className="divide-y">
                {filteredComms.map(comm => (
                  <div key={comm.id} className="p-4 hover:bg-gray-100 cursor-pointer transition">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2 font-medium text-gray-900 text-sm">
                        {getTypeIcon(comm.type)}
                        {comm.recipientId || 'Broadcast'}
                      </div>
                      <span className="text-xs text-gray-500">{new Date(comm.createdAt).toLocaleDateString()}</span>
                    </div>
                    {comm.subject && <div className="text-sm font-medium text-gray-800 mb-1 truncate">{comm.subject}</div>}
                    <div className="text-sm text-gray-500 truncate">{comm.content}</div>
                    <div className="flex items-center gap-1 mt-2 text-xs">
                      {comm.status === 'Read' ? <CheckCheck className="w-3.5 h-3.5 text-blue-500" /> : <Clock className="w-3.5 h-3.5 text-gray-400" />}
                      <span className={comm.status === 'Failed' ? 'text-red-500' : 'text-gray-500'}>{comm.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Area - Compose or View */}
        <div className="w-2/3 flex flex-col bg-white p-6 relative">
          {isComposing ? (
            <form onSubmit={handleSend} className="h-full flex flex-col">
              <h2 className="text-xl font-semibold mb-6 flex justify-between">
                New Message
                <button type="button" onClick={() => setIsComposing(false)} className="text-sm text-gray-500 hover:text-gray-900">Cancel</button>
              </h2>
              
              <div className="space-y-4 flex-1">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message Type</label>
                    <select 
                      className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                      value={composeForm.type}
                      onChange={e => setComposeForm({...composeForm, type: e.target.value})}
                    >
                      <option value="Email">Email</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="SMS">SMS</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recipient ID / Phone</label>
                    <input 
                      type="text" required
                      className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                      value={composeForm.recipientId}
                      onChange={e => setComposeForm({...composeForm, recipientId: e.target.value})}
                    />
                  </div>
                </div>

                {composeForm.type === 'Email' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input 
                      type="text" required
                      className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                      value={composeForm.subject}
                      onChange={e => setComposeForm({...composeForm, subject: e.target.value})}
                    />
                  </div>
                )}

                <div className="flex-1 flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message Content</label>
                  <textarea 
                    required
                    className="w-full flex-1 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Write your message here..."
                    value={composeForm.content}
                    onChange={e => setComposeForm({...composeForm, content: e.target.value})}
                  ></textarea>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </div>
            </form>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <MessageSquare className="w-16 h-16 mb-4 text-gray-200" />
              <p>Select a message from the list or compose a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunicationsDashboard;
