'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, CheckCircle, XCircle, Trash2, RefreshCw } from 'lucide-react';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '', discountType: 'PERCENTAGE', discountValue: '', 
    minOrderValue: '', maxUses: '', expiresAt: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ code: '', discountType: 'PERCENTAGE', discountValue: '', minOrderValue: '', maxUses: '', expiresAt: '' });
        fetchCoupons();
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const toggleCoupon = async (id, isActive) => {
    await fetch('/api/admin/coupons', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !isActive })
    });
    fetchCoupons();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Tag className="h-8 w-8 text-teal-600" />
              Coupon Management
            </h1>
            <p className="text-gray-500 mt-1">Create discount codes and promotional offers for customers.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchCoupons} className="p-2 border rounded-lg hover:bg-gray-100 text-gray-500">
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-teal-700 transition"
            >
              <Plus className="w-4 h-4" /> Create Coupon
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Coupons</p>
            <p className="text-2xl font-bold text-gray-900">{coupons.length}</p>
          </div>
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-bold text-green-600">{coupons.filter(c => c.isActive).length}</p>
          </div>
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <p className="text-sm text-gray-500">Expired / Inactive</p>
            <p className="text-2xl font-bold text-red-500">{coupons.filter(c => !c.isActive).length}</p>
          </div>
        </div>

        {/* Create Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Coupon</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code *</label>
                  <input 
                    type="text" required placeholder="e.g. SWASTIK20" 
                    className="w-full border rounded-lg p-2 uppercase focus:ring-2 focus:ring-teal-500 outline-none"
                    value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                    <select className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-teal-500 outline-none"
                      value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value})}>
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FLAT">Flat (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Value {form.discountType === 'PERCENTAGE' ? '(%)' : '(₹)'} *
                    </label>
                    <input type="number" required min="0" 
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-teal-500 outline-none"
                      value={form.discountValue} onChange={e => setForm({...form, discountValue: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Order (₹)</label>
                    <input type="number" min="0" placeholder="0 = no minimum"
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-teal-500 outline-none"
                      value={form.minOrderValue} onChange={e => setForm({...form, minOrderValue: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
                    <input type="number" min="0" placeholder="0 = unlimited"
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-teal-500 outline-none"
                      value={form.maxUses} onChange={e => setForm({...form, maxUses: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input type="datetime-local" 
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-teal-500 outline-none"
                    value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={saving} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-60">
                    {saving ? 'Creating...' : 'Create Coupon'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Coupons Table */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading coupons...</div>
          ) : coupons.length === 0 ? (
            <div className="p-12 text-center text-gray-500 border-2 border-dashed m-4 rounded-xl">
              No coupons yet. Create your first discount code above.
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Code</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Discount</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Min Order</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Uses</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Expires</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {coupons.map(coupon => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold text-teal-700 text-base">{coupon.code}</td>
                    <td className="px-4 py-3 font-medium">
                      {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {coupon.minOrderValue > 0 ? `₹${coupon.minOrderValue}` : 'No minimum'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {coupon.usedCount ?? 0} / {coupon.maxUses > 0 ? coupon.maxUses : '∞'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleCoupon(coupon.id, coupon.isActive)}
                        className={`p-1.5 rounded-lg transition ${coupon.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                        title={coupon.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {coupon.isActive ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
