import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import InvoicePrintButton from "@/components/InvoicePrintButton";

export default async function InvoicePage({ params }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');

    const { id } = await params;

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            items: { include: { product: true } },
            user: true
        }
    });

    if (!order) return <div style={{ padding: '40px' }}>Order not found</div>;

    if (order.userId !== session.user.id && session.user.role !== 'ADMIN') {
        return <div style={{ padding: '40px' }}>Unauthorized</div>;
    }

    // ── Compute totals ────────────────────────────────────────────────────────
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryCharge = order.deliveryFee || 0;
    const grandTotal = order.total; // stored total includes delivery

    // Short invoice number
    const invoiceNo = `SM${order.id.slice(-6).toUpperCase()}`;
    const orderDate = new Date(order.createdAt);

    // Customer info
    const customerName = order.guestName || order.user?.name || 'Valued Customer';
    const customerEmail = order.guestEmail || order.user?.email || '';
    const customerPhone = order.guestPhone || order.user?.phone || '';
    const customerAddress = order.address || '';

    return (
        <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '30px 20px', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
            <div id="invoice-print-area" style={{
                background: 'white', maxWidth: '800px', margin: '0 auto',
                borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                overflow: 'hidden'
            }}>

                {/* ── Header Band ── */}
                <div style={{
                    background: 'linear-gradient(135deg, #0D8ABC 0%, #0A6B94 100%)',
                    padding: '30px 40px', color: 'white',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                }}>
                    <div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-0.5px' }}>
                            🏥 Swastik Medicare
                        </div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.85, marginTop: '4px' }}>
                            Civil Lines, Gorakhpur, Uttar Pradesh – 273001
                        </div>
                        <div style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: '2px' }}>
                            Phone: +91 79921 22974 &nbsp;|&nbsp; GSTIN: 09ABCDE1234F1Z5
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '1px' }}>TAX INVOICE</div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '6px' }}>
                            Invoice No: <strong>{invoiceNo}</strong>
                        </div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '2px' }}>
                            Date: {orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                            Time: {orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>

                <div style={{ padding: '32px 40px' }}>

                    {/* ── Status Badge ── */}
                    <div style={{ marginBottom: '24px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{
                            background: order.isPaid ? '#DCFCE7' : '#FEF9C3',
                            color: order.isPaid ? '#15803D' : '#854D0E',
                            padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700'
                        }}>
                            {order.isPaid ? '✅ PAID' : '⏳ PAYMENT PENDING'}
                        </span>
                        <span style={{
                            background: '#EDE9FE', color: '#6D28D9',
                            padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700'
                        }}>
                            {order.paymentMethod}
                        </span>
                        <span style={{
                            background: '#F0F9FF', color: '#0369A1',
                            padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700'
                        }}>
                            Status: {order.status}
                        </span>
                    </div>

                    {/* ── Bill To / Ship To ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
                        <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '18px' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                                Bill To
                            </div>
                            <div style={{ fontWeight: '700', fontSize: '1rem', color: '#1E293B' }}>{customerName}</div>
                            {customerPhone && <div style={{ fontSize: '0.88rem', color: '#475569', marginTop: '3px' }}>📞 {customerPhone}</div>}
                            {customerEmail && <div style={{ fontSize: '0.88rem', color: '#475569', marginTop: '2px' }}>✉️ {customerEmail}</div>}
                        </div>
                        <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '18px' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                                Delivery Address
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                📍 {customerAddress || 'Address not provided'}
                            </div>
                        </div>
                    </div>

                    {/* ── Items Table ── */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ background: '#1E293B', color: 'white' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', borderRadius: '8px 0 0 0' }}>#</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Medicine / Item</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Category</th>
                                <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '600' }}>MRP</th>
                                <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '600' }}>Rate</th>
                                <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '600' }}>Qty</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', borderRadius: '0 8px 0 0' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, idx) => {
                                const mrp = item.product?.mrp || item.price;
                                const discountPct = mrp > item.price ? Math.round(((mrp - item.price) / mrp) * 100) : 0;
                                return (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9', background: idx % 2 === 0 ? 'white' : '#FAFAFA' }}>
                                        <td style={{ padding: '12px 16px', color: '#94A3B8', fontWeight: '600' }}>{idx + 1}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ fontWeight: '600', color: '#1E293B' }}>{item.product?.name || 'Medicine'}</div>
                                            {item.product?.batchNumber && (
                                                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                                                    Batch: {item.product.batchNumber}
                                                    {item.product?.expiryDate ? ` | Exp: ${new Date(item.product.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}` : ''}
                                                </div>
                                            )}
                                            {item.product?.requiresPrescription && (
                                                <span style={{ fontSize: '0.7rem', background: '#FEE2E2', color: '#B91C1C', padding: '1px 6px', borderRadius: '4px' }}>Rx</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px 8px', fontSize: '0.82rem', color: '#64748B' }}>{item.product?.category || '—'}</td>
                                        <td style={{ padding: '12px 8px', textAlign: 'right', color: '#94A3B8', textDecoration: 'line-through', fontSize: '0.85rem' }}>
                                            ₹{mrp.toFixed(2)}
                                        </td>
                                        <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '600', color: '#16A34A' }}>
                                            ₹{item.price.toFixed(2)}
                                            {discountPct > 0 && (
                                                <div style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: '700' }}>{discountPct}% OFF</div>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '700' }}>{item.quantity}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: '#1E293B' }}>
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* ── Totals Section ── */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                        <div style={{ minWidth: '300px', background: '#F8FAFC', borderRadius: '0 0 10px 10px', padding: '16px 20px' }}>

                            {/* Subtotal */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #E2E8F0' }}>
                                <span style={{ color: '#64748B' }}>Subtotal ({order.items.length} items)</span>
                                <span style={{ fontWeight: '600' }}>₹{subtotal.toFixed(2)}</span>
                            </div>

                            {/* Discount */}
                            {subtotal > grandTotal - deliveryCharge && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #E2E8F0', color: '#16A34A' }}>
                                    <span>Discount Applied</span>
                                    <span>− ₹{(subtotal - (grandTotal - deliveryCharge)).toFixed(2)}</span>
                                </div>
                            )}

                            {/* Delivery Charge — KEY LINE */}
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                                borderBottom: '1px solid #E2E8F0',
                                color: deliveryCharge === 0 ? '#16A34A' : '#B45309',
                                fontWeight: '600'
                            }}>
                                <span>
                                    🚚 Delivery Charge
                                    <span style={{ fontSize: '0.72em', fontWeight: '400', color: '#94A3B8', marginLeft: '6px' }}>
                                        {deliveryCharge === 0 ? '(Free Delivery)' : '(Distance-based)'}
                                    </span>
                                </span>
                                <span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge.toFixed(2)}`}</span>
                            </div>

                            {/* Grand Total */}
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', padding: '12px 0',
                                fontWeight: '800', fontSize: '1.2rem', color: '#1E293B',
                                borderTop: '2px solid #1E293B', marginTop: '4px'
                            }}>
                                <span>TOTAL PAYABLE</span>
                                <span style={{ color: '#0D8ABC' }}>₹{grandTotal.toFixed(2)}</span>
                            </div>

                            {/* Payment method note */}
                            <div style={{ fontSize: '0.78rem', color: '#94A3B8', textAlign: 'right', marginTop: '4px' }}>
                                {order.isPaid ? `✅ Paid via ${order.paymentMethod}` : `⏳ To be paid via ${order.paymentMethod} on delivery`}
                            </div>
                        </div>
                    </div>

                    {/* ── Delivery Code (for COD) ── */}
                    {order.deliveryCode && !order.isDelivered && (
                        <div style={{
                            background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '10px',
                            padding: '14px 20px', marginTop: '24px', display: 'flex', alignItems: 'center', gap: '16px'
                        }}>
                            <div style={{ fontSize: '2rem' }}>🔐</div>
                            <div>
                                <div style={{ fontWeight: '700', color: '#9A3412', fontSize: '0.9rem' }}>Secret Delivery Code</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '6px', color: '#C2410C' }}>
                                    {order.deliveryCode}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#92400E' }}>Share this code ONLY with the delivery person to confirm receipt</div>
                            </div>
                        </div>
                    )}

                    {/* ── Terms ── */}
                    <div style={{ marginTop: '28px', padding: '16px', background: '#F8FAFC', borderRadius: '8px', fontSize: '0.78rem', color: '#94A3B8', lineHeight: '1.6' }}>
                        <strong style={{ color: '#64748B' }}>Terms & Conditions:</strong><br />
                        • All medicines are sold subject to valid prescription where required. &nbsp;
                        • Returns accepted within 24 hours if medicines are unopened and not near-expiry. &nbsp;
                        • Prices include applicable taxes. &nbsp;
                        • Delivery charge is calculated based on distance from Civil Lines, Gorakhpur (DM Office as base).
                        Free delivery on orders ≥ ₹500 within 6 km.
                    </div>

                    {/* ── Footer ── */}
                    <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '8px' }}>
                            Thank you for choosing <strong style={{ color: '#0D8ABC' }}>Swastik Medicare</strong>! 🙏
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '16px' }}>
                            For queries: +91 79921 22974 &nbsp;|&nbsp; Civil Lines, Gorakhpur
                        </div>
                        <InvoicePrintButton />
                    </div>
                </div>
            </div>
        </div>
    );
}
