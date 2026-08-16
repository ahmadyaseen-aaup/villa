# Design QA: Customer Web Journey

## Evidence

- Source visual truth (desktop):
  - `/Users/ahmadyaseen/NetBeansProjects/villa/src/main/webapp/nesma-ui/customer/web/01-home-discovery.png`
  - `/Users/ahmadyaseen/NetBeansProjects/villa/src/main/webapp/nesma-ui/customer/web/02-search-map-results.png`
  - `/Users/ahmadyaseen/NetBeansProjects/villa/src/main/webapp/nesma-ui/customer/web/03-villa-profile.png`
  - `/Users/ahmadyaseen/NetBeansProjects/villa/src/main/webapp/nesma-ui/customer/web/04-booking-request-review.png`
- Source visual truth (mobile): `/Users/ahmadyaseen/NetBeansProjects/villa/src/main/webapp/nesma-ui/customer/mobile/01-home-discovery.png` through `04-booking-request-review.png`.
- Browser implementation: `http://127.0.0.1:4173/01-home-discovery.html` through `04-booking-request-review.html`.
- Final desktop screenshots: `qa/home-desktop-final.jpg`, `qa/results-desktop-final.jpg`, `qa/profile-desktop-final.jpg`, and `qa/review-desktop-final.jpg`.
- Full-view desktop comparisons: `qa/home-comparison-final.jpg`, `qa/results-comparison-final.jpg`, `qa/profile-comparison-final.jpg`, and `qa/review-comparison-final.jpg`.
- Focused desktop comparisons: `qa/home-focus-final.jpg`, `qa/results-focus-final.jpg`, `qa/profile-focus-final.jpg`, and `qa/review-focus-final.jpg`.
- Final mobile screenshots: `qa/home-mobile-final.jpg`, `qa/results-mobile-final.jpg`, `qa/profile-mobile-final.jpg`, and `qa/review-mobile-final.jpg`.
- Full-view mobile comparisons: `qa/home-mobile-comparison-final.jpg`, `qa/results-mobile-comparison-final.jpg`, `qa/profile-mobile-comparison-final.jpg`, and `qa/review-mobile-comparison-final.jpg`.
- Enhanced homepage evidence: `qa/home-enhancements/desktop-top.png`, `qa/home-enhancements/autocomplete.png`, `qa/home-enhancements/desktop-lower.png`, `qa/home-enhancements/desktop-personalized.png`, `qa/home-enhancements/mobile-top.png`, `qa/home-enhancements/mobile-sticky-search.png`, `qa/home-enhancements/mobile-consent.png`, and `qa/home-enhancements/mobile-personalized.png`.

## Normalization

- Desktop source pixels: `2048 x 1440` for every page.
- Desktop CSS viewport requested: `2048 x 1440`, device density `1x`. The in-app browser's content capture is `2033 x 1307` because browser chrome and the RTL scrollbar are outside the captured page. Both sides of each comparison were normalized to `1024 x 720`.
- Mobile source pixels: `1170 x 2532` (`390 x 844` at `3x`).
- Mobile CSS viewport requested: `390 x 844`, device density `1x`; the in-app browser content capture is `375 x 812`. Each mobile source was downsampled to the same `375 x 812` before comparison.
- State: anonymous customer, Arabic RTL, default page state. The results page shows all periods and no required dates. The property page defaults to its available overnight option. The booking page is a request review, not a confirmed reservation or payment.

## Findings

No actionable P0, P1, or P2 findings remain.

- [P3] Google Cairo is an approved hosted dependency for the refined homepage typography.
  - Location: homepage typography.
  - Evidence: the stylesheet uses Google Fonts connection hints and `display=swap`, followed by the existing local system stack.
  - Impact: first-load typography depends on the Google Fonts origins, but text rendering is never blocked by that dependency.
  - Follow-up: keep the production content-security policy synchronized; self-host a subsetted WOFF2 build later if third-party availability, privacy, or latency becomes a concern.

- [P3] Responsive web navigation intentionally differs from the mobile-app reference.
  - Location: mobile headers and absence of the app-only bottom tab bar.
  - Evidence: the supplied mobile images use native-app bottom navigation, while these files are responsive web templates with a compact accessible header and menu.
  - Impact: expected platform adaptation; the primary journey remains available and keyboard/touch accessible.

## Required Fidelity Surfaces

