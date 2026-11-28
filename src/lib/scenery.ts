import type { City } from "@/lib/contracts";

// Original silhouettes share a 440 × 200 drawing area within the atmospheric SVG.
type Scene = { label: string; silhouette: string; detail?: string };
type RegionalScene = Scene & { region: string };

export const CITY_SCENES = {
  chennai: { label: "Marina Beach lighthouse", silhouette: "M0 200v-20q70-12 150 0t150 0t140 0v20ZM263 178l10-110h32l10 110ZM264 67V55h50v12Zm6-13V40h38v14Zm-7-15 26-19 26 19Z", detail: "M284 43h10v9h-10Zm-8 57h27v7h-27Zm-4 34h34v7h-34Z" },
  visakhapatnam: { label: "Kailasagiri and coast", silhouette: "M0 200v-19q55-8 116-62 43-43 93-38 28-40 56-27 40 8 91 65 27 29 84 36v45Z", detail: "M60 182q75-17 140-8t158-6v5q-82 18-156 9t-142 6ZM196 81v-22h7v22Zm-5-22 9-12 9 12Zm68-6V32h5v21Z" },
  pune: { label: "Shaniwar Wada", silhouette: "M22 200v-42h32v-22h37v-22h53v22h31v-24h26V95h20V76h20V61h68v15h20v19h20v17h19v24h38v-22h34v22h19v64Z", detail: "M241 200v-44q34-54 68 0v44Zm-137-52h18v20h-18Zm267 0h18v20h-18Z" },
  jaipur: { label: "Hawa Mahal", silhouette: "M95 200v-45h24v-22h23v-20h24V93h23V75h23V59h23l30-28 30 28h23v16h23v18h23v20h24v20h23v22h24v45Z", detail: "M139 175v-17q10-17 20 0v17Zm49 0v-17q10-17 20 0v17Zm50 0v-17q10-17 20 0v17Zm50 0v-17q10-17 20 0v17Zm50 0v-17q10-17 20 0v17Zm48 0v-17q10-17 20 0v17ZM213 128v-18q10-17 20 0v18Zm42 0v-18q10-17 20 0v18Zm42 0v-18q10-17 20 0v18Zm-42-42V71q10-15 20 0v15Z" },
  agra: { label: "Taj Mahal", silhouette: "M20 200v-14h400v14ZM94 186l4-107h13l4 107Zm2-108V67l8-13 9 13v11Zm290 108 4-107h13l4 107Zm2-108V67l8-13 9 13v11ZM140 186v-66h30v-16q18-23 36 0v7h16V90q-33-24 42-63l3-14 3 14q75 39 42 63v21h16v-7q18-23 36 0v82Z", detail: "M242 186v-48q25-46 50 0v48Zm-72-31v-20q11-19 22 0v20Zm167 0v-20q11-19 22 0v20Z" },
  ahmedabad: { label: "Sidi Saiyyed Mosque", silhouette: "M60 200v-73h26v-15h26v15h35v-15h26v15h35v-15h26v15h35v-15h26v15h35v-15h26v15h32v73Z", detail: "M100 184v-24q16-28 32 0v24Zm55 0v-24q16-28 32 0v24Zm55 0v-24q16-28 32 0v24Zm55 0v-24q16-28 32 0v24Zm55 0v-24q16-28 32 0v24Z" },
  kochi: { label: "Fort Kochi fishing nets", silhouette: "M0 200v-17q105-9 210 0t230-5v22Zm45-18L170 62l5 6L53 182Zm121-117h7v115h-7Zm-7 13 110-15 1 5-110 15ZM269 65l63 58-4 4-63-58Zm64 58-16 49h-5l15-49Zm-88-55 31 89-5 2-31-89Zm31 88 42 13-2 4-42-13Z", detail: "M8 192q64-10 126 0v4Q67 188 8 197Zm204 0q70-10 168 0v5q-100-10-168 0Z" },
  varanasi: { label: "Varanasi ghats", silhouette: "M0 200v-18h47v-10h38v-10h39v-11h33v-12h36v-15h30v-18h14V94l14-34 14 34v12h16v20h21V95h20V83l18-39 18 39v12h22v28h22v17h38v60Z", detail: "M188 174h51v4h-51Zm-38 11h55v4h-55Zm88-27h47v4h-47Zm86-31v-15q13-22 26 0v15Z" },
} satisfies Record<string, Scene>;

