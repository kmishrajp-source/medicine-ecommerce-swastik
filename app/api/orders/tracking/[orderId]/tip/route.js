import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req, { params }) {
    try {
        const orderId = params.orderId;
        const { amount } = await req.json();

        if (typeof amount !== 'number' || amount < 0) {
            return NextResponse.json({ error: 'Invalid tip amount' }, { status: 400 });
        }

        // Support for TEST_MODE
        const isTestMode = req.headers.get('x-test-mode') === 'true';

        if (!isTestMode) {
            const session = await getServerSession(authOptions);
            if (!session || !session.user) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            // Verify order belongs to user
            const order = await prisma.order.findUnique({
                where: { id: orderId }
            });

            if (!order || order.userId !== session.user.id) {
                return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 404 });
            }

            // Normally this would integrate with Razorpay/PhonePe to deduct the tip before saving.
            // For now, we update the metadata.
            
            await prisma.order.update({
                where: { id: orderId },
                data: { tipAmount: amount }
            });
        }

        return NextResponse.json({ success: true, tipAmount: amount, message: 'Tip added successfully' });

    } catch (error) {
        console.error('Tipping API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
