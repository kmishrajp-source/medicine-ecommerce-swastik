'use client';

import React, { useState, useEffect } from 'react';
import { LifeBuoy, AlertCircle, MessageSquare, CheckCircle2, Clock, Search, Filter } from 'lucide-react';

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/bas/support/tickets')
      .then(res => res.json())
      .then(data => {
        setTickets(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'CRITICAL': return 'bg-red-500 shadow-red-500/50';
      case 'HIGH': return 'bg-orange-500 shadow-orange-500/50';
      case 'MEDIUM': return 'bg-yellow-500 shadow-yellow-500/50';
      case 'LOW': return 'bg-green-500 shadow-green-500/50';
      default: return 'bg-gray-500 shadow-gray-500/50';
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'OPEN': return <span className="flex items-center text-xs font-semibold text-blue-700 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800"><AlertCircle className="w-3 h-3 mr-1" /> Open</span>;
      case 'IN_PROGRESS': return <span className="flex items-center text-xs font-semibold text-purple-700 bg-purple-100 dark:bg-purple-900/40 dark:text-purple-300 px-2.5 py-1 rounded-md border border-purple-200 dark:border-purple-800"><Clock className="w-3 h-3 mr-1" /> In Progress</span>;
      case 'RESOLVED': return <span className="flex items-center text-xs font-semibold text-green-700 bg-green-100 dark:bg-green-900/40 dark:text-green-300 px-2.5 py-1 rounded-md border border-green-200 dark:border-green-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Resolved</span>;
      default: return <span className="flex items-center text-xs font-semibold text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-700">{status}</span>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-xl gap-6">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/30">
            <LifeBuoy className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
              Customer Support Helpdesk
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage tickets, customer complaints, and ensure high CSAT</p>
          </div>
        </div>
        
        <div className="flex space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search subject or ID..." 
              className="w-full pl-10 pr-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <button className="p-3 bg-white/60 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Ticket List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
             <div className="text-center py-20 text-gray-500 bg-white/40 dark:bg-slate-900/40 rounded-3xl backdrop-blur-md">Loading tickets...</div>
          ) : tickets.length === 0 ? (
             <div className="text-center py-20 text-gray-500 bg-white/40 dark:bg-slate-900/40 rounded-3xl backdrop-blur-md">No open tickets. Great job!</div>
          ) : (
            tickets.map((ticket: any) => (
              <div key={ticket.id} className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-5 rounded-2xl border border-white/20 shadow-md hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 cursor-pointer flex gap-4">
                <div className={`w-2 h-14 rounded-full mt-1 ${getPriorityColor(ticket.priority)} shadow-lg`} />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{ticket.subject}</h3>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2">{ticket.description}</p>
                  
                  <div className="flex items-center justify-between mt-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">From: {ticket.guestName || 'Customer'}</span>
                      <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="font-mono bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700">#{ticket.id.slice(-6).toUpperCase()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Support Analytics Sidebar */}
        <div className="space-y-6">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              <span>Queue Status</span>
            </h3>
            
            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Open Tickets</span>
                <span className="font-bold text-lg text-gray-900 dark:text-white">{tickets.filter((t:any) => t.status === 'OPEN').length}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-600 dark:text-gray-400">Critical Priority</span>
                <span className="font-bold text-lg text-red-500">{tickets.filter((t:any) => t.priority === 'CRITICAL').length}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-20">
               <MessageSquare className="w-24 h-24" />
             </div>
             <h3 className="text-xl font-bold relative z-10">Average Resolution</h3>
             <p className="text-4xl font-extrabold mt-2 relative z-10">4.2 <span className="text-lg font-medium opacity-80">hours</span></p>
             <p className="text-emerald-100 text-sm mt-2 relative z-10">↓ 12% faster than last week</p>
          </div>
        </div>
      </div>
    </div>
  );
}
