'use client';

import React from 'react';

export const Footer: React.FC = React.memo(() => {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white py-10 px-4 text-slate-600 text-xs">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-slate-900 font-bold mb-2 uppercase tracking-wider text-xs">
              Statutory Benchmark Registry
            </h3>
            <p className="text-slate-600 leading-relaxed">
              All legal classifications and advice trees are strictly mapped to active Indian statutes: 
              Bharatiya Nyaya Sanhita (BNS 2023), Bharatiya Nagarik Suraksha Sanhita (BNSS 2023), 
              POSH Act 2013, PWDVA 2005, IT Act 2000, and the Indian Contract Act 1872.
            </p>
          </div>

          <div>
            <h3 className="text-slate-900 font-bold mb-2 uppercase tracking-wider text-xs">
              National Emergency &amp; Legal Aid
            </h3>
            <ul className="space-y-1 text-slate-700 font-mono">
              <li>- All-India Police / Emergency: 112</li>
              <li>- National Women Helpline: 181</li>
              <li>- National Cyber Crime Helpline: 1930</li>
              <li>- NCW 24/7 Helpline: 7827170170</li>
              <li>- DLSA / NALSA Free Legal Aid: 15100</li>
            </ul>
          </div>

          <div>
            <h3 className="text-slate-900 font-bold mb-2 uppercase tracking-wider text-xs">
              Zero-Trust Privacy Guarantee
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Nyaya Sahayak is completely stateless. No documents, complaints, narratives, or questions 
              are ever stored to databases or log files. API communications are bounded and ephemeral.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-slate-500">
          <p>
            Informational legal assistance tool. Does not substitute formal advice from an advocate licensed by the Bar Council of India.
          </p>
          <p className="font-mono">
            HackToSkill x Google Hackathon 2026 | MIT License
          </p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
