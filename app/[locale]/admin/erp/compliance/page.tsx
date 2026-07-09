'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, FileText, Download, TrendingDown, TrendingUp,
  Landmark, AlertCircle, Calendar
} from 'lucide-react';

const ComplianceDashboard = () => {
  const [activeTab, setActiveTab] = useState('GST');
  const [data, setData] = useState({ ledgers: [], summary: {} });
  const [h1Data, setH1Data] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/erp/compliance?type=${activeTab}`);
      const json = await res.json();
      if (activeTab === 'GST') {
        setData(json);
      } else {
        setH1Data(Array.isArray(json) ? json : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleExport = (type) => {
    alert(`Generating ${type} Report (CSV)... Please check your downloads folder.`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
            Compliance & Financial Ledgers
          </h1>
          <p className="text-gray-500 mt-1">Manage GST filings (GSTR-3B) and Regulatory Registers (Schedule H1).</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleExport(activeTab)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Download className="w-4 h-4" /> Export {activeTab} Report
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b">
        <button 
          className={`px-4 py-2 font-medium border-b-2 flex items-center gap-2 ${activeTab === 'GST' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('GST')}
        >
          <Landmark className="w-4 h-4"/> GST Tax Ledger
        </button>
        <button 
          className={`px-4 py-2 font-medium border-b-2 flex items-center gap-2 ${activeTab === 'H1' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('H1')}
        >
          <FileText className="w-4 h-4"/> Schedule H1 Register
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading ledger data...</div>
      ) : activeTab === 'GST' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Input Tax Credit (ITC)</p>
                <h3 className="text-2xl font-bold text-green-600">₹{(data.summary?.inputTax || 0).toLocaleString()}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><TrendingDown className="w-3 h-3"/> Tax Paid on Purchases</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Output Tax Liability</p>
                <h3 className="text-2xl font-bold text-red-600">₹{(data.summary?.outputTax || 0).toLocaleString()}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><TrendingUp className="w-3 h-3"/> Tax Collected on Sales</p>
              </div>
            </div>
            <div className={`p-6 rounded-xl border shadow-sm flex items-center justify-between ${(data.summary?.netLiability || 0) > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
              <div>
                <p className={`text-sm font-medium mb-1 ${(data.summary?.netLiability || 0) > 0 ? 'text-amber-800' : 'text-green-800'}`}>Net GST Payable</p>
                <h3 className={`text-2xl font-bold ${(data.summary?.netLiability || 0) > 0 ? 'text-amber-900' : 'text-green-900'}`}>
                  ₹{Math.max(0, (data.summary?.netLiability || 0)).toLocaleString()}
                </h3>
                <p className={`text-xs mt-1 ${(data.summary?.netLiability || 0) > 0 ? 'text-amber-700' : 'text-green-700'}`}>
                  {(data.summary?.netLiability || 0) < 0 ? 'You have surplus ITC.' : 'Amount due to Government.'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Transaction Ref</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Type</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Taxable Value</th>
                  <th className="px-4 py-3 font-medium text-gray-500">CGST</th>
                  <th className="px-4 py-3 font-medium text-gray-500">SGST</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Total Tax</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.ledgers?.map(ledger => (
                  <tr key={ledger.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{new Date(ledger.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{ledger.transactionId.substring(0, 15)}...</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${ledger.type === 'INPUT_TAX' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {ledger.type === 'INPUT_TAX' ? 'PURCHASE (ITC)' : 'SALE (LIABILITY)'}
                      </span>
                    </td>
                    <td className="px-4 py-3">₹{ledger.totalAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500">₹{ledger.cgstAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500">₹{ledger.sgstAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 font-medium">₹{(ledger.cgstAmount + ledger.sgstAmount + ledger.igstAmount).toLocaleString()}</td>
                  </tr>
                ))}
                {(!data.ledgers || data.ledgers.length === 0) && (
                  <tr><td colSpan="7" className="p-8 text-center text-gray-500">No tax transactions found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Schedule H1 Register Requirements</h4>
              <p className="text-sm text-blue-700 mt-1">Under the Drugs and Cosmetics Rules, pharmacies must maintain a register for Schedule H1 drugs detailing the patient name, prescriber details, medicine dispensed, and date. This register must be retained for 3 years.</p>
            </div>
          </div>
          <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Date Dispensed</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Patient Name & Address</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Prescriber Details</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Drug Name</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Batch No.</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Qty Dispensed</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {h1Data.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" /> {new Date(log.dispensedDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{log.patientName}</div>
                      <div className="text-xs text-gray-500">{log.patientAddress || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{log.doctorName}</div>
                      <div className="text-xs text-gray-500">{log.doctorAddress || '-'}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-red-600">{log.medicineName}</td>
                    <td className="px-4 py-3 font-mono text-gray-500">{log.batchNumber || '-'}</td>
                    <td className="px-4 py-3 font-medium">{log.quantityDispensed}</td>
                  </tr>
                ))}
                {h1Data.length === 0 && (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500">No Schedule H1 dispensing records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceDashboard;
