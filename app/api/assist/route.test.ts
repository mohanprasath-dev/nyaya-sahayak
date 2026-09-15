import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

describe('/api/assist API Route Integration Test', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('successfully processes valid intake with mocked Gemini response', async () => {
    const mockGeminiPayload = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  empatheticSummary: 'We understand this workplace situation is difficult and you have clear legal protections under POSH Act.',
                  plainLanguageSteps: [
                    'Preserve all communications and emails securely.',
                    'Submit formal written complaint to the Internal Committee within 3 months.'
                  ],
                  draftLetter: 'To,\nThe Presiding Officer, Internal Committee\n\nRespected Committee,\nFormal complaint under POSH Act 2013...'
                })
              }
            ]
          }
        }
      ]
    };

    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockGeminiPayload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    process.env.GEMINI_API_KEY = 'test-dummy-api-key';

    const req = new NextRequest('http://localhost:3000/api/assist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.1.50'
      },
      body: JSON.stringify({
        category: 'workplace_harassment',
        answers: {
          harasserRole: 'colleague',
          hasInternalCommittee: 'yes',
          priorReportFiled: 'no',
          immediateDanger: 'no'
        },
        freeText: 'Unwelcome remarks during team meeting.'
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.ruleOutput.category).toBe('workplace_harassment');
    expect(data.ruleOutput.statuteSummary).toContain('POSH Act, 2013');
    expect(data.guidance.empatheticSummary).toContain('POSH Act');
    expect(data.guidance.plainLanguageSteps.length).toBeGreaterThan(0);
    expect(data.guidance.draftLetter).toContain('Internal Committee');
    expect(data.disclaimer).toContain('not formal legal advice');
  });

  it('rejects invalid or missing category with status 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/assist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.1.51'
      },
      body: JSON.stringify({
        category: 'invalid_fraud_category',
        answers: {}
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain('Invalid or missing legal category');
  });

  it('enforces rate limiting when exceeding request threshold', async () => {
    const testIp = '10.0.0.99';

    for (let i = 0; i < 5; i++) {
      const req = new NextRequest('http://localhost:3000/api/assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': testIp
        },
        body: JSON.stringify({
          category: 'public_safety_other',
          answers: {}
        })
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
    }

    const blockedReq = new NextRequest('http://localhost:3000/api/assist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': testIp
      },
      body: JSON.stringify({
        category: 'public_safety_other',
        answers: {}
      })
    });

    const blockedRes = await POST(blockedReq);
    expect(blockedRes.status).toBe(429);

    const data = await blockedRes.json();
    expect(data.error).toContain('Too many requests');
  });

  it('rejects oversized payload exceeding 15KB with status 413', async () => {
    const req = new NextRequest('http://localhost:3000/api/assist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'content-length': '20000',
        'x-forwarded-for': '192.168.1.52'
      },
      body: JSON.stringify({
        category: 'public_safety_other',
        answers: {}
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(413);

    const data = await res.json();
    expect(data.error).toContain('Payload too large');
  });

  it('handles malformed non-JSON body gracefully with status 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/assist', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'x-forwarded-for': '192.168.1.53'
      },
      body: 'this is not a valid JSON string'
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain('Invalid JSON');
  });
});
