import { NextRequest, NextResponse } from 'next/server';
import { compareClausesDeterministically, ClauseComparisonResult } from '@/lib/documentComparator';

const compareRateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 5;

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip')?.trim() || '127.0.0.1';
}

function sanitizeInput(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
}

function cleanupStaleEntries(now: number) {
  if (compareRateLimitMap.size > 1000) {
    for (const [ip, timestamps] of compareRateLimitMap.entries()) {
      const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
      if (validTimestamps.length === 0) {
        compareRateLimitMap.delete(ip);
      } else {
        compareRateLimitMap.set(ip, validTimestamps);
      }
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const now = Date.now();
    cleanupStaleEntries(now);
    const timestamps = (compareRateLimitMap.get(clientIp) || []).filter(
      t => now - t < RATE_LIMIT_WINDOW_MS
    );

    if (timestamps.length >= MAX_REQUESTS) {
      const retryAfter = Math.ceil((timestamps[0] + RATE_LIMIT_WINDOW_MS - now) / 1000);
      return NextResponse.json(
        { error: 'Too many comparison requests. Please wait a minute.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(MAX_REQUESTS),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(retryAfter),
            'Cache-Control': 'no-store, max-age=0'
          }
        }
      );
    }

    timestamps.push(now);
    compareRateLimitMap.set(clientIp, timestamps);

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const { originalText, revisedText } = body;
    if (typeof originalText !== 'string' || typeof revisedText !== 'string') {
      return NextResponse.json(
        { error: 'Both "originalText" and "revisedText" string fields are required.' },
        { status: 400 }
      );
    }

    const cleanOriginal = sanitizeInput(originalText).slice(0, 5000);
    const cleanRevised = sanitizeInput(revisedText).slice(0, 5000);

    if (cleanOriginal.length < 10 || cleanRevised.length < 10) {
      return NextResponse.json(
        { error: 'Please provide at least 10 characters for each clause to compare.' },
        { status: 400 }
      );
    }

    const deterministicResult: ClauseComparisonResult = compareClausesDeterministically(
      cleanOriginal,
      cleanRevised
    );

    const apiKey = process.env.GEMINI_API_KEY;
    let plainSummary = deterministicResult.plainSummary;

    if (apiKey && apiKey.trim() !== '') {
      try {
        const prompt = `Compare these two legal clauses in plain English for a non-lawyer in India. State whether the revised text is more or less favorable to the employee/signee and why. Return valid JSON: { "plainSummary": "2-3 sentences" }

Original:
${cleanOriginal}

Revised:
${cleanRevised}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
            }),
            signal: AbortSignal.timeout(10000)
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            if (parsed.plainSummary) plainSummary = parsed.plainSummary;
          }
        }
      } catch {
        // Fallback to deterministic summary
      }
    }

    return NextResponse.json(
      {
        success: true,
        comparison: {
          ...deterministicResult,
          plainSummary
        }
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': String(MAX_REQUESTS),
          'X-RateLimit-Remaining': String(MAX_REQUESTS - timestamps.length),
          'X-RateLimit-Reset': '60',
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    );
  } catch {
    return NextResponse.json({ error: 'Unexpected error comparing clauses.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method Not Allowed. Only POST requests are supported on this endpoint.' },
    {
      status: 405,
      headers: {
        Allow: 'POST',
        'Cache-Control': 'no-store, max-age=0'
      }
    }
  );
}
