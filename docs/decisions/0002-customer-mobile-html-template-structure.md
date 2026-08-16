# ADR-0002: Customer Mobile HTML Template Structure

## Status

Accepted — 16 August 2026; amended 17 August 2026 to add the mobile customer login template.

## Context

The repository contains four approved Arabic customer-mobile reference images, an implemented customer-web HTML journey, and a complementary mobile customer-login requirement. The current scope is UI/UX template work rather than a native application runtime or backend integration. The mobile templates must match the mobile composition while preserving the approved customer-web behavior and business invariants.

## Decision

- Implement five linked, mobile-first semantic HTML pages in `src/main/webapp/nesma-ui/customer/mobile`: discovery, map results, property profile, booking-request review, and customer login.
- Keep mobile CSS and modern JavaScript modules under `customer/mobile/assets`, separated into shared and page-specific files.
- Reuse the existing optimized customer media and icon assets by reference instead of copying a second image tree.
- Use the mobile reference images as visual truth and the approved web templates and business requirements as behavioral truth.
- Keep the prototype framework-independent and brand-neutral so it can later be adapted to the approved PWA, Framework7, Capacitor, JSF, or other delivery architecture.
- Preserve a mobile-app navigation model with touch-safe controls, bottom sheets, fixed action trays, and Arabic RTL as the initial presentation while using logical CSS for LTR support.
- Keep the five-page journey functional with local mock state only. Do not imply real authentication, availability, inventory holds, booking creation, or payments.

## Consequences

### Positive

- Mobile fidelity can evolve independently without loading unused desktop layout rules.
- Shared mobile assets remain cacheable across the five pages.
- Existing responsive WebP imagery is reused without duplication.
- Business-correct behavior remains aligned with the web journey.

### Tradeoffs

- Shared navigation and dialog markup is duplicated while the templates remain static HTML.
- The mobile templates reference the existing web media directory until a repository-wide customer asset root is approved.
- A future native or Framework7 runtime will translate these templates rather than use them unchanged.

## Alternatives Considered

- Reuse only the responsive web pages: rejected because the approved mobile references use a distinct app-like information hierarchy and navigation model.
- Duplicate the complete web asset tree: rejected because it increases package size and prevents cross-page image caching.
- Adopt a mobile framework immediately: deferred because the approved scope is mobile HTML UI/UX templates and the final mobile runtime architecture has not been approved.
