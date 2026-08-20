import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
    try {
        const isTestMode = req.headers.get('x-test-mode') === 'true';
        if (!isTestMode) {
            return NextResponse.json({ error: 'TEST_MODE only' }, { status: 403 });
        }

        const { action, orderId, lat, lng } = await req.json();

        if (action === 'assign') {
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: 'Out_for_Delivery',
                    assignedAt: new Date(),
                    deliveryAgentId: 'test-agent-123',
                    deliveryCode: '123456' // test OTP
                }
            });
            // Ensure test agent exists
            const existingAgent = await prisma.deliveryAgent.findUnique({ where: { id: 'test-agent-123' } });
            if (!existingAgent) {
                // We need a dummy user for the agent
                let testUser = await prisma.user.findUnique({ where: { email: 'testrider@example.com' }});
                if (!testUser) {
                    testUser = await prisma.user.create({
                        data: {
                            email: 'testrider@example.com',
                            password: 'dummy',
                            name: 'Test Rider',
                            role: 'RIDER'
                        }
                    });
                }
                await prisma.deliveryAgent.create({
                    data: {
                        id: 'test-agent-123',
                        userId: testUser.id,
                        name: 'Test Rider',
                        licenseNumber: 'TEST-123',
                        vehicleNumber: 'UP32 AB 1234',
                        phone: '9999999999',
                        isOnline: true,
                        isAvailable: true,
                        lat: lat || 26.76,
                        lng: lng || 83.37
                    }
                });
            }
        } else if (action === 'deliver') {
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: 'Delivered',
                    isDelivered: true,
                    deliveredAt: new Date()
                }
            });
        }

        return NextResponse.json({ success: true, action, orderId });

    } catch (error) {
        console.error('Simulate Tracking API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
