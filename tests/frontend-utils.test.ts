import { describe, expect, it } from "vitest";
import {
  ACTION_BENEFIT_SUMMARY,
  findNearestSupportedMetro,
  formatConcentration,
  formatIstTimestamp,
  FRESHNESS_META,
  getDataSourceMessage,
  getRelevantCircumstances,
  PLAN_BASIS_COPY,
  summarizeDataFreshness,
} from "@/lib/air-quality-utils";
import type { AirQuality, Plan, Profile } from "@/lib/contracts";

const baseCity = {
  id: 1273294,
  name: "Delhi",
  region: "National Capital Territory of Delhi",
  latitude: 28.65,
  longitude: 77.23,
};

describe("air-quality presentation helpers", () => {
  it("formats concentrations consistently and renders IST timestamps", () => {
    expect(formatConcentration(149.8)).toBe("149.8");
    expect(formatConcentration(262)).toBe("262.0");
    expect(formatConcentration(0)).toBe("0.0");

    const formatted = formatIstTimestamp("2026-11-28T06:30:00.000Z");
    expect(formatted).toContain("IST");
    expect(formatIstTimestamp("invalid-date")).toBe("Timestamp unavailable");
  });

  it("distinguishes freshness tiers and provider error states clearly", () => {
    expect(FRESHNESS_META.recent.tone).toBe("recent");
    expect(FRESHNESS_META.delayed.tone).toBe("delayed");
    expect(FRESHNESS_META.stale.tone).toBe("stale");
    expect(FRESHNESS_META.future.tone).toBe("future");

    expect(getDataSourceMessage("measured", "available")).toBeNull();
    expect(getDataSourceMessage("measured", "no-data")).toContain("25 km");
    expect(getDataSourceMessage("measured", "unavailable")).toContain("temporarily unavailable");
    expect(getDataSourceMessage("modeled", "unavailable")).toContain("temporarily unavailable");
    expect(getDataSourceMessage("measured", "partial")).toContain("Available readings");
  });

  it("suppresses freshness warnings when all data is recent and summarizes stale/delayed/mixed states", () => {
    const recentAir: AirQuality = {
      city: baseCity,
      measured: {
        status: "available",
        readings: [
          { pollutant: "pm25", value: 45, unit: "µg/m³", timestamp: "2026-11-28T10:00:00Z", freshness: "recent" },
        ],
      },
      modeled: {
        status: "available",
        readings: [
          { pollutant: "pm25", value: 40, unit: "µg/m³", timestamp: "2026-11-28T10:00:00Z", freshness: "recent" },
        ],
      },
    };
    expect(summarizeDataFreshness(recentAir).shouldShow).toBe(false);

    const mixedAir: AirQuality = {
      city: baseCity,
      measured: {
        status: "partial",
        readings: [
          { pollutant: "pm25", value: 103, unit: "µg/m³", timestamp: "2026-11-28T04:00:00Z", freshness: "delayed" },
          { pollutant: "pm10", value: 210.9, unit: "µg/m³", timestamp: "2026-11-26T04:00:00Z", freshness: "stale" },
        ],
      },
      modeled: {
        status: "available",
        readings: [
          { pollutant: "pm25", value: 96.9, unit: "µg/m³", timestamp: "2026-11-28T10:00:00Z", freshness: "recent" },
        ],
      },
    };
    const mixedSummary = summarizeDataFreshness(mixedAir);
    expect(mixedSummary.shouldShow).toBe(true);
    expect(mixedSummary.messages).toContain(
      "Some readings are outdated. Your recommendations will not rely on these older measurements."
    );
    expect(mixedSummary.messages).toContain(
      "Some readings are several hours old and may not reflect current conditions."
    );
    expect(mixedSummary.excludedItems).toEqual(["PM2.5 (station)", "PM10 (station)"]);

    const unavailableAir: AirQuality = {
      city: baseCity,
      measured: { status: "unavailable", readings: [] },
      modeled: { status: "unavailable", readings: [] },
    };
    const unavailableSummary = summarizeDataFreshness(unavailableAir);
    expect(unavailableSummary.shouldShow).toBe(true);
    expect(unavailableSummary.messages[0]).toContain("unavailable right now");
  });

  it("resolves nearest supported metro only within 50 km", () => {
    const nearDelhi = findNearestSupportedMetro(28.61, 77.21);
    expect(nearDelhi.metro.name).toBe("Delhi");
    expect(nearDelhi.withinRange).toBe(true);

    const chanderi = findNearestSupportedMetro(24.715, 78.138);
    expect(chanderi.withinRange).toBe(false);
  });

  it("derives household circumstance tags and covers all action benefits", () => {
    const childProfile: Profile = {
      members: ["Children"],
      commute: "Car or two-wheeler",
      priority: "Flexible errands",
    };
    const commuterProfile: Profile = {
      members: ["Working adults"],
      commute: "Public transport",
      priority: "Lower-emission travel",
    };
    const plan: Plan = {
      source: "gemini",
      basis: "recent-station",
      actions: {
        routine: { id: "indoorPlay", title: "T", why: "W" },
        indoor: { id: "playSpace", title: "T", why: "W" },
        travel: { id: "combine", title: "T", why: "W" },
      },
    };

    expect(getRelevantCircumstances("indoor", childProfile, plan)).toContain("Children at home");
    expect(getRelevantCircumstances("travel", commuterProfile, plan)).toContain("Public transport");
    expect(PLAN_BASIS_COPY["recent-station"]).toContain("OpenAQ");
    expect(PLAN_BASIS_COPY["recent-model"]).toContain("CAMS");
    expect(ACTION_BENEFIT_SUMMARY.playSpace).toBeTruthy();
    expect(ACTION_BENEFIT_SUMMARY.transitErrands).toBeTruthy();
  });
});
