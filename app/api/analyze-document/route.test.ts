import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

describe('/api/analyze-document Integration Test', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('successfully analyzes document with mocked Gemini response', async () => {
    const mockGemini = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  plainSummary: 'This agreement restricts employee competition and limits external complaint filing.',
                  keyObligations: ['Maintain business confidentiality', 'Avoid competing for 24 months'],
                  keyProtections: ['Right to fair dispute resolution'],
                  questionsForLawyer: ['Is the 24-month non-compete void under Indian Contract Act?']
                })
              }
            ]
          }
        }
      ]
    };

    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockGemini), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    process.env.GEMINI_API_KEY = 'test-dummy-key';

    const sampleText = 'Employee shall not engage in any competing business for 24 months post termination across India.';
    const req = new NextRequest('http://localhost:3000/api/analyze-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '10.10.10.1'
      },
      body: JSON.stringify({ content: sampleText })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.analysis.overallRiskLevel).toBe('high');
    expect(data.analysis.flaggedRisks.length).toBeGreaterThan(0);
    expect(data.analysis.plainSummary).toContain('restricts employee competition');
  });

  it('rejects payload with missing or too-short content with 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/analyze-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '10.10.10.2'
      },
      body: JSON.stringify({ content: 'Too short' })
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain('too short');
  });

  it('enforces rate limiting on document analysis route', async () => {
    const testIp = '10.10.10.99';

    for (let i = 0; i < 5; i++) {
      const req = new NextRequest('http://localhost:3000/api/analyze-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': testIp
        },
        body: JSON.stringify({
          content: 'This is a valid legal document text being submitted for contract analysis.'
        })
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
    }

    const blockedReq = new NextRequest('http://localhost:3000/api/analyze-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': testIp
      },
      body: JSON.stringify({
        content: 'This is another legal document text being submitted for contract analysis.'
      })
    });

    const blockedRes = await POST(blockedReq);
    expect(blockedRes.status).toBe(429);
  });
});
