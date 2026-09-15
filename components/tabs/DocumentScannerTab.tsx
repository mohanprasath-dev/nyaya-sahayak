'use client';

import React from 'react';
import { SAMPLE_LEGAL_DOCUMENTS } from '@/lib/documentScanner';
import { DocApiResponse } from '@/types/legal';

export interface DocumentScannerTabProps {
  docContent: string;
  onDocContentChange: (content: string) => void;
  onSelectPreset: (presetId: string) => void;
  isDocLoading: boolean;
  docError: string | null;
  docResult: DocApiResponse | null;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onReset: () => void;
}

export const DocumentScannerTab: React.FC<DocumentScannerTabProps> = ({
  docContent,
  onDocContentChange,
  onSelectPreset,
  isDocLoading,
  docError,
  docResult,
  onSubmit,
  onReset,
}) => {
  return (
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
                onClick={() => onSelectPreset(sample.id)}
                className="p-3 text-left rounded-lg border border-slate-200 hover:border-teal-600 hover:bg-teal-50/50 transition-all text-xs focus:ring-2 focus:ring-teal-600"
              >
                <div className="font-bold text-slate-900 mb-1">{sample.title}</div>
                <div className="text-slate-500 text-2xs">{sample.description}</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label htmlFor="docText" className="block text-sm font-semibold text-slate-800 mb-2">
              Document Text ({docContent.length} characters):
            </label>
            <textarea
              id="docText"
              rows={8}
              maxLength={5000}
              value={docContent}
              onChange={e => onDocContentChange(e.target.value)}
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
                onClick={() => onDocContentChange('')}
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
              onClick={onReset}
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
  );
};
