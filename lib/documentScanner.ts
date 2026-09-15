/**
 * Nyaya Sahayak - Deterministic Legal Document & Clause Scanner
 * Sources last verified: 2026-09-15
 * 
 * Scans legal documents, agreements, and policies against verified Indian legal benchmarks:
 * - Section 27, Indian Contract Act 1872 (Restraint of trade / non-competes)
 * - Section 23, Indian Contract Act 1872 (Agreements against public policy)
 * - POSH Act 2013 (Mandatory IC constitution, non-suppression of harassment reports)
 * - Payment of Gratuity Act 1972 & statutory wage protections
 */

export interface ClauseRisk {
  severity: 'high' | 'medium' | 'info';
  category: string;
  clauseExcerpt: string;
  statutoryIssue: string;
  plainExplanation: string;
  recommendation: string;
}

export interface DocumentAnalysisResult {
  documentType: string;
  wordCount: number;
  overallRiskLevel: 'high' | 'medium' | 'low';
  plainSummary: string;
  keyObligations: string[];
  keyProtections: string[];
  flaggedRisks: ClauseRisk[];
  questionsForLawyer: string[];
  statutoryBenchmarkNotes: string[];
}

export interface SampleLegalDocument {
  id: string;
  title: string;
  description: string;
  content: string;
}

export const SAMPLE_LEGAL_DOCUMENTS: SampleLegalDocument[] = [
  {
    id: 'workplace_policy',
    title: 'Sample Workplace Grievance & Harassment Policy',
    description: 'A corporate internal policy missing mandatory statutory POSH safeguards.',
    content: `COMPANY INTERNAL GRIEVANCE POLICY (SECTION 8 - HARASSMENT & CONDUCT)

1. Reporting Procedure: Any female employee experiencing grievances must first report exclusively to her direct reporting manager within 7 business days of occurrence. 

2. Confidential Internal Resolution: All complaints shall be resolved internally by the HR Department within 180 days. The employee shall strictly not disclose or report the grievance to any external authority, police station, or government portal during this period.

3. Committee Constitution: The Grievance Committee shall comprise the Human Resources Director and two members nominated exclusively by the Board of Directors.

4. Non-Disparagement: During and after employment, the employee agrees never to speak negatively of the company or its executives, and waives rights to file statutory complaints under external labor tribunals.`
  },
  {
    id: 'employment_nda',
    title: 'Sample Employment Agreement & Non-Compete Clause',
    description: 'An agreement with restrictive covenants and gag provisions.',
    content: `EMPLOYMENT TERMS & CONFIDENTIALITY AGREEMENT

CLAUSE 12 - RESTRICTIVE COVENANTS:
(a) Non-Compete: For a period of twenty-four (24) months following termination of employment for any reason, Employee shall not directly or indirectly engage in, advise, or be employed by any business competing with Employer anywhere within the Republic of India.

(b) Absolute Confidentiality: Employee agrees that all internal workplace occurrences, workplace investigations, and compensation structures are proprietary secrets. Employee is strictly prohibited from reporting internal disputes to external regulatory bodies.

(c) Unilateral Liquidated Damages: In the event of any breach, Employee agrees to pay Employer an unconditional sum of INR 500,000 as liquidated damages and forfeit all accrued statutory gratuity.`
  },
  {
    id: 'separation_release',
    title: 'Sample Mutual Separation & Release Agreement',
    description: 'A severance contract containing blanket waivers of legal rights.',
    content: `MUTUAL SEPARATION AND GENERAL RELEASE AGREEMENT

1. Full and Final Waiver: The Employee unconditionally releases and forever discharges the Employer, its officers, and employees from any and all past, present, or future claims, including claims under the POSH Act 2013, criminal complaints, or labor welfare statutes.

2. Liquidated Retaliation Clause: Should the Employee participate in any statutory proceedings or police inquiry regarding workplace misconduct, all severance payments paid hereunder shall be forfeited and repaid immediately with 18% annual interest.

3. Governing Law & Exclusive Seat: This agreement shall be subject to binding private arbitration in Singapore, with all legal costs borne exclusively by the Employee.`
  }
];