- Fonts and typography: consistent Arabic RTL hierarchy, optical weight, line height, wrapping, and truncation were checked at desktop and mobile widths. Cairo uses `display=swap`, so the remote font does not block text rendering.
- Spacing and layout rhythm: image-led hero, search bar, results/map split, gallery, sticky request panel, review cards, radii, borders, and vertical rhythm preserve the source design language. Larger imagery on home/profile is an intentional usability refinement; focused comparisons confirm controls remain proportionate.
- Colors and visual tokens: deep teal, warm canvas, subdued aqua/sand surfaces, coral primary action, semantic success state, and subtle elevation are centralized in `assets/css/tokens.css`. White on the coral primary action maintains usable contrast.
- Image quality and asset fidelity: property and destination photography comes from the supplied local assets. WebP variants at `640`, `1280`, and source widths are selected with `srcset`; JPEG fallbacks replace runtime PNG fallbacks. The map background is a real generated raster asset rather than CSS art, and visible pins remain semantic links layered by the UI.
- Copy and content: labels are coherent in Arabic and follow the approved business rules. Discovery does not force a booking type; guest categories are separate; sponsored content is labeled; the booking review does not invent a customer service fee or damage deposit; and response timing remains dynamic instead of hardcoded.
- Icons and controls: one local Bootstrap Icons family is used consistently. Buttons, toggles, dialogs, popovers, counters, inputs, and selection states have accessible names and visible focus treatment.

## Responsive, Accessibility, And Interaction Checks

- Checked widths: `320`, `390`, `768`, `1024`, `1280`, `1440`, and `2048` CSS pixels.
- Final horizontal overflow: none on all four pages at every checked width.
- All visible images include alt text and intrinsic dimensions; no duplicate IDs or unlabeled non-hidden form controls were found.
- Reduced motion is respected. Interactive targets are at least `44px` where they stand alone; small text links are contained within larger card or label contexts.
- Discovery test: destination, calendar, and guest popovers open; adults, children, and infants update independently; a localized date range produces ISO `start`/`end` values; and the resulting query carries dates plus all three guest counts to results.
- Results test: list/map switching, period choices, filters dialog, and “search this area” state work.
- Property test: selecting a same-day period hides the departure input, changes the date label, and updates the estimate before navigating to review.
- Review test: the submit action remains disabled until terms are accepted; valid form input opens the success dialog and explicitly states that the static prototype did not send data.
- Console logs checked after the primary interactions on every route: no errors or warnings.
- Local server request log checked: all referenced HTML, CSS, JavaScript, fonts, and images returned successfully; no `404` responses were observed.

## Performance Checks

- Runtime CSS and JavaScript are external and cacheable; no inline styles, inline scripts, jQuery, or UI framework runtime is used. The approved Cairo stylesheet is hosted by Google Fonts and uses preconnect hints plus `display=swap`.
- Homepage shared/page CSS and JavaScript total about `103 KB` before compression. The page-specific `home.css` and `home.js` total about `72 KB` before compression and about `15.5 KB` with gzip. The calendar remains dependency-free, and the local icon stylesheet/font total about `229 KB` and are shared across pages.
- Hero WebP is about `161 KB`; the generated map WebP is about `60 KB`; mobile image variants are about `25–45 KB` each.
- Images below the initial viewport use native lazy loading and async decoding. Intrinsic dimensions prevent layout shift.
- The original PNGs remain as design/source artifacts, but runtime `<picture>` fallbacks use optimized JPEGs and responsive WebP sources.
- `mvn -q test` completed successfully.
- `mvn -q verify` completed successfully after the polished homepage implementation.

## Comparison History

1. First implementation comparison
   - [P2] Home hero height pushed discovery content too far below the source composition.
   - [P2] Mobile review placed the price summary before the request context.
   - [P2] The property header overflowed by `5px` at the `320px` breakpoint.
   - [P2] Results did not display carried child and infant counts in the visible search summary.
   - Fixes: reduced desktop hero proportion, reordered mobile review sections, wrapped the narrow property heading and full-width return action, and generated the results summary from all guest-category query values.
   - Post-fix evidence: all `*-comparison-final.jpg` desktop and mobile comparison files.

2. Performance and asset pass
   - [P2] Runtime fallbacks pointed to multi-megabyte PNGs and cards lacked responsive image candidates.
   - Fixes: added optimized JPEG fallbacks plus `640px` and `1280px` WebP candidates, supplied `sizes`, and retained intrinsic dimensions/lazy decoding.
   - Post-fix evidence: browser re-render completed without console errors or missing requests; responsive source markup is present on home, results, profile, and review.

