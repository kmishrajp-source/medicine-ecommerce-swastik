import { NextResponse } from 'next/server';
import { DigiLockerService } from '@/lib/digilocker';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/en/my-health-records/digilocker?status=error', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/en/my-health-records/digilocker?status=invalid', request.url));
  }

  try {
    const tokenResponse = await DigiLockerService.getAccessToken(code);
    
    if (tokenResponse.success) {
      // In a real integration, we would associate the token with the user's session
      // For now, redirect to the pending UI
      return NextResponse.redirect(new URL('/en/my-health-records/digilocker?status=success', request.url));
    } else {
      // Redirect to the pending view since we don't have LIVE credentials yet
      return NextResponse.redirect(new URL('/en/my-health-records/digilocker?status=pending_credentials', request.url));
    }
  } catch (err) {
    console.error("DigiLocker Callback Error:", err);
    return NextResponse.redirect(new URL('/en/my-health-records/digilocker?status=pending_credentials', request.url));
  }
}
