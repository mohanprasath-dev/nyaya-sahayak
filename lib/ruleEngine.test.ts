import { describe, it, expect } from 'vitest';
import { mapContextToGuidance } from './ruleEngine';

describe('lib/ruleEngine - Deterministic Legal Rule Engine', () => {
  describe('Workplace Harassment Category', () => {
    it('maps standard colleague harassment with active IC', () => {
      const result = mapContextToGuidance('workplace_harassment', {
        harasserRole: 'colleague',
        hasInternalCommittee: 'yes',
        priorReportFiled: 'no',
        immediateDanger: 'no'
      });

      expect(result.category).toBe('workplace_harassment');
      expect(result.primaryAuthority.name).toContain('Internal Committee');
      expect(result.draftComplaintBase.recipientTitle).toBe('The Presiding Officer, Internal Committee (IC)');
      expect(result.statuteSummary).toContain('POSH Act, 2013');
      expect(result.applicableSections.some(s => s.code === 'POSH Act Section 4 & 9')).toBe(true);
      expect(result.applicableSections.some(s => s.code === 'POSH Act Section 12')).toBe(true);
      expect(result.helplines.some(h => h.number === '181')).toBe(true);
    });

    it('routes to Local Committee (LC) when respondent is employer or management', () => {
      const result = mapContextToGuidance('workplace_harassment', {
        harasserRole: 'employer_or_management',
        hasInternalCommittee: 'yes'
      });

      expect(result.primaryAuthority.name).toContain('Local Committee (LC)');
      expect(result.draftComplaintBase.recipientTitle).toContain('Local Committee (LC)');
      expect(result.applicableSections.some(s => s.code === 'POSH Act Section 6')).toBe(true);
    });

    it('routes to Local Committee (LC) when establishment has no IC', () => {
      const result = mapContextToGuidance('workplace_harassment', {
        harasserRole: 'colleague',
        hasInternalCommittee: 'no'
      });

      expect(result.primaryAuthority.name).toContain('Local Committee (LC)');
      expect(result.applicableSections.some(s => s.code === 'POSH Act Section 6')).toBe(true);
    });

    it('routes domestic workers to Local Committee (LC) under POSH Act', () => {
      const result = mapContextToGuidance('workplace_harassment', {
        employmentType: 'domestic_worker'
      });

      expect(result.primaryAuthority.name).toContain('Local Committee (LC)');
    });

    it('adds escalation remedies when prior report went unaddressed', () => {
      const result = mapContextToGuidance('workplace_harassment', {
        priorReportFiled: 'yes'
      });

      expect(result.immediateActionSteps.some(s => s.includes('Section 18'))).toBe(true);
      expect(result.tailoredRemedies.some(s => s.includes('Section 18'))).toBe(true);
    });
  });

  describe('Domestic Violence Category', () => {
    it('maps domestic violence with spouse in shared household', () => {
      const result = mapContextToGuidance('domestic_violence', {
        relationship: 'spouse',
        sharedHousehold: 'yes',
        childrenInvolved: 'no'
      });

      expect(result.category).toBe('domestic_violence');
      expect(result.statuteSummary).toContain('PWDVA 2005');
      expect(result.applicableSections.some(s => s.code === 'PWDVA Section 19')).toBe(true); // Residence Order
      expect(result.applicableSections.some(s => s.code === 'BNS Section 85 & 86')).toBe(true); // Cruelty
      expect(result.draftComplaintBase.recipientTitle).toContain('Judicial Magistrate');
      expect(result.helplines.some(h => h.number === '181')).toBe(true);
    });

    it('adds Section 21 child custody order when children are involved', () => {
      const result = mapContextToGuidance('domestic_violence', {
        childrenInvolved: 'yes'
      });

      expect(result.applicableSections.some(s => s.code === 'PWDVA Section 21')).toBe(true);
      expect(result.draftComplaintBase.demandedReliefs.some(r => r.includes('custody'))).toBe(true);
    });

    it('handles non-shared household domestic relationship', () => {
      const result = mapContextToGuidance('domestic_violence', {
        sharedHousehold: 'no'
      });

      expect(result.applicableSections.some(s => s.code === 'PWDVA Section 18')).toBe(true);
      expect(result.applicableSections.some(s => s.code === 'PWDVA Section 19')).toBe(false);
    });
  });

  describe('Cyber Harassment Category', () => {
    it('handles non-consensual images with 24-hour takedown rule and high risk', () => {
      const result = mapContextToGuidance('cyber_harassment', {
        incidentType: 'non_consensual_images',
        platformType: 'social_media',
        evidencePreserved: 'yes'
      });

      expect(result.category).toBe('cyber_harassment');
      expect(result.riskLevel).toBe('high');
      expect(result.applicableSections.some(s => s.code === 'IT Act Section 66E')).toBe(true);
      expect(result.applicableSections.some(s => s.code.includes('IT Intermediary Rules'))).toBe(true);
      expect(result.immediateActionSteps.some(s => s.includes('24 hours'))).toBe(true);
      expect(result.helplines.some(h => h.number === '1930')).toBe(true);
    });

    it('handles digital stalking via messages with BNS Sec 78', () => {
      const result = mapContextToGuidance('cyber_harassment', {
        incidentType: 'stalking_threats',
        platformType: 'messaging_app'
      });

      expect(result.applicableSections.some(s => s.code === 'BNS Section 78')).toBe(true);
      expect(result.applicableSections.some(s => s.code === 'BNS Section 79')).toBe(true);
      expect(result.draftComplaintBase.recipientTitle).toContain('Cyber Crime');
    });

    it('handles impersonation or fake profile offences with IT Act Sec 66D', () => {
      const result = mapContextToGuidance('cyber_harassment', {
        incidentType: 'impersonation_fake_profile'
      });

      expect(result.applicableSections.some(s => s.code === 'IT Act Section 66D')).toBe(true);
    });
  });

  describe('Public Safety & Stalking Category', () => {
    it('handles physical assault with BNS Section 74 and sets high risk', () => {
      const result = mapContextToGuidance('public_safety_other', {
        incidentNature: 'physical_assault',
        perpetratorKnown: 'stranger'
      });

      expect(result.category).toBe('public_safety_other');
      expect(result.riskLevel).toBe('high');
      expect(result.applicableSections.some(s => s.code === 'BNS Section 74')).toBe(true);
      expect(result.applicableSections.some(s => s.code === 'BNSS Section 173(1)')).toBe(true); // Zero FIR
      expect(result.primaryAuthority.name).toContain('Zero FIR');
    });

    it('handles physical stalking with BNS Section 78', () => {
      const result = mapContextToGuidance('public_safety_other', {
        incidentNature: 'physical_stalking'
      });

      expect(result.applicableSections.some(s => s.code === 'BNS Section 78')).toBe(true);
    });

    it('handles verbal harassment and eve teasing with BNS Section 75 and 79', () => {
      const result = mapContextToGuidance('public_safety_other', {
        incidentNature: 'verbal_harassment_eve_teasing'
      });

      expect(result.applicableSections.some(s => s.code === 'BNS Section 75')).toBe(true);
      expect(result.applicableSections.some(s => s.code === 'BNS Section 79')).toBe(true);
    });
  });

  describe('Edge Cases and Safety Overrides', () => {
    it('elevates to high risk and prioritizes 112 when immediateDanger is yes', () => {
      const result = mapContextToGuidance('workplace_harassment', {
        immediateDanger: 'yes'
      });

      expect(result.riskLevel).toBe('high');
      expect(result.helplines[0].number).toBe('112');
      expect(result.immediateActionSteps[0]).toContain('IMMEDIATE SAFETY ALERT: Dial 112');
    });

    it('gracefully handles unknown category by falling back to public safety', () => {
      const result = mapContextToGuidance('non_existent_category');

      expect(result.category).toBe('public_safety_other');
      expect(result.statuteSummary).toContain('Bharatiya Nyaya Sanhita');
      expect(result.applicableSections.length).toBeGreaterThan(0);
    });

    it('handles empty answers gracefully with sensible defaults', () => {
      const result = mapContextToGuidance('domestic_violence', {});

      expect(result.category).toBe('domestic_violence');
      expect(result.applicableSections.length).toBeGreaterThan(0);
      expect(result.helplines.length).toBeGreaterThan(0);
      expect(result.draftComplaintBase.bodyParagraphs.length).toBeGreaterThan(0);
    });
  });
});
