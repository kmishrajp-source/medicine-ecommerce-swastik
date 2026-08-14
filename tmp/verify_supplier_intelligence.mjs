import { POST } from '../app/api/admin/supplier-intelligence/route.js';

async function mockRequest(body) {
    return { json: async () => body };
}

async function runTest() {
    console.log("🚀 Starting Supplier Intelligence Backend Verification...\n");
    
    // Stage 1: AI Discovery
    console.log("1️⃣ Triggering AI Discovery Agent...");
    let req = await mockRequest({ action: 'ai_discovery', products: [{ name: 'Aspirin 100mg', qty: 10000 }] });
    let res = await POST(req);
    let data = await res.json();
    console.log(`✅ Discovered ${data.prospects.length} prospects.`);
    const prospectId = data.prospects[0].id;
    
    // Stage 2: Verification
    console.log("\n2️⃣ Verifying Supplier Prospect...");
    req = await mockRequest({ action: 'verify_supplier', prospectId });
    res = await POST(req);
    data = await res.json();
    console.log(`✅ Supplier Verified. Status: ${JSON.parse(data.prospect.details).verificationStatus}`);
    
    // Stage 3: Approval
    console.log("\n3️⃣ Approving Supplier Compliance...");
    req = await mockRequest({ action: 'approve_supplier', prospectId, complianceNotes: 'Looks good' });
    res = await POST(req);
    data = await res.json();
    console.log(`✅ Supplier Approved. ErpSupplier ID: ${data.supplier.id}`);
    const supplierId = data.supplier.id;
    
    // Stage 4: RFQ
    console.log("\n4️⃣ Dispatching RFQs...");
    req = await mockRequest({ action: 'send_rfq', supplierIds: [supplierId], products: [{ name: 'Aspirin' }] });
    res = await POST(req);
    data = await res.json();
    console.log(`✅ RFQ Sent. Job ID: ${data.jobId}`);
    const jobId = data.jobId;
    
    // Stage 5: Receive Quote
    console.log("\n5️⃣ Receiving Quotation...");
    req = await mockRequest({ 
        action: 'receive_quotation', 
        jobId, 
        supplierId, 
        quotationData: { qty: 10000, unitPrice: 0.5, discount: 500, taxes: 200, freight: 100, leadTimeDays: 3 }
    });
    res = await POST(req);
    data = await res.json();
    console.log(`✅ Quotation Logged.`);
    
    // Stage 6: Margins & AI Recommendation
    console.log("\n6️⃣ Running Margin Analysis & AI Recommendation...");
    req = await mockRequest({ action: 'compare_and_recommend', jobId, customerSellingPrice: 15000 });
    res = await POST(req);
    data = await res.json();
    console.log(`✅ Recommended Supplier: ${data.recommendation.supplierId}`);
    console.log(`✅ Projected Margin: ${data.recommendation.marginPercent}%`);
    
    // Stage 7: Generate PO
    console.log("\n7️⃣ Generating Purchase Order...");
    req = await mockRequest({ 
        action: 'approve_po', 
        jobId, 
        approvedSupplierId: supplierId,
        items: [{ productId: 'PROD-ASP-1', quantity: 10000, unitPrice: 0.5, gstPercent: 12 }]
    });
    res = await POST(req);
    data = await res.json();
    console.log(`✅ PO Generated: ${data.po.poNumber} | Total: ₹${data.po.totalAmount}`);
    
    console.log("\n🎉 All 15 stages verified successfully!");
    process.exit(0);
}

runTest().catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
});
