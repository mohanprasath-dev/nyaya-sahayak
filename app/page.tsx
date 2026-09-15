'use client';

import React, { useState } from 'react';
import { LegalCategory, HelplineInfo } from '@/lib/lawData';
import { LegalGuidanceResult, ApplicableSection } from '@/lib/ruleEngine';

interface ApiResponse {
  success: boolean;
  ruleOutput: LegalGuidanceResult;
  guidance: {
    empatheticSummary: string;
    plainLanguageSteps: string[];
    draftLetter: string;
  };
  disclaimer: string;
  error?: string;
}

export default function HomePage() {
  // Intake state
  const [selectedCategory, setSelectedCategory] = useState<LegalCategory>('workplace_harassment');
  const [answers, setAnswers] = useState<Record<string, string>>({
    harasserRole: 'colleague',
    hasInternalCommittee: 'yes',
    priorReportFiled: 'no',
    immediateDanger: 'no',
  });
  const [freeText, setFreeText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  // Handle category change and reset category-specific answers to healthy defaults
  const handleCategorySelect = (category: LegalCategory) => {
    setSelectedCategory(category);
    setErrorMessage(null);

    switch (category) {
      case 'workplace_harassment':
        setAnswers({
          harasserRole: 'colleague',
          hasInternalCommittee: 'yes',
          priorReportFiled: 'no',
          immediateDanger: 'no',
        });
        break;
      case 'domestic_violence':
        setAnswers({
          relationship: 'spouse',
          sharedHousehold: 'yes',
          childrenInvolved: 'no',
          immediateDanger: 'no',
        });
        break;
      case 'cyber_harassment':
        setAnswers({
          incidentType: 'stalking_threats',
          platformType: 'social_media',
          evidencePreserved: 'yes',
          immediateDanger: 'no',
        });
        break;
      case 'public_safety_other':
        setAnswers({
          incidentNature: 'verbal_harassment_eve_teasing',
          perpetratorKnown: 'stranger',
          immediateDanger: 'no',
        });
        break;
    }
  };

  const handleAnswerChange = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          answers,
          freeText: freeText.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to retrieve legal guidance. Please try again.');
      }

      setResult(data);
      // Scroll smoothly to results
      setTimeout(() => {
        const resultSection = document.getElementById('results-section');
        if (resultSection) {
          resultSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'A network error occurred.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!result?.guidance.draftLetter) return;
    try {
      await navigator.clipboard.writeText(result.guidance.draftLetter);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2500);
    } catch {
      // Fallback if clipboard API fails
      setCopyStatus('idle');
    }
  };

  const handleReset = () => {
    setResult(null);
    setFreeText('');
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* 1. Emergency Banner */}
      <aside
        aria-label="Emergency Helplines"
        className="bg-rose-900 text-rose-50 px-4 py-2 text-xs md:text-sm font-medium border-b border-rose-800"
      >
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" aria-hidden="true" />
            <strong className="font-semibold tracking-wide uppercase">Emergency 24x7:</strong>
            <span>If you are in immediate danger, dial</span>
            <a
              href="tel:112"
              className="underline font-bold text-white hover:text-rose-200 focus:ring-2 focus:ring-rose-300 rounded px-1"
            >
              112 (Police)
            </a>
            <span>or</span>
            <a
              href="tel:181"
              className="underline font-bold text-white hover:text-rose-200 focus:ring-2 focus:ring-rose-300 rounded px-1"
            >
              181 (Women Helpline)
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="tel:1930"
              className="hover:text-rose-200 focus:ring-2 focus:ring-rose-300 rounded px-1"
            >
              Cyber Crime: <strong>1930</strong>
            </a>
            <a
              href="tel:7827170170"
              className="hover:text-rose-200 focus:ring-2 focus:ring-rose-300 rounded px-1"
            >
              NCW Helpline: <strong>7827170170</strong>
            </a>
          </div>
        </div>
      </aside>

      {/* 2. Header */}
      <header className="bg-white border-b border-slate-200 py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                NS
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  Nyaya Sahayak
                </h1>
                <p className="text-xs md:text-sm font-medium text-teal-800">
                  Women's Legal Safety & Rights Assistant (India)
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Confidential, step-by-step guidance mapping situations to verifiable Indian statutes
              (POSH Act 2013, PWDVA 2005, IT Act 2000, and Bharatiya Nyaya Sanhita 2023).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-600" aria-hidden="true" />
              Verified Indian Statutes (BNS / IPC)
            </span>
          </div>
        </div>
      </header>

      {/* 3. Main Content Container */}
      <main id="main-content" className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
        {/* Accessible live region for status announcements */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {isLoading && 'Analyzing statutory protections and preparing roadmap...'}
          {result && `Guidance ready for ${result.ruleOutput.categoryLabel}.`}
          {copyStatus === 'copied' && 'Formal complaint letter copied to clipboard.'}
        </div>

        {/* Legal Disclaimer Box */}
        <section
          aria-labelledby="disclaimer-heading"
          className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-8 shadow-xs"
        >
          <div className="flex items-start gap-3">
            <div className="text-amber-800 font-bold text-lg" aria-hidden="true">
              !
            </div>
            <div>
              <h2 id="disclaimer-heading" className="text-sm font-bold text-amber-900">
                Statutory Notice & Scope of Information
              </h2>
              <p className="text-xs md:text-sm text-amber-800 mt-1 leading-relaxed">
                Nyaya Sahayak provides procedural legal information, verified statute mappings, and
                self-help complaint drafts. <strong>This is not formal legal advice</strong>, nor does it establish an attorney-client relationship.
                All information is processed statelessly in real-time. No personal details, names, or complaints are stored in any database.
              </p>
            </div>
          </div>
        </section>

        {/* Dynamic Intake Form */}
        {!result ? (
          <section aria-labelledby="intake-heading" className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 md:p-8">
            <div className="border-b border-slate-200 pb-4 mb-6">
              <h2 id="intake-heading" className="text-xl md:text-2xl font-bold text-slate-900">
                Step 1: Select the Legal Category
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Choose the domain that best describes the incident to load specific statutory provisions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Category Grid */}
              <fieldset>
                <legend className="sr-only">Choose a category of incident</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category 1 */}
                  <label
                    className={`cursor-pointer rounded-xl border p-5 transition-all flex flex-col justify-between ${
                      selectedCategory === 'workplace_harassment'
                        ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900 text-base">
                          Workplace Sexual Harassment
                        </span>
                        <input
                          type="radio"
                          name="category"
                          value="workplace_harassment"
                          checked={selectedCategory === 'workplace_harassment'}
                          onChange={() => handleCategorySelect('workplace_harassment')}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                        />
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Unwelcome conduct, demands for favours, hostile work environment. Governed by the POSH Act, 2013 and BNS Section 75.
                      </p>
                    </div>
                    <div className="mt-3 text-xs font-semibold text-teal-800">
                      Authority: Internal Committee (IC) / Local Committee (LC)
                    </div>
                  </label>

                  {/* Category 2 */}
                  <label
                    className={`cursor-pointer rounded-xl border p-5 transition-all flex flex-col justify-between ${
                      selectedCategory === 'domestic_violence'
                        ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900 text-base">
                          Domestic Violence & Abuse
                        </span>
                        <input
                          type="radio"
                          name="category"
                          value="domestic_violence"
                          checked={selectedCategory === 'domestic_violence'}
                          onChange={() => handleCategorySelect('domestic_violence')}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                        />
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Physical, verbal, emotional, economic harm in a shared household. Governed by PWDVA 2005 and BNS Section 85 (erstwhile IPC 498A).
                      </p>
                    </div>
                    <div className="mt-3 text-xs font-semibold text-teal-800">
                      Authority: Protection Officer / Magistrate Court
                    </div>
                  </label>

                  {/* Category 3 */}
                  <label
                    className={`cursor-pointer rounded-xl border p-5 transition-all flex flex-col justify-between ${
                      selectedCategory === 'cyber_harassment'
                        ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900 text-base">
                          Cyber Harassment & Digital Privacy
                        </span>
                        <input
                          type="radio"
                          name="category"
                          value="cyber_harassment"
                          checked={selectedCategory === 'cyber_harassment'}
                          onChange={() => handleCategorySelect('cyber_harassment')}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                        />
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Non-consensual images, digital stalking, impersonation, threats. Governed by IT Act Sec 66E/67 & BNS Sec 78.
                      </p>
                    </div>
                    <div className="mt-3 text-xs font-semibold text-teal-800">
                      Authority: National Cyber Crime Portal / Cyber Police Cell
                    </div>
                  </label>

                  {/* Category 4 */}
                  <label
                    className={`cursor-pointer rounded-xl border p-5 transition-all flex flex-col justify-between ${
                      selectedCategory === 'public_safety_other'
                        ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900 text-base">
                          Public Safety, Stalking & Outrage to Modesty
                        </span>
                        <input
                          type="radio"
                          name="category"
                          value="public_safety_other"
                          checked={selectedCategory === 'public_safety_other'}
                          onChange={() => handleCategorySelect('public_safety_other')}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                        />
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Physical stalking, transit harassment, molestation, catcalling. Governed by BNS Sec 74/75/78 and BNSS Sec 173 (Zero FIR).
                      </p>
                    </div>
                    <div className="mt-3 text-xs font-semibold text-teal-800">
                      Authority: Station House Officer (Zero FIR at any Police Station)
                    </div>
                  </label>
                </div>
              </fieldset>

              {/* Step 2: Context Questions */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Step 2: Contextual Details
                </h3>
                <p className="text-xs text-slate-600 mb-6">
                  These answers determine the correct legal authority and applicable statutory sections.
                </p>

                <div className="space-y-6">
                  {/* Workplace Context Questions */}
                  {selectedCategory === 'workplace_harassment' && (
                    <>
                      <div>
                        <label htmlFor="harasserRole" className="block text-sm font-semibold text-slate-800 mb-2">
                          1. What is the role of the person involved?
                        </label>
                        <select
                          id="harasserRole"
                          value={answers.harasserRole || 'colleague'}
                          onChange={e => handleAnswerChange('harasserRole', e.target.value)}
                          className="w-full md:w-2/3 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                        >
                          <option value="colleague">A peer or co-worker</option>
                          <option value="employer_or_management">The employer, founder, owner, or senior executive</option>
                          <option value="client_or_third_party">A client, vendor, or contractor</option>
                        </select>
                        {answers.harasserRole === 'employer_or_management' && (
                          <p className="text-xs text-amber-700 font-medium mt-1.5 bg-amber-50 p-2 rounded">
                            Statutory Notice: Under Section 6 of the POSH Act, complaints against employers are heard directly by the District Local Committee (LC), not within the company.
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="hasInternalCommittee" className="block text-sm font-semibold text-slate-800 mb-2">
                          2. Does your organization have an Internal Committee (IC)?
                        </label>
                        <select
                          id="hasInternalCommittee"
                          value={answers.hasInternalCommittee || 'yes'}
                          onChange={e => handleAnswerChange('hasInternalCommittee', e.target.value)}
                          className="w-full md:w-2/3 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                        >
                          <option value="yes">Yes, an active Internal Committee exists (10+ employees)</option>
                          <option value="no">No, company has fewer than 10 employees or no IC formed</option>
                          <option value="unsure">Unsure / Not communicated to employees</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="priorReportFiled" className="block text-sm font-semibold text-slate-800 mb-2">
                          3. Have you previously filed a report that went unaddressed?
                        </label>
                        <select
                          id="priorReportFiled"
                          value={answers.priorReportFiled || 'no'}
                          onChange={e => handleAnswerChange('priorReportFiled', e.target.value)}
                          className="w-full md:w-2/3 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                        >
                          <option value="no">No, this is my first formal submission</option>
                          <option value="yes">Yes, previously submitted but no action was taken</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Domestic Violence Context Questions */}
                  {selectedCategory === 'domestic_violence' && (
                    <>
                      <div>
                        <label htmlFor="relationship" className="block text-sm font-semibold text-slate-800 mb-2">
                          1. What is your relationship with the respondent?
                        </label>
                        <select
                          id="relationship"
                          value={answers.relationship || 'spouse'}
                          onChange={e => handleAnswerChange('relationship', e.target.value)}
                          className="w-full md:w-2/3 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                        >
                          <option value="spouse">Husband / Spouse</option>
                          <option value="in_laws">In-laws / Relatives of spouse</option>
                          <option value="live_in_partner">Live-in partner (relationship in the nature of marriage)</option>
                          <option value="other_relative">Other family relative</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="sharedHousehold" className="block text-sm font-semibold text-slate-800 mb-2">
                          2. Do you currently live or have you lived in a shared household with them?
                        </label>
                        <select
                          id="sharedHousehold"
                          value={answers.sharedHousehold || 'yes'}
                          onChange={e => handleAnswerChange('sharedHousehold', e.target.value)}
                          className="w-full md:w-2/3 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                        >
                          <option value="yes">Yes, living together or lived together in a shared residence</option>
                          <option value="no">No, living in separate households</option>
                        </select>
                        <p className="text-xs text-slate-500 mt-1">
                          Section 19 of PWDVA guarantees the right to reside in the shared household regardless of ownership title.
                        </p>
                      </div>

                      <div>
                        <label htmlFor="childrenInvolved" className="block text-sm font-semibold text-slate-800 mb-2">
                          3. Are minor children involved or in your custody?
                        </label>
                        <select
                          id="childrenInvolved"
                          value={answers.childrenInvolved || 'no'}
                          onChange={e => handleAnswerChange('childrenInvolved', e.target.value)}
                          className="w-full md:w-2/3 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                        >
                          <option value="no">No minor children involved</option>
                          <option value="yes">Yes, children are with me or involved</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Cyber Harassment Context Questions */}
                  {selectedCategory === 'cyber_harassment' && (
                    <>
                      <div>
                        <label htmlFor="incidentType" className="block text-sm font-semibold text-slate-800 mb-2">
                          1. What specific digital offence occurred?
                        </label>
                        <select
                          id="incidentType"
                          value={answers.incidentType || 'stalking_threats'}
                          onChange={e => handleAnswerChange('incidentType', e.target.value)}
                          className="w-full md:w-2/3 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                        >
                          <option value="non_consensual_images">Non-consensual private photos / intimate imagery</option>
                          <option value="stalking_threats">Online stalking, continuous unwanted messages, or threats</option>
                          <option value="impersonation_fake_profile">Impersonation, fake profiles, or identity theft</option>
                          <option value="defamatory_messages">Defamatory messages, cyberbullying, or character assassination</option>
                        </select>
                        {answers.incidentType === 'non_consensual_images' && (
                          <p className="text-xs text-rose-700 font-medium mt-1.5 bg-rose-50 p-2 rounded">
                            Emergency Provision: Under Rule 3(2)(b) of the IT Rules 2021, social media platforms are legally required to remove non-consensual intimate imagery within 24 hours of receiving notice.
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="platformType" className="block text-sm font-semibold text-slate-800 mb-2">
                          2. Which platform was used?
                        </label>
                        <select
                          id="platformType"
                          value={answers.platformType || 'social_media'}
                          onChange={e => handleAnswerChange('platformType', e.target.value)}
                          className="w-full md:w-2/3 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                        >
                          <option value="social_media">Social Media (Instagram, Facebook, X / Twitter)</option>
                          <option value="messaging_app">Direct Messaging (WhatsApp, Telegram, Signal)</option>
                          <option value="email">Email</option>
                          <option value="public_website">Public Website or Forum</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="evidencePreserved" className="block text-sm font-semibold text-slate-800 mb-2">
                          3. Have you preserved digital evidence?
                        </label>
                        <select
                          id="evidencePreserved"
                          value={answers.evidencePreserved || 'yes'}
                          onChange={e => handleAnswerChange('evidencePreserved', e.target.value)}
                          className="w-full md:w-2/3 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                        >
                          <option value="yes">Yes, have uncropped screenshots, profile URLs, and chat exports</option>
                          <option value="partial">Some evidence preserved, but need guidance on how to preserve properly</option>
                          <option value="no">No, content was deleted or not yet captured</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Public Safety / Other Context Questions */}
                  {selectedCategory === 'public_safety_other' && (
                    <>
                      <div>
                        <label htmlFor="incidentNature" className="block text-sm font-semibold text-slate-800 mb-2">
                          1. Nature of the incident in public or transit space:
                        </label>
                        <select
                          id="incidentNature"
                          value={answers.incidentNature || 'verbal_harassment_eve_teasing'}
                          onChange={e => handleAnswerChange('incidentNature', e.target.value)}
                          className="w-full md:w-2/3 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                        >
                          <option value="physical_stalking">Physical stalking (following, loitering, persistent tracking)</option>
                          <option value="verbal_harassment_eve_teasing">Verbal harassment, gestures, eve-teasing (BNS Sec 79 / IPC 509)</option>
                          <option value="physical_assault">Physical assault, molestation, or use of force (BNS Sec 74 / IPC 354)</option>
                          <option value="public_transit_incident">Harassment in bus, metro, train, or auto-rickshaw</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="perpetratorKnown" className="block text-sm font-semibold text-slate-800 mb-2">
                          2. Is the perpetrator known to you?
                        </label>
                        <select
                          id="perpetratorKnown"
                          value={answers.perpetratorKnown || 'stranger'}
                          onChange={e => handleAnswerChange('perpetratorKnown', e.target.value)}
                          className="w-full md:w-2/3 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                        >
                          <option value="stranger">An unknown person / stranger</option>
                          <option value="known_person">An acquaintance, neighbor, or known individual</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Common Question: Immediate Safety Risk */}
                  <div>
                    <label htmlFor="immediateDanger" className="block text-sm font-semibold text-slate-800 mb-2">
                      Are you currently facing immediate physical threats or violence?
                    </label>
                    <select
                      id="immediateDanger"
                      value={answers.immediateDanger || 'no'}
                      onChange={e => handleAnswerChange('immediateDanger', e.target.value)}
                      className="w-full md:w-2/3 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                    >
                      <option value="no">No, I am currently in a safe location</option>
                      <option value="yes">Yes, I am in imminent danger or facing active threats</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 3: Optional Free-Text Details */}
              <div className="border-t border-slate-200 pt-6">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="freeText" className="block text-sm font-semibold text-slate-800">
                    Step 3: Incident Context (Optional, max 500 characters)
                  </label>
                  <span
                    className={`text-xs font-mono font-medium ${
                      freeText.length > 450 ? 'text-amber-600 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {freeText.length} / 500 characters
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  You may provide a brief description (dates, key statements). Do not enter passwords, OTPs, or financial details.
                </p>
                <textarea
                  id="freeText"
                  rows={4}
                  maxLength={500}
                  value={freeText}
                  onChange={e => setFreeText(e.target.value)}
                  placeholder="e.g. On Friday at the office, the respondent made unwelcome remarks and sent persistent messages after hours. When told to stop, they threatened my appraisal."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-600 focus:border-teal-600 font-sans"
                />
              </div>

              {/* Error Display */}
              {errorMessage && (
                <div
                  role="alert"
                  className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium"
                >
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <div className="border-t border-slate-200 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
                  Stateless execution: No data saved or stored.
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full md:w-auto px-6 py-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Analyzing Statutory Protections...</span>
                    </>
                  ) : (
                    <span>Generate Legal Guidance & Draft Letter</span>
                  )}
                </button>
              </div>
            </form>
          </section>
        ) : (
          /* Results View */
          <div id="results-section" tabIndex={-1} className="space-y-8 focus:outline-none">
            {/* Top Bar with Return Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-teal-800">
                  Legal Assistance Summary
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  {result.ruleOutput.categoryLabel}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus:ring-2 focus:ring-teal-600"
              >
                &lt; Start Another Inquiry
              </button>
            </div>

            {/* High Risk Alert if Applicable */}
            {result.ruleOutput.riskLevel === 'high' && (
              <div
                role="alert"
                className="bg-rose-50 border-l-4 border-rose-600 p-5 rounded-r-xl shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="text-rose-700 font-bold text-xl" aria-hidden="true">
                    !
                  </div>
                  <div>
                    <h3 className="font-bold text-rose-900 text-base">
                      Immediate Protection Alert
                    </h3>
                    <p className="text-sm text-rose-800 mt-1">
                      Your situation involves urgent safety concerns. Please do not wait. Call <strong>112 (Emergency Police Dispatch)</strong> or <strong>181 (Women Helpline)</strong> immediately. You are entitled to immediate police assistance and safe shelter.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Empathetic Summary Card */}
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-6 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-teal-900 mb-2">
                Personalized Legal Overview
              </h3>
              <p className="text-slate-800 text-sm md:text-base leading-relaxed">
                {result.guidance.empatheticSummary}
              </p>
            </div>

            {/* 4. Verified Legal Citations Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Verified Governing Statutes & Sections
                  </h3>
                  <p className="text-xs text-slate-500">
                    Deterministic legal mapping - verified Indian statutory provisions (BNS 2023 & IPC equivalents).
                  </p>
                </div>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-mono">
                  Sources verified: {result.ruleOutput.verifiedAt}
                </span>
              </div>

              <div className="space-y-4">
                {result.ruleOutput.applicableSections.map((sec, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-bold text-teal-900 text-sm md:text-base">
                        {sec.code}
                      </span>
                      {sec.historicalEquivalent && (
                        <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">
                          Erstwhile {sec.historicalEquivalent}
                        </span>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                      {sec.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Competent Authority & Official Portals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Competent Redressal Authority
                  </h3>
                  <h4 className="text-base md:text-lg font-bold text-slate-900 mb-2">
                    {result.ruleOutput.primaryAuthority.name}
                  </h4>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed mb-4">
                    {result.ruleOutput.primaryAuthority.description}
                  </p>
                  <p className="text-xs text-slate-500">
                    <strong>Escalation Path:</strong> {result.ruleOutput.primaryAuthority.escalationAuthority}
                  </p>
                </div>

                {result.ruleOutput.primaryAuthority.officialPortal && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <a
                      href={result.ruleOutput.primaryAuthority.officialPortal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-semibold text-teal-700 hover:text-teal-800 underline"
                    >
                      Visit Official Portal ({result.ruleOutput.primaryAuthority.officialPortal.replace('https://', '')}) -&gt;
                    </a>
                  </div>
                )}
              </div>

              {/* Helplines for this category */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Direct Contact Helplines
                </h3>
                <div className="space-y-3">
                  {result.ruleOutput.helplines.map((hl, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50"
                    >
                      <div>
                        <div className="text-sm font-bold text-slate-900">{hl.name}</div>
                        <div className="text-xs text-slate-500">{hl.hours}</div>
                      </div>
                      <a
                        href={hl.actionUrl || `tel:${hl.number}`}
                        className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-bold transition-colors focus:ring-2 focus:ring-teal-500"
                      >
                        Call {hl.number}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 6. Step-by-Step Action Roadmap */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Step-by-Step Action Roadmap
              </h3>
              <ol className="space-y-3">
                {result.guidance.plainLanguageSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-800">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* 7. Draft Formal Complaint Letter */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Formal Complaint / Notice Template
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ready to copy. Fill in bracketed placeholders [in brackets] before signing and submitting.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyToClipboard}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition-colors focus:ring-2 focus:ring-teal-500"
                >
                  {copyStatus === 'copied' ? (
                    <>
                      <span aria-hidden="true">[OK]</span>
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <span aria-hidden="true">[Copy]</span>
                      <span>Copy Letter to Clipboard</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-900 text-slate-100 p-5 rounded-lg overflow-x-auto font-mono text-xs md:text-sm leading-relaxed whitespace-pre-wrap selection:bg-teal-700">
                {result.guidance.draftLetter}
              </div>
            </div>

            {/* 8. Evidence Checklist & Legal Remedies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="text-teal-700 font-semibold" aria-hidden="true">[Evidence]</span>
                  <span>Evidence Checklist</span>
                </h3>
                <ul className="space-y-2 text-xs md:text-sm text-slate-700">
                  {result.ruleOutput.evidenceChecklist.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-teal-700 font-bold">-</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="text-teal-700 font-semibold" aria-hidden="true">[Remedies]</span>
                  <span>Statutory Legal Remedies Available</span>
                </h3>
                <ul className="space-y-2 text-xs md:text-sm text-slate-700">
                  {result.ruleOutput.tailoredRemedies.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-teal-700 font-bold">-</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="bg-slate-100 border border-slate-200 rounded-xl p-5 text-center">
              <p className="text-xs text-slate-600 mb-3">
                Need to explore another scenario or check guidance for another category?
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm rounded-lg transition-colors shadow-xs focus:ring-2 focus:ring-teal-500"
              >
                Start a New Inquiry
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 9. Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="font-semibold text-slate-200">
              Nyaya Sahayak - Women's Legal Safety & Rights Assistant
            </p>
            <p className="text-slate-400 mt-1">
              Stateless Architecture: No data is saved to a server or third-party storage. All citations based on active Indian statutes.
            </p>
          </div>
          <div className="text-center md:text-right">
            <p>Built for HackToSkill x Google Hackathon</p>
            <p className="text-slate-500 mt-0.5">Challenge: AI for Legal Assistance & Access</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
