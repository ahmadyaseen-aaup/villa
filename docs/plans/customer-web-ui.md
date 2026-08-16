# Customer Web UI Implementation Plan

## Status

Approved and implemented on 14 August 2026. The home visual refinement was completed on the same date; the sponsored-story interaction and sticky discovery header refinements were implemented on 15 August 2026; search results, login, and property-profile refinements were implemented on 16 August 2026.

## Deliverables

- Five responsive linked HTML templates.
- Shared neutral CSS design system and page-specific CSS.
- Shared neutral JavaScript utilities and page-specific interactions.
- Optimized runtime image variants.
- Desktop and mobile browser verification.
- A design QA report comparing each implemented page with its supplied source image.

## Implementation Sequence

1. Establish neutral tokens, base styles, shared components, navigation, footer, dialogs, and accessibility behavior.
2. Rebuild home discovery without a required booking type and with categorized guests.
3. Build search results with desktop split view and mobile list/map modes.
4. Build the property profile with responsive gallery and booking controller.
5. Build booking-request review without a damage deposit or customer platform service fee.
6. Validate HTML structure, JavaScript syntax, responsive behavior, keyboard interactions, console errors, and page performance.
7. Compare rendered output with the source images and iterate until P0/P1/P2 design-QA findings are resolved.

## Customer Login Template

Approved for implementation on 16 August 2026.

1. Add a dedicated neutral `05-login.html` page with a cinematic accommodation image, a restrained sign-in surface, and the approved home-page color and Cairo typography system.
2. Provide accessible username/password inputs, password visibility control, focused validation, Google and Apple actions, password recovery, and registration handoffs without simulating a real authenticated session.
3. Keep authentication state, credential transmission, OAuth/OpenID redirects, account merging, recovery, and registration persistence outside the static prototype.
4. Add cacheable page-specific `login.css` and `login.js` assets, responsive RTL/LTR-safe layout, reduced-motion support, and no inline CSS or JavaScript.
5. Route header login links and existing favorite sign-in dialogs to the dedicated login template.
6. Verify HTML structure, JavaScript syntax, desktop/mobile layout, keyboard operation, focus visibility, and console health before release handoff.

## Search and Map Results Visual Refinement

Approved for implementation on 16 August 2026.

1. Bring `02-search-map-results.html` into the approved home-page design system with Cairo typography, compact sticky navigation, warm neutral surfaces, teal structure, coral actions, and neutral technical naming.
2. Replace the generic search summary with a responsive destination/date/guest control, retain optional dates and all-period discovery, and keep categorized guest values synchronized with the edit dialog.
3. Recompose organic results as image-led horizontal cards on desktop and full-width cards on mobile, preserving facts, rating, supported periods, and clearly labeled starting prices.
4. Move sponsored discovery into a dedicated visibly labeled media placement so it remains analytically and visually separate from organic ranking.
5. Keep list and map state synchronized, highlight matching cards and markers, remove the required map-refresh button, and demonstrate automatic refresh after map control interaction.
6. Preserve anonymous-favorite authentication handoff, accessible dialogs, keyboard focus, RTL/LTR-safe layout, reduced motion, responsive WebP sources, lazy loading below the first result, and page-specific CSS/JavaScript assets.
7. Verify desktop and mobile layouts, list/map switching, search summary updates, filter count/reset/apply behavior, map controls, card/marker emphasis, navigation, console health, JavaScript syntax, and Maven packaging.

## Property Profile Visual Refinement

Approved for implementation on 16 August 2026.

