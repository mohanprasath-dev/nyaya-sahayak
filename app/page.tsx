'use client';

import React, { useState } from 'react';
import { LegalCategory } from '@/lib/lawData';
import { LegalGuidanceResult } from '@/lib/ruleEngine';
import {
  DocumentAnalysisResult,
  SAMPLE_LEGAL_DOCUMENTS
} from '@/lib/documentScanner';
import { ClauseComparisonResult } from '@/lib/documentComparator';
import { DocumentQAResult } from '@/lib/documentQA';

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

interface DocApiResponse {
  success: boolean;
  analysis: DocumentAnalysisResult;
  disclaimer: string;
  error?: string;
}

interface CompareApiResponse {
  success: boolean;
  comparison: ClauseComparisonResult;
  error?: string;
}

interface QaApiResponse {
  success: boolean;
  qa: DocumentQAResult;
  error?: string;
}

export default function HomePage() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'assistant' | 'docScanner' | 'compare' | 'qa'>('assistant');

  // Assistant state
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

  // Document Scanner state
  const [docContent, setDocContent] = useState('');
  const [isDocLoading, setIsDocLoading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [docResult, setDocResult] = useState<DocApiResponse | null>(null);

  // Comparator state
  const [origText, setOrigText] = useState('');
  const [revText, setRevText] = useState('');
  const [isCompLoading, setIsCompLoading] = useState(false);
  const [compError, setCompError] = useState<string | null>(null);
  const [compResult, setCompResult] = useState<CompareApiResponse | null>(null);

  // Q&A state
  const [qaDocText, setQaDocText] = useState('');
  const [qaQuestion, setQaQuestion] = useState('');
  const [isQaLoading, setIsQaLoading] = useState(false);
  const [qaError, setQaError] = useState<string | null>(null);
  const [qaResult, setQaResult] = useState<QaApiResponse | null>(null);

  // Handle category change
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
        throw new Error(data.error || 'Failed to retrieve legal guidance.');
      }

      setResult(data);
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'A network error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (docContent.trim().length < 20) {
      setDocError('Please provide at least 20 characters of legal text or select a sample preset.');
      return;
    }

    setIsDocLoading(true);
    setDocError(null);

    try {
      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: docContent.trim() })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze legal document.');
      }

      setDocResult(data);
      setTimeout(() => {
        document.getElementById('doc-results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: unknown) {
      setDocError(err instanceof Error ? err.message : 'A network error occurred.');
    } finally {
      setIsDocLoading(false);
    }
  };

  const handleCompareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (origText.trim().length < 10 || revText.trim().length < 10) {
      setCompError('Please provide at least 10 characters for both original and revised clauses.');
      return;
    }

    setIsCompLoading(true);
    setCompError(null);

    try {
      const response = await fetch('/api/compare-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalText: origText.trim(), revisedText: revText.trim() })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to compare clauses.');
      }

      setCompResult(data);
      setTimeout(() => {
        document.getElementById('comp-results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: unknown) {
      setCompError(err instanceof Error ? err.message : 'Comparison request failed.');
    } finally {
      setIsCompLoading(false);
    }
  };

  const handleQaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (qaDocText.trim().length < 15 || qaQuestion.trim().length < 5) {
      setQaError('Please provide both the legal document text and a specific question.');
      return;
    }

    setIsQaLoading(true);
    setQaError(null);

    try {
      const response = await fetch('/api/document-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentContent: qaDocText.trim(), question: qaQuestion.trim() })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to answer legal query.');
      }

      setQaResult(data);
      setTimeout(() => {
        document.getElementById('qa-results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: unknown) {
      setQaError(err instanceof Error ? err.message : 'Q&A request failed.');
    } finally {
      setIsQaLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!result?.guidance.draftLetter) return;
    try {
      await navigator.clipboard.writeText(result.guidance.draftLetter);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2500);
    } catch {
      setCopyStatus('idle');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      {/* 1. Emergency Banner */}
      <aside
        aria-label="Emergency Helplines"
        className="bg-rose-900 text-rose-50 px-4 py-2 text-xs md:text-sm font-medium border-b border-rose-800"
      >
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" aria-hidden="true" />
            <strong className="font-semibold tracking-wide uppercase">Emergency 24x7:</strong>
            <span>If in immediate danger, dial</span>
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
            <a href="tel:1930" className="hover:text-rose-200 focus:ring-2 focus:ring-rose-300 rounded px-1">
              Cyber Crime: <strong>1930</strong>
            </a>
            <a href="tel:7827170170" className="hover:text-rose-200 focus:ring-2 focus:ring-rose-300 rounded px-1">
              NCW Helpline: <strong>7827170170</strong>
            </a>
          </div>
        </div>
      </aside>

      {/* 2. Header */}
      <header className="bg-white border-b border-slate-200 py-5 px-4 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                NS
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  Nyaya Sahayak
                </h1>
                <p className="text-xs md:text-sm font-medium text-teal-800">
                  AI for Legal Assistance &amp; Access (India)
                </p>
              </div>
            </div>
            <p className="text-xs md:text-sm text-slate-600 mt-2 max-w-2xl">
              Navigate statutory rights, scan legal contracts, compare clause versions, and query documents against Indian legislation.
            </p>
          </div>

          {/* Tab Navigation */}
          <nav aria-label="Main Capabilities" className="flex flex-wrap items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'assistant'}
              onClick={() => setActiveTab('assistant')}
              className={`px-3 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-teal-600 ${
                activeTab === 'assistant'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Guided Safety Assistant
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'docScanner'}
              onClick={() => setActiveTab('docScanner')}
              className={`px-3 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-teal-600 ${
                activeTab === 'docScanner'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Document &amp; Clause Scanner
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'compare'}
              onClick={() => setActiveTab('compare')}
              className={`px-3 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-teal-600 ${
                activeTab === 'compare'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3. Clause Comparator
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'qa'}
              onClick={() => setActiveTab('qa')}
              className={`px-3 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-teal-600 ${
                activeTab === 'qa'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              4. Document Q&amp;A
            </button>
          </nav>
        </div>
      </header>

      {/* 3. Main Content Container */}
      <main id="main-content" className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
        {/* Accessible live region for status announcements */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {isLoading && 'Analyzing statutory protections and preparing roadmap...'}
          {isDocLoading && 'Analyzing legal document and scanning for statutory risks...'}
          {isCompLoading && 'Comparing legal clauses and calculating risk delta...'}
          {isQaLoading && 'Evaluating question against document and Indian law...'}
          {result && `Guidance ready for ${result.ruleOutput.categoryLabel}.`}
          {docResult && `Document review ready for ${docResult.analysis.documentType}.`}
          {compResult && `Comparison completed: ${compResult.comparison.riskDelta} risk delta.`}
          {qaResult && 'Answer ready for your question.'}
          {copyStatus === 'copied' && 'Formal complaint letter copied to clipboard.'}
        </div>

        {/* Legal Disclaimer Box */}
        <section
          aria-labelledby="disclaimer-heading"
          className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-8 shadow-xs"
        >
          <div className="flex items-start gap-3">
            <div className="text-amber-800 font-bold text-lg" aria-hidden="true">!</div>
            <div>
              <h2 id="disclaimer-heading" className="text-sm font-bold text-amber-900">
                Statutory Notice &amp; Scope of Information
              </h2>
              <p className="text-xs md:text-sm text-amber-800 mt-1 leading-relaxed">
                Nyaya Sahayak provides procedural legal information, verified statute mappings, contract risk evaluations, and
                self-help complaint drafts. <strong>This is not formal legal advice</strong>. All information is processed statelessly in real-time. Zero personal data or documents are stored.
              </p>
            </div>
          </div>
        </section>

        {/* TAB 1: GUIDED LEGAL SAFETY ASSISTANT */}
        {activeTab === 'assistant' && (
          <>
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
                              onChange={() => handleCategorySelect('workplace_harassment')}
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
                              onChange={() => handleCategorySelect('domestic_violence')}
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
                              onChange={() => handleCategorySelect('cyber_harassment')}
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
                              onChange={() => handleCategorySelect('public_safety_other')}
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
                              onChange={e => handleAnswerChange('harasserRole', e.target.value)}
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
                              onChange={e => handleAnswerChange('hasInternalCommittee', e.target.value)}
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
                              onChange={e => handleAnswerChange('relationship', e.target.value)}
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
                              onChange={e => handleAnswerChange('sharedHousehold', e.target.value)}
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
                              onChange={e => handleAnswerChange('incidentType', e.target.value)}
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
                              onChange={e => handleAnswerChange('incidentNature', e.target.value)}
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
                          onChange={e => handleAnswerChange('immediateDanger', e.target.value)}
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
                      onChange={e => setFreeText(e.target.value)}
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
                    onClick={() => { setResult(null); setFreeText(''); }}
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
                      onClick={handleCopyToClipboard}
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
          </>
        )}

        {/* TAB 2: DOCUMENT & CLAUSE SCANNER */}
        {activeTab === 'docScanner' && (
          <div className="space-y-8">
            <section aria-labelledby="doc-scanner-heading" className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 md:p-8">
              <div className="border-b border-slate-200 pb-4 mb-6">
                <h2 id="doc-scanner-heading" className="text-xl md:text-2xl font-bold text-slate-900">
                  Legal Document &amp; Policy Scanner
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Paste agreements or policies to translate legalese, identify statutory red flags, and generate questions for your lawyer.
                </p>
              </div>

              {/* Sample selector */}
              <div className="mb-6">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Quick test presets:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SAMPLE_LEGAL_DOCUMENTS.map(sample => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => { setDocContent(sample.content); setDocError(null); }}
                      className="p-3 text-left rounded-lg border border-slate-200 hover:border-teal-600 hover:bg-teal-50/50 transition-all text-xs focus:ring-2 focus:ring-teal-600"
                    >
                      <div className="font-bold text-slate-900 mb-1">{sample.title}</div>
                      <div className="text-slate-500 text-2xs">{sample.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleDocumentSubmit} className="space-y-6">
                <div>
                  <label htmlFor="docText" className="block text-sm font-semibold text-slate-800 mb-2">
                    Document Text ({docContent.length} characters):
                  </label>
                  <textarea
                    id="docText"
                    rows={8}
                    maxLength={5000}
                    value={docContent}
                    onChange={e => setDocContent(e.target.value)}
                    placeholder="Paste legal clauses or agreement text here..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs md:text-sm font-mono bg-white focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                {docError && (
                  <div role="alert" className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
                    {docError}
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  {docContent && (
                    <button
                      type="button"
                      onClick={() => setDocContent('')}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isDocLoading || docContent.trim().length === 0}
                    className="px-6 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm transition-colors shadow-xs focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                  >
                    {isDocLoading ? 'Scanning Clauses...' : 'Simplify Document & Scan Risks'}
                  </button>
                </div>
              </form>
            </section>

            {docResult && (
              <div id="doc-results-section" tabIndex={-1} className="space-y-6 focus:outline-none">
                <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-teal-800">
                      {docResult.analysis.overallRiskLevel.toUpperCase()} RISK
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">{docResult.analysis.documentType}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDocResult(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    &lt; Clear &amp; Scan Another
                  </button>
                </div>

                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-6 shadow-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 mb-2">Plain Language Explanation</h4>
                  <p className="text-slate-800 text-sm md:text-base leading-relaxed">{docResult.analysis.plainSummary}</p>
                </div>

                {docResult.analysis.flaggedRisks.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                    <h4 className="text-base font-bold text-slate-900 mb-4">
                      Flagged Risks ({docResult.analysis.flaggedRisks.length})
                    </h4>
                    <div className="space-y-4">
                      {docResult.analysis.flaggedRisks.map((risk, i) => (
                        <div key={i} className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                          <div className="flex justify-between">
                            <span className="font-bold text-sm text-slate-900">{risk.category}</span>
                            <span className="text-2xs uppercase font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                              {risk.severity}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700"><strong>Statute:</strong> {risk.statutoryIssue}</p>
                          <p className="text-xs text-slate-700"><strong>Meaning:</strong> {risk.plainExplanation}</p>
                          <p className="text-xs text-teal-800 font-semibold"><strong>Action:</strong> {risk.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                  <h4 className="text-base font-bold text-slate-900 mb-2">Questions for Your Advocate</h4>
                  <ol className="space-y-2 text-xs md:text-sm text-slate-800">
                    {docResult.analysis.questionsForLawyer.map((q, i) => (
                      <li key={i} className="p-2.5 rounded bg-slate-50 border border-slate-200">
                        {i + 1}. {q}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CLAUSE COMPARATOR */}
        {activeTab === 'compare' && (
          <div className="space-y-8">
            <section aria-labelledby="compare-heading" className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 md:p-8">
              <div className="border-b border-slate-200 pb-4 mb-6">
                <h2 id="compare-heading" className="text-xl md:text-2xl font-bold text-slate-900">
                  Side-by-Side Clause &amp; Contract Comparator
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Compare an original contract clause against a revised version or statutory standard to detect risk shifts, added liabilities, or removed rights.
                </p>
              </div>

              {/* Sample comparison presets */}
              <div className="mb-6">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Sample comparison presets:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setOrigText('Employee agrees not to engage in competing business for 24 months post termination anywhere in India.');
                      setRevText('Employee agrees to maintain confidentiality of proprietary trade secrets during and after employment.');
                      setCompError(null);
                    }}
                    className="p-3 text-left rounded-lg border border-slate-200 hover:border-teal-600 hover:bg-teal-50/50 transition-all text-xs"
                  >
                    <div className="font-bold text-slate-900">1. Removal of Restrictive Non-Compete</div>
                    <div className="text-slate-500 text-2xs">Original has 24-mo non-compete; Revised removes it.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOrigText('Employee shall follow internal dispute escalation before approaching HR.');
                      setRevText('Employee shall not disclose any dispute to any external authority, police station, or court under any circumstances.');
                      setCompError(null);
                    }}
                    className="p-3 text-left rounded-lg border border-slate-200 hover:border-teal-600 hover:bg-teal-50/50 transition-all text-xs"
                  >
                    <div className="font-bold text-slate-900">2. Introduction of Reporting Gag Clause</div>
                    <div className="text-slate-500 text-2xs">Revised version introduces unlawful reporting gag.</div>
                  </button>
                </div>
              </div>

              <form onSubmit={handleCompareSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="origClause" className="block text-sm font-semibold text-slate-800 mb-2">
                      Original Clause / Version A:
                    </label>
                    <textarea
                      id="origClause"
                      rows={6}
                      maxLength={5000}
                      value={origText}
                      onChange={e => setOrigText(e.target.value)}
                      placeholder="Paste Version A text..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label htmlFor="revClause" className="block text-sm font-semibold text-slate-800 mb-2">
                      Revised Clause / Version B:
                    </label>
                    <textarea
                      id="revClause"
                      rows={6}
                      maxLength={5000}
                      value={revText}
                      onChange={e => setRevText(e.target.value)}
                      placeholder="Paste Version B text..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                </div>

                {compError && (
                  <div role="alert" className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
                    {compError}
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    type="submit"
                    disabled={isCompLoading || origText.length === 0 || revText.length === 0}
                    className="px-6 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm transition-colors shadow-xs focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                  >
                    {isCompLoading ? 'Comparing Clauses...' : 'Compare Clauses & Highlight Risk Delta'}
                  </button>
                </div>
              </form>
            </section>

            {compResult && (
              <div id="comp-results-section" tabIndex={-1} className="space-y-6 focus:outline-none">
                <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <div>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        compResult.comparison.riskDelta === 'improved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : compResult.comparison.riskDelta === 'worsened'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      Risk Delta: {compResult.comparison.riskDelta.toUpperCase()}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      Textual Alignment: {compResult.comparison.similarityScore}%
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCompResult(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    &lt; Clear Comparison
                  </button>
                </div>

                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-6 shadow-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 mb-2">Comparison Overview</h4>
                  <p className="text-slate-800 text-sm md:text-base leading-relaxed">{compResult.comparison.plainSummary}</p>
                  <p className="text-xs font-semibold text-teal-800 mt-2">
                    <strong>Recommended Action:</strong> {compResult.comparison.recommendedAction}
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                  <h4 className="text-base font-bold text-slate-900 mb-4">Detailed Differences &amp; Legal Impacts</h4>
                  <div className="space-y-4">
                    {compResult.comparison.differences.map((diff, i) => (
                      <div key={i} className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-2xs uppercase font-bold px-2 py-0.5 rounded ${
                              diff.type === 'removed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : diff.type === 'added'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {diff.type}
                          </span>
                          <span className="font-bold text-sm text-slate-900">{diff.title}</span>
                        </div>
                        <p className="text-xs text-slate-700">{diff.description}</p>
                        <p className="text-xs text-teal-800 font-semibold">{diff.legalImpact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DOCUMENT Q&A */}
        {activeTab === 'qa' && (
          <div className="space-y-8">
            <section aria-labelledby="qa-heading" className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 md:p-8">
              <div className="border-b border-slate-200 pb-4 mb-6">
                <h2 id="qa-heading" className="text-xl md:text-2xl font-bold text-slate-900">
                  Interactive Legal Document Q&amp;A
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Ask specific questions about your agreement or policy to receive direct, plain-language answers cross-referenced with Indian law.
                </p>
              </div>

              {/* Sample questions */}
              <div className="mb-6">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Common sample questions:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Can my employer enforce a 24-month non-compete if I quit?',
                    'Can the company stop me from reporting harassment to the police?',
                    'Can they deduct liquidated damages from my final settlement?'
                  ].map((q, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setQaQuestion(q);
                        if (!qaDocText) {
                          setQaDocText(SAMPLE_LEGAL_DOCUMENTS[1].content);
                        }
                      }}
                      className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 text-xs text-slate-700 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleQaSubmit} className="space-y-6">
                <div>
                  <label htmlFor="qaDoc" className="block text-sm font-semibold text-slate-800 mb-2">
                    Legal Document Excerpt:
                  </label>
                  <textarea
                    id="qaDoc"
                    rows={5}
                    maxLength={5000}
                    value={qaDocText}
                    onChange={e => setQaDocText(e.target.value)}
                    placeholder="Paste the agreement or policy text..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label htmlFor="qaQuestionInput" className="block text-sm font-semibold text-slate-800 mb-2">
                    Your Question:
                  </label>
                  <input
                    id="qaQuestionInput"
                    type="text"
                    maxLength={300}
                    value={qaQuestion}
                    onChange={e => setQaQuestion(e.target.value)}
                    placeholder="e.g. Can my employer fire me under this clause if I lodge a complaint?"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                {qaError && (
                  <div role="alert" className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
                    {qaError}
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    type="submit"
                    disabled={isQaLoading || qaDocText.length === 0 || qaQuestion.length === 0}
                    className="px-6 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm transition-colors shadow-xs focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                  >
                    {isQaLoading ? 'Analyzing Document...' : 'Ask Document Question'}
                  </button>
                </div>
              </form>
            </section>

            {qaResult && (
              <div id="qa-results-section" tabIndex={-1} className="space-y-6 focus:outline-none">
                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-6 shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-900">Direct Answer</span>
                  <p className="text-slate-900 text-base font-semibold mt-1 leading-relaxed">
                    {qaResult.qa.directAnswer}
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Statutory Benchmark &amp; Precedents
                    </h4>
                    <p className="text-xs md:text-sm text-slate-800 leading-relaxed font-mono bg-slate-50 p-3 rounded border border-slate-200">
                      {qaResult.qa.statutoryGrounding}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Relevant Clause Excerpt
                    </h4>
                    <p className="text-xs md:text-sm text-slate-700 italic">
                      &quot;{qaResult.qa.relevantClauseExcerpt}&quot;
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r text-xs text-amber-900">
                    <strong>Cautionary Note:</strong> {qaResult.qa.cautionaryAdvice}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 9. Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="font-semibold text-slate-200">
              Nyaya Sahayak - Women&apos;s Legal Safety &amp; Rights Assistant
            </p>
            <p className="text-slate-400 mt-1">
              Stateless Architecture: No data is saved to a server or third-party storage. All citations based on active Indian statutes.
            </p>
          </div>
          <div className="text-center md:text-right">
            <p>Built for HackToSkill x Google Hackathon</p>
            <p className="text-slate-500 mt-0.5">Challenge: AI for Legal Assistance &amp; Access</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
