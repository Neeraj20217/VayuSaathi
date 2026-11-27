import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { generateContent } = vi.hoisted(() => ({ generateContent: vi.fn() }));
vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent };
  },
}));

import { generatePlan, parsePlan, recommendationContext } from "@/lib/server/recommendations";
import { requestSchema, type AirQuality, type Profile } from "@/lib/contracts";

const air: AirQuality = {
  city: { id: 1, name: "Delhi", region: "Delhi", latitude: 28.65, longitude: 77.22 },
  measured: { status: "no-data", readings: [] },
  modeled: { status: "available", readings: [{
    pollutant: "pm25", value: 20, unit: "µg/m³", timestamp: "2026-11-22T11:00:00Z", freshness: "recent",
  }] },
};
const profile: Profile = { members: ["Children"], commute: "No regular commute", priority: "Outdoor activity" };
const selection = { routine: "indoorPlay", indoor: "smoke", travel: "combine" };

describe("grounded plan", () => {
  it("keeps recent model context separate and returns vetted explanations", () => {
    const context = recommendationContext(air, profile);
    expect(context.observed).toEqual([]);
    expect(context.modeled[0].source).toBe("Open-Meteo / CAMS");
    expect(parsePlan(JSON.stringify(selection), context)).toMatchObject({
      basis: "recent-model", actions: { routine: { id: "indoorPlay" }, indoor: { id: "smoke" } },
    });
  });

  it.each(["delayed", "stale", "future"] as const)("omits %s readings from both sources", (freshness) => {
    const readings = [{ ...air.modeled.readings[0], freshness }];
    const source = { status: "available" as const, readings };
    expect(recommendationContext({ ...air, measured: source, modeled: source }, profile))
      .toMatchObject({ basis: "limited", observed: [], modeled: [] });
  });

  it("rejects fabricated reading fields and profile-incompatible choices", () => {
    const context = recommendationContext(air, profile);
    expect(() => parsePlan(JSON.stringify({ ...selection, aqi: 180 }), context)).toThrow();
    expect(() => parsePlan(JSON.stringify({ ...selection, travel: "noIdle" }), context)).toThrow();
    expect(() => parsePlan("invalid JSON", context)).toThrow();
  });

  it("limits outdoor guidance without recent evidence and changes options for commuters", () => {
    const context = recommendationContext({ ...air, modeled: { status: "unavailable", readings: [] } },
      { members: ["Working adults"], commute: "Car or two-wheeler", priority: "Lower-emission travel" });
    expect(context.basis).toBe("limited");
    expect(context.choices.routine.map((option) => option.id)).toEqual(["checkBefore"]);
    expect(context.choices.travel.map((option) => option.id)).toContain("shared");
  });

  it("rejects unexpected profile data and invalid member selections", () => {
    expect(requestSchema.safeParse({ cityId: 1, profile: { ...profile, name: "Hidden name" } }).success).toBe(false);
    expect(requestSchema.safeParse({ cityId: 1, profile: { ...profile, members: [] } }).success).toBe(false);
  });
});


describe("profile-specific choices", () => {
  const working: Profile = { members: ["Working adults"], commute: "Car or two-wheeler", priority: "Lower-emission travel" };

  it("offers relevant indoor options without requiring different advice for every household", () => {
    const childContext = recommendationContext(air, profile);
    const workContext = recommendationContext(air, working);
    expect(childContext.choices.indoor.map(({ id }) => id)).toContain("playSpace");
    expect(workContext.choices.indoor.map(({ id }) => id)).not.toContain("playSpace");
    expect(parsePlan(JSON.stringify(selection), childContext).actions.indoor.id).toBe("smoke");
    expect(parsePlan(JSON.stringify({ routine: "checkBefore", indoor: "smoke", travel: "shared" }), workContext).actions.indoor.id).toBe("smoke");
    expect(() => parsePlan(JSON.stringify({ routine: "checkBefore", indoor: "playSpace", travel: "shared" }), workContext)).toThrow();
  });

  it.each([
    ["No regular commute", ["combine"]],
    ["Car or two-wheeler", ["shared", "noIdle", "combine"]],
    ["Shared ride", ["maintain", "combine"]],
    ["Public transport", ["transitErrands", "maintain", "combine"]],
    ["Walking or cycling", ["activeErrands", "combine"]],
  ] as const)("uses eligible travel choices for %s", (commute, ids) => {
    const context = recommendationContext(air, { ...working, commute });
    expect(context.choices.travel.map(({ id }) => id)).toEqual(ids);
  });

  it("sends Gemini meaningful candidate text and validates its selected IDs", async () => {
    generateContent.mockResolvedValueOnce({ text: JSON.stringify({ ...selection, indoor: "playSpace" }) });
    const plan = await generatePlan(air, profile, "test-key");
    const request = generateContent.mock.calls.at(-1)?.[0];
    expect(JSON.parse(request.contents)).toMatchObject({
      profile,
      choices: { indoor: expect.arrayContaining([{ id: "playSpace", title: expect.any(String), why: expect.any(String) }]) },
    });
    expect(request.config.responseJsonSchema.properties.travel.enum).toEqual(["combine"]);
    expect(plan.source).toBe("gemini");
    expect(plan.actions.indoor.id).toBe("playSpace");

    generateContent.mockResolvedValueOnce({ text: JSON.stringify({ routine: "checkBefore", indoor: "playSpace", travel: "shared" }) });
    await expect(generatePlan(air, working, "test-key")).rejects.toThrow("outside the allowed profile choices");
  });
});
