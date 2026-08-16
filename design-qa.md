# Destination Mosaic Design QA

## Comparison Target

- Source visual truth: `/Users/ahmadyaseen/NetBeansProjects/keygoUI/src/main/webapp/index.html`, `.featured-destinations-section` and `.destinations-grid`.
- Supporting source capture: `/Users/ahmadyaseen/NetBeansProjects/villa/src/main/webapp/nesma-ui/customer/web/qa/keygo-comparison-2026-08-15/07-keygo-lower-discovery.png` (`1425px` wide; the capture shows the destination heading but not the complete mosaic).
- Implementation: `http://127.0.0.1:4173/01-home-discovery.html#destinations-title`.
- Implementation screenshot: not captured.
- Viewport, CSS size, and density normalization: not available because browser screenshot capture is blocked.
- State: Arabic RTL homepage, destination section.

## Full-view Comparison Evidence

Blocked. The available in-app browser can open the implementation for the user, but the current tool surface cannot capture or inspect that browser tab. The existing Keygo screenshot does not contain the complete destination grid, so it is not valid full-view comparison evidence.

## Focused Region Comparison Evidence

Blocked for the same reason. Source structure and measurements were taken from the Keygo HTML/CSS, but code and file paths alone do not qualify as visual QA evidence.

## Static Checks Completed

- The destination rail and its arrow controls were removed.
- The new six-destination mosaic uses one five-column, two-row featured card and five supporting cards across unequal grid spans.
- Responsive rules reduce the layout to two columns on tablets and one column on mobile.
- CSS logical positioning preserves RTL/LTR behavior.
- Existing responsive WebP assets are reused with lazy loading and explicit dimensions.
- HTML tag balance, CSS brace balance, JavaScript syntax, asset existence, and inline-resource restrictions pass.

## Findings

- No visual severity can be assigned without a valid rendered implementation capture and a complete source-region capture.

## Comparison History

- Initial implementation completed from the selected Keygo destination structure and the current marketplace theme.
- No screenshot-based iteration has been performed.

## Blocker

Visual capture and browser inspection require an available in-app browser control surface or explicit permission to run Playwright directly.

final result: blocked

---

# Customer Mobile HTML Design QA

## Comparison Target

- Source visuals: `src/main/webapp/nesma-ui/customer/mobile/01-home-discovery.png` through `04-booking-request-review.png`.
- Normalized viewport: `390 × 844` CSS pixels, matching the `1170 × 2532` source captures at 3× density.
- Implementations: `src/main/webapp/nesma-ui/customer/mobile/01-home-discovery.html` through `04-booking-request-review.html`.
- Final screenshots: `src/main/webapp/nesma-ui/customer/mobile/qa/*-390x844.png`.
- State: Arabic RTL, initial page state; core journey interactions were tested separately.

## Comparison History

1. Initial captures showed oversized search, result, profile, and review sections that pushed key source content below the first viewport.
2. Shared navigation centering was corrected for RTL, and section dimensions, typography, rails, cards, maps, fixed actions, and spacing were normalized to the source composition.
3. Each final reference and implementation screenshot was reviewed together in the same comparison input.

## Findings

- P0: none.
- P1: none.
- P2: property imagery reuses the approved optimized customer-web assets rather than reproducing the generated source-image villas exactly. Composition, crop behavior, hierarchy, and interaction affordances match the selected mobile direction.
- P2: booking-review rows for a customer service fee, refundable damage deposit, combined guest count, and fixed one-hour timers were intentionally excluded because they conflict with approved business requirements. The implementation uses separate guest categories, provisional taxes, and configuration-driven timing copy.

## Verification

- Home destination, range calendar, guest categories, story viewer, and search handoff passed.
- Map markers, result rail, collapse state, and filter dialogs passed.
- Profile expansion, gallery navigation, period selection, calendar, guest picker, estimate, and review handoff passed.
- Review query-state hydration, terms validation, and truthful simulated submission dialog passed.
- All four pages produced no browser console warnings or errors.
- JavaScript syntax checks, inline-resource restrictions, `git diff --check`, and `mvn -q verify` passed.
- CSS uses logical properties for directional layout; the remaining physical coordinates are limited to viewport centering and geographic map markers. LTR directional-icon overrides are included.

