import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import InvoicePrintButton from "@/components/InvoicePrintButton";

// ── GST Helper ─────────────────────────────────────────────────────────────────
// MRP in India is GST-inclusive. Back-calculate taxable value.
function backCalcGst(amountInclGst, gstRate) {
    const rate = (gstRate || 5) / 100;
    const taxable = parseFloat((amountInclGst / (1 + rate)).toFixed(2));
    const gst = parseFloat((amountInclGst - taxable).toFixed(2));
    return { taxable, gst, cgst: parseFloat((gst / 2).toFixed(2)), sgst: parseFloat((gst / 2).toFixed(2)) };
}

const DELIVERY_GST_RATE = 18; // Transport = 18% GST
// v3 - cache bust

export default async function InvoicePage({ params, searchParams }) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;
        const sp = await searchParams;
        const isGuestLink = sp?.guest === '1'; // allow access via SMS link ?guest=1

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                assignedRetailer: true,
                items: {
                    include: {
                        product: {
                            select: {
                                name: true, category: true, mrp: true, price: true,
                                requiresPrescription: true, batchNumber: true,
                                expiryDate: true,
                                manufacturer: true, salt: true, packSize: true,
                                discount: true
                            }
                        }
                    }
                },
                user: true
            }
        });

        if (!order) return <div style={{ padding: '40px', fontFamily: 'monospace' }}>Order not found</div>;

        const isOwner = session?.user?.id === order.userId;
        const isAdmin = session?.user?.role === 'ADMIN';
        const isGuestOrder = Boolean(order.guestPhone || order.guestEmail || order.guestName);

        // Allow access if: owner, admin, guest order (has guest info), or ?guest=1 link from SMS
        if (!isOwner && !isAdmin && !isGuestOrder && !isGuestLink) {
            if (!session) redirect('/login');
            return <div style={{ padding: '40px', fontFamily: 'monospace' }}>Unauthorized</div>;
        }

        // ── Line items with GST ───────────────────────────────────────────────────
        const lines = order.items.map((item) => {
            const gstRate = 5; // Default 5% GST (field not in DB schema)
            const hsnCode = item.product?.hsnCode ?? '3004';
            const mrp = item.product?.mrp || item.price;
            const rate = item.price;  // selling price per unit (GST inclusive)
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
                name: item.product?.name || item.productName || 'Medicine',
                pack, qty, rate, gstRate, discPct, amt, mrp, batch, exp,
                hsnCode, taxable, gst, cgst, sgst
            };
        });

        // ── Delivery GST ──────────────────────────────────────────────────────────
        const deliveryCharge = order.deliveryFee || 0;
        const dGst = backCalcGst(deliveryCharge, DELIVERY_GST_RATE);

        // ── Totals ────────────────────────────────────────────────────────────────
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

        // ── HSN group for summary ─────────────────────────────────────────────────
        const hsnGroups = {};
        lines.forEach(l => {
            const k = `${l.hsnCode}-${l.gstRate}`;
            if (!hsnGroups[k]) hsnGroups[k] = { hsn: l.hsnCode, rate: l.gstRate, taxable: 0, cgst: 0, sgst: 0 };
            hsnGroups[k].taxable += l.taxable;
            hsnGroups[k].cgst += l.cgst;
            hsnGroups[k].sgst += l.sgst;
        });

        // ── Monospace table styles ─────────────────────────────────────────────────
        const mono = { fontFamily: "'Courier New', Courier, monospace" };
        const cell = { padding: '4px 6px', borderRight: '1px solid #94A3B8', borderBottom: '1px solid #CBD5E1', fontSize: '0.82rem', ...mono };
        const cellR = { ...cell, textAlign: 'right' };
        const cellC = { ...cell, textAlign: 'center' };
        const hCell = { ...cell, fontWeight: '800', background: '#E2E8F0', color: '#1E293B', fontSize: '0.78rem', textAlign: 'center', whiteSpace: 'nowrap' };
        const border = { border: '2px solid #475569' };

        return (
            <div style={{ background: '#F1F5F9', minHeight: '100vh', padding: '20px 10px', ...mono }}>
                <div id="invoice-print-area" style={{
                    background: 'white', maxWidth: '900px', margin: '0 auto',
                    borderRadius: '4px', boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                    padding: '24px 28px', ...border
                }}>

                    {/* ══ HEADER ══ */}
                    <div style={{ textAlign: 'center', borderBottom: '2px double #475569', paddingBottom: '12px', marginBottom: '12px' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: '900', letterSpacing: '4px', color: '#1E293B' }}>
                            TAX INVOICE
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
                        <div>
                            <div style={{ fontSize: '0.70rem', color: '#16A34A', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                🏪 DISPENSING LICENSED PHARMACY (SELLER)
                            </div>
                            <div style={{ fontWeight: '900', fontSize: '1.15rem', color: '#1E293B' }}>
                                {order.assignedRetailer?.shopName || "SWASTIK PARTNER PHARMACY"}
                            </div>
                            <div style={{ fontSize: '0.80rem', color: '#475569' }}>
                                {order.assignedRetailer?.address || "Civil Lines, Gorakhpur, UP - 273001"}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                                {order.assignedRetailer?.phone ? `Ph: +${order.assignedRetailer.phone}` : "Ph: +91 79921 22974"}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#0F766E', fontWeight: '700' }}>
                                {order.assignedRetailer?.licenseNumber ? `D.L. No: ${order.assignedRetailer.licenseNumber} (Form 20/21)` : "D.L. No: UP-GKP-2024-001 (Form 20/21)"}
                                {order.assignedRetailer?.gstNumber ? ` | GSTIN: ${order.assignedRetailer.gstNumber}` : " | GSTIN: 09SWSTK1234M1ZX"}
                            </div>
                            <div style={{ fontSize: '0.70rem', color: '#6366F1', marginTop: '3px', fontWeight: '600' }}>
                                Facilitated via Swastik Medicare Digital Health Intermediary Platform
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.88rem' }}>INVOICE NO: <strong>{invoiceNo}</strong></div>
                            <div style={{ fontSize: '0.85rem' }}>DATE: <strong>{dateStr}</strong></div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                                Fulfillment: {order.status?.replace(/_/g, ' ') || 'Processing'}
                            </div>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px dashed #94A3B8', borderBottom: '1px dashed #94A3B8', padding: '6px 0', marginBottom: '8px', fontSize: '0.85rem' }}>
                        <div>TO: <strong>{customerName}</strong>
                            {customerPhone && <span style={{ marginLeft: '12px', color: '#64748B' }}>Ph: {customerPhone}</span>}
                        </div>
                        {customerAddr && <div style={{ color: '#475569', fontSize: '0.82rem' }}>{customerAddr}</div>}
                    </div>

                    {/* ══ ITEMS TABLE ══ */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', ...border, marginBottom: '0' }}>
                            <thead>
                                <tr>
                                    <th style={{ ...hCell, borderLeft: 'none' }}>#</th>
                                    <th style={{ ...hCell, textAlign: 'left', minWidth: '160px' }}>PRODUCT</th>
                                    <th style={hCell}>PACK</th>
                                    <th style={hCell}>QTY</th>
                                    <th style={hCell}>RATE</th>
                                    <th style={hCell}>GST%</th>
                                    <th style={hCell}>DISC%</th>
                                    <th style={hCell}>AMT</th>
                                    <th style={hCell}>M.R.P.</th>
                                    <th style={hCell}>BATCH NO</th>
                                    <th style={{ ...hCell, borderRight: 'none' }}>EXP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lines.map((l, i) => (
                                    <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#F8FAFC' }}>
                                        <td style={{ ...cellC }}>{i + 1}</td>
                                        <td style={{ ...cell, fontWeight: '600', color: '#1E293B', fontSize: '0.8rem' }}>
                                            {l.name}
                                            {l.name && order.items[i]?.product?.requiresPrescription &&
                                                <span style={{ color: '#DC2626', fontSize: '0.7rem', marginLeft: '4px' }}>[Rx]</span>
                                            }
                                        </td>
                                        <td style={{ ...cellC, fontSize: '0.78rem', color: '#64748B' }}>{l.pack}</td>
                                        <td style={{ ...cellC, fontWeight: '700' }}>{l.qty}</td>
                                        <td style={{ ...cellR }}>₹{l.rate.toFixed(2)}</td>
                                        <td style={{ ...cellC, color: '#7C3AED', fontWeight: '700' }}>{l.gstRate.toFixed(2)}</td>
                                        <td style={{ ...cellC, color: l.discPct > 0 ? '#16A34A' : '#94A3B8' }}>
                                            {l.discPct > 0 ? l.discPct.toFixed(1) : '0.00'}
                                        </td>
                                        <td style={{ ...cellR, fontWeight: '700' }}>₹{l.amt.toFixed(2)}</td>
                                        <td style={{ ...cellR, color: '#64748B' }}>₹{l.mrp.toFixed(2)}</td>
                                        <td style={{ ...cellC, fontSize: '0.75rem', color: '#64748B' }}>{l.batch}</td>
                                        <td style={{ ...cellC, fontSize: '0.75rem', color: '#64748B', borderRight: 'none' }}>{l.exp}</td>
                                    </tr>
                                ))}
                                {/* ── DELIVERY CHARGE ROW (always shown) ── */}
                                <tr style={{ background: '#FFFBEB', borderTop: '1px solid #94A3B8' }}>
                                    <td style={{ ...cellC, color: '#94A3B8' }}>{lines.length + 1}</td>
                                    <td style={{ ...cell, fontWeight: '700', color: '#B45309' }}>
                                        🚚 DELIVERY CHARGE
                                        <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: '400' }}>Transport Service (HSN: 9965)</div>
                                    </td>
                                    <td style={{ ...cellC, color: '#64748B' }}>—</td>
                                    <td style={{ ...cellC, fontWeight: '700' }}>1</td>
                                    <td style={{ ...cellR }}>{deliveryCharge > 0 ? `₹${deliveryCharge.toFixed(2)}` : '₹0.00'}</td>
                                    <td style={{ ...cellC, color: '#7C3AED', fontWeight: '700' }}>{DELIVERY_GST_RATE}.00</td>
                                    <td style={{ ...cellC, color: '#94A3B8' }}>0.00</td>
                                    <td style={{ ...cellR, fontWeight: '700', color: deliveryCharge > 0 ? '#B45309' : '#16A34A' }}>
                                        {deliveryCharge > 0 ? `₹${deliveryCharge.toFixed(2)}` : '₹0.00 (FREE)'}
                                    </td>
                                    <td style={{ ...cellR, color: '#64748B' }}>—</td>
                                    <td style={{ ...cellC, color: '#64748B' }}>—</td>
                                    <td style={{ ...cellC, color: '#64748B', borderRight: 'none' }}>—</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* ══ HSN / GST LINE ══ */}
                    <div style={{
                        background: '#F5F3FF', padding: '6px 10px', fontSize: '0.78rem', color: '#6D28D9',
                        borderLeft: '2px solid #475569', borderRight: '2px solid #475569', borderBottom: '1px solid #CBD5E1',
                        ...mono
                    }}>
                        {Object.values(hsnGroups).map((g, i) => (
                            <span key={i}>
                                HSN:{g.hsn} GST@{g.rate}% &gt; Taxable:{g.taxable.toFixed(2)} +CGST:{g.cgst.toFixed(2)} +SGST:{g.sgst.toFixed(2)}
                                {i < Object.values(hsnGroups).length - 1 ? ' | ' : ''}
                            </span>
                        ))}
                        <span> | HSN:9965 GST@{DELIVERY_GST_RATE}% &gt; Del:{dGst.taxable.toFixed(2)} +CGST:{dGst.cgst.toFixed(2)} +SGST:{dGst.sgst.toFixed(2)}{deliveryCharge === 0 ? ' (FREE)' : ''}</span>
                    </div>

                    {/* ══ FOOTER TOTALS — exact pharmacy format ══ */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', ...border, borderTop: '2px solid #475569' }}>
                        <tbody>
                            <tr style={{ background: '#F1F5F9' }}>
                                <td style={{ ...cell, fontWeight: '800', width: '14%' }}>
                                    SUB TOTAL:
                                    <div style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.95rem' }}>₹{subTotal.toFixed(2)}</div>
                                </td>
                                <td style={{ ...cell, width: '12%' }}>
                                    DISCOUNT:
                                    <div style={{ fontWeight: '700', color: '#16A34A' }}>0.00</div>
                                </td>
                                <td style={{ ...cell, width: '14%' }}>
                                    H.C. (Delivery):
                                    <div style={{ fontWeight: '700', color: deliveryCharge > 0 ? '#B45309' : '#16A34A' }}>
                                        {deliveryCharge > 0 ? `₹${deliveryCharge.toFixed(2)}` : '₹0.00 (FREE)'}
                                    </div>
                                    <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>GST@{DELIVERY_GST_RATE}%: ₹{(dGst.cgst + dGst.sgst).toFixed(2)}</div>
                                    <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>CGST: ₹{dGst.cgst.toFixed(2)}</div>
                                    <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>SGST: ₹{dGst.sgst.toFixed(2)}</div>
                                </td>
                                <td style={{ ...cell, width: '14%' }}>
                                    GST:
                                    <div style={{ fontWeight: '800', color: '#7C3AED', fontSize: '0.95rem' }}>₹{totalGst.toFixed(2)}</div>
                                    <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>CGST: ₹{totalCgst.toFixed(2)}</div>
                                    <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>SGST: ₹{totalSgst.toFixed(2)}</div>
                                </td>
                                <td style={{ ...cell, width: '12%' }}>
                                    CR./DR.NOTE:
                                    <div style={{ fontWeight: '700' }}>0.00</div>
                                </td>
                                <td style={{ ...cell, width: '16%' }}>
                                    NET TOTAL:
                                    <div style={{ fontWeight: '800', color: '#1E293B', fontSize: '1rem' }}>₹{netTotal.toFixed(2)}</div>
                                </td>
                                <td style={{ ...cell, borderRight: 'none', width: '18%' }}>
                                    <div>PARTY TOTAL:</div>
                                    <div style={{ fontWeight: '900', color: '#1D4ED8', fontSize: '1.2rem' }}>₹{netTotal.toFixed(2)}</div>
                                    <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>ITEMS: {itemCount}</div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* ══ DELIVERY CODE (COD orders) ══ */}
                    {order.deliveryCode && !order.isDelivered && (
                        <div style={{
                            border: '2px dashed #F97316', padding: '10px 16px', marginTop: '12px',
                            display: 'flex', alignItems: 'center', gap: '14px', borderRadius: '4px', background: '#FFF7ED'
                        }}>
                            <span style={{ fontSize: '1.4rem' }}>🔐</span>
                            <div>
                                <div style={{ fontWeight: '700', fontSize: '0.82rem', color: '#9A3412' }}>DELIVERY CODE:</div>
                                <div style={{ fontWeight: '900', fontSize: '1.4rem', letterSpacing: '8px', color: '#C2410C', ...mono }}>
                                    {order.deliveryCode}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══ PAYMENT STATUS ══ */}
                    <div style={{
                        marginTop: '10px', padding: '6px 10px', fontSize: '0.82rem',
                        background: order.isPaid ? '#DCFCE7' : '#FEF3C7',
                        color: order.isPaid ? '#15803D' : '#92400E',
                        border: `1px solid ${order.isPaid ? '#86EFAC' : '#FCD34D'}`,
                        borderRadius: '4px', fontWeight: '700', ...mono
                    }}>
                        Payment: {order.isPaid ? '✅ PAID' : '⏳ PENDING'} | Method: {order.paymentMethod}
                        {order.isPaid && ` | Date: ${dateStr}`}
                    </div>

                    {/* ══ FOOTER & STATUTORY INTERMEDIARY DISCLAIMER ══ */}
                    <div style={{
                        marginTop: '14px', borderTop: '1px dashed #94A3B8', paddingTop: '8px',
                        fontSize: '0.70rem', color: '#64748B', ...mono, lineHeight: '1.6'
                    }}>
                        <strong>Statutory Marketplace Disclosure:</strong> Swastik Medicare is a technology platform / digital health intermediary. All pharmaceutical products listed on this invoice are sold, dispensed, packaged, and billed directly by the independent licensed retail pharmacy partner identified above pursuant to Form 20/21 Drugs and Cosmetics Rules. Swastik Medicare provides search, technology matching, payment routing, and logistics coordination. | Returns within 24 hrs for unsealed/damaged items only. | Computer-generated invoice.
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '4px', ...mono }}>
                            Facilitated by <strong style={{ color: '#1D4ED8' }}>SWASTIK MEDICARE TECHNOLOGY PLATFORM</strong>
                        </div>
                        <div style={{ fontSize: '0.70rem', color: '#94A3B8', marginBottom: '12px', ...mono }}>
                            Support: +91 79921 22974 | support@swastikmed.online | www.swastikmed.online
                        </div>
                        <InvoicePrintButton />
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        return (
            <div style={{ padding: '40px', background: '#fee2e2', color: '#991b1b', margin: '20px', borderRadius: '8px', fontFamily: 'monospace' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>Server Rendering Error</h2>
                <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>{error.message}</p>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>{error.stack}</pre>
            </div>
        );
    }
}
