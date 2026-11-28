import { describe, expect, it } from "vitest";
import { computeAtmosphereState } from "@/lib/atmosphere";
import { CITY_SCENES, REGIONAL_SCENES, resolveCitySkyline } from "@/lib/scenery";
import type { AirQuality, City } from "@/lib/contracts";
import { parseStoredTheme, resolveTheme } from "@/lib/theme";

const makeCity = (id: number, name: string, region: string | null): City => ({
  id,
  name,
  region,
  latitude: 20,
  longitude: 78,
});

const delhi = makeCity(1273294, "Delhi", "National Capital Territory of Delhi");
const hyderabad = makeCity(1269843, "Hyderabad", "Telangana");
const mumbai = makeCity(1275339, "Mumbai", "Maharashtra");
const bengaluru = makeCity(1277333, "Bengaluru", "Karnataka");
const kolkata = makeCity(1275004, "Kolkata", "West Bengal");
const chanderi = makeCity(1274755, "Chanderi", "Madhya Pradesh");
const delhiMp = makeCity(10532476, "Delhi", "Madhya Pradesh");

describe("resolveCitySkyline", () => {
  it("maps each new dedicated city and representative aliases", () => {
    const cities = [
      ["Madras", "Tamil Nadu", "chennai"], ["Vizag", "Andhra Pradesh", "visakhapatnam"],
      ["Poona", "Maharashtra", "pune"], ["Jaipur", "Rajasthan", "jaipur"],
      ["Agra", "Uttar Pradesh", "agra"], ["Ahmadabad", "Gujarat", "ahmedabad"],
      ["Cochin", "Kerala", "kochi"], ["Benares", "Uttar Pradesh", "varanasi"],
    ];
    for (const [name, region, key] of cities) {
      expect(resolveCitySkyline(makeCity(1, name, region))).toBe(key);
    }
    expect(cities).toHaveLength(Object.keys(CITY_SCENES).length);
  });

  it("maps every regional scene and handles provider aliases without guessing ambiguous locations", () => {
    expect(Object.keys(REGIONAL_SCENES)).toHaveLength(36);
    for (const [key, scene] of Object.entries(REGIONAL_SCENES)) {
      expect(resolveCitySkyline(makeCity(1, "Other town", scene.region))).toBe(`region:${key}`);
    }
    expect(resolveCitySkyline(makeCity(1, "Leh", "Ladakh"))).toBe("region:ladakh");
    expect(resolveCitySkyline(makeCity(1, "Port Blair", "Andaman & Nicobar Islands"))).toBe("region:andaman and nicobar islands");
    expect(resolveCitySkyline(makeCity(1, "Bomdila", "Unknown"))).toBe("generic");
    expect(computeAtmosphereState({ city: chanderi, air: null, loading: true }).landmarkLabel)
      .toContain("Madhya Pradesh regional scene");
  });

  it("resolves all five supported metros and falls back to the region when city artwork is unavailable", () => {
    expect(resolveCitySkyline(hyderabad)).toBe("hyderabad");
    expect(resolveCitySkyline(delhi)).toBe("delhi");
    expect(resolveCitySkyline(mumbai)).toBe("mumbai");
    expect(resolveCitySkyline(bengaluru)).toBe("bengaluru");
    expect(resolveCitySkyline(kolkata)).toBe("kolkata");
    expect(resolveCitySkyline(chanderi)).toBe("region:madhya pradesh");
    expect(resolveCitySkyline(delhiMp)).toBe("region:madhya pradesh");
    expect(resolveCitySkyline(null)).toBe("generic");
    expect(resolveCitySkyline(makeCity(3, "Warangal", " Telangana "))).toBe("region:telangana");
    expect(resolveCitySkyline({ ...hyderabad, region: null })).toBe("hyderabad");
    expect(resolveCitySkyline(makeCity(3, "Hyderabad", null))).toBe("generic");
    expect(resolveCitySkyline(makeCity(3, "Hyderabad", "Andhra Pradesh"))).toBe("region:andhra pradesh");
  });
});

