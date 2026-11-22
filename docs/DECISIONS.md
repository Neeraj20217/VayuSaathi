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
