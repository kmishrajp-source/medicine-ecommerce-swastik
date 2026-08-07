'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, Search, Filter, Phone, Mail, MapPin, Package, Star, 
  Activity, Clock, ChevronRight, Download, Edit3, Save, X
} from 'lucide-react';

const Customer360Dashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    classification: 'Retail',
    status: 'Active',
    loyaltyPoints: 0
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bas/crm/customers?search=${search}`);
      const data = await res.json();
      setCustomers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleEditClick = (cust) => {
    setSelectedCustomer(cust);
    setEditForm({
      classification: cust.basCustomerProfile?.classification || 'Retail',
      status: cust.basCustomerProfile?.status || 'Active',
      loyaltyPoints: cust.basCustomerProfile?.loyaltyPoints || 0
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      await fetch('/api/admin/bas/crm/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: selectedCustomer.basCustomerProfile.id,
          ...editForm
        })
      });
      setIsEditing(false);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            Customer 360°
          </h1>
          <p className="text-gray-500 mt-1">Unified view of all customer interactions and lifetime value.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search customers by name, email, or phone..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_,i) => <div key={i} className="h-32 bg-gray-200 rounded-xl w-full"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {customers.map((cust) => {
            const prof = cust.basCustomerProfile || {};
            const isVIP = prof.classification === 'Wholesale' || prof.lifetimeValue > 10000;
            return (
              <div key={cust.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${isVIP ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                        {cust.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                          {cust.name || 'Unknown User'}
                          {isVIP && <Star className="w-4 h-4 text-amber-500 fill-current" />}
                        </h3>
                        <div className="text-sm text-gray-500 flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {cust.email || 'N/A'}</span>
                          <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {cust.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleEditClick(cust)}
                      className="opacity-0 group-hover:opacity-100 transition p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mt-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Classification</div>
                      <div className="font-semibold text-gray-900">{prof.classification || 'Retail'}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Lifetime Value</div>
                      <div className="font-semibold text-green-600">₹{prof.lifetimeValue?.toLocaleString() || '0'}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Total Orders</div>
                      <div className="font-semibold text-gray-900">{prof.totalOrders || 0}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Loyalty Points</div>
                      <div className="font-semibold text-purple-600">{prof.loyaltyPoints || 0} pts</div>
                    </div>
                  </div>

                  <div className="mt-6 border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-500" /> Recent Activity
                    </h4>
                    <div className="space-y-2">
                      {(cust.orders || []).slice(0,2).map(order => (
                        <div key={order.id} className="flex justify-between items-center text-sm bg-gray-50 px-3 py-2 rounded">
                          <span className="flex items-center gap-2"><Package className="w-4 h-4 text-gray-400" /> Order #{order.id.slice(-6).toUpperCase()}</span>
                          <span className={`px-2 py-1 rounded text-xs ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {order.status}
                          </span>
                        </div>
                      ))}
                      {(cust.orders?.length === 0) && <div className="text-sm text-gray-500 italic">No recent activity.</div>}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold">Edit Customer: {selectedCustomer.name}</h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Classification</label>
                <select 
                  className="w-full border rounded-lg p-2"
                  value={editForm.classification}
                  onChange={e => setEditForm({...editForm, classification: e.target.value})}
                >
                  <option>Retail</option>
                  <option>Wholesale</option>
                  <option>Doctor</option>
                  <option>Hospital</option>
                  <option>Corporate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  className="w-full border rounded-lg p-2"
                  value={editForm.status}
                  onChange={e => setEditForm({...editForm, status: e.target.value})}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>VIP</option>
                  <option>High Risk</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loyalty Points (Adjustment)</label>
                <input 
                  type="number" 
                  className="w-full border rounded-lg p-2"
                  value={editForm.loyaltyPoints}
                  onChange={e => setEditForm({...editForm, loyaltyPoints: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Customer360Dashboard;
