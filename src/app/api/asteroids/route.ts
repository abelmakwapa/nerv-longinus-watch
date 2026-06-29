// filepath: src/app/api/asteroids/route.ts
/**
 * GET /api/asteroids
 *
 * Primary asteroid data endpoint.
 * Serves as a proxy and transformation layer between NASA NeoWs and the UI.
 *
 * Falls back to mock data when:
 * - USE_MOCK_DATA env var is set to 'true'
 * - NASA API returns an error (graceful degradation)
 * - Running in test environments
 */

import { NextRequest, NextResponse } from "next/server";
import { getNeoWsFeed, NasaApiError } from "@/lib/api/nasa-neows";
import { transformNeoWsFeed } from "@/lib/transformers/neows-transformer";
import { MOCK_ASTEROIDS } from "@/lib/mock/mock-asteroids";

// Force dynamic — this route returns time-sensitive data
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const days = Math.min(7, Math.max(1, parseInt(searchParams.get("days") ?? "7", 10)));
  const useMock = process.env.USE_MOCK_DATA === "true";

  // ── MOCK DATA PATH ────────────────────────────────────────────────────────────────
  if (useMock) {
    return NextResponse.json({
      data: MOCK_ASTEROIDS,
      meta: {
        total: MOCK_ASTEROIDS.length,
        timestamp: new Date().toISOString(),
        nextRefresh: new Date(Date.now() + 3_600_000).toISOString(),
        source: "mock",
      },
    });
  }

  // ── LIVE DATA PATH ────────────────────────────────────────────────────────────────
  try {
    const feed = await getNeoWsFeed(days);
    const asteroids = transformNeoWsFeed(feed);

    return NextResponse.json(
      {
        data: asteroids,
        meta: {
          total: asteroids.length,
          timestamp: new Date().toISOString(),
          nextRefresh: new Date(Date.now() + 3_600_000).toISOString(),
          source: "live",
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (error) {
    // ── GRACEFUL DEGRADATION TO MOCK DATA ─────────────────────────────────────────
    // If NASA API fails, return mock data so the interface remains functional.
    // The source field in meta tells the UI which data path was used.

    console.error("[LONGINUS WATCH] NASA API failure, using mock data:", error);

    const errorMessage =
      error instanceof NasaApiError
        ? error.message
        : "UNKNOWN TELEMETRY FAILURE";

    return NextResponse.json(
      {
        data: MOCK_ASTEROIDS,
        meta: {
          total: MOCK_ASTEROIDS.length,
          timestamp: new Date().toISOString(),
          nextRefresh: new Date(Date.now() + 900_000).toISOString(), // Retry sooner on error
          source: "mock",
          warning: errorMessage,
        },
      },
      {
        status: 207, // 207 Multi-Status: partial success (live failed, mock returned)
        headers: {
          "X-Data-Source": "mock-fallback",
          "X-Api-Error": errorMessage,
        },
      }
    );
  }
}
