# AGENTS.md

## Project Overview

This repository is the foundation of a production-grade, multi-country tourism marketplace. The initial product focuses on accommodation and villa booking, with customer, owner, staff, administrator, finance, support, advertising, and moderation workflows.

The authoritative business and product requirements are in `docs/buss_req.md`. Read the relevant sections before proposing architecture or changing behavior.

## Source of Truth

- Treat `docs/buss_req.md` as the current business source of truth.
- Preserve the cross-module invariants in section 34.
- Do not invent values listed in section 35, **Business Decisions Still Required**. Ask for a product decision or implement a safe configuration gate.
- Keep deferred functionality outside the initial release unless the requirements are explicitly updated.
- Keep the product brand-neutral unless a brand is explicitly supplied.

Approved technical architecture is stored under:

- /docs/architecture/

Approved architectural decisions are stored under:

- /docs/decisions/

Feature specifications are stored under:

- /docs/features/

Implementation plans are stored under:

- /docs/plans/


## New Conversation Rule

At the beginning of every new task:

1. Read the relevant business requirements.
2. Read the relevant architecture documents.
3. Read applicable ADRs.
4. Read the relevant feature specification if one exists.
5. Do not rely on assumptions from previous Codex conversations.
6. Treat repository documentation as the persistent project memory.


## Business Requirements

Business requirements may not be changed or invented automatically.

If a requested change conflicts with existing business requirements:

- identify the conflict;
- explain it to the user;
- propose the required documentation change;
- wait for approval.

Do not silently reinterpret an existing business requirement.


## Architecture Decisions

Important technical decisions must be documented.

For significant architectural decisions:

1. Explain the problem.
2. Present meaningful alternatives.
3. Explain tradeoffs.
4. Recommend an option.
5. Discuss it with the user.
6. Wait for explicit approval.

After approval:

- update the appropriate architecture document;
- create or update an ADR when appropriate;
- update affected feature/design documentation.

Documentation must reflect the final approved decision.


## Decision Synchronization

Whenever the user approves a new decision, determine which existing
documentation is affected.

Update all affected documentation so the repository remains internally
consistent.

Examples:

Business decision:
-> update /docs/business or /docs/features

Architecture decision:
-> update /docs/architecture
-> create/update ADR

Database decision:
-> update /docs/architecture/database.md
-> create/update ADR if significant

Security decision:
-> update /docs/architecture/security.md

Feature decision:
-> update /docs/features/<feature>.md

Implementation decision:
-> update /docs/plans/<feature>.md


## Approval Policy

Discussion is NOT approval.

Do not implement application code unless the user explicitly approves
implementation.

Examples of implementation approval:

- "Approved, implement it."
- "Proceed with implementation."
- "Implement the approved plan."

Before implementation, present the detailed implementation plan and
resolve important open decisions with the user.


## Documentation Integrity

Never overwrite an approved decision silently.

If a new decision conflicts with an existing decision:

1. identify the previous decision;
2. explain the conflict;
3. propose how the documentation should change;
4. obtain approval;
5. update the documentation;
6. mark superseded ADRs appropriately when applicable.


## Traceability

Where practical, technical decisions should reference the business
requirement or feature that motivated them.

Architecture documents should describe the current approved state.

ADRs should preserve why important decisions were made.

## Technology Direction

- Java 17 or newer.
- Jakarta EE 10 APIs using the `jakarta.*` namespace.
- Maven WAR packaging.
- Deploy only to a Jakarta EE 10-compatible runtime, such as Payara 6; do not target Payara 5 / Jakarta EE 8.
- Prefer a modular monolith with package-by-feature boundaries until operational evidence justifies extracting services.
- Use Jakarta REST, CDI, Jakarta Validation, JPA, and JTA according to Jakarta EE best practices.
- Use constructor injection where supported and keep business logic out of REST resources and UI templates.

## Required Engineering Workflow

For every non-trivial change:

1. Analyze the relevant requirements and unresolved decisions.
2. Identify affected domains, invariants, security boundaries, and edge cases.
3. Explain the proposed design and meaningful tradeoffs.
4. Implement production-ready code with focused tests.
5. Run the relevant Maven verification commands.
6. Summarize changed files, test results, risks, and any remaining product decisions.

Do not silently alter unrelated user changes. Do not hard-delete or rewrite booking, pricing, financial, moderation, or audit history.

## Architecture Boundaries

Organize code by business capability rather than technical layer alone. Expected modules include:

- identity and access control
- markets, localization, currency, tax, and FX
- owner organizations and property-scoped staff permissions
- property onboarding, content, and moderation
- availability and unified inventory
- pricing, quotes, promotions, and margin control
- booking lifecycle
- payments and reconciliation
- ledger and owner settlements
- add-ons and property packages
- advertising
- reviews
- messaging and notifications
- support cases, risk, audit, and reporting

Cross-module communication should use explicit application services, commands, queries, and domain events. Avoid direct access to another module's persistence internals.

## Critical Business Invariants

