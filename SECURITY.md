# Security and privacy

This project processes identity, immigration and financial documents. Treat every deployment as a high-sensitivity system.

## Current MVP

- No database or persistent application storage.
- API keys are supplied per request and are not intentionally logged or persisted.
- Model responses use `store: false`.
- Files are held only in request memory and are not written to disk by application code.
- File count, type and size are validated before model submission.

## Before a public deployment

1. Add authentication, authorization and per-user isolation.
2. Add rate limits, request-size limits and abuse monitoring without logging document contents.
3. Publish a jurisdiction-appropriate privacy notice and retention policy.
4. Encrypt all transport and any temporary storage; use short-lived credentials.
5. Add malware scanning and content-disarm controls for uploaded files.
6. Complete dependency, secret, penetration and data-flow reviews.
7. Establish incident response, deletion and data-subject request procedures.
8. Obtain professional advice on privacy and immigration-service regulation in every market served.

## Deliberately unsupported

- UKVI credentials, OTPs or payment information
- Automated declarations, payment or final submission
- Unattended access to a user's UKVI account
- Visa-outcome prediction
- Fabricated evidence, bookings, explanations or altered records

Report security issues privately to the repository owner. Do not open a public issue containing personal data, credentials or a proof of concept that exposes users.
