const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function backCalcGst(amountInclGst, gstRate) {
    const rate = (gstRate || 5) / 100;
    const taxable = parseFloat((amountInclGst / (1 + rate)).toFixed(2));
    const gst = parseFloat((amountInclGst - taxable).toFixed(2));
    return { taxable, gst, cgst: parseFloat((gst / 2).toFixed(2)), sgst: parseFloat((gst / 2).toFixed(2)) };
}

async function run() {
    const DELIVERY_GST_RATE = 18;
    // Get the most recent order
    const order = await prisma.order.findFirst({
        orderBy: { createdAt: 'desc' },
        include: {
            items: {
                include: {
                    product: {
                        select: {
                            name: true, category: true, mrp: true, price: true,
                            requiresPrescription: true, batchNumber: true,
                            expiryDate: true, hsnCode: true, gstRate: true,
                            manufacturer: true, salt: true, packSize: true,
                            discount: true
                        }
                    }
                }
            },
            user: true
        }
    });

    if (!order) {
        console.log("No order found");
        return;
    }
    console.log("Order found:", order.id);

    try {
        const lines = order.items.map((item) => {
            const gstRate = item.product?.gstRate ?? 5;
            const hsnCode = item.product?.hsnCode ?? '3004';
            const mrp = item.product?.mrp || item.price;
            const rate = item.price;
            const qty = item.quantity;
            const discPct = mrp > rate ? parseFloat(((1 - rate / mrp) * 100).toFixed(1)) : 0;
            const amt = parseFloat((rate * qty).toFixed(2));
            const { taxable, gst, cgst, sgst } = backCalcGst(amt, gstRate);
            const pack = item.product?.packSize || '—';
            const batch = item.product?.batchNumber || '—';
            const exp = item.product?.expiryDate
                ? new Date(item.product.expiryDate).toLocaleDateString('en-IN', { month: '2-digit', year: '2-digit' })
                : '—';
            return {
                name: item.product?.name || 'Medicine',
                pack, qty, rate, gstRate, discPct, amt, mrp, batch, exp,
                hsnCode, taxable, gst, cgst, sgst
            };
        });

        const deliveryCharge = order.deliveryFee || 0;
        const dGst = backCalcGst(deliveryCharge, DELIVERY_GST_RATE);

        const subTotal = lines.reduce((s, l) => s + l.amt, 0);
        const totalTaxable = lines.reduce((s, l) => s + l.taxable, 0) + dGst.taxable;
        const totalCgst = lines.reduce((s, l) => s + l.cgst, 0) + dGst.cgst;
        const totalSgst = lines.reduce((s, l) => s + l.sgst, 0) + dGst.sgst;
        const totalGst = parseFloat((totalCgst + totalSgst).toFixed(2));
        const netTotal = order.total;
        const itemCount = lines.length;

        const invoiceNo = `SM${order.id.slice(-6).toUpperCase()}`;
        const dt = new Date(order.createdAt);
        const dateStr = dt.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const customerName = order.guestName || order.user?.name || 'Walk-in Customer';
        const customerPhone = order.guestPhone || order.user?.phone || '';
        const customerAddr = order.address || '';
        
        console.log("Success! No errors in logic.");
    } catch (err) {
        console.error("Error generating invoice:", err);
    }
}

run().finally(() => prisma.$disconnect());
