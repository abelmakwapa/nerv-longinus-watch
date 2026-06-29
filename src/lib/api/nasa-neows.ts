// filepath: src/lib/api/nasa-neows.ts
import { NeoWsFeedSchema, type NeoWsFeedResponse } from "@/schemas/neows.schema";

const NASA_BASE = "https://api.nasa.gov/neo/rest/v1";
const API_KEY = process.env.NASA_NEOWS_API_KEY ?? "DEMO_KEY";

// ── TYPED API ERROR ───────────────────────────────────────────────────────────────

export class NasaApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "NasaApiError";
  }
}

// ── FETCH WITH TIMEOUT + RETRY ────────────────────────────────────────────────────

async function nasaFetch(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const { timeoutMs = 15000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 429) {
      throw new NasaApiError(
        "NASA API RATE LIMIT EXCEEDED — LONGINUS WATCH TELEMETRY DISRUPTED",
        429,
        true
      );
    }

    if (response.status === 403) {
      throw new NasaApiError(
        "NASA API KEY INVALID — AUTHENTICATION FAILURE",
        403,
        false
      );
    }

    if (!response.ok) {
      throw new NasaApiError(
        `NASA TELEMETRY FAILURE — HTTP ${response.status}`,
        response.status,
        response.status >= 500
      );
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof NasaApiError) throw error;

    if (error instanceof Error && error.name === "AbortError") {
      throw new NasaApiError(
        "TELEMETRY FEED TIMEOUT — ARRAY UNRESPONSIVE",
        408,
        true
      );
    }

    throw new NasaApiError(
      "NETWORK FAILURE — TRACKING ARRAY OFFLINE",
      0,
      true
    );
  }
}

// ── PRIMARY: 7-DAY CLOSE APPROACH FEED ───────────────────────────────────────────

export async function getNeoWsFeed(
  days: number = 7
): Promise<NeoWsFeedResponse> {
  const clampedDays = Math.max(1, Math.min(7, days));

  const startDate = new Date().toISOString().split("T")[0];
  const endDate = new Date(Date.now() + clampedDays * 86_400_000)
    .toISOString()
    .split("T")[0];

  const url = new URL(`${NASA_BASE}/feed`);
  url.searchParams.set("start_date", startDate);
  url.searchParams.set("end_date", endDate);
  url.searchParams.set("api_key", API_KEY);

  const response = await nasaFetch(url.toString(), {
    next: {
      revalidate: 3600,
      tags: ["neows-feed"],
    },
  } as RequestInit);

  const raw = await response.json();

  const result = NeoWsFeedSchema.safeParse(raw);

  if (!result.success) {
    console.error(
      "[LONGINUS WATCH] NeoWs feed validation failed:",
      result.error.issues
    );
    throw new NasaApiError(
      "TELEMETRY DATA INTEGRITY FAILURE — SCHEMA VALIDATION REJECTED",
      422,
      false
    );
  }

  return result.data;
}
