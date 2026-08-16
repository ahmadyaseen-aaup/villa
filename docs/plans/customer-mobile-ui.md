# Customer Mobile UI Implementation Plan

## Status

Approved for implementation on 16 August 2026.

The mobile-home production-polish refinement was approved and implemented on 16 August 2026.

The mobile property-profile production-polish refinement was approved and implemented on 17 August 2026.

The mobile booking-review production-polish refinement was approved and implemented on 17 August 2026.

The dedicated mobile customer-login template was approved and implemented on 17 August 2026.

## Implementation Sequence

1. Establish neutral mobile tokens, base layout, touch targets, bottom navigation, accessible dialogs, guest counters, calendar, toast, and shared state utilities.
2. Implement home discovery from the mobile reference with optional destination and range dates, categorized guests, story viewer, destination rail, campaign, recommendation cards, and results handoff.
3. Implement map results with synchronized geographic price markers and result cards, a progressively enhanced Leaflet/OpenStreetMap prototype with a static fallback, functional local filters, remembered detailed-list and two-column-grid modes, a draggable 30/70 default result sheet with accessible snap points, favorites handoff, and property navigation.
4. Implement the property profile with image viewer, share and favorite actions, editorial details, public map location, property-defined periods, range or single-date calendar behavior, categorized guests, price estimate, and booking-review handoff.
5. Implement booking review with synchronized period, dates, and guest categories; editable contact details; business-correct provisional pricing; contextual request guidance; accessible validation; and a truthful simulated success state.
6. Implement the dedicated mobile login with username/password, Google and Apple handoffs, safe contextual return navigation, accessible local validation, and truthful prototype boundaries.
7. Verify JavaScript syntax, HTML asset references, no inline CSS or JavaScript, responsive mobile widths, RTL and logical layout behavior, primary journey navigation, keyboard interactions, reduced motion, console health, and Maven packaging.
8. Compare image-based screens against their corresponding `1170 × 2532` source image at a normalized `390 × 844` CSS viewport, resolve P0/P1/P2 fidelity findings, and record the final comparison in `design-qa.md`.

## Mobile Home Refinement

1. Increase discovery, calendar, counter, favorite, and navigation touch comfort while allowing natural vertical scrolling instead of compressing the first viewport.
2. Keep the circular story rail as a dedicated sponsored placement and remove sponsored inventory from personalized recommendations.
3. Correct story-trigger semantics and keep one sponsorship badge at the section level plus one in the contextual fullscreen viewer. Group multiple timed images per story; add per-image segmented progress, automatic image/story advancement, explicit pause/resume, press-and-hold pause, document-visibility pause, viewed state, next-image preloading, tap zones, keyboard navigation, and direction-aware swipe navigation. Distinguish the short within-story image crossfade from the longer between-story logical slide transition in RTL and LTR.
4. Add selected destination, recent local destination, filtering, and no-results states while retaining custom text submission and keeping real geolocation outside the static-prototype scope.
5. Add visible arrival/departure calendar state, single-date/range guidance, disabled month navigation, and a state-aware apply action while retaining date-free discovery.
6. Remove unresolved age-policy copy, keep adults/children/infants separate, and expose unmistakable minimum/maximum counter states.
7. Replace reused destination media with six distinct, optimized 640px/1280px WebP assets and keep below-fold imagery lazy.
8. Verify 320px, 390px, and 480px layouts; RTL and LTR; dialogs; keyboard and swipe behavior; semantic roles; reduced motion; asset loading; JavaScript syntax; console health; and Maven packaging.
9. Align mobile discovery depth with the approved web homepage by adding compact, lazy-loaded rails for broadly popular properties and Aqaba, Dubai, and Istanbul villas, while retaining the separate organic personalized collection and filtered “view all” routes.

## Mobile Property Profile Refinement

