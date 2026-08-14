"use client";
import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";

export default function SupplierIntelligenceDashboard() {
    const [activeTab, setActiveTab] = useState('discovery');
    const [loading, setLoading] = useState(false);
    
    // Workflow State
    const [orderData, setOrderData] = useState(null);
    const [prospects, setProspects] = useState([]);
    const [procurementJob, setProcurementJob] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [purchaseOrder, setPurchaseOrder] = useState(null);

    // Workspace 1: Discovery
    const handleAnalyzeOrder = async () => {
        setLoading(true);
        const res = await fetch('/api/admin/supplier-intelligence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'analyze_order', orderId: 'ORD-TEST-123' })
        });
        const data = await res.json();
        setOrderData(data);
        setLoading(false);
    };

    const handleAIDiscovery = async () => {
        setLoading(true);
        const res = await fetch('/api/admin/supplier-intelligence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'ai_discovery', products: orderData?.products })
        });
        const data = await res.json();
        setProspects(data.prospects);
        setLoading(false);
        setActiveTab('compliance');
    };

    // Workspace 2: Compliance
    const handleVerifySupplier = async (prospectId) => {
        setLoading(true);
        const res = await fetch('/api/admin/supplier-intelligence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'verify_supplier', prospectId })
        });
        const data = await res.json();
        if (data.success) {
            setProspects(prev => prev.map(p => p.id === prospectId ? data.prospect : p));
        }
        setLoading(false);
    };

    const handleApproveSupplier = async (prospectId) => {
        setLoading(true);
        const res = await fetch('/api/admin/supplier-intelligence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'approve_supplier', prospectId, complianceNotes: 'Approved by human compliance officer' })
        });
        const data = await res.json();
        if (data.success) {
            alert(`Supplier converted! New ERP ID: ${data.supplier.id}`);
            setProspects(prev => prev.filter(p => p.id !== prospectId));
            setActiveTab('quotation');
            // Trigger RFQ automatically for demo purposes
            handleSendRFQ(data.supplier.id);
        }
        setLoading(false);
    };

    // Workspace 3: Quotation
    const handleSendRFQ = async (supplierId) => {
        setLoading(true);
        const res = await fetch('/api/admin/supplier-intelligence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'send_rfq', supplierIds: [supplierId], products: orderData?.products })
        });
        const data = await res.json();
        setProcurementJob(data.jobId);
        setLoading(false);
    };

    const handleSimulateQuote = async () => {
        if (!procurementJob) return alert("No active procurement job.");
        setLoading(true);
        
        // Mocking a received quote for testing
        const res = await fetch('/api/admin/supplier-intelligence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'receive_quotation', 
                jobId: procurementJob, 
                supplierId: 'SUP-TEST-1',
                quotationData: {
                    qty: 5000,
                    unitPrice: 1.5,
                    discount: 500,
                    taxes: 420,
                    freight: 150,
                    leadTimeDays: 2
                }
            })
        });
        await res.json();
        
        // Mocking second quote
        await fetch('/api/admin/supplier-intelligence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'receive_quotation', 
                jobId: procurementJob, 
                supplierId: 'SUP-TEST-2',
                quotationData: {
                    qty: 5000,
                    unitPrice: 1.6,
                    discount: 200,
                    taxes: 440,
                    freight: 100,
                    leadTimeDays: 5
                }
            })
        });

        alert("Quotations Received!");
        setLoading(false);
        setActiveTab('analysis');
    };

    // Workspace 4: Analysis & PO
    const handleRunAnalysis = async () => {
        setLoading(true);
        const res = await fetch('/api/admin/supplier-intelligence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'compare_and_recommend', 
                jobId: procurementJob, 
                customerSellingPrice: 12000 // Mock selling price for margin calc
            })
        });
        const data = await res.json();
        setAnalysisResult(data);
        setLoading(false);
    };

    const handleApprovePO = async () => {
        if (!analysisResult?.recommendation) return;
        setLoading(true);
        const res = await fetch('/api/admin/supplier-intelligence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'approve_po', 
                jobId: procurementJob, 
                approvedSupplierId: analysisResult.recommendation.supplierId,
                items: orderData?.products?.map(p => ({
                    productId: p.id || 'PROD-X',
                    quantity: p.qty,
                    unitPrice: 1.5 // Mock unit price matching quote
                })) || []
            })
        });
        const data = await res.json();
        setPurchaseOrder(data.po);
        setLoading(false);
        alert(`Purchase Order ${data.po.poNumber} Created Successfully!`);
    };

    const TabButton = ({ id, label, icon }) => (
        <button 
            onClick={() => setActiveTab(id)}
            style={{
                background: activeTab === id ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                border: activeTab === id ? '1px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.1)',
                color: activeTab === id ? '#F59E0B' : '#94a3b8',
                padding: '12px 20px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s',
                flex: 1,
                justifyContent: 'center'
            }}>
            {icon} {label}
        </button>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#050B14', color: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
            <Navbar cartCount={0} openCart={() => {}} />
            
            <div style={{ padding: '120px 20px 60px', maxWidth: '1400px', margin: '0 auto' }}>
                <header style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, color: '#F59E0B' }}>
                        📦 Supplier Intelligence
                    </h1>
                    <p style={{ color: '#94a3b8', marginTop: '10px' }}>
                        15-Stage AI Procurement & Margin Analysis Engine
                    </p>
                </header>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
                    <TabButton id="discovery" label="1. Order & Discovery" icon="🔍" />
                    <TabButton id="compliance" label="2. Compliance Verification" icon="🛡️" />
                    <TabButton id="quotation" label="3. Quotes & RFQ" icon="📝" />
                    <TabButton id="analysis" label="4. AI Margins & PO" icon="🤖" />
                </div>

                <main style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(245, 158, 11, 0.15)',
                    borderRadius: '24px',
                    padding: '40px',
                    minHeight: '500px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                }}>
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#F59E0B' }}>
                            <div className="spinner" style={{ fontSize: '2rem', marginBottom: '20px' }}>⏳</div>
                            Loading System Data...
                        </div>
                    )}

                    {!loading && activeTab === 'discovery' && (
                        <div className="animate-fade-in">
                            <h2 style={{ color: '#34d399', marginBottom: '20px' }}>Order Identification & Supplier Check</h2>
                            
                            {!orderData ? (
                                <button onClick={handleAnalyzeOrder} style={actionBtnStyle}>
                                    Fetch Incoming Orders
                                </button>
                            ) : (
                                <div>
                                    <div style={cardStyle}>
                                        <h3 style={{ margin: '0 0 10px 0', color: 'white' }}>Required Products</h3>
                                        {orderData.products.map((p, i) => (
                                            <div key={i} style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '10px' }}>
                                                <strong>{p.name}</strong> - Qty: {p.qty} <br/>
                                                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Category: {p.category}</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div style={{ marginTop: '30px' }}>
                                        <h3 style={{ color: '#F59E0B' }}>AI Discovery Engine</h3>
                                        <p style={{ color: '#94a3b8' }}>No active inventory found for this volume. Initiate global discovery.</p>
                                        <button onClick={handleAIDiscovery} style={{...actionBtnStyle, background: '#F59E0B', color: 'black'}}>
                                            Launch AI Discovery Agent
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!loading && activeTab === 'compliance' && (
                        <div className="animate-fade-in">
                            <h2 style={{ color: '#34d399', marginBottom: '20px' }}>Supplier Prospects Verification</h2>
                            
                            {prospects.length === 0 ? (
                                <p style={{ color: '#94a3b8' }}>No prospects found. Run AI Discovery first.</p>
                            ) : (
                                <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
                                    {prospects.map(p => (
                                        <div key={p.id} style={cardStyle}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <h3 style={{ margin: 0, color: 'white' }}>{p.guestName}</h3>
                                                <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>AI Match: {p.qualityScore}%</span>
                                            </div>
                                            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Type: {p.tags.join(', ')} | Location: {p.area}</p>
                                            
                                            <div style={{ marginTop: '15px', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                                                <strong>Compliance Status:</strong> {JSON.parse(p.details).verificationStatus}
                                            </div>
                                            
                                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                                {JSON.parse(p.details).verificationStatus === 'Pending' ? (
                                                    <button onClick={() => handleVerifySupplier(p.id)} style={{...actionBtnStyle, padding: '8px 15px', fontSize: '0.9rem', flex: 1}}>
                                                        Verify Documents
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleApproveSupplier(p.id)} style={{...actionBtnStyle, background: '#10B981', padding: '8px 15px', fontSize: '0.9rem', flex: 1}}>
                                                        Approve Supplier
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {!loading && activeTab === 'quotation' && (
                        <div className="animate-fade-in">
                            <h2 style={{ color: '#34d399', marginBottom: '20px' }}>RFQ Tracking & Quotations</h2>
                            
                            {!procurementJob ? (
                                <p style={{ color: '#94a3b8' }}>No active RFQs. Please approve a supplier first.</p>
                            ) : (
                                <div style={cardStyle}>
                                    <h3 style={{ margin: '0 0 10px 0', color: 'white' }}>Active Procurement Job: {procurementJob}</h3>
                                    <p style={{ color: '#10B981' }}>Status: RFQs Dispatched Successfully</p>
                                    
                                    <div style={{ marginTop: '20px' }}>
                                        <button onClick={handleSimulateQuote} style={actionBtnStyle}>
                                            Simulate Receiving Quotations
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!loading && activeTab === 'analysis' && (
                        <div className="animate-fade-in">
                            <h2 style={{ color: '#F59E0B', marginBottom: '20px' }}>Landed Cost & Margin Analysis</h2>
                            
                            {!analysisResult ? (
                                <div>
                                    <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Ready to compute landed costs across received quotes.</p>
                                    <button onClick={handleRunAnalysis} style={{...actionBtnStyle, background: '#F59E0B', color: 'black'}}>
                                        Run AI Margin Comparison
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: '30px' }}>
                                        {analysisResult.results.map((r, i) => (
                                            <div key={i} style={{...cardStyle, border: r.supplierId === analysisResult.recommendation.supplierId ? '2px solid #F59E0B' : '1px solid rgba(255,255,255,0.1)'}}>
                                                {r.supplierId === analysisResult.recommendation.supplierId && (
                                                    <div style={{ background: '#F59E0B', color: 'black', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                        AI RECOMMENDED
                                                    </div>
                                                )}
                                                <h4 style={{ margin: '0 0 10px 0', color: 'white' }}>Supplier: {r.supplierId}</h4>
                                                <p>Landed Cost: <strong style={{ color: '#ef4444' }}>₹{r.landedCost}</strong></p>
                                                <p>Gross Profit: <strong style={{ color: '#10b981' }}>₹{r.grossProfit}</strong></p>
                                                <p>Gross Margin: <strong>{r.marginPercent}%</strong></p>
                                                <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#94a3b8', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px' }}>
                                                    <strong>AI Reason:</strong> {r.reason}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {!purchaseOrder ? (
                                        <button onClick={handleApprovePO} style={{...actionBtnStyle, background: '#10B981', display: 'block', width: '100%'}}>
                                            Authorize Final Purchase Order (PO)
                                        </button>
                                    ) : (
                                        <div style={{...cardStyle, background: 'rgba(16, 185, 129, 0.1)', borderColor: '#10B981', textAlign: 'center'}}>
                                            <h3 style={{ color: '#10B981', margin: '0 0 10px 0' }}>✅ PO Generated Successfully</h3>
                                            <p>PO Number: <strong>{purchaseOrder.poNumber}</strong></p>
                                            <p>Total Value: ₹{purchaseOrder.totalAmount}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
            <style jsx>{`
                .spinner { animation: spin 2s linear infinite; display: inline-block; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .animate-fade-in { animation: fadeIn 0.5s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

const actionBtnStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '12px 24px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s'
};

const cardStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '20px',
    borderRadius: '16px'
};
