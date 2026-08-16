# Customer Web UI Templates

## Status

Approved for UI/UX prototype implementation on 14 August 2026.

## Purpose

Define the responsive, Arabic-first customer web journey represented by the approved customer concept images and the complementary login experience:

1. Home discovery.
2. Search and map results.
3. Property profile.
4. Booking-request review.
5. Customer login.

The implementation is a frontend template and does not provide backend persistence, authentication, payments, availability, pricing, or booking confirmation.

## Experience Principles

- Preserve the calm, image-led visual direction without treating the temporary design name as a permanent product brand.
- Use Arabic RTL as the initial rendered language while keeping CSS direction-safe for future English, Hebrew, and Turkish support.
- Keep the main customer journey functional with realistic mock data.
- Use responsive layouts designed for mobile, tablet, desktop, and the supplied 2048px visual references.
- Meet WCAG-oriented interaction, focus, labeling, target-size, and contrast expectations.
- Keep all styles and scripts in imported files under `assets/`; do not embed page-level CSS or JavaScript.
- Reuse the homepage's structured dark marketplace footer across all linked customer pages through one neutral shared stylesheet and consistent semantic footer markup.

## Search Rules

- Do not require a booking type on the home discovery screen.
- The initial period filter is **All periods**.
- Period type is an optional filter on search results and a selectable property-defined option on property details.
- Do not expose a customer-defined custom-time option.
- A customer may search without dates.
- Date input uses a full responsive calendar and supports either one service date or an overnight range without forcing a booking mode.
- Guest selection records adults, children, and infants separately.
- Do not hardcode unresolved child/infant age definitions.

## Page Requirements

### Home discovery

- Full-width visual hero.
- Destination, optional dates, and categorized guest controls.
- Clearly labeled sponsored property stories.
- City discovery, active campaign examples, and non-personalized popular properties.
- Anonymous favorites open a sign-in prompt rather than pretending to persist.

#### Approved visual direction — refined 14 August 2026

- Use the compact, marketplace-oriented composition demonstrated by the legacy `public_html/index.html` page as the visual reference only.
- Keep a short image-led hero, an overlapping discovery form, a dense sponsored-story rail, an asymmetric destination mosaic, paired seasonal campaigns, compact popular-property cards, and a structured dark footer.
- Do not copy the legacy implementation's required booking-type selector, combined guest counter, PNG-heavy runtime, inline style values, or duplicated asset tree.
- Keep the production template under `01-home-discovery.html` with neutral shared assets, categorized guests, optional dates, no required booking mode, responsive WebP imagery, lazy loading below the hero, and accessible interactive states.
- Desktop sponsored-story and property rails may expose additional offscreen items through explicit controls; touch layouts use native horizontal scrolling with scroll snapping.
- Use Google Cairo for the refined Arabic homepage typography, with connection hints, `display=swap`, and the local system stack as a non-blocking fallback. Production content-security policy must explicitly allow the Google Fonts stylesheet and font origins while this hosted-font decision remains active.

#### Approved discovery enhancements — refined 14 August 2026

