import { NextRequest, NextResponse } from 'next/server';
import { scanDocumentDeterministically, DocumentAnalysisResult } from '@/lib/documentScanner';

const docRateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

function cleanupStaleEntries(now: number) {
  if (docRateLimitMap.size > 1000) {
    for (const [ip, timestamps] of docRateLimitMap.entries()) {
      const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
      if (validTimestamps.length === 0) {
        docRateLimitMap.delete(ip);
      } else {
        docRateLimitMap.set(ip, validTimestamps);
      }
    }
  }
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

function sanitizeInput(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting
    const clientIp = getClientIp(req);
    const now = Date.now();
    cleanupStaleEntries(now);
    const timestamps = (docRateLimitMap.get(clientIp) || []).filter(
      t => now - t < RATE_LIMIT_WINDOW_MS
    );

    if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
      const retryAfter = Math.ceil((timestamps[0] + RATE_LIMIT_WINDOW_MS - now) / 1000);
      return NextResponse.json(
        {
          error: 'Too many document analysis requests. Please wait a minute before trying again.',
          retryAfterSeconds: retryAfter
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
            'X-RateLimit-Remaining': '0',
            'Cache-Control': 'no-store, max-age=0'
          }
        }
      );
    }

    timestamps.push(now);
    docRateLimitMap.set(clientIp, timestamps);
    const rateLimitHeaders = {
      'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
      'X-RateLimit-Remaining': String(Math.max(0, MAX_REQUESTS_PER_WINDOW - timestamps.length)),
      'Cache-Control': 'no-store, max-age=0'
    };

    // 2. Request body size check
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 25000) {
      return NextResponse.json(
        { error: 'Document payload too large. Maximum allowed size is 25KB.' },
        { status: 413 }
      );
    }

    // 3. Body validation
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object' || typeof body.content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid payload: "content" string field is required.' },
        { status: 400 }
      );
    }

    const cleanContent = sanitizeInput(body.content).slice(0, 5000);
    if (cleanContent.length < 20) {
      return NextResponse.json(
        { error: 'Document text is too short. Please provide at least 20 characters of legal text.' },
        { status: 400 }
      );
    }

    // 4. Deterministic Statutory Benchmark Scan
    const deterministicResult: DocumentAnalysisResult = scanDocumentDeterministically(cleanContent);

    // 5. Gemini AI Enhancement (server-side only)
    const apiKey = process.env.GEMINI_API_KEY;
    let enhancedSummary = deterministicResult.plainSummary;
    const combinedObligations = [...deterministicResult.keyObligations];
    const combinedProtections = [...deterministicResult.keyProtections];
    const combinedQuestions = [...deterministicResult.questionsForLawyer];

    if (apiKey && apiKey.trim() !== '') {
      try {
        const systemPrompt = `You are Nyaya Sahayak Document Simplifier. Your job is to translate complex legal documents, contracts, agreements, or corporate policies into plain language for non-lawyers in India.

STRICT GUIDELINES:
1. Explain what the document means in simple, direct English without legalese.
2. Highlight key obligations (what the user must do) and rights/protections.
3. List practical, critical questions the user should ask a legal professional before signing or agreeing.
4. Output MUST be valid JSON adhering strictly to:
{
  "plainSummary": "2-3 sentence plain language summary of the document's true intent",
  "keyObligations": ["Obligation 1", "Obligation 2"],
  "keyProtections": ["Protection 1", "Protection 2"],
  "questionsForLawyer": ["Question 1", "Question 2", "Question 3"]
}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemPrompt}\n\nLegal Document Text to Analyze:\n${cleanContent}` }]
                }
              ],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: 'application/json'
              }
            }),
            signal: AbortSignal.timeout(12000)
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const textResponse = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textResponse) {
            const parsed = JSON.parse(textResponse);
            if (parsed.plainSummary) enhancedSummary = parsed.plainSummary;
            if (Array.isArray(parsed.keyObligations) && parsed.keyObligations.length > 0) {
              combinedObligations.splice(0, combinedObligations.length, ...parsed.keyObligations);
            }
            if (Array.isArray(parsed.keyProtections) && parsed.keyProtections.length > 0) {
              combinedProtections.splice(0, combinedProtections.length, ...parsed.keyProtections);
            }
            if (Array.isArray(parsed.questionsForLawyer) && parsed.questionsForLawyer.length > 0) {
              combinedQuestions.splice(0, combinedQuestions.length, ...parsed.questionsForLawyer);
            }
          }
        }
      } catch {
        // Fall back gracefully to deterministic analysis
      }
    }

    const finalAnalysis: DocumentAnalysisResult = {
      ...deterministicResult,
      plainSummary: enhancedSummary,
      keyObligations: combinedObligations,
      keyProtections: combinedProtections,
      questionsForLawyer: combinedQuestions
    };

    return NextResponse.json({
      success: true,
      analysis: finalAnalysis,
      disclaimer: 'This document analysis provides informational review against Indian statutory standards. It does not constitute formal legal advice or substitute for review by an advocate.'
    }, {
      status: 200,
      headers: rateLimitHeaders
    });
  } catch {
    return NextResponse.json(
      { error: 'An unexpected error occurred while analyzing the document.' },
      { status: 500 }
    );
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