final result: passed

---

# Customer Mobile Login QA

## Target

- Implementation: `src/main/webapp/nesma-ui/customer/mobile/05-login.html`.
- Visual direction: complementary mobile adaptation of the approved customer-web login and customer-mobile discovery system; no separate source image was supplied.
- Primary viewport: `390 × 844` CSS pixels, with additional checks at `320 × 720` and `480 × 900`.
- Direction checks: production Arabic RTL plus a temporary LTR rendering using the same CSS and JavaScript.

## Findings

- P0: none.
- P1: none.
- P2: Google, Apple, recovery, registration, and authenticated-session behavior remain explicit prototype handoffs until their backend services and unresolved product decisions are approved.
- Accepted difference: the mobile screen uses a compact image-led welcome and overlapping authentication sheet instead of adapting the desktop split-screen composition.

## Measurements

- Back and brand targets measured `44px` high.
- Provider actions measured `58px`; credential inputs and the primary action measured `52px`.
- Document client width equaled scroll width at 320px, 390px, and 480px; no horizontal overflow was present.
- The mobile sheet begins at approximately `272px` in the 390px viewport and scrolls naturally for compact screens.

## Verification

- Account navigation from mobile home opened the dedicated mobile login and preserved the correct return target.
- Favorite entry points carry contextual copy without changing authentication behavior.
- Missing username and password values showed distinct inline errors and focused the first invalid field.
- Password visibility updated input type, icon, accessible label, and pressed state; Caps Lock feedback is available without altering the password value.
- Google, recovery, and prototype-submit notices opened correctly and restored focus to their triggers.
- The prototype never persisted or transmitted credentials and explicitly confirmed that no session was created.
- External and malformed `returnTo` values fell back to mobile home; allowlisted mobile filenames preserved their safe query and fragment state.
- Temporary LTR rendering mirrored back and submit arrows, placed field icons and logical padding correctly, and retained zero horizontal overflow.
- Reduced-motion behavior removes entrance transitions and the simulated local validation delay.
- Browser console, JavaScript syntax, inline-resource restriction, CSS structure, `git diff --check`, and `mvn -q verify` passed.

final result: passed

---

# Customer Mobile Property Profile Refinement QA

## Comparison Target

- Source visual truth: `src/main/webapp/nesma-ui/customer/mobile/03-villa-profile.png` (`1170 × 2532`, a 3× conceptual mobile capture).
- Implementation: `src/main/webapp/nesma-ui/customer/mobile/03-villa-profile.html`.
- Browser route: `http://127.0.0.1:4175/mobile/03-villa-profile.html?v=final`.
- Primary implementation evidence: `/tmp/villa-profile-refinement/11-final-top-390x844.png`.
- Focused evidence: gallery `/tmp/villa-profile-refinement/05-gallery.png`, map and periods `/tmp/villa-profile-refinement/07-map-periods.png`, booking sheet `/tmp/villa-profile-refinement/12-final-booking-sheet.png`, 320px viewport `/tmp/villa-profile-refinement/08-top-320x720.png`, 480px viewport `/tmp/villa-profile-refinement/09-top-480x900.png`, and temporary LTR rendering `/tmp/villa-profile-refinement/10-ltr-top.png`.
- Comparison state: Arabic RTL initial state at a `390 × 844` CSS viewport. The in-app browser capture measured `375 × 812` because browser chrome and the scrollbar consume part of the requested viewport, while runtime evaluation confirmed a `390 × 844` browser viewport.

The source is a vertically compressed conceptual composite whose normalized body copy and controls are below production accessibility targets. The implementation intentionally uses readable `14.08px` main copy, `44px` hero actions, a `52px` primary CTA, and normal vertical scrolling instead of forcing the source's unsafe density.

## Full-View Comparison Evidence

- The reference image and latest implementation screenshot were opened together in the same comparison input.
- The implementation preserves the image-led hero, corner action placement, title/rating/location hierarchy, four property facts, warm off-white surfaces, deep teal actions, coral emphasis, and rounded visual language.
- The implementation increases hero height and vertical rhythm intentionally, and adds host, highlights, amenities, public map, booking periods, and review content required by the approved mobile flow.

## Focused Evidence

