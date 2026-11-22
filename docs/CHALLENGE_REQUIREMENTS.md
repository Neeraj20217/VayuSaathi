# Challenge 06 requirements

Source: PromptWars Challenge 06 Project Master Brief, 22 November 2026. See pp. 2–6, original slides on pp. 11–15 and source transcript on pp. 16–24. The supplied Phase 1 prompt governs implementation details.

## Confirmed organizer requirements

- Build a GenAI assistant that helps families or communities navigate severe winter smog and urban air pollution. Tailor low-emission routines, indoor air guidance and sustainable alternatives to location and lifestyle, and explain the impact of choices.
- Use actual external outdoor air-quality data for the user's Indian location. Show where it came from and when it was observed. GenAI interprets the data.
- Submit individually. The organizer deadline is **29 November 2026 at 11:59 PM IST**. There are up to three attempts and the final attempt's score counts.
- Submit the deployed application URL, GitHub repository, LinkedIn post and screen-recorded demonstration. LinkedIn must explain the tools and rationale, architecture and prompt flow, prompt evolution and human versus AI work. Prompt excerpts and screenshots are optional.
- Automated assessment covers code quality, security, efficiency, testing, accessibility and problem alignment. The organizers assess working prototypes after closing, which can change the leaderboard.
- Tooling and stack are flexible. Targeting either desktop or mobile is permitted. English is accepted.

Evidence timestamps in the supplied transcript: submission 4:04–5:14 and 7:25–7:41, scoring 9:12–10:35 and 35:48–36:24, tool documentation 10:43–12:04, problem 12:19–12:42, live data 22:10–24:12 and location 44:13–44:52.

## Phase 1 acceptance

- [x] Initialize Git and implement Next.js App Router, strict TypeScript, Tailwind CSS, ESLint and Vitest in the requested directory.
- [x] Implement search and selection for Indian locations and display PM2.5/PM10 with units, provider, timestamps and freshness.
- [x] Keep station observations and model estimates separate, with meaningful missing-data and error states.
- [x] Capture family categories, typical commute and lifestyle priority on a responsive dashboard.
- [x] Ground Gemini's validated structured choices in server-fetched data. Supply qualitative impact explanations and route secrets through server-only modules.
- [x] Provide an environment template, README, architecture, decisions and AI prompt log.
- [x] Verified authenticated OpenAQ and Gemini calls in Delhi and observed profile differences in live output. See the AI prompt log for the two profiles and results.

## Submission readiness

- [x] Application implemented and reviewed.
- [x] [Public GitHub repository](https://github.com/Neeraj20217/VayuSaathi).
- [x] [Public Vercel production deployment](https://vayusaathi.vercel.app).
- [x] OpenAQ station observations and Open-Meteo CAMS estimates verified in production.
- [x] Gemini recommendation integration verified in production.
- [x] Production QA recorded and mobile headline and search-layout corrections deployed in `f146546`. See the [QA and release record](PRODUCTION_QA_REPORT.md).
- [ ] Record the demo of the live application.
- [ ] Publish the mandatory LinkedIn technical post.
- [ ] Submit the application URL, repository, demo recording, and LinkedIn post to PromptWars.

## Proposed enhancements

The brief suggests morning/afternoon/evening planning, multilingual support, location permission, action tracking, saved profiles and evaluator sample profiles. These are optional. The Phase 1 prompt adds responsive UI, the fixed technology stack and local-only work without prior publication or spending approval.
