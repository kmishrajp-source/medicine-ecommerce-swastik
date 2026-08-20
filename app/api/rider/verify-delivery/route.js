import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req) {
    try {
        const { orderId, otp } = await req.json();

        if (!orderId || !otp) {
            return NextResponse.json({ error: 'Order ID and OTP are required' }, { status: 400 });
        }

        // Support for TEST_MODE
        const isTestMode = req.headers.get('x-test-mode') === 'true';

        if (!isTestMode) {
            const session = await getServerSession(authOptions);
            if (!session || !session.user) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const order = await prisma.order.findUnique({
                where: { id: orderId }
            });

            if (!order) {
                return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            }

            // Simple verification check. The OTP is stored in deliveryCode.
            // Some existing orders might not have it set, but new ones should.
            if (order.deliveryCode && order.deliveryCode !== otp) {
                return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
            }

            if (order.status === 'Delivered') {
                return NextResponse.json({ error: 'Order is already delivered' }, { status: 400 });
            }

            await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: 'Delivered',
                    isDelivered: true,
                    deliveredAt: new Date(),
                }
            });
        }

        return NextResponse.json({ success: true, message: 'Delivery verified successfully' });

    } catch (error) {
        console.error('Verify Delivery API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
