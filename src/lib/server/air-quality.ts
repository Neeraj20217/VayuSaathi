import "server-only";
import { z } from "zod";
import { pollutants, type City, type AirQuality, type DataSource, type Freshness, type Pollutant, type Reading } from "@/lib/contracts";
import { getJson, ProviderError } from "./http";

const hour = 3_600_000;
const isoUtc = z.iso.datetime({ offset: true });
const massUnit = z.string().regex(/^(?:[µμu]g\/(?:m³|m3))$/);
const massValue = z.number().nonnegative();
const coordinates = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
const stationSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  provider: z.object({ name: z.string().min(1) }),
  country: z.object({ code: z.literal("IN") }),
  isMobile: z.literal(false),
  coordinates,
  datetimeLast: z.object({ utc: isoUtc }).nullish(),
  sensors: z.array(z.object({
    id: z.number().int().positive(),
    parameter: z.object({ name: z.string(), units: z.string() }),
  })),
});
const latestRecord = z.object({
  sensorsId: z.number().int().positive(),
  locationsId: z.number().int().positive(),
  value: massValue,
  datetime: z.object({ utc: isoUtc }),
});
type Station = z.infer<typeof stationSchema>;

export function freshness(timestamp: string, now: number): Freshness {
  const age = now - Date.parse(timestamp);
  if (age < 0) return "future";
  if (age <= 3 * hour) return "recent";
  if (age <= 24 * hour) return "delayed";
  return "stale";
}

function distanceKm(a: City, b: z.infer<typeof coordinates>) {
  const radians = Math.PI / 180;
  const lat = Math.sin((b.latitude - a.latitude) * radians / 2);
  const lon = Math.sin((b.longitude - a.longitude) * radians / 2);
  const h = lat ** 2 + Math.cos(a.latitude * radians) * Math.cos(b.latitude * radians) * lon ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, h)));
}

export function parseStationReadings(payload: unknown, station: Station, distance: number, now: number): Reading[] {
  const { results } = z.object({ results: z.array(z.unknown()) }).parse(payload);
  const readings: Reading[] = [];
  for (const row of results) {
    const parsed = latestRecord.safeParse(row);
    if (!parsed.success || parsed.data.locationsId !== station.id) continue;
    const { sensorsId, value, datetime } = parsed.data;
    const parameter = station.sensors.find((sensor) => sensor.id === sensorsId)?.parameter;
    const pollutant = pollutants.find((item) => item === parameter?.name);
    if (!pollutant || !massUnit.safeParse(parameter?.units).success) continue;
    const state = freshness(datetime.utc, now);
    if (state === "future") continue;
    readings.push({
      pollutant, value, unit: "µg/m³", timestamp: datetime.utc, freshness: state,
      station: { id: station.id, name: station.name, provider: station.provider.name, distanceKm: distance },
    });
  }
  return readings;
}

const modelSchema = z.object({
  current: z.object({ time: z.number().int().min(0).max(4_102_444_800), pm2_5: z.unknown(), pm10: z.unknown() }),
  current_units: z.object({ time: z.literal("unixtime"), pm2_5: z.unknown(), pm10: z.unknown() }),
});
const modelFields = { pm25: "pm2_5", pm10: "pm10" } as const;

export function parseModelReadings(payload: unknown, now: number): Reading[] {
  const data = modelSchema.parse(payload);
  const timestamp = new Date(data.current.time * 1000).toISOString();
  const state = freshness(timestamp, now);
  if (state === "future") return [];
  return pollutants.flatMap((pollutant) => {
    const field = modelFields[pollutant];
    const value = massValue.safeParse(data.current[field]);
    if (!value.success || !massUnit.safeParse(data.current_units[field]).success) return [];
    return [{ pollutant, value: value.data, unit: "µg/m³", timestamp, freshness: state }];
  });
}

const source = (status: DataSource["status"], readings: Reading[] = []): DataSource => ({ status, readings });
const rank: Record<Freshness, number> = { recent: 0, delayed: 1, stale: 2, future: 3 };

