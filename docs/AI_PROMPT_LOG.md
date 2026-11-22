# AI prompt log

## 22 November 2026 · Phase 1

| Item | Record |
| --- | --- |
| Human input | The participant supplied the organizer materials, chose the VayuSaathi name, Phase 1 stack and exact local directory, and requested local-only development and verification. |
| Development tools used | OpenAI Codex read the master brief and Phase 1 prompt, consulted the earlier Challenge 6 conversation for context, checked official documentation, authored the source and docs, and ran local checks. Git tracks the local project. |
| Development prompt evolution | The master brief proposed AirWise Family and several architecture options. The newer participant prompt fixed the project name, path and stack. The final wrapper established source precedence and asked for conflicts to be recorded before implementation. |
| Runtime prompt evolution | The brief's draft contract described free-form action and rationale text. Phase 1 changed the output to one vetted action ID per category and added explicit freshness, profile eligibility and missing-data constraints. This decision came from Codex implementation work. |
| Runtime prompt location | The system instructions, profile filters and structured response schema are in [recommendations.ts](../src/lib/server/recommendations.ts). |
| Evidence | The repository includes Vitest cases for freshness, response validation, missing values, provider failures and Gemini output validation. Lint, strict type checking, 16 Vitest tests and the production build passed. A Chrome smoke test at 1400 px and 390 px confirmed live modeled PM for Delhi and Mumbai, city switching, keyboard focus, missing credentials, empty results and invalid inputs. Actual authenticated provider tests require keys. |
| Human review | The participant's review of the implementation and live probe with their credentials remain to be recorded. |
| Planned tool | Google Antigravity was selected for a later UX and functional review. It was not used in this phase. |

For subsequent sessions, record the task, tool and reason, exact prompt change, participant decisions, output or test evidence, and unresolved limitations. Include prompt excerpts in the LinkedIn post only if the participant chooses to share them.


## 22 November 2026 · Search and recommendations follow-up

The participant reported ambiguous Delhi results and similar indoor and travel advice for children and working adults. Codex reproduced the geocoding results and updated the prompt to consider household-specific indoor activities and commute-specific travel options. The prompt now sends vetted action text with each ID and allows the same action across profiles when it still fits. Regression tests exercise the structured SDK request with a mocked response and check that invalid selections are rejected.

Verification: all 26 Vitest cases, lint, strict type checking and the production build passed. A production browser check verified Delhi ordering, two distinct Madhya Pradesh namesakes, state-qualified search, Chanderi, and live PM2.5 and PM10 from OpenAQ and Open-Meteo. After the participant confirmed free-tier status, two live Gemini requests returned successful structured plans using recent Delhi station data. The children profile received an indoor-play backup and a play space away from smoke and cooking fumes. The working-adult profile received a check-before-activity action and a conditional purifier-filter check. Both plans recommended combining errands for the shared Flexible errands priority.


## 22 November 2026 · Phase 2 UI/UX Implementation (Google Antigravity)

| Item | Record |
| --- | --- |
| Human input | The participant provided a high-fidelity visual design mockup (`media_1795323288427_116bdc6e.jpg`) representing the desired frontend UI/UX for Phase 2. The participant requested implementation on branch `feature/antigravity-ui`, preserving all existing backend integrations, API contracts, and 26 passing tests without fabricating AQI numbers or exposing secrets. |
| Development tools used | Google Antigravity (powered by Gemini 3.8 Flash High) executed the frontend design and engineering pass: inspected baseline commit `e1028b3`, authored design tokens in `globals.css`, re-architected `dashboard.tsx`, updated `page.tsx` and `layout.tsx`, resolved accessibility and ESLint constraints, and verified the build. |
| Design direction & rationale | Adopted the "Atmospheric Clarity & Civic Trust" design language from the mockup: emerald/mint/slate palette, atmospheric hero with integrated search and quick-select chips, distinct dual-stream cards for OpenAQ ground stations vs Open-Meteo CAMS models, interactive household cards, and 3 structured Gemini recommendation cards with "Why this matters" qualitative impact explanations. |
| Human vs AI decisions | Human provided the UI reference mockup, scope constraints, and design approval. AI implemented the responsive layouts, component hierarchy, CSS design system, disambiguation dropdown, keyboard navigation, and test preservation. Codex later completed the ARIA tab keyboard behavior and verified it in the browser. |
| Prompt evolution | The initial Phase 1 prompt emphasized server-side integration and structured JSON schemas. Phase 2 shifted focus to consumer-grade user experience, visual distinction of sensor vs modeled data, accessible touch targets, and transparent civic communication. |
| Verification evidence | - Strict TypeScript check: 0 errors (`next typegen && tsc --noEmit`).<br>- ESLint: 0 errors (`eslint .`).<br>- Vitest: 26/26 tests passed (`tests/air-quality.test.ts`, `tests/geocoding.test.ts`, `tests/recommendations.test.ts`).<br>- Production build: `next build` succeeded with optimized static routes and server Route Handlers.<br>- Server probe: Verified live API responses for Delhi (Station: Chandni Chowk IITM, CPCB; Model: CAMS) and Mumbai. |
| LinkedIn post documentation | All architectural choices, AI tool contributions (Codex for backend Phase 1; Antigravity for UI/UX Phase 2), and verified prompt iterations are recorded here for the required competition post. |


