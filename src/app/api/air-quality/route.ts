import { cityIdSchema } from "@/lib/contracts";
import { getAirQuality } from "@/lib/server/air-quality";
import { resolveCity } from "@/lib/server/geocoding";

export async function GET(request: Request) {
  const cityId = cityIdSchema.safeParse(Number(new URL(request.url).searchParams.get("cityId")));
  if (!cityId.success) return Response.json({ error: "Select a city from the search results." }, { status: 400 });
  try {
    const city = await resolveCity(cityId.data);
    if (!city) return Response.json({ error: "This Indian location could not be found." }, { status: 404 });
    return Response.json(await getAirQuality(city));
  } catch {
    return Response.json({ error: "The selected city could not be verified. Try again shortly." }, { status: 502 });
  }
}
