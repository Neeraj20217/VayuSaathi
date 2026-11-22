import { querySchema } from "@/lib/contracts";
import { searchCities } from "@/lib/server/geocoding";

export async function GET(request: Request) {
  const query = querySchema.safeParse(new URL(request.url).searchParams.get("q"));
  if (!query.success) return Response.json({ error: "Enter a city name of 2 to 80 characters." }, { status: 400 });
  try {
    return Response.json({ cities: await searchCities(query.data) });
  } catch {
    return Response.json({ error: "City search is temporarily unavailable. Try again shortly." }, { status: 502 });
  }
}
