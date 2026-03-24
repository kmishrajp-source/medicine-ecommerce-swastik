import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id }
    });

    return Response.json({
      balance: wallet ? wallet.balance / 100 : 0, // Convert paise to major currency unit
      currency: 'INR'
    });
  } catch (error) {
    console.error('Wallet Error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
