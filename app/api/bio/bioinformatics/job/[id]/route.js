import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * BioInformatics Pipeline - Job Status API
 * GET /api/bio/bioinformatics/job/[id]
 * 
 * Simulates a bioinformatics pipeline processing time.
 */

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: jobId } = params;

    let job = await prisma.bioinformaticsJob.findUnique({
      where: { id: jobId },
      include: { dataset: true }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // SIMULATION: Calculate progress based on time elapsed
    // We'll simulate a 15-second pipeline for demonstration purposes.
    const timeElapsedMs = Date.now() - new Date(job.createdAt).getTime();
    const totalDurationMs = 15000; 

    if (job.progress < 100) {
      let newProgress = Math.min(100, Math.floor((timeElapsedMs / totalDurationMs) * 100));
      let newStage = 'INITIALIZING';

      if (newProgress >= 100) newStage = 'COMPLETED';
      else if (newProgress > 75) newStage = 'ANNOTATING';
      else if (newProgress > 40) newStage = 'VARIANT_CALLING';
      else if (newProgress > 10) newStage = 'ALIGNING';

      if (newProgress > job.progress || newStage !== job.pipelineStage) {
        job = await prisma.bioinformaticsJob.update({
          where: { id: jobId },
          data: { progress: newProgress, pipelineStage: newStage }
        });

        if (newProgress === 100 && job.dataset.status !== 'PROCESSED') {
           await prisma.genomicDataset.update({
             where: { id: job.datasetId },
             data: { 
               status: 'PROCESSED',
               aiSummary: 'Successfully ingested into Swastik Computational Biology Engine. Zero high-risk variants.'
             }
           });
        }
      }
    }

    return NextResponse.json({
      success: true,
      jobId: job.id,
      progress: job.progress,
      stage: job.pipelineStage,
      status: job.progress === 100 ? 'PROCESSED' : 'PROCESSING'
    });

  } catch (error) {
    console.error('Job Status Error:', error);
    return NextResponse.json({ error: 'Failed to fetch job status' }, { status: 500 });
  }
}
