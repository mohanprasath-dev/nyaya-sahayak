import { describe, it, expect } from 'vitest';
import { compareClausesDeterministically } from './documentComparator';

describe('lib/documentComparator - Clause & Document Comparison Engine', () => {
  it('detects improvement when non-compete is removed', () => {
    const original = 'Employee agrees not to engage in competing business for 24 months post termination across India.';
    const revised = 'Employee agrees to maintain confidentiality of proprietary trade secrets during and after employment.';

    const result = compareClausesDeterministically(original, revised);
    expect(result.riskDelta).toBe('improved');
    expect(result.differences.some(d => d.type === 'removed' && d.title.includes('Non-Compete'))).toBe(true);
    expect(result.recommendedAction).toContain('preferable');
  });

  it('detects worsening risk when reporting gag is added', () => {
    const original = 'Employee shall follow internal dispute escalation before approaching HR.';
    const revised = 'Employee shall not disclose any dispute to any external authority, police station, or court under any circumstances.';

    const result = compareClausesDeterministically(original, revised);
    expect(result.riskDelta).toBe('worsened');
    expect(result.differences.some(d => d.type === 'added' && d.title.includes('Reporting'))).toBe(true);
    expect(result.recommendedAction).toContain('Do not sign');
  });

  it('detects penalty clause additions and removals', () => {
    const original = 'Employee shall pay liquidated damages of INR 500,000 upon early resignation and forfeit gratuity.';
    const revised = 'Employee shall serve a 30-day notice period or pay basic salary in lieu thereof.';

    const result = compareClausesDeterministically(original, revised);
    expect(result.riskDelta).toBe('improved');
    expect(result.differences.some(d => d.type === 'removed' && d.title.includes('Damages'))).toBe(true);
  });

  it('handles minor stylistic edits with neutral delta', () => {
    const original = 'The parties agree to meet in good faith to resolve discrepancies within 14 days.';
    const revised = 'The parties agree to convene amicably to resolve any issues within fourteen business days.';

    const result = compareClausesDeterministically(original, revised);
    expect(result.riskDelta).toBe('neutral');
    expect(result.differences.some(d => d.type === 'modified')).toBe(true);
  });
});
