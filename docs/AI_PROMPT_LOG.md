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
