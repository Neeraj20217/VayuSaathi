# VayuSaathi — Production QA & Verification Report

## Current release status

| Item | Verified status |
| --- | --- |
| Production URL | [vayusaathi.vercel.app](https://vayusaathi.vercel.app) |
| GitHub repository | [Neeraj20217/VayuSaathi](https://github.com/Neeraj20217/VayuSaathi) |
| Mobile-fix application revision | [`f146546e297de2508face1edba0d44284c5291d9`](https://github.com/Neeraj20217/VayuSaathi/commit/f146546e297de2508face1edba0d44284c5291d9) |
| Release verification | On 22 November 2026, GitHub `main` and the Vercel production domain were verified at `f146546`. Vercel reported Ready. |

The mobile headline and search-layout fixes are committed, pushed, and deployed. The matrix, headers, measurements, and inference records below are historical evidence from the initial QA run. The documentation review verified release metadata without repeating those tests or live provider calls.

## Initial production QA record

- **Application revision** [`84234d405e09e5f391f879193aa3050425c0c4c2`](https://github.com/Neeraj20217/VayuSaathi/commit/84234d405e09e5f391f879193aa3050425c0c4c2)
- **Test date and time** 22 November 2026, 12:15 PM IST
- **Initial result** The functional checks passed and the layout review identified two narrow-screen issues. The fix was developed on `fix/mobile-production-qa` and shipped in `f146546`.

## 1. Test Summary Matrix

| # | Test Name | Status | Summary & Observable Evidence |
| :--- | :--- | :--- | :--- |
| **1.1** | **Public Accessibility & HTTPS** | **PASS** | HTTP 200 OK via HTTPS with HSTS enabled (`max-age=63072000`). No Vercel authentication or password wall. Server edge: Vercel Mumbai (`bom1`). |
| **1.2** | **Client Bundle Security Audit** | **PASS** | Scanned 8 production JavaScript chunks and SSR HTML. **Zero secrets exposed** (no API keys, tokens, or backend environment variables in bundles). |
| **1.3** | **City Search: Major Metros** | **PASS** | Delhi, Mumbai, Hyderabad, Bengaluru, Kolkata resolved accurately with region, coordinates, and population ranking via Open-Meteo geocoding. |
| **1.4** | **City Search: Disambiguation** | **PASS** | Querying "Delhi" returned 6 settlements. Rank #1 is Delhi NCT (`ID: 1273294`); ranks #2 & #3 correctly labeled distinct Madhya Pradesh namesakes (`Sirmour, Rewa`, `Mangawan, Rewa`). |
| **1.5** | **City Search: Smaller Towns** | **PASS** | Querying "Chanderi" returned 7 settlements, accurately resolving Chanderi, MP (`ID: 1274755`). |
| **1.6** | **City Search: Input Validation** | **PASS** | Empty, single-char, whitespace, and >80 char queries cleanly rejected with HTTP 400 Bad Request (`"Enter a city name of 2 to 80 characters."`). |
| **1.7** | **Air Quality: OpenAQ Stations** | **PASS** | Live physical monitor readings retrieved for Delhi (Chandni Chowk IITM, 0.7 km), Mumbai (BKC MPCB), Hyderabad (Somajiguda TSPCB), Bengaluru (Hombegowda Nagar), Kolkata (Fort William). Reported in µg/m³ with IST timestamps. |
| **1.8** | **Air Quality: CAMS Modeled Estimates** | **PASS** | Copernicus Atmosphere Monitoring Service (CAMS) global atmospheric model estimates (~45 km horizontal grid over India) returned for all tested cities with model validity time in IST. |
| **1.9** | **Air Quality: Zero-Station Coverage** | **PASS** | For Chanderi (no monitor within 25 km), OpenAQ returned `status: "no-data"` (0 readings), while Open-Meteo CAMS seamlessly provided estimates (`status: "available"`). |
| **1.10** | **Air Quality: Parameter Validation** | **PASS** | Non-numeric or negative city IDs (`abc`, `-5`, `0`, `99999999999`) rejected with HTTP 400 (`"Select a city from the search results."`). |
| **1.11** | **Gemini Live Recommendation (Profile A)** | **PASS** | Live inference for Children, Car/Two-wheeler, Flexible errands (Delhi). Returned child-specific `indoorPlay` & `playSpace`, vehicle `combine`. Grounded in live station data (`recent-station`). |
| **1.12** | **Gemini Live Recommendation (Profile B)** | **PASS** | Live inference for Working adults, Public transport, Lower-emission travel (Mumbai). Returned commuter-specific `checkBefore`, source control `smoke`, and transit `maintain`. Grounded in live station data (`recent-station`). |
| **1.13** | **Recommendations: Request Security** | **PASS** | GET rejected (HTTP 405). Non-JSON rejected (HTTP 415). Missing members rejected (HTTP 400). Oversized body (>2048 bytes) rejected (HTTP 400). |
| **1.14** | **Edge Firewall & Rate Limiting** | **PASS** | Burst requests triggered Vercel Edge Firewall Rate Limit (HTTP 429 Too Many Requests, Edge ID `bom1::...`), verifying quota protection. Spaced user requests pass cleanly. |
| **1.15** | **Desktop Viewports (1920px & 1366px)** | **PASS** | Side-by-side cockpit (.dashboard-main-grid) renders cleanly. No awkward whitespace or clipped elements. |
| **1.16** | **Mobile Viewports (360px, 390px, 430px)** | **RESOLVED** | On production commit `84234d4`, hero title "Breathe Better, Live Healthier" clipped "Healthier" on widths $\le 390\text{px}$, and search buttons squeezed in a single row without wrapping. Fixed in `f146546` with responsive headline sizing and a two-row search layout. |

---

## 2. Initial Deployment Evidence

### A. Public Headers & Edge Routing
```http
HTTP/2 200 OK
server: Vercel
x-vercel-id: bom1::c76k7-1795329672038-a91f59636d8c
x-vercel-cache: HIT
strict-transport-security: max-age=63072000; includeSubDomains; preload
content-type: text/html; charset=utf-8
cache-control: public, max-age=0, must-revalidate
```

### B. Live Air-Quality Observations Recorded
| City | OpenAQ Station | PM2.5 (µg/m³) | PM10 (µg/m³) | Freshness | Distance | CAMS Model PM2.5 (~45 km) | CAMS Model PM10 (~45 km) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Delhi** | Chandni Chowk - IITM (CPCB) | 149.8 | 262.0 | Recent | 0.7 km | 94.8 | 97.3 |
| **Mumbai** | BKC - MPCB / Mumbai (AirNow) | 103.0 | 210.9 | Recent | 2.3 km | 96.9 | 99.9 |
| **Hyderabad**| Somajiguda - TSPCB | 27.9 | 51.9 | Recent | 3.7 km | 36.2 | 37.4 |
| **Bengaluru**| Hombegowda Nagar - KSPCB | 71.0 | 150.0 | Recent | 3.7 km | 47.0 | 49.4 |
| **Kolkata**  | Fort William - WBPCB | 21.5 | 34.7 | Recent | 2.2 km | 10.6 | 12.1 |
| **Chanderi** | *None within 25 km (no-data)* | — | — | — | — | 28.9 | 31.9 |

### C. Live Gemini Recommendation Invocations (Exactly 2 Calls)
- **Call 1 of 2 (Profile A — Children, Car/two-wheeler, Flexible errands in Delhi):**
  - **HTTP Status:** 200 OK
  - **Plan Basis:** `recent-station`
  - **Source Attribution:** `gemini`
  - **Routine Action:** `[indoorPlay]` *"Have an indoor play option ready"*
  - **Indoor Action:** `[playSpace]` *"Choose a play space away from cooking fumes and smoke"*
  - **Travel Action:** `[combine]` *"Combine errands into one trip when practical"*
  - **Observation Grounding:** Chandni Chowk physical station ($149.8\ \mu\text{g/m}^3\ \text{PM2.5}$)
- **Call 2 of 2 (Profile B — Working adults, Public transport, Lower-emission travel in Mumbai):**
  - **HTTP Status:** 200 OK
  - **Plan Basis:** `recent-station`
  - **Source Attribution:** `gemini`
  - **Routine Action:** `[checkBefore]` *"Check conditions before outdoor activity"*
  - **Indoor Action:** `[smoke]` *"Skip optional indoor smoke sources"*
  - **Travel Action:** `[maintain]` *"Keep using shared transport when it fits"*
  - **Observation Grounding:** Bandra Kurla Complex physical station ($103.0\ \mu\text{g/m}^3\ \text{PM2.5}$)

---

## 3. Visual Layout & Responsive Inspection

### Original screenshot inventory

The filenames identify local artifacts from the initial QA run. The screenshots are not bundled in this repository.

- **Desktop (1920x1080):** `screenshot_desktop_1920.png`
  - Balanced side-by-side cockpit (.dashboard-main-grid)
  - Generous padding, no excessive whitespace margins
- **Desktop (1366x768):** `screenshot_desktop_1366.png`
  - Clean card rendering, all controls and labels legible
- **Mobile (430px):** `screenshot_mobile_430.png`
  - Stacks into single column cleanly
- **Mobile (390px):** `screenshot_mobile_390.png`
  - Baseline production observation on deployed commit `84234d4`
- **Mobile (360px):** `screenshot_mobile_360.png`
  - Compact mobile behavior tested

---

## 4. Issues Found & Reproduction Steps

### Issue 1: Mobile Hero Headline Truncation on Viewports $\le 390\text{px}$
- **Severity:** Low-Medium (Visual/Responsive polish)
- **Status at initial revision (`84234d4`):** Present
- **Reproduction Steps:**
  1. In the original QA run, open the deployment of `84234d4` at a 390px or 360px viewport.
  2. Observe the main hero title: *"Breathe Better, Live Healthier"*.
  3. The word *"Healthier"* is clipped at the right margin because the font-size clamp `clamp(2.2rem, 5.2vw, 3.8rem)` does not scale down sufficiently for narrow mobile screens.
- **Fix Status:** **Deployed in `f146546`** by applying responsive fluid clamp `clamp(1.75rem, 6.2vw, 2.5rem)` at $\le 640\text{px}$ and `clamp(1.5rem, 6vw, 1.85rem)` at $\le 380\text{px}$ in `src/app/globals.css`.

### Issue 2: Mobile Search Bar Controls Cramping on Viewports $\le 390\text{px}$
- **Severity:** Low-Medium (Touch Ergonomics)
- **Status at initial revision (`84234d4`):** Present
- **Reproduction Steps:**
  1. In a 360px or 390px viewport, observe the search bar container.
  2. The input field, *"Search"* button, and *"Use my location"* button attempt to stay on a single horizontal row, causing the location button label to truncate to *"Use m..."*.
- **Fix Status:** **Deployed in `f146546`** via semantic `.search-input-group` (Row 1) and `.search-actions-group` (Row 2) with balanced `flex: 1 1 0` scaling at $\le 640\text{px}$, ensuring full visibility of *"Use my location"* without clipping.

---

## 5. Security & Resilience Assessment

1. **Secret Leakage Prevention:** Verified that neither `OPENAQ_API_KEY` nor `GEMINI_API_KEY` is present in HTML responses, client JavaScript bundles, or client-accessible DOM nodes. All API communication uses server-only route handlers.
2. **Vercel Edge Firewall:** Burst requests returned HTTP 429, confirming the per-IP request limit for the tested traffic. Provider-wide quotas still apply.
3. **Bounded Payloads:** All Route Handlers enforce strict Zod schemas and character/byte bounds (e.g. 2048-byte limit on profile payloads).

---

## 6. Remaining submission tasks

- Record the demo of the public application.
- Publish the mandatory LinkedIn technical post.
- Submit the production URL, GitHub repository, demo recording, and LinkedIn post to PromptWars by 29 November 2026, 11:59 PM IST. See the [submission checklist](CHALLENGE_REQUIREMENTS.md).
