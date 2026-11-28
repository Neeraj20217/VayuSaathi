import type { AirQuality, City, Reading } from "@/lib/contracts";
import type { ResolvedTheme } from "@/lib/theme";

import { getAddedCityScene, getRegionalScene, resolveCitySkyline, type SkylineKey } from "@/lib/scenery";

export type AtmosphereBasis = "station" | "model" | "unavailable" | "loading";

export interface AtmosphereState {
  skyline: SkylineKey;
  landmarkLabel: string;
  basis: AtmosphereBasis;
  /** Bounded [0, 1] visual intensity derived solely from eligible recent readings. */
  intensity: number;
  /** Whether the cloud layers are visible (false for neutral/unavailable/loading). */
  cloudsActive: boolean;
  skyTop: string;
  skyBottom: string;
  cloudColor: string;
  cloudCount: number;
  cloudSpeed: number;
  pageWash: string;
  hazeColor: string;
  hazeOpacity: number;
  farLayerOpacity: number;
  landmarkOpacity: number;
  skylineContrast: number;
  skylineColorFar: string;
  skylineColorMid: string;
  skylineColorAccent: string;
  skylineCutoutColor: string;
  disclosure: string;
}

const SKYLINE_LANDMARKS: Partial<Record<SkylineKey, string>> = {
  hyderabad: "Charminar",
  delhi: "India Gate",
  mumbai: "Gateway of India",
  bengaluru: "Vidhana Soudha",
  kolkata: "Howrah Bridge",
  generic: "Illustrative Indian landscape",
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp01(t);
}

