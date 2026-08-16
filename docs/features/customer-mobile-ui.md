# Customer Mobile UI Templates

## Status

Approved for UI/UX prototype implementation on 16 August 2026; mobile customer login added on 17 August 2026.

## Purpose

Define the Arabic-first customer mobile journey represented by the four approved images and complementary mobile login in `src/main/webapp/nesma-ui/customer/mobile`:

1. Home discovery.
2. Search and map results.
3. Property profile.
4. Booking-request review.
5. Customer login.

The existing customer web templates provide the content, interaction, accessibility, and business-rule reference. The implementation remains a static frontend prototype without backend persistence, live availability, pricing validation, booking creation, or payment processing.

## Shared Experience Rules

- Use Google Cairo, deep teal, coral actions, warm white surfaces, rounded app-like sheets, and image-led hierarchy.
- Render Arabic RTL first and use CSS logical properties so English, Hebrew, and Turkish layouts can be supported later.
- Use one shared bottom navigation on discovery and results, contextual back navigation on property and request screens, and fixed action trays only for consequential actions.
- Keep adults, children, and infants separate throughout discovery, property selection, handoff, and booking review.
- Do not force a booking type during discovery. Property-defined periods are selected only on the property screen.
- Reuse responsive WebP imagery with explicit dimensions, eagerly load only the dominant first image, and lazy-load supporting media.
- Keep all CSS and JavaScript in imported files under `mobile/assets`; do not use inline style or script values.
- Use native dialogs as accessible bottom sheets and modal viewers with Escape, backdrop close, focus restoration, visible labels, and reduced-motion support.

## Screen Requirements

### Home discovery

- Match the reference's cinematic hero, overlaid search surface, circular sponsored stories, horizontal city rail, seasonal campaign, recommendation cards, and persistent bottom navigation.
- Destination and dates remain optional. The date sheet uses a full one-month range calendar.
- Sponsored stories remain explicitly labeled and separate from personalized or organic recommendations.
- Treat the story rail as a dedicated sponsored placement with one visible sponsorship label beside the section title; keep sponsorship visible again inside the fullscreen viewer because the section heading is no longer in context there. Preserve native button semantics and expose both story and image position.
- Group multiple timed images under each story. Each image gets its own progress segment and automatically advances to the next image or story. Provide an explicit pause/resume control, pause on press-and-hold and while the document is hidden, and resume from the elapsed position.
- Use a short crossfade for images within one story and a longer logical inline slide transition when crossing between stories. Keyboard arrows, swipe direction, tap zones, progress origin, navigation icons, and story transitions must mirror correctly in RTL and LTR.
- Show destination selection, recent local choices, and a useful no-results recovery state without introducing real geolocation in the static prototype.
- Explain calendar state with visible arrival and departure summaries while allowing a single discovery date, an overnight range, or no dates; do not force a booking type.
- Keep personalized recommendation cards organic, sufficiently wide for property, rating, location, and indicative starting-price scanning, with anonymous favorites routed through the sign-in handoff.
- Follow the web discovery hierarchy after seasonal offers with a broadly popular organic collection and dedicated villa collections for Aqaba, Dubai, and Istanbul before the personalized collection. Mobile rails may show a representative subset with a route to the complete filtered results; supporting images remain lazy-loaded and responsive.
- Use distinct responsive destination media, touch-safe controls, reduced-motion-safe transitions, and logical positioning for RTL and LTR.

### Search and map results

- Match the full-map composition, floating search and filters, price markers, draggable-style result sheet, image-led cards, and bottom navigation.
- Marker and card selection stay synchronized. Filters are functional local prototype controls.
- Provide a remembered two-mode results control: a detailed vertical list by default and a compact two-column grid for faster browsing. Both modes retain property name, location, rating, and indicative starting price; the list additionally retains facts and the explicit details action.
- Start the result sheet with 70% of the available results viewport and the map with 30%. Allow continuous handle dragging between 18%, 50%, and 70% sheet-height snap points, with equivalent keyboard controls and a map-focused toggle state.
- Use a progressively enhanced Leaflet map with OpenStreetMap tiles for the prototype, visible attribution, synchronized geographic price markers, and the existing static image and markers as the failure or offline fallback. Keep the tile URL and attribution configurable so production hosting can replace the public prototype tile service.
- Dates remain optional and all period types may be discovered together.

