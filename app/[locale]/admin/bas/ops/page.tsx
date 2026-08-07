'use client';

import React, { useState, useEffect } from 'react';
import { PackageSearch, Truck, Warehouse, TrendingUp, AlertTriangle, Search, Filter, Plus, FileText, CheckCircle2 } from 'lucide-react';

export default function OperationsDashboard() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/bas/ops/purchase-orders')
      .then(res => res.json())
      .then(data => {
        setPurchaseOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'DRAFT': return <span className="px-3 py-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-full text-xs font-bold uppercase tracking-wider border border-gray-200 dark:border-gray-700">Draft</span>;
      case 'SENT': return <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-800 animate-pulse">Sent to Supplier</span>;
      case 'PARTIAL': return <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-800">Partially Received</span>;
      case 'COMPLETED': return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">Completed</span>;
      case 'CANCELLED': return <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-full text-xs font-bold uppercase tracking-wider border border-red-200 dark:border-red-800">Cancelled</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-full text-xs font-bold uppercase tracking-wider border border-gray-200 dark:border-gray-700">{status}</span>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-xl gap-6">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-amber-500/30">
            <Warehouse className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
              Operations & Supply Chain
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage purchase orders, suppliers, and warehouse stock</p>
          </div>
        </div>
        
        <div className="flex space-x-3 w-full md:w-auto">
           <button className="flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 font-medium">
            <Plus className="w-5 h-5" />
            <span>Create PO</span>
          </button>
        </div>
      </div>

      {/* Operations Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active POs', value: loading ? '-' : purchaseOrders.filter(p => ['DRAFT', 'SENT', 'PARTIAL'].includes(p.status)).length, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'In Transit', value: loading ? '-' : purchaseOrders.filter(p => p.status === 'SENT').length, icon: Truck, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Pending Receipt', value: '12', icon: PackageSearch, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Low Stock Alerts', value: '5', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' }
        ].map((stat, i) => (
          <div key={i} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className={`absolute -right-4 -top-4 w-20 h-20 ${stat.bg} rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`}></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mt-2">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-2xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search PO number or supplier..." 
              className="w-full pl-10 pr-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <button className="p-3 bg-white/60 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">PO Number</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expected Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading purchase orders...</td>
                </tr>
              ) : purchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No purchase orders found.</td>
                </tr>
              ) : (
                purchaseOrders.map((po: any) => (
                  <tr key={po.id} className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100 font-mono">PO-{po.id.slice(-6).toUpperCase()}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{new Date(po.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{po.supplier?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{po.supplier?.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(po.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {po.expectedDate ? new Date(po.expectedDate).toLocaleDateString() : 'Not Set'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{po.items?.length || 0} products</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                       <div className="text-sm font-bold text-gray-900 dark:text-white">₹{po.totalAmount?.toLocaleString() || 0}</div>
                       <button className="text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 text-xs font-semibold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         View Invoice
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
