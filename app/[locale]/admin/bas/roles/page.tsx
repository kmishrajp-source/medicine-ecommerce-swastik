'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2 } from 'lucide-react';

export default function RolesManagement() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/bas/roles')
      .then(res => res.json())
      .then(data => {
        setRoles(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
              Role & Permission Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Configure access control across all BAS modules</p>
          </div>
        </div>
        <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 font-medium">
          <Plus className="w-5 h-5" />
          <span>Create Role</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-20 text-gray-500">Loading roles...</div>
        ) : roles.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-500 bg-white/30 dark:bg-slate-900/30 rounded-3xl backdrop-blur-md border border-white/10">No roles configured yet.</div>
        ) : (
          roles.map((role: any) => (
            <div key={role.id} className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-lg hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{role.name}</h3>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-xl hover:bg-red-100 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{role.description || "No description provided"}</p>
              
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Permissions ({role.permissions?.length || 0})</div>
                <div className="flex flex-wrap gap-2">
                  {role.permissions?.slice(0, 3).map((rp: any) => (
                    <span key={rp.id} className="px-3 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium border border-gray-200 dark:border-slate-700">
                      {rp.permission.action}
                    </span>
                  ))}
                  {role.permissions?.length > 3 && (
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full text-xs font-medium border border-blue-100 dark:border-blue-800">
                      +{role.permissions.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
