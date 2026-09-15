import { NextRequest, NextResponse } from 'next/server';
import { answerDocumentQuestionDeterministically, DocumentQAResult } from '@/lib/documentQA';

const qaRateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 10;

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
  if (qaRateLimitMap.size > 1000) {
    for (const [ip, timestamps] of qaRateLimitMap.entries()) {
      const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
      if (validTimestamps.length === 0) {
        qaRateLimitMap.delete(ip);
      } else {
        qaRateLimitMap.set(ip, validTimestamps);
      }
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const now = Date.now();
    cleanupStaleEntries(now);
    const timestamps = (qaRateLimitMap.get(clientIp) || []).filter(
      t => now - t < RATE_LIMIT_WINDOW_MS
    );

    if (timestamps.length >= MAX_REQUESTS) {
      const retryAfter = Math.ceil((timestamps[0] + RATE_LIMIT_WINDOW_MS - now) / 1000);
      return NextResponse.json(
        { error: 'Too many queries. Please wait a minute before asking more questions.' },
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
    qaRateLimitMap.set(clientIp, timestamps);

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const { documentContent, question } = body;
    if (typeof documentContent !== 'string' || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Both "documentContent" and "question" string fields are required.' },
        { status: 400 }
      );
    }

    const cleanDoc = sanitizeInput(documentContent).slice(0, 5000);
    const cleanQ = sanitizeInput(question).slice(0, 300);

    if (cleanDoc.length < 15 || cleanQ.length < 5) {
      return NextResponse.json(
        { error: 'Please provide both the legal document and a specific question.' },
        { status: 400 }
      );
    }

    const deterministicAnswer: DocumentQAResult = answerDocumentQuestionDeterministically(
      cleanDoc,
      cleanQ
    );

    const apiKey = process.env.GEMINI_API_KEY;
    let finalAnswer = deterministicAnswer.directAnswer;
    let finalExcerpt = deterministicAnswer.relevantClauseExcerpt;

    if (apiKey && apiKey.trim() !== '') {
      try {
        const prompt = `You are a legal document assistant for Indian citizens. Answer the user's question directly based on the provided document text and Indian law benchmarks. Do NOT give formal legal advice; give clear, accurate procedural explanations.
Return valid JSON:
{
  "directAnswer": "Clear, concise direct answer to the question in 2-3 sentences",
  "relevantClauseExcerpt": "Short excerpt or clause reference from the text",
  "statutoryGrounding": "Relevant Indian statute if applicable (e.g. Indian Contract Act, POSH Act)"
}

Document:
${cleanDoc}

User Question:
${cleanQ}`;

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
            if (parsed.directAnswer) finalAnswer = parsed.directAnswer;
            if (parsed.relevantClauseExcerpt) finalExcerpt = parsed.relevantClauseExcerpt;
          }
        }
      } catch {
        // Fallback
      }
    }

    return NextResponse.json(
      {
        success: true,
        qa: {
          ...deterministicAnswer,
          directAnswer: finalAnswer,
          relevantClauseExcerpt: finalExcerpt
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
    return NextResponse.json({ error: 'Unexpected error answering question.' }, { status: 500 });
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
