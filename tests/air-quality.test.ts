import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { freshness, getAirQuality, parseModelReadings, parseStationReadings } from "@/lib/server/air-quality";

const now = Date.parse("2026-11-22T12:00:00Z");
const hour = 3_600_000;
const city = { id: 1273294, name: "Delhi", region: "Delhi", latitude: 28.65, longitude: 77.22 };
const station = {
  id: 81, name: "Test station", provider: { name: "Test network" },
  country: { code: "IN" as const }, isMobile: false as const, coordinates: city,
  sensors: [
    { id: 1, parameter: { name: "pm25", units: "µg/m³" } },
    { id: 2, parameter: { name: "pm10", units: "ppm" } },
  ],
};
const timestamp = (age: number) => new Date(now - age).toISOString();
const observation = (value: unknown, overrides: object = {}) => ({
  value, sensorsId: 1, locationsId: station.id, datetime: { utc: timestamp(hour) }, ...overrides,
});
const model = (pm2_5: unknown, pm10?: unknown, time = (now - hour) / 1000) => ({
  current: { time, pm2_5, pm10 },
  current_units: { time: "unixtime", pm2_5: "μg/m³", pm10: "µg/m³" },
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("freshness", () => {
  it.each([
    [-hour, "future"],
    [-1, "future"],
    [0, "recent"],
    [3 * hour, "recent"],
    [3 * hour + 1, "delayed"],
    [24 * hour, "delayed"],
    [24 * hour + 1, "stale"],
  ] as const)("labels age %s as %s", (age, state) => {
    expect(freshness(timestamp(age), now)).toBe(state);
  });
});

describe("provider parsing", () => {
  it("retains genuine zero readings and station provenance while skipping invalid records", () => {
    const results = [
      observation(0), observation(-4), observation(null), observation("25"),
      observation(25, { sensorsId: 2 }), observation(25, { locationsId: 82 }),
      observation(25, { datetime: { utc: timestamp(-1) } }),
      observation(25, { datetime: { utc: "yesterday" } }),
    ];
    expect(parseStationReadings({ results }, station, 2.2, now)).toEqual([{
      pollutant: "pm25", value: 0, unit: "µg/m³", timestamp: timestamp(hour), freshness: "recent",
      station: { id: 81, name: "Test station", provider: "Test network", distanceKm: 2.2 },
    }]);
  });

  it("omits missing modeled values and keeps model output free of station metadata", () => {
    const [reading] = parseModelReadings(model(0), now);
    expect(reading).toEqual({ pollutant: "pm25", value: 0, unit: "µg/m³", timestamp: timestamp(hour), freshness: "recent" });
    expect(parseModelReadings(model(null, null), now)).toEqual([]);
  });

  it("rejects an invalid model payload and omits future model times", () => {
    expect(() => parseModelReadings({ current: {} }, now)).toThrow();
    expect(parseModelReadings(model(30, 46, (now + 1000) / 1000), now)).toEqual([]);
  });
});

describe("bounded station selection", () => {
  it.each([
    { recentAt: 4, requests: 6, selected: 4 },
    { recentAt: 1, requests: 3, selected: 1 },
    { recentAt: 7, requests: 6, selected: 6 },
  ])("limits requests and selects pollutant observations when recentAt=$recentAt", async ({
    recentAt, requests, selected,
  }) => {
    vi.stubEnv("OPENAQ_API_KEY", "fixture");
    const stations = Array.from({ length: 7 }, (_, i) => ({
      ...station, id: i + 1, datetimeLast: { utc: timestamp(0) },
      coordinates: { ...city, latitude: city.latitude + i / 100 },
    }));
    const queried: number[] = [];
    vi.stubGlobal("fetch", async (url: URL) => {
      if (url.hostname !== "api.openaq.org") return Response.json(model(15, 28));
      if (url.pathname === "/v3/locations") return Response.json({ results: stations });
      const id = Number(url.pathname.split("/")[3]);
      queried.push(id);
      const age = id === recentAt ? hour : (40 - id) * hour;
      return Response.json({ results: [observation(20, { locationsId: id, datetime: { utc: timestamp(age) } })] });
    });
    const air = await getAirQuality(city, now);
    expect(queried).toEqual(stations.slice(0, requests).map((s) => s.id));
    expect(air.measured.readings[0].station?.id).toBe(selected);
  });
});

describe("air-quality integration failures", () => {
  it("keeps genuine model results separate when OpenAQ rejects the key", async () => {
    vi.stubEnv("OPENAQ_API_KEY", "test-key");
    const fetcher = vi.fn(async (url: URL) => url.hostname === "api.openaq.org"
      ? new Response(null, { status: 401 }) : Response.json(model(18, 30)));
    vi.stubGlobal("fetch", fetcher);
    const air = await getAirQuality(city, now);
    expect(air.measured).toEqual({ status: "unavailable", readings: [] });
    expect(air.modeled.readings).toHaveLength(2);
    expect(fetcher).toHaveBeenCalledWith(expect.objectContaining({ hostname: "api.openaq.org" }),
      expect.objectContaining({ headers: { "X-API-Key": "test-key" } }));
  });

  it("does not query OpenAQ without a key or insert data when Open-Meteo times out", async () => {
    vi.stubEnv("OPENAQ_API_KEY", "");
    const fetcher = vi.fn().mockRejectedValue(new DOMException("Timed out", "TimeoutError"));
    vi.stubGlobal("fetch", fetcher);
    expect(await getAirQuality(city, now)).toMatchObject({
      measured: { status: "unconfigured", readings: [] },
      modeled: { status: "unavailable", readings: [] },
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("retains readings from working stations when another station fails", async () => {
    vi.stubEnv("OPENAQ_API_KEY", "test-key");
    const second = { ...station, id: 82 };
    vi.stubGlobal("fetch", vi.fn(async (url: URL) => {
      if (url.hostname !== "api.openaq.org") return Response.json(model(18, 30));
      if (url.pathname === "/v3/locations") return Response.json({ results: [station, second] });
      if (url.pathname.includes("/81/")) return Response.json({ results: [observation(22)] });
      return new Response(null, { status: 429 });
    }));
    const result = await getAirQuality(city, now);
    expect(result.measured).toMatchObject({ status: "partial", readings: [{ value: 22 }] });
  });

  it("marks measured as no-data when no station locations exist within 25 km while preserving modeled readings", async () => {
    vi.stubEnv("OPENAQ_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn(async (url: URL) => {
      if (url.hostname !== "api.openaq.org") return Response.json(model(15, 28));
      return Response.json({ results: [] });
    }));
    const result = await getAirQuality(city, now);
    expect(result.measured).toEqual({ status: "no-data", readings: [] });
    expect(result.modeled.status).toBe("available");
    expect(result.modeled.readings).toHaveLength(2);
  });

  it("handles model response when one pollutant is missing or null without crashing", () => {
    const singlePollutant = model(35, null);
    const parsed = parseModelReadings(singlePollutant, now);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toMatchObject({ pollutant: "pm25", value: 35 });
  });
});