- One property has inventory capacity of exactly one; overlapping active holds, reservations, and blocks are forbidden.
- The final conflict check and booking confirmation must be transactional and safe under concurrency.
- Existing confirmed bookings use immutable pricing, commercial, tax, FX, policy, period, and buffer snapshots.
- A customer-facing price is not final until availability, pricing, discount, tax, currency, and margin checks succeed.
- Property owner buy values, customer sell values, taxes, add-ons, platform revenue, and manual external revenue remain financially distinct.
- Manual reservations block inventory when confirmed but never create platform commission, payment, verified-review, or settlement records.
- Payment callbacks and commands must be idempotent. Duplicate events must not duplicate charges, bookings, or ledger entries.
- Financial records use `BigDecimal` with an explicit ISO currency; never use floating-point values for money.
- Store local business context with an IANA timezone and resolve conflict intervals to precise timestamps.
- Sensitive actions require explicit privilege, data-scope validation, a reason, and immutable audit history.
- Sponsored content must remain visibly and analytically separate from organic and personalized results.

## Java and Jakarta EE Standards

- Prefer immutable value objects and records where they improve clarity.
- Use enums or typed value objects for controlled domain states; do not scatter magic strings.
- Keep entities persistence-focused and prevent REST resources from exposing them directly.
- Define transaction boundaries in application services.
- Use Jakarta Validation at API boundaries and enforce invariants again in the domain/database.
- Use typed exceptions and centralized API error mapping. Do not expose stack traces or sensitive internals.
- Use structured logging; never use `System.out.println`.
- Add Javadoc for public APIs and non-obvious domain rules.
- Prefer `maven.compiler.release` over separate `source` and `target` settings.

## Database and Concurrency

- Manage schema changes with a migration tool; never rely on automatic destructive schema generation in production.
- Add indexes based on query and scope patterns, including property, geography, status, effective dates, and booking intervals.
- Enforce uniqueness and idempotency at the database level where possible.
- Prevent double booking with database-supported locking or exclusion constraints in addition to application checks.
- Avoid N+1 queries and unbounded result sets. Use pagination for large collections.
- Keep reporting workloads from degrading transactional booking operations.

## API Standards

- Version production APIs, for example `/api/v1`.
- Use resource-oriented URLs and explicit request/response DTOs.
- Return consistent problem details with stable machine-readable error codes.
- Support idempotency keys for booking and payment commands where retries are possible.
- Document APIs using OpenAPI and include authorization, validation, and error responses.
- Do not expose owner contact details or property access instructions before the required payment conditions are satisfied.

## Security Requirements

- Apply least privilege and combine permissions with country, city, owner, and property data scopes.
- Enforce authorization in services and data access, not only in the UI.
- Protect against CSRF, XSS, SQL injection, insecure direct-object references, replay attacks, and mass assignment.
- Validate uploads, remove unsafe metadata, and store media outside the application filesystem in production.
- Keep credentials and secrets out of source control and logs.
- Protect session cookies and configure restrictive CORS and security headers.
- Require step-up authentication for high-risk financial and permission actions.
- Treat payment webhooks as untrusted input: verify signatures, timestamps, replay protection, and gateway reconciliation.

## UI/UX Requirements

- Design mobile-first and meet WCAG accessibility expectations.
- Support Arabic and Hebrew RTL layouts as first-class experiences, alongside English and Turkish.
- Do not hardcode user-facing text; use localization resources.
- Display money, dates, times, and numbers according to selected locale while preserving the property timezone and contractual currency context.
- Use clear status labels, countdowns, validation messages, and recovery paths for booking/payment flows.
- Keep sponsored placements clearly labeled.

## Testing Requirements

Every feature should include the appropriate combination of:

- unit tests for domain rules and state transitions
- integration tests against the selected production database
- concurrency tests for overlapping inventory and holds
- authorization tests for privileges and geographic/property scopes
- idempotency tests for commands and gateway callbacks
- contract tests for external identity and payment providers
- end-to-end tests for critical customer, owner, and administrator journeys
- accessibility, localization, RTL, and responsive-layout checks
- load tests for search, quoting, holds, checkout, and notification spikes

At minimum, run `mvn test` for relevant changes and `mvn verify` before declaring a release candidate ready.

## Delivery and Operations

- Provide health, readiness, and observability endpoints suitable for the selected runtime.
- Use structured logs, metrics, traces, and correlation IDs across requests and asynchronous work.
- Use a transactional outbox for reliable notifications, integrations, and analytical events.
- Keep environment-specific configuration outside the packaged application.
- Document database migrations, required server resources, deployment steps, rollback behavior, and operational alerts.

## Definition of Done

A change is complete only when:

- the relevant business rules and unresolved decisions were respected
- architecture and security boundaries remain intact
- implementation and migrations are production-safe
- automated tests cover success, failure, authorization, and concurrency paths as applicable
- the build passes
- API and operational documentation are updated
- no secrets, generated build output, or environment-specific files are unintentionally committed