describe("computeAtmosphereState", () => {
  it("modulates cloud density, speed, haze, and sky colors continuously with eligible recent readings", () => {
    const lowAir: AirQuality = {
      city: hyderabad,
      measured: {
        status: "available",
        readings: [
          { pollutant: "pm25", value: 18, unit: "µg/m³", timestamp: "2026-11-28T06:00:00Z", freshness: "recent" },
          { pollutant: "pm10", value: 32, unit: "µg/m³", timestamp: "2026-11-28T06:00:00Z", freshness: "recent" },
        ],
      },
      modeled: {
        status: "available",
        readings: [
          { pollutant: "pm25", value: 90, unit: "µg/m³", timestamp: "2026-11-28T06:00:00Z", freshness: "recent" },
        ],
      },
    };
    const highAir: AirQuality = {
      ...lowAir,
      city: delhi,
      measured: {
        status: "available",
        readings: [
          { pollutant: "pm25", value: 165, unit: "µg/m³", timestamp: "2026-11-28T06:00:00Z", freshness: "recent" },
          { pollutant: "pm10", value: 280, unit: "µg/m³", timestamp: "2026-11-28T06:00:00Z", freshness: "recent" },
        ],
      },
    };

    const low = computeAtmosphereState({ city: hyderabad, air: lowAir, loading: false });
    const high = computeAtmosphereState({ city: delhi, air: highAir, loading: false });

    expect(low.basis).toBe("station");
    expect(low.cloudsActive).toBe(true);
    expect(high.basis).toBe("station");
    expect(high.cloudsActive).toBe(true);
    expect(high.intensity).toBeGreaterThan(low.intensity);
    expect(high.intensity).toBeLessThanOrEqual(1);
    expect(high.cloudCount).toBeGreaterThan(low.cloudCount);
    expect(high.cloudSpeed).toBeLessThan(low.cloudSpeed);
    expect(high.hazeOpacity).toBeGreaterThan(low.hazeOpacity);
    expect(high.skylineContrast).toBeLessThan(low.skylineContrast);
    expect(low.cloudColor).not.toBe(high.cloudColor);
    expect(low.disclosure).toBe(
      "Illustrative atmosphere based on available outdoor particle readings. Not a live view."
    );
  });

  it("falls back to recent modeled readings and adapts disclosure when station data is absent or stale", () => {
    const modelOnlyAir: AirQuality = {
      city: chanderi,
      measured: {
        status: "available",
        readings: [
          { pollutant: "pm25", value: 150, unit: "µg/m³", timestamp: "2026-11-20T06:00:00Z", freshness: "stale" },
        ],
      },
      modeled: {
        status: "available",
        readings: [
          { pollutant: "pm25", value: 60, unit: "µg/m³", timestamp: "2026-11-28T06:00:00Z", freshness: "recent" },
        ],
      },
    };

    const state = computeAtmosphereState({ city: chanderi, air: modelOnlyAir, loading: false });
    expect(state.skyline).toBe("region:madhya pradesh");
    expect(state.basis).toBe("model");
    expect(state.cloudsActive).toBe(true);
    expect(state.intensity).toBeGreaterThan(0);
    expect(state.disclosure).toContain("regional model estimates");
  });

  it("uses a neutral static background for delayed, stale, future, or unavailable readings", () => {
    const nonRecentAir: AirQuality = {
      city: mumbai,
      measured: {
        status: "partial",
        readings: [
          { pollutant: "pm25", value: 180, unit: "µg/m³", timestamp: "2026-11-27T06:00:00Z", freshness: "delayed" },
          { pollutant: "pm10", value: 260, unit: "µg/m³", timestamp: "2026-11-22T06:00:00Z", freshness: "stale" },
        ],
      },
      modeled: {
        status: "unavailable",
        readings: [],
      },
    };

    const state = computeAtmosphereState({ city: mumbai, air: nonRecentAir, loading: false });
    expect(state.basis).toBe("unavailable");
    expect(state.cloudsActive).toBe(false);
    expect(state.cloudSpeed).toBe(0);
    expect(state.intensity).toBe(0);
    expect(state.skylineContrast).toBe(1);
    expect(state.disclosure).toContain("held neutral");
  });

  it("never reuses a previous city's visual intensity while loading a new city", () => {
    const previousDelhiAir: AirQuality = {
      city: delhi,
      measured: {
        status: "available",
        readings: [
          { pollutant: "pm25", value: 170, unit: "µg/m³", timestamp: "2026-11-28T06:00:00Z", freshness: "recent" },
        ],
      },
      modeled: { status: "unavailable", readings: [] },
    };

    const loadingState = computeAtmosphereState({
      city: kolkata,
      air: previousDelhiAir,
      loading: true,
    });
    expect(loadingState.skyline).toBe("kolkata");
    expect(loadingState.basis).toBe("loading");
    expect(loadingState.cloudsActive).toBe(false);
    expect(loadingState.cloudSpeed).toBe(0);
    expect(loadingState.intensity).toBe(0);

    const mismatchedState = computeAtmosphereState({
      city: kolkata,
      air: previousDelhiAir,
      loading: false,
    });
    expect(mismatchedState.intensity).toBe(0);
    expect(mismatchedState.cloudsActive).toBe(false);
    expect(mismatchedState.basis).toBe("unavailable");
  });

  it("adapts colors for midnight forest dark mode while preserving speed, count, and static fallback", () => {
    const stationAir: AirQuality = {
      city: delhi,
      measured: {
        status: "available",
        readings: [
          { pollutant: "pm25", value: 140, unit: "µg/m³", timestamp: "2026-11-28T06:00:00Z", freshness: "recent" },
        ],
      },
      modeled: { status: "unavailable", readings: [] },
    };
    const modelAir: AirQuality = {
      city: chanderi,
      measured: { status: "no-data", readings: [] },
      modeled: {
        status: "available",
        readings: [
          { pollutant: "pm25", value: 45, unit: "µg/m³", timestamp: "2026-11-28T06:00:00Z", freshness: "recent" },
        ],
      },
    };

    const lightStation = computeAtmosphereState({ city: delhi, air: stationAir, loading: false, theme: "light" });
    const darkStation = computeAtmosphereState({ city: delhi, air: stationAir, loading: false, theme: "dark" });
    const darkModel = computeAtmosphereState({ city: chanderi, air: modelAir, loading: false, theme: "dark" });
    const darkNeutral = computeAtmosphereState({ city: mumbai, air: null, loading: false, theme: "dark" });

    expect(darkStation.cloudsActive).toBe(true);
    expect(darkStation.cloudCount).toBe(lightStation.cloudCount);
    expect(darkStation.cloudSpeed).toBe(lightStation.cloudSpeed);
    expect(darkStation.skyTop).not.toBe(lightStation.skyTop);
    expect(darkStation.skylineCutoutColor).not.toBe("#FFFFFF");
    expect(darkModel.basis).toBe("model");
    expect(darkModel.skyTop).not.toBe(darkStation.skyTop);
    expect(darkNeutral.cloudsActive).toBe(false);
    expect(darkNeutral.pageWash).toBe("#101318");
    expect(darkNeutral.cloudSpeed).toBe(0);
  });
});

describe("theme resolution helpers", () => {
  it("defaults to light and resolves light, dark, and system preferences", () => {
    expect(parseStoredTheme(null)).toBe("light");
    expect(parseStoredTheme("unknown")).toBe("light");
    expect(parseStoredTheme("dark")).toBe("dark");
    expect(parseStoredTheme("system")).toBe("system");
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("system", true)).toBe("dark");
  });
});