3. Approved homepage visual refinement
   - Source visual truth: `/Users/ahmadyaseen/NetBeansProjects/villa/src/main/webapp/nesma-ui/customer/web/qa/home-polish/source-desktop.jpg` and `/Users/ahmadyaseen/NetBeansProjects/villa/src/main/webapp/nesma-ui/customer/web/qa/home-polish/source-mobile.jpg`, captured from `public_html/index.html` in the current QA run.
   - Implementation evidence: `/Users/ahmadyaseen/NetBeansProjects/villa/src/main/webapp/nesma-ui/customer/web/qa/home-polish/implementation-desktop-final.jpg` and `/Users/ahmadyaseen/NetBeansProjects/villa/src/main/webapp/nesma-ui/customer/web/qa/home-polish/implementation-mobile-final.jpg`.
   - Normalization: desktop source and implementation are both `1425 x 891` captures from a `1440 x 900` CSS viewport at `1x`; mobile source and implementation are both `375 x 812` captures from a `390 x 844` CSS viewport at `1x`. State is anonymous, Arabic RTL, default controls closed.
   - Full-view combined evidence: `/Users/ahmadyaseen/NetBeansProjects/villa/src/main/webapp/nesma-ui/customer/web/qa/home-polish/comparison-desktop-final.jpg` and `/Users/ahmadyaseen/NetBeansProjects/villa/src/main/webapp/nesma-ui/customer/web/qa/home-polish/comparison-mobile-final.jpg`.
   - Focused hero/search evidence: `/Users/ahmadyaseen/NetBeansProjects/villa/src/main/webapp/nesma-ui/customer/web/qa/home-polish/comparison-desktop-focus-final.jpg` (`1425 x 650` source and implementation regions combined without density scaling).
   - Lower-page evidence: `/Users/ahmadyaseen/NetBeansProjects/villa/src/main/webapp/nesma-ui/customer/web/qa/home-polish/comparison-lower-desktop-final.jpg`, covering seasonal campaigns, popular properties, and footer structure.
   - [P2] The first implementation used a taller header, larger display type, and later first-content entry than the preferred compact composition.
   - [P2] The first mobile implementation exposed an additional language icon in the header and wrapped the headline more aggressively than the source.
   - [P2] Initial desktop rail arrows had no offscreen content to reveal.
   - Fixes: matched the reference's header/hero/search/first-section rhythm, refined desktop and mobile display typography, moved mobile language access into the menu, and added offscreen rail items with working RTL carousel controls.
   - Intentional differences: the required booking-type selector was removed, the combined guest count was replaced by separate adult/child/infant controls, and PNG-heavy loading was not copied. Cairo was subsequently approved as a swap-based Google Fonts dependency.
   - Post-fix checks: no horizontal overflow at `320`, `390`, `768`, `1024`, `1440`, or `2048` CSS pixels; no browser console errors or warnings; visible images loaded without failures.
   - Primary interactions tested: destination selection, optional date control, separate guest counters, search handoff, menu open/close and Escape dismissal, popover Escape dismissal, anonymous-favorite dialog, and desktop rail scrolling.

4. Cairo typography and simplified header refinement
   - Desktop evidence: `/Users/ahmadyaseen/NetBeansProjects/villa/src/main/webapp/nesma-ui/customer/web/qa/home-font-header/desktop-viewport.png` at a `1440 x 900` requested viewport.
   - Mobile evidence: `/Users/ahmadyaseen/NetBeansProjects/villa/src/main/webapp/nesma-ui/customer/web/qa/home-font-header/mobile-viewport.png` at a `390 x 844` requested viewport.
   - Verification: Cairo loaded successfully; the Bootstrap `bi-list` glyph is absent; the menu control is hidden on desktop and remains available as a text-labeled control on mobile.
   - Responsive checks: no horizontal overflow at `320`, `390`, `768`, `1024`, `1440`, or `2048` CSS pixels. The former page-level `20rem` minimum width was removed because it competed with the vertical scrollbar at the narrowest viewport.
   - Interaction checks: the mobile menu opens, updates `aria-expanded`, and closes with Escape. No browser console warnings or errors were recorded.

