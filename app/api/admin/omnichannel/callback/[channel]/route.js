import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { channel } = params;
    
    // Parse the query parameters for the OAuth code
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(new URL(`/admin/omnichannel?error=${error}`, req.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL(`/admin/omnichannel?error=missing_code`, req.url));
    }

    const clientId = process.env.FACEBOOK_CLIENT_ID;
    const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
        return NextResponse.redirect(new URL(`/admin/omnichannel?error=missing_credentials`, req.url));
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/admin/omnichannel/callback/${channel}`;

    try {
        // Exchange the code for an Access Token
        const tokenExchangeUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${code}`;
        
        const tokenRes = await fetch(tokenExchangeUrl);
        const tokenData = await tokenRes.json();

        if (tokenData.error) {
            console.error("Token Exchange Error:", tokenData.error);
            return NextResponse.redirect(new URL(`/admin/omnichannel?error=token_exchange_failed`, req.url));
        }

        const accessToken = tokenData.access_token;
        const expiresIn = tokenData.expires_in; // Usually in seconds

        // Calculate expiration date if provided
        let expiresAt = null;
        if (expiresIn) {
            expiresAt = new Date();
            expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
        }

        // Ideally, here you would also fetch the user's profile to get the Account ID and Name
        // For MVP, we'll store what we have and mark it as connected.
        // We will upsert the connection in the database.

        await prisma.socialConnection.upsert({
            where: { channel: channel },
            update: {
                isConnected: true,
                isApiAvailable: true,
                status: 'CONNECTED',
                accessToken: accessToken,
                tokenExpiresAt: expiresAt,
                // We assume posting and messaging are true if we get the token successfully,
                // though this might need further validation against Meta Graph API in reality.
                canPost: true,
                canMessage: true,
                lastChecked: new Date()
            },
            create: {
                channel: channel,
                isConnected: true,
                isApiAvailable: true,
                status: 'CONNECTED',
                accessToken: accessToken,
                tokenExpiresAt: expiresAt,
                canPost: true,
                canMessage: true,
                lastChecked: new Date()
            }
        });

        // Redirect back to the Hub with a success message
        return NextResponse.redirect(new URL(`/admin/omnichannel?success=true&channel=${channel}`, req.url));

    } catch (error) {
        console.error("OAuth Callback Exception:", error);
        return NextResponse.redirect(new URL(`/admin/omnichannel?error=internal_server_error`, req.url));
    }
}