- Destination discovery provides keyboard-accessible suggestions for countries, cities, areas, landmarks, and property names. Popular suggestions are available without tracking; recent searches appear after real customer interaction while personalization is enabled.
- Destination suggestions use a clean list treatment without gray tile backgrounds; hover, focus, and keyboard-active states remain visibly distinct.
- The optional date control uses a localized two-month calendar on desktop and one-month calendar on mobile. It supports pointer and keyboard range selection, excludes past dates, and submits neutral ISO date values while presenting localized dates to the customer.
- A compact mobile search summary appears only after the main discovery form leaves the viewport, remains synchronized with destination, optional dates, and categorized guests, and hides near the footer.
- At tablet and desktop widths, the primary header remains sticky. When the full discovery form clears the header, navigation links transition into a synchronized compact destination/date/guest search control while language, favorites, and login remain at the visual end. A text-only menu keeps the displaced navigation available without restoring the removed list icon. Returning to the full discovery form restores the navigation; mobile retains the existing bottom search summary instead of rendering two persistent search controls.
- The sticky discovery control reuses the existing destination, calendar, and categorized-guest state and overlays. It must not duplicate form fields, calendar markup, or guest state, and its inactive representation must be removed from keyboard and assistive-technology navigation.
- Organic property cards show capacity, bedroom count, a key amenity, rating, and a visibly labeled starting price. Date-free values remain indicative and are recalculated after date, period, availability, pricing, tax, currency, and margin validation.
- The homepage follows the general popular-property rail with separate organic villa collections for Aqaba, Dubai, and Istanbul. Each collection contains six distinct properties, retains the same facts, favorite, rating, and starting-price contract, and links to destination-filtered discovery without forcing dates or a booking type.
- City collections remain editorial organic content rather than paid placement. They use distinct city-appropriate imagery, direction-aware desktop rail controls, touch scrolling with snap points, and lazy responsive media so adding discovery depth does not compromise sponsored/organic separation or initial page load.
- Dynamic recommendation content includes loading, empty, error, offline, ready, and retry states. The static template exposes these states for QA through the optional `homeState` query parameter; production integration replaces that preview trigger with real request state.
- Keep discovery concise: do not render passive explanatory notes or a general trust/explanation section on the homepage. Reserve contextual explanations for consequential actions such as consent, booking, payment, and checkout, where they help the customer make or recover from a decision.
- Anonymous recent-search, recently-viewed, and rule-based recommendation signals are enabled by default. The homepage shows personalized recommendations directly and provides a contextual clear-history action for recently viewed content, but it does not expose personalization settings or a settings dialog. Disabling personalization and comprehensive preference-history controls will be managed from the future customer settings page.
- Personalized organic recommendations remain in their own section and never rerank core search results. Sponsored stories remain separately labeled and do not enter recent or personalized organic recommendations.
- Sponsored properties use compact circular story triggers with a visible sponsored badge. Activating a story opens a reusable, Instagram-style media viewer while the property action remains the non-transactional `View property` handoff; the viewer must never imply confirmed availability or a completed booking.
- The story viewer supports progress, pause/resume, explicit previous/next controls, swipe gestures, Escape, focus containment and restoration, live slide announcements, and direction-aware arrow, keyboard, progress, and swipe behavior for both RTL and LTR locales. Reduced-motion preferences disable non-essential transitions.
- Story thumbnails remain lazy-loaded and the viewer reuses one media element, loading the active image and preloading only the next image. Cross-session viewed history is stored while personalization is enabled and is erased with behavioral history.
- Destination discovery uses an asymmetric image mosaic on desktop: one editorially featured destination spans two rows and five supporting destinations use unequal columns. The layout becomes a balanced two-column composition on tablets and a single readable column on mobile; it uses logical alignment so the hierarchy works in RTL and LTR without changing destination order or search behavior.
- The implementation reuses existing responsive image assets, keeps below-fold media lazy, avoids inline CSS/JavaScript, and preserves neutral runtime filenames.

### Search and map results

- Editable search summary.
- Optional period, instant-booking, price, amenity, rating, and property filters.
- Shared result state between list and map views.
- Desktop split view and mobile list/map switching.
- Map refresh is associated with map movement, not a fixed polling timer.
- Reuse the refined homepage visual system: Google Cairo, compact sticky navigation, deep-teal structure, coral primary actions, warm-ivory surfaces, logical RTL/LTR spacing, and performance-conscious responsive media.
- Keep the page task-focused rather than adding a marketing hero: search summary, period/filter controls, result count, result cards, and map form one clear marketplace workspace.
- Organic result cards show capacity, bedrooms, a key amenity, rating, supported periods, and date-free starting-price language. Sponsored discovery uses a dedicated, visibly labeled placement and does not appear as a disguised organic-ranked card.
- Desktop keeps a sticky map beside the scrolling list. Tablet and mobile use a persistent accessible list/map switcher, native filter overflow, and full-width image-led cards.
- Static map controls demonstrate automatic result refresh after map interaction without rendering a required `Search this area` button. Matching cards and markers share hover and keyboard-focus emphasis.

### Property profile

