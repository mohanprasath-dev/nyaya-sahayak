'use client';

import React from 'react';
import { LegalCategory } from '@/lib/lawData';
import { ApiResponse } from '@/types/legal';

export interface SafetyAssistantTabProps {
  selectedCategory: LegalCategory;
  onSelectCategory: (category: LegalCategory) => void;
  answers: Record<string, string>;
  onAnswerChange: (key: string, value: string) => void;
  freeText: string;
  onFreeTextChange: (text: string) => void;
  isLoading: boolean;
  errorMessage: string | null;
  result: ApiResponse | null;
  copyStatus: 'idle' | 'copied';
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onReset: () => void;
  onCopyLetter: () => void;
}

export const SafetyAssistantTab: React.FC<SafetyAssistantTabProps> = ({
  selectedCategory,
  onSelectCategory,
  answers,
  onAnswerChange,
  freeText,
  onFreeTextChange,
  isLoading,
  errorMessage,
  result,
  copyStatus,
  onSubmit,
  onReset,
  onCopyLetter,
}) => {
  return (
    <div>
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

          <form onSubmit={onSubmit} className="space-y-8">
            <fieldset>
              <legend className="sr-only">Choose a category of incident</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Workplace */}
                <label
                  className={`cursor-pointer rounded-xl border p-5 transition-all flex flex-col justify-between ${
                    selectedCategory === 'workplace_harassment'
                      ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 text-base">Workplace Sexual Harassment</span>
                      <input
                        type="radio"
                        name="category"
                        value="workplace_harassment"
                        checked={selectedCategory === 'workplace_harassment'}
                        onChange={() => onSelectCategory('workplace_harassment')}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                      />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Unwelcome conduct, demands for favours, hostile environment. Governed by POSH Act, 2013 and BNS Section 75.
                    </p>
                  </div>
                  <div className="mt-3 text-xs font-semibold text-teal-800">
                    Authority: Internal Committee (IC) / Local Committee (LC)
                  </div>
                </label>

                {/* Domestic Violence */}
                <label
                  className={`cursor-pointer rounded-xl border p-5 transition-all flex flex-col justify-between ${
                    selectedCategory === 'domestic_violence'
                      ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 text-base">Domestic Violence &amp; Abuse</span>
                      <input
                        type="radio"
                        name="category"
                        value="domestic_violence"
                        checked={selectedCategory === 'domestic_violence'}
                        onChange={() => onSelectCategory('domestic_violence')}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                      />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Physical, emotional, economic abuse in shared household. Governed by PWDVA 2005 and BNS Section 85.
                    </p>
                  </div>
                  <div className="mt-3 text-xs font-semibold text-teal-800">
                    Authority: Protection Officer / Magistrate Court
                  </div>
                </label>

                {/* Cyber Harassment */}
                <label
                  className={`cursor-pointer rounded-xl border p-5 transition-all flex flex-col justify-between ${
                    selectedCategory === 'cyber_harassment'
                      ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 text-base">Cyber Harassment &amp; Privacy</span>
                      <input
                        type="radio"
                        name="category"
                        value="cyber_harassment"
                        checked={selectedCategory === 'cyber_harassment'}
                        onChange={() => onSelectCategory('cyber_harassment')}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                      />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Non-consensual images, digital stalking, impersonation. Governed by IT Act Sec 66E/67 &amp; BNS Sec 78.
                    </p>
                  </div>
                  <div className="mt-3 text-xs font-semibold text-teal-800">
                    Authority: National Cyber Crime Portal / Cyber Cell
                  </div>
                </label>

                {/* Public Safety */}
                <label
                  className={`cursor-pointer rounded-xl border p-5 transition-all flex flex-col justify-between ${
                    selectedCategory === 'public_safety_other'
                      ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 text-base">Public Safety &amp; Stalking</span>
                      <input
                        type="radio"
                        name="category"
                        value="public_safety_other"
                        checked={selectedCategory === 'public_safety_other'}
                        onChange={() => onSelectCategory('public_safety_other')}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                      />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Physical stalking, molestation, catcalling. Governed by BNS Sec 74/75/78 and BNSS Sec 173 (Zero FIR).
                    </p>
                  </div>
                  <div className="mt-3 text-xs font-semibold text-teal-800">
                    Authority: Station House Officer (Zero FIR at any Station)
                  </div>
                </label>
              </div>
            </fieldset>

            {/* Step 2: Context Questions */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Step 2: Contextual Details</h3>
              <p className="text-xs text-slate-600 mb-6">
                These answers determine the correct legal authority and applicable statutory sections.
              </p>

              <div className="space-y-6">
                {selectedCategory === 'workplace_harassment' && (
                  <>
                    <div>
                      <label htmlFor="harasserRole" className="block text-sm font-semibold text-slate-800 mb-2">
                        1. Role of the person involved:
                      </label>
                      <select
                        id="harasserRole"
                        value={answers.harasserRole || 'colleague'}
                        onChange={e => onAnswerChange('harasserRole', e.target.value)}
                        className="w-full md:w-2/3 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-600"
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
                        onChange={e => onAnswerChange('hasInternalCommittee', e.target.value)}
                        className="w-full md:w-2/3 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-600"
                      >
                        <option value="yes">Yes, an active Internal Committee exists (10+ employees)</option>
                        <option value="no">No, company has fewer than 10 employees or no IC formed</option>
                        <option value="unsure">Unsure / Not communicated to employees</option>
                      </select>
                    </div>
                  </>
                )}

                {selectedCategory === 'domestic_violence' && (
                  <>
                    <div>
                      <label htmlFor="relationship" className="block text-sm font-semibold text-slate-800 mb-2">
                        1. Relationship with the respondent:
                      </label>
                      <select
                        id="relationship"
                        value={answers.relationship || 'spouse'}
                        onChange={e => onAnswerChange('relationship', e.target.value)}
                        className="w-full md:w-2/3 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-600"
                      >
                        <option value="spouse">Husband / Spouse</option>
                        <option value="in_laws">In-laws / Relatives of spouse</option>
                        <option value="live_in_partner">Live-in partner</option>
                        <option value="other_relative">Other family relative</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="sharedHousehold" className="block text-sm font-semibold text-slate-800 mb-2">
                        2. Do you reside in a shared household with them?
                      </label>
                      <select
                        id="sharedHousehold"
                        value={answers.sharedHousehold || 'yes'}
                        onChange={e => onAnswerChange('sharedHousehold', e.target.value)}
                        className="w-full md:w-2/3 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-600"
                      >
                        <option value="yes">Yes, living together in shared residence</option>
                        <option value="no">No, living in separate households</option>
                      </select>
                    </div>
                  </>
                )}

                {selectedCategory === 'cyber_harassment' && (
                  <>
                    <div>
                      <label htmlFor="incidentType" className="block text-sm font-semibold text-slate-800 mb-2">
                        1. What specific digital offence occurred?
                      </label>
                      <select
                        id="incidentType"
                        value={answers.incidentType || 'stalking_threats'}
                        onChange={e => onAnswerChange('incidentType', e.target.value)}
                        className="w-full md:w-2/3 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-600"
                      >
                        <option value="non_consensual_images">Non-consensual private photos / intimate imagery</option>
                        <option value="stalking_threats">Online stalking, unwanted messages, or threats</option>
                        <option value="impersonation_fake_profile">Impersonation or fake profile</option>
                        <option value="defamatory_messages">Defamatory messages or cyberbullying</option>
                      </select>
                      {answers.incidentType === 'non_consensual_images' && (
                        <p className="text-xs text-rose-700 font-medium mt-1.5 bg-rose-50 p-2 rounded">
                          Emergency Provision: Under Rule 3(2)(b) of the IT Rules 2021, platforms are legally required to remove non-consensual intimate imagery within 24 hours of notice.
                        </p>
                      )}
                    </div>
                  </>
                )}

                {selectedCategory === 'public_safety_other' && (
                  <>
                    <div>
                      <label htmlFor="incidentNature" className="block text-sm font-semibold text-slate-800 mb-2">
                        1. Nature of the incident in public or transit space:
                      </label>
                      <select
                        id="incidentNature"
                        value={answers.incidentNature || 'verbal_harassment_eve_teasing'}
                        onChange={e => onAnswerChange('incidentNature', e.target.value)}
                        className="w-full md:w-2/3 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-600"
                      >
                        <option value="physical_stalking">Physical stalking (following, persistent tracking)</option>
                        <option value="verbal_harassment_eve_teasing">Verbal harassment, eve-teasing (BNS Sec 79 / IPC 509)</option>
                        <option value="physical_assault">Physical assault, molestation (BNS Sec 74 / IPC 354)</option>
                        <option value="public_transit_incident">Harassment in public transit</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="immediateDanger" className="block text-sm font-semibold text-slate-800 mb-2">
                    Are you currently facing immediate physical threats or violence?
                  </label>
                  <select
                    id="immediateDanger"
                    value={answers.immediateDanger || 'no'}
                    onChange={e => onAnswerChange('immediateDanger', e.target.value)}
                    className="w-full md:w-2/3 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-600"
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
                <span className="text-xs font-mono text-slate-500">
                  {freeText.length} / 500 characters
                </span>
              </div>
              <textarea
                id="freeText"
                rows={3}
                maxLength={500}
                value={freeText}
                onChange={e => onFreeTextChange(e.target.value)}
                placeholder="e.g. On Friday at the office, the respondent made unwelcome remarks and sent messages after hours. When told to stop, they threatened my appraisal."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-600 font-sans"
              />
            </div>

            {errorMessage && (
              <div role="alert" className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
                {errorMessage}
              </div>
            )}

            <div className="border-t border-slate-200 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
                Stateless execution: No data saved or stored.
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full md:w-auto px-6 py-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm transition-colors shadow-xs focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              >
                {isLoading ? 'Analyzing Statutory Protections...' : 'Generate Legal Guidance & Draft Letter'}
              </button>
            </div>
          </form>
        </section>
      ) : (
        /* Results View */
        <div id="results-section" tabIndex={-1} className="space-y-8 focus:outline-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-teal-800">Legal Assistance Summary</span>
              <h2 className="text-xl font-bold text-slate-900">{result.ruleOutput.categoryLabel}</h2>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus:ring-2 focus:ring-teal-600"
            >
              &lt; Start Another Inquiry
            </button>
          </div>

          {result.ruleOutput.riskLevel === 'high' && (
            <div role="alert" className="bg-rose-50 border-l-4 border-rose-600 p-5 rounded-r-xl shadow-xs">
              <div className="flex items-start gap-3">
                <div className="text-rose-700 font-bold text-xl" aria-hidden="true">!</div>
                <div>
                  <h3 className="font-bold text-rose-900 text-base">Immediate Protection Alert</h3>
                  <p className="text-sm text-rose-800 mt-1">
                    Urgent safety concern. Please call <strong>112 (Emergency Police Dispatch)</strong> or <strong>181 (Women Helpline)</strong> immediately.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-6 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-900 mb-2">Personalized Legal Overview</h3>
            <p className="text-slate-800 text-sm md:text-base leading-relaxed">{result.guidance.empatheticSummary}</p>
          </div>

          {/* Citations */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Verified Governing Statutes &amp; Sections</h3>
                <p className="text-xs text-slate-500">Deterministic legal mapping - verified Indian statutory provisions (BNS 2023 &amp; IPC equivalents).</p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-mono">
                Sources verified: {result.ruleOutput.verifiedAt}
              </span>
            </div>

            <div className="space-y-4">
              {result.ruleOutput.applicableSections.map((sec, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="font-bold text-teal-900 text-sm md:text-base">{sec.code}</span>
                    {sec.historicalEquivalent && (
                      <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">
                        Erstwhile {sec.historicalEquivalent}
                      </span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-slate-700 leading-relaxed">{sec.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Authority & Helplines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Competent Authority</h3>
                <h4 className="text-base md:text-lg font-bold text-slate-900 mb-2">{result.ruleOutput.primaryAuthority.name}</h4>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed mb-4">{result.ruleOutput.primaryAuthority.description}</p>
                <p className="text-xs text-slate-500"><strong>Escalation:</strong> {result.ruleOutput.primaryAuthority.escalationAuthority}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Direct Contact Helplines</h3>
              <div className="space-y-3">
                {result.ruleOutput.helplines.map((hl, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
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

          {/* Steps & Complaint */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Step-by-Step Action Roadmap</h3>
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

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Formal Complaint / Notice Template</h3>
                <p className="text-xs text-slate-500">Ready to copy. Fill in bracketed placeholders [in brackets] before signing.</p>
              </div>
              <button
                type="button"
                onClick={onCopyLetter}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition-colors focus:ring-2 focus:ring-teal-500"
              >
                {copyStatus === 'copied' ? '[OK] Copied to Clipboard!' : '[Copy] Copy Letter to Clipboard'}
              </button>
            </div>

            <div className="bg-slate-900 text-slate-100 p-5 rounded-lg overflow-x-auto font-mono text-xs md:text-sm leading-relaxed whitespace-pre-wrap selection:bg-teal-700">
              {result.guidance.draftLetter}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
