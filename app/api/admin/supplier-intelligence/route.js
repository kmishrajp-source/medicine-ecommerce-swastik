import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
    try {
        const body = await req.json();
        const { action } = body;

        // Stage 1 & 2: Analyze Customer Order & Check Approved Suppliers
        if (action === 'analyze_order') {
            const { orderId, products } = body;
            // Find existing approved suppliers (ErpSupplier) who can supply these products
            // In a real app, we'd query ErpPoItem history or supplier catalogues
            // Here we mock finding existing suppliers
            const existingSuppliers = await prisma.erpSupplier.findMany({
                where: { status: 'ACTIVE' },
                take: 2
            });
            
            return NextResponse.json({
                success: true,
                message: 'Order analyzed',
                products: products || [{ name: 'Paracetamol 500mg', qty: 5000, category: 'Healthcare' }],
                approvedSuppliers: existingSuppliers
            });
        }

        // Stage 3 & 4: AI Supplier Discovery Agent -> Creates Supplier Prospects
        if (action === 'ai_discovery') {
            const { products } = body;
            const prospectMocks = [
                {
                    name: 'Apollo Lifesciences Mfg',
                    phone: '9876543210',
                    type: 'Manufacturer',
                    score: 95,
                    location: 'Baddi, HP',
                    details: {
                        products: products,
                        companyType: 'Manufacturer',
                        verificationStatus: 'Pending',
                        source: 'AI Public Directory Scrape',
                        website: 'apollolifesciences.com'
                    }
                },
                {
                    name: 'Delhi Pharma Distributors',
                    phone: '9988776655',
                    type: 'Authorised Distributor',
                    score: 75,
                    location: 'Delhi',
                    details: {
                        products: products,
                        companyType: 'Authorised Distributor',
                        verificationStatus: 'Pending',
                        source: 'Industry Directory',
                        website: 'delhipharmadist.in'
                    }
                }
            ];

            const createdProspects = [];
            for (const mock of prospectMocks) {
                const lead = await prisma.lead.create({
                    data: {
                        serviceType: 'supplier_prospect',
                        source: 'ai_discovery',
                        guestName: mock.name,
                        guestPhone: mock.phone,
                        area: mock.location,
                        qualityScore: mock.score,
                        tags: [mock.type.toLowerCase().replace(' ', '_'), 'ai_discovered'],
                        status: 'new',
                        details: JSON.stringify(mock.details),
                        notes: `AI discovered potential supplier for: ${products?.map(p => p.name).join(', ') || 'Unknown'}`
                    }
                });
                createdProspects.push(lead);
            }

            return NextResponse.json({
                success: true,
                message: 'AI discovered and created new supplier prospects',
                prospects: createdProspects
            });
        }

        // Stage 5: Supplier Verification
        if (action === 'verify_supplier') {
            const { prospectId, verificationData } = body;
            
            const prospect = await prisma.lead.findUnique({ where: { id: prospectId } });
            if (!prospect) throw new Error('Prospect not found');

            let details = {};
            if (prospect.details) details = JSON.parse(prospect.details);
            
            details.verificationItems = verificationData || {
                legalIdentity: 'Verified',
                bankDetails: 'Verified',
                gst: 'Verified',
                website: 'Verified'
            };
            details.verificationStatus = 'Completed';

            const updated = await prisma.lead.update({
                where: { id: prospectId },
                data: {
                    isVerified: true,
                    status: 'verified',
                    details: JSON.stringify(details)
                }
            });

            return NextResponse.json({ success: true, message: 'Supplier verified', prospect: updated });
        }

        // Stage 6 & 8: Human Compliance Approval & Add to Manufacturer/Supplier Database
        if (action === 'approve_supplier') {
            const { prospectId, complianceNotes } = body;

            const prospect = await prisma.lead.findUnique({ where: { id: prospectId } });
            if (!prospect) throw new Error('Prospect not found');
            
            const details = JSON.parse(prospect.details || '{}');

            // Convert Lead to ErpSupplier
            const newSupplier = await prisma.erpSupplier.create({
                data: {
                    name: prospect.guestName || 'Unknown Supplier',
                    phone: prospect.guestPhone || '0000000000',
                    address: prospect.area || 'Unknown',
                    status: 'ACTIVE',
                    notes: `Converted from AI Prospect. Compliance: ${complianceNotes}`
                }
            });

            // Mark prospect as converted
            await prisma.lead.update({
                where: { id: prospectId },
                data: { status: 'converted', notes: `Converted to ErpSupplier ${newSupplier.id}` }
            });

            return NextResponse.json({ success: true, message: 'Supplier Approved and Added to DB', supplier: newSupplier });
        }

        // Stage 7: Request Quotation (RFQ)
        if (action === 'send_rfq') {
            const { supplierIds, products } = body;
            
            // Create a procurement job to track this RFQ
            const procurementJob = await prisma.lead.create({
                data: {
                    serviceType: 'procurement_job',
                    status: 'rfq_sent',
                    details: JSON.stringify({
                        products,
                        suppliersTargeted: supplierIds,
                        rfqStatus: 'Sent',
                        sentAt: new Date().toISOString()
                    })
                }
            });

            return NextResponse.json({ success: true, message: 'RFQs dispatched to suppliers', jobId: procurementJob.id });
        }

        // Stage 9: Quotation Comparison & Receiving
        if (action === 'receive_quotation') {
            const { jobId, supplierId, quotationData } = body;
            
            const job = await prisma.lead.findUnique({ where: { id: jobId } });
            const details = JSON.parse(job.details || '{}');

            if (!details.quotations) details.quotations = {};
            
            // Expected quotationData: { unitPrice, moq, discount, taxes, freight, leadTime }
            details.quotations[supplierId] = {
                ...quotationData,
                receivedAt: new Date().toISOString()
            };

            const updated = await prisma.lead.update({
                where: { id: jobId },
                data: { details: JSON.stringify(details), status: 'quotation_received' }
            });

            return NextResponse.json({ success: true, message: 'Quotation received and logged', job: updated });
        }

        // Stage 10, 11 & 12: Landed Cost, Margin Calc & AI Recommendation
        if (action === 'compare_and_recommend') {
            const { jobId, customerSellingPrice } = body;
            
            const job = await prisma.lead.findUnique({ where: { id: jobId } });
            const details = JSON.parse(job.details || '{}');
            const quotes = details.quotations || {};
            
            const results = [];
            let bestSupplier = null;
            let bestScore = -1;

            for (const [supplierId, quote] of Object.entries(quotes)) {
                // Landed Cost = (Unit Price * Qty) - Discount + Taxes + Freight
                // Assuming quote prices are per total required quantity for simplicity
                const productCost = (quote.unitPrice * quote.qty) - (quote.discount || 0);
                const landedCost = productCost + (quote.taxes || 0) + (quote.freight || 0);
                
                // Margin Calculation
                const grossProfit = customerSellingPrice - landedCost;
                const marginPercent = ((grossProfit / customerSellingPrice) * 100).toFixed(2);

                // AI Scoring Heuristic
                let score = 50; // base
                if (marginPercent > 20) score += 20;
                else if (marginPercent > 10) score += 10;
                
                if (quote.leadTimeDays <= 3) score += 15;
                else if (quote.leadTimeDays > 7) score -= 10;
                
                // Track results
                const supplierResult = {
                    supplierId,
                    landedCost,
                    grossProfit,
                    marginPercent,
                    score,
                    reason: `Landed cost ₹${landedCost}, Margin ${marginPercent}%, Lead Time ${quote.leadTimeDays} days`
                };

                results.push(supplierResult);

                if (score > bestScore) {
                    bestScore = score;
                    bestSupplier = supplierResult;
                }
            }

            details.comparisonResults = results;
            details.aiRecommendation = bestSupplier;

            await prisma.lead.update({
                where: { id: jobId },
                data: { details: JSON.stringify(details) }
            });

            return NextResponse.json({ success: true, message: 'Analysis complete', recommendation: bestSupplier, results });
        }

        // Stage 13 & 14: Human Approval & Purchase Order
        if (action === 'approve_po') {
            const { jobId, approvedSupplierId, items } = body;

            // Generate PO
            const po = await prisma.erpPurchaseOrder.create({
                data: {
                    supplierId: approvedSupplierId,
                    poNumber: `PO-${Date.now()}`,
                    status: 'ISSUED',
                    totalAmount: items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
                    notes: `Generated via AI Supplier Intelligence Job ${jobId}`,
                    items: {
                        create: items.map(item => ({
                            productId: item.productId || 'UNKNOWN_PROD',
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            gstPercent: item.gstPercent || 12
                        }))
                    }
                },
                include: { items: true, supplier: true }
            });

            // Mark Job as Completed
            await prisma.lead.update({
                where: { id: jobId },
                data: { status: 'po_issued', notes: `PO Generated: ${po.poNumber}` }
            });

            return NextResponse.json({ success: true, message: 'Purchase Order generated', po });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error("Supplier Intelligence API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
