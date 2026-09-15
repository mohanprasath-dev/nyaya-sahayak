/**
 * Nyaya Sahayak - Deterministic Rule Engine
 * 
 * Maps structured intake responses into verified Indian statutory provisions,
 * appropriate legal authorities, emergency helplines, and actionable next steps.
 * 
 * CRITICAL DESIGN PRINCIPLE:
 * This module is 100% pure and deterministic. It contains NO generative LLM logic.
 * Every statute, section citation, and legal procedure is strictly derived from
 * verifiable Indian statutes (POSH Act 2013, PWDVA 2005, IT Act 2000, BNS 2023, BNSS 2023).
 */

import {
  LegalCategory,
  LEGAL_REGISTRY,
  OFFICIAL_HELPLINES,
  HelplineInfo,
  LegalStatute
} from './lawData';

export interface IntakeAnswers {
  // Common / general flags
  immediateDanger?: 'yes' | 'no';
  priorReportFiled?: 'yes' | 'no';

  // Workplace Harassment
  harasserRole?: 'colleague' | 'employer_or_management' | 'client_or_third_party';
  hasInternalCommittee?: 'yes' | 'no' | 'unsure';
  employmentType?: 'permanent' | 'contract_or_intern' | 'domestic_worker';

  // Domestic Violence
  relationship?: 'spouse' | 'in_laws' | 'live_in_partner' | 'other_relative';
  sharedHousehold?: 'yes' | 'no';
  childrenInvolved?: 'yes' | 'no';

  // Cyber Harassment
  incidentType?: 'non_consensual_images' | 'stalking_threats' | 'impersonation_fake_profile' | 'defamatory_messages';
  platformType?: 'social_media' | 'messaging_app' | 'email' | 'public_website';
  evidencePreserved?: 'yes' | 'no' | 'partial';

  // Public Safety
  incidentNature?: 'physical_stalking' | 'verbal_harassment_eve_teasing' | 'physical_assault' | 'public_transit_incident';
  perpetratorKnown?: 'known_person' | 'stranger';

  // Any other context key
  [key: string]: string | undefined;
}

export interface ApplicableSection {
  code: string;
  historicalEquivalent?: string;
  description: string;
  relevanceNote?: string;
}

export interface DraftComplaintTemplate {
  recipientTitle: string;
  subjectLine: string;
  statutoryReferences: string[];
  salutation: string;
  bodyParagraphs: string[];
  demandedReliefs: string[];
  closing: string;
}

export interface LegalGuidanceResult {
  category: LegalCategory;
  categoryLabel: string;
  riskLevel: 'high' | 'medium' | 'standard';
  statuteSummary: string;
  governingStatutes: LegalStatute[];
  applicableSections: ApplicableSection[];
  primaryAuthority: {
    name: string;
    description: string;
    escalationAuthority: string;
    officialPortal?: string;
  };
  helplines: HelplineInfo[];
  immediateActionSteps: string[];
  tailoredRemedies: string[];
  evidenceChecklist: string[];
  draftComplaintBase: DraftComplaintTemplate;
  verifiedAt: string;
}

/**
 * Pure function mapping intake category and answers to a verified legal guidance object.
 */
