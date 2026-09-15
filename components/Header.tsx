'use client';

import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="bg-teal-700 text-white font-bold px-2.5 py-1 rounded-lg text-sm tracking-wider shadow-xs" aria-hidden="true">
              NS
            </span>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Nyaya Sahayak
            </h1>
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full font-semibold">
              Statutes Verified 2026
            </span>
          </div>
          <p className="text-slate-600 text-xs md:text-sm mt-1">
            Deterministic Statutory Grounding + Gemini GenAI | India Law Edition
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-rose-50/80 p-2 rounded-lg border border-rose-200">
          <span className="text-rose-900 font-bold uppercase tracking-wider text-2xs">Emergency 24/7:</span>
          <a
            href="tel:112"
            className="text-rose-900 hover:text-rose-950 font-mono font-bold bg-white px-2.5 py-1 rounded border border-rose-300 shadow-2xs hover:bg-rose-100 transition-colors"
            title="National Emergency Number"
          >
            112
          </a>
          <a
            href="tel:181"
            className="text-rose-900 hover:text-rose-950 font-mono font-bold bg-white px-2.5 py-1 rounded border border-rose-300 shadow-2xs hover:bg-rose-100 transition-colors"
            title="Women Helpline"
          >
            181
          </a>
          <a
            href="tel:1930"
            className="text-rose-900 hover:text-rose-950 font-mono font-bold bg-white px-2.5 py-1 rounded border border-rose-300 shadow-2xs hover:bg-rose-100 transition-colors"
            title="Cyber Crime Helpline"
          >
            1930
          </a>
        </div>
      </div>
    </header>
  );
};