### Property profile

- Match the full-width gallery, overlaid back/favorite/share actions, facts, editorial detail sections, amenity rail, exact public map location, property-defined period chips, verified review, and persistent booking action.
- Use production-readable typography, touch-safe controls, restrained section rhythm, and a compact profile header that appears after the hero leaves the viewport.
- Make the full-width hero itself a swipeable image carousel: a horizontal swipe changes the image in place while a tap opens the immersive gallery at the currently visible image. Keep its counter and dots synchronized with the fullscreen viewer, preserve native vertical scrolling, and mirror touch and keyboard direction correctly in RTL and LTR.
- Use an immersive gallery viewer with thumbnails, adjacent-image preloading, reduced-motion handling, and keyboard, button, and swipe navigation that mirrors correctly in RTL and LTR.
- Present the host, property highlights, period schedules and indicative prices, rating dimensions, and accessible full-facilities and full-reviews sheets without exposing private operational details.
- Reuse the progressively enhanced Leaflet/OpenStreetMap prototype for the exact public location, with lazy initialization, visible attribution, and the optimized static map as the offline or tile-failure fallback.
- Use a booking bottom sheet with an initially empty full calendar, period-specific single-date or overnight-range behavior, categorized guests, capacity feedback, and a clearly provisional estimate.
- Do not expose access instructions or private arrival details before the required booking and payment conditions.

### Booking-request review

- Match the reference's compact header, property summary, review rows, contact surface, price breakdown, contextual guidance, terms, and fixed final action.
- Preserve the visual hierarchy but do not reproduce the reference image's customer service fee, refundable damage deposit, combined guest count, or fixed timer values because they conflict with approved requirements.
- Keep accommodation, add-ons, configured taxes, and provisional total distinct. The customer pays no separate platform service fee, and no damage-deposit row appears.
- Use production-readable Cairo typography, touch-safe controls, a compact four-step progress indicator, a single edit action per information group, categorized guest summaries, and a fixed action that presents one primary decision without hiding required content.
- Make contact editing reversible: opening the editor captures the current values, cancellation restores them, saving validates and updates the visible summary, and form submission reveals and focuses invalid contact fields.
- Explain the request lifecycle in three concise steps, keep legal and cancellation disclosures accessible in dedicated dialogs, and clearly state that owner approval and successful required payment are still needed before confirmation.
- Submission is simulated and explicitly states that no request, inventory hold, charge, or reservation was created.

### Customer login

- Provide a dedicated `05-login.html` experience instead of sending mobile customers to the desktop login template.
- Use a mobile-native, image-led welcome surface consistent with the discovery palette and visual language, followed by a focused authentication sheet.
- Support username and password entry plus Google and Apple provider handoffs. Keep provider, recovery, registration, session, and account-merging behavior truthful and unimplemented until the corresponding backend and unresolved product decisions are approved.
- Use explicit labels, appropriate autocomplete values, inline required-field validation, password visibility, Caps Lock feedback, visible focus, touch-safe controls, and reduced-motion behavior.
- Preserve a safe, allowlisted `returnTo` target for the originating mobile screen and adapt the welcome copy when login was requested to save a favorite.
- Never persist, log, or transmit credentials in the static prototype, and explicitly confirm that no authenticated session was created.
- Route all mobile account and anonymous-favorite sign-in entry points to the mobile login while leaving the customer-web login unchanged.

## Traceability

- Business requirements: sections 7, 12, 14, 15, 16, 17, 23, 34, and 35 of `docs/buss_req.md`.
- Mobile template decision: `docs/decisions/0002-customer-mobile-html-template-structure.md`.
- Implementation plan: `docs/plans/customer-mobile-ui.md`.
