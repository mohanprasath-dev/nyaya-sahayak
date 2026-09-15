/**
 * Nyaya Sahayak - Legal Data Registry
 * Sources last verified: 2026-09-15
 * 
 * Verifiable Indian Legal Frameworks:
 * - Bharatiya Nyaya Sanhita, 2023 (BNS) - In force July 1, 2024
 * - Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS) - In force July 1, 2024
 * - Indian Penal Code, 1860 (IPC) - For retrospective context prior to July 1, 2024
 * - Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 (POSH Act)
 * - Protection of Women from Domestic Violence Act, 2005 (PWDVA)
 * - Information Technology Act, 2000 (IT Act) & IT (Intermediary Guidelines) Rules, 2021
 * 
 * Official Helplines:
 * - 112: All-India Emergency Response Support System (Police, Fire, Ambulance)
 * - 181: National Women Helpline (Toll-Free, 24x7)
 * - 1930: National Cyber Crime Reporting Helpline (cybercrime.gov.in)
 * - 7827170170: National Commission for Women (NCW) 24x7 Helpline
 */

export type LegalCategory =
  | 'workplace_harassment'
  | 'domestic_violence'
  | 'cyber_harassment'
  | 'public_safety_other';

export interface HelplineInfo {
  name: string;
  number: string;
  description: string;
  hours: string;
  actionUrl?: string;
}

export interface LegalStatute {
  title: string;
  actYear: string;
  sections: Array<{
    code: string;
    historicalEquivalent?: string;
    description: string;
  }>;
}

export interface CategoryLegalProfile {
  id: LegalCategory;
  label: string;
  shortDescription: string;
  governingStatutes: LegalStatute[];
  primaryAuthority: {
    name: string;
    description: string;
    escalationAuthority: string;
    officialPortal?: string;
  };
  recommendedHelplines: HelplineInfo[];
  defaultNextSteps: string[];
  evidenceChecklist: string[];
  legalRemedies: string[];
}

export const OFFICIAL_HELPLINES: Record<string, HelplineInfo> = {
  emergency_112: {
    name: 'All-India Emergency Response Support System',
    number: '112',
    description: 'Immediate police dispatch, ambulance, or rescue services nationwide.',
    hours: '24x7 Toll-Free',
    actionUrl: 'tel:112'
  },
  women_181: {
    name: 'National Women Helpline',
    number: '181',
    description: 'Support for women in distress, connecting to One Stop Centres, legal aid, and police.',
    hours: '24x7 Toll-Free',
    actionUrl: 'tel:181'
  },
  cyber_1930: {
    name: 'National Cyber Crime Helpline',
    number: '1930',
    description: 'Ministry of Home Affairs portal for cyber abuse, online harassment, and financial fraud.',
    hours: '24x7 Dedicated',
    actionUrl: 'https://cybercrime.gov.in'
  },
  ncw_helpline: {
    name: 'National Commission for Women (NCW) Helpline',
    number: '7827170170',
    description: 'Round-the-clock grievance redressal and counseling for women facing violence.',
    hours: '24x7 Support',
    actionUrl: 'tel:7827170170'
  }
};

