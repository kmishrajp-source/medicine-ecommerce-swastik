'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Filter, Target, Send, Download, 
  ChevronDown, BarChart2
} from 'lucide-react';

const CustomerSegmentation = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Segmentation Filters
  const [filters, setFilters] = useState({
    classification: 'All',
    minLTV: '',
    maxLTV: '',
    tier: 'All',
    status: 'All'
  });

  useEffect(() => {
    // In a real app, filtering might happen backend-side. 
    // Here we fetch all and filter frontend-side for demonstration.
    const fetchAll = async () => {
      try {
        const res = await fetch('/api/admin/bas/crm/customers');
        const data = await res.json();
        setProfiles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Apply filters
  const filteredProfiles = profiles.filter(p => {
    const prof = p.basCustomerProfile || {};
    const passClassification = filters.classification === 'All' || prof.classification === filters.classification;
    const passStatus = filters.status === 'All' || prof.status === filters.status;
    const passMinLTV = filters.minLTV === '' || prof.lifetimeValue >= parseInt(filters.minLTV);
    const passMaxLTV = filters.maxLTV === '' || prof.lifetimeValue <= parseInt(filters.maxLTV);
    // Loyalty Tier logic assumes it's tracked in profile or we estimate it
    const estimatedTier = prof.lifetimeValue >= 10000 ? 'Platinum' : prof.lifetimeValue >= 5000 ? 'Gold' : prof.lifetimeValue >= 1000 ? 'Silver' : 'Bronze';
    const passTier = filters.tier === 'All' || estimatedTier === filters.tier;

    return passClassification && passStatus && passMinLTV && passMaxLTV && passTier;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Target className="h-8 w-8 text-blue-600" />
            Customer Segmentation
          </h1>
          <p className="text-gray-500 mt-1">Build dynamic lists for targeted marketing campaigns.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
            <Send className="w-4 h-4" /> Create Campaign
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left Side: Filter Builder */}
        <div className="w-1/3 bg-white p-6 rounded-xl shadow-sm border space-y-6">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 border-b pb-4">
            <Filter className="w-5 h-5 text-gray-400" /> Filter Criteria
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Classification</label>
              <select 
                className="w-full border rounded-lg p-2"
                value={filters.classification}
                onChange={e => setFilters({...filters, classification: e.target.value})}
              >
                <option value="All">All Classifications</option>
                <option value="Retail">Retail</option>
                <option value="Wholesale">Wholesale</option>
                <option value="Doctor">Doctor</option>
                <option value="Hospital">Hospital</option>
                <option value="Corporate">Corporate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loyalty Tier</label>
              <select 
                className="w-full border rounded-lg p-2"
                value={filters.tier}
                onChange={e => setFilters({...filters, tier: e.target.value})}
              >
                <option value="All">All Tiers</option>
                <option value="Bronze">Bronze</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
              <select 
                className="w-full border rounded-lg p-2"
                value={filters.status}
                onChange={e => setFilters({...filters, status: e.target.value})}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="VIP">VIP</option>
                <option value="High Risk">High Risk</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min LTV (₹)</label>
                <input 
                  type="number" className="w-full border rounded-lg p-2" placeholder="0"
                  value={filters.minLTV} onChange={e => setFilters({...filters, minLTV: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max LTV (₹)</label>
                <input 
                  type="number" className="w-full border rounded-lg p-2" placeholder="Any"
                  value={filters.maxLTV} onChange={e => setFilters({...filters, maxLTV: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <button 
              onClick={() => setFilters({ classification: 'All', minLTV: '', maxLTV: '', tier: 'All', status: 'All' })}
              className="w-full bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Right Side: Results */}
        <div className="w-2/3 flex flex-col space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Segment Size</div>
                <div className="text-2xl font-bold text-gray-900">{filteredProfiles.length} Users</div>
              </div>
              <Users className="w-8 h-8 text-blue-100 fill-blue-500" />
            </div>
            <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Avg. LTV of Segment</div>
                <div className="text-2xl font-bold text-green-600">
                  ₹{filteredProfiles.length > 0 
                    ? Math.round(filteredProfiles.reduce((sum, p) => sum + (p.basCustomerProfile?.lifetimeValue || 0), 0) / filteredProfiles.length).toLocaleString() 
                    : 0}
                </div>
              </div>
              <BarChart2 className="w-8 h-8 text-green-100" />
            </div>
          </div>

          <div className="bg-white border rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b bg-gray-50 font-semibold text-gray-700 flex justify-between items-center">
              Target Audience
              <span className="text-sm font-normal text-gray-500">{filteredProfiles.length} matching criteria</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading audience...</div>
              ) : filteredProfiles.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No customers match this segment.
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium text-gray-500">Name / Email</th>
                      <th className="px-4 py-3 font-medium text-gray-500">Class</th>
                      <th className="px-4 py-3 font-medium text-gray-500">LTV</th>
                      <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredProfiles.slice(0,50).map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{p.name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">{p.email || p.phone}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{p.basCustomerProfile?.classification || 'Retail'}</td>
                        <td className="px-4 py-3 text-green-600 font-medium">₹{p.basCustomerProfile?.lifetimeValue?.toLocaleString() || '0'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            p.basCustomerProfile?.status === 'Active' ? 'bg-green-100 text-green-700' :
                            p.basCustomerProfile?.status === 'VIP' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {p.basCustomerProfile?.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {filteredProfiles.length > 50 && (
                <div className="p-4 text-center text-sm text-gray-500 bg-gray-50 border-t">
                  Showing 50 of {filteredProfiles.length} users. Export CSV to see all.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSegmentation;
