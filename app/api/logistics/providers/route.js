import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Admin: 3PL Delivery Partner Management API
 * GET  /api/logistics/providers       — List all configured providers
 * POST /api/logistics/providers       — Create/onboard a new 3PL provider
 * PATCH /api/logistics/providers      — Update provider (activate/deactivate/configure)
 *
 * SAFE: Uses existing ExternalDeliveryProvider model.
 */

async function requireAdmin(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { role: true } });
  return user?.role === 'ADMIN' ? session : null;
}

export async function GET(request) {
  try {
    const session = await requireAdmin(request);
    if (!session) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const providers = await prisma.externalDeliveryProvider.findMany({
      include: {
        _count: { select: { jobs: true } }
      },
      orderBy: { priority: 'asc' }
    });

    // Get delivery stats per provider
    const statsPerProvider = await Promise.all(
      providers.map(async (p) => {
        const [completed, failed] = await Promise.all([
          prisma.deliveryJob.count({ where: { externalProviderId: p.id, status: 'DELIVERED' } }),
          prisma.deliveryJob.count({ where: { externalProviderId: p.id, status: 'FAILED' } })
        ]);
        return { id: p.id, completed, failed };
      })
    );

    const statsMap = Object.fromEntries(statsPerProvider.map(s => [s.id, s]));

    const enriched = providers.map(p => ({
      id: p.id,
      name: p.name,
      apiUrl: p.apiUrl,
      isActive: p.isActive,
      baseFee: p.baseFee,
      perKmFee: p.perKmFee,
      serviceCities: p.serviceCities,
      priority: p.priority,
      supportedModes: p.supportedModes,
      status: p.status,
      totalJobs: p._count.jobs,
      completedJobs: statsMap[p.id]?.completed || 0,
      failedJobs: statsMap[p.id]?.failed || 0,
      successRate: p._count.jobs > 0
        ? Math.round((statsMap[p.id]?.completed / p._count.jobs) * 100) + '%'
        : 'N/A',
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      // Hide API key from response
      hasApiKey: !!p.apiKey
    }));

    // Also get Swastik own rider stats
    const [activeRiders, totalJobs] = await Promise.all([
      prisma.deliveryAgent.count({ where: { isOnline: true, status: 'active' } }),
      prisma.deliveryJob.count({ where: { deliveryMethod: 'SWASTIK_RIDER' } })
    ]);

    return NextResponse.json({
      success: true,
      swastikRiders: { active: activeRiders, totalJobs, type: 'OWNED_FLEET' },
      providers: enriched,
      total: providers.length
    });

  } catch (error) {
    console.error('[PROVIDERS GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await requireAdmin(request);
    if (!session) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const body = await request.json();
    const { name, apiUrl, apiKey, baseFee, perKmFee, serviceCities, priority, supportedModes } = body;

    if (!name) return NextResponse.json({ error: 'Provider name is required' }, { status: 400 });

    const provider = await prisma.externalDeliveryProvider.upsert({
      where: { name: name.toUpperCase() },
      update: {
        apiUrl, baseFee, perKmFee,
        serviceCities: serviceCities || ['Gorakhpur'],
        priority: priority || 2,
        supportedModes: supportedModes || ['BIKE'],
        status: 'CONFIGURED',
        ...(apiKey && { apiKey }) // Only update API key if explicitly provided
      },
      create: {
        name: name.toUpperCase(),
        apiUrl, apiKey,
        baseFee: baseFee || 40,
        perKmFee: perKmFee || 10,
        serviceCities: serviceCities || ['Gorakhpur'],
        priority: priority || 2,
        supportedModes: supportedModes || ['BIKE'],
        isActive: false, // Inactive by default — admin must activate after testing
        status: 'CONFIGURED'
      }
    });

    return NextResponse.json({
      success: true,
      provider: { id: provider.id, name: provider.name, status: provider.status },
      message: `Provider ${provider.name} configured. Set status to LIVE and activate when ready for production.`
    });

  } catch (error) {
    console.error('[PROVIDERS POST] Error:', error);
    return NextResponse.json({ error: 'Failed to configure provider' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await requireAdmin(request);
    if (!session) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const body = await request.json();
    const { id, isActive, status, priority, baseFee, perKmFee, serviceCities } = body;

    if (!id) return NextResponse.json({ error: 'Provider ID required' }, { status: 400 });

    const updated = await prisma.externalDeliveryProvider.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(status && { status }),
        ...(priority !== undefined && { priority }),
        ...(baseFee !== undefined && { baseFee }),
        ...(perKmFee !== undefined && { perKmFee }),
        ...(serviceCities && { serviceCities })
      }
    });

    return NextResponse.json({
      success: true,
      provider: { id: updated.id, name: updated.name, isActive: updated.isActive, status: updated.status },
      message: `Provider ${updated.name} updated successfully.`
    });

  } catch (error) {
    console.error('[PROVIDERS PATCH] Error:', error);
    return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 });
  }
}
