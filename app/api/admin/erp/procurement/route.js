import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'PO'; // 'PO' or 'GRN'

    if (type === 'PO') {
      const pos = await prisma.erpPurchaseOrder.findMany({
        include: { supplier: true, items: true },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json(pos);
    } else {
      const grns = await prisma.erpGoodsReceipt.findMany({
        include: { supplier: true, items: true },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json(grns);
    }
  } catch (error) {
    console.error('Error fetching procurement data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { action } = data; // 'CREATE_PO' or 'PROCESS_GRN'

    if (action === 'CREATE_PO') {
      const { supplierId, items, notes } = data;
      
      // Calculate totals
      let totalAmount = 0;
      let gstAmount = 0;
      items.forEach(item => {
        const itemTotal = item.quantity * item.unitPrice;
        totalAmount += itemTotal;
        gstAmount += itemTotal * (item.gstPercent / 100);
      });

      const po = await prisma.erpPurchaseOrder.create({
        data: {
          supplierId,
          poNumber: `PO-${Date.now()}`,
          totalAmount,
          gstAmount,
          notes,
          items: {
            create: items.map(i => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              gstPercent: i.gstPercent
            }))
          }
        }
      });
      return NextResponse.json(po, { status: 201 });
    }

    if (action === 'PROCESS_GRN') {
      const { poId, supplierId, invoiceNumber, items, receivedById } = data;
      
      // Calculate totals
      let totalAmount = 0;
      let totalGst = 0;
      items.forEach(item => {
        const itemTotal = item.acceptedQty * item.purchasePrice;
        totalAmount += itemTotal;
        totalGst += itemTotal * (item.gstPercent / 100);
      });

      // 1. Create GRN
      const grn = await prisma.erpGoodsReceipt.create({
        data: {
          poId,
          supplierId,
          grnNumber: `GRN-${Date.now()}`,
          invoiceNumber,
          status: 'APPROVED',
          totalAmount,
          totalGst,
          receivedById,
          items: {
            create: items.map(i => ({
              productId: i.productId,
              batchNumber: i.batchNumber,
              expiryDate: new Date(i.expiryDate),
              mfgDate: i.mfgDate ? new Date(i.mfgDate) : null,
              quantity: i.quantity,
              acceptedQty: i.acceptedQty,
              rejectedQty: i.rejectedQty,
              purchasePrice: i.purchasePrice,
              mrp: i.mrp,
              gstPercent: i.gstPercent
            }))
          }
        }
      });

      // 2. Create Batches & Update legacy Product stock
      for (const item of items) {
        if (item.acceptedQty > 0) {
          // Create the new Batch
          await prisma.erpBatch.create({
            data: {
              productId: item.productId,
              batchNumber: item.batchNumber,
              stock: item.acceptedQty,
              expiryDate: new Date(item.expiryDate),
              mfgDate: item.mfgDate ? new Date(item.mfgDate) : null,
              purchasePrice: item.purchasePrice,
              mrp: item.mrp,
              grnId: grn.id
            }
          });

          // Sync stock to legacy Product model
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.acceptedQty },
              mrp: item.mrp // update latest MRP
            }
          }).catch(() => {}); // catch if product doesn't exist
        }
      }

      // 3. Log to Tax Ledger (Input Tax)
      if (totalGst > 0) {
        await prisma.erpTaxLedger.create({
          data: {
            transactionId: grn.id,
            type: 'INPUT_TAX',
            totalAmount,
            // Simple logic: Assuming Intra-state for now. 50/50 split CGST/SGST.
            cgstAmount: totalGst / 2,
            sgstAmount: totalGst / 2,
            igstAmount: 0
          }
        });
      }

      // 4. Update PO Status
      if (poId) {
        await prisma.erpPurchaseOrder.update({
          where: { id: poId },
          data: { status: 'COMPLETED' }
        });
      }

      return NextResponse.json(grn, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing procurement:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
