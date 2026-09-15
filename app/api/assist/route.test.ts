import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
    // Mock Gemini API call
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
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
      })
    } as any);

    // Provide a dummy API key for testing
    process.env.GEMINI_API_KEY = 'test-dummy-api-key';

    const req = new Request('http://localhost:3000/api/assist', {
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

    const res = await POST(req as any);
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
    const req = new Request('http://localhost:3000/api/assist', {
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

    const res = await POST(req as any);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain('Invalid or missing legal category');
  });

  it('enforces rate limiting when exceeding request threshold', async () => {
    const testIp = '10.0.0.99';

    // Send 5 successful requests
    for (let i = 0; i < 5; i++) {
      const req = new Request('http://localhost:3000/api/assist', {
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
      const res = await POST(req as any);
      expect(res.status).toBe(200);
    }

    // 6th request from same IP must be rate limited (429)
    const blockedReq = new Request('http://localhost:3000/api/assist', {
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

    const blockedRes = await POST(blockedReq as any);
    expect(blockedRes.status).toBe(429);

    const data = await blockedRes.json();
    expect(data.error).toContain('Too many requests');
  });
});
