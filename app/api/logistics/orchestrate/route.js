import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { searchRidersForJob } from '@/lib/rider-matching';
import { findBestExternalProvider, dispatchToExternalProvider, fallbackToRetailerDelivery } from '@/lib/delivery-providers';

/**
 * Healthcare Logistics Orchestration Engine
 * POST /api/logistics/orchestrate
 *
 * This is the SINGLE ENTRY POINT for all delivery allocation decisions.
 * It implements the Priority Cascade:
 *   1. Swastik Own Rider (fastest, cheapest)
 *   2. External 3PL Partner (e.g. Shadowfax, Porter)
 *   3. Retailer Self-Delivery (fallback)
 *   4. Customer Pickup (last resort)
 *
 * SAFE: Does NOT modify existing order flow. Works alongside existing DeliveryAgent
 * assignment system by creating/updating a DeliveryJob record.
 *
 * GET /api/logistics/orchestrate?orderId=xxx  — Get delivery status for an order
 */

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, pickupLat, pickupLng, dropLat, dropLng, pickupAddress, dropAddress, deliveryType } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { assignedRetailer: true }
    });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if a DeliveryJob already exists (idempotency)
    const existingJob = await prisma.deliveryJob.findUnique({ where: { orderId } });
    if (existingJob && !['FAILED', 'CANCELLED'].includes(existingJob.status)) {
      return NextResponse.json({
        success: true,
        message: 'Delivery job already active',
        job: {
          id: existingJob.id,
          status: existingJob.status,
          deliveryMethod: existingJob.deliveryMethod,
          trackingUrl: existingJob.externalTrackingUrl
        }
      });
    }

    // Create or reset DeliveryJob
    const job = existingJob
      ? await prisma.deliveryJob.update({
          where: { id: existingJob.id },
          data: { status: 'SEARCHING', deliveryMethod: 'SWASTIK_RIDER', failureReason: null }
        })
      : await prisma.deliveryJob.create({
          data: {
            orderId,
            pickupLat: pickupLat || order.assignedRetailer?.lat,
            pickupLng: pickupLng || order.assignedRetailer?.lng,
            dropLat,
            dropLng,
            pickupAddress: pickupAddress || order.assignedRetailer?.address,
            dropAddress: dropAddress || order.deliveryAddress,
            status: 'SEARCHING',
            deliveryMethod: 'SWASTIK_RIDER'
          }
        });

    // ── STEP 1: Try Swastik Own Riders ────────────────────────────────────
    let riderResult = null;
    try {
      riderResult = await searchRidersForJob(orderId);
    } catch (e) {
      console.warn('[LOGISTICS] Rider search failed:', e.message);
    }

    if (riderResult?.offered) {
      return NextResponse.json({
        success: true,
        method: 'SWASTIK_RIDER',
        jobId: job.id,
        status: 'SEARCHING',
        message: `Searching for available Swastik riders within ${job.searchRadiusKm}km.`,
        ridersOffered: riderResult.offerCount || 0,
        estimatedPickupMinutes: 10
      });
    }

    // ── STEP 2: Try External 3PL Partner ──────────────────────────────────
    const externalProvider = await findBestExternalProvider(
      pickupLat || order.assignedRetailer?.lat,
      pickupLng || order.assignedRetailer?.lng
    );

    if (externalProvider && externalProvider.status === 'LIVE') {
      const dispatch = await dispatchToExternalProvider(externalProvider, job);
      if (dispatch.success) {
        return NextResponse.json({
          success: true,
          method: 'EXTERNAL_PARTNER',
          provider: externalProvider.name,
          jobId: job.id,
          status: 'ACCEPTED',
          trackingUrl: dispatch.trackingUrl,
          message: `Order dispatched to ${externalProvider.name} for delivery.`,
          estimatedPickupMinutes: 15
        });
      }
    }

    // ── STEP 3: Fallback to Retailer Self-Delivery ────────────────────────
    const retailerFallback = await fallbackToRetailerDelivery(job);
    if (retailerFallback.success) {
      return NextResponse.json({
        success: true,
        method: 'RETAILER_DELIVERY',
        jobId: job.id,
        status: 'ACCEPTED',
        message: 'No riders available. Pharmacy will arrange delivery directly.',
        estimatedPickupMinutes: 30
      });
    }

    // ── STEP 4: Customer Pickup (Last Resort) ─────────────────────────────
    await prisma.deliveryJob.update({
      where: { id: job.id },
      data: { deliveryMethod: 'CUSTOMER_PICKUP', status: 'CANCELLED', failureReason: 'All delivery methods exhausted' }
    });

    return NextResponse.json({
      success: true,
      method: 'CUSTOMER_PICKUP',
      jobId: job.id,
      status: 'CUSTOMER_PICKUP',
      message: 'No delivery available. Customer will collect from pharmacy.',
      pickupAddress: pickupAddress || order.assignedRetailer?.address
    });

  } catch (error) {
    console.error('[LOGISTICS ORCHESTRATOR] Error:', error);
    return NextResponse.json({ error: 'Logistics orchestration failed. Please retry.' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'orderId required' }, { status: 400 });
    }

    const job = await prisma.deliveryJob.findUnique({
      where: { orderId },
      include: {
        acceptedRider: {
          select: { id: true, name: true, phone: true, vehicleType: true, lat: true, lng: true }
        },
        externalProvider: {
          select: { id: true, name: true, status: true }
        }
      }
    });

    if (!job) {
      return NextResponse.json({ found: false, message: 'No delivery job found for this order' });
    }

    return NextResponse.json({
      found: true,
      jobId: job.id,
      orderId: job.orderId,
      status: job.status,
      deliveryMethod: job.deliveryMethod,
      pickupAddress: job.pickupAddress,
      dropAddress: job.dropAddress,
      acceptedAt: job.acceptedAt,
      pickedUpAt: job.pickedUpAt,
      deliveredAt: job.deliveredAt,
      rider: job.acceptedRider,
      externalProvider: job.externalProvider,
      trackingUrl: job.externalTrackingUrl,
      eta: job.pickedUpAt
        ? new Date(new Date(job.pickedUpAt).getTime() + 20 * 60 * 1000).toISOString() // +20 min from pickup
        : null
    });

  } catch (error) {
    console.error('[LOGISTICS STATUS] Error:', error);
    return NextResponse.json({ error: 'Failed to get delivery status' }, { status: 500 });
  }
}
