import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendWhatsAppText } from '@/lib/whatsapp';

export async function POST(req) {
    try {
        const body = await req.json();
        const { action } = body;

        // Stage 1 & 2: Analyze Customer Order & Check Approved Suppliers
        if (action === 'analyze_order') {
            const { orderId, products } = body;

            // Look up real order if orderId provided
            let orderProducts = products;
            if (orderId && orderId !== 'ORD-TEST-123') {
                const order = await prisma.order.findUnique({
                    where: { id: orderId },
                    include: { items: { include: { product: { select: { name: true, category: true } } } } }
                });
                if (order) {
                    orderProducts = order.items.map(i => ({
                        name: i.product?.name || i.productName,
                        qty: i.quantity,
                        category: i.product?.category || 'Healthcare'
                    }));
                }
            }

            const existingSuppliers = await prisma.erpSupplier.findMany({
                where: { status: 'ACTIVE' },
                take: 5
            });

            return NextResponse.json({
                success: true,
                message: 'Order analyzed',
                products: orderProducts || [{ name: 'Paracetamol 500mg', qty: 5000, category: 'Healthcare' }],
                approvedSuppliers: existingSuppliers
            });
        }

        // Stage 3 & 4: Real Supplier Discovery — queries DB first, no hardcoded mocks
        if (action === 'ai_discovery') {
            const { products } = body;
            const productNames = products?.map(p => p.name || p) || [];

            // 1. Search existing ErpSuppliers in DB
            const existingSuppliers = await prisma.erpSupplier.findMany({
                where: { status: 'ACTIVE' },
                take: 10
            });

            // 2. Search existing supplier Leads in DB
            const existingLeads = await prisma.lead.findMany({
                where: {
                    serviceType: 'supplier_prospect',
                    status: { notIn: ['converted', 'rejected'] }
                },
                take: 10
            });

            let createdProspects = [];
            if (existingSuppliers.length === 0 && existingLeads.length === 0) {
                // No suppliers in DB yet — create discovery task records for the team to action
                const categories = [...new Set(products?.map(p => p.category) || ['Healthcare'])];
                for (const category of categories.slice(0, 3)) {
                    const lead = await prisma.lead.create({
                        data: {
                            serviceType: 'supplier_prospect',
                            source: 'discovery_needed',
                            guestName: `[SEARCH REQUIRED] ${category} Supplier`,
                            guestPhone: '0000000000',
                            area: 'Gorakhpur / UP',
                            qualityScore: 0,
                            tags: ['unverified', 'discovery_needed'],
                            status: 'new',
                            details: JSON.stringify({
                                products: productNames,
                                category,
                                verificationStatus: 'Pending',
                                source: 'System Discovery Required'
                            }),
                            notes: `Supplier discovery needed for: ${productNames.join(', ')}. Please manually search indiamart.com or trade.india.com and update this record.`
                        }
                    });
                    createdProspects.push(lead);
                }
            } else {
                // Return real existing records from DB
                createdProspects = [
                    ...existingLeads,
                    ...existingSuppliers.map(s => ({
                        id: s.id,
                        guestName: s.name,
                        guestPhone: s.phone,
                        area: s.address,
                        status: 'verified',
                        serviceType: 'supplier_prospect',
                        qualityScore: 90,
                        notes: `Existing active ERP supplier`,
                        details: JSON.stringify({ verificationStatus: 'Verified', source: 'ErpSupplier DB' })
                    }))
                ];
            }

            return NextResponse.json({
                success: true,
                message: existingSuppliers.length > 0 || existingLeads.length > 0
                    ? `Found ${createdProspects.length} real supplier records from your database.`
                    : `No suppliers in DB yet. Created ${createdProspects.length} discovery task(s) — update them with real supplier details.`,
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
                data: { isVerified: true, status: 'verified', details: JSON.stringify(details) }
            });

            return NextResponse.json({ success: true, message: 'Supplier verified', prospect: updated });
        }

        // Stage 6 & 8: Human Compliance Approval & Add to Supplier Database
        if (action === 'approve_supplier') {
            const { prospectId, complianceNotes } = body;

            const prospect = await prisma.lead.findUnique({ where: { id: prospectId } });
            if (!prospect) throw new Error('Prospect not found');

            const newSupplier = await prisma.erpSupplier.create({
                data: {
                    name: prospect.guestName || 'Unknown Supplier',
                    phone: prospect.guestPhone || '0000000000',
                    address: prospect.area || 'Unknown',
                    status: 'ACTIVE',
                    notes: `Converted from Supplier Prospect. Compliance: ${complianceNotes}`
                }
            });

            await prisma.lead.update({
                where: { id: prospectId },
                data: { status: 'converted', notes: `Converted to ErpSupplier ${newSupplier.id}` }
            });

            return NextResponse.json({ success: true, message: 'Supplier Approved and Added to DB', supplier: newSupplier });
        }

        // Stage 7: RFQ — creates DB record AND sends real WhatsApp messages to suppliers
        if (action === 'send_rfq') {
            const { supplierIds, products } = body;

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

            // Notify real suppliers via WhatsApp
            let notifiedCount = 0;
            if (supplierIds && supplierIds.length > 0) {
                const suppliers = await prisma.erpSupplier.findMany({
                    where: { id: { in: supplierIds } },
                    select: { id: true, name: true, phone: true }
                });

                const productList = products?.map(p => `${p.name || p} (Qty: ${p.qty || 'TBD'})`).join(', ') || 'Multiple products';

                for (const supplier of suppliers) {
                    if (supplier.phone && supplier.phone !== '0000000000') {
                        const msg = `📋 *RFQ from Swastik Medicare*\n\nDear ${supplier.name},\n\nWe request a quotation for:\n${productList}\n\nPlease reply with your best price, MOQ, and lead time.\n\nRef: JOB-${procurementJob.id.slice(-8)}\n\n_Swastik Medicare Procurement_`;
                        try {
                            const result = await sendWhatsAppText(supplier.phone, msg);
                            if (result.success) notifiedCount++;
                        } catch (e) { /* non-critical */ }
                    }
                }
            }

            return NextResponse.json({
                success: true,
                message: `RFQ created. ${notifiedCount} supplier(s) notified via WhatsApp.`,
                jobId: procurementJob.id
            });
        }

        // Stage 9: Quotation Receiving
        if (action === 'receive_quotation') {
            const { jobId, supplierId, quotationData } = body;

            const job = await prisma.lead.findUnique({ where: { id: jobId } });
            const details = JSON.parse(job.details || '{}');

            if (!details.quotations) details.quotations = {};
            details.quotations[supplierId] = { ...quotationData, receivedAt: new Date().toISOString() };

            const updated = await prisma.lead.update({
                where: { id: jobId },
                data: { details: JSON.stringify(details), status: 'quotation_received' }
            });

            return NextResponse.json({ success: true, message: 'Quotation received and logged', job: updated });
        }

        // Stage 10-12: Landed Cost, Margin & AI Recommendation
        if (action === 'compare_and_recommend') {
            const { jobId, customerSellingPrice } = body;

            const job = await prisma.lead.findUnique({ where: { id: jobId } });
            const details = JSON.parse(job.details || '{}');
            const quotes = details.quotations || {};

            const results = [];
            let bestSupplier = null;
            let bestScore = -1;

            for (const [supplierId, quote] of Object.entries(quotes)) {
                const productCost = (quote.unitPrice * quote.qty) - (quote.discount || 0);
                const landedCost = productCost + (quote.taxes || 0) + (quote.freight || 0);
                const grossProfit = customerSellingPrice - landedCost;
                const marginPercent = ((grossProfit / customerSellingPrice) * 100).toFixed(2);

                let score = 50;
                if (marginPercent > 20) score += 20;
                else if (marginPercent > 10) score += 10;
                if (quote.leadTimeDays <= 3) score += 15;
                else if (quote.leadTimeDays > 7) score -= 10;

                const supplierResult = { supplierId, landedCost, grossProfit, marginPercent, score,
                    reason: `Landed cost ₹${landedCost}, Margin ${marginPercent}%, Lead Time ${quote.leadTimeDays} days` };
                results.push(supplierResult);
                if (score > bestScore) { bestScore = score; bestSupplier = supplierResult; }
            }

            details.comparisonResults = results;
            details.aiRecommendation = bestSupplier;
            await prisma.lead.update({ where: { id: jobId }, data: { details: JSON.stringify(details) } });

            return NextResponse.json({ success: true, message: 'Analysis complete', recommendation: bestSupplier, results });
        }

        // Stage 13 & 14: Approve PO
        if (action === 'approve_po') {
            const { jobId, approvedSupplierId, items } = body;

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
