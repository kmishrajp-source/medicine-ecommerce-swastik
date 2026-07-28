import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import InvoicePrintButton from "@/components/InvoicePrintButton";

// ── GST Helpers ────────────────────────────────────────────────────────────────
// In India, MRP is GST-inclusive. Back-calculate taxable value from selling price.
function calcGst(sellingPrice, qty, gstRate) {
    const lineTotal = sellingPrice * qty;
    const taxRate = (gstRate || 5) / 100;
    const taxableValue = parseFloat((lineTotal / (1 + taxRate)).toFixed(2));
    const totalGst = parseFloat((lineTotal - taxableValue).toFixed(2));
    const cgst = parseFloat((totalGst / 2).toFixed(2));
    const sgst = parseFloat((totalGst / 2).toFixed(2));
    return { lineTotal, taxableValue, totalGst, cgst, sgst };
}

// GST on delivery: 18% (transport service)
const DELIVERY_GST_RATE = 18;

export default async function InvoicePage({ params }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');

    const { id } = await params;

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    product: {
                        select: {
                            name: true, category: true, mrp: true,
                            requiresPrescription: true, batchNumber: true,
                            expiryDate: true, hsnCode: true, gstRate: true,
                            manufacturer: true, salt: true
                        }
                    }
                }
            },
            user: true
        }
    });

    if (!order) return <div style={{ padding: '40px' }}>Order not found</div>;
    if (order.userId !== session.user.id && session.user.role !== 'ADMIN') {
        return <div style={{ padding: '40px' }}>Unauthorized</div>;
    }

    // ── Compute GST per line item ─────────────────────────────────────────────
    const lineItems = order.items.map(item => {
        const gstRate = item.product?.gstRate ?? 5;
        const hsnCode = item.product?.hsnCode ?? '3004';
        const mrp = item.product?.mrp || item.price;
        const discountPct = mrp > item.price ? Math.round(((mrp - item.price) / mrp) * 100) : 0;
        const { lineTotal, taxableValue, totalGst, cgst, sgst } = calcGst(item.price, item.quantity, gstRate);
        return { ...item, gstRate, hsnCode, mrp, discountPct, lineTotal, taxableValue, totalGst, cgst, sgst };
    });

    // ── Delivery GST (18% on delivery charge) ────────────────────────────────
    const deliveryCharge = order.deliveryFee || 0;
    const deliveryTaxable = deliveryCharge > 0
        ? parseFloat((deliveryCharge / (1 + DELIVERY_GST_RATE / 100)).toFixed(2)) : 0;
    const deliveryGstAmt = parseFloat((deliveryCharge - deliveryTaxable).toFixed(2));
    const deliveryCgst = parseFloat((deliveryGstAmt / 2).toFixed(2));
    const deliverySgst = parseFloat((deliveryGstAmt / 2).toFixed(2));

    // ── Totals ────────────────────────────────────────────────────────────────
    const totalTaxable = parseFloat((lineItems.reduce((s, i) => s + i.taxableValue, 0) + deliveryTaxable).toFixed(2));
    const totalCgst = parseFloat((lineItems.reduce((s, i) => s + i.cgst, 0) + deliveryCgst).toFixed(2));
    const totalSgst = parseFloat((lineItems.reduce((s, i) => s + i.sgst, 0) + deliverySgst).toFixed(2));
    const totalGst = parseFloat((totalCgst + totalSgst).toFixed(2));
    const grandTotal = order.total;

    const invoiceNo = `SM${order.id.slice(-6).toUpperCase()}`;
    const orderDate = new Date(order.createdAt);
    const customerName = order.guestName || order.user?.name || 'Valued Customer';
    const customerEmail = order.guestEmail || order.user?.email || '';
    const customerPhone = order.guestPhone || order.user?.phone || '';
    const customerAddress = order.address || '';

    // ── Inline styles to avoid Tailwind dependency ────────────────────────────
    const th = {
        padding: '10px 8px', fontWeight: '600', fontSize: '0.78rem',
        color: 'white', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap'
    };
    const td = { padding: '10px 8px', fontSize: '0.85rem', verticalAlign: 'top' };
    const tdR = { ...td, textAlign: 'right' };
    const tdC = { ...td, textAlign: 'center' };

    return (
        <div style={{ background: '#EFF6FF', minHeight: '100vh', padding: '24px 12px', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
            <div id="invoice-print-area" style={{ background: 'white', maxWidth: '860px', margin: '0 auto', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', overflow: 'hidden' }}>

                {/* ── Blue Header ── */}
                <div style={{ background: 'linear-gradient(135deg,#1D4ED8,#0D8ABC)', padding: '28px 36px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ fontSize: '1.7rem', fontWeight: '900' }}>🏥 Swastik Medicare</div>
                        <div style={{ fontSize: '0.82rem', opacity: 0.85, marginTop: '4px' }}>Civil Lines, Gorakhpur, Uttar Pradesh – 273001</div>
                        <div style={{ fontSize: '0.78rem', opacity: 0.75, marginTop: '2px' }}>
                            Ph: +91 79921 22974 &nbsp;|&nbsp; GSTIN: 09SWSTK1234M1ZX &nbsp;|&nbsp; Drug Lic: UP-GKP-2024-001
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: '800', letterSpacing: '2px', background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '6px' }}>
                            TAX INVOICE
                        </div>
                        <div style={{ fontSize: '0.88rem', marginTop: '8px' }}>Invoice #: <strong>{invoiceNo}</strong></div>
                        <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>
                            {orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} &nbsp;
                            {orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ marginTop: '6px', display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <span style={{ background: order.isPaid ? '#22C55E' : '#F59E0B', padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>
                                {order.isPaid ? '✅ PAID' : '⏳ PENDING'}
                            </span>
                            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>
                                {order.paymentMethod}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '28px 36px' }}>

                    {/* ── Bill To / Ship To ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                        {[
                            { label: 'Bill To', icon: '👤', content: [customerName, customerPhone && `📞 ${customerPhone}`, customerEmail && `✉️ ${customerEmail}`] },
                            { label: 'Delivery Address', icon: '📍', content: [customerAddress || 'Not provided'] }
                        ].map(({ label, icon, content }) => (
                            <div key={label} style={{ background: '#F8FAFC', borderRadius: '10px', padding: '16px', borderLeft: '4px solid #1D4ED8' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{icon} {label}</div>
                                {content.filter(Boolean).map((line, i) => (
                                    <div key={i} style={{ fontSize: i === 0 ? '0.95rem' : '0.85rem', fontWeight: i === 0 ? '700' : '400', color: i === 0 ? '#1E293B' : '#475569', marginTop: i ? '3px' : 0 }}>{line}</div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* ── Items Table ── */}
                    <div style={{ overflowX: 'auto', marginBottom: '0' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead style={{ background: '#1E293B' }}>
                                <tr>
                                    {['#', 'Medicine / Item', 'HSN', 'Batch / Expiry', 'MRP', 'Rate', 'Qty', 'Taxable Amt', 'GST%', 'CGST', 'SGST', 'Total'].map(h => (
                                        <th key={h} style={{ ...th }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {lineItems.map((item, idx) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9', background: idx % 2 === 0 ? 'white' : '#FAFAFA' }}>
                                        <td style={{ ...tdC, color: '#94A3B8', fontWeight: '600' }}>{idx + 1}</td>
                                        <td style={{ ...td }}>
                                            <div style={{ fontWeight: '700', color: '#1E293B' }}>{item.product?.name || 'Medicine'}</div>
                                            {item.product?.manufacturer && <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{item.product.manufacturer}</div>}
                                            {item.product?.salt && <div style={{ fontSize: '0.7rem', color: '#64748B', fontStyle: 'italic' }}>{item.product.salt}</div>}
                                            {item.product?.requiresPrescription && (
                                                <span style={{ fontSize: '0.65rem', background: '#FEE2E2', color: '#B91C1C', padding: '1px 5px', borderRadius: '3px' }}>Rx</span>
                                            )}
                                        </td>
                                        <td style={{ ...tdC, color: '#64748B', fontFamily: 'monospace' }}>{item.hsnCode}</td>
                                        <td style={{ ...tdC, fontSize: '0.78rem', color: '#64748B' }}>
                                            <div>{item.product?.batchNumber || '—'}</div>
                                            <div style={{ fontSize: '0.7rem' }}>
                                                {item.product?.expiryDate
                                                    ? new Date(item.product.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
                                                    : ''}
                                            </div>
                                        </td>
                                        <td style={{ ...tdR, color: '#94A3B8', textDecoration: 'line-through' }}>₹{item.mrp.toFixed(2)}</td>
                                        <td style={{ ...tdR, fontWeight: '700', color: '#16A34A' }}>
                                            ₹{item.price.toFixed(2)}
                                            {item.discountPct > 0 && <div style={{ fontSize: '0.68rem', color: '#16A34A' }}>{item.discountPct}% off</div>}
                                        </td>
                                        <td style={{ ...tdC, fontWeight: '700' }}>{item.quantity}</td>
                                        <td style={{ ...tdR }}>₹{item.taxableValue.toFixed(2)}</td>
                                        <td style={{ ...tdC, color: '#7C3AED', fontWeight: '700' }}>{item.gstRate}%</td>
                                        <td style={{ ...tdR, color: '#7C3AED' }}>₹{item.cgst.toFixed(2)}</td>
                                        <td style={{ ...tdR, color: '#7C3AED' }}>₹{item.sgst.toFixed(2)}</td>
                                        <td style={{ ...tdR, fontWeight: '800', color: '#1E293B' }}>₹{item.lineTotal.toFixed(2)}</td>
                                    </tr>
                                ))}

                                {/* Delivery row */}
                                {deliveryCharge > 0 && (
                                    <tr style={{ borderBottom: '1px solid #F1F5F9', background: '#FFFBEB' }}>
                                        <td style={{ ...tdC, color: '#94A3B8' }}>—</td>
                                        <td style={{ ...td }}><span style={{ fontWeight: '700', color: '#B45309' }}>🚚 Delivery Charge</span><div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Transport Service</div></td>
                                        <td style={{ ...tdC, fontFamily: 'monospace', color: '#64748B' }}>9965</td>
                                        <td style={{ ...tdC }}>—</td>
                                        <td style={{ ...tdR }}>—</td>
                                        <td style={{ ...tdR }}>₹{deliveryTaxable.toFixed(2)}</td>
                                        <td style={{ ...tdC }}>1</td>
                                        <td style={{ ...tdR }}>₹{deliveryTaxable.toFixed(2)}</td>
                                        <td style={{ ...tdC, color: '#7C3AED', fontWeight: '700' }}>{DELIVERY_GST_RATE}%</td>
                                        <td style={{ ...tdR, color: '#7C3AED' }}>₹{deliveryCgst.toFixed(2)}</td>
                                        <td style={{ ...tdR, color: '#7C3AED' }}>₹{deliverySgst.toFixed(2)}</td>
                                        <td style={{ ...tdR, fontWeight: '800', color: '#B45309' }}>₹{deliveryCharge.toFixed(2)}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ── GST Summary + Grand Total ── */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', flexWrap: 'wrap', gap: '20px' }}>

                        {/* GST Summary Table */}
                        <div style={{ flex: '1', minWidth: '260px', background: '#F5F3FF', borderRadius: '10px', padding: '16px', border: '1px solid #DDD6FE' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                                📊 GST Summary (Intra-State — CGST + SGST)
                            </div>
                            <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #C4B5FD' }}>
                                        {['HSN', 'Rate', 'Taxable', 'CGST', 'SGST', 'Total GST'].map(h => (
                                            <th key={h} style={{ padding: '6px 4px', textAlign: 'right', fontWeight: '700', color: '#6D28D9', fontSize: '0.72rem' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Group by GST rate + HSN */}
                                    {Object.values(
                                        lineItems.reduce((acc, item) => {
                                            const key = `${item.hsnCode}-${item.gstRate}`;
                                            if (!acc[key]) acc[key] = { hsn: item.hsnCode, rate: item.gstRate, taxable: 0, cgst: 0, sgst: 0 };
                                            acc[key].taxable += item.taxableValue;
                                            acc[key].cgst += item.cgst;
                                            acc[key].sgst += item.sgst;
                                            return acc;
                                        }, {})
                                    ).map((row, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #EDE9FE' }}>
                                            <td style={{ padding: '5px 4px', fontFamily: 'monospace', color: '#64748B', textAlign: 'right' }}>{row.hsn}</td>
                                            <td style={{ padding: '5px 4px', color: '#7C3AED', fontWeight: '700', textAlign: 'right' }}>{row.rate}%</td>
                                            <td style={{ padding: '5px 4px', textAlign: 'right' }}>₹{row.taxable.toFixed(2)}</td>
                                            <td style={{ padding: '5px 4px', textAlign: 'right', color: '#7C3AED' }}>₹{row.cgst.toFixed(2)}</td>
                                            <td style={{ padding: '5px 4px', textAlign: 'right', color: '#7C3AED' }}>₹{row.sgst.toFixed(2)}</td>
                                            <td style={{ padding: '5px 4px', textAlign: 'right', fontWeight: '700', color: '#7C3AED' }}>₹{(row.cgst + row.sgst).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {deliveryCharge > 0 && (
                                        <tr style={{ borderBottom: '1px solid #EDE9FE' }}>
                                            <td style={{ padding: '5px 4px', fontFamily: 'monospace', color: '#64748B', textAlign: 'right' }}>9965</td>
                                            <td style={{ padding: '5px 4px', color: '#7C3AED', fontWeight: '700', textAlign: 'right' }}>{DELIVERY_GST_RATE}%</td>
                                            <td style={{ padding: '5px 4px', textAlign: 'right' }}>₹{deliveryTaxable.toFixed(2)}</td>
                                            <td style={{ padding: '5px 4px', textAlign: 'right', color: '#7C3AED' }}>₹{deliveryCgst.toFixed(2)}</td>
                                            <td style={{ padding: '5px 4px', textAlign: 'right', color: '#7C3AED' }}>₹{deliverySgst.toFixed(2)}</td>
                                            <td style={{ padding: '5px 4px', textAlign: 'right', fontWeight: '700', color: '#7C3AED' }}>₹{(deliveryCgst + deliverySgst).toFixed(2)}</td>
                                        </tr>
                                    )}
                                    <tr style={{ borderTop: '2px solid #7C3AED', background: '#F5F3FF' }}>
                                        <td colSpan={2} style={{ padding: '7px 4px', fontWeight: '800', color: '#6D28D9', textAlign: 'right' }}>TOTAL</td>
                                        <td style={{ padding: '7px 4px', textAlign: 'right', fontWeight: '700' }}>₹{totalTaxable.toFixed(2)}</td>
                                        <td style={{ padding: '7px 4px', textAlign: 'right', fontWeight: '700', color: '#7C3AED' }}>₹{totalCgst.toFixed(2)}</td>
                                        <td style={{ padding: '7px 4px', textAlign: 'right', fontWeight: '700', color: '#7C3AED' }}>₹{totalSgst.toFixed(2)}</td>
                                        <td style={{ padding: '7px 4px', textAlign: 'right', fontWeight: '800', color: '#7C3AED' }}>₹{totalGst.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Grand Total Box */}
                        <div style={{ minWidth: '260px', background: '#F8FAFC', borderRadius: '10px', padding: '16px' }}>
                            {[
                                { label: 'Taxable Amount', value: `₹${totalTaxable.toFixed(2)}`, style: {} },
                                { label: `CGST (avg ~${(totalCgst / totalTaxable * 100).toFixed(1)}%)`, value: `₹${totalCgst.toFixed(2)}`, style: { color: '#7C3AED' } },
                                { label: `SGST (avg ~${(totalSgst / totalTaxable * 100).toFixed(1)}%)`, value: `₹${totalSgst.toFixed(2)}`, style: { color: '#7C3AED' } },
                                { label: 'Total GST', value: `₹${totalGst.toFixed(2)}`, style: { color: '#7C3AED', fontWeight: '700' } },
                                { label: '🚚 Delivery Charge', value: deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge.toFixed(2)}`, style: { color: deliveryCharge === 0 ? '#16A34A' : '#B45309', fontWeight: '600' } },
                            ].map(({ label, value, style }) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #E2E8F0', fontSize: '0.88rem', ...style }}>
                                    <span style={{ color: style.color || '#475569' }}>{label}</span>
                                    <span>{value}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 4px', fontWeight: '900', fontSize: '1.25rem', borderTop: '2px solid #1E293B', marginTop: '4px' }}>
                                <span style={{ color: '#1E293B' }}>GRAND TOTAL</span>
                                <span style={{ color: '#1D4ED8' }}>₹{grandTotal.toFixed(2)}</span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#94A3B8', textAlign: 'right', marginTop: '4px' }}>
                                All prices are MRP-inclusive of taxes
                            </div>
                            <div style={{ fontSize: '0.75rem', color: order.isPaid ? '#16A34A' : '#B45309', textAlign: 'right', marginTop: '4px', fontWeight: '600' }}>
                                {order.isPaid ? `✅ Paid via ${order.paymentMethod}` : `⏳ Pay via ${order.paymentMethod} on delivery`}
                            </div>
                        </div>
                    </div>

                    {/* ── Delivery Code ── */}
                    {order.deliveryCode && !order.isDelivered && (
                        <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '10px', padding: '14px 20px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ fontSize: '2rem' }}>🔐</div>
                            <div>
                                <div style={{ fontWeight: '700', color: '#9A3412', fontSize: '0.88rem' }}>Secret Delivery Code</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: '900', letterSpacing: '8px', color: '#C2410C' }}>{order.deliveryCode}</div>
                                <div style={{ fontSize: '0.72rem', color: '#92400E' }}>Share ONLY with the delivery person to confirm receipt</div>
                            </div>
                        </div>
                    )}

                    {/* ── T&C ── */}
                    <div style={{ marginTop: '20px', padding: '14px', background: '#F8FAFC', borderRadius: '8px', fontSize: '0.75rem', color: '#94A3B8', lineHeight: '1.7' }}>
                        <strong style={{ color: '#64748B' }}>Terms & Conditions:</strong><br />
                        • All medicines sold subject to valid prescription where required by law. &nbsp;
                        • Returns accepted within 24 hours — unopened, not near-expiry only. &nbsp;
                        • Prices are MRP-inclusive of applicable GST as per Indian GST Law. &nbsp;
                        • Delivery charge inclusive of 18% GST (HSN: 9965 — Freight Transport). &nbsp;
                        • Free delivery on orders ≥ ₹500 within 6 km from Civil Lines, Gorakhpur. &nbsp;
                        • This is a computer-generated invoice; no signature required.
                    </div>

                    {/* ── Footer ── */}
                    <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '18px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '6px' }}>
                            Thank you for choosing <strong style={{ color: '#1D4ED8' }}>Swastik Medicare</strong>! 🙏
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '14px' }}>
                            +91 79921 22974 &nbsp;|&nbsp; Civil Lines, Gorakhpur &nbsp;|&nbsp; GSTIN: 09SWSTK1234M1ZX
                        </div>
                        <InvoicePrintButton />
                    </div>
                </div>
            </div>
        </div>
    );
}
