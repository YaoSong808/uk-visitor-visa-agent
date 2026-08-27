# Case Facts and Consistency

## Minimal JSON schema

```json
{
  "applicant": {
    "full_name": "Example Name",
    "passport_number": "[REDACTED]",
    "nationality": "China",
    "legal_residence_country": "Hong Kong SAR",
    "residence_valid_from": "2025-01-01",
    "residence_valid_to": "2027-01-01"
  },
  "trip": {
    "arrival_date": "2026-11-01",
    "departure_date": "2026-11-08",
    "purpose": "Tourism",
    "estimated_total": {"amount": 18000, "currency": "CNY"}
  },
  "funding": {
    "applicant_contribution": {"amount": 3000, "currency": "CNY"},
    "sponsor_contribution": {"amount": 15000, "currency": "CNY"},
    "sponsor_name": "Example Sponsor",
    "relationship": "Father"
  },
  "declared_finances": {
    "monthly_income": {"amount": 0, "currency": "CNY"},
    "monthly_family_support": {"amount": 10000, "currency": "CNY"},
    "monthly_living_costs": {"amount": 9000, "currency": "CNY"}
  },
  "sources": [
    {"field": "trip.estimated_total", "file": "Application_Form.pdf", "page": 6}
  ]
}
```

Replace all example values. Do not store full identity numbers unless the output specifically requires them.

## Reconciliation rules

- Arrival must precede departure.
- Residence and passport validity must cover the intended travel period where applicable.
- Applicant contribution plus sponsor contribution must equal the declared trip total when they are the only funding sources.
- Every amount must have a currency and a clear period where recurring.
- Do not convert currencies silently. Record the exchange-rate source and date if a conversion is needed.
- Family support is not employment income. Internal transfers are not new income. Savings balances are not monthly income.
- A sponsor's available balance does not alone prove recurring earnings; distinguish balances, salary credits, business receipts, and transfers.
- Explanations must identify the actual transaction and source evidence, not merely call a credit "normal".

## Drafting rule

Each material number should have one canonical value in `Case_Facts.json`. Drafts should reuse that value verbatim. When the form and evidence genuinely use different figures or currencies, explain the relationship explicitly rather than forcing them to appear identical.
