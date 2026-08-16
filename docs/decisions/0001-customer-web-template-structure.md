# ADR-0001: Customer Web Template Structure

## Status

Accepted — 14 August 2026; amended 16 August 2026 to add the customer login template.

## Context

The repository contains four customer web concept images and one static home-page implementation. The temporary design name must not become a permanent filename or technical namespace. The templates must remain easy to integrate with the future Jakarta EE application while current work focuses only on UI/UX.

## Decision

- Implement five linked semantic HTML templates in the existing customer web concept directory: discovery, results, property profile, booking-request review, and customer login.
- Use neutral runtime filenames and neutral CSS/JavaScript identifiers.
- Split frontend resources into shared design tokens, base rules, reusable components, and small page-specific files.
- Use modern vanilla JavaScript modules and no jQuery.
- Keep the HTML templates backend-neutral so they can later be converted into JSF/Facelets or another approved rendering architecture.
- Reuse supplied image assets, add optimized WebP variants, and create only missing standalone visual assets.
- Treat the existing nested `public_html` directory as legacy copied output, not a second source of truth.

## Consequences

### Positive

- Shared assets are cached across pages.
- The prototype remains framework-independent and easy to inspect.
- Temporary branding does not leak into long-lived file names.
- Responsive and accessibility behavior can be verified before backend integration.

### Tradeoffs

- Shared header/footer markup is duplicated until a server-side template layer is approved.
- Mock state is browser-local and intentionally non-persistent.
- The legacy copied output remains present until removal is approved separately.

## Alternatives Considered

- One standalone CSS/JavaScript bundle per page: rejected because it duplicates common behavior and weakens caching.
- One large bundle for all pages: rejected because every page would load unused code.
- Immediate JSF conversion: deferred because the approved scope is UI/UX template creation only.
