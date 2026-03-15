"use client";
import { useState, useEffect } from "react";
import { Wallet, IndianRupee, ArrowUpRight, History, CheckCircle, Clock } from "lucide-react";

export default function ProviderWallet() {
  const [balance, setBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);

  // Form State
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("UPI"); // UPI or BANK
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/withdrawals");
      const data = await res.json();
      if (data.success) {
        setBalance(data.balance);
        setWithdrawals(data.withdrawals);
      }
    } catch (err) {
      console.error("Failed to load wallet data", err);
    }
    setLoading(false);
  };

  const submitWithdrawal = async (e) => {
    e.preventDefault();
    if (amount < 100) return alert("Minimum withdrawal is ₹100");
    if (amount > balance) return alert("Insufficient Balance");
    if (!details) return alert("Please enter payment details");

    setSubmitting(true);
    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), paymentMethod: method, paymentDetails: details }),
      });
      const data = await res.json();
      
      if (data.success) {
        alert("Withdrawal Request Submitted Successfully!");
        setShowRequestForm(false);
        setAmount("");
        setDetails("");
        fetchWalletData(); // Refresh UI
      } else {
        alert(data.error || "Failed to submit request.");
      }
    } catch (error) {
      alert("Error submitting withdrawal request.");
    }
    setSubmitting(false);
  };

  if (loading) return <div className="p-4 bg-gray-50 animate-pulse rounded-xl h-48"></div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header & Balance */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-emerald-100 text-sm font-medium mb-1">Available Earnings</p>
            <h2 className="text-3xl font-bold flex items-center">
              <IndianRupee className="w-6 h-6 mr-1" />
              {balance.toFixed(2)}
            </h2>
          </div>
        </div>
        
        <button 
          onClick={() => setShowRequestForm(!showRequestForm)}
          className="bg-white text-emerald-700 hover:bg-emerald-50 px-6 py-2.5 rounded-full font-bold shadow-sm transition-all focus:ring-4 focus:ring-emerald-500/30 flex items-center gap-2"
        >
          <ArrowUpRight className="w-5 h-5" />
          Withdraw Funds
        </button>
      </div>

      {/* Withdrawal Form Toggle */}
      {showRequestForm && (
        <div className="p-6 bg-emerald-50 border-b border-emerald-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            Request Payout
          </h3>
          <form onSubmit={submitWithdrawal} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input 
                  type="number" 
                  min="100" 
                  max={balance}
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Min ₹100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payout Method</label>
                <select 
                  value={method} 
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                >
                  <option value="UPI">UPI ID</option>
                  <option value="BANK">Bank Account (IMPS/NEFT)</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {method === "UPI" ? "Enter UPI ID (e.g. name@okhdfcbank)" : "Enter Bank A/C No. & IFSC"}
              </label>
              <input 
                type="text" 
                value={details} 
                onChange={(e) => setDetails(e.target.value)} 
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                placeholder={method === "UPI" ? "yourname@ybl" : "A/C: 12345678, IFSC: SBIN0001234"}
                required
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setShowRequestForm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting || balance < 100}
                className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Processing..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History List */}
      <div className="p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-gray-400" />
          Recent Withdrawals
        </h3>
        
        {withdrawals.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            No withdrawal history found.
          </p>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((w) => (
              <div key={w.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-1.5 rounded-full ${w.status === 'Completed' ? 'bg-green-100' : w.status === 'Rejected' ? 'bg-red-100' : 'bg-amber-100'}`}>
                    {w.status === 'Completed' ? <CheckCircle className="w-4 h-4 text-green-600" /> : w.status === 'Rejected' ? <Clock className="w-4 h-4 text-red-600" /> : <Clock className="w-4 h-4 text-amber-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">₹{w.amount.toFixed(2)} to {w.paymentMethod}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-xs">{w.paymentDetails}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(w.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                  w.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                  w.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
                  'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {w.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
