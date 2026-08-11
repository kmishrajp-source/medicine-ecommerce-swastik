"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CheckSquare, Square, DollarSign, ArrowRight, Download, CheckCircle, Clock } from "lucide-react";

export default function AdminSettlementsPage() {
    const { data: session } = useSession();
    const [eligibleItems, setEligibleItems] = useState([]);
    const [batches, setBatches] = useState([]);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [batching, setBatching] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/admin/settlements");
            const data = await res.json();
            if (data.success) {
                setEligibleItems(data.eligibleItems);
                setBatches(data.batches);
            }
        } catch (error) {
            console.error("Failed to fetch settlements", error);
        }
        setLoading(false);
    };

    const toggleSelection = (id) => {
        const next = new Set(selectedItems);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedItems(next);
    };

    const toggleAll = () => {
        if (selectedItems.size === eligibleItems.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(eligibleItems.map(i => i.id)));
        }
    };

    const handleCreateBatch = async () => {
        if (selectedItems.size === 0) return alert("Select items to batch");
        
        setBatching(true);
        try {
            const res = await fetch("/api/admin/settlements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemIds: Array.from(selectedItems) })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Batch ${data.batch.batchRef} created successfully for processing!`);
                setSelectedItems(new Set());
                fetchData();
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert("Failed to create batch");
        }
        setBatching(false);
    };

    const handleMarkPaid = async (batchId) => {
        if (!confirm("Are you sure you want to mark this batch as PAID?")) return;
        
        try {
            const res = await fetch("/api/admin/settlements", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ batchId })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Batch marked as PAID successfully!`);
                fetchData();
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert("Failed to mark batch as paid");
        }
    };

    const totalSelectedAmount = eligibleItems
        .filter(i => selectedItems.has(i.id))
        .reduce((sum, i) => sum + i.netAmount, 0);

    if (loading) return <div className="p-8 text-center">Loading Settlement Data...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ marginTop: '80px' }}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Retailer Settlements</h1>
                    <p className="text-gray-500 mt-1">Batch eligible orders and process payouts to retailers.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Eligible Items for Batching */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-indigo-600" />
                            Eligible for Settlement
                        </h2>
                        <span className="bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full text-xs font-bold">
                            {eligibleItems.length} Pending
                        </span>
                    </div>

                    <div className="p-0 max-h-[500px] overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white sticky top-0 border-b border-gray-200 shadow-sm z-10 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="p-4 w-10">
                                        <button onClick={toggleAll}>
                                            {selectedItems.size > 0 && selectedItems.size === eligibleItems.length 
                                                ? <CheckSquare className="w-5 h-5 text-indigo-600" />
                                                : <Square className="w-5 h-5 text-gray-400" />}
                                        </button>
                                    </th>
                                    <th className="p-4">Retailer</th>
                                    <th className="p-4">Bank Verification</th>
                                    <th className="p-4 text-right">Net Payout</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {eligibleItems.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <button onClick={() => toggleSelection(item.id)}>
                                                {selectedItems.has(item.id) 
                                                    ? <CheckSquare className="w-5 h-5 text-indigo-600" /> 
                                                    : <Square className="w-5 h-5 text-gray-300" />}
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-bold text-gray-800 text-sm">{item.retailer?.shopName || 'Unknown'}</p>
                                            <p className="text-xs text-gray-500">Order: {item.subOrderId.slice(-6).toUpperCase()}</p>
                                        </td>
                                        <td className="p-4">
                                            {item.retailer?.bankVerified ? (
                                                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">Verified</span>
                                            ) : (
                                                <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded">Unverified</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right font-bold text-gray-900">
                                            ₹{item.netAmount.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {eligibleItems.length === 0 && (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                No eligible items waiting for settlement.
                            </div>
                        )}
                    </div>

                    {/* Batch Action Bar */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                        <div className="text-sm">
                            <span className="text-gray-500">Selected: </span>
                            <span className="font-bold text-gray-900">{selectedItems.size} items</span>
                            <span className="mx-2 text-gray-300">|</span>
                            <span className="text-gray-500">Total: </span>
                            <span className="font-bold text-indigo-600">₹{totalSelectedAmount.toFixed(2)}</span>
                        </div>
                        <button 
                            onClick={handleCreateBatch}
                            disabled={batching || selectedItems.size === 0}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {batching ? "Creating..." : "Create Settlement Batch"} <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Processed Batches */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Settlement Batches</h2>
                    </div>
                    <div className="p-4 space-y-4 max-h-[570px] overflow-y-auto">
                        {batches.map(batch => (
                            <div key={batch.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">{batch.batchRef}</h3>
                                        <p className="text-xs text-gray-500">{new Date(batch.createdAt).toLocaleString()}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${
                                        batch.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {batch.status === 'PAID' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                        {batch.status}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Items</p>
                                        <p className="font-medium text-gray-800">{batch._count?.items || 0}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 uppercase">Total Payout</p>
                                        <p className="font-bold text-gray-900 text-lg">₹{batch.totalAmount.toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                                        <a
                                            href={`/api/admin/settlements/export?batchId=${batch.id}`}
                                            download
                                            className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-4 h-4" /> Export Bank CSV
                                        </a>
                                    {batch.status === 'PROCESSING' && (
                                        <button 
                                            onClick={() => handleMarkPaid(batch.id)}
                                            className="flex-1 bg-green-50 border border-green-200 text-green-700 py-2 rounded font-bold text-sm hover:bg-green-100 transition-colors"
                                        >
                                            Mark as PAID
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {batches.length === 0 && (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                No settlement batches created yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
