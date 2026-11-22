import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { resolveCity, searchCities } from "@/lib/server/geocoding";

const place = (id: number, name: string, extra: object = {}) => ({
  id, name, country_code: "IN", feature_code: "PPL", admin1: "Madhya Pradesh",
  latitude: 24.63427, longitude: 81.58003, ...extra,
});

afterEach(() => vi.unstubAllGlobals());

describe("Indian city search", () => {
  it("ranks the major exact match first, merges close duplicates and labels distinct namesakes", async () => {
    const capital = place(1273294, "Delhi", { admin1: "National Capital Territory of Delhi", population: 11034555 });
    const mangawan = place(10532476, "Delhi", { admin2: "Rewa", admin3: "Mangawan", admin3_id: 12686044 });
    const sirmour = place(10531612, "Delhi", {
      admin2: "Rewa", admin3: "Sirmour", admin3_id: 12686045, latitude: 24.73392, longitude: 81.32847,
    });
    const nearDuplicate = { ...mangawan, id: 10532517, latitude: 24.6444, longitude: 81.57507 };
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ results: [
      mangawan, nearDuplicate, sirmour, capital, capital,
      place(50, "Delhi Cantonment", { population: 110351 }),
    ] })));

    expect(await searchCities("Delhi")).toMatchObject([
      { id: capital.id, region: "National Capital Territory of Delhi" },
      { id: mangawan.id, region: "Madhya Pradesh", locality: "Mangawan, Rewa" },
      { id: sirmour.id, region: "Madhya Pradesh", locality: "Sirmour, Rewa" },
      { id: 50, name: "Delhi Cantonment" },
    ]);
  });

  it("preserves small settlements, qualified searches and distinct towns with no population field", async () => {
    const provider = vi.fn(async (url: URL) => {
      expect(url.searchParams.get("name")).toBe("Chanderi, Madhya Pradesh");
      expect(url.searchParams.get("countryCode")).toBe("IN");
      return Response.json({ results: [
        place(31, "Chanderi", { admin3: "Khargapur", longitude: 79.26, population: null }),
        place(32, "Chanderi", { admin3: "Chanderi", population: 33081 }),
        place(33, "Chanderi", { feature_code: "MT" }),
        place(34, "Chanderi", { country_code: "NP" }),
        { name: "Malformed result" },
      ] });
    });
    vi.stubGlobal("fetch", provider);

    expect(await searchCities("Chanderi, Madhya Pradesh")).toMatchObject([
      { id: 32, name: "Chanderi", locality: "Chanderi" },
      { id: 31, name: "Chanderi", locality: "Khargapur" },
    ]);
  });

  it("preserves the provider ID and coordinates for the air-quality lookup", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: URL) => {
      expect(url.searchParams.get("id")).toBe("32");
      return Response.json(place(32, "Chanderi"));
    }));
    expect(await resolveCity(32)).toEqual({
      id: 32, name: "Chanderi", region: "Madhya Pradesh", latitude: 24.63427, longitude: 81.58003,
    });
  });
});

