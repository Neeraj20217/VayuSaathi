import { z } from "zod";

export type Pollutant = "pm25" | "pm10";
export const pollutants: Pollutant[] = ["pm25", "pm10"];
export const pollutantNames = { pm25: "PM2.5", pm10: "PM10" };
export type Freshness = "recent" | "delayed" | "stale" | "future";

export interface City {
  id: number;
  name: string;
  region: string | null;
  locality?: string;
  latitude: number;
  longitude: number;
}

export interface Reading {
  pollutant: Pollutant;
  value: number;
  unit: "µg/m³";
  timestamp: string;
  freshness: Freshness;
  station?: { id: number; name: string; provider: string; distanceKm: number };
}

export interface DataSource {
  status: "available" | "no-data" | "unavailable" | "unconfigured" | "partial";
  readings: Reading[];
}

export interface AirQuality {
  city: City;
  measured: DataSource;
  modeled: DataSource;
}

export const cityIdSchema = z.number().int().positive().max(2_147_483_647);
export const querySchema = z.string().trim().min(2).max(80);
export const members = ["Children", "Older adults", "Students", "Working adults"] as const;
export const commutes = ["No regular commute", "Car or two-wheeler", "Shared ride", "Public transport", "Walking or cycling"] as const;
export const priorities = ["Flexible errands", "Outdoor activity", "Indoor air", "Lower-emission travel"] as const;

export const profileSchema = z.strictObject({
  members: z.array(z.enum(members)).min(1).max(members.length)
    .refine((value) => new Set(value).size === value.length),
  commute: z.enum(commutes),
  priority: z.enum(priorities),
});
export type Profile = z.infer<typeof profileSchema>;
export const requestSchema = z.strictObject({ cityId: cityIdSchema, profile: profileSchema });

export interface Action {
  id: string;
  title: string;
  why: string;
}

export interface Plan {
  source: "gemini" | "fallback";
  actions: { routine: Action; indoor: Action; travel: Action };
  basis: "recent-station" | "recent-model" | "limited";
}

