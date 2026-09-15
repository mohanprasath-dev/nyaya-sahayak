'use client';

import React from 'react';
import { QaApiResponse } from '@/types/legal';

export interface DocumentQATabProps {
  qaDocText: string;
  onQaDocTextChange: (text: string) => void;
  qaQuestion: string;
  onQaQuestionChange: (question: string) => void;
  onSelectPreset: (presetKey: 'non_compete' | 'deposit_refund' | 'data_retention') => void;
  isQaLoading: boolean;
  qaError: string | null;
  qaResult: QaApiResponse | null;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onReset: () => void;
}

export const DocumentQATab: React.FC<DocumentQATabProps> = React.memo(({
  qaDocText,
  onQaDocTextChange,
  qaQuestion,
  onQaQuestionChange,
  onSelectPreset,
  isQaLoading,
  qaError,
  qaResult,
  onSubmit,
  onReset,
}) => {
  return (
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
            <button
              type="button"
              onClick={() => onSelectPreset('non_compete')}
              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 text-xs text-slate-700 transition-colors"
            >
              Can my employer enforce a 24-month non-compete if I quit?
            </button>
            <button
              type="button"
              onClick={() => onSelectPreset('deposit_refund')}
              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 text-xs text-slate-700 transition-colors"
            >
              Can my landlord forfeit my full deposit under this lease?
            </button>
            <button
              type="button"
              onClick={() => onSelectPreset('data_retention')}
              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 text-xs text-slate-700 transition-colors"
            >
              Can the company retain my personal biometric data indefinitely?
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label htmlFor="qaDoc" className="block text-sm font-semibold text-slate-800 mb-2">
              Legal Document Excerpt:
            </label>
            <textarea
              id="qaDoc"
              rows={5}
              maxLength={5000}
              value={qaDocText}
              onChange={e => onQaDocTextChange(e.target.value)}
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
              onChange={e => onQaQuestionChange(e.target.value)}
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
            {qaResult && (
              <button
                type="button"
                onClick={onReset}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Clear Result
              </button>
            )}
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
  );
});

DocumentQATab.displayName = 'DocumentQATab';
