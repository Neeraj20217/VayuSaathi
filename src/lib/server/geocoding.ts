import "server-only";
import { z } from "zod";
import { cityIdSchema, type City } from "@/lib/contracts";
import { getJson, ProviderError } from "./http";

const base = "https://geocoding-api.open-meteo.com/v1/";
const location = z.object({
  id: cityIdSchema,
  name: z.string().min(1),
  admin1: z.string().nullish(),
  admin2: z.string().nullish(),
  admin3: z.string().nullish(),
  admin3_id: z.number().int().nonnegative().nullish(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  country_code: z.string(),
  feature_code: z.string().optional(),
  population: z.number().nonnegative().nullish(),
});

type Location = z.infer<typeof location>;

const normalize = (value: string) => value.normalize("NFKD").replace(/\p{M}/gu, "").trim().replace(/\s+/g, " ").toLowerCase();

function cityFrom(result: Location): City {
  const { id, name, admin1, latitude, longitude } = result;
  return { id, name, region: admin1 ?? null, latitude, longitude };
}

function labelKey(place: Location) {
  return normalize(place.name) + "|" + normalize(place.admin1 ?? "");
}

function separationKm(a: Location, b: Location) {
  const radians = Math.PI / 180;
  const averageLatitude = (a.latitude + b.latitude) / 2 * radians;
  return 6371 * radians * Math.hypot(a.latitude - b.latitude, (a.longitude - b.longitude) * Math.cos(averageLatitude));
}

function isDuplicate(a: Location, b: Location) {
  if (a.id === b.id) return true;
  if (labelKey(a) !== labelKey(b)) return false;
  const distance = separationKm(a, b);
  return distance <= 0.1 || (Boolean(a.admin3_id) && a.admin3_id === b.admin3_id && distance <= 2);
}

export async function searchCities(query: string): Promise<City[]> {
  const url = new URL("search", base);
  url.search = new URLSearchParams({ name: query, count: "30", language: "en", countryCode: "IN" }).toString();
  const { results } = z.object({ results: z.array(z.unknown()).default([]) }).parse(await getJson(url));
  const term = normalize(query.split(",")[0]);
  const exact = (place: Location) => Number(normalize(place.name) === term);
  const candidates = results.flatMap((row) => {
    const parsed = location.safeParse(row);
    if (!parsed.success) return [];
    const place = parsed.data;
    if (place.country_code !== "IN" || (place.feature_code && !place.feature_code.startsWith("PPL"))) return [];
    return [place];
  }).sort((a, b) => exact(b) - exact(a) || (b.population ?? 0) - (a.population ?? 0));

  const distinct: Location[] = [];
  for (const place of candidates) {
    if (!distinct.some((kept) => isDuplicate(place, kept))) distinct.push(place);
  }

  return distinct.slice(0, 10).map((place) => {
    const city = cityFrom(place);
    if (!distinct.some((other) => other.id !== place.id && labelKey(other) === labelKey(place))) return city;
    const locality = [...new Set([place.admin3, place.admin2].filter((name): name is string => Boolean(name)))].join(", ");
    return locality ? { ...city, locality } : city;
  });
}

export async function resolveCity(id: number): Promise<City | null> {
  const url = new URL("get", base);
  url.searchParams.set("id", String(id));
  try {
    const data = location.parse(await getJson(url));
    if (data.country_code !== "IN" || data.id !== id) return null;
    return cityFrom(data);
  } catch (error) {
    if (error instanceof ProviderError && (error.status === 400 || error.status === 404)) return null;
    throw error;
  }
}

