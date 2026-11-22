# VayuSaathi

VayuSaathi is an urban air-quality assistant for Indian households. It combines nearby outdoor particle readings with practical guidance for daily activities, indoor air, and travel.

[Live application](https://vayusaathi.vercel.app) · [GitHub repository](https://github.com/Neeraj20217/VayuSaathi)

## PromptWars Challenge 06

The challenge asks for a GenAI assistant that helps families and communities navigate winter smog and urban air pollution. It should tailor low-emission routines, indoor-air improvements, and sustainable alternatives to the user’s location and lifestyle, and explain why each action helps.

## What you can do

- Search Indian cities and smaller towns. Choose the right place using state, territory, and locality labels.
- Compare nearby OpenAQ monitoring-station observations with Open-Meteo CAMS modeled estimates. Available PM2.5 and PM10 include units, source, timestamp, and freshness.
- Select household members, commute mode, and a priority. Gemini selects vetted actions for daily routines, indoor air, and lower-emission travel. Each card explains why the action matters.
- Use the responsive dashboard on mobile or desktop, with keyboard-operable tabs, labeled controls, visible focus, and reduced-motion support.

## Architecture and stack

```text
Browser → Next.js server routes → Open-Meteo geocoding, OpenAQ stations, CAMS estimates
For a plan: recent provider data + household choices → Gemini → server validation → browser
```

| Component | Purpose |
| --- | --- |
| Next.js App Router, React, TypeScript | Dashboard, server-only integrations, and typed data contracts |
| Tailwind CSS | Responsive styling and focus states |
| OpenAQ v3 and Open-Meteo | Station observations, India-wide location search, and CAMS model estimates |
| Google Gen AI SDK and Zod | Structured action selection and validation against eligible actions |
| Vitest and ESLint | Automated behavior checks and linting |
| Vercel and GitHub | Node.js 24 hosting and versioned source |

## Run locally

Use Node.js 24 and npm.

```sh
git clone https://github.com/Neeraj20217/VayuSaathi.git
cd VayuSaathi
npm ci
```

Copy [`.env.example`](.env.example) to `.env.local`, fill in the required keys for the features you want to test, and keep the file out of Git.

| Variable | Purpose |
| --- | --- |
| `OPENAQ_API_KEY` | Required for station observations. [Get an OpenAQ key](https://docs.openaq.org/using-the-api/api-key). |
| `GEMINI_API_KEY` | Required for personalized plans. [Manage keys in Google AI Studio](https://aistudio.google.com/apikey). |
| `GEMINI_MODEL` | Optional structured-output model override. The application has a server-side default. |

City search and modeled estimates use the [Open-Meteo non-commercial API](https://open-meteo.com/en/terms) without an API key.

```sh
npm run dev -- --hostname 127.0.0.1
```

Open [127.0.0.1:3000](http://127.0.0.1:3000).

## Verify

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

For a quick walkthrough, search for Delhi, select the National Capital Territory result, and compare the source and timestamp on each data stream. Select household and commute options, then request a plan to see the action explanations and Gemini provenance.

## Production and data limits

Vercel builds GitHub `main` from the repository root with the Next.js preset, Node.js 24, and default build settings. Configure both API keys as Production Secrets. The optional model override is Production Config. The Vercel firewall allows three recommendation POSTs per IP per 60 seconds. Provider quotas and station coverage still apply.

PM concentrations are reported in µg/m³. They are not AQI scores or categories. OpenAQ reports outdoor observations at specific stations. Open-Meteo provides modeled outdoor estimates from the CAMS global grid, at about 45 km resolution in India. Indoor-air guidance is general and does not measure indoor conditions.

- [Architecture and provider contracts](docs/ARCHITECTURE.md)
- [Development decisions](docs/DECISIONS.md)
- [AI tools and prompt log](docs/AI_PROMPT_LOG.md)
- [Production QA and release history](docs/PRODUCTION_QA_REPORT.md)
- [Challenge requirements and submission checklist](docs/CHALLENGE_REQUIREMENTS.md)
