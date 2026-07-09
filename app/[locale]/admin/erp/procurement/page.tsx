'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, FileText, CheckCircle, PackagePlus,
  ArrowRight, Store
} from 'lucide-react';

const ProcurementDashboard = () => {
  const [activeTab, setActiveTab] = useState('PO');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isCreatingPO, setIsCreatingPO] = useState(false);
  const [poForm, setPoForm] = useState({ supplierId: 'test_supplier_1', items: [] });

  const [isProcessingGRN, setIsProcessingGRN] = useState(false);
  const [grnForm, setGrnForm] = useState({ invoiceNumber: '', items: [] });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/erp/procurement?type=${activeTab}`);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleCreatePOSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/erp/procurement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_PO',
          supplierId: poForm.supplierId,
          notes: 'Standard Restock',
          items: [
            { productId: 'test_product_1', quantity: 100, unitPrice: 50.0, gstPercent: 12 }
          ]
        })
      });
      setIsCreatingPO(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessGRNSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/erp/procurement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'PROCESS_GRN',
          supplierId: 'test_supplier_1',
          invoiceNumber: grnForm.invoiceNumber,
          receivedById: 'Admin',
          items: [
            { 
              productId: 'test_product_1', 
              batchNumber: `BTH-${Math.floor(Math.random() * 10000)}`,
              expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString(),
              quantity: 100,
              acceptedQty: 100,
              rejectedQty: 0,
              purchasePrice: 50.0,
              mrp: 75.0,
              gstPercent: 12
            }
          ]
        })
      });
      setIsProcessingGRN(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Store className="h-8 w-8 text-blue-600" />
            Procurement & Inwarding (GRN)
          </h1>
          <p className="text-gray-500 mt-1">Manage Purchase Orders and receive warehouse inventory.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsCreatingPO(true)}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50"
          >
            <ShoppingCart className="w-4 h-4" /> Raise PO
          </button>
          <button 
            onClick={() => setIsProcessingGRN(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <PackagePlus className="w-4 h-4" /> Process GRN
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b">
        <button 
          className={`px-4 py-2 font-medium border-b-2 ${activeTab === 'PO' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('PO')}
        >
          Purchase Orders
        </button>
        <button 
          className={`px-4 py-2 font-medium border-b-2 ${activeTab === 'GRN' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('GRN')}
        >
          Goods Receipt Notes (GRN)
        </button>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading data...</div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center text-gray-500 border-2 border-dashed mx-4 my-4 rounded-xl">
            No {activeTab} records found.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">{activeTab === 'PO' ? 'PO Number' : 'GRN Number'}</th>
                <th className="px-4 py-3 font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 font-medium text-gray-500">Total Amount</th>
                <th className="px-4 py-3 font-medium text-gray-500">Tax (GST)</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-3 font-medium text-blue-600">
                    {activeTab === 'PO' ? item.poNumber : item.grnNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-medium">₹{item.totalAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500">₹{(activeTab === 'PO' ? item.gstAmount : item.totalGst).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals for Demo */}
      {isCreatingPO && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-semibold text-lg mb-4">Create Purchase Order (Demo)</h3>
            <p className="text-sm text-gray-500 mb-4">Simulates creating a PO for 100 units of Test Medicine.</p>
            <form onSubmit={handleCreatePOSubmit} className="space-y-4">
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsCreatingPO(false)} className="px-4 py-2 text-gray-600 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Generate PO</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isProcessingGRN && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-semibold text-lg mb-4">Process GRN & Inward Stock</h3>
            <p className="text-sm text-gray-500 mb-4">Simulates receiving stock. This will automatically create a new ErpBatch and sync stock to the live Product catalog.</p>
            <form onSubmit={handleProcessGRNSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Invoice Number</label>
                <input type="text" required className="w-full border rounded-lg p-2" value={grnForm.invoiceNumber} onChange={e => setGrnForm({...grnForm, invoiceNumber: e.target.value})} placeholder="INV-2023-..." />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsProcessingGRN(false)} className="px-4 py-2 text-gray-600 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4"/> Confirm Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementDashboard;
