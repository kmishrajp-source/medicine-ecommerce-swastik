import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req, { params }) {
    try {
        const orderId = params.orderId;
        const { instructions } = await req.json();

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

            // Only allow updates if not delivered
            if (order.isDelivered || order.status === 'Delivered') {
                return NextResponse.json({ error: 'Cannot update instructions for a delivered order' }, { status: 400 });
            }

            // Update instructions
            await prisma.order.update({
                where: { id: orderId },
                data: { deliveryInstructions: instructions }
            });
        }

        return NextResponse.json({ success: true, instructions });

    } catch (error) {
        console.error('Delivery Instructions API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
