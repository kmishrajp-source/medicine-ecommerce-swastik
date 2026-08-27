import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { MasterOrchestrator } from '@/lib/agents/MasterOrchestrator';
import { LogisticsAgent } from '@/lib/agents/LogisticsAgent';

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

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
        }

        const now = new Date();
        const sixtySecondsAgo = new Date(now.getTime() - 60 * 1000);

        // All delivery agents with their active orders
        const agents = await prisma.deliveryAgent.findMany({
            include: {
                user: { select: { id: true, name: true, email: true } },
                deliveries: {
                    where: {
                        status: { in: ['Out_for_Delivery', 'Packed', 'Ready_for_Packing'] }
                    },
                    select: {
                        id: true, status: true, total: true, address: true,
                        lat: true, lng: true, assignedAt: true, paymentMethod: true
                    }
                },
                alerts: {
                    where: { isResolved: false },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        // All unresolved alerts ordered by newest
        const unresolved = await prisma.deliveryAlert.findMany({
            where: { isResolved: false },
            include: {
                agent: {
                    include: { user: { select: { name: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Enrich agents
        const enrichedAgents = agents.map(agent => {
            const isLive = agent.lastPingAt
                ? new Date(agent.lastPingAt) > sixtySecondsAgo
                : false;

            const activeOrder = agent.deliveries?.[0] || null;

            let etaMinutes = null;
            let distanceKm = null;

            if (isLive && activeOrder?.lat && activeOrder?.lng && agent.lat && agent.lng) {
                distanceKm = parseFloat(haversine(agent.lat, agent.lng, activeOrder.lat, activeOrder.lng).toFixed(2));
                etaMinutes = Math.round((distanceKm / 20) * 60);
            }

            return {
                id: agent.id,
                userId: agent.userId,
                name: agent.user?.name || 'Rider',
                email: agent.user?.email,
                phone: agent.phone,
                vehicleNumber: agent.vehicleNumber,
                lat: agent.lat,
                lng: agent.lng,
                heading: agent.heading || 0,
                speed: agent.speed || 0,
                batteryLevel: agent.batteryLevel,
                isLive,
                isOnline: agent.isOnline,
                lastPingAt: agent.lastPingAt,
                activeOrders: agent.deliveries,
                activeOrder,
                distanceKm,
                etaMinutes,
                alertCount: agent.alerts.length,
                hasActiveAlerts: agent.alerts.length > 0
            };
        });

        // Summary stats
        const totalActive = enrichedAgents.filter(a => a.isLive).length;
        const offlineCount = enrichedAgents.filter(a => !a.isLive && a.activeOrder).length;

        return NextResponse.json({
            success: true,
            summary: {
                totalAgents: enrichedAgents.length,
                liveNow: totalActive,
                offlineDuringDelivery: offlineCount,
                unresolvedAlerts: unresolved.length
            },
            agents: enrichedAgents,
            alerts: unresolved
        });

    } catch (error) {
        console.error('Delivery Monitor GET Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PATCH to resolve an alert
export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
        }

        const { alertId } = await req.json();
        if (!alertId) return NextResponse.json({ error: 'alertId required' }, { status: 400 });

        const alert = await prisma.deliveryAlert.update({
            where: { id: alertId },
            data: {
                isResolved: true,
                resolvedAt: new Date(),
                resolvedBy: session.user.id
            }
        });

        return NextResponse.json({ success: true, alert });

    } catch (error) {
        console.error('Delivery Monitor PATCH Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST for webhook (e.g. tracking systems reporting a delay)
export async function POST(req) {
    try {
        const body = await req.json();
        const { event, data } = body;

        // Example webhook payload: { event: "delivery_delayed", data: { orderId: "123", riderId: "abc", delayMinutes: 45 } }
        if (event === "delivery_delayed") {
            // AGENTIC SYSTEM: Route delay event to Master Orchestrator / Logistics Agent
            console.log(`[DELIVERY WEBHOOK] Received delay event for order ${data.orderId}`);
            
            // Log to Master Orchestrator for tracking
            await MasterOrchestrator.execute(
                `Order ${data.orderId} delayed by ${data.delayMinutes} mins. Rider: ${data.riderId}`,
                "SYSTEM_EVENT",
                data
            );

            // Execute specific agent logic
            const result = await LogisticsAgent.processDelayTrigger(data);
            
            return NextResponse.json({ success: true, result });
        }

        return NextResponse.json({ success: true, message: "Event ignored" });
    } catch (error) {
        console.error('Delivery Monitor Webhook Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
