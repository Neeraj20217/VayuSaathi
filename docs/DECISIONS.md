# Decisions

## Phase 1 · 22 November 2026

| Requirement or ambiguity | Phase 1 decision |
| --- | --- |
| The master brief proposes AirWise Family and several stack options. | The latest participant prompt fixes the project name as VayuSaathi, the local directory as D:\Coding\Codex\VayuSaathi and the runtime as Next.js, TypeScript, Tailwind CSS and Gemini. Vercel is the eventual deployment target. |
| The organizers permit either desktop or mobile and English or multilingual interfaces. | Phase 1 uses an English responsive dashboard because the participant requested both viewport sizes. |
| Organizers expect actual local observations and India-wide location support. Station coverage and acceptable age are unspecified. | Search India-wide via Open-Meteo geocoding. Use OpenAQ for measured coverage, disclose the bounded 25 km search and show an explicit missing state. Label CAMS estimates separately. Validate station coverage in representative cities before submission. |
| The brief allows PM data or AQI. AQI computation requires an identified standard and additional averaging and completeness rules. | Ship PM2.5 and PM10 concentrations. Leave AQI and AQI-based thresholds to a later validated CPCB implementation. |
| The proposed daily planner, accounts and storage are optional. | Use one in-session categorical household profile and on-demand plans. Avoid names, exact addresses, diagnoses and persistent storage. |
| The brief proposes free-form generated cards, which could echo fabricated values or unsupported claims. | Gemini selects structured IDs. Server-owned cards explain mechanisms in qualitative language. Retain this boundary during UI work. |
| The latest prompt asks for real integrations with no deployment or paid calls during Phase 1. | Wire official APIs and verify keyless routes live. Authenticated live checks depend on participant-supplied keys and an authorized quota. |

The Next.js lint preset currently relies on plugins with ESLint 9 peer support. Phase 1 pins the latest compatible ESLint 9 release. Reevaluate ESLint 10 when all preset plugins support it.

## Open questions before a public submission

- Delhi measured availability and freshness were verified. Check Mumbai, Kolkata and at least one lower-coverage city before submission.
- Verified two profiles with the participant's Gemini model. Extend evaluator coverage to other commute modes before submission.
- Select a shared quota or rate-limit mechanism for the public recommendation endpoint and check provider terms.
- Record the demo and document the exact submitted build, prompts and human contributions. Confirm authorized deployment and repository publication before taking those actions.


## City search and household personalization follow-up

- Preserve provider IDs and coordinates. Rank exact place names first and break ties by reported population. Exclude non-settlement features and accept smaller settlements even with no population field.
- Discard repeated IDs, near-identical coordinates for matching names in the same state, and matching names within 2 km in the same known subdistrict. Add subdistrict or district labels to distinct results that share a city and state. The 2 km rule is a heuristic for duplicate provider records.
- Send Gemini each eligible action's title and explanation so it can choose based on meaning. Keep shared indoor advice available when the household category alone does not justify a different action. The stated commute controls travel options.

## Phase 2 · 22 November 2026 (UI/UX Redesign by Google Antigravity)

| Requirement or visual mandate | Phase 2 decision |
| --- | --- |
| The participant provided a high-fidelity design mockup for Challenge 06. | Replaced the flat utilitarian styling with the design theme "Atmospheric Clarity & Civic Trust". Maintained verified backend contracts, Route Handlers, and server-only key handling. |
| Brand identity & visual hierarchy | Implemented modern header with VayuSaathi leaf/wind logo, subtitle "Your Urban Air Quality Assistant", "Powered by GenAI" badge, and an atmospheric hero section ("Breathe Better, Live Healthier"). |
| Color tokens & styling | Pinned palette to Emerald 600 (`#059669`), deep slate (`#0f2922`), Sky accent (`#0284c7`), Amber warning (`#f59e0b`), soft canvas (`#f4f8f5`), and clean white cards with gentle multi-stop shadows. |
| Ground truth vs modeled data presentation | Visually segregated OpenAQ monitoring station observations (green theme, signal tower icon, exact distance from city center, provider attribution, IST observation timestamp) and Open-Meteo CAMS modeled estimates (blue theme, atmospheric layers icon, ~45 km CAMS global-grid resolution note, IST model validity time). |
| Scientific accuracy and non-fabrication | Strictly displayed real PM2.5 and PM10 values in µg/m³. Refrained from calculating synthetic, non-standardized AQI numbers to maintain civic credibility. |
| City search and disambiguation | Upgraded search bar with pin icon, clear button, "Use my location" button, quick popular city chips (Delhi, Mumbai, Kolkata, Bengaluru, Hyderabad) with active state, and a disambiguation dropdown displaying state/UT and locality descriptors. |
| Interactive household profile selection | Replaced basic checkboxes with 4 interactive toggle cards with avatars/icons for Children, Older adults, Working adults, and Students with checkmark badges, accompanied by commute mode and lifestyle priority selectors and dynamic focus chips. |
| Recommendation cards | Elevated plan cards into 3 structured thematic blocks: Daily Routine (Amber), At Home / Indoor Air (Emerald), and Travel & Commute (Purple), clearly highlighting the suggested Action, qualitative impact ("Why this matters"), and explicit data basis banner. |
| Informational transparency tabs | Added tabbed views for "About the Data" and "Health & Safety Guide" detailing particulate matter risks, sensor limitations, and evidence-based protective actions. |
| Accessibility & responsive compliance | Added a skip link, keyboard-operable tabs, focus outlines, and reduced-motion support. The final Codex review records the browser widths and accessibility checks run. |

## Phase 2 Final Refinements · 22 November 2026

| Refinement area | Final decision |
| --- | --- |
| Desktop width & whitespace elimination | Expanded `.shell` from 1180px to `min(1380px, calc(100% - 48px))`. Implemented `.dashboard-main-grid` (1.15fr : 0.85fr) pairing Air Quality Intelligence on the left with Household Personalization on the right, eliminating excessive horizontal empty space and vertical scroll on desktop displays (1024px to 1920px+). |
| Full-width recommendation cards | Positioned the 3-column Gemini recommendation cards across the full 1380px layout below the top grid, giving routine, indoor, and commute guidance prominent visual presence. |
| Mobile precision (360px, 390px, 430px) | Converted navigation tabs to a smooth horizontally-swipeable pill list without wrapping or clipping. Added responsive clamp sizing for PM concentration numerals (`clamp(1.4rem, 4vw, 1.85rem)`), optimized search action buttons for compact widths, and set primary search and tab controls to at least 44 px tall. |
| Live Gemini verification | Antigravity reported live Gemini structured output with Hyderabad (`1269843`), confirming authentic Gemini-selected action IDs (`indoorPlay`, `playSpace`, `combine`) grounded in physical OpenAQ station observations (`basis: "recent-station"`). The badge is gated on a server-attested Gemini source after the final review. |
| Missing data & provider resilience tests | Added 2 automated tests in `tests/air-quality.test.ts` verifying graceful fallback when zero stations exist within 25 km and resilience when an atmospheric model pollutant is null. Total test suite expanded to 28 passing tests. |
