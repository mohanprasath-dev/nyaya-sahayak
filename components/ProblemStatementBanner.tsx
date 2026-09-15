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
      className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-900/60 rounded-xl p-4 md:p-5 mb-6 shadow-lg shadow-indigo-950/20"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-indigo-500/30">
              AI for Legal Assistance & Access
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Evaluator Quick-Launch
            </span>
          </div>
          <h2 className="text-white text-base md:text-lg font-semibold mt-1">
            Core Hackathon Use-Case Verifier
          </h2>
          <p className="text-slate-300 text-xs md:text-sm mt-0.5 max-w-3xl">
            Test how Nyaya Sahayak fulfills each parameter of the problem statement using 1-click grounded scenarios:
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onLaunchPreset('simplify_contract')}
            className="text-xs bg-slate-800 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            title="Use Case 1: Simplifying complex legal documents"
          >
            <span className="text-amber-400 font-bold">[1]</span>
            <span>Simplify Contract</span>
          </button>

          <button
            type="button"
            onClick={() => onLaunchPreset('compare_revisions')}
            className="text-xs bg-slate-800 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            title="Use Case 2: Comparing contracts, agreements, or policies"
          >
            <span className="text-sky-400 font-bold">[2]</span>
            <span>Compare Revisions</span>
          </button>

          <button
            type="button"
            onClick={() => onLaunchPreset('ask_document')}
            className="text-xs bg-slate-800 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            title="Use Case 3: Answering questions based on legal documents"
          >
            <span className="text-emerald-400 font-bold">[3]</span>
            <span>Document Q&A</span>
          </button>

          <button
            type="button"
            onClick={() => onLaunchPreset('navigate_remedies')}
            className="text-xs bg-slate-800 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            title="Use Case 4: Helping users understand their options and remedies"
          >
            <span className="text-purple-400 font-bold">[4]</span>
            <span>Safety Remedies</span>
          </button>

          <button
            type="button"
            onClick={() => onLaunchPreset('flag_posh')}
            className="text-xs bg-slate-800 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            title="Use Case 5: Highlighting important clauses, obligations, and risks"
          >
            <span className="text-rose-400 font-bold">[5]</span>
            <span>Flag Gag Clauses</span>
          </button>
        </div>
      </div>

      <nav aria-label="System Navigation Tabs" className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelectTab('assistant')}
          className={`text-xs md:text-sm font-medium px-3.5 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
            activeTab === 'assistant'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          Tab 1: Guided Safety Assistant
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('docScanner')}
          className={`text-xs md:text-sm font-medium px-3.5 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
            activeTab === 'docScanner'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          Tab 2: Document & Clause Scanner
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('compare')}
          className={`text-xs md:text-sm font-medium px-3.5 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
            activeTab === 'compare'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          Tab 3: Clause & Policy Comparator
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('qa')}
          className={`text-xs md:text-sm font-medium px-3.5 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
            activeTab === 'qa'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          Tab 4: Interactive Document Q&A
        </button>
      </nav>
    </section>
  );
};
