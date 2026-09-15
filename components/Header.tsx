'use client';

import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="bg-indigo-600 text-white font-bold px-2.5 py-1 rounded text-sm tracking-wider" aria-hidden="true">
              NS
            </span>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Nyaya Sahayak
            </h1>
            <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded-full font-medium">
              Statutes Verified 2026
            </span>
          </div>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            Deterministic Statutory Grounding + Gemini GenAI | India Law Edition
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-950/80 p-2 rounded-lg border border-slate-800">
          <span className="text-rose-400 font-semibold uppercase tracking-wider">Emergency 24/7:</span>
          <a
            href="tel:112"
            className="text-white hover:text-rose-300 font-mono bg-rose-950/60 px-2 py-1 rounded border border-rose-800 transition-colors"
            title="National Emergency Number"
          >
            112
          </a>
          <a
            href="tel:181"
            className="text-white hover:text-rose-300 font-mono bg-rose-950/60 px-2 py-1 rounded border border-rose-800 transition-colors"
            title="Women Helpline"
          >
            181
          </a>
          <a
            href="tel:1930"
            className="text-white hover:text-rose-300 font-mono bg-rose-950/60 px-2 py-1 rounded border border-rose-800 transition-colors"
            title="Cyber Crime Helpline"
          >
            1930
          </a>
        </div>
      </div>
    </header>
  );
};
