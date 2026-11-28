import { eligibleForGrounding, type AirQuality, type DataSource, type Freshness, type Plan, type Pollutant, type Profile } from "@/lib/contracts";

export const POPULAR_METROS = [
  { name: "Delhi", query: "Delhi", code: "DEL", region: "National Capital Territory of Delhi", lat: 28.65, lon: 77.23 },
  { name: "Mumbai", query: "Mumbai", code: "BOM", region: "Maharashtra", lat: 18.97, lon: 72.82 },
  { name: "Kolkata", query: "Kolkata", code: "CCU", region: "West Bengal", lat: 22.57, lon: 88.36 },
  { name: "Bengaluru", query: "Bengaluru", code: "BLR", region: "Karnataka", lat: 12.98, lon: 77.59 },
  { name: "Hyderabad", query: "Hyderabad", code: "HYD", region: "Telangana", lat: 17.38, lon: 78.47 },
] as const;

export type LocationOrigin = "default" | "selected" | "detected";

export type AppViewTab = "assistant" | "about-data" | "health-guide";

const istFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

export function formatIstTimestamp(isoTimestamp: string): string {
  const parsed = Date.parse(isoTimestamp);
  if (Number.isNaN(parsed)) return "Timestamp unavailable";
  return `${istFormatter.format(new Date(parsed))} IST`;
}

export function formatConcentration(value: number): string {
  return value.toFixed(1);
}

export const FRESHNESS_META: Record<
  Freshness,
  {
    label: string;
    tone: "recent" | "delayed" | "stale" | "future";
  }
> = {
  recent: { label: "Recent", tone: "recent" },
  delayed: { label: "Delayed", tone: "delayed" },
  stale: { label: "Outdated", tone: "stale" },
  future: { label: "Future-dated", tone: "future" },
};

export interface DataFreshnessSummary {
  shouldShow: boolean;
  tone: "warning" | "destructive";
  messages: string[];
  excludedItems: string[];
}

export function summarizeDataFreshness(air: AirQuality): DataFreshnessSummary {
  const labeled = [
    ...air.measured.readings.map((r) => ({ reading: r, source: "station" as const })),
    ...air.modeled.readings.map((r) => ({ reading: r, source: "estimate" as const })),
  ];

  if (labeled.length === 0) {
    return {
      shouldShow: true,
      tone: "warning",
      messages: [
        "Current outdoor readings are unavailable right now. Check local public-health advisories before planning outdoor activity.",
      ],
      excludedItems: [],
    };
  }

  const stale = labeled.filter(({ reading }) => reading.freshness === "stale");
  const delayed = labeled.filter(({ reading }) => reading.freshness === "delayed");
  const future = labeled.filter(({ reading }) => reading.freshness === "future");

  if (stale.length === 0 && delayed.length === 0 && future.length === 0) {
    return { shouldShow: false, tone: "warning", messages: [], excludedItems: [] };
  }

  const messages: string[] = [];
  if (stale.length > 0) {
    messages.push("Some readings are outdated. Your recommendations will not rely on these older measurements.");
  }
  if (delayed.length > 0) {
    messages.push("Some readings are several hours old and may not reflect current conditions.");
  }
  if (future.length > 0) {
    messages.push("Some readings carry a future timestamp that cannot be verified and are excluded.");
  }

  const excludedItems = labeled.filter(({ reading }) => !eligibleForGrounding(reading)).map(
    ({ reading, source }) => `${reading.pollutant === "pm25" ? "PM2.5" : "PM10"} (${source})`
  );

  return {
    shouldShow: true,
    tone: future.length > 0 && stale.length === 0 && delayed.length === 0 ? "destructive" : "warning",
    messages,
    excludedItems,
  };
}

export const POLLUTANT_EXPLANATIONS: Record<
  Pollutant,
  {
    shortName: string;
    fullName: string;
    summary: string;
  }
> = {
  pm25: {
    shortName: "PM2.5",
    fullName: "Fine particles (2.5 µm or smaller)",
    summary: "Tiny airborne particles small enough to reach deep into the lungs.",
  },
  pm10: {
    shortName: "PM10",
    fullName: "Inhalable particles (10 µm or smaller)",
    summary: "Coarser dust and smoke particles, including road dust and PM2.5.",
  },
};

