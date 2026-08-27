/**
 * /api/admin/ai-health
 * Safe OpenAI connectivity diagnostic endpoint.
 *
 * SECURITY RULES:
 *  - Requires authenticated admin/superadmin session.
 *  - NEVER returns OPENAI_API_KEY value in any response.
 *  - Only returns safe status codes and error categories.
 *  - Not accessible to unauthenticated users.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";

export async function GET(req) {
    const startedAt = Date.now();

    // ── 1. Auth guard — admin/superadmin only ─────────────────────────────────
    let session;
    try {
        session = await getServerSession(authOptions);
    } catch (authErr) {
        console.error("[AI Health] Auth check failed:", authErr.message);
        return NextResponse.json({ error: "AUTH_CHECK_FAILED" }, { status: 500 });
    }

    if (!session || !session.user) {
        return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const role = session.user.role;
    if (role !== "admin" && role !== "superadmin") {
        return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    // ── 2. Check key existence (never expose value) ───────────────────────────
    const keyExists = !!process.env.OPENAI_API_KEY;
    if (!keyExists) {
        return NextResponse.json({
            status: "OPENAI_NOT_CONFIGURED",
            keyPresent: false,
            message: "OPENAI_API_KEY environment variable is not set in this deployment.",
            checkedAt: new Date().toISOString(),
            latencyMs: null,
        });
    }

    // ── 3. Attempt minimal OpenAI ping ────────────────────────────────────────
    try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "user", content: "Reply with only the word PONG." }
            ],
            max_tokens: 5,
            temperature: 0,
        });

        const reply = completion.choices?.[0]?.message?.content?.trim() || "";
        const latencyMs = Date.now() - startedAt;

        console.log(`[AI Health] OpenAI ping succeeded in ${latencyMs}ms. Reply: "${reply}"`);

        return NextResponse.json({
            status: "OPENAI_CONNECTION_SUCCESS",
            keyPresent: true,
            model: "gpt-4o-mini",
            pingReply: reply,
            latencyMs,
            checkedAt: new Date().toISOString(),
        });

    } catch (err) {
        const latencyMs = Date.now() - startedAt;
        const errMsg = err?.message || "";

        // Classify error safely — never expose secrets
        let errorCategory = "OPENAI_ERROR_UNKNOWN";
        if (errMsg.includes("401") || errMsg.includes("Incorrect API key") || errMsg.includes("invalid_api_key")) {
            errorCategory = "OPENAI_ERROR_AUTH";
        } else if (errMsg.includes("429") || errMsg.includes("rate_limit") || errMsg.includes("quota")) {
            errorCategory = "OPENAI_ERROR_RATE_LIMIT_OR_QUOTA";
        } else if (errMsg.includes("timeout") || errMsg.includes("ETIMEDOUT") || errMsg.includes("ECONNREFUSED")) {
            errorCategory = "OPENAI_ERROR_NETWORK";
        } else if (errMsg.includes("503") || errMsg.includes("overloaded")) {
            errorCategory = "OPENAI_ERROR_SERVICE_UNAVAILABLE";
        } else if (errMsg.includes("model")) {
            errorCategory = "OPENAI_ERROR_MODEL";
        }

        console.warn(`[AI Health] OpenAI ping failed in ${latencyMs}ms: ${errorCategory}`);

        return NextResponse.json({
            status: "OPENAI_CONNECTION_FAILED",
            keyPresent: true,
            errorCategory,
            latencyMs,
            checkedAt: new Date().toISOString(),
            // Safe hint for known fixable errors
            hint: errorCategory === "OPENAI_ERROR_AUTH"
                ? "The API key was rejected by OpenAI. Please verify the key in Vercel environment variables."
                : errorCategory === "OPENAI_ERROR_RATE_LIMIT_OR_QUOTA"
                ? "Account quota or rate limit reached. Check your OpenAI billing dashboard."
                : "Check server logs for more details.",
        });
    }
}
