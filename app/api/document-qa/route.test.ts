import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

describe('/api/document-qa Route Integration Test', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('successfully answers user question grounded in legal document', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                directAnswer: 'Under Indian law, your employer cannot legally stop you from joining a competitor post-employment.',
                relevantClauseExcerpt: 'Non-compete covenant',
                statutoryGrounding: 'Section 27 Indian Contract Act 1872'
              })
            }]
          }
        }]
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    process.env.GEMINI_API_KEY = 'test-dummy-key';

    const req = new NextRequest('http://localhost:3000/api/document-qa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '172.16.0.10'
      },
      body: JSON.stringify({
        documentContent: 'Employee agrees not to engage in or advise any competing business for 24 months post termination.',
        question: 'Can my employer enforce this non-compete after I quit?'
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('X-RateLimit-Limit')).toBe('10');

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.qa.directAnswer).toContain('cannot legally stop you');
    expect(data.qa.statutoryGrounding).toContain('Section 27');
  });

  it('rejects short inputs with status 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/document-qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '172.16.0.11' },
      body: JSON.stringify({
        documentContent: 'Short',
        question: 'Q?'
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
