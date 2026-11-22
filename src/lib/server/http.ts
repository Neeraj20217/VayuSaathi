import "server-only";

export class ProviderError extends Error {
  constructor(readonly status: number) {
    super("Provider request failed");
  }
}

export async function getJson(url: URL, headers?: HeadersInit): Promise<unknown> {
  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(7000),
    next: { revalidate: 300 },
  });
  if (!response.ok) throw new ProviderError(response.status);
  return response.json();
}

