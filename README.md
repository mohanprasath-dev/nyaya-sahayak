# Nyaya Sahayak - Women's Legal Safety & Rights Assistant

An AI-powered legal safety assistant empowering women across India to understand their statutory rights, navigate legal procedures, and generate formal complaint drafts with zero legal hallucination.

Built for the **HackToSkill x Google Hackathon** (*Challenge: AI for Legal Assistance & Access*).

---

## 1. Chosen Vertical & Problem Narrative

In India, women facing harassment or abuse frequently encounter steep barriers to justice:
- **Statutory Ambiguity:** Women often do not know which specific act applies to their situation (e.g. POSH Act for workplace misconduct, PWDVA for domestic violence, IT Act for cyber harassment, or Bharatiya Nyaya Sanhita for criminal assault).
- **Procedural Confusion:** Knowing where to report (Internal Committee, Local Committee at District level, Magistrate Court, One Stop Centre, Cyber Police Cell, or a Zero FIR at any local station) is opaque.
- **Intimidation & Language Barriers:** Complex legal terminology and fear of retaliation discourage women from taking the first step.

**Nyaya Sahayak** solves this by providing a confidential, guided digital assistant that translates personal context into actionable, legally accurate next steps and formal complaint drafts.

---

## 2. Architectural Approach: Deterministic Rule Engine + LLM Hybrid

A core innovation of Nyaya Sahayak is its **hybrid architecture**:

```
+-------------------------------------------------------------+
|                     User Structured Intake                  |
|        (Category + Context Questions + Optional Free Text)   |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|              Deterministic Statutory Rule Engine            |
|                   (Pure Functions / lib/)                   |
|                                                             |
|  * 100% Deterministic (Zero Hallucination)                  |
|  * Verified BNS 2023 & IPC Citations                        |
|  * POSH Act 2013 / PWDVA 2005 / IT Act 2000 Mappings         |
|  * Competent Authorities (IC, LC, PO, Magistrate, SHO)       |
|  * Active National Emergency Helplines (112, 181, 1930)      |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|               Server-Side Gemini AI Generation              |
|                    (/api/assist API Route)                  |
|                                                             |
|  * Personalizes action steps into warm, empathetic language |
|  * Generates formatted, ready-to-sign formal complaint draft|
|  * STRICT CONSTRAINT: Never allowed to invent legal statutes|
|  * Graceful offline fallback if API key is not present      |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                     Accessible Result UI                    |
|  * Verified Section Badges with Historical IPC Equivalents  |
|  * 1-Click Helpline Dialing                                 |
|  * 1-Click Formal Letter Copy to Clipboard                  |
|  * Evidence Preservation Checklist                          |
+-------------------------------------------------------------+
```

### Why Hybrid?
- **Zero Legal Hallucination:** Generative models are prone to hallucinating sections or citing non-existent precedents. In Nyaya Sahayak, every legal citation, statute year, section description, and authority name is guaranteed by the deterministic rule engine.
- **Empathetic Communication:** The LLM (Google Gemini) is strictly scoped to rephrasing procedural checklists into supportive plain language and organizing user details into a formal complaint letter template.

---

## 3. Supported Legal Categories & Verified Citations

*Sources last verified: 2026-09-15*

| Category | Primary Statute | Verified Sections | Competent Authority | Helplines |
|---|---|---|---|---|
| **Workplace Harassment** | POSH Act, 2013 & BNS, 2023 | POSH Sec 2(n), 4, 6, 9, 12; BNS Sec 75 (erstwhile IPC 354A) | Internal Committee (IC) / District Local Committee (LC) / SHe-Box | 181, NCW: 7827170170, 112 |
| **Domestic Violence** | PWDVA, 2005 & BNS, 2023 | PWDVA Sec 3, 12, 18, 19, 20, 21, 22; BNS Sec 85, 86 (erstwhile IPC 498A) | Protection Officer (PO) / Judicial Magistrate First Class | 181, 112, NCW: 7827170170 |
| **Cyber Harassment** | IT Act, 2000 & BNS, 2023 | IT Act Sec 66D, 66E, 67, 67A; IT Rules 2021 Rule 3(2)(b); BNS Sec 78 (IPC 354D), BNS Sec 79 (IPC 509) | National Cyber Crime Reporting Portal / Cyber Police Cell | 1930, 181, 112 |
| **Public Safety & Stalking** | BNS, 2023 & BNSS, 2023 | BNS Sec 74 (IPC 354), Sec 75 (IPC 354A), Sec 78 (IPC 354D), Sec 79 (IPC 509); BNSS Sec 173(1) (Zero FIR) | Station House Officer (SHO) at ANY Police Station (Zero FIR) | 112, 181, NCW: 7827170170 |

---

## 4. How It Works & Local Setup

### Prerequisites
- Node.js 18+ or 20+ (developed on v22)
- npm 9+ or 10+
- Optional: Google Gemini API key from [Google AI Studio](https://aistudio.google.com)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/mohanprasath-dev/nyaya-sahayak.git
cd nyaya-sahayak

# 2. Install dependencies
npm install

# 3. Setup environment variables (Optional - fallback templates work without it)
cp .env.example .env.local
# Open .env.local and add your key:
# GEMINI_API_KEY=your_actual_key_here

# 4. Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests

```bash
# Run complete test suite with coverage report
npm test
```

Test suite coverage on the deterministic rule engine (`lib/ruleEngine.ts`):
- **Statements:** 97.7%
- **Branches:** 91.8%
- **Functions:** 100.0%
- **Lines:** 97.7%

### Production Build

```bash
npm run build
npm run start
```

---

## 5. Security & Privacy Guarantees

- **Zero Data Persistence:** Nyaya Sahayak operates statelessly. No user answers, complaints, or PII are logged or stored in any database or external analytics.
- **Server-Side Secrets:** `GEMINI_API_KEY` is accessed exclusively in server-side API routes (`process.env.GEMINI_API_KEY`) and is never leaked to the client bundle or response payloads.
- **Rate Limiting & Abuse Prevention:** In-memory rate limiting (5 requests/minute per IP) protects against automated abuse.
- **Payload Sanitization & Size Caps:** Free-text descriptions are capped at 500 characters, sanitized against XSS and control characters, with a 15KB request body cap.
- **ASCII-Only Interface:** All UI text is strictly ASCII-encoded to prevent Unicode rendering glitches or symbol corruption across devices.

---

## 6. Assumptions & Scope

- **Jurisdiction:** Indian statutory law exclusively. On July 1, 2024, the Bharatiya Nyaya Sanhita (BNS) replaced the Indian Penal Code (IPC). Nyaya Sahayak explicitly cross-references both active BNS sections and historical IPC sections for complete legal validity.
- **Language Scope (v1):** English user interface. Multi-lingual support for Indian regional languages (Hindi, Tamil, Telugu, Bengali, Marathi) is slated for subsequent milestones.
- **Statutory Notice:** Nyaya Sahayak is an informational self-help assistant, not a legal advocate or law firm. In active life-threatening emergencies, users are directed to call **112** (Emergency Police) or **181** (Women Helpline) immediately.

---

## 7. License

MIT License. Developed for HackToSkill x Google.