function parseHex(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function mixHex(fromHex: string, toHex: string, t: number): string {
  const clamped = clamp01(t);
  const [r1, g1, b1] = parseHex(fromHex);
  const [r2, g2, b2] = parseHex(toHex);
  const toByte = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  return `#${toByte(lerp(r1, r2, clamped))}${toByte(lerp(g1, g2, clamped))}${toByte(lerp(b1, b2, clamped))}`;
}

function computeReadingIntensity(readings: Reading[]): number {
  const pm25 = readings.find((r) => r.pollutant === "pm25")?.value;
  const pm10 = readings.find((r) => r.pollutant === "pm10")?.value;

  const pm25Norm = typeof pm25 === "number" ? clamp01(pm25 / 180) : null;
  const pm10Norm = typeof pm10 === "number" ? clamp01(pm10 / 320) : null;

  if (pm25Norm !== null && pm10Norm !== null) {
    return clamp01(pm25Norm * 0.65 + pm10Norm * 0.35);
  }
  if (pm25Norm !== null) return pm25Norm;
  if (pm10Norm !== null) return pm10Norm;
  return 0;
}

export function computeAtmosphereState({
  city,
  air,
  loading,
  theme = "light",
}: {
  city: City | null;
  air: AirQuality | null;
  loading: boolean;
  theme?: ResolvedTheme;
}): AtmosphereState {
  const isDark = theme === "dark";
  const skyline = resolveCitySkyline(city);
  const regional = getRegionalScene(skyline);
  const landmarkLabel = regional
    ? `${regional.region} regional scene · ${regional.label}`
    : getAddedCityScene(skyline)?.label ?? SKYLINE_LANDMARKS[skyline] ?? "Illustrative Indian landscape";

  // Never reuse a previous city's visual intensity while loading or mismatched.
  const isMismatched = Boolean(city && air && air.city.id !== city.id);
  if (loading || !air || isMismatched) {
    return {
      skyline,
      landmarkLabel,
      basis: loading ? "loading" : "unavailable",
      intensity: 0,
      cloudsActive: false,
      skyTop: isDark ? "#101318" : "#DCE6DF",
      skyBottom: isDark ? "#181C23" : "#E7EEE7",
      cloudColor: isDark ? "#60798B" : "#F5F7F5",
      cloudCount: 2,
      cloudSpeed: 0,
      pageWash: isDark ? "#101318" : "#E7EEE7",
      hazeColor: isDark ? "#151920" : "#E7EEE7",
      hazeOpacity: isDark ? 0.22 : 0.14,
      farLayerOpacity: isDark ? 0.34 : 0.24,
      landmarkOpacity: 0.9,
      skylineContrast: 1,
      skylineColorFar: isDark ? "#2C323C" : "#8BA697",
      skylineColorMid: isDark ? "#6C8095" : "#4F7260",
      skylineColorAccent: isDark ? "#A0ADBD" : "#2A4D3E",
      skylineCutoutColor: isDark ? "#16212B" : "#FFFFFF",
      disclosure: loading
        ? "Updating outdoor readings. Illustrative atmosphere held neutral. Not a live view."
        : "Illustrative atmosphere held neutral while recent outdoor readings are unavailable. Not a live view.",
    };
  }

  const recentStation = air.measured.readings.filter((r) => r.freshness === "recent");
  const recentModel = air.modeled.readings.filter((r) => r.freshness === "recent");

  if (recentStation.length === 0 && recentModel.length === 0) {
    return {
      skyline,
      landmarkLabel,
      basis: "unavailable",
      intensity: 0,
      cloudsActive: false,
      skyTop: isDark ? "#101318" : "#DCE6DF",
      skyBottom: isDark ? "#181C23" : "#E7EEE7",
      cloudColor: isDark ? "#60798B" : "#F5F7F5",
      cloudCount: 2,
      cloudSpeed: 0,
      pageWash: isDark ? "#101318" : "#E7EEE7",
      hazeColor: isDark ? "#151920" : "#E7EEE7",
      hazeOpacity: isDark ? 0.24 : 0.16,
      farLayerOpacity: isDark ? 0.34 : 0.24,
      landmarkOpacity: 0.9,
      skylineContrast: 1,
      skylineColorFar: isDark ? "#2C323C" : "#8BA697",
      skylineColorMid: isDark ? "#6C8095" : "#4F7260",
      skylineColorAccent: isDark ? "#A0ADBD" : "#2A4D3E",
      skylineCutoutColor: isDark ? "#20242B" : "#FFFFFF",
      disclosure:
        "Illustrative atmosphere held neutral because recent outdoor readings are unavailable. Not a live view.",
    };
  }

  const usingStation = recentStation.length > 0;
  const basis: AtmosphereBasis = usingStation ? "station" : "model";
  const intensity = computeReadingIntensity(usingStation ? recentStation : recentModel);

  // Preserve Forest & Sage (Light) and neutral nighttime atmospheric skies (Dark)
  // so billow highlights, self-shadowing, and drift stay clearly visible in both modes.
  const skyTop = isDark
    ? usingStation
      ? mixHex("#162330", "#1D2129", intensity)
      : mixHex("#122236", "#1C2532", intensity)
    : usingStation
      ? mixHex("#2E6B56", "#545852", intensity)
      : mixHex("#3369A3", "#4F5E6E", intensity);

  const skyBottom = isDark
    ? usingStation
      ? mixHex("#223446", "#2E333C", intensity)
      : mixHex("#1C344F", "#2B3848", intensity)
    : usingStation
      ? mixHex("#79AC97", "#8F8B7E", intensity)
      : mixHex("#83B6E0", "#8998A6", intensity);

  const cloudColor = isDark
    ? usingStation
      ? mixHex("#6C8296", "#7B8088", intensity)
      : mixHex("#6E8BA8", "#7B8998", intensity)
    : usingStation
      ? mixHex("#FCFDFB", "#EAE3D2", intensity)
      : mixHex("#FBF8F2", "#E2E8EE", intensity);

  const cloudCount = Math.max(3, Math.min(6, Math.round(3 + intensity * 3)));
  const cloudSpeed = Number((usingStation ? 1.15 - intensity * 0.35 : 1.05 - intensity * 0.30).toFixed(2));

  const pageWash = isDark
    ? usingStation
      ? mixHex("#101318", "#171A20", intensity * 0.8)
      : mixHex("#10141B", "#171D26", intensity * 0.8)
    : usingStation
      ? mixHex("#E7EEE7", "#E6E7DF", intensity * 0.8)
      : mixHex("#E5ECF0", "#E2E6E9", intensity * 0.8);

  const hazeColor = isDark
    ? usingStation
      ? mixHex("#1B242E", "#292D34", intensity)
      : mixHex("#18283B", "#273341", intensity)
    : usingStation
      ? mixHex("#CFE0D6", "#B6B2A4", intensity)
      : mixHex("#CFE2F0", "#B4C1CD", intensity);

  const hazeOpacity = isDark
    ? Number((0.12 + intensity * 0.28).toFixed(3))
    : Number((0.08 + intensity * 0.28).toFixed(3));
  const farLayerOpacity = isDark
    ? Number((0.40 - intensity * 0.10).toFixed(3))
    : Number((0.34 - intensity * 0.10).toFixed(3));
  const landmarkOpacity = Number((0.94 - intensity * 0.10).toFixed(3));
  const skylineContrast = Number((1.12 - intensity * 0.14).toFixed(3));

  const skylineColorFar = isDark
    ? usingStation
      ? mixHex("#29323D", "#333840", intensity)
      : mixHex("#23364A", "#2E3A47", intensity)
    : usingStation
      ? mixHex("#4F7361", "#6D7065", intensity)
      : mixHex("#4E6F8C", "#667685", intensity);

  const skylineColorMid = isDark
    ? usingStation
      ? mixHex("#6C8298", "#697585", intensity)
      : mixHex("#708AA4", "#677D90", intensity)
    : usingStation
      ? mixHex("#264D3E", "#464E43", intensity)
      : mixHex("#264969", "#425465", intensity);

  const skylineColorAccent = isDark
    ? usingStation
      ? mixHex("#A8B9C9", "#899AAB", intensity)
      : mixHex("#AAC0D3", "#8EA3B8", intensity)
    : usingStation
      ? mixHex("#133326", "#2A352D", intensity)
      : mixHex("#163554", "#273D52", intensity);

  const skylineCutoutColor = isDark ? mixHex(skyBottom, "#101318", 0.45) : "#FFFFFF";

  const disclosure = usingStation
    ? "Illustrative atmosphere based on available outdoor particle readings. Not a live view."
    : "Illustrative atmosphere based on regional model estimates (Open-Meteo / CAMS), not a local station or live view.";

  return {
    skyline,
    landmarkLabel,
    basis,
    intensity: Number(intensity.toFixed(3)),
    cloudsActive: true,
    skyTop,
    skyBottom,
    cloudColor,
    cloudCount,
    cloudSpeed,
    pageWash,
    hazeColor,
    hazeOpacity,
    farLayerOpacity,
    landmarkOpacity,
    skylineContrast,
    skylineColorFar,
    skylineColorMid,
    skylineColorAccent,
    skylineCutoutColor,
    disclosure,
  };
}
