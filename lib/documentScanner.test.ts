import { describe, it, expect } from 'vitest';
import {
  scanDocumentDeterministically,
  SAMPLE_LEGAL_DOCUMENTS
} from './documentScanner';

describe('lib/documentScanner - Deterministic Legal Document & Clause Scanner', () => {
  it('detects non-compete clauses and flags Section 27 Indian Contract Act violation', () => {
    const text = 'Employee agrees not to engage in or be employed by any business competing with Employer for 24 months post termination.';
    const result = scanDocumentDeterministically(text);

    expect(result.overallRiskLevel).toBe('high');
    expect(result.flaggedRisks.some(r => r.category.includes('Restraint of Trade'))).toBe(true);
    expect(result.flaggedRisks.some(r => r.statutoryIssue.includes('Section 27'))).toBe(true);
    expect(result.questionsForLawyer.some(q => q.includes('Section 27'))).toBe(true);
  });

  it('detects unlawful gag clauses on workplace harassment and external reporting', () => {
    const text = 'Employee shall not disclose any harassment grievance to any external authority or police station.';
    const result = scanDocumentDeterministically(text);

    expect(result.overallRiskLevel).toBe('high');
    expect(result.flaggedRisks.some(r => r.category.includes('Suppression of Statutory Rights'))).toBe(true);
    expect(result.flaggedRisks.some(r => r.statutoryIssue.includes('POSH Act'))).toBe(true);
  });

  it('detects defective POSH committee missing independent external member', () => {
    const text = 'The grievance committee shall comprise internal HR officers and members nominated by the Board.';
    const result = scanDocumentDeterministically(text);

    expect(result.flaggedRisks.some(r => r.category.includes('Statutory Non-Compliance in Committee Composition'))).toBe(true);
    expect(result.statutoryBenchmarkNotes.some(n => n.includes('Section 4(2)(c)'))).toBe(true);
  });

  it('detects artificially shortened reporting deadlines', () => {
    const text = 'All workplace harassment complaints must be filed within 7 days of occurrence or will be dismissed.';
    const result = scanDocumentDeterministically(text);

    expect(result.flaggedRisks.some(r => r.category.includes('Artificially Restricted Reporting Window'))).toBe(true);
    expect(result.statutoryBenchmarkNotes.some(n => n.includes('3 months'))).toBe(true);
  });

  it('accurately evaluates all built-in sample presets', () => {
    for (const sample of SAMPLE_LEGAL_DOCUMENTS) {
      const result = scanDocumentDeterministically(sample.content);
      expect(result.wordCount).toBeGreaterThan(10);
      expect(result.flaggedRisks.length).toBeGreaterThan(0);
      expect(result.questionsForLawyer.length).toBeGreaterThan(0);
    }
  });

  it('handles benign standard contract cleanly without false critical flags', () => {
    const text = 'This agreement is between Service Provider and Client for the provision of software maintenance services.';
    const result = scanDocumentDeterministically(text);

    expect(result.overallRiskLevel).toBe('low');
    expect(result.flaggedRisks.length).toBe(0);
    expect(result.questionsForLawyer.length).toBeGreaterThan(0);
  });
});
