---
name: uk-visitor-visa-prep
description: Prepare and audit UK Standard Visitor visa materials from a local case folder. Use when a user needs a document inventory, application fact ledger, evidence checklist, tourism itinerary, cover letter, sponsor financial support statement, translator declaration, document translation workflow, bank-statement annotation plan, or a consistency review across application forms and supporting documents. Also use for Chinese applicants applying from mainland China, Hong Kong, or another place of legal residence. Do not use this workflow for work, student, family, settlement, asylum, or other UK immigration routes.
---

# UK Visitor Visa Prep

Build a clear, internally consistent Standard Visitor application pack without inventing facts. Treat the applicant's submitted form as the controlling record and preserve all originals.

## Operating Boundaries

- Work only on preparation, review, translation layout, and draft documents. Never log in, accept declarations, pay, book biometrics, or submit on the applicant's behalf.
- Do not predict approval or present readiness scores as approval probability.
- Do not invent dates, balances, income, transfers, employment, enrolment, relationships, bookings, or travel history. Mark unresolved facts as `[TO CONFIRM: ...]`.
- Keep passports, bank statements, identity numbers, API keys, and contact details out of logs, examples, repositories, and final chat summaries.
- For current fees, timing, rules, and permitted activities, verify the relevant GOV.UK page at the time of use. Do not rely on amounts or processing times remembered from this skill.
- Stop and explain the route mismatch if the visit involves prohibited work, long-term residence, marriage, or another visa category.

## Workflow

### 1. Establish the case boundary

Confirm that the requested route is a UK Standard Visitor application and identify:

- applicant, nationality, current legal residence, and application location
- planned entry and exit dates, purpose, cities, and accommodation plan
- who pays, estimated total cost, applicant funds, sponsor funds, and regular commitments
- current study, work, family, residence, or other documented reasons to return
- whether an online application has already been completed

Read `references/workflow.md` before working on a full folder.

### 2. Preserve and inventory evidence

Do not rename, overwrite, reorder, annotate, compress, or translate original files. Create a separate `Generated/` directory for derived work.

Run:

```bash
python3 scripts/inventory_case.py "/path/to/case" --output "/path/to/case/Generated/File_Inventory.json"
```

Review the inventory, then inspect application forms and primary evidence before examples or templates. Label third-party samples as references so their names and figures never enter the applicant's documents.

### 3. Create the fact ledger

Create `Generated/Case_Facts.json` using the schema in `references/consistency.md`. Record each material fact once, with its source and confidence. If the online form exists, transcribe its submitted figures exactly and flag conflicts rather than silently correcting them.

Run:

```bash
python3 scripts/check_case_facts.py "/path/to/case/Generated/Case_Facts.json"
```

Resolve or clearly flag every error before drafting. Pay special attention to currencies, monthly versus annual amounts, trip cost, sponsor contribution, unexplained credits, names, passport dates, residence validity, and graduation or employment dates.

### 4. Build an evidence map

Read `references/evidence-checklist.md`. Produce `Generated/Evidence_Checklist.md` with four statuses: `ready`, `review`, `missing`, and `not applicable`. Explain what each item proves; do not reward document volume or duplicate evidence.

### 5. Draft only what the evidence supports

Use the files under `assets/templates/` as starting structures, not as factual sources. Draft in plain, specific English and keep numbers identical to the fact ledger.

- `Travel_Plan`: realistic daily tourism activities, transport, city, and intended accommodation; do not claim unmade bookings.
- `Cover_Letter`: purpose, dates, funding, material transactions, personal circumstances, return reasons, and document index.
- `Financial_Support_Statement`: written in the sponsor's voice, defining the relationship, support scope, method, and ability to pay.
- `Translator_Declaration`: use only the real translator's identity, date, contact details, and signature. Never sign for the translator.

Use the document and PDF tools available in the environment for `.docx` or PDF output. Render every final document and visually inspect all pages for clipping, overlap, blank pages, unreadable scans, and incorrect ordering.

### 6. Handle translations and annotations

For material not in English or Welsh, prepare a complete translation that can be independently verified. Include an accuracy confirmation, translation date, translator's full name and signature, and contact details. Keep the original-language document with its translation.

Bank-statement annotations are navigation aids, not translations and not evidence replacements. Place labels in unused margins or below entries, avoid covering account names, dates, currency, balances, or transaction descriptions, and retain an unannotated original.

### 7. Perform the final audit

Cross-check every number and date against the fact ledger and source files. Confirm that:

- trip dates, duration, itinerary, accommodation, and total cost agree
- applicant and sponsor contributions reconcile to the declared total
- source of funds and unusual credits are explained with evidence
- study, work, residence, and family statements match dated documents
- document translations are complete and verifiable
- drafts contain no sample person's facts or unresolved placeholders

Create `Generated/Visa_Case_Summary.md` listing ready items, unresolved issues, exact user decisions required, and the applicant-only submission steps. Never conceal a contradiction merely to make the pack look complete.

## Output Contract

For a full case, leave the originals untouched and produce this structure:

```text
Generated/
  File_Inventory.json
  Case_Facts.json
  Evidence_Checklist.md
  Visa_Case_Summary.md
  Drafts/
  Final/
```

Drafts may contain `[TO CONFIRM: ...]`. Final files may not.
