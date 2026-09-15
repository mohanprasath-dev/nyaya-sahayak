'use client';

import React from 'react';
import { CompareApiResponse } from '@/types/legal';

export interface DocumentComparatorTabProps {
  origText: string;
  onOrigTextChange: (text: string) => void;
  revText: string;
  onRevTextChange: (text: string) => void;
  onSelectPreset: (presetKey: 'non_compete' | 'posh_gag' | 'liquidated_damages') => void;
  isCompLoading: boolean;
  compError: string | null;
  compResult: CompareApiResponse | null;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onReset: () => void;
}

export const DocumentComparatorTab: React.FC<DocumentComparatorTabProps> = React.memo(({
  origText,
  onOrigTextChange,
  revText,
  onRevTextChange,
  onSelectPreset,
  isCompLoading,
  compError,
  compResult,
  onSubmit,
  onReset,
}) => {
  return (
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => onSelectPreset('non_compete')}
              className="p-3 text-left rounded-lg border border-slate-200 hover:border-teal-600 hover:bg-teal-50/50 transition-all text-xs"
            >
              <div className="font-bold text-slate-900">1. Removal of Restrictive Non-Compete</div>
              <div className="text-slate-500 text-2xs">Original has 24-mo non-compete; Revised removes it.</div>
            </button>

            <button
              type="button"
              onClick={() => onSelectPreset('posh_gag')}
              className="p-3 text-left rounded-lg border border-slate-200 hover:border-teal-600 hover:bg-teal-50/50 transition-all text-xs"
            >
              <div className="font-bold text-slate-900">2. Introduction of Reporting Gag Clause</div>
              <div className="text-slate-500 text-2xs">Revised version introduces unlawful reporting gag.</div>
            </button>

            <button
              type="button"
              onClick={() => onSelectPreset('liquidated_damages')}
              className="p-3 text-left rounded-lg border border-slate-200 hover:border-teal-600 hover:bg-teal-50/50 transition-all text-xs"
            >
              <div className="font-bold text-slate-900">3. Liquidated Damages &amp; Notice Period</div>
              <div className="text-slate-500 text-2xs">Revised replaces forfeiture with mutual 30-day notice.</div>
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
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
                onChange={e => onOrigTextChange(e.target.value)}
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
                onChange={e => onRevTextChange(e.target.value)}
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
              onClick={onReset}
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
  );
});

DocumentComparatorTab.displayName = 'DocumentComparatorTab';
