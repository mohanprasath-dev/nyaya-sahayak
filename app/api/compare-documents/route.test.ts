import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

describe('/api/compare-documents Route Integration Test', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('successfully compares two clauses with rate limit headers', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ plainSummary: 'The revised clause is much more favorable.' }) }] } }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    process.env.GEMINI_API_KEY = 'test-dummy-key';

    const req = new NextRequest('http://localhost:3000/api/compare-documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '172.16.0.1'
      },
      body: JSON.stringify({
        originalText: 'Employee shall not compete for 24 months post termination anywhere in India.',
        revisedText: 'Employee agrees to keep business trade secrets confidential.'
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('X-RateLimit-Limit')).toBe('5');

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.comparison.riskDelta).toBe('improved');
    expect(data.comparison.plainSummary).toContain('favorable');
  });

  it('rejects missing fields with 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/compare-documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '172.16.0.2' },
      body: JSON.stringify({ originalText: 'Only one text' })
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
