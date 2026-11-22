# Architecture

## Application boundary

Next.js App Router serves the dashboard and three Route Handlers. TypeScript runs in strict mode and Tailwind CSS provides styling. The application is deployed on Vercel using Node.js 24 and the Next.js preset from GitHub `main`.

| Route | Input | Behavior |
| --- | --- | --- |
| GET /api/cities | q, a trimmed 2–80-character search term | Searches Open-Meteo geocoding using the IN filter. Ranks exact names first, then population, and returns up to ten distinct settlements with state or territory and locality when needed. |
| GET /api/air-quality | cityId, a positive numeric geocoding ID | Resolves the city server-side and returns independent station and modeled sections. |
| POST /api/recommendations | City ID and enumerated household choices | Validates a bounded JSON body, resolves the city, fetches provider context, invokes Gemini and validates its response. Returns the reading snapshot used for the plan and an additive source field. Gemini errors return an error response, with no substitute plan. |

All provider requests use fixed hosts. Coordinates and city identity come from the server-side resolver. Provider GET requests have a seven-second timeout and request five-minute Next.js revalidation. Plan responses use Cache-Control no-store. The app collects profile categories only and keeps them in React state. Server mappings prevent keys from entering the client bundle.

## Outdoor data contract

OpenAQ v3 searches for stationary Indian stations within 25 km of the resolved city center. Phase 1 inspects the first 100 results and checks up to three candidates per pollutant. Candidates are ordered by station-level freshness and distance, and actual readings are ranked by reading-level freshness and distance. The latest endpoint is joined to station sensors by ID to verify pollutant and units. A PM2.5 and PM10 reading may come from different stations and each displays its own provenance.

Open-Meteo returns an outdoor estimate for the supplied coordinates. For India, the CAMS global atmospheric composition model has a grid resolution of about 45 km. Its time is model validity time and the application labels it as such by placing it under modeled estimates. Observation and model time are presented in IST. Negative, malformed, wrong-unit or materially future values are skipped. Zero remains valid. Up to 3 hours old is recent, up to 24 hours is delayed and older readings are stale. A five-minute future tolerance accommodates clock skew. Provider outages are distinct from missing coverage.

## Recommendation contract

The server sends Gemini the city name, categorical profile, source-labeled recent outdoor concentrations and eligible action IDs, titles and explanations. The model returns one ID for each of the daily routine, indoor air and lower-emission travel categories. Zod validates the shape and the service validates the options against the household and data context. After Gemini returns a valid selection, the server adds plan.source = "gemini". The UI renders the live-inference badge only for that origin and renders grounded card labels only if recent provider data was used. An explicitly marked fallback is displayed as fallback guidance. A plan with unknown origin is displayed without Gemini attribution. A server catalogue supplies the action copy and qualitative impact explanation. Household categories can add indoor and routine options. The commute selection controls eligible travel options. Shared advice remains eligible when relevant. Limited data constrains routine guidance to checking conditions. Measured values always come from their providers.

The production Vercel firewall limits recommendation POSTs to three per IP per 60 seconds. The server also bounds request size and outbound calls. Provider-wide quotas still apply. See the [production QA report](PRODUCTION_QA_REPORT.md) for the observed HTTP 429 behavior.

## References

- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
- [OpenAQ v3 locations](https://docs.openaq.org/api/operations/locations_get_v3_locations_get)
- [OpenAQ latest measurements](https://docs.openaq.org/resources/latest)
- [Open-Meteo geocoding and GeoNames attribution](https://open-meteo.com/en/docs/geocoding-api)
- [Open-Meteo air quality and CAMS attribution](https://open-meteo.com/en/docs/air-quality-api)
- [Gemini structured outputs](https://ai.google.dev/gemini-api/docs/structured-output)
- [EPA indoor particulate matter guidance](https://www.epa.gov/indoor-air-quality-iaq/indoor-particulate-matter)

## Frontend UI/UX architecture (Phase 2)

```
[ App Shell / RootLayout (src/app/layout.tsx) ]
  ├── [ Skip Link ]
  ├── [ Sticky Site Header (brand, nav links, "Powered by GenAI" badge) ]
  ├── [ Main Content Area (src/app/page.tsx) ]
  │     └── [ Dashboard (src/components/dashboard.tsx) ]
  │           ├── [ Atmospheric Hero Section ]
  │           │     ├── Title: "Breathe Better, Live Healthier"
  │           │     ├── Search Container (Input, Clear, Search, "Use my location")
  │           │     ├── Quick City Chips (Delhi, Mumbai, Kolkata, Bengaluru, Hyderabad)
  │           │     └── Search Disambiguation Card (State/UT, Locality, Arrow)
  │           ├── [ Navigation Tabs: Recommendations | About Data | Health & Safety ]
  │           ├── [ Desktop Cockpit Grid (.dashboard-main-grid, 1.15fr : 0.85fr) ]
  │           │     ├── Column 1: City Readings Panel (.panel)
  │           │     │     ├── City Title Bar (Pin, Name, Region, Timestamp, Spin Refresh)
  │           │     │     ├── Stream A: OpenAQ Station Observations (PM2.5, PM10, Station, km, IST time)
  │           │     │     ├── Stream B: Open-Meteo CAMS Modeled Estimates (PM2.5, PM10, ~45 km global grid, IST time)
  │           │     │     └── Transparency Notice (µg/m³, sensor vs model)
  │           │     └── Column 2: Household Profile Section (.household-section)
  │           │           ├── Member Toggle Cards 2x2 (Children, Older adults, Working adults, Students)
  │           │           ├── Commute & Priority Selectors
  │           │           ├── Active Household Focus Tags
  │           │           └── CTA: "Create My Personalized Plan" (Sparkles, Gemini trigger)
  │           ├── [ Full-Width Gemini Action Plan (.recommendations-panel) ]
  │           │     ├── Plan Basis Callout (Station, model, or limited basis plus verified Gemini origin)
  │           │     └── 3-Column Action Cards Grid
  │           │           ├── Daily Routine Card (Action + Why this matters)
  │           │           ├── At Home / Indoor Card (Action + Why this matters)
  │           │           └── Travel & Commute Card (Action + Why this matters)
  │           └── [ Educational Views: AboutDataView & HealthSafetyView ]
  └── [ Site Footer (provider attribution, how the app works, PromptWars details) ]
```

The device-location shortcut compares coordinates locally with five supported Indian metros. It offers a metro only when it is within 50 km and identifies it as a metro search, leaving India-wide city search available. Readings and plans are scoped to the selected city ID. Each station reading displays its own observation time and station metadata.