- The immersive gallery was checked open and after navigation to image two, including visible position, thumbnail state, swipe affordance, and focus-safe controls.
- The exact public location map and property-defined booking periods were checked together in the scrolled state.
- The booking sheet was checked with an empty initial calendar, overnight date range, single-date full-day period, categorized guests, capacity enforcement, and provisional price estimate.
- Compact `320 × 720` and wide `480 × 900` viewports were checked for responsive hierarchy and horizontal overflow.
- A temporary LTR rendering verified mirrored directional controls and LTR gallery keyboard behavior before restoring the production RTL document.

## Findings

- P0: none.
- P1: none.
- P2: none.
- P3: the visible villa subject uses the project's approved optimized WebP imagery rather than reproducing the generated source villa exactly. Image-led composition, crop behavior, contrast, and hierarchy remain faithful to the reference direction.
- Accepted difference: the vertical density is intentionally expanded to meet readability and touch-target requirements instead of matching the source composite pixel-for-pixel.

## Required Fidelity Surfaces

- Typography: Cairo is used throughout with distinct display, heading, metadata, and body weights; the final body-copy measurement is `14.08px`.
- Spacing and geometry: hero actions measure `44 × 44`; the booking CTA is `52px` high; the interactive map is `224px` high; period cards are `104px` high; document width equals scroll width at 320px, 390px, and 480px.
- Color: shared warm-neutral, deep-teal, muted-blue, and coral design tokens are preserved from the customer mobile system.
- Images: existing optimized WebP assets are used with responsive sizing, appropriate crops, lazy loading below the fold, and adjacent gallery-image preloading.
- Copy and disclosure: location is public and approximate, exact property access remains protected, prices are explicitly provisional, and the calendar starts without fabricated dates.
- Icons: the existing Bootstrap Icons library is used consistently; no improvised visible graphics were introduced.
- States and actions: favorite/sign-in, share, about expansion, amenities, reviews, gallery, map enhancement, period selection, guest capacity, estimate, and booking-review handoff were exercised.

## Comparison History

1. Initial audit found undersized normalized body text and controls, an undersized map, and insufficient production interaction depth.
2. The first implementation added the complete production flow; QA then found full-page reveal behavior capable of hiding content and a booking-sheet horizontal overflow of `401px` inside a `359px` content width.
3. Reveal behavior was made non-blocking, the sheet overflow was removed, typography was tuned, and the final comparison reported no P0, P1, or P2 mismatch.

## Verification

- Sticky compact header activates after the hero leaves the viewport.
- The hero carousel passed direct RTL and LTR swipe checks without opening the dialog; its image, counter, dots, accessible label, and fullscreen viewer state remained synchronized. A tap opened the viewer at the current image, vertical scrolling remained available through `touch-action: pan-y`, and RTL keyboard progression passed.
- Fullscreen gallery buttons, swipe behavior, Home/End keys, and RTL/LTR arrow-key progression passed.
- Leaflet enhancement loaded OpenStreetMap tiles at the configured public coordinates with visible attribution; the static fallback remains available.
- Overnight selection requires a date range; full-day selection clears the checkout date and uses a single date; estimates update with the selected period.
- Adult and child counters enforce the shared capacity of six while infants remain a separate category.
- Successful booking review handoff carried period, price, date, and guest query state to `04-booking-request-review.html`.
- Amenities and reviews sheets opened and closed correctly.
- Final browser console contained no warnings or errors.
- JavaScript syntax checks, inline-resource restrictions, CSS structural checks, `git diff --check`, and `mvn -q verify` passed.

final result: passed

---

# Customer Mobile Home Refinement QA

## Target

- Implementation: `src/main/webapp/nesma-ui/customer/mobile/01-home-discovery.html`.
- Primary viewport: `390 × 844` CSS pixels.
- Additional responsive viewports: `320 × 720` and `480 × 900`.
- Direction checks: Arabic RTL implementation plus a temporary LTR test rendering using the same production CSS and JavaScript.
- Evidence: `qa/customer-mobile-home-refinement-2026-08-16/*.jpg`.

## Verified States