5. Home discovery intelligence refinement
   - Visual evidence: `/Users/ahmadyaseen/NetBeansProjects/villa/src/main/webapp/nesma-ui/customer/web/qa/home-enhancements/desktop-top.png`, `/Users/ahmadyaseen/NetBeansProjects/villa/src/main/webapp/nesma-ui/customer/web/qa/home-enhancements/desktop-lower.png`, `/Users/ahmadyaseen/NetBeansProjects/villa/src/main/webapp/nesma-ui/customer/web/qa/home-enhancements/desktop-personalized.png`, `/Users/ahmadyaseen/NetBeansProjects/villa/src/main/webapp/nesma-ui/customer/web/qa/home-enhancements/mobile-top.png`, `/Users/ahmadyaseen/NetBeansProjects/villa/src/main/webapp/nesma-ui/customer/web/qa/home-enhancements/mobile-sticky-search.png`, `/Users/ahmadyaseen/NetBeansProjects/villa/src/main/webapp/nesma-ui/customer/web/qa/home-enhancements/mobile-consent.png`, and `/Users/ahmadyaseen/NetBeansProjects/villa/src/main/webapp/nesma-ui/customer/web/qa/home-enhancements/mobile-personalized.png`.
   - Autosuggest: filtering, a useful no-results state, reset-to-popular recovery, Arrow Up/Down navigation, active-descendant state, Enter selection, and search query handoff passed. Recent destinations appeared only after consent and a completed search interaction.
   - Mobile search summary: hidden while the main form is visible, shown with synchronized destination/date/guest text after the form leaves view, keyboard focus disabled while hidden, and suppressed near the footer.
   - Cards and trust: capacity, bedrooms, amenity, rating, organic labeling, and indicative starting-price copy render without card overflow. Trust statements are limited to approved publication, price, advertising, and consent rules.
   - Dynamic content states: `loading`, `empty`, `error`, `offline`, and `ready` each expose exactly one state panel; loading sets `aria-busy`; retry transitions through loading to ready.
   - Consent and history: allow, deny, settings-dialog status, and clear-history behavior passed. A recently viewed card appeared only after opt-in and a real property navigation; disabling personalization cleared the history and hid personalized content.
   - Accessibility and responsive checks: no horizontal overflow or wrapped desktop navigation at `320`, `390`, `768`, `1024`, `1280`, `1440`, or `2048` CSS pixels. Visible interactive targets are at least `44px`; all images have alt text and intrinsic dimensions; no duplicate IDs or browser console warnings/errors were found.
   - Performance: no new image files or third-party scripts were introduced. Recommendation imagery reuses cached responsive assets, below-fold media remains lazy, and all new runtime CSS/JavaScript stays external and cacheable.

6. Production discovery cleanup and calendar-range refinement
   - Header: language, favorite, and login actions align to the true header end at desktop and mobile widths. Mobile keeps all three icons visible while the text-labeled menu occupies the opposite edge.
   - Destination panel: suggestion rows use transparent backgrounds and divider rhythm instead of gray tiles. The keyboard-active state uses the existing warm coral surface and retains a visible active descendant.
   - Date panel: native date inputs were replaced with a localized calendar rendering two months from `768px` upward and one month below it. It supports a single service date or an arrival/departure range, localized visible summaries, neutral ISO form values, past-date disabling, clear/cancel/apply behavior, pointer preview, and RTL-aware Arrow, Home, End, Page Up, and Page Down navigation.
   - Content restraint: the generic search note, assurance section, popular-price explainer, and recently-viewed explainer were removed. Consent, loading/error recovery, and calendar selection guidance remain because they support consequential actions or recovery.
   - Interaction verification: selecting 18–23 August 2026 produced four intermediate range cells, retained the popover while selecting, committed `start=2026-08-18` and `end=2026-08-23` only on Apply, displayed `18–23 أغسطس 2026`, and handed both values to the results URL. In RTL, Arrow Left moved focus from 18 to 19 August.
   - Responsive verification: no horizontal overflow at `320`, `390`, `768`, `1024`, `1280`, `1440`, or `2048` CSS pixels. Header edge gaps remained zero, desktop navigation stayed on one line, and the mobile calendar fit within the viewport as a bottom panel. Browser console warnings/errors remained empty.
   - Performance: no calendar package, new image, or additional network dependency was introduced; the calendar is rendered by the existing page module and all CSS/JavaScript remains external and cacheable.

7. Homepage personalization-settings removal
   - Removed the `إعدادات التخصيص` action from the recommendations heading and footer, removed the denied-state `تغيير الإعداد` action, and removed the associated dialog.
   - Preserved the contextual first-consent prompt because no anonymous behavior is used before explicit consent.
   - Removed dialog-only privacy styles and JavaScript status-selection code so the homepage does not retain dead settings UI.
   - Product gate: consent withdrawal and comprehensive preference-history controls remain mandatory business requirements and must be implemented on the future customer settings page before real personalization is enabled in production. The contextual recently-viewed clear action remains available on the homepage.

## Implementation Checklist

- [x] Four linked semantic HTML pages.
- [x] Neutral filenames for all newly created runtime assets.
- [x] External shared and page-specific CSS/JavaScript.
- [x] Flexible discovery without forced booking type.
- [x] Separate adult, child, and infant guest categories.
- [x] Responsive list/map, gallery, request, and review layouts.
- [x] Business-safe price/request copy.
- [x] Local optimized assets with responsive image candidates.
- [x] Keyboard, form-label, reduced-motion, RTL, and overflow checks.
- [x] Browser interaction and console verification.
- [x] Desktop/mobile source-and-implementation comparison loop.

final result: passed
