/**
 * Nyaya Sahayak - Document Q&A Assistant
 * Sources last verified: 2026-09-15
 * 
 * Answers user questions grounded in provided legal documents and Indian statutory benchmarks.
 */

export interface DocumentQAResult {
  question: string;
  directAnswer: string;
  relevantClauseExcerpt: string;
  statutoryGrounding: string;
  cautionaryAdvice: string;
}

export function answerDocumentQuestionDeterministically(
  documentContent: string,
  question: string
): DocumentQAResult {
  const docLower = documentContent.toLowerCase();
  const qLower = question.toLowerCase();

  // 1. Non-compete question
  if (qLower.includes('non-compete') || qLower.includes('competitor') || qLower.includes('join another') || qLower.includes('work for')) {
    const hasNonCompete = docLower.includes('non-compete') || docLower.includes('competing');
    return {
      question,
      directAnswer: hasNonCompete
        ? 'The document attempts to restrict you from working for competing companies. However, under Indian law, post-employment non-compete clauses are generally legally void.'
        : 'This document does not contain an explicit post-employment non-compete restriction in the provided text.',
      relevantClauseExcerpt: hasNonCompete
        ? 'Clause referencing non-competition / restraint after termination.'
        : 'No non-compete clause found in the submitted text.',
      statutoryGrounding: 'Section 27 of the Indian Contract Act, 1872 states: "Every agreement by which any one is restrained from exercising a lawful profession, trade or business of any kind, is to that extent void."',
      cautionaryAdvice: 'While employers often include non-compete covenants to intimidate employees, Indian courts (including the Supreme Court in Percept D Mark v. Zaheer Khan) have consistently refused to enforce post-termination restrictions.'
    };
  }

  // 2. Termination / Notice period / Resignation question
  if (qLower.includes('terminate') || qLower.includes('fire') || qLower.includes('resign') || qLower.includes('notice period') || qLower.includes('leave')) {
    return {
      question,
      directAnswer: 'Termination and resignation rights depend on the written notice period and cause stipulations in your contract. Under Indian labor law, termination cannot be arbitrary or in retaliation for whistleblowing or reporting harassment.',
      relevantClauseExcerpt: 'Review clauses discussing notice periods, severance payments, or termination for cause.',
      statutoryGrounding: 'State Industrial Employment (Standing Orders) Acts and Shops and Establishments Acts govern notice periods (typically 30 days or salary in lieu of notice).',
      cautionaryAdvice: 'If termination is threatened because you raised a workplace grievance or POSH complaint, that constitutes unlawful statutory victimization under Section 12 of the POSH Act 2013.'
    };
  }

  // 3. Reporting harassment / police / FIR question
  if (qLower.includes('harassment') || qLower.includes('police') || qLower.includes('fir') || qLower.includes('report') || qLower.includes('complain')) {
    return {
      question,
      directAnswer: 'You cannot be legally stopped or penalized for reporting harassment, domestic abuse, or cyber crimes to authorities, regardless of what any company policy or NDA claims.',
      relevantClauseExcerpt: 'Confidentiality or non-disparagement sections in the agreement.',
      statutoryGrounding: 'Section 23 of the Indian Contract Act, 1872 renders agreements void if opposed to public policy or aimed at defeating the provisions of any law. POSH Act 2013 guarantees statutory complaint mechanisms.',
      cautionaryAdvice: 'Never agree to surrender your right to file an FIR. Any contract term that demands forfeiture of benefits for approaching the police is legally unenforceable.'
    };
  }

  // 4. Liquidated damages / penalty question
  if (qLower.includes('penalty') || qLower.includes('damages') || qLower.includes('money') || qLower.includes('pay') || qLower.includes('forfeit')) {
    return {
      question,
      directAnswer: 'Indian contract law does not permit punitive fines or arbitrary forfeiture of earned wages or statutory benefits.',
      relevantClauseExcerpt: 'Liquidated damages or financial liability clauses.',
      statutoryGrounding: 'Section 74 of the Indian Contract Act, 1872 provides that even where liquidated damages are stipulated, courts will only award reasonable compensation for actual proven loss, not a penalty.',
      cautionaryAdvice: 'Employers cannot withhold your earned salary, experience letter, or gratuity based solely on internal liquidated damages claims without a judicial decree.'
    };
  }

  // Default answer
  return {
    question,
    directAnswer: 'Based on the legal document provided, your rights and liabilities are governed by the contract terms interpreted in accordance with applicable Indian statutory protections.',
    relevantClauseExcerpt: 'General terms and conditions of the agreement.',
    statutoryGrounding: 'Indian Contract Act, 1872 and relevant state Shops & Establishments legislation.',
    cautionaryAdvice: 'For specific clause-by-clause legal interpretation, consult an advocate registered with the State Bar Council.'
  };
}
