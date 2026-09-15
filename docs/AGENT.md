# AGENT.md — Nyaya Sahayak (Women's Legal Safety & Rights Assistant)

## Context
HackToSkill x Google private hackathon. Top-400 India builders invite.
Challenge: "AI for Legal Assistance & Access". AI-evaluated submission, max 3 attempts.
Reward: 1000 HackToSkill credits on validated submission.

## Vertical (locked)
Women's Legal Safety & Rights Assistant ("Nyaya Sahayak").
Covers: workplace harassment (POSH Act 2013), domestic violence (PWDVA 2005),
cyber harassment (IT Act Sec 66E/67), and general safety (IPC/BNS relevant sections).
Rationale: strong real-world access-to-justice narrative, clear branching logic
(easy to demonstrate "context-aware decision making"), verifiable public legal facts.

## Stack
- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Google Gemini API (server-side only, via /api/assist route)
- No DB, no auth, stateless — nothing persisted server-side
- Deploy target: Vercel (free tier)

## Hard constraints (submission rules — do not violate)
- Public GitHub repo, single branch, total repo size < 10 MB (exclude node_modules,
  .next, lockfile noise from consideration but note actual .git size before submit)
- Must include README.md covering: vertical, approach/logic, how it works, assumptions
- No secrets committed. GEMINI_API_KEY only in .env.local (gitignored) + Vercel env vars
- Not legal advice — disclaimer required in UI, footer, and README

## Evaluation criteria (AI-graded) → where each is earned
| Criterion | Primary phase(s) |
|---|---|
| Code Quality | LA-00, LA-01, LA-02 |
| Security | LA-02, LA-05 |
| Efficiency | LA-01, LA-06 |
| Testing | LA-04 |
| Accessibility | LA-03 |
| Problem Statement Alignment | LA-01, LA-06 (README) |

## Model routing (Antigravity build only, not app runtime)
- Gemini Flash: scaffolding, boilerplate, data tables (LA-00, LA-01 data files)
- Claude Sonnet: rule-engine logic, API route, prompt design (LA-01, LA-02) —
  escalate here if Flash loops twice on same file
- Claude Opus: none needed for this scope; reserve only if Sonnet fails twice on
  the rule-engine branching logic

## Working principles applied
- Never include unverifiable legal data — every law/section cited must be a
  well-established, publicly documented Indian statute. If uncertain, mark
  [NEEDS INPUT: verify section] instead of inventing a citation.
- Screenshot-verify each phase in the running app before advancing — do not
  trust "build passed" as "feature works."
- ASCII-only in all UI-rendered text (no em dashes, curly quotes, ₹ symbol).
