# Architecture

## Application boundary

Next.js App Router serves the dashboard and three Route Handlers. TypeScript runs in strict mode and Tailwind CSS provides styling. The default Node runtime is compatible with a Next.js deployment on Vercel. The repository is initialized locally with Git.

| Route | Input | Behavior |
| --- | --- | --- |
| GET /api/cities | q, a trimmed 2–80-character search term | Searches Open-Meteo geocoding using the IN filter. Ranks exact names first, then population, and returns up to ten distinct settlements with state or territory and locality when needed. |
| GET /api/air-quality | cityId, a positive numeric geocoding ID | Resolves the city server-side and returns independent station and modeled sections. |
| POST /api/recommendations | City ID and enumerated household choices | Validates a bounded JSON body, resolves the city, fetches provider context, invokes Gemini and validates its response. Returns the exact reading snapshot used for the plan. |

All provider requests use fixed hosts. Coordinates and city identity come from the server-side resolver. Provider GET requests have a seven-second timeout and request five-minute Next.js revalidation. Plan responses use Cache-Control no-store. The app collects profile categories only and keeps them in React state. Server mappings prevent keys from entering the client bundle.

## Outdoor data contract

OpenAQ v3 searches for stationary Indian stations within 25 km of the resolved city center. Phase 1 inspects the first 100 results and checks up to three candidates per pollutant. Candidates are ordered by station-level freshness and distance, and actual readings are ranked by reading-level freshness and distance. The latest endpoint is joined to station sensors by ID to verify pollutant and units. A PM2.5 and PM10 reading may come from different stations and each displays its own provenance.

Open-Meteo returns a CAMS grid estimate for the supplied coordinates. Its time is model validity time and the application labels it as such by placing it under modeled estimates. Observation and model time are presented in IST. Negative, malformed, wrong-unit or materially future values are skipped. Zero remains valid. Up to 3 hours old is recent, up to 24 hours is delayed and older readings are stale. A five-minute future tolerance accommodates clock skew. Provider outages are distinct from missing coverage.

## Recommendation contract

The server sends Gemini the city name, categorical profile, source-labeled recent outdoor concentrations and eligible action IDs, titles and explanations. The model returns one ID for each of the daily routine, indoor air and lower-emission travel categories. Zod validates the shape and the service validates the options against the household and data context. A server catalogue supplies the action copy and qualitative impact explanation. Household categories can add indoor and routine options. The commute selection controls eligible travel options. Shared advice remains eligible when relevant. Limited data constrains routine guidance to checking conditions. Measured values always come from their providers.

Public deployment will need a request-quota strategy for paid or rate-limited services. Phase 1 bounds request size and outbound calls, and the default local dev server can be bound to loopback.

## References

- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
- [OpenAQ v3 locations](https://docs.openaq.org/api/operations/locations_get_v3_locations_get)
- [OpenAQ latest measurements](https://docs.openaq.org/resources/latest)
- [Open-Meteo geocoding and GeoNames attribution](https://open-meteo.com/en/docs/geocoding-api)
- [Open-Meteo air quality and CAMS attribution](https://open-meteo.com/en/docs/air-quality-api)
- [Gemini structured outputs](https://ai.google.dev/gemini-api/docs/structured-output)
- [EPA indoor particulate matter guidance](https://www.epa.gov/indoor-air-quality-iaq/indoor-particulate-matter)