1. Bring `03-villa-profile.html` into the homepage and results visual system with Cairo typography, warm ivory, deep teal, coral booking actions, compact sticky navigation, neutral technical naming, and no inline CSS or JavaScript.
2. Recompose the hero as a responsive asymmetric four-image gallery and add one accessible native-dialog viewer with thumbnails, position and caption feedback, RTL/LTR-aware button, keyboard, and swipe navigation, and reduced-motion handling.
3. Reorder tablet and mobile content so the booking controller follows the gallery before extended details, while desktop retains an editorial content column beside a sticky booking controller and mobile retains the persistent bottom action.
4. Replace basic date inputs with a dependency-free two-month desktop/one-month mobile calendar. Support overnight ranges and single service dates according to the selected property-defined period, disable past dates, and maintain keyboard navigation and localized summaries.
5. Keep adults, children, and infants separate, enforce the known adult-and-child capacity without inventing infant rules, and update provisional accommodation estimates by period and overnight length without showing a customer service fee or damage deposit.
6. Present exact public location, host, facts, facilities, property-defined period schedules, verified-stay reviews, rating dimensions, and action-adjacent price/availability guidance without passive MVP explanation sections.
7. Preserve anonymous favorite sign-in handoff, native sharing with clipboard fallback, responsive WebP sources, lazy supporting imagery, keyboard focus, direction-safe layout, and static-template disclosure that no real booking, availability validation, or payment occurs.
8. Verify gallery, calendar, period switching, categorized guests, price recalculation, desktop sticky behavior, mobile booking action, RTL/LTR semantics, console health, JavaScript syntax, and Maven packaging.
9. Reuse the homepage footer markup and neutral shared footer stylesheet; hide the persistent mobile booking action when the footer enters view so the shared footer remains fully readable.

## Booking Request Review Visual Refinement

Approved for implementation on 16 August 2026.

1. Bring `04-booking-request-review.html` into the approved home-page visual system with Cairo typography, warm ivory, deep teal, coral actions, restrained motion, and neutral technical naming.
2. Extract the home header's static navigation treatment into a small shared marketplace-header stylesheet, reuse it on home and booking review, and reuse the exact home footer markup and shared footer stylesheet.
3. Recompose the page as an image-led reservation document beside a sticky price-and-action panel, with a compact four-stage progress indicator and a responsive single-column flow.
4. Keep period, localized date or range, adults, children, and infants synchronized from the property-profile handoff while keeping the three guest categories separate.
5. Distinguish accommodation, add-ons, configured taxes, and provisional total; do not show a customer service fee or damage-deposit row, and keep final-price validation explicit near the action.
6. Add accessible native contact validation, explicit terms recovery, a non-blocking simulated submit state, and an honest result dialog stating that no request, hold, payment, or reservation was created.
7. Explain request verification, owner approval, and post-approval payment without inventing property-specific timer values; keep confidential access details and payment entry outside this page.
8. Verify shared navigation and footer behavior, query-state rendering, desktop/mobile layouts, keyboard and validation flows, reduced motion, JavaScript syntax, console health, and Maven packaging.

## Home Visual Refinement

1. Treat `public_html/index.html` as a visual reference while retaining `01-home-discovery.html` as the only current homepage source of truth.
2. Recompose the header, hero, overlapping discovery form, sponsored and property rails, asymmetric destination mosaic, campaign pair, popular properties, and footer around the approved compact marketplace layout.
3. Preserve date-optional discovery, all-period search, separate adult/child/infant counts, sponsored labeling, anonymous-favorite sign-in behavior, and neutral naming.
4. Keep the existing shared token/component system and page-specific `home.css` and `home.js`; do not introduce page-level CSS/JavaScript or another runtime asset tree.
5. Validate carousel, menu, popover, guest-counter, dialog, and search-handoff behavior plus `320px` through `2048px` responsive layouts.
6. Compare matched desktop, mobile, focused hero/search, and lower-page screenshots against the approved reference and pass design QA.
7. Apply the approved Google Cairo typography with a swap-based fallback and simplify the compact header by removing the list glyph while retaining a text-labeled mobile menu control.
8. Replace the equal-width city rail with a six-destination asymmetric mosaic: one dominant two-row destination with five supporting destinations, collapsing to two columns on tablets and one column on mobile.

## Home Discovery Intelligence Refinement

