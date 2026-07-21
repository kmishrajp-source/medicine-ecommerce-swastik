import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Utility: haversine distance in km
function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// POST /api/rider/location - Rider broadcasts GPS position every 5 seconds
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { lat, lng, heading, speed, accuracy, batteryLevel, orderId } = await req.json();

        if (!lat || !lng) {
            return NextResponse.json({ error: 'lat/lng required' }, { status: 400 });
        }

        // Get DeliveryAgent record for this user
        const agent = await prisma.deliveryAgent.findUnique({
            where: { userId: session.user.id }
        });

        if (!agent) {
            return NextResponse.json({ error: 'Delivery agent profile not found' }, { status: 404 });
        }

        // Update agent's live position
        await prisma.deliveryAgent.update({
            where: { id: agent.id },
            data: {
                lat,
                lng,
                heading: heading ?? null,
                speed: speed ?? null,
                lastPingAt: new Date(),
                batteryLevel: batteryLevel ?? null,
                isOnline: true
            }
        });

        // Log breadcrumb (keep every ping for route history)
        await prisma.riderLocationLog.create({
            data: {
                agentId: agent.id,
                orderId: orderId || null,
                lat,
                lng,
                heading: heading ?? null,
                speed: speed ?? null,
                accuracy: accuracy ?? null
            }
        });

        // Check for DEVIATION alert if active order provided
        if (orderId) {
            const order = await prisma.order.findUnique({
                where: { id: orderId },
                select: { lat: true, lng: true, status: true, assignedAt: true, id: true }
            });

            if (order?.lat && order?.lng) {
                const distanceKm = haversine(lat, lng, order.lat, order.lng);

                // Deviation alert: >2km from delivery address
                if (distanceKm > 2) {
                    const existing = await prisma.deliveryAlert.findFirst({
                        where: { agentId: agent.id, orderId, type: 'DEVIATION', isResolved: false }
                    });
                    if (!existing) {
                        await prisma.deliveryAlert.create({
                            data: {
                                agentId: agent.id,
                                orderId,
                                type: 'DEVIATION',
                                message: `Rider is ${distanceKm.toFixed(1)}km from delivery address (Order #${orderId.slice(-6).toUpperCase()}). Possible route deviation.`
                            }
                        });
                    }
                }

                // Delay alert: out for delivery > 45 minutes
                if (order.status === 'Out_for_Delivery' && order.assignedAt) {
                    const minElapsed = (Date.now() - new Date(order.assignedAt).getTime()) / 60000;
                    if (minElapsed > 45) {
                        const existingDelay = await prisma.deliveryAlert.findFirst({
                            where: { agentId: agent.id, orderId, type: 'DELAY', isResolved: false }
                        });
                        if (!existingDelay) {
                            await prisma.deliveryAlert.create({
                                data: {
                                    agentId: agent.id,
                                    orderId,
                                    type: 'DELAY',
                                    message: `Delivery delayed — Order #${orderId.slice(-6).toUpperCase()} has been out for delivery for ${Math.round(minElapsed)} minutes.`
                                }
                            });
                        }
                    }
                }
            }
        }

        return NextResponse.json({ success: true, lat, lng });

    } catch (error) {
        console.error('Rider Location POST Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// GET /api/rider/location?orderId=xxx - Get rider's live position for a specific order
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const orderId = searchParams.get('orderId');
        const agentId = searchParams.get('agentId');

        if (!orderId && !agentId) {
            return NextResponse.json({ error: 'orderId or agentId required' }, { status: 400 });
        }

        if (orderId) {
            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    deliveryAgent: {
                        select: {
                            id: true, lat: true, lng: true, heading: true,
                            speed: true, lastPingAt: true, isOnline: true,
                            phone: true, vehicleNumber: true,
                            user: { select: { name: true } }
                        }
                    },
                    assignedRetailer: {
                        select: { lat: true, lng: true, shopName: true }
                    }
                }
            });

            if (!order) {
                return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            }

            const agent = order.deliveryAgent;
            const isOnline = agent?.lastPingAt
                ? (Date.now() - new Date(agent.lastPingAt).getTime()) < 60000
                : false;

            let distanceToCustomer = null;
            if (agent?.lat && agent?.lng && order.lat && order.lng) {
                distanceToCustomer = haversine(agent.lat, agent.lng, order.lat, order.lng);
            }

            // Simple ETA based on avg speed 20km/h in urban setting
            const etaMinutes = distanceToCustomer ? Math.round((distanceToCustomer / 20) * 60) : null;

            return NextResponse.json({
                success: true,
                orderId,
                orderStatus: order.status,
                riderLat: agent?.lat || null,
                riderLng: agent?.lng || null,
                riderHeading: agent?.heading || 0,
                riderSpeed: agent?.speed || 0,
                riderName: agent?.user?.name || 'Delivery Partner',
                riderPhone: agent?.phone || null,
                vehicleNumber: agent?.vehicleNumber || null,
                isOnline,
                lastPingAt: agent?.lastPingAt,
                customerLat: order.lat,
                customerLng: order.lng,
                retailerLat: order.assignedRetailer?.lat || null,
                retailerLng: order.assignedRetailer?.lng || null,
                distanceKm: distanceToCustomer ? parseFloat(distanceToCustomer.toFixed(2)) : null,
                etaMinutes
            });
        }

        // agentId query
        const agent = await prisma.deliveryAgent.findUnique({
            where: { id: agentId },
            select: {
                lat: true, lng: true, heading: true, speed: true,
                lastPingAt: true, isOnline: true, vehicleNumber: true,
                user: { select: { name: true } }
            }
        });

        if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });

        return NextResponse.json({ success: true, agent });

    } catch (error) {
        console.error('Rider Location GET Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
