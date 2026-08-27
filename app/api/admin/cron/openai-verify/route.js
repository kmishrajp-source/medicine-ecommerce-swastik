import { NextResponse } from 'next/server';
import OpenAI from 'openai';

/**
 * TEMPORARY TEST ENDPOINT — PRODUCTION OPENAI VERIFICATION
 * This endpoint performs a real OpenAI API call using the server-side key.
 * It does NOT expose the API key, does NOT touch any business data.
 * Delete after verification.
 */
export async function GET() {
  const checks = {
    keyConfigured: false,
    keyAccessible: false,
    requestReachedOpenAI: false,
    authSucceeded: false,
    responseReceived: false,
    expectedResponseReceived: false,
    keyExposedAnywhere: false, // always false by design
    model: null,
    error: null,
    response: null,
  };

  // 1. Check key is present in server runtime
  const keyPresent = !!process.env.OPENAI_API_KEY;
  checks.keyConfigured = keyPresent;
  checks.keyAccessible = keyPresent;

  if (!keyPresent) {
    return NextResponse.json({
      verdict: 'NOT_CONFIGURED',
      checks,
    });
  }

  // 2. Make real OpenAI call — test message only, no customer data
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a test responder. Reply with exactly the text you are given, nothing else.',
        },
        {
          role: 'user',
          content: 'Reply with exactly: SWASTIK_OPENAI_TEST_OK',
        },
      ],
      max_tokens: 20,
      temperature: 0,
    });

    checks.requestReachedOpenAI = true;
    checks.authSucceeded = true;
    checks.model = completion.model;

    const reply = completion.choices?.[0]?.message?.content?.trim();
    checks.responseReceived = !!reply;
    checks.expectedResponseReceived = reply === 'SWASTIK_OPENAI_TEST_OK';
    checks.response = reply;

    return NextResponse.json({
      verdict: checks.expectedResponseReceived ? 'WORKING' : 'PARTIAL',
      checks,
    });
  } catch (err) {
    checks.requestReachedOpenAI = err?.status !== undefined; // If we got an HTTP status back, request reached OpenAI
    checks.authSucceeded = err?.status !== 401 && err?.status !== 403;
    checks.error = {
      status: err?.status,
      code: err?.code,
      type: err?.type,
      message: err?.message?.replace(process.env.OPENAI_API_KEY || '', '[REDACTED]'),
    };

    return NextResponse.json({
      verdict: 'FAILED',
      checks,
    });
  }
}