- Responsive image gallery.
- Property facts, amenities, location, reservable periods, reviews, and pricing summary.
- Sticky desktop booking controller and persistent mobile action.
- No customer platform service fee.
- No refundable damage deposit in the initial release.
- Reuse the refined homepage visual system: Google Cairo, compact sticky navigation, warm-ivory canvas, deep-teal structure, coral booking actions, logical RTL/LTR layout, and responsive WebP media.
- Make an asymmetric four-image gallery the dominant visual anchor. Its native-dialog viewer supports thumbnails, caption and position feedback, previous/next buttons, RTL/LTR arrow-key behavior, swipe navigation, Escape, and reduced motion.
- Keep property content editorial and mostly cardless. Present capacity, rooms, private amenities, host, description, property-defined periods, facilities, exact public location, approved verified-stay reviews, and rating dimensions with clear section hierarchy and restrained dividers.
- Display the exact public property location while continuing to withhold access codes and private arrival instructions until the applicable booking and payment conditions are satisfied.
- The booking controller selects one property-defined period before dates. Overnight uses a full two-month desktop/one-month mobile range calendar; morning, evening, and full-day periods use one service date. Past dates are disabled and the calendar remains keyboard operable.
- Adults, children, and infants remain separate. The prototype enforces the known adult-and-child capacity without inventing the unresolved infant-capacity or age-definition decision.
- Date-free values remain clearly labeled starting prices. Selected ranges may show a provisional accommodation estimate, but taxes, availability, margin, currency, policies, and final price remain subject to server validation; the controller does not show a customer service fee or refundable damage deposit.
- Tablet and mobile place the booking controller before extended property details. Mobile retains a persistent booking action, a compact image mosaic, a bottom-sheet calendar, and touch-safe controls.

### Booking-request review

- Reuse the home screen's compact marketplace header and exact structured dark marketplace footer through neutral shared assets and matching semantic markup.
- Lead with a calm, image-led reservation summary and a four-step progress indicator covering property selection, request review, owner response, and payment confirmation.
- Keep the selected period, localized date or range, adults, children, and infants explicit; each guest category remains visually and semantically separate.
- Keep accommodation, optional add-ons, configured taxes, and the provisional total distinct. Do not show a customer platform-service fee or a damage-deposit row.
- Place contact fields and terms beside the consequential action, with native validation, clear focus behavior, and guidance not to enter sensitive payment data in the host message.
- Explain the request-booking sequence without hardcoding property-specific owner-response or payment-window values.
- Keep the price visibly provisional until availability, pricing, tax, currency, margin, and policy validation succeeds.
- Submission is simulated locally and must explicitly state that no data, inventory hold, charge, or reservation was created.

### Customer login

- Provide a dedicated, brand-neutral `05-login.html` template inspired by the home page's Cairo typography, deep-teal, warm-ivory, coral, and image-led visual direction.
- Support native username and password fields plus Google and Apple sign-in actions, without transmitting or persisting credentials in the frontend prototype.
- Use appropriate autocomplete attributes, accessible labels, visible validation, password visibility control, keyboard focus states, and reduced-motion behavior.
- Keep account creation, password recovery, identity-provider redirects, session creation, error mapping, and account merging as backend-integration responsibilities until their product decisions are approved.
- Link the home and shared customer sign-in entry points to the dedicated page while anonymous favorite actions may continue to explain why authentication is required before navigation.
- Use one responsive hero image with explicit dimensions and responsive WebP sources; keep all styles and scripts in imported page assets.

## Performance Requirements

- Prefer WebP assets with appropriate fallbacks where needed.
- Load offscreen imagery lazily and set image dimensions.
- Keep the hero as the only eagerly loaded large image.
- Use shared cacheable CSS and JavaScript plus small page-specific modules.
- Avoid jQuery and large frontend frameworks.
- Avoid duplicate runtime asset trees.
- Respect reduced-motion preferences.
- Implement the sticky-header transition with an observer and compositor-friendly opacity/transform changes; do not use continuous scroll polling, layout-size animation, or backdrop blur.

## Traceability

- Business requirements: sections 6, 7, 10, 12, 14, 15, 16, 17, 23, and 34 of `docs/buss_req.md`.
- UI template decision: `docs/decisions/0001-customer-web-template-structure.md`.
- Implementation plan: `docs/plans/customer-web-ui.md`.
