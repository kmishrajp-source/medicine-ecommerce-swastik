import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * BioInformatics Pipeline - Upload & Processing API
 * POST /api/bio/bioinformatics/upload
 * 
 * Handles uploading genomic/lab datasets and simulating the pipeline.
 */

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Determine file type
    const fileName = file.name;
    let fileType = 'UNKNOWN';
    if (fileName.endsWith('.vcf') || fileName.endsWith('.vcf.gz')) fileType = 'GENOMIC_VCF';
    else if (fileName.endsWith('.fastq') || fileName.endsWith('.fastq.gz')) fileType = 'RAW_FASTQ';
    else if (fileName.endsWith('.bam')) fileType = 'ALIGNMENT_BAM';
    else if (fileName.endsWith('.pdf')) fileType = 'LAB_REPORT';

    const fileSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    // 1. Create the dataset record
    const dataset = await prisma.genomicDataset.create({
      data: {
        userId: session.user.id,
        fileName,
        fileSize,
        fileType,
        status: 'QUEUED'
      }
    });

    // 2. Create the associated Bioinformatics Job
    const job = await prisma.bioinformaticsJob.create({
      data: {
        datasetId: dataset.id,
        pipelineStage: 'INITIALIZING',
        progress: 0
      }
    });

    // Note: In a real app, this would dispatch a message to a worker queue (e.g. AWS SQS, Celery, etc.)
    // For this simulation, we return the job ID and the client polls for updates. The simulation
    // will be handled by the GET endpoint which will fake progress over time based on createdAt.

    return NextResponse.json({
      success: true,
      message: 'File successfully uploaded and pipeline queued',
      datasetId: dataset.id,
      jobId: job.id
    });

  } catch (error) {
    console.error('Bioinformatics Upload Error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
