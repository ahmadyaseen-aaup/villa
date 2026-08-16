# ADR-0003: Customer Results Map and Draggable Sheet

## Status

Accepted — 16 August 2026.

## Context

The mobile search-results template initially used a static map image and a fixed result sheet. The approved customer experience requires geographic price markers synchronized with property cards, automatic result refresh after map movement in the eventual connected application, and a result sheet that customers can resize without losing list or grid browsing.

The current delivery remains a static frontend prototype, so it must demonstrate the interaction honestly without implying live availability, backend map-bound searches, device geolocation, or final pricing.

## Decision

- Use Leaflet 1.9.4 as the lightweight interactive-map library for the mobile HTML prototype.
- Use standard OpenStreetMap raster tiles only for normal interactive prototype viewing and display the required attribution visibly.
- Keep tile URL, attribution, zoom limits, and initial camera configuration isolated in the results-page JavaScript so a production tile provider or self-hosted service can replace the public tile service without redesigning the UI.
- Retain the optimized static map image and semantic price-marker buttons as the no-script, offline, blocked-network, or library-failure fallback.
- Do not prefetch, bulk-download, or package public OpenStreetMap tiles for offline use.
- Keep mock property coordinates in the frontend prototype. The connected application will obtain authorized property coordinates and map-bound results from versioned backend APIs.
- Start with a 70% results sheet and 30% visible map. Support continuous pointer dragging with 18%, 50%, and 70% result-sheet snap points.
- Expose the resize handle as an accessible horizontal separator with Arrow, Page Up/Down, Home, and End keyboard behavior. Keep the existing toggle button as a direct map-focused/results-focused action.
- Preserve marker/card selection synchronization, RTL/LTR behavior, reduced-motion support, and native vertical card scrolling.

## Security and Privacy

- No map key or credential is required for the approved prototype provider.
- A future keyed provider must inject configuration outside source control, restrict browser keys by authorized HTTPS origins and API scope, and apply quotas and billing alerts.
- Do not transmit customer identity, booking details, contact data, or other confidential values to the tile provider.
- Real device location remains out of scope until consent, permissions, failure handling, and privacy documentation are approved.

## Performance and Resilience

- Vendor the pinned Leaflet distribution under the mobile asset tree, load it only on the results page, and verify the runtime with Subresource Integrity.
- Initialize the live map progressively over the preloaded static fallback.
- Throttle sheet-drag rendering to animation frames and avoid resizing the underlying map canvas while the sheet overlays it.
- Debounce map movement notifications and retain the static fallback when the library or tile network is unavailable.

## Consequences

### Positive

- The prototype demonstrates production-like pan, zoom, marker selection, result synchronization, and adjustable map/list balance.
- Leaflet keeps the page-specific JavaScript cost relatively small and avoids provider lock-in.
- A fallback remains available for offline or restricted-network demonstrations.

### Tradeoffs

- The public OpenStreetMap tile service is best-effort and is not the approved production hosting dependency.
- Raster styling is less brand-customizable than a MapLibre vector-map stack.
- The connected application still requires backend bounds queries, authorization, observability, and a production tile-provider decision.

## Alternatives Considered

- Google Maps JavaScript API: deferred because production use requires billing, a restricted browser key, and provider-specific commercial terms.
- MapLibre GL JS with vector tiles: deferred because its styling power and larger WebGL runtime are unnecessary for the current marker-focused prototype.
- Keep the static map only: rejected because it cannot demonstrate panning, zooming, real geographic markers, or the approved interactive result-sheet behavior.
