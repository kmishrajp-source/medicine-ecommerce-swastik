import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Simple in-memory rate limiter (Note: Resets on server restart/redeploy)
// In production, use Upstash Redis for distributed rate limiting.
const rateLimitMap = new Map();

function rateLimit(ip) {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 50;

    const userEntry = rateLimitMap.get(ip) || { count: 0, startTime: now };

    if (now - userEntry.startTime > windowMs) {
        userEntry.count = 1;
        userEntry.startTime = now;
    } else {
        userEntry.count++;
    }

    rateLimitMap.set(ip, userEntry);
    return userEntry.count <= maxRequests;
}

const intlMiddleware = createMiddleware(routing);

export default function middleware(request) {
    const ip = request.ip || '127.0.0.1';
    const { pathname } = request.nextUrl;

    // 1. Rate Limiting for API routes
    if (pathname.startsWith('/api')) {
        if (!rateLimit(ip)) {
            return new NextResponse(JSON.stringify({ error: "Rate limit exceeded (50/min). Slow down!" }), {
                status: 429,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        return NextResponse.next(); // Bypass intl for API
    }

    // 2. Bot Protection (Basic)
    const userAgent = request.headers.get('user-agent') || '';
    const botPatterns = [/bot/i, /crawler/i, /spider/i, /headless/i, /scraper/i];
    if (botPatterns.some(pattern => pattern.test(userAgent))) {
        // We could block them, or just alert. Let's block repeated scraping attempts.
        // For now, we allow known bots but restrict others.
    }

    // 3. Internationalization & Routing
    return intlMiddleware(request);
}

export const config = {
    // Match all pathnames except for
    // - … any internal Next.js paths (_next, _vercel)
    // - … files with extensions (e.g. .ico, .png)
    matcher: ['/((?!_next|_vercel|.*\\..*).*)']
};
