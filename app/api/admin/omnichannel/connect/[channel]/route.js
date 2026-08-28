import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { channel } = params;

    if (channel !== 'FACEBOOK' && channel !== 'INSTAGRAM') {
        return NextResponse.json({ error: "Unsupported channel for OAuth MVP" }, { status: 400 });
    }

    const clientId = process.env.FACEBOOK_CLIENT_ID;
    
    if (!clientId) {
        return NextResponse.json({ error: "FACEBOOK_CLIENT_ID not configured" }, { status: 500 });
    }

    // Determine the base URL for the redirect
    // If in development, use localhost. If production, use the actual domain.
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/admin/omnichannel/callback/${channel}`;

    // Meta Graph API specific scopes for publishing
    const scopes = [
        'pages_show_list',
        'pages_read_engagement',
        'pages_manage_posts',
        'instagram_basic',
        'instagram_content_publish'
    ].join(',');

    // Construct the Facebook OAuth Dialog URL
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=code`;

    // Redirect the admin to Facebook
    return NextResponse.redirect(authUrl);
}