export const LEGAL_REGISTRY: Record<LegalCategory, CategoryLegalProfile> = {
  workplace_harassment: {
    id: 'workplace_harassment',
    label: 'Workplace Sexual Harassment',
    shortDescription: 'Unwelcome physical, verbal, or non-verbal conduct of sexual nature in workplace settings.',
    governingStatutes: [
      {
        title: 'Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act',
        actYear: '2013 (POSH Act)',
        sections: [
          {
            code: 'Section 2(n)',
            description: 'Defines sexual harassment including physical contact, demand for sexual favours, sexually coloured remarks, showing pornography, and unwelcome conduct.'
          },
          {
            code: 'Section 4',
            description: 'Mandates constitution of an Internal Committee (IC) in any establishment with 10 or more employees.'
          },
          {
            code: 'Section 6',
            description: 'Mandates Local Committee (LC) at District level for establishments with under 10 employees or where the complaint is against the employer.'
          },
          {
            code: 'Section 9',
            description: 'Prescribes submitting a written complaint within 3 months of the incident (extendable by another 3 months by IC/LC for justified reasons).'
          },
          {
            code: 'Section 12',
            description: 'Provides interim relief during inquiry: grant of up to 3 months paid leave, transfer of complainant or respondent, or restraining appraisal reporting.'
          }
        ]
      },
      {
        title: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
        actYear: '2023 (In force July 1, 2024)',
        sections: [
          {
            code: 'Section 75',
            historicalEquivalent: 'IPC Section 354A',
            description: 'Sexual harassment criminal provisions (physical contact, demands, remarks) with rigorous imprisonment up to 3 years.'
          },
          {
            code: 'Section 351',
            historicalEquivalent: 'IPC Section 503/506',
            description: 'Criminal intimidation if threatened with employment termination or harm for refusing advances.'
          }
        ]
      }
    ],
    primaryAuthority: {
      name: 'Internal Committee (IC) / Local Committee (LC)',
      description: 'Presided over by a senior woman employee with an independent external member (NGO/legal expert).',
      escalationAuthority: 'District Officer (DM/Collector) or Appellate Court under Section 18 within 90 days.',
      officialPortal: 'https://shebox.wcd.gov.in'
    },
    recommendedHelplines: [
      OFFICIAL_HELPLINES.women_181,
      OFFICIAL_HELPLINES.ncw_helpline,
      OFFICIAL_HELPLINES.emergency_112
    ],
    defaultNextSteps: [
      'Document every incident in writing with exact dates, times, locations, and any witnesses present.',
      'Submit a formal written complaint signed by you (or authorized representative if incapacitated) within 3 months to the Internal Committee.',
      'If your employer has fewer than 10 employees or the complaint is against the employer/owner, file with the District Local Committee (LC).',
      'You can also register a formal complaint on the Ministry of WCD SHe-Box online portal (shebox.wcd.gov.in).',
      'Request interim protection in writing under Section 12 (transfer, leave up to 3 months, or reporting line restructuring).'
    ],
    evidenceChecklist: [
      'Work emails, chat records (Slack, Teams, WhatsApp), and call logs with timestamps.',
      'Performance appraisals or sudden negative changes in feedback following rejection of advances.',
      'Names and contact details of colleagues who witnessed the conduct or to whom you confided immediately after.',
      'Meeting invites, visitor logs, or travel records corroborating your presence at the incident location.'
    ],
    legalRemedies: [
      'Internal inquiry with findings completed within 90 days.',
      'Employer mandated to act on IC recommendations within 60 days of report submission.',
      'Monetary compensation deducted from respondent salary or paid directly under Section 15.',
      'Option to register a police FIR under BNS Section 75 alongside internal proceedings.'
    ]
  },

  domestic_violence: {
    id: 'domestic_violence',
    label: 'Domestic Violence & Abuse',
    shortDescription: 'Physical, emotional, verbal, sexual, or economic abuse within a domestic relationship or shared household.',
    governingStatutes: [
      {
        title: 'Protection of Women from Domestic Violence Act',
        actYear: '2005 (PWDVA)',
        sections: [
          {
            code: 'Section 3',
            description: 'Defines domestic violence expansively to cover physical harm, emotional humiliation, verbal insults, sexual abuse, and economic deprivation.'
          },
          {
            code: 'Section 12',
            description: 'Right to present an application directly to the Judicial Magistrate First Class / Metropolitan Magistrate for reliefs.'
          },
          {
            code: 'Section 18',
            description: 'Protection Orders: Prohibits the respondent from committing, aiding, or abetting acts of domestic violence, entering the workplace, or communicating with the aggrieved woman.'
          },
          {
            code: 'Section 19',
            description: 'Residence Orders: Restrains respondent from dispossessing the woman from the shared household, regardless of legal ownership title.'
          },
          {
            code: 'Section 20 & 22',
            description: 'Monetary relief for medical expenditures and loss of earnings, plus compensation for injuries and mental anguish.'
          },
          {
            code: 'Section 21',
            description: 'Temporary custody orders for children to prevent unilateral removal.'
          }
        ]
      },
      {
        title: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
        actYear: '2023 (In force July 1, 2024)',
        sections: [
          {
            code: 'Section 85 & 86',
            historicalEquivalent: 'IPC Section 498A',
            description: 'Cruelty by husband or relatives of husband, entailing non-bailable imprisonment up to 3 years and fine.'
          }
        ]
      }
    ],
    primaryAuthority: {
      name: 'Protection Officer (PO) & Magistrate Court',
      description: 'Government-appointed Protection Officers in every district tasked with filing Domestic Incident Reports (DIR) and facilitating free legal aid.',
      escalationAuthority: 'Sessions Court (appeal within 30 days of Magistrate order).',
      officialPortal: 'https://nalsa.gov.in'
    },
    recommendedHelplines: [
      OFFICIAL_HELPLINES.women_181,
      OFFICIAL_HELPLINES.emergency_112,
      OFFICIAL_HELPLINES.ncw_helpline
    ],
    defaultNextSteps: [
      'If in immediate physical danger, dial 112 immediately to dispatch the nearest emergency police unit.',
      'Contact the designated District Protection Officer or dial 181 to register a Domestic Incident Report (DIR).',
      'Seek emergency medical care at a government hospital or One Stop Centre (Sakhi Centre); ensure the doctor records a Medico-Legal Certificate (MLC).',
      'File an application under Section 12 PWDVA before the local Magistrate for emergency Protection and Residence orders.',
      'You are entitled to free legal aid through District Legal Services Authority (DLSA / NALSA).'
    ],
    evidenceChecklist: [
      'Medico-Legal Certificate (MLC), hospital records, doctor prescriptions, and photographs of physical injuries.',
      'Audio/video recordings, text messages, or voicemail recordings depicting abuse or threats.',
      'Bank statements, joint account records, or proof of rent payments establishing residence in the shared household.',
      'Marriage certificate, ration card, voter ID, or utility bills establishing domestic relationship.'
    ],
    legalRemedies: [
      'Ex-parte interim Protection Orders under Section 23 preventing any contact or eviction.',
      'Right to reside in the shared household (Section 19) or alternative accommodation paid by respondent.',
      'Monthly maintenance and medical compensation (Section 20 & 22).',
      'Criminal prosecution for cruelty under BNS Section 85.'
    ]
  },

  cyber_harassment: {
    id: 'cyber_harassment',
    label: 'Cyber Harassment & Digital Privacy Violation',
    shortDescription: 'Non-consensual image distribution, online stalking, abusive messages, impersonation, or blackmail.',
    governingStatutes: [
      {
        title: 'Information Technology Act',
        actYear: '2000 (IT Act)',
        sections: [
          {
            code: 'Section 66E',
            description: 'Punishment for violation of privacy: Intentionally capturing, publishing, or transmitting images of private area without consent.'
          },
          {
            code: 'Section 67 & 67A',
            description: 'Transmitting obscene or sexually explicit material electronically, punishable with imprisonment up to 5 years.'
          }
        ]
      },
      {
        title: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
        actYear: '2023 (In force July 1, 2024)',
        sections: [
          {
            code: 'Section 78',
            historicalEquivalent: 'IPC Section 354D',
            description: 'Stalking via internet, email, or other electronic communication to foster personal interaction or monitor internet usage.'
          },
          {
            code: 'Section 77',
            historicalEquivalent: 'IPC Section 354C',
            description: 'Voyeurism: Capturing or disseminating images of a woman engaging in private acts.'
          },
          {
            code: 'Section 79',
            historicalEquivalent: 'IPC Section 509',
            description: 'Word, gesture, or digital communication intended to insult the modesty of a woman.'
          }
        ]
      }
    ],
    primaryAuthority: {
      name: 'National Cyber Crime Reporting Portal & Cyber Police Cell',
      description: 'Specialized state and central cyber cells equipped to trace IP addresses, issue takedown notices to platforms, and preserve digital evidence.',
      escalationAuthority: 'Superintendent of Police (Cyber Crime) / Ministry of Electronics & IT (MeitY)',
      officialPortal: 'https://cybercrime.gov.in'
    },
    recommendedHelplines: [
      OFFICIAL_HELPLINES.cyber_1930,
      OFFICIAL_HELPLINES.women_181,
      OFFICIAL_HELPLINES.emergency_112
    ],
    defaultNextSteps: [
      'Do not delete messages, call logs, or posts. Preserve full uncropped screenshots displaying timestamps, sender URL, and handles.',
      'Report the content immediately on the platform (Instagram, WhatsApp, X, etc.) and save the grievance ticket reference.',
      'File an online complaint on the National Cyber Crime Reporting Portal (cybercrime.gov.in) under the "Report Crime Against Women/Children" section.',
      'Call the dedicated Cyber Helpline 1930 for urgent assistance with tracking and platform coordination.',
      'Under Rule 3(2)(b) of the IT Intermediary Rules 2021, social media platforms are legally required to remove non-consensual intimate images within 24 hours of receipt of notice.'
    ],
    evidenceChecklist: [
      'Uncropped screenshots displaying profile URL, handle name, date, time, and timezone.',
      'Complete raw URL links to offending posts, videos, or profiles (avoid relying solely on usernames).',
      'Email headers (show original headers) if harassment arrived via email.',
      'Copies of takedown requests submitted to platforms and automated acknowledgement tickets.'
    ],
    legalRemedies: [
      'Mandatory platform takedown within 24 hours under IT Rules 2021.',
      'Freezing of sender accounts, IP address subpoena, and seizure of transmitting devices under CrPC/BNSS.',
      'Cognizable criminal charges under IT Act Section 66E/67A and BNS Section 77/78.'
    ]
  },

  public_safety_other: {
    id: 'public_safety_other',
    label: 'Public Safety, Stalking & Outraging Modesty',
    shortDescription: 'Physical stalking, catcalling, molestation, transit harassment, or threats in public or private spaces.',
    governingStatutes: [
      {
        title: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
        actYear: '2023 (In force July 1, 2024)',
        sections: [
          {
            code: 'Section 74',
            historicalEquivalent: 'IPC Section 354',
            description: 'Assault or criminal force on woman with intent to outrage her modesty, punishable with imprisonment from 1 to 5 years.'
          },
          {
            code: 'Section 75',
            historicalEquivalent: 'IPC Section 354A',
            description: 'Sexual harassment: Unwelcome physical contact, sexual demands, or offensive remarks.'
          },
          {
            code: 'Section 76',
            historicalEquivalent: 'IPC Section 354B',
            description: 'Assault or use of criminal force with intent to disrobe or compel to be naked.'
          },
          {
            code: 'Section 78',
            historicalEquivalent: 'IPC Section 354D',
            description: 'Physical stalking: Following a woman or contacting her repeatedly despite clear indication of disinterest.'
          },
          {
            code: 'Section 79',
            historicalEquivalent: 'IPC Section 509',
            description: 'Word, gesture, or sound intended to insult modesty or intrude on privacy.'
          }
        ]
      },
      {
        title: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
        actYear: '2023 (Procedural Code)',
        sections: [
          {
            code: 'Section 173(1)',
            historicalEquivalent: 'CrPC Section 154',
            description: 'Mandates registration of FIR for cognizable offences against women by a woman police officer. Any police station must register a Zero FIR regardless of jurisdiction.'
          },
          {
            code: 'Section 176',
            description: 'Magistrate recording of statement of woman complainant under camera where required.'
          }
        ]
      }
    ],
    primaryAuthority: {
      name: 'Station House Officer (SHO) - Any Police Station (Zero FIR)',
      description: 'Under Indian law, a Zero FIR can be filed at ANY police station irrespective of where the crime occurred. It must subsequently be transferred to the jurisdictional police station.',
      escalationAuthority: 'Superintendent of Police (SP) / Commissioner of Police under BNSS Section 173(4).',
      officialPortal: 'https://digitalpolice.gov.in'
    },
    recommendedHelplines: [
      OFFICIAL_HELPLINES.emergency_112,
      OFFICIAL_HELPLINES.women_181,
      OFFICIAL_HELPLINES.ncw_helpline
    ],
    defaultNextSteps: [
      'If in immediate physical danger, head toward a well-lit, crowded area or commercial establishment and call 112.',
      'Go to the nearest police station to lodge an FIR. You have the right to file a "Zero FIR" at any station regardless of location.',
      'By law under BNSS Section 173(1), your information must be recorded by a woman police officer or woman officer.',
      'Obtain a free copy of the registered FIR immediately after signing — this is your statutory right.',
      'If police refuse to register the FIR, send the substance of information in writing by registered post to the Superintendent of Police (SP).'
    ],
    evidenceChecklist: [
      'Detailed log of dates, times, vehicle registration numbers, and exact locations.',
      'CCTV footage requests from nearby shops, transit stations, or traffic cameras.',
      'Medical examination certificate if any physical contact or injury occurred.',
      'Contact numbers of any eyewitnesses, security guards, or bystanders who intervened.'
    ],
    legalRemedies: [
      'Immediate criminal arrest and bail restrictions under non-bailable BNS sections.',
      'Free certified copy of FIR provided immediately to the complainant.',
      'Free legal representation via District Legal Services Authority (DLSA).'
    ]
  }
};
