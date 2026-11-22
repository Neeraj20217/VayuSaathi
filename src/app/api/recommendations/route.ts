import { requestSchema } from "@/lib/contracts";
import { getAirQuality } from "@/lib/server/air-quality";
import { resolveCity } from "@/lib/server/geocoding";
import { generatePlan } from "@/lib/server/recommendations";

const limit = 2048;

async function readProfile(request: Request): Promise<unknown> {
  const stream = request.body?.getReader();
  if (!stream) return null;
  const decoder = new TextDecoder();
  let body = "";
  let bytes = 0;
  try {
    for (;;) {
      const { value, done } = await stream.read();
      if (done) break;
      bytes += value.length;
      if (bytes > limit) {
        await stream.cancel();
        return null;
      }
      body += decoder.decode(value, { stream: true });
    }
    return JSON.parse(body + decoder.decode());
  } catch {
    return null;
  } finally {
    stream.releaseLock();
  }
}

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  const error = (message: string, status: number) => Response.json({ error: message }, { status, headers });
  if (request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() !== "application/json") {
    return error("Send the household choices as JSON.", 415);
  }
  const input = requestSchema.safeParse(await readProfile(request));
  if (!input.success) return error("Choose an Indian city and at least one household member.", 400);
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return error("AI plans are unavailable until the server is configured for Gemini.", 503);
  try {
    const city = await resolveCity(input.data.cityId);
    if (!city) return error("This Indian location could not be found.", 404);
    const air = await getAirQuality(city);
    const plan = await generatePlan(air, input.data.profile, key);
    return Response.json({ plan, air }, { headers });
  } catch {
    return error("An AI plan could not be generated. Try again shortly.", 502);
  }
}
