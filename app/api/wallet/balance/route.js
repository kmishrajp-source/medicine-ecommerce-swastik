import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { walletBalance: true }
    });

    return Response.json({
      balance: user ? user.walletBalance : 0,
      currency: 'INR'
    });
  } catch (error) {
    console.error('Wallet Error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

