'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Phone, Smartphone, AlertTriangle, Package, CheckCircle2, X } from 'lucide-react';

const CHANNEL_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  INTERNAL: { icon: Bell,          color: 'text-violet-500',  bg: 'bg-violet-50 dark:bg-violet-900/20',   label: 'Internal' },
  EMAIL:    { icon: Mail,          color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/20',       label: 'Email' },
  SMS:      { icon: Phone,         color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'SMS' },
  WHATSAPP: { icon: MessageSquare, color: 'text-green-500',   bg: 'bg-green-50 dark:bg-green-900/20',     label: 'WhatsApp' },
  PUSH:     { icon: Smartphone,    color: 'text-orange-500',  bg: 'bg-orange-50 dark:bg-orange-900/20',   label: 'Push' },
};

const REFERENCE_TYPE_ICONS: Record<string, any> = {
  ORDER:        Package,
  APPROVAL:     CheckCircle2,
  STOCK_ALERT:  AlertTriangle,
  LEAD:         Bell,
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterChannel, setFilterChannel] = useState('ALL');
  const [filterRead, setFilterRead] = useState('ALL');

  useEffect(() => {
    fetch('/api/admin/bas/notifications')
      .then(r => r.json())
      .then(data => { setNotifications(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    await fetch('/api/admin/bas/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setNotifications(prev => prev.map((n: any) => n.id === id ? { ...n, isRead: true } : n));
  };

  const filtered = notifications.filter((n: any) => {
    const channelOk = filterChannel === 'ALL' || n.channel === filterChannel;
    const readOk = filterRead === 'ALL' || (filterRead === 'UNREAD' ? !n.isRead : n.isRead);
    return channelOk && readOk;
  });

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-xl gap-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="p-4 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg shadow-indigo-500/30">
              <Bell className="w-8 h-8 text-white" />
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
              Notification Center
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={filterChannel}
            onChange={e => setFilterChannel(e.target.value)}
            className="bg-white/60 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Channels</option>
            {Object.entries(CHANNEL_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select
            value={filterRead}
            onChange={e => setFilterRead(e.target.value)}
            className="bg-white/60 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All</option>
            <option value="UNREAD">Unread</option>
            <option value="READ">Read</option>
          </select>
        </div>
      </div>

      {/* Channel Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(CHANNEL_CONFIG).map(([channel, cfg]) => {
          const count = notifications.filter((n: any) => n.channel === channel).length;
          const Icon = cfg.icon;
          return (
            <button
              key={channel}
              onClick={() => setFilterChannel(channel === filterChannel ? 'ALL' : channel)}
              className={`${cfg.bg} p-4 rounded-2xl border transition-all hover:-translate-y-0.5 text-left ${
                filterChannel === channel
                  ? 'ring-2 ring-indigo-500 shadow-lg'
                  : 'border-white/20 hover:shadow-md'
              }`}
            >
              <Icon className={`w-5 h-5 ${cfg.color} mb-2`} />
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{cfg.label}</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">{count}</p>
            </button>
          );
        })}
      </div>

      {/* Notification Feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-20 text-gray-500 bg-white/40 dark:bg-slate-900/40 rounded-3xl">Loading notifications...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-white/20 border-dashed">
            <Bell className="w-12 h-12 text-indigo-200 dark:text-indigo-900 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">No notifications found</p>
          </div>
        ) : (
          filtered.map((notif: any) => {
            const chanCfg = CHANNEL_CONFIG[notif.channel] || CHANNEL_CONFIG.INTERNAL;
            const ChanIcon = chanCfg.icon;
            const RefIcon = notif.referenceType ? (REFERENCE_TYPE_ICONS[notif.referenceType] || Bell) : Bell;
            return (
              <div
                key={notif.id}
                className={`group relative flex items-start space-x-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-5 rounded-2xl border shadow-md transition-all duration-300 hover:shadow-xl ${
                  !notif.isRead
                    ? 'border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-200 dark:ring-indigo-900'
                    : 'border-white/20 opacity-70'
                }`}
              >
                {/* Unread dot */}
                {!notif.isRead && (
                  <div className="absolute top-5 left-5 w-2 h-2 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50 animate-pulse" />
                )}

                <div className={`${chanCfg.bg} p-3 rounded-xl flex-shrink-0 ml-3`}>
                  <ChanIcon className={`w-5 h-5 ${chanCfg.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`font-bold text-sm ${notif.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                        {notif.title}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{notif.body}</p>
                    </div>
                    {!notif.isRead && (
                      <button
                        onClick={() => markRead(notif.id)}
                        className="ml-4 p-1.5 bg-gray-100 dark:bg-slate-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        title="Mark as read"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 mt-3">
                    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${chanCfg.bg} ${chanCfg.color} border border-current/20`}>
                      {chanCfg.label}
                    </span>
                    {notif.referenceType && (
                      <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-1">
                        <RefIcon className="w-3 h-3" />
                        <span>{notif.referenceType}</span>
                      </span>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">{new Date(notif.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