1. Preserve the reference's image-led composition while replacing compressed prototype sizing with readable Cairo typography, touch-safe controls, calm editorial spacing, and a persistent booking action that respects the device safe area.
2. Add a compact profile header after the hero scrolls away, retaining contextual back, favorite, and share actions without duplicating visible navigation chrome in the hero state.
3. Upgrade the gallery to an immersive native dialog with thumbnails, position feedback, adjacent-image preloading, short directional transitions, reduced-motion support, and RTL/LTR-correct button, keyboard, and swipe navigation. Make the profile hero directly swipeable, synchronize its image, counter, and dots with the dialog, and open the dialog at the currently displayed image when the hero is tapped.
4. Add the host summary, property highlights, complete facilities sheet, property-defined period schedules and indicative prices, verified rating dimensions, and an accessible reviews sheet using the approved customer-web content hierarchy.
5. Reuse the vendored Leaflet/OpenStreetMap prototype for the exact public property location, initialize it only near the viewport, preserve attribution, and retain the optimized static image when tiles or JavaScript fail.
6. Start the booking calendar without stale hardcoded dates, use a range only for overnight periods, use one date for other property periods, keep adults, children, and infants separate, and enforce the known adult-and-child capacity without inventing infant policy.
7. Keep all estimates visibly provisional, preserve the review-page handoff, and continue to state truthfully that the static prototype creates no availability lock, booking request, charge, or reservation.
8. Verify 320px, 390px, and 480px layouts; RTL and temporary LTR rendering; sticky navigation; gallery controls; facilities and review sheets; map enhancement and fallback; calendar and guest-capacity behavior; JavaScript syntax; console health; and Maven packaging.

## Mobile Booking Review Refinement

1. Preserve the approved reference hierarchy while replacing compressed prototype sizing with readable Cairo typography, touch-safe controls, calm section rhythm, and a safe-area-aware fixed submit action.
2. Add a compact four-step progress header, an image-led property summary consistent with the profile page, and one clear edit path for trip details.
3. Keep adults, children, and infants separate; validate imported date and count query state; derive a truthful duration label; and preserve the provisional amount without recalculating unresolved taxes or fees in the client.
4. Make contact editing reversible and accessible, update the visible contact summary only after successful validation, and reveal invalid hidden inputs during final form validation.
5. Add an optional request character count, distinct accommodation/add-on/tax rows, a no-service-fee assurance, configurable-policy dialogs, and a concise three-step explanation of the request lifecycle.
6. Keep submission explicitly simulated, preserve focus restoration, and state that no data, inventory hold, charge, request, or reservation is created by the static template.
7. Verify 320px, 390px, and 480px layouts; RTL and temporary LTR rendering; query-state hydration; contact save/cancel; optional-message state; policy dialogs; terms validation; simulated submission; JavaScript syntax; console health; and Maven packaging.

## Mobile Customer Login

1. Add a dedicated, image-led mobile login screen that reuses the discovery palette and shared mobile primitives without importing the desktop login layout.
2. Provide username and password fields, Google and Apple provider handoffs, password visibility, Caps Lock feedback, required-field validation, and accessible status messaging.
3. Route mobile account and favorite entry points to this screen with a contextual, allowlisted return target and no open-redirect path.
4. Keep credentials entirely in the browser form, never persist or transmit them in the static prototype, and clearly state that no authenticated session was created.
5. Keep account recovery, native registration, identity-provider redirects, verification, and account merging behind future backend and product decisions.
6. Verify 320px, 390px, and 480px layouts; RTL and temporary LTR rendering; validation; password visibility; provider, recovery, and registration notices; safe-return behavior; reduced motion; console health; and Maven packaging.

## Out of Scope

- Backend APIs and persistence.
- Native-device packaging.
- Real device geolocation. The approved interactive prototype map uses public OpenStreetMap tiles under ADR-0003; a production tile-hosting decision remains required before launch.
- Authentication sessions.
- Live availability and final pricing.
- Inventory holds, booking creation, and payment processing.