// Regional vignettes are representative landscapes rather than exact maps or views.
export const REGIONAL_SCENES = {
  "andhra pradesh": { region: "Andhra Pradesh", label: "Eastern Ghats and coast", silhouette: "M0 200v-23l63-26 39-35 55 18 65-55 60 39 58 21 100 40v21Z" },
  "arunachal pradesh": { region: "Arunachal Pradesh", label: "Himalayan ridges", silhouette: "M0 200v-37l95-21 80-91 49 53 39-31 55 42 32-53 90 85v53Z" },
  "assam": { region: "Assam", label: "Brahmaputra floodplain", silhouette: "M0 200v-38q115-44 221-8t219-16v62Z", detail: "M0 182q100-24 224 0t216-17v8q-110 39-222 17T0 193Z" },
  "bihar": { region: "Bihar", label: "Gangetic plain and stupa", silhouette: "M0 200v-31q100-25 199-1h48v-13h18q8-38 47-38t47 38h18v13h63v32Z" },
  "chhattisgarh": { region: "Chhattisgarh", label: "Bastar forest and falls", silhouette: "M0 200v-60l78-26 37 9 66-18 26 15h110v29l33 20 90-12v43Z", detail: "M225 139h70v47h-70Z" },
  "goa": { region: "Goa", label: "Goan coast", silhouette: "M0 200v-25q88-22 170 5t270-2v22ZM308 182q4-45 24-85l6 4q-17 43-18 81Zm27-82q-30-28-64 1 33-13 64-1Zm0 0q25-39 59-13-31-5-59 13Zm-2 0q39-13 54 17-26-13-54-17Z" },
  "gujarat": { region: "Gujarat", label: "Rann of Kutch salt flats", silhouette: "M0 200v-35l83-8 81 9 110-3 105-12 61 14v35Z", detail: "M23 178l107-8 95 8-95-4Zm192 13 91-14 118 7-116-3Z" },
  "haryana": { region: "Haryana", label: "Haryana farm fields", silhouette: "M0 200v-30q99-28 218-6h84v-23h15v23h123v36Z", detail: "M80 200l100-29h19l-82 29Zm133 0 51-29h15l-27 29Z" },
  "himachal pradesh": { region: "Himachal Pradesh", label: "Mountain valleys", silhouette: "M0 200v-62l74-35 75-72 64 82 30-23 60 45 63-64 74 64v65Z", detail: "M105 75l44-44 32 41-29-12-21 14Z" },
  "jharkhand": { region: "Jharkhand", label: "Chota Nagpur plateau", silhouette: "M0 200v-41l63-13 49-47h112l64 23 53-3 99 32v49Z" },
  "karnataka": { region: "Karnataka", label: "Western Ghats", silhouette: "M0 200v-40q85-72 158-29 57-80 135-25 60-32 147 34v60Z" },
  "kerala": { region: "Kerala", label: "Kerala backwaters", silhouette: "M0 200v-22q80-35 170 0t270-1v23ZM175 171h165l-22 14H193Zm18-3v-18q30-24 66 0v18Zm82 0v-12h27v12Z" },
  "madhya pradesh": { region: "Madhya Pradesh", label: "Central Indian forest", silhouette: "M0 200v-30q120-57 238-30t202 20v40ZM254 151l27-65 27 65Zm50 11 31-79 31 79Z" },
  "maharashtra": { region: "Maharashtra", label: "Sahyadri forts and ridges", silhouette: "M0 200v-36l59-26 58-31h40v-19h20v10h19V88h19v10h48v-10h19v20h26l51 30 81 35v27Z" },
  "manipur": { region: "Manipur", label: "Loktak Lake", silhouette: "M0 200v-42q100-68 218-14 99-45 222 15v41Z", detail: "M62 174q64-28 111 0-61 14-111 0Zm178 7q65-28 129 1-76 17-129-1Z" },
  "meghalaya": { region: "Meghalaya", label: "Meghalaya hills and waterfall", silhouette: "M0 200v-61l60-37 116-20 71 20 66 3 56 39 71 14v42Z", detail: "M235 105l20 6 7 70h-28Z" },
  "mizoram": { region: "Mizoram", label: "Layered Mizo hills", silhouette: "M0 200v-44Q91 66 190 139q60-73 123-48 63 63 127 64v45Z", detail: "M0 198q130-80 238-29t202 0v31H0Z" },
  "nagaland": { region: "Nagaland", label: "Naga hills and village", silhouette: "M0 200v-40l107-74 58 28 59-32 63 27 69-46 84 65v72Z", detail: "M237 151l29-32 31 32h-7v20h-47v-20Zm71-13 25-26 27 26h-6v20h-40v-20Z" },
  "odisha": { region: "Odisha", label: "Coastal Odisha temple landscape", silhouette: "M0 200v-46q113-31 214 0h26v-32h10v-15h10V92h10V78l22-27 22 27v14h10v15h10v15h10v32q61-22 96 1v45Z" },
  "punjab": { region: "Punjab", label: "Punjab crop fields", silhouette: "M0 200v-51q111 19 226 0t214 0v51Z", detail: "M135 200l89-56h8l-65 56Zm88 0 43-60h11l-19 60Zm86 0-2-59h10l22 59Z" },
  "rajasthan": { region: "Rajasthan", label: "Thar dunes", silhouette: "M0 200v-35Q113 62 234 161q64-87 206-37v76Z", detail: "M29 191q132-79 216-18 79-28 195-23v14q-116-2-195 20-84-60-216 13Z" },
  "sikkim": { region: "Sikkim", label: "Kanchenjunga range", silhouette: "M0 200v-38l78-47 44 12 62-77 37 31 49-63 42 53 33-17 95 102v44Z", detail: "M221 81l49-63 42 53-24-14-18-11-21 28Z" },
  "tamil nadu": { region: "Tamil Nadu", label: "Rice fields and temple tower", silhouette: "M0 200v-38h216v-18h13v-18h14v-18h14V90h14V72h14V54h20v18h14v18h14v18h14v18h14v18h13v18h26v38Z" },
  "telangana": { region: "Telangana", label: "Deccan granite outcrops", silhouette: "M0 200v-20q108-45 214-11 32-30 74-26 22-45 50-31 22 3 36 30 33-6 66 24v34Z" },
  "tripura": { region: "Tripura", label: "Rudrasagar lake landscape", silhouette: "M0 200v-24q92-29 183-9h38v-25h23l11-19 11 19h22v-36l20-22 20 22v36h24l11-19 11 19h22v25h44v33Z", detail: "M92 185q99-14 192 2t156-4v7q-60 16-156 4t-192-2Z" },
  "uttar pradesh": { region: "Uttar Pradesh", label: "Gangetic farmland and river", silhouette: "M0 200v-55q96 38 196 8t244-10v57Z", detail: "M0 192q86-39 208-14t232-15v10q-120 34-232 13T0 200Z" },
  "uttarakhand": { region: "Uttarakhand", label: "Garhwal mountains and river", silhouette: "M0 200v-50l74-63 36 39 71-53 42 33 72-77 50 51 28-10 67 74v56Z", detail: "M230 200q-36-22 12-35 34-9 26-32 37 25-9 38-21 13 23 29Z" },
  "west bengal": { region: "West Bengal", label: "Sundarbans mangroves", silhouette: "M0 200v-28q112-28 223 3t217-8v33ZM255 186v-31l-34-5 21-46 22 21 20-35 25 45 28-23 27 39-76 5v30Z" },
  "andaman and nicobar islands": { region: "Andaman and Nicobar Islands", label: "Island bays", silhouette: "M0 200v-19q63-10 119 0t158-7 163 3v23ZM187 168q61-27 104-71 45 41 125 67Z", detail: "M33 188q73-7 108 0v4H33Z" },
  "chandigarh": { region: "Chandigarh", label: "Sukhna Lake and Shivalik foothills", silhouette: "M0 200v-47l52-20 45 1 68-29 48 19 65-28 73 24 89 28v52Z", detail: "M0 179q90-18 204-5t236-5v8q-112 23-236 6T0 187Z" },
  "dadra and nagar haveli and daman and diu": { region: "Dadra and Nagar Haveli and Daman and Diu", label: "Coastal fort and estuary", silhouette: "M0 200v-24l77-15 74 18h51v-51h22v-15h18v15h24v-15h18v15h24v-15h18v15h22v-15h18v15h23v51h51v21Z", detail: "M270 182v-27q17-25 34 0v27Z" },
  "delhi": { region: "Delhi", label: "Yamuna river plain", silhouette: "M0 200v-45q87-25 164 0t276-4v49Z", detail: "M50 200q95-45 191-18t199-18v9q-104 40-199 17t-146 10Z" },
  "jammu and kashmir": { region: "Jammu and Kashmir", label: "Kashmir lake and mountains", silhouette: "M0 200v-48l78-41 65 16 69-83 62 65 27-13 57 38 82-19v85Z", detail: "M237 172h125l-27 15h-70Zm20-5v-12l19-15h49l19 15v12Z" },
  "ladakh": { region: "Ladakh", label: "High-altitude desert and monastery", silhouette: "M0 200v-43l74-42 59 26 78-45 74 11 91-62 64 92v63ZM267 141v-32h21V97h25V80h33v17h25v44Z", detail: "M293 115h11v10h-11Zm28 0h11v10h-11Zm27 0h11v10h-11Z" },
  "lakshadweep": { region: "Lakshadweep", label: "Atoll and lagoon", silhouette: "M0 200v-18q109-11 193 2 103-33 247-14v30ZM277 183q-5-30 13-68l5 2q-14 38-7 64Zm15-67q-29-21-57 2 27-10 57-2Zm0 0q27-34 58-5-29-8-58 5Z" },
  "puducherry": { region: "Puducherry", label: "Coromandel coast and promenade", silhouette: "M0 200v-24q96-16 180 0h68v-41h32v-22h58v22h32v41h70v24Z", detail: "M269 166v-15q8-18 16 0v15Zm32 0v-15q8-18 16 0v15Zm32 0v-15q8-18 16 0v15Z" },
} satisfies Record<string, RegionalScene>;