1. Initial discovery hierarchy and entrance motion.
2. Destination sheet, custom no-results recovery, recent destinations, and selected destination search handoff.
3. Date-free, single-date, and overnight-range calendar states with visible arrival/departure guidance.
4. Separate adult, child, and infant counters with disabled minimum states.
5. Full-screen sponsored story viewer with visible navigation, segmented position, viewed state, focus restoration, and RTL/LTR keyboard progression.
6. Favorites navigation and property favorite controls using the same anonymous sign-in handoff.
7. Seasonal campaign and wider organic personalized recommendation cards.
8. Six unique responsive destination images with successful local asset responses.

## Measurements

- Discovery rows: `309 × 48` CSS pixels at the 390px viewport.
- Search action: `309 × 48`.
- Favorite control: `44 × 44`.
- Story trigger: `72 × 94`.
- Bottom-navigation target: `72 × 61`.
- No horizontal document overflow at 320px, 390px, or 480px.

## Findings

- P0: none.
- P1: none.
- P2: real current-location discovery remains intentionally excluded because ADR-0002 keeps geolocation outside the static-prototype scope.
- P2: the temporary LTR test retains Arabic copy because localization content is not part of this refinement; layout order, logical placement, and direction-aware story navigation passed.

## Verification

- Native button semantics are preserved inside the sponsored story list.
- Sponsored inventory is absent from the personalized `مختارة لك` rail.
- Visible images, stylesheets, and Google Cairo finished loading in the checked home state.
- JavaScript syntax checks passed for `mobile-core.js` and `pages/home.js`.
- `mvn test` passed; the project currently contains no automated Java test sources.
- `mvn verify` passed and produced the WAR package.

final result: passed

---

# Customer Mobile Booking Review Refinement QA

## Comparison Target

- Source visual truth: `src/main/webapp/nesma-ui/customer/mobile/04-booking-request-review.png` (`1170 × 2532`, normalized from a 3× conceptual capture).
- Implementation: `src/main/webapp/nesma-ui/customer/mobile/04-booking-request-review.html`.
- Browser route: `http://127.0.0.1:4175/mobile/04-booking-request-review.html` with period, price, date, and categorized-guest query state from the property profile.
- Primary state: Arabic RTL at `390 × 844`; additional responsive checks used `320 × 720` and `480 × 900`.

The implementation preserves the reference's compact progress header, image-led property summary, grouped trip and contact information, transparent price review, contextual guidance, terms, and fixed primary action. It intentionally expands the source composite into a readable vertical flow with touch-safe controls.

## Findings

- P0: none.
- P1: none.
- P2: none.
- P3: the project uses its approved optimized WebP property media rather than reproducing the generated reference villa exactly.
- Accepted business differences: the customer service fee, refundable damage deposit, combined guest count, fixed owner timer, and final tax amount in the conceptual reference are excluded because they conflict with approved requirements or unresolved market configuration.

## Measurements

- Back, contact-edit, and submit controls measured `44px`, `44px`, and `52px` respectively at the primary viewport.
- The property summary measured approximately `152px` high; review rows measured approximately `70px` before content expansion.
- The 390px state used `13.76px` primary row values and `16px` section headings.
- Document client width equaled scroll width at 320px, 390px, and 480px; no horizontal overflow was present.
- The fixed action remained `96px` high and inside the mobile rail at all checked widths.

## Verification

- Overnight query state hydrated the period, date range, two-night duration, separate adult/child/infant counts, and provisional price.
- Single-date periods ignored an injected checkout date, and direct URL guest values were bounded to the known six-person adult-and-child capacity while infants remained separately limited.
- Invalid calendar dates used the empty recovery copy instead of rolling into another date.
- Contact editing passed open, cancel-and-restore, valid save, visible-summary update, and focus behavior.
- The optional request updated its summary and character count.
- Unchecked terms blocked submission, displayed the accessible error, and focused the checkbox.
- Terms disclosure opened in a modal and restored focus to its trigger.
- Checked submission opened the truthful simulated-success dialog with the hydrated trip summary and explicitly created no request, hold, charge, or reservation.
- Temporary LTR rendering mirrored the back and action arrows, moved the progress origin and property media correctly, and retained zero horizontal overflow.
- Final browser console, JavaScript syntax, inline-resource restriction, CSS structure, `git diff --check`, and Maven verification passed.

final result: passed
