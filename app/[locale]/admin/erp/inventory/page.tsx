'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, AlertTriangle, Clock, Activity,
  Search, Calendar
} from 'lucide-react';

const InventoryDashboard = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, EXPIRING_SOON, EXPIRED

  useEffect(() => {
    // In a real scenario, this would have a dedicated API route.
    // For demo purposes, we will simulate fetching batches since we just built the schema.
    const fetchBatches = async () => {
      setLoading(true);
      try {
        // Mock data to demonstrate the UI capabilities of ERP Batch tracking
        const mockBatches = [
          { id: 'b1', productId: 'p1', name: 'Paracetamol 500mg', batchNumber: 'BTH-9921', stock: 500, expiryDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(), purchasePrice: 12.5, mrp: 20 },
          { id: 'b2', productId: 'p2', name: 'Amoxicillin 250mg', batchNumber: 'BTH-4412', stock: 200, expiryDate: new Date(new Date().setDate(new Date().getDate() + 120)).toISOString(), purchasePrice: 45.0, mrp: 60 },
          { id: 'b3', productId: 'p1', name: 'Paracetamol 500mg', batchNumber: 'BTH-1055', stock: 1000, expiryDate: new Date(new Date().setDate(new Date().getDate() + 400)).toISOString(), purchasePrice: 12.0, mrp: 20 },
          { id: 'b4', productId: 'p3', name: 'Cough Syrup', batchNumber: 'BTH-0091', stock: 50, expiryDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), purchasePrice: 80.0, mrp: 110 }
        ];
        
        setTimeout(() => {
          setBatches(mockBatches);
          setLoading(false);
        }, 600);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBatches();
  }, []);

  const getDaysToExpiry = (dateString) => {
    const diff = new Date(dateString) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const filteredBatches = batches.filter(b => {
    const days = getDaysToExpiry(b.expiryDate);
    if (filter === 'EXPIRING_SOON') return days > 0 && days <= 30;
    if (filter === 'EXPIRED') return days <= 0;
    return true;
  });

  const totalValue = batches.reduce((acc, b) => acc + (b.stock * b.purchasePrice), 0);
  const expiringValue = batches.filter(b => getDaysToExpiry(b.expiryDate) <= 30 && getDaysToExpiry(b.expiryDate) > 0).reduce((acc, b) => acc + (b.stock * b.purchasePrice), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Package className="h-8 w-8 text-blue-600" />
            Advanced Batch & Expiry Management
          </h1>
          <p className="text-gray-500 mt-1">Track FEFO (First-Expired-First-Out) stock and real-time inventory valuation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Inventory Value</p>
            <h3 className="text-2xl font-bold text-gray-900">₹{totalValue.toLocaleString()}</h3>
            <p className="text-xs text-gray-500 mt-1">Based on Purchase Price</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-800 mb-1">Value at Risk (Expiring &lt;30d)</p>
            <h3 className="text-2xl font-bold text-amber-900">₹{expiringValue.toLocaleString()}</h3>
            <p className="text-xs text-amber-700 mt-1">Requires immediate liquidation</p>
          </div>
          <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center text-amber-700">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-xl border border-red-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-800 mb-1">Expired Stock Value</p>
            <h3 className="text-2xl font-bold text-red-900">
              ₹{batches.filter(b => getDaysToExpiry(b.expiryDate) <= 0).reduce((acc, b) => acc + (b.stock * b.purchasePrice), 0).toLocaleString()}
            </h3>
            <p className="text-xs text-red-700 mt-1">Requires write-off</p>
          </div>
          <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center text-red-700">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <div className="flex gap-2">
            <button 
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === 'ALL' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}
              onClick={() => setFilter('ALL')}
            >
              All Active Batches
            </button>
            <button 
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 ${filter === 'EXPIRING_SOON' ? 'bg-amber-100 text-amber-800' : 'text-gray-600 hover:bg-gray-200'}`}
              onClick={() => setFilter('EXPIRING_SOON')}
            >
              <AlertTriangle className="w-4 h-4"/> Expiring &lt;30 Days
            </button>
            <button 
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 ${filter === 'EXPIRED' ? 'bg-red-100 text-red-800' : 'text-gray-600 hover:bg-gray-200'}`}
              onClick={() => setFilter('EXPIRED')}
            >
              <Clock className="w-4 h-4"/> Expired
            </button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input type="text" placeholder="Search product or batch..." className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          {loading ? (
             <div className="p-8 text-center text-gray-500">Loading batches...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-white border-b">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Product</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Batch Number</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Stock Qty</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Valuation</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Expiry Date</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredBatches.map(batch => {
                  const days = getDaysToExpiry(batch.expiryDate);
                  let statusStr = "Healthy";
                  let statusColor = "bg-green-100 text-green-700";
                  if (days <= 0) {
                    statusStr = "Expired";
                    statusColor = "bg-red-100 text-red-700 font-bold";
                  } else if (days <= 30) {
                    statusStr = `Expiring (${days}d)`;
                    statusColor = "bg-amber-100 text-amber-800 font-bold";
                  } else if (days <= 90) {
                    statusStr = "Approaching";
                    statusColor = "bg-yellow-100 text-yellow-800";
                  }

                  return (
                    <tr key={batch.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{batch.name}</td>
                      <td className="px-4 py-3 font-mono text-gray-600">{batch.batchNumber}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{batch.stock}</td>
                      <td className="px-4 py-3 text-gray-600">₹{(batch.stock * batch.purchasePrice).toLocaleString()}</td>
                      <td className="px-4 py-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(batch.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${statusColor}`}>
                          {statusStr}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