function preferredReadings(readings: Reading[]) {
  return pollutants.flatMap((pollutant) => {
    const match = readings.filter((r) => r.pollutant === pollutant).sort((a, b) =>
      rank[a.freshness] - rank[b.freshness] ||
      (a.freshness !== "recent" ? Date.parse(b.timestamp) - Date.parse(a.timestamp) : 0) ||
      (a.station?.distanceKm ?? 0) - (b.station?.distanceKm ?? 0) ||
      Date.parse(b.timestamp) - Date.parse(a.timestamp)
    )[0];
    return match ? [match] : [];
  });
}

function hasParticleSensor(station: Station, pollutant: Pollutant) {
  return station.sensors.some(({ parameter }) => parameter.name === pollutant && massUnit.safeParse(parameter.units).success);
}

async function measured(city: City, now: number): Promise<DataSource> {
  const key = process.env.OPENAQ_API_KEY?.trim();
  if (!key) return source("unconfigured");
  const headers = { "X-API-Key": key };
  const url = new URL("https://api.openaq.org/v3/locations");
  url.search = new URLSearchParams({
    coordinates: city.latitude.toFixed(4) + "," + city.longitude.toFixed(4),
    radius: "25000", iso: "IN", mobile: "false", limit: "100",
  }).toString();
  const { results } = z.object({ results: z.array(z.unknown()) }).parse(await getJson(url, headers));
  const nearby = results.flatMap((row) => {
    const parsed = stationSchema.safeParse(row);
    if (!parsed.success) return [];
    const distance = distanceKm(city, parsed.data.coordinates);
    return distance <= 25 ? [{ station: parsed.data, distance }] : [];
  }).sort((a, b) => {
    const grade = (station: Station) => rank[station.datetimeLast ? freshness(station.datetimeLast.utc, now) : "stale"];
    return grade(a.station) - grade(b.station) || a.distance - b.distance;
  });

  // Two batches share the original ceiling of six distinct station requests.
  const checked = new Set<number>();
  const checks: PromiseSettledResult<Reading[]>[] = [];
  let readings: Reading[] = [];
  let needed = pollutants;
  for (let batch = 0; batch < 2 && needed.length && checked.size < 6; batch++) {
    const queues = needed.map((pollutant) => nearby.filter(({ station }) =>
      !checked.has(station.id) && hasParticleSensor(station, pollutant)).slice(0, 3));
    const candidates: typeof nearby = [];
    for (let i = 0; i < 3; i++) {
      for (const queue of queues) {
        const item = queue[i];
        if (item && !checked.has(item.station.id) && checked.size < 6) {
          checked.add(item.station.id);
          candidates.push(item);
        }
      }
    }
    if (!candidates.length) break;
    checks.push(...await Promise.allSettled(candidates.map(async ({ station, distance }) => {
      const payload = await getJson(new URL("/v3/locations/" + station.id + "/latest", url), headers);
      return parseStationReadings(payload, station, distance, now);
    })));
    readings = preferredReadings(checks.flatMap((item) => item.status === "fulfilled" ? item.value : []));
    if (checks.some((item) => item.status === "rejected" &&
      item.reason instanceof ProviderError && [401, 403, 429].includes(item.reason.status))) break;
    needed = pollutants.filter((p) => !readings.some((r) => r.pollutant === p && r.freshness === "recent"));
  }
  if (checks.some((item) => item.status === "rejected")) return source(readings.length ? "partial" : "unavailable", readings);
  return source(readings.length ? "available" : "no-data", readings);
}

async function modeled(city: City, now: number): Promise<DataSource> {
  const url = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
  url.search = new URLSearchParams({
    latitude: String(city.latitude), longitude: String(city.longitude),
    current: "pm2_5,pm10", timeformat: "unixtime",
  }).toString();
  const readings = parseModelReadings(await getJson(url), now);
  return source(readings.length ? "available" : "no-data", readings);
}

export async function getAirQuality(city: City, now = Date.now()): Promise<AirQuality> {
  const [station, model] = await Promise.allSettled([measured(city, now), modeled(city, now)]);
  return {
    city,
    measured: station.status === "fulfilled" ? station.value : source("unavailable"),
    modeled: model.status === "fulfilled" ? model.value : source("unavailable"),
  };
}