export type AddedCityKey = keyof typeof CITY_SCENES;
export type RegionKey = keyof typeof REGIONAL_SCENES;
export type SkylineKey = AddedCityKey | "hyderabad" | "delhi" | "mumbai" | "bengaluru" | "kolkata" | `region:${RegionKey}` | "generic";

const CITY_ARTWORK = [
  [1269843, ["hyderabad"], "telangana", "hyderabad"],
  [1273294, ["delhi", "new delhi"], "delhi", "delhi"],
  [1275339, ["mumbai", "bombay"], "maharashtra", "mumbai"],
  [1277333, ["bengaluru", "bangalore"], "karnataka", "bengaluru"],
  [1275004, ["kolkata", "calcutta"], "west bengal", "kolkata"],
  [1264527, ["chennai", "madras"], "tamil nadu", "chennai"],
  [1253102, ["visakhapatnam", "vizag", "vishakhapatnam"], "andhra pradesh", "visakhapatnam"],
  [1259229, ["pune", "poona"], "maharashtra", "pune"],
  [1269515, ["jaipur"], "rajasthan", "jaipur"],
  [1279259, ["agra"], "uttar pradesh", "agra"],
  [1279233, ["ahmedabad", "ahmadabad"], "gujarat", "ahmedabad"],
  [1273874, ["kochi", "cochin"], "kerala", "kochi"],
  [1253405, ["varanasi", "banaras", "benares", "kashi"], "uttar pradesh", "varanasi"],
] satisfies [number, string[], RegionKey, SkylineKey][];

