import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import InvoicePrintButton from "@/components/InvoicePrintButton";

export default async function InvoicePage({ params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect('/login');
    }

    const { id } = await params; // Await params in newer Next.js

    const order = await prisma.order.findUnique({
        where: { id: id },
        include: {
            items: { include: { product: true } }, // Include relationships
            user: true
        }
    });

    if (!order) {
        return <div>Order not found</div>;
    }

    // Security: Only allow owner or admin
    if (order.userId !== session.user.id && session.user.role !== 'ADMIN') {
        return <div>Unauthorized</div>;
    }

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', borderBottom: '2px solid #333', paddingBottom: '20px' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#0D8ABC' }}>INVOICE</h1>
                    <p style={{ margin: '5px 0' }}><strong>Swastik Medicare</strong></p>
                    <p style={{ margin: '2px 0', fontSize: '0.9rem' }}>123 Health Street, Medicity</p>
                    <p style={{ margin: '2px 0', fontSize: '0.9rem' }}>GSTIN: 09ABCDE1234F1Z5</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '5px 0' }}><strong>Invoice #:</strong> {order.id.slice(-6).toUpperCase()}</p>
                    <p style={{ margin: '5px 0' }}><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                    <p style={{ margin: '5px 0' }}><strong>Status:</strong> {order.status}</p>
                </div>
            </div>

            {/* Bill To */}
            <div style={{ marginBottom: '40px' }}>
                <h3>Bill To:</h3>
                <p style={{ margin: '2px 0' }}><strong>{order.guestName || order.user?.name || 'Customer'}</strong></p>
                <p style={{ margin: '2px 0' }}>{order.guestEmail || order.user?.email}</p>
                <p style={{ margin: '2px 0' }}>{order.guestPhone || order.user?.phone}</p>
                <p style={{ margin: '2px 0', whiteSpace: 'pre-wrap' }}>{order.address}</p>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                <thead>
                    <tr style={{ background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Item</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Qty</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Price</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '12px' }}>{item.product?.name || 'Product'}</td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>{item.quantity}</td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>₹{item.price.toFixed(2)}</td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>₹{(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ minWidth: '250px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                        <span>Subtotal:</span>
                        <span>₹{order.total.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                        <span>Tax (included):</span>
                        <span>₹{(order.total * 0.18).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid #333', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        <span>Total:</span>
                        <span>₹{order.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '50px', borderTop: '1px solid #ddd', paddingTop: '20px', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
                <p>Thank you for your business!</p>
                <InvoicePrintButton />
            </div>
        </div>
    );
}
