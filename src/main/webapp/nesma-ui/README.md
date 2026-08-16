# Nesma UI Concept Library

Arabic-first RTL visual concepts for a multi-country accommodation ecosystem.
The library follows the selected **Nesma** direction and keeps customer, owner,
and administrator products visually consistent while adapting information
density and navigation to each role.

## Output Specifications

| Surface | Dimensions | Aspect ratio | Format |
| --- | ---: | ---: | --- |
| Web | 2048 x 1440 px | 64:45 | PNG |
| Mobile | 1170 x 2532 px | 15:32.46 | PNG |

Every PNG is a standalone screen. The mobile files are native-app concepts,
not responsive crops of the web screens.

## Design System

- Primary surface: `#FCFBF8`
- Deep teal: `#184B4A`
- Pale aqua: `#CFE6E2`
- Primary action/campaign coral: `#F27F67`
- Sand accent: `#EAD9B8`
- Primary text: `#263331`
- Direction: native Arabic RTL
- Suggested Arabic typography: IBM Plex Sans Arabic or Noto Sans Arabic
- Customer imagery: cinematic modern villas, pools, interiors, cities, and maps
- Web navigation: role-appropriate RTL navigation and contextual workspaces
- Mobile navigation: native app bars, large touch targets, sheets, and bottom tabs

## Customer

### Web

1. `customer/web/01-home-discovery.png`
   Hero-led discovery, direct destination/date search, villa stories, cities,
   seasonal campaign, and personalized properties.
2. `customer/web/02-search-map-results.png`
   Editable search, reservation modes, filters, property results, and an
   auto-refreshing map.
3. `customer/web/03-villa-profile.png`
   Multi-image gallery, property facts, amenities, map, available periods,
   pricing, reviews, and a booking request controller.
4. `customer/web/04-booking-request-review.png`
   Reservation review, price breakdown, refundable damage deposit, approval
   timing, terms, and request submission.

### Mobile

1. `customer/mobile/01-home-discovery.png`
   Native discovery home with immediate where/when actions, stories, cities,
   campaign, recommendations, and bottom navigation.
2. `customer/mobile/02-search-map-results.png`
   Edge-to-edge map, price pins, native filters, and draggable property sheet.
3. `customer/mobile/03-villa-profile.png`
   Swipeable gallery, property details, amenities, location, booking modes,
   review preview, and persistent booking action.
4. `customer/mobile/04-booking-request-review.png`
   Native review flow with booking details, prices, refundable deposit,
   one-hour approval/payment explanation, and persistent submission action.

## Owner

### Web

1. `owner/web/01-dashboard.png`
   Daily operational dashboard with pending request, arrivals/departures,
   availability, performance, settlement, manual booking, and promotion.
2. `owner/web/02-booking-request.png`
   Timed booking request review with guest verification, availability,
   financial details, approve/reject, and messaging.
3. `owner/web/03-availability-manual-booking.png`
   Property availability by reservation period and a commission-free manual
   booking panel.
4. `owner/web/04-pricing-settlement.png`
   Base and seasonal pricing, weekend/event rules, length-of-stay discounts,
   approval status, earnings, holds, and monthly settlement.

### Mobile

1. `owner/mobile/01-dashboard.png`
   Native daily dashboard with pending action, agenda, availability, earnings,
   settlement, manual booking, and property promotion.
2. `owner/mobile/02-booking-request.png`
   Native full-screen booking request with countdown, guest verification,
   availability, owner payout, and decision actions.
3. `owner/mobile/03-availability-manual-booking.png`
   Touch-oriented calendar, daily agenda, availability states, and native
   manual-booking sheet.
4. `owner/mobile/04-pricing-settlement.png`
   Native pricing editor with period prices, seasons, rules, discounts,
   settlements, and review submission.

## Administrator

### Web

1. `admin/web/01-marketplace-dashboard.png`
   Multi-country marketplace health, performance, approval queue, risk alerts,
   and revenue-source composition.
2. `admin/web/02-approvals.png`
   Property/owner approval queue with verification, gallery, documents,
   contractual prices, quality checks, and privileged decisions.
3. `admin/web/03-pricing-commission.png`
   Buy/sell price waterfall, rule priority, resale-margin model, alternative
   commission models, margin controls, and audit trail.
4. `admin/web/04-advertising-settlements.png`
   Fixed-fee story and external-banner inventory, campaign decisions, payment
   activation, settlement batches, and complaint holds.

### Mobile

1. `admin/mobile/01-marketplace-dashboard.png`
   Native overview with country performance, decision inbox, marketplace
   metrics, and revenue sources.
2. `admin/mobile/02-approvals.png`
   Native property approval detail with owner verification, gallery, location,
   capacity, amenities, pricing, documents, and decision actions.
3. `admin/mobile/03-pricing-commission.png`
   Native pricing decision with price waterfall, margin, rule priority,
   commission selection, warnings, and privileged approval.
4. `admin/mobile/04-advertising-settlements.png`
   Native fixed-fee campaign queue, payment and activation status, settlement
   hold alert, and campaign approval.

## Usage Notes

- These are concept images for design selection and implementation guidance.
- Use the PNG dimensions above when reviewing at 100% or zooming into details.
- Validate final Arabic copy, currency formatting, numerical examples, and
  accessibility during implementation; image generation can introduce minor
  text artifacts.
- `SHA256SUMS` records the final file hashes for transfer verification.
