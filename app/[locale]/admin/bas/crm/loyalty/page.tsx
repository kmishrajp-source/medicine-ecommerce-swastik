'use client';

import React, { useState, useEffect } from 'react';
import { 
  Award, Search, PlusCircle, MinusCircle, 
  TrendingUp, CreditCard, Star
} from 'lucide-react';

const LoyaltyDashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    customerId: '',
    pointsToAdd: 0,
    pointsToDeduct: 0,
    cashbackToAdd: 0
  });

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/admin/bas/crm/loyalty');
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/bas/crm/loyalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: adjustForm.customerId,
          pointsToAdd: parseInt(adjustForm.pointsToAdd) || 0,
          pointsToDeduct: parseInt(adjustForm.pointsToDeduct) || 0,
          cashbackToAdd: parseFloat(adjustForm.cashbackToAdd) || 0
        })
      });
      setIsAdjusting(false);
      setAdjustForm({ customerId: '', pointsToAdd: 0, pointsToDeduct: 0, cashbackToAdd: 0 });
      fetchAccounts();
    } catch (err) {
      console.error(err);
    }
  };

  const getTierColor = (tier) => {
    switch(tier) {
      case 'Platinum': return 'bg-gray-900 text-white border-gray-900';
      case 'Gold': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'Silver': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-orange-50 text-orange-700 border-orange-200';
    }
  };

  const filteredAccounts = accounts.filter(a => 
    a.customerId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Award className="h-8 w-8 text-blue-600" />
            Loyalty & Rewards Ledger
          </h1>
          <p className="text-gray-500 mt-1">Manage customer points, cashback, and membership tiers.</p>
        </div>
        <button 
          onClick={() => setIsAdjusting(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <TrendingUp className="w-4 h-4" /> Adjust Balance
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border flex gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search ledger by Customer ID..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-200 animate-pulse rounded-xl"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map(acc => (
            <div key={acc.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition group">
              <div className={`p-4 border-b flex justify-between items-center ${getTierColor(acc.tier)}`}>
                <div className="flex items-center gap-2 font-semibold">
                  {acc.tier === 'Platinum' ? <Star className="w-5 h-5 text-yellow-400 fill-current" /> : <Award className="w-5 h-5" />}
                  {acc.tier} Member
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="text-sm text-gray-500 flex justify-between">
                  <span>Customer ID</span>
                  <span className="font-mono text-gray-900 truncate max-w-[150px]">{acc.customerId}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><PlusCircle className="w-3 h-3 text-blue-500"/> Points Balance</div>
                    <div className="text-2xl font-bold text-gray-900">{acc.pointsBalance.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><CreditCard className="w-3 h-3 text-green-500"/> Cashback Value</div>
                    <div className="text-2xl font-bold text-green-600">₹{acc.cashbackValue.toLocaleString()}</div>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-gray-500 pt-4 border-t">
                  <span>Lifetime Earned: {acc.totalEarned.toLocaleString()}</span>
                  <span>Redeemed: {acc.totalRedeemed.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredAccounts.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed rounded-xl">
              No loyalty accounts found.
            </div>
          )}
        </div>
      )}

      {/* Adjust Modal */}
      {isAdjusting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-600"/> Adjust Loyalty Balance</h3>
            </div>
            <form onSubmit={handleAdjustSubmit}>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
                  <input type="text" required className="w-full border rounded-lg p-2" value={adjustForm.customerId} onChange={e => setAdjustForm({...adjustForm, customerId: e.target.value})} placeholder="usr_123..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-green-600">Add Points</label>
                    <input type="number" className="w-full border rounded-lg p-2" value={adjustForm.pointsToAdd} onChange={e => setAdjustForm({...adjustForm, pointsToAdd: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-red-600">Deduct Points</label>
                    <input type="number" className="w-full border rounded-lg p-2" value={adjustForm.pointsToDeduct} onChange={e => setAdjustForm({...adjustForm, pointsToDeduct: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-blue-600">Add Cashback (₹)</label>
                  <input type="number" step="0.01" className="w-full border rounded-lg p-2" value={adjustForm.cashbackToAdd} onChange={e => setAdjustForm({...adjustForm, cashbackToAdd: e.target.value})} />
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setIsAdjusting(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyDashboard;