export function getDataSourceMessage(kind: "measured" | "modeled", status: DataSource["status"]): string | null {
  switch (status) {
    case "available":
      return null;
    case "no-data":
      return kind === "measured"
        ? "No monitoring stations within 25 km returned usable readings."
        : "No regional estimates were returned for this location.";
    case "unavailable":
      return kind === "measured"
        ? "Nearby monitoring station data is temporarily unavailable."
        : "Regional model estimates are temporarily unavailable.";
    case "unconfigured":
      return "Nearby monitoring station data is not configured on this server.";
    case "partial":
      return "Some nearby station sensors did not respond. Available readings are shown below.";
  }
}

export function findNearestSupportedMetro(latitude: number, longitude: number) {
  let closest: (typeof POPULAR_METROS)[number] = POPULAR_METROS[0];
  let minDistanceKm = Infinity;
  const radians = Math.PI / 180;

  for (const metro of POPULAR_METROS) {
    const meanLatitude = ((metro.lat + latitude) / 2) * radians;
    const distance =
      6371 *
      radians *
      Math.hypot(metro.lat - latitude, (metro.lon - longitude) * Math.cos(meanLatitude));
    if (distance < minDistanceKm) {
      minDistanceKm = distance;
      closest = metro;
    }
  }

  return { metro: closest, distanceKm: minDistanceKm, withinRange: minDistanceKm <= 50 };
}

export const PLAN_BASIS_COPY: Record<Plan["basis"], string> = {
  "recent-station": "Based on recent readings from nearby monitoring stations (OpenAQ).",
  "recent-model":
    "Based on regional air quality estimates (Open-Meteo / CAMS), because recent station readings were unavailable.",
  limited:
    "Recent local air quality data was unavailable, so recommendations focus on general daily preparation.",
};

export const ACTION_BENEFIT_SUMMARY: Record<string, string> = {
  modelBackup: "Keeps optional activity flexible while you verify local conditions.",
  bundleRoutine: "Can avoid a separate motorized trip.",
  deferErrand: "Can reduce outdoor exposure and avoid a separate trip.",
  indoorPlay: "Helps limit strenuous outdoor exertion when outdoor air quality is poor.",
  indoorBreak: "Helps reduce extra time spent outdoors near particle pollution.",
  checkBefore: "Helps you decide whether to shorten or move optional outdoor activity.",
  workBreak: "Helps keep outdoor breaks flexible when conditions worsen.",
  calmRoute: "Helps lower exposure to heavy roadside vehicle exhaust.",
  exhaust: "Helps vent cooking smoke outdoors before it spreads through the house.",
  smoke: "Helps prevent extra smoke particles from building up indoors.",
  filter: "Helps keep an existing air purifier working as intended.",
  playSpace: "Helps keep children's play away from cooking fumes and indoor smoke.",
  sittingRoom: "Helps keep shared living rooms used by older adults free of smoke.",
  combine: "Helps cut down separate motorised trips and fuel use.",
  shared: "Helps lower vehicle emissions compared with solo trips.",
  noIdle: "Helps avoid unnecessary tailpipe exhaust while parked and waiting.",
  maintain: "Helps continue lower-emission travel instead of adding solo car trips.",
  transitErrands: "Helps avoid separate vehicle trips by pairing errands with regular transit.",
  activeErrands: "Helps replace short motorised errands when outdoor conditions allow.",
};

export function getRelevantCircumstances(
  category: "routine" | "indoor" | "travel",
  profile: Profile,
  plan: Plan
): string[] {
  const tags: string[] = [];

  if (category === "routine") {
    if (profile.members.length > 0) {
      tags.push(...profile.members);
    }
    if (profile.commute === "Walking or cycling") {
      tags.push("Walking or cycling");
    }
    tags.push(profile.priority);
    if (plan.basis === "limited") {
      tags.push("Limited recent data");
    }
  } else if (category === "indoor") {
    if (profile.members.includes("Children")) tags.push("Children at home");
    if (profile.members.includes("Older adults")) tags.push("Older adults at home");
    if (tags.length === 0 && profile.members.length > 0) {
      tags.push(...profile.members);
    }
    tags.push("Indoor air care");
  } else {
    tags.push(profile.commute);
    if (profile.priority === "Lower-emission travel" || profile.priority === "Flexible errands") {
      tags.push(profile.priority);
    }
  }

  return tags;
}

export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(typeof data?.error === "string" ? data.error : "The request could not be completed.");
  }
  if (data === null) {
    throw new Error("The server returned an unreadable response. Try again.");
  }
  return data as T;
}
