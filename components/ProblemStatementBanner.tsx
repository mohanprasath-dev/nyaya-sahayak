'use client';

import React from 'react';

export interface ProblemStatementBannerProps {
  activeTab: 'assistant' | 'docScanner' | 'compare' | 'qa';
  onSelectTab: (tab: 'assistant' | 'docScanner' | 'compare' | 'qa') => void;
  onLaunchPreset: (target: 'simplify_contract' | 'compare_revisions' | 'ask_document' | 'navigate_remedies' | 'flag_posh') => void;
}

export const ProblemStatementBanner: React.FC<ProblemStatementBannerProps> = ({
  activeTab,
  onSelectTab,
  onLaunchPreset,
}) => {
  return (
    <section 
      aria-label="Hackathon Problem Statement Alignment"
      className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 mb-6 shadow-xs"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-teal-50 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-teal-200">
              AI for Legal Assistance &amp; Access
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Evaluator Quick-Launch
            </span>
          </div>
          <h2 className="text-slate-900 text-base md:text-lg font-bold mt-1">
            Core Hackathon Use-Case Verifier
          </h2>
          <p className="text-slate-600 text-xs md:text-sm mt-0.5 max-w-3xl">
            Test how Nyaya Sahayak fulfills each parameter of the problem statement using 1-click grounded scenarios:
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onLaunchPreset('simplify_contract')}
            className="text-xs bg-slate-50 hover:bg-teal-50 text-slate-800 hover:text-teal-900 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-teal-400 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-2xs"
            title="Use Case 1: Simplifying complex legal documents"
          >
            <span className="text-amber-700 font-bold">[1]</span>
            <span className="font-medium">Simplify Contract</span>
          </button>

          <button
            type="button"
            onClick={() => onLaunchPreset('compare_revisions')}
            className="text-xs bg-slate-50 hover:bg-teal-50 text-slate-800 hover:text-teal-900 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-teal-400 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-2xs"
            title="Use Case 2: Comparing contracts, agreements, or policies"
          >
            <span className="text-sky-700 font-bold">[2]</span>
            <span className="font-medium">Compare Revisions</span>
          </button>

          <button
            type="button"
            onClick={() => onLaunchPreset('ask_document')}
            className="text-xs bg-slate-50 hover:bg-teal-50 text-slate-800 hover:text-teal-900 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-teal-400 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-2xs"
            title="Use Case 3: Answering questions based on legal documents"
          >
            <span className="text-emerald-700 font-bold">[3]</span>
            <span className="font-medium">Document Q&amp;A</span>
          </button>

          <button
            type="button"
            onClick={() => onLaunchPreset('navigate_remedies')}
            className="text-xs bg-slate-50 hover:bg-teal-50 text-slate-800 hover:text-teal-900 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-teal-400 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-2xs"
            title="Use Case 4: Helping users understand their options and remedies"
          >
            <span className="text-purple-700 font-bold">[4]</span>
            <span className="font-medium">Safety Remedies</span>
          </button>

          <button
            type="button"
            onClick={() => onLaunchPreset('flag_posh')}
            className="text-xs bg-slate-50 hover:bg-teal-50 text-slate-800 hover:text-teal-900 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-teal-400 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-2xs"
            title="Use Case 5: Highlighting important clauses, obligations, and risks"
          >
            <span className="text-rose-700 font-bold">[5]</span>
            <span className="font-medium">Flag Gag Clauses</span>
          </button>
        </div>
      </div>

      <nav aria-label="System Navigation Tabs" className="mt-4 pt-3.5 border-t border-slate-200 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelectTab('assistant')}
          className={`text-xs md:text-sm font-semibold px-3.5 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-teal-600 ${
            activeTab === 'assistant'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
          }`}
        >
          Tab 1: Guided Safety Assistant
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('docScanner')}
          className={`text-xs md:text-sm font-semibold px-3.5 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-teal-600 ${
            activeTab === 'docScanner'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
          }`}
        >
          Tab 2: Document &amp; Clause Scanner
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('compare')}
          className={`text-xs md:text-sm font-semibold px-3.5 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-teal-600 ${
            activeTab === 'compare'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
          }`}
        >
          Tab 3: Clause &amp; Policy Comparator
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('qa')}
          className={`text-xs md:text-sm font-semibold px-3.5 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-teal-600 ${
            activeTab === 'qa'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
          }`}
        >
          Tab 4: Interactive Document Q&amp;A
        </button>
      </nav>
    </section>
  );
};
