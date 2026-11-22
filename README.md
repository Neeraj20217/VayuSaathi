# VayuSaathi

VayuSaathi helps households in India use nearby outdoor air-quality information to plan everyday activities. Search for a city or enter a city and state, review available PM2.5 and PM10, and create a personalized daily routine, indoor air and travel plan.

## Run locally on Windows

Use Node.js 24 and npm. From PowerShell:

```powershell
Set-Location 'D:\Coding\Codex\VayuSaathi'
npm.cmd ci
Copy-Item .env.example .env.local
npm.cmd run dev -- --hostname 127.0.0.1
```

Open [127.0.0.1:3000](http://127.0.0.1:3000). Add your own keys to .env.local and restart the server after changing them.

| Variable | Purpose |
| --- | --- |
| OPENAQ_API_KEY | Enables station observations. Get a key through [OpenAQ registration](https://docs.openaq.org/using-the-api/api-key). |
| GEMINI_API_KEY | Enables AI plans. Get a key through [Google AI Studio](https://aistudio.google.com/apikey) and confirm the quota and billing configuration before making requests. |
| GEMINI_MODEL | Optional override. Defaults to gemini-3.5-flash-lite. Select an available structured-output model from the [Gemini model list](https://ai.google.dev/gemini-api/docs/models). |

City search and modeled estimates use Open-Meteo's [non-commercial API](https://open-meteo.com/en/terms) without credentials. The application displays the missing-key state for each feature that requires one.

## Verify

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

For a local functional walkthrough, search for Delhi and choose the National Capital Territory result. Check the source and timestamp for each available reading. Repeat with Mumbai. With Gemini configured, compare a household with children and an outdoor-activity priority against a working adult who commutes by car. Check the explanation for each action. An indoor or travel action can repeat when it still fits both profiles.

## Data and guidance

Station observations come from nearby OpenAQ monitors. Estimates come from Open-Meteo and the Copernicus Atmosphere Monitoring Service (CAMS). Data availability varies by city, sensor and time. The dashboard displays pollutant concentrations in µg/m³. Indoor cards offer general guidance and outdoor readings describe outdoor conditions. Household choices stay in the current browser session and are sent to Gemini when you request a plan.

- [Architecture and provider contracts](docs/ARCHITECTURE.md)
- [Decisions and open questions](docs/DECISIONS.md)
- [Organizer requirements and Phase 1 acceptance](docs/CHALLENGE_REQUIREMENTS.md)
- [AI prompt log and contribution record](docs/AI_PROMPT_LOG.md)