## 22 November 2026 · Phase 2 Final Refinements (Google Antigravity)

| Item | Record |
| --- | --- |
| Human input | The participant manually verified the application with Hyderabad data and requested final refinements: eliminate narrow desktop whitespace, verify responsiveness down to 360px, confirm live Gemini structured inference (distinguishing real responses from fallbacks without unnecessary paid calls), test missing-data/failure states, and preserve OpenAQ vs Open-Meteo distinctions. |
| Development tools used | Google Antigravity (Gemini 3.8 Flash High) authored the desktop cockpit layout, optimized mobile breakpoints, added automated tests for edge-case failure modes, reported live Hyderabad Gemini output via localhost probe, and updated documentation. |
| Key decisions | 1. Widened `.shell` to 1380px and paired Air Quality Intelligence and Household Selection side-by-side on desktop displays (1.15fr : 0.85fr), positioning the 3 recommendation cards full-width below.<br>2. Added horizontal scroll containment to tab bar and clamp sizing on reading tiles for 360px–430px mobile viewports.<br>3. Antigravity reported a live Hyderabad Gemini probe returning IDs `indoorPlay`, `playSpace`, and `combine` with `basis: "recent-station"` grounded in live CPCB station data. Added `Live Gemini Inference` badge.<br>4. Expanded test suite from 26 to 28 passing tests with coverage for 0-station locations and partial model responses. |
| Verification evidence | - Vitest: 28/28 tests passing (`tests/air-quality.test.ts`, `tests/geocoding.test.ts`, `tests/recommendations.test.ts`).<br>- Strict TypeScript (`tsc --noEmit`): 0 errors.<br>- ESLint: 0 errors.<br>- Production build: `next build` succeeded with Turbopack.<br>- Live Gemini probe: Antigravity reported structured inference against OpenAQ observations in Hyderabad. |

## 22 November 2026 · Final Phase 2 code review (Codex)

The participant supplied the scope, visually reviewed the desktop design, and confirmed the configured Gemini project was on the free tier for one test request. Codex reviewed the uncommitted branch against Phase 1.1, repaired city-state isolation, restored explicit household selection, and verified the API contracts. Codex corrected per-reading station attribution, CAMS global grid resolution, misleading health copy, keyboard tab navigation, accessible names, text contrast, and the How It Works link.

The server now marks valid Gemini selections with a source field. The browser checks exercised Gemini success with and without recent data, explicit fallback, missing origin, and provider failure. A single live Delhi browser request returned HTTP 200 with source gemini, basis recent-station, and action IDs indoorPlay, playSpace, and maintain for a children/public-transport profile. OpenAQ and Open-Meteo supplied recent PM2.5 and PM10. Runtime prompt instructions were unchanged in this review.

Verification: 28 Vitest tests, ESLint, strict TypeScript, production build, and npm audit passed. Chromium at 360 px, 390 px, and 430 px showed no horizontal page overflow and no violations in axe's WCAG 2.0 and 2.1 A/AA rules for the tested dashboard state. Keyboard tab navigation, household selection, city changes, and disabled generation while readings load were exercised. The configured keys were absent from changed files and built browser assets.
