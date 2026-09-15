import { NextRequest, NextResponse } from 'next/server';
import { mapContextToGuidance, IntakeAnswers } from '@/lib/ruleEngine';

// In-memory rate limiting map: ip -> array of timestamps
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

function cleanupStaleEntries(now: number) {
  if (rateLimitMap.size > 1000) {
    for (const [ip, timestamps] of rateLimitMap.entries()) {
      const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
      if (validTimestamps.length === 0) {
        rateLimitMap.delete(ip);
      } else {
        rateLimitMap.set(ip, validTimestamps);
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
  // Strip control characters and HTML tags, normalize whitespace
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting check
    const clientIp = getClientIp(req);
    const now = Date.now();
    cleanupStaleEntries(now);
    const timestamps = (rateLimitMap.get(clientIp) || []).filter(
      t => now - t < RATE_LIMIT_WINDOW_MS
    );

    if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
      const retryAfter = Math.ceil((timestamps[0] + RATE_LIMIT_WINDOW_MS - now) / 1000);
      return NextResponse.json(
        {
          error: 'Too many requests. Please wait a minute before trying again.',
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
    rateLimitMap.set(clientIp, timestamps);
    const rateLimitHeaders = {
      'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
      'X-RateLimit-Remaining': String(Math.max(0, MAX_REQUESTS_PER_WINDOW - timestamps.length)),
      'Cache-Control': 'no-store, max-age=0'
    };

    // 2. Request body size check
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 15000) {
      return NextResponse.json(
        { error: 'Payload too large. Maximum allowed request size is 15KB.' },
        { status: 413 }
      );
    }

    // 3. Request body validation
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid JSON payload in request.' },
        { status: 400 }
      );
    }

    const { category, answers, freeText } = body;

    const allowedCategories = [
      'workplace_harassment',
      'domestic_violence',
      'cyber_harassment',
      'public_safety_other'
    ];

    if (!category || !allowedCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid or missing legal category.' },
        { status: 400 }
      );
    }

    // Sanitize free-text and enforce 500 char cap
    let cleanFreeText = '';
    if (typeof freeText === 'string') {
      cleanFreeText = sanitizeInput(freeText).slice(0, 500);
    }

    // Sanitize answers dictionary
    const sanitizedAnswers: IntakeAnswers = {};
    if (answers && typeof answers === 'object') {
      for (const [key, val] of Object.entries(answers)) {
        if (typeof val === 'string') {
          sanitizedAnswers[key] = sanitizeInput(val).slice(0, 100);
        }
      }
    }

    // 3. Execute deterministic rule engine
    const ruleOutput = mapContextToGuidance(category, sanitizedAnswers, cleanFreeText);

    // 4. Gemini enhancement (server-side only)
    const apiKey = process.env.GEMINI_API_KEY;

    let empatheticSummary = '';
    let plainLanguageSteps = ruleOutput.immediateActionSteps;
    let draftLetter = '';

    // If API key is available, personalize via Gemini
    if (apiKey && apiKey.trim() !== '') {
      try {
        const sectionsList = ruleOutput.applicableSections
          .map(s => `${s.code} (${s.description})`)
          .join('; ');

        const systemPrompt = `You are Nyaya Sahayak, an empathetic, supportive legal assistant for women in India.
You receive verified statutory output from a deterministic legal rule engine.

STRICT RULES:
1. Rephrase the provided action steps into clear, calm, empowering plain language for a woman in distress.
2. Format a clean, formal complaint letter addressed to "${ruleOutput.draftComplaintBase.recipientTitle}". Use clear bracketed placeholders like [Your Full Name], [Date], [Address/Contact], [Incident Specifics].
3. ABSOLUTELY FORBIDDEN: Do NOT invent, cite, or hallucinate any legal sections or laws other than the following verified sections provided to you: "${sectionsList}".
4. Output MUST be a valid JSON object strictly adhering to this structure:
{
  "empatheticSummary": "Short supportive opening summary (2-3 sentences max)",
  "plainLanguageSteps": ["Step 1", "Step 2", "Step 3"],
  "draftLetter": "Full formal letter text with line breaks"
}`;

        const userPrompt = `Verified Category: ${ruleOutput.categoryLabel}
Governing Law: ${ruleOutput.statuteSummary}
Verified Sections to Cite: ${sectionsList}
Designated Authority: ${ruleOutput.primaryAuthority.name}
Default Steps: ${JSON.stringify(ruleOutput.immediateActionSteps)}
Additional User Context: ${cleanFreeText || 'None provided'}
Draft Base Subject: ${ruleOutput.draftComplaintBase.subjectLine}
Base Reliefs: ${JSON.stringify(ruleOutput.draftComplaintBase.demandedReliefs)}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemPrompt}\n\nUser Case Data:\n${userPrompt}` }]
                }
              ],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: 'application/json'
              }
            }),
            signal: AbortSignal.timeout(12000) // 12-second timeout
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const textResponse =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

          if (textResponse) {
            const parsed = JSON.parse(textResponse);
            if (parsed.empatheticSummary) empatheticSummary = parsed.empatheticSummary;
            if (Array.isArray(parsed.plainLanguageSteps) && parsed.plainLanguageSteps.length > 0) {
              plainLanguageSteps = parsed.plainLanguageSteps;
            }
            if (parsed.draftLetter) draftLetter = parsed.draftLetter;
          }
        }
      } catch {
        // Fall back gracefully to deterministic draft template if Gemini call fails or times out
      }
    }

    // Fallback template builder if LLM was skipped or unavailable
    if (!draftLetter) {
      const b = ruleOutput.draftComplaintBase;
      draftLetter = `To,
${b.recipientTitle}
[Address / Location]

Date: [DD/MM/YYYY]

Subject: ${b.subjectLine}
Statutory Reference: ${b.statutoryReferences.join(', ')}

${b.salutation}

${b.bodyParagraphs.join('\n\n')}

${cleanFreeText ? `Statement of Incident Details:\n${cleanFreeText}\n` : ''}
Specific Reliefs Prayed For:
${b.demandedReliefs.map((r, i) => `${i + 1}. ${r}`).join('\n')}

${b.closing}

[Your Full Name]
[Contact Number]
[Email Address / Current Address]`;
    }

    if (!empatheticSummary) {
      empatheticSummary = `We have mapped your situation to verified protections under ${ruleOutput.statuteSummary}. You have clear statutory rights, and support is available to guide you through each step safely.`;
    }

    return NextResponse.json({
      success: true,
      ruleOutput,
      guidance: {
        empatheticSummary,
        plainLanguageSteps,
        draftLetter
      },
      disclaimer:
        'Nyaya Sahayak provides procedural information and draft templates based on Indian statutes. This is not formal legal advice. For representation, please consult a legal professional or the District Legal Services Authority (DLSA).'
    }, {
      status: 200,
      headers: rateLimitHeaders
    });
  } catch {
    // Return sanitized generic error without leaking server stack trace
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request. Please try again.' },
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