1. Replace quick destination chips with an accessible combobox/listbox experience covering city, area, landmark, country, and property-name discovery plus a useful no-results recovery path.
2. Replace native date inputs with a dependency-free, localized calendar that renders two months on desktop and one on mobile, supports a service date or overnight range, remains keyboard operable, and keeps dates optional.
3. Add a synchronized mobile search summary that appears after the main form leaves view and returns the customer to discovery without forcing dates or a booking type.
4. Enrich organic cards with capacity, bedrooms, a key amenity, rating, and business-correct starting-price language.
5. Add reusable loading, empty, error, offline, ready, and retry surfaces for dynamic recommendation content.
6. Remove passive homepage notes and the general trust/explanation section; keep contextual guidance only where a customer is taking a consequential action or needs recovery help.
7. Enable personalization by default, show recommendations without a homepage permission gate, and keep the contextual recently-viewed clear action. Implement personalization enable/disable and comprehensive preference-history controls on the future customer settings page.
8. Verify keyboard autocomplete and calendar navigation, single-date/range search handoff, default personalization behavior, real-interaction history, sponsored/organic separation, absence of homepage settings entry points, mobile sticky behavior, target sizing, console health, and `320px` through `2048px` layouts.

## Sponsored Story Interaction Refinement

1. Convert sponsored-property cards into compact circular story triggers that retain an explicit sponsored badge and use the approved coral, teal, and warm accent palette.
2. Add one reusable native-dialog viewer with active-slide progress, pause/resume, previous/next navigation, a `View property` action, and no booking or availability claim.
3. Keep navigation logical across locales: controls use CSS logical placement, icons and arrow keys mirror between RTL and LTR, and swipe direction follows reading direction.
4. Preserve keyboard focus, restore focus to the originating story, expose slide changes through a polite live region, and disable non-essential transitions when reduced motion is requested.
5. Reuse existing responsive imagery, keep homepage thumbnails lazy, load only the active viewer image, and preload at most the next slide.
6. Persist viewed state while personalization is enabled and include it in the existing behavioral-history reset.
7. Verify the rail and viewer at desktop and mobile widths, in both RTL and LTR, with pointer, keyboard, and reduced-motion checks plus console and HTML/JavaScript validation.

## Sticky Discovery Header Refinement

Approved and implemented on 15 August 2026.

1. Make the tablet and desktop home header sticky while preserving the current navigation and utility actions in the initial state.
2. Add a lightweight compact destination/date/guest control that replaces the navigation only after the full discovery form clears the header, and restore the navigation when the form returns.
3. Synchronize the compact summaries with the canonical form and reuse the existing destination, calendar, and categorized-guest overlays without duplicating their markup or submitted values.
4. Keep language, favorites, and login at the visual end, and expose the displaced navigation through the existing text-only menu control without the removed list icon.
5. Use direction-safe layout and overlay positioning for RTL and LTR, preserve focus and Escape behavior, remove inactive controls from the accessibility tree, and disable non-essential motion for reduced-motion users.
6. Keep the approved mobile bottom search summary instead of adding a second persistent mobile search control.
7. Use `IntersectionObserver` with a passive, animation-frame-batched fallback and animate only opacity and transform; retain the solid header surface and avoid backdrop blur.
8. Verify desktop, tablet, and mobile states, scroll reversal, destination/date/guest overlays, submission, navigation recovery, keyboard use, reduced motion, and console health.

## City Villa Collection Refinement

Approved and implemented on 15 August 2026.

1. Add three organic villa rails immediately after the general popular-property section for Aqaba, Dubai, and Istanbul.
2. Provide six distinct properties per city with capacity, bedroom count, key amenity, rating, and date-free starting-price language; retain the anonymous-favorite sign-in behavior and destination-filtered `View all` handoff.
3. Keep sponsored content outside the collections and preserve organic tracking semantics for recently viewed and enabled recommendation behavior.
4. Use city-specific, card-safe imagery with 640px and 1280px WebP sources, compressed JPEG fallbacks, fixed image dimensions, native lazy loading, and asynchronous decoding.
5. Reuse the shared property-card and rail components without horizontal padding on the rail wrapper, place the fully visible next/previous controls just outside the logical reading end/start at a `-1.5rem` inset with mirrored icons and matching RTL/LTR movement, and retain touch scrolling and snap points without adding another frontend dependency.
6. Verify city content, unique identifiers, image references, desktop arrow operation, mobile overflow, RTL/LTR direction, favorites, destination links, console health, and Maven tests.

## Out of Scope

- Backend APIs.
- Authentication persistence.
- Real maps or geolocation.
- Live availability and pricing.
- Payment processing.
- Real booking creation.
- Final product branding.
