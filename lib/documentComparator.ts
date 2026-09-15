/**
 * Nyaya Sahayak - Legal Document & Clause Comparator
 * Sources last verified: 2026-09-15
 * 
 * Enables side-by-side comparison of two legal documents or clauses
 * (e.g., Original Agreement vs. Revised Agreement, or Contract Clause vs. Statutory Benchmark).
 */

export interface ClauseComparisonResult {
  similarityScore: number;
  riskDelta: 'improved' | 'worsened' | 'neutral';
  plainSummary: string;
  differences: Array<{
    type: 'added' | 'removed' | 'modified';
    title: string;
    description: string;
    legalImpact: string;
  }>;
  recommendedAction: string;
  statutoryBaselineNote?: string;
}

export function compareClausesDeterministically(
  originalText: string,
  revisedText: string
): ClauseComparisonResult {
  const origLower = originalText.toLowerCase();
  const revLower = revisedText.toLowerCase();

  const differences: ClauseComparisonResult['differences'] = [];
  let riskScoreOriginal = 0;
  let riskScoreRevised = 0;

  // Check Non-compete presence
  const origHasNonCompete = origLower.includes('non-compete') || origLower.includes('competing') || origLower.includes('compete');
  const revHasNonCompete = revLower.includes('non-compete') || revLower.includes('competing') || revLower.includes('compete');

  if (origHasNonCompete) riskScoreOriginal += 3;
  if (revHasNonCompete) riskScoreRevised += 3;

  if (origHasNonCompete && !revHasNonCompete) {
    differences.push({
      type: 'removed',
      title: 'Removal of Post-Employment Non-Compete Restriction',
      description: 'The revised clause removed the restrictive non-compete covenant.',
      legalImpact: 'Highly Favorable: Restores constitutional and statutory freedom to trade under Section 27 of the Indian Contract Act, 1872.'
    });
  } else if (!origHasNonCompete && revHasNonCompete) {
    differences.push({
      type: 'added',
      title: 'Introduction of Post-Employment Non-Compete Restriction',
      description: 'The revised clause introduced a new restriction preventing you from joining competing businesses.',
      legalImpact: 'Adverse Change: Imposes a covenant in restraint of trade, generally void under Section 27 of the Indian Contract Act.'
    });
  }

  // Check Gag / Reporting suppression
  const origHasGag = origLower.includes('not disclose') || origLower.includes('external authority') || origLower.includes('police');
  const revHasGag = revLower.includes('not disclose') || revLower.includes('external authority') || revLower.includes('police');

  if (origHasGag) riskScoreOriginal += 4;
  if (revHasGag) riskScoreRevised += 4;

  if (origHasGag && !revHasGag) {
    differences.push({
      type: 'removed',
      title: 'Removal of External Reporting Restriction',
      description: 'The restriction barring reporting to police or external regulatory bodies was removed.',
      legalImpact: 'Critical Improvement: Restores fundamental statutory right to report criminal harassment or lodge an FIR.'
    });
  } else if (!origHasGag && revHasGag) {
    differences.push({
      type: 'added',
      title: 'New Restriction on External Reporting',
      description: 'The revised text attempts to bar or penalize reporting to external authorities.',
      legalImpact: 'Severe Risk: Directly conflicts with public policy and POSH Act reporting mechanisms.'
    });
  }

  // Check Liquidated Damages / Penalties
  const origHasDamages = origLower.includes('liquidated damages') || origLower.includes('penalty') || origLower.includes('forfeit');
  const revHasDamages = revLower.includes('liquidated damages') || revLower.includes('penalty') || revLower.includes('forfeit');

  if (origHasDamages) riskScoreOriginal += 2;
  if (revHasDamages) riskScoreRevised += 2;

  if (origHasDamages && !revHasDamages) {
    differences.push({
      type: 'removed',
      title: 'Removal of Punitive Damages / Forfeiture Clause',
      description: 'The liquidated damages or benefit forfeiture penalty was eliminated.',
      legalImpact: 'Favorable: Limits financial exposure to actual proven damages under Section 73/74 of Indian Contract Act.'
    });
  } else if (!origHasDamages && revHasDamages) {
    differences.push({
      type: 'added',
      title: 'Addition of Unilateral Damages Clause',
      description: 'The revised clause specifies automatic financial penalties or forfeiture of dues upon alleged breach.',
      legalImpact: 'Adverse Change: Increases financial liability and risk of arbitrary wage/gratuity deductions.'
    });
  }

  // Calculate similarity based on shared vocabulary
  const origWords = new Set(origLower.split(/\s+/).filter(w => w.length > 3));
  const revWords = new Set(revLower.split(/\s+/).filter(w => w.length > 3));
  let sharedCount = 0;
  origWords.forEach(w => {
    if (revWords.has(w)) sharedCount++;
  });
  const totalUnique = new Set([...origWords, ...revWords]).size || 1;
  const similarityScore = Math.min(100, Math.round((sharedCount / totalUnique) * 100));

  let riskDelta: 'improved' | 'worsened' | 'neutral' = 'neutral';
  if (riskScoreRevised < riskScoreOriginal) {
    riskDelta = 'improved';
  } else if (riskScoreRevised > riskScoreOriginal) {
    riskDelta = 'worsened';
  }

  if (differences.length === 0) {
    differences.push({
      type: 'modified',
      title: 'Textual Rephrasing',
      description: 'Changes between the two versions appear primarily stylistic without altering key statutory risk indicators.',
      legalImpact: 'Neutral: Substantive legal obligations remain comparable.'
    });
  }

  const plainSummary = riskDelta === 'improved'
    ? 'The revised document improves your legal position by removing one or more restrictive covenants or penalties.'
    : riskDelta === 'worsened'
    ? 'Warning: The revised document introduces additional legal risks, restrictions, or financial liabilities.'
    : 'The comparison shows minor stylistic adjustments with no major shift in statutory legal risk.';

  const recommendedAction = riskDelta === 'worsened'
    ? 'Do not sign the revised version without negotiating the removal of newly introduced liabilities.'
    : riskDelta === 'improved'
    ? 'The revised version is preferable to the original, though standard advocate review remains recommended.'
    : 'Review specific operational dates and definitions before executing either document.';

  return {
    similarityScore,
    riskDelta,
    plainSummary,
    differences,
    recommendedAction,
    statutoryBaselineNote: 'Compared against Indian Contract Act 1872 and POSH Act 2013 standards.'
  };
}
