import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * BioInformatics Pipeline - Get Datasets API
 * GET /api/bio/bioinformatics/datasets
 * 
 * Retrieves all uploaded datasets for the logged-in user.
 */

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const datasets = await prisma.genomicDataset.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: { job: true }
    });

    return NextResponse.json({
      success: true,
      datasets: datasets.map(d => ({
        id: d.id,
        fileName: d.fileName,
        type: d.fileType,
        fileSize: d.fileSize,
        uploadedAt: d.createdAt.toISOString().split('T')[0],
        status: d.status,
        aiSummary: d.aiSummary,
        jobId: d.job?.id,
        progress: d.job?.progress || 0,
        pipelineStage: d.job?.pipelineStage || 'UNKNOWN'
      }))
    });

  } catch (error) {
    console.error('Fetch Datasets Error:', error);
    return NextResponse.json({ error: 'Failed to fetch datasets' }, { status: 500 });
  }
}