const REGION_ALIASES = new Map<string, RegionKey>([
  ["national capital territory of delhi", "delhi"], ["nct of delhi", "delhi"], ["delhi nct", "delhi"],
  ["orissa", "odisha"], ["uttaranchal", "uttarakhand"], ["pondicherry", "puducherry"],
]);

function normalize(value: string) {
  return value.trim().toLowerCase().replaceAll("&", " and ").replace(/\s+/g, " ");
}

export function resolveCitySkyline(city: City | null): SkylineKey {
  if (!city) return "generic";
  const name = normalize(city.name);
  const rawRegion = normalize(city.region ?? "");
  const region = REGION_ALIASES.get(rawRegion) ?? rawRegion;
  const artwork = CITY_ARTWORK.find(([id, aliases, state]) =>
    aliases.includes(name) && (region ? state === region : id === city.id));
  if (artwork) return artwork[3];
  return Object.hasOwn(REGIONAL_SCENES, region) ? `region:${region as RegionKey}` : "generic";
}

export function getRegionalScene(key: SkylineKey): RegionalScene | undefined {
  return key.startsWith("region:") ? REGIONAL_SCENES[key.slice(7) as RegionKey] : undefined;
}

export function getAddedCityScene(key: SkylineKey): Scene | undefined {
  return Object.hasOwn(CITY_SCENES, key) ? CITY_SCENES[key as AddedCityKey] : undefined;
}