export function scanDocumentDeterministically(content: string): DocumentAnalysisResult {
  const words = content.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const flaggedRisks: ClauseRisk[] = [];
  const keyObligations: string[] = [];
  const keyProtections: string[] = [];
  const questionsForLawyer: string[] = [];
  const statutoryBenchmarkNotes: string[] = [];

  const lower = content.toLowerCase();

  // 1. Non-compete scan (Section 27 Indian Contract Act)
  if (lower.includes('non-compete') || lower.includes('competing') || lower.includes('shall not directly or indirectly engage')) {
    flaggedRisks.push({
      severity: 'high',
      category: 'Restraint of Trade / Void Covenant',
      clauseExcerpt: 'Post-employment non-compete restriction',
      statutoryIssue: 'Section 27 of the Indian Contract Act, 1872 states that any agreement restraining a person from exercising a lawful profession, trade or business is void to that extent.',
      plainExplanation: 'In India, employers cannot legally prevent you from working for a competitor after your employment ends. Post-termination non-compete covenants are generally void as per settled Supreme Court precedents (Niranjan Shankar Golikari, Percept D Mark).',
      recommendation: 'Request deletion of the post-employment non-compete clause or seek confirmation from your advocate.'
    });
    questionsForLawyer.push('Does the post-employment non-compete clause hold any legal enforceability under Section 27 of the Indian Contract Act, 1872?');
  }

  // 2. Suppression of statutory reporting / POSH gag clause
  if (
    lower.includes('external authority') ||
    lower.includes('police') ||
    lower.includes('not disclose') ||
    lower.includes('waive') ||
    lower.includes('disparagement')
  ) {
    if (lower.includes('harassment') || lower.includes('grievance') || lower.includes('posh') || lower.includes('misconduct') || lower.includes('dispute')) {
      flaggedRisks.push({
        severity: 'high',
        category: 'Unlawful Suppression of Statutory Rights',
        clauseExcerpt: 'Restriction on reporting grievances externally or filing complaints',
        statutoryIssue: 'Section 23 of the Indian Contract Act (agreements opposed to public policy are void) and Section 16 of the POSH Act 2013.',
        plainExplanation: 'No employer agreement or NDA can legally prohibit you from reporting sexual harassment to a police station (FIR) or to the District Local Committee. Clauses attempting to gag reporting of criminal offences or harassment are legally unenforceable.',
        recommendation: 'Never sign a clause that waives your right to lodge an FIR or contact statutory women welfare authorities.'
      });
      questionsForLawyer.push('Can this confidentiality or waiver clause be used against me if I report workplace harassment or criminal conduct?');
    }
  }

  // 3. Defective POSH Committee constitution
  if (lower.includes('grievance committee') || lower.includes('committee shall comprise') || lower.includes('posh')) {
    if (!lower.includes('external member') && !lower.includes('ngo')) {
      flaggedRisks.push({
        severity: 'medium',
        category: 'Statutory Non-Compliance in Committee Composition',
        clauseExcerpt: 'Internal committee nominated exclusively by internal management',
        statutoryIssue: 'Section 4(2)(c) of POSH Act 2013 mandates that an Internal Committee MUST include at least one external member from an NGO or association committed to the cause of women.',
        plainExplanation: 'An Internal Committee without an independent external member is defective under Indian law. This statutory requirement exists specifically to prevent company management bias.',
        recommendation: 'Check whether an independent external NGO member is officially designated on your organization committee.'
      });
      statutoryBenchmarkNotes.push('POSH Act Section 4(2)(c) benchmark: Minimum 50% women members + 1 independent external NGO member.');
    }
  }

  // 4. Excessive liquidated damages or forfeiture of statutory gratuity
  if (lower.includes('liquidated damages') || lower.includes('forfeit') || lower.includes('gratuity')) {
    flaggedRisks.push({
      severity: 'medium',
      category: 'Unreasonable Penalty or Forfeiture of Statutory Dues',
      clauseExcerpt: 'Liquidated damages / forfeiture clause',
      statutoryIssue: 'Section 74 of the Indian Contract Act (reasonable compensation only) and Payment of Gratuity Act, 1972 (gratuity cannot be arbitrarily forfeited except for proven riotous/disorderly conduct causing financial damage).',
      plainExplanation: 'Employers cannot impose unilateral, punitive fines or arbitrarily confiscate statutory benefits like gratuity or earned wages.',
      recommendation: 'Have an employment lawyer review any clause demanding flat liquidated damages.'
    });
    questionsForLawyer.push('Are the liquidated damages specified in this document legally enforceable or considered a penalty under Section 74?');
  }

  // 5. Short reporting deadlines (e.g. 7 days vs statutory 3 months under POSH)
  if (lower.includes('7 days') || lower.includes('within 7') || lower.includes('14 days') || lower.includes('30 days')) {
    if (lower.includes('harassment') || lower.includes('grievance')) {
      flaggedRisks.push({
        severity: 'medium',
        category: 'Artificially Restricted Reporting Window',
        clauseExcerpt: 'Requirement to file complaint within short deadline',
        statutoryIssue: 'Section 9(1) of POSH Act 2013 grants 3 months from the date of incident to file a complaint (further extendable by another 3 months by the committee).',
        plainExplanation: 'Company policies cannot shorten the 3-month statutory window granted to women under Indian parliamentary law.',
        recommendation: 'Company timelines cannot override statutory limitation periods under the POSH Act.'
      });
      statutoryBenchmarkNotes.push('POSH Act Section 9 benchmark: 3 months standard window + 3 months discretionary extension.');
    }
  }

  // Default extractions
  if (lower.includes('employee') || lower.includes('complainant')) {
    keyObligations.push('Subject to internal reporting hierarchy and internal procedural rules.');
    keyObligations.push('Bound by confidentiality regarding proprietary employer business information.');
  }

  keyProtections.push('Statutory right to fair hearing and principles of natural justice.');
  keyProtections.push('Right to approach statutory bodies (Local Committee / Police / Labor Court) regardless of internal clauses.');

  if (questionsForLawyer.length === 0) {
    questionsForLawyer.push('Does this document align with current Indian labor legislation and recent High Court/Supreme Court precedents?');
    questionsForLawyer.push('Are there any one-sided indemnities or waivers that disproportionately increase my liability?');
    questionsForLawyer.push('What is the governing jurisdiction and dispute resolution mechanism in case of conflict?');
  }

  const overallRiskLevel = flaggedRisks.some(r => r.severity === 'high')
    ? 'high'
    : flaggedRisks.length > 0
    ? 'medium'
    : 'low';

  let documentType = 'Legal Document / Contract Clause';
  if (lower.includes('grievance') || lower.includes('harassment policy')) {
    documentType = 'Internal Workplace Policy';
  } else if (lower.includes('non-compete') || lower.includes('employment agreement')) {
    documentType = 'Employment Contract / Covenant';
  } else if (lower.includes('release') || lower.includes('separation')) {
    documentType = 'Separation & Release Agreement';
  }

  const plainSummary = `This ${documentType.toLowerCase()} sets out formal contractual obligations between the parties. Our statutory benchmark scanner identified ${flaggedRisks.length} potential area(s) of interest or legal risk when evaluated against Indian statutory law.`;

  return {
    documentType,
    wordCount,
    overallRiskLevel,
    plainSummary,
    keyObligations,
    keyProtections,
    flaggedRisks,
    questionsForLawyer,
    statutoryBenchmarkNotes
  };
}
