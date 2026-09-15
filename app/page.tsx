'use client';

import React, { useState, useCallback } from 'react';
import { LegalCategory } from '@/lib/lawData';
import { SAMPLE_LEGAL_DOCUMENTS } from '@/lib/documentScanner';
import {
  ApiResponse,
  DocApiResponse,
  CompareApiResponse,
  QaApiResponse
} from '@/types/legal';
import { Header } from '@/components/Header';
import { ProblemStatementBanner } from '@/components/ProblemStatementBanner';
import { SafetyAssistantTab } from '@/components/tabs/SafetyAssistantTab';
import { DocumentScannerTab } from '@/components/tabs/DocumentScannerTab';
import { DocumentComparatorTab } from '@/components/tabs/DocumentComparatorTab';
import { DocumentQATab } from '@/components/tabs/DocumentQATab';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'assistant' | 'docScanner' | 'compare' | 'qa'>('assistant');

  // Tab 1: Assistant state
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

  // Tab 2: Document Scanner state
  const [docContent, setDocContent] = useState('');
  const [isDocLoading, setIsDocLoading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [docResult, setDocResult] = useState<DocApiResponse | null>(null);

  // Tab 3: Comparator state
  const [origText, setOrigText] = useState('');
  const [revText, setRevText] = useState('');
  const [isCompLoading, setIsCompLoading] = useState(false);
  const [compError, setCompError] = useState<string | null>(null);
  const [compResult, setCompResult] = useState<CompareApiResponse | null>(null);

  // Tab 4: Q&A state
  const [qaDocText, setQaDocText] = useState('');
  const [qaQuestion, setQaQuestion] = useState('');
  const [isQaLoading, setIsQaLoading] = useState(false);
  const [qaError, setQaError] = useState<string | null>(null);
  const [qaResult, setQaResult] = useState<QaApiResponse | null>(null);

  // Tab 1 Handlers
  const handleCategorySelect = useCallback((category: LegalCategory) => {
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
  }, []);

  const handleAnswerChange = useCallback((key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleAssistantSubmit = useCallback(async (e: React.FormEvent) => {
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
  }, [selectedCategory, answers, freeText]);

  const handleCopyToClipboard = useCallback(() => {
    if (!result?.guidance.draftLetter) return;
    navigator.clipboard.writeText(result.guidance.draftLetter)
      .then(() => {
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 3000);
      })
      .catch(() => {
        setCopyStatus('idle');
      });
  }, [result]);

  // Tab 2 Handlers
  const handleDocumentSubmit = useCallback(async (e: React.FormEvent) => {
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
      setDocError(err instanceof Error ? err.message : 'Network error during document analysis.');
    } finally {
      setIsDocLoading(false);
    }
  }, [docContent]);

  const handleSelectDocPreset = useCallback((presetId: string) => {
    const found = SAMPLE_LEGAL_DOCUMENTS.find(s => s.id === presetId);
    if (found) {
      setDocContent(found.content);
      setDocError(null);
    }
  }, []);

  // Tab 3 Handlers
  const handleCompareSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (origText.trim().length < 10 || revText.trim().length < 10) {
      setCompError('Please enter at least 10 characters in both clauses to perform a side-by-side comparison.');
      return;
    }

    setIsCompLoading(true);
    setCompError(null);

    try {
      const response = await fetch('/api/compare-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docA: origText.trim(),
          docB: revText.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to compare legal documents.');
      }

      setCompResult(data);
      setTimeout(() => {
        document.getElementById('comp-results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: unknown) {
      setCompError(err instanceof Error ? err.message : 'Network error during clause comparison.');
    } finally {
      setIsCompLoading(false);
    }
  }, [origText, revText]);

  const handleSelectComparePreset = useCallback((presetKey: 'non_compete' | 'posh_gag' | 'liquidated_damages') => {
    setCompError(null);
    if (presetKey === 'non_compete') {
      setOrigText('Employee agrees not to engage in competing business for 24 months post termination anywhere in India.');
      setRevText('Employee agrees to maintain confidentiality of proprietary trade secrets during and after employment.');
    } else if (presetKey === 'posh_gag') {
      setOrigText('Employee shall follow internal dispute escalation before approaching HR.');
      setRevText('Employee shall not disclose any dispute to any external authority, police station, or court under any circumstances.');
    } else if (presetKey === 'liquidated_damages') {
      setOrigText('Employee shall forfeit 6 months gross salary as liquidated damages if resigning before 2 years.');
      setRevText('Either party may terminate employment by serving 30 days notice or pay in lieu thereof.');
    }
  }, []);

  // Tab 4 Handlers
  const handleQaSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (qaDocText.trim().length < 10) {
      setQaError('Please provide document text before asking questions.');
      return;
    }
    if (qaQuestion.trim().length < 5) {
      setQaError('Please enter a question with at least 5 characters.');
      return;
    }

    setIsQaLoading(true);
    setQaError(null);

    try {
      const response = await fetch('/api/document-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: qaDocText.trim(),
          question: qaQuestion.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process document Q&A.');
      }

      setQaResult(data);
      setTimeout(() => {
        document.getElementById('qa-results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: unknown) {
      setQaError(err instanceof Error ? err.message : 'Network error during document Q&A.');
    } finally {
      setIsQaLoading(false);
    }
  }, [qaDocText, qaQuestion]);

  const handleSelectQaPreset = useCallback((presetKey: 'non_compete' | 'deposit_refund' | 'data_retention') => {
    setQaError(null);
    if (presetKey === 'non_compete') {
      setQaQuestion('Can my employer enforce a 24-month non-compete if I quit?');
      setQaDocText(SAMPLE_LEGAL_DOCUMENTS[1].content);
    } else if (presetKey === 'deposit_refund') {
      setQaQuestion('Can my landlord forfeit my full deposit under this lease?');
      setQaDocText(
        'RESIDENTIAL LEASE AGREEMENT: Clause 12: In the event of early termination by the tenant for any reason, the entire security deposit of Rs 150,000 shall be automatically forfeited to the Landlord as liquidated damages.'
      );
    } else if (presetKey === 'data_retention') {
      setQaQuestion('Can the company retain my personal biometric data indefinitely?');
      setQaDocText(
        'DATA COLLECTION TERMS: The company reserves the right to collect, process, and retain all biometric access logs, CCTV feeds, and personal identifiers indefinitely for security and analytics purposes.'
      );
    }
  }, []);

  // Quick launch helper from ProblemStatementBanner
  const handleLaunchPreset = useCallback((
    target: 'simplify_contract' | 'compare_revisions' | 'ask_document' | 'navigate_remedies' | 'flag_posh'
  ) => {
    if (target === 'simplify_contract') {
      setActiveTab('docScanner');
      handleSelectDocPreset('employment_nda');
    } else if (target === 'compare_revisions') {
      setActiveTab('compare');
      handleSelectComparePreset('non_compete');
    } else if (target === 'ask_document') {
      setActiveTab('qa');
      handleSelectQaPreset('non_compete');
    } else if (target === 'navigate_remedies') {
      setActiveTab('assistant');
      handleCategorySelect('workplace_harassment');
      setFreeText('Senior manager threatened adverse appraisal if I refused dinner invitation.');
    } else if (target === 'flag_posh') {
      setActiveTab('docScanner');
      handleSelectDocPreset('workplace_policy');
    }
  }, [handleSelectDocPreset, handleSelectComparePreset, handleSelectQaPreset, handleCategorySelect]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-700 selection:text-white">
      {/* 1. Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-50 bg-teal-600 text-white px-4 py-2 rounded font-bold shadow-lg"
      >
        Skip to main legal content
      </a>

      {/* 2. Top Header with Emergency Directory */}
      <Header />

      {/* 3. Main Content Container */}
      <main id="main-content" className="flex-grow max-w-6xl w-full mx-auto px-4 py-6">
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

        {/* Problem Statement Alignment Showcase Banner */}
        <ProblemStatementBanner
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onLaunchPreset={handleLaunchPreset}
        />

        {/* Tab 1: Guided Legal Safety Assistant */}
        {activeTab === 'assistant' && (
          <SafetyAssistantTab
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            freeText={freeText}
            onFreeTextChange={setFreeText}
            isLoading={isLoading}
            errorMessage={errorMessage}
            result={result}
            copyStatus={copyStatus}
            onSubmit={handleAssistantSubmit}
            onReset={() => { setResult(null); setFreeText(''); }}
            onCopyLetter={handleCopyToClipboard}
          />
        )}

        {/* Tab 2: Document & Clause Scanner */}
        {activeTab === 'docScanner' && (
          <DocumentScannerTab
            docContent={docContent}
            onDocContentChange={setDocContent}
            onSelectPreset={handleSelectDocPreset}
            isDocLoading={isDocLoading}
            docError={docError}
            docResult={docResult}
            onSubmit={handleDocumentSubmit}
            onReset={() => setDocResult(null)}
          />
        )}

        {/* Tab 3: Clause Comparator */}
        {activeTab === 'compare' && (
          <DocumentComparatorTab
            origText={origText}
            onOrigTextChange={setOrigText}
            revText={revText}
            onRevTextChange={setRevText}
            onSelectPreset={handleSelectComparePreset}
            isCompLoading={isCompLoading}
            compError={compError}
            compResult={compResult}
            onSubmit={handleCompareSubmit}
            onReset={() => setCompResult(null)}
          />
        )}

        {/* Tab 4: Document Q&A */}
        {activeTab === 'qa' && (
          <DocumentQATab
            qaDocText={qaDocText}
            onQaDocTextChange={setQaDocText}
            qaQuestion={qaQuestion}
            onQaQuestionChange={setQaQuestion}
            onSelectPreset={handleSelectQaPreset}
            isQaLoading={isQaLoading}
            qaError={qaError}
            qaResult={qaResult}
            onSubmit={handleQaSubmit}
            onReset={() => setQaResult(null)}
          />
        )}
      </main>

      {/* 4. Footer with Statutory Registry and Citations */}
      <Footer />
    </div>
  );
}
