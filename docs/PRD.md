# PRD.md — Nyaya Sahayak

## Problem
Women in India often don't know which law applies to their situation, what steps
to take, or where to go (police, NCW, court, helpline). Legal language and
fragmented information create an access barrier.

## Solution
A guided web assistant: user answers a short structured intake (category of
issue + context), a rule engine maps it to the correct legal framework and
immediate action steps, and Gemini generates a personalized plain-language
summary + a draft complaint/notice the user can copy. Hybrid = deterministic
rule engine (never hallucinates the law) + LLM (personalizes the wording only).

## Core user flow
1. Landing screen: disclaimer + "This is not a substitute for a lawyer."
2. Intake: select category (Workplace harassment / Domestic violence /
   Cyber harassment / Public safety-other) -> 2-4 follow-up context questions
   (e.g. "Is the harasser a colleague/employer?" "Has an incident been reported
   before?") -> free-text box for details (optional, capped length).
3. Rule engine (client or server, pure functions) maps answers -> {law, section,
   applicable authority, helpline, next steps checklist}.
4. Gemini call receives ONLY the rule-engine output + user's free-text as
   context, and is prompted to: (a) rewrite next steps in plain, warm language,
   (b) draft a short formal complaint letter template. Gemini must NOT be asked
   to invent legal citations — those come only from the rule engine.
5. Result screen: law/section (from rule engine, verified), plain-language
   guidance (from Gemini), copyable draft letter, helpline numbers, "Not legal
   advice" footer repeated.

## Non-functional requirements
- Accessibility: WCAG AA — semantic HTML, visible focus states, ARIA labels on
  intake controls, minimum 4.5:1 contrast, full keyboard operability, works with
  screen reader (test with VoiceOver/NVDA or axe-core automated check).
- Security: API key server-side only; input length caps; basic rate limiting
  (in-memory per-IP, acceptable for demo scope); no PII stored or logged;
  sanitize before sending to Gemini; disclaimer that data isn't stored.
- Testing: unit tests for the rule engine (this is the "logical decision
  making" the evaluator scores) covering every category branch; at least one
  API route test with a mocked Gemini response.
- Efficiency: no unused deps, no client-side bundle bloat, Gemini calls only
  on submit (not on keystroke), repo excludes node_modules/.next via .gitignore.

## Data sources (must be verifiable, publicly documented)
- POSH Act 2013 (workplace harassment)
- Protection of Women from Domestic Violence Act, 2005 (PWDVA)
- IT Act 2000, Sec 66E / 67 (cyber harassment/privacy violation)
- IPC Sec 354, 354A, 354D / BNS equivalents (stalking, assault on modesty) —
  [NEEDS INPUT: confirm current BNS section numbers replacing IPC before final
  copy, since IPC was replaced by BNS in 2024 — do not guess numbers]
- Helplines: Women Helpline 181, Police 100/112, Cyber Crime 1930,
  NCW portal — verify these are still current before hardcoding

## Risks / open questions
- Gemini API key: user must generate one at aistudio.google.com and set
  GEMINI_API_KEY in .env.local before LA-02. Blocks that phase until provided.
- BNS vs IPC section numbers need a one-time verification pass (web search)
  before writing law-data.ts — do not hardcode from memory.
- Repo size: Next.js default scaffold is fine (~2-3 MB source), but confirm
  no large images/assets are added. Use SVG/CSS only, no binary image assets.
- Single branch requirement: never create a second branch during the build.
- 3 submission attempts total — do a full local + deployed smoke test before
  using an attempt.

## Out of scope (this round)
- User accounts, auth, saved history
- Multi-language UI (English only for v1; mention as future work in README)
- Real-time chat/streaming responses (single request/response is enough)
