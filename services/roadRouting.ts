// Gerçek yol rotası — OSRM (OpenStreetMap) yürüyüş geometrisi
import { OSRM_URL } from "../constants/config";
import { distanceMeters } from "../utils/geo";
import { normalizeLatLng } from "../utils/coordinates";
import type { Coordinate, RoutePathSegment, RouteSegment } from "../types/api";

const OSRM_TIMEOUT = 20_000;

interface OsrmGeoJsonGeometry {
  type: "LineString";
  coordinates: [number, number][];
}

interface OsrmRouteResponse {
  code: string;
  routes?: Array<{
    distance: number;
    duration: number;
    geometry: OsrmGeoJsonGeometry;
  }>;
}

export interface WalkingRouteResult {
  coordinates: Coordinate[];
  distanceMeters: number;
  durationSeconds: number;
}

/** İki nokta arasında yürüyüş rotası (sokak/sidewalk) hesaplar. */
export async function fetchWalkingRoute(
  origin: Coordinate,
  destination: Coordinate
): Promise<WalkingRouteResult> {
  const start = normalizeLatLng(origin.lat, origin.lng);
  const end = normalizeLatLng(destination.lat, destination.lng);

  const url =
    `${OSRM_URL}/route/v1/foot/` +
    `${start.lng},${start.lat};${end.lng},${end.lat}` +
    "?overview=full&geometries=geojson&alternatives=false&steps=false";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OSRM_TIMEOUT);

  try {
    const res = await fetch(url, { signal: controller.signal });

    if (!res.ok) {
      throw new Error("Yol rotası servisi yanıt vermedi.");
    }

    const data = (await res.json()) as OsrmRouteResponse;

    if (data.code !== "Ok" || !data.routes?.[0]?.geometry?.coordinates?.length) {
      throw new Error("Bu noktalar arasında yürüyüş rotası bulunamadı.");
    }

    const route = data.routes[0];
    const coordinates = route.geometry.coordinates.map(([lng, lat]) => {
      const normalized = normalizeLatLng(lat, lng);
      return { lat: normalized.lat, lng: normalized.lng };
    });

    return {
      coordinates,
      distanceMeters: route.distance,
      durationSeconds: Math.round(route.duration),
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Yol rotası hesaplaması zaman aşımına uğradı.");
    }
    if (err instanceof Error) throw err;
    throw new Error("Yol rotası hesaplanamadı.");
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * OSRM yol geometrisini backend risk segmentlerine göre renklendirilmiş parçalara böler.
 */
export function splitPathByRiskSegments(
  path: Coordinate[],
  riskSegments: RouteSegment[]
): RoutePathSegment[] {
  if (path.length < 2) return [];
  if (riskSegments.length === 0) {
    return [{ coordinates: path, risk_score: 0 }];
  }

  const weights = riskSegments.map((seg) =>
    Math.max(1, distanceMeters(seg.start, seg.end))
  );
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  const cumDist: number[] = [0];
  for (let i = 1; i < path.length; i++) {
    cumDist.push(cumDist[i - 1] + distanceMeters(path[i - 1], path[i]));
  }
  const totalPathDist = cumDist[cumDist.length - 1] || 1;

  const cutDistances: number[] = [0];
  let weightAcc = 0;
  for (let i = 0; i < riskSegments.length - 1; i++) {
    weightAcc += weights[i] / totalWeight;
    cutDistances.push(weightAcc * totalPathDist);
  }
  cutDistances.push(totalPathDist);

  const result: RoutePathSegment[] = [];
  let pointIndex = 0;

  for (let s = 0; s < riskSegments.length; s++) {
    const endDistance = cutDistances[s + 1];
    const slice: Coordinate[] = [path[pointIndex]];

    while (pointIndex < path.length - 1 && cumDist[pointIndex + 1] <= endDistance + 0.5) {
      pointIndex++;
      slice.push(path[pointIndex]);
    }

    if (slice.length >= 2) {
      result.push({
        coordinates: slice,
        risk_score: riskSegments[s].risk_score,
      });
    }
  }

  if (result.length === 0) {
    return [{ coordinates: path, risk_score: riskSegments[0]?.risk_score ?? 0 }];
  }

  return result;
}

/** OSRM başarısız olursa düz çizgi yedek geometri üretir. */
export function straightPathFromSegments(
  riskSegments: RouteSegment[]
): RoutePathSegment[] {
  return riskSegments.map((seg) => ({
    coordinates: [seg.start, seg.end],
    risk_score: seg.risk_score,
  }));
}
