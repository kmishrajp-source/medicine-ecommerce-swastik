'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, CheckCircle, XCircle, RefreshCw, User } from 'lucide-react';

// Role badge colors
const ROLE_COLORS = {
  ADMIN: 'bg-red-100 text-red-700',
  MANAGER: 'bg-orange-100 text-orange-700',
  STAFF: 'bg-blue-100 text-blue-700',
  PHARMACIST: 'bg-purple-100 text-purple-700',
  RETAILER: 'bg-teal-100 text-teal-700',
  CUSTOMER: 'bg-gray-100 text-gray-600',
};

export default function StaffManagementPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/approvals?limit=200');
      const data = await res.json();
      const users = data.users || data.pendingUsers || data || [];
      setStaff(Array.isArray(users) ? users : []);
    } catch (err) {
      console.error(err);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const filtered = staff.filter(u => {
    const matchesSearch = !search || 
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || '').includes(search);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roles = ['ALL', 'ADMIN', 'MANAGER', 'STAFF', 'PHARMACIST', 'RETAILER'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="h-8 w-8 text-indigo-600" />
              Staff Management
            </h1>
            <p className="text-gray-500 mt-1">View and manage all staff accounts, roles, and access permissions.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchStaff} className="p-2 border rounded-lg hover:bg-gray-100 text-gray-500">
              <RefreshCw className="w-5 h-5" />
            </button>
            <a
              href="/admin/staff-approvals"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
            >
              <CheckCircle className="w-4 h-4" /> Pending Approvals
            </a>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text" placeholder="Search by name, email, phone..."
              className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {roles.map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${roleFilter === role ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-5 gap-4">
          {['ADMIN', 'MANAGER', 'STAFF', 'PHARMACIST', 'RETAILER'].map(role => (
            <div key={role} className="bg-white rounded-xl border p-4 shadow-sm text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{role}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {staff.filter(u => u.role === role).length}
              </p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading staff members...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500 border-2 border-dashed m-4 rounded-xl">
              No staff members found matching your filters.
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Contact</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Role</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Joined</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold">
                          {(user.name || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name || 'Unknown'}</div>
                          <div className="text-xs text-gray-400">{user.id?.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-700">{user.email}</div>
                      <div className="text-xs text-gray-400">{user.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-600'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${user.isApproved ? 'text-green-600' : 'text-amber-500'}`}>
                        {user.isApproved ? <CheckCircle className="w-3.5 h-3.5"/> : <XCircle className="w-3.5 h-3.5"/>}
                        {user.isApproved ? 'Approved' : 'Pending'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <a href={`/admin/approvals`} className="text-indigo-600 hover:underline text-xs font-medium">
                        Manage →
                      </a>
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