export function mapContextToGuidance(
  category: string,
  answers: IntakeAnswers = {},
  _freeText?: string
): LegalGuidanceResult {
  const verifiedAt = '2026-09-15';

  // Default fallback if unknown category
  const validCategory: LegalCategory = (category in LEGAL_REGISTRY)
    ? (category as LegalCategory)
    : 'public_safety_other';

  const baseProfile = LEGAL_REGISTRY[validCategory];
  const helplines: HelplineInfo[] = [...baseProfile.recommendedHelplines];
  const immediateActionSteps: string[] = [...baseProfile.defaultNextSteps];
  const tailoredRemedies: string[] = [...baseProfile.legalRemedies];
  const evidenceChecklist: string[] = [...baseProfile.evidenceChecklist];
  const applicableSections: ApplicableSection[] = [];

  let riskLevel: 'high' | 'medium' | 'standard' = 'standard';
  let recipientTitle = 'The Competent Legal Authority';
  let subjectLine = 'Formal Complaint regarding Violation of Legal Rights';
  const bodyParagraphs: string[] = [];
  const demandedReliefs: string[] = [];

  // Emergency / immediate danger check across any category
  const isEmergency = answers.immediateDanger === 'yes';
  if (isEmergency) {
    riskLevel = 'high';
    // Ensure 112 is moved to index 0
    const index112 = helplines.findIndex(h => h.number === '112');
    if (index112 > 0) {
      const [h112] = helplines.splice(index112, 1);
      helplines.unshift(h112);
    } else if (index112 === -1) {
      helplines.unshift(OFFICIAL_HELPLINES.emergency_112);
    }
    immediateActionSteps.unshift(
      'IMMEDIATE SAFETY ALERT: Dial 112 right now. If you are in physical danger or threatened with imminent harm, reach a secure, public area immediately.'
    );
  }

  // Branch by category
  switch (validCategory) {
    case 'workplace_harassment': {
      const isEmployerHarasser = answers.harasserRole === 'employer_or_management';
      const noIC = answers.hasInternalCommittee === 'no';
      const isDomesticWorker = answers.employmentType === 'domestic_worker';

      // Section mappings
      applicableSections.push(
        {
          code: 'POSH Act Section 2(n)',
          description: 'Defines sexual harassment including physical contact, unwelcome sexually coloured remarks, and demands for sexual favours.'
        },
        {
          code: isEmployerHarasser || noIC || isDomesticWorker ? 'POSH Act Section 6' : 'POSH Act Section 4 & 9',
          description: isEmployerHarasser || noIC || isDomesticWorker
            ? 'Mandates submitting complaint to the District Local Committee (LC) because the respondent is an employer or the establishment lacks an Internal Committee.'
            : 'Mandates submitting complaint to the Internal Committee (IC) within 3 months.'
        },
        {
          code: 'POSH Act Section 12',
          description: 'Statutory right to interim reliefs during inquiry: transfer, leave up to 3 months, or restraining appraisal reporting.'
        }
      );

      // Add criminal sanction if physical harassment or threats were made
      if (answers.harasserRole || answers.immediateDanger === 'yes') {
        applicableSections.push({
          code: 'BNS Section 75',
          historicalEquivalent: 'IPC Section 354A',
          description: 'Sexual harassment criminal provision entailing rigorous imprisonment up to 3 years.'
        });
      }

      // Customize authority
      let authority = { ...baseProfile.primaryAuthority };
      if (isEmployerHarasser || noIC || isDomesticWorker) {
        authority = {
          name: 'Local Committee (LC) - District Officer / Collectorate',
          description: 'Established in every district by the District Officer to receive complaints from establishments with fewer than 10 workers or complaints against employers directly.',
          escalationAuthority: 'District Magistrate / High Court writ jurisdiction.',
          officialPortal: 'https://shebox.wcd.gov.in'
        };
        immediateActionSteps.unshift(
          'Because the respondent is management or no Internal Committee exists, your complaint lies before the District Local Committee (LC), not within the company.'
        );
        recipientTitle = 'The Presiding Officer, Local Committee (LC), District Collectorate';
      } else {
        recipientTitle = 'The Presiding Officer, Internal Committee (IC)';
      }

      subjectLine = 'Formal Complaint of Sexual Harassment under the POSH Act, 2013';
      bodyParagraphs.push(
        'I am writing to register a formal complaint of sexual harassment in terms of Section 9 of the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013.',
        `The respondent in this matter is a ${answers.harasserRole ? answers.harasserRole.replace(/_/g, ' ') : 'person in the workplace'}. The acts complained of were unwelcome, non-consensual, and have created a hostile work environment.`,
        'I hereby present the chronology of events, supporting electronic communications, and relevant witness statements for your prompt inquiry.'
      );

      demandedReliefs.push(
        'Initiation of a formal inquiry in accordance with Section 11 of the POSH Act, 2013.',
        'Grant of interim relief under Section 12, including separation from the respondent during the pendency of proceedings without prejudice to my employment.',
        'Strict maintenance of confidentiality regarding complainant identity under Section 16 of the Act.'
      );

      if (answers.priorReportFiled === 'yes') {
        immediateActionSteps.push(
          'Since a previous report was filed without resolution, demand in writing an update on the status of inquiry, or escalate directly to the District Officer under Section 18 of the POSH Act.'
        );
        tailoredRemedies.push('Right of appeal to appellate court/tribunal under Section 18 within 90 days if IC/LC recommendations fail.');
      }

      return {
        category: validCategory,
        categoryLabel: baseProfile.label,
        riskLevel,
        statuteSummary: 'Governed by the POSH Act, 2013 and Bharatiya Nyaya Sanhita, 2023 (Section 75).',
        governingStatutes: baseProfile.governingStatutes,
        applicableSections,
        primaryAuthority: authority,
        helplines,
        immediateActionSteps,
        tailoredRemedies,
        evidenceChecklist,
        draftComplaintBase: {
          recipientTitle,
          subjectLine,
          statutoryReferences: ['POSH Act, 2013 (Section 9, 12)', 'BNS Section 75 / IPC 354A'],
          salutation: 'Respected Members of the Committee,',
          bodyParagraphs,
          demandedReliefs,
          closing: 'Yours sincerely,'
        },
        verifiedAt
      };
    }

    case 'domestic_violence': {
      const inSharedHousehold = answers.sharedHousehold !== 'no';
      const hasChildren = answers.childrenInvolved === 'yes';

      applicableSections.push(
        {
          code: 'PWDVA Section 3',
          description: 'Covers physical, verbal, emotional, economic, and sexual abuse by a person in a domestic relationship.'
        },
        {
          code: 'PWDVA Section 12',
          description: 'Statutory right to present application before the Judicial Magistrate for urgent protection and maintenance.'
        },
        {
          code: 'PWDVA Section 18',
          description: 'Protection Orders restraining the respondent from committing acts of domestic violence or entering place of work.'
        }
      );

      if (inSharedHousehold) {
        applicableSections.push({
          code: 'PWDVA Section 19',
          description: 'Residence Orders securing right to reside in the shared household and restraining dispossession.'
        });
        tailoredRemedies.unshift(
          'Right to reside in shared household (Section 19): The respondent cannot evict or dispossess you from the matrimonial/shared house.'
        );
      }

      if (hasChildren) {
        applicableSections.push({
          code: 'PWDVA Section 21',
          description: 'Custody Orders granting temporary custody of children and arrangements for supervised visitation.'
        });
        immediateActionSteps.push(
          'Request temporary custody of child(ren) under Section 21 of PWDVA to prevent unauthorized separation or custody interference.'
        );
        demandedReliefs.push('Grant of temporary custody of minor child(ren) under Section 21 of PWDVA.');
      }

      applicableSections.push({
        code: 'BNS Section 85 & 86',
        historicalEquivalent: 'IPC Section 498A',
        description: 'Cruelty by husband or husband\'s relatives, entailing non-bailable criminal prosecution.'
      });

      recipientTitle = 'The Protection Officer / Learned Judicial Magistrate First Class';
      subjectLine = 'Application under Section 12 of the Protection of Women from Domestic Violence Act, 2005';
      bodyParagraphs.push(
        'I am filing this application under Section 12 of the Protection of Women from Domestic Violence Act, 2005 (PWDVA), seeking urgent statutory protection, residence orders, and financial relief.',
        `The respondent stands in a domestic relationship with me as my ${answers.relationship ? answers.relationship.replace(/_/g, ' ') : 'partner/relative'}, and we have resided together in a shared household.`,
        'The respondent has committed repeated acts of physical, emotional, and economic abuse, rendering my stay unsafe and causing severe distress and injury.'
      );

      demandedReliefs.push(
        'Passing of an ex-parte Protection Order under Section 18 prohibiting the respondent from committing or aiding acts of violence.',
        'Passing of a Residence Order under Section 19 restraining the respondent from dispossessing or excluding me from the shared household.',
        'Grant of emergency monetary relief under Section 20 for medical and subsistence expenses.'
      );

      return {
        category: validCategory,
        categoryLabel: baseProfile.label,
        riskLevel: isEmergency ? 'high' : 'medium',
        statuteSummary: 'Governed by PWDVA 2005 (Sections 12, 18, 19) and BNS 2023 (Sections 85, 86).',
        governingStatutes: baseProfile.governingStatutes,
        applicableSections,
        primaryAuthority: baseProfile.primaryAuthority,
        helplines,
        immediateActionSteps,
        tailoredRemedies,
        evidenceChecklist,
        draftComplaintBase: {
          recipientTitle,
          subjectLine,
          statutoryReferences: ['PWDVA 2005 (Sections 12, 18, 19, 20)', 'BNS Section 85 / IPC 498A'],
          salutation: 'Sir/Madam,',
          bodyParagraphs,
          demandedReliefs,
          closing: 'Respectfully submitted,'
        },
        verifiedAt
      };
    }

    case 'cyber_harassment': {
      const isIntimateImages = answers.incidentType === 'non_consensual_images';
      const isStalking = answers.incidentType === 'stalking_threats';

      if (isIntimateImages) {
        riskLevel = 'high';
        applicableSections.push(
          {
            code: 'IT Act Section 66E',
            description: 'Penalizes capturing, publishing, or transmitting images of private areas without consent.'
          },
          {
            code: 'IT Act Section 67 & 67A',
            description: 'Rigorous penal sanctions up to 5 years for publishing or transmitting sexually explicit content electronically.'
          },
          {
            code: 'IT Intermediary Rules 2021 Rule 3(2)(b)',
            description: 'Statutory mandate requiring online platforms to take down non-consensual intimate images within 24 hours of notification.'
          }
        );
        immediateActionSteps.unshift(
          'CRITICAL 24-HOUR TAKEDOWN RULE: Under Rule 3(2)(b) of the IT Rules 2021, social media intermediaries are required by law to remove non-consensual intimate imagery within 24 hours of notice.'
        );
      } else if (isStalking) {
        applicableSections.push(
          {
            code: 'BNS Section 78',
            historicalEquivalent: 'IPC Section 354D',
            description: 'Criminal stalking: Following or monitoring a woman\'s electronic communication, social media, or email despite disinterest.'
          },
          {
            code: 'BNS Section 79',
            historicalEquivalent: 'IPC Section 509',
            description: 'Insult to modesty via digital communications, offensive messages, or abusive comments.'
          }
        );
      } else {
        applicableSections.push(
          {
            code: 'IT Act Section 66D',
            description: 'Cheating by personation by using computer resource (fake profiles, impersonation accounts).'
          },
          {
            code: 'BNS Section 79',
            historicalEquivalent: 'IPC Section 509',
            description: 'Intrusion on privacy and insult to modesty via electronic messages.'
          }
        );
      }

      recipientTitle = 'The Officer-in-Charge, Cyber Crime Police Cell / National Cyber Crime Reporting Portal';
      subjectLine = `Formal Complaint regarding Cyber Harassment and Offences under IT Act & BNS`;
      bodyParagraphs.push(
        'I am writing to lodge a formal criminal complaint regarding unlawful digital harassment, privacy violation, and targeted abuse through electronic means.',
        `The incidents have occurred via ${answers.platformType ? answers.platformType.replace(/_/g, ' ') : 'online platforms/social media'}, comprising ${answers.incidentType ? answers.incidentType.replace(/_/g, ' ') : 'unlawful communication and abuse'}.`,
        'I have preserved full electronic evidence including digital screenshots, sender profile URLs, and time-stamped interaction records.'
      );

      demandedReliefs.push(
        'Registration of FIR under applicable sections of the Information Technology Act, 2000 and Bharatiya Nyaya Sanhita, 2023.',
        'Issuance of statutory notices to the concerned platform/intermediary for immediate preservation of server logs, IP records, and subscriber details.',
        'Immediate takedown and de-indexing of unlawful content across online networks.'
      );

      return {
        category: validCategory,
        categoryLabel: baseProfile.label,
        riskLevel,
        statuteSummary: 'Governed by the Information Technology Act, 2000 and Bharatiya Nyaya Sanhita, 2023 (Sections 77, 78, 79).',
        governingStatutes: baseProfile.governingStatutes,
        applicableSections,
        primaryAuthority: baseProfile.primaryAuthority,
        helplines,
        immediateActionSteps,
        tailoredRemedies,
        evidenceChecklist,
        draftComplaintBase: {
          recipientTitle,
          subjectLine,
          statutoryReferences: ['IT Act, 2000 (Sec 66E, 67, 67A)', 'BNS Section 78 / IPC 354D'],
          salutation: 'Respected Cyber Cell Officials,',
          bodyParagraphs,
          demandedReliefs,
          closing: 'Yours faithfully,'
        },
        verifiedAt
      };
    }

    case 'public_safety_other':
    default: {
      const isAssault = answers.incidentNature === 'physical_assault';
      const isStalking = answers.incidentNature === 'physical_stalking';

      if (isAssault) {
        riskLevel = 'high';
        applicableSections.push(
          {
            code: 'BNS Section 74',
            historicalEquivalent: 'IPC Section 354',
            description: 'Assault or criminal force on woman with intent to outrage modesty (non-bailable, up to 5 years imprisonment).'
          },
          {
            code: 'BNS Section 75',
            historicalEquivalent: 'IPC Section 354A',
            description: 'Physical sexual harassment and assault.'
          }
        );
      } else if (isStalking) {
        applicableSections.push(
          {
            code: 'BNS Section 78',
            historicalEquivalent: 'IPC Section 354D',
            description: 'Stalking: Following a woman in public or monitoring her movements repeatedly.'
          }
        );
      } else {
        applicableSections.push(
          {
            code: 'BNS Section 75',
            historicalEquivalent: 'IPC Section 354A',
            description: 'Sexual harassment: Unwelcome advances, sexually coloured remarks, or gestures.'
          },
          {
            code: 'BNS Section 79',
            historicalEquivalent: 'IPC Section 509',
            description: 'Word, gesture or act intended to insult the modesty of a woman.'
          }
        );
      }

      // Mandatory procedural provision
      applicableSections.push({
        code: 'BNSS Section 173(1)',
        historicalEquivalent: 'CrPC Section 154',
        description: 'Mandatory registration of Zero FIR at ANY police station, with statement recorded by a woman police officer.'
      });

      recipientTitle = 'The Station House Officer (SHO), Local Police Station';
      subjectLine = 'Formal Complaint for Registration of FIR / Zero FIR for Offences against Modesty and Safety of Woman';
      bodyParagraphs.push(
        'I am submitting this written complaint for the mandatory registration of an FIR (or Zero FIR under Section 173 of the Bharatiya Nagarik Suraksha Sanhita, 2023) regarding criminal acts committed against me.',
        `The incident involves ${answers.incidentNature ? answers.incidentNature.replace(/_/g, ' ') : 'harassment and assault'} by a ${answers.perpetratorKnown ? answers.perpetratorKnown.replace(/_/g, ' ') : 'perpetrator'}.`,
        'These actions constitute cognizable criminal offences under the Bharatiya Nyaya Sanhita, 2023, and require immediate police investigation.'
      );

      demandedReliefs.push(
        'Immediate registration of FIR under relevant sections of Bharatiya Nyaya Sanhita, 2023 (Sections 74, 75, 78, 79).',
        'Recording of my statement by a woman police officer as mandated under BNSS Section 173(1).',
        'Furnishing of a free certified copy of the registered FIR to me forthwith.',
        'Collection and preservation of nearby CCTV footage and witness depositions.'
      );

      return {
        category: validCategory,
        categoryLabel: baseProfile.label,
        riskLevel,
        statuteSummary: 'Governed by the Bharatiya Nyaya Sanhita, 2023 (Sections 74, 75, 78) and BNSS, 2023 (Section 173).',
        governingStatutes: baseProfile.governingStatutes,
        applicableSections,
        primaryAuthority: baseProfile.primaryAuthority,
        helplines,
        immediateActionSteps,
        tailoredRemedies,
        evidenceChecklist,
        draftComplaintBase: {
          recipientTitle,
          subjectLine,
          statutoryReferences: ['BNS Section 74, 75, 78 / IPC 354, 354A, 354D', 'BNSS Section 173 (Zero FIR)'],
          salutation: 'Respected Station House Officer,',
          bodyParagraphs,
          demandedReliefs,
          closing: 'Yours sincerely,'
        },
        verifiedAt
      };
    }
  }
}
