import { describe, it, expect } from 'vitest';
import { answerDocumentQuestionDeterministically } from './documentQA';

describe('lib/documentQA - Legal Document Question Answering Engine', () => {
  const docSample = `
  EMPLOYMENT AGREEMENT
  1. Non-Compete: Employee shall not join any competing business for 12 months.
  2. Termination: Either party may terminate with 30 days notice or salary in lieu.
  3. Reporting: Grievances must be submitted to HR.
  4. Liquidated Damages: Early departure incurs INR 100,000 penalty.
  `;

  it('answers non-compete questions with Section 27 Indian Contract Act citation', () => {
    const res = answerDocumentQuestionDeterministically(docSample, 'Can I join a competitor after resigning?');
    expect(res.directAnswer).toContain('void');
    expect(res.statutoryGrounding).toContain('Section 27');
    expect(res.cautionaryAdvice).toContain('Percept D Mark');
  });

  it('answers harassment and external reporting questions with Section 23 citation', () => {
    const res = answerDocumentQuestionDeterministically(docSample, 'Can the company stop me from filing a police complaint?');
    expect(res.directAnswer).toContain('cannot be legally stopped');
    expect(res.statutoryGrounding).toContain('Section 23');
  });

  it('answers termination notice and salary questions accurately', () => {
    const res = answerDocumentQuestionDeterministically(docSample, 'How much notice period do I have to give?');
    expect(res.directAnswer).toContain('notice period');
    expect(res.statutoryGrounding).toContain('Shops and Establishments');
  });

  it('answers penalty and damages questions with Section 74 citation', () => {
    const res = answerDocumentQuestionDeterministically(docSample, 'Can they deduct liquidated damages from my salary?');
    expect(res.directAnswer).toContain('not permit punitive fines');
    expect(res.statutoryGrounding).toContain('Section 74');
  });

  it('provides sensible statutory fallback for general questions', () => {
    const res = answerDocumentQuestionDeterministically(docSample, 'What general laws apply to this agreement?');
    expect(res.directAnswer).toContain('governed by the contract terms');
    expect(res.statutoryGrounding).toContain('Indian Contract Act');
  });
});
