import { NextResponse } from 'next/server';

// Basic in-memory store for rate limiting (Note: in serverless this resets per-instance)
// For a production deployment at Swastik scale, Redis (Upstash) should be used.
const ipRequestCounts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 100; // Standard API limit

export function middleware(req) {
    // Only apply rate limiting to API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
        const ip = req.headers.get('x-forwarded-for') || req.ip || "unknown-ip";

        // Skip rate-limiting for automated Vercel Cron routes (secured by secret instead)
        if (req.nextUrl.pathname.startsWith('/api/cron/')) {
             return NextResponse.next();
        }
        
        const now = Date.now();
        const requestData = ipRequestCounts.get(ip) || { count: 0, startTime: now };

        // Reset the window if 1 minute has passed
        if (now - requestData.startTime > RATE_LIMIT_WINDOW) {
            requestData.count = 1;
            requestData.startTime = now;
        } else {
            requestData.count++;
        }

        ipRequestCounts.set(ip, requestData);

        // Block if limit exceeded
        if (requestData.count > MAX_REQUESTS_PER_MINUTE) {
            console.log(`[SECURITY] Blocked IP ${ip} for rate limit violation.`);
            return new NextResponse(
                JSON.stringify({ error: "Too Many Requests", message: "Rate limit exceeded. Please try again later." }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    return NextResponse.next();
}

// Config ensures middleware only runs on relevant paths, keeping static assets fast
export const config = {
    matcher: ['/api/:path*'],
};
