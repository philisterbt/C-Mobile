// Güvenli rota hook'u — backend risk skoru + OSRM gerçek yol geometrisi
import { useState, useCallback } from "react";
import { api } from "../services/api";
import {
  fetchWalkingRoute,
  splitPathByRiskSegments,
  straightPathFromSegments,
} from "../services/roadRouting";
import { normalizeLatLng } from "../utils/coordinates";
import type { Coordinate, RouteResponse } from "../types/api";

interface UseSafeRouteResult {
  data: RouteResponse | null;
  loading: boolean;
  error: string | null;
  load: (origin: Coordinate, destination: Coordinate) => Promise<void>;
}

/** Rota uç noktalarını istenen konuma hizalar (backend segment uçları sapabiliyor). */
function alignRouteToEndpoints(
  route: RouteResponse,
  origin: Coordinate,
  destination: Coordinate
): RouteResponse {
  const start = normalizeLatLng(origin.lat, origin.lng);
  const end = normalizeLatLng(destination.lat, destination.lng);

  if (route.segments.length === 0) {
    return {
      ...route,
      assembly_point: { lat: end.lat, lng: end.lng },
      segments: [
        {
          start: { lat: start.lat, lng: start.lng },
          end: { lat: end.lat, lng: end.lng },
          risk_score: 0,
        },
      ],
    };
  }

  const segments = route.segments.map((seg, index) => {
    if (index === 0) {
      return { ...seg, start: { lat: start.lat, lng: start.lng } };
    }
    if (index === route.segments.length - 1) {
      return { ...seg, end: { lat: end.lat, lng: end.lng } };
    }
    return seg;
  });

  return {
    ...route,
    assembly_point: { lat: end.lat, lng: end.lng },
    segments,
  };
}

export function useSafeRoute(): UseSafeRouteResult {
  const [data, setData] = useState<RouteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (origin: Coordinate, destination: Coordinate) => {
    setLoading(true);
    setError(null);

    try {
      const backendRoute = alignRouteToEndpoints(
        await api.getRoute({ origin, destination }),
        origin,
        destination
      );

      let pathSegments = straightPathFromSegments(backendRoute.segments);
      let totalDistanceKm = backendRoute.total_distance;
      let durationSeconds = Math.round(
        (backendRoute.total_distance * 1000) / 1.4
      );
      let followsRoads = false;

      try {
        const walkingRoute = await fetchWalkingRoute(origin, destination);
        pathSegments = splitPathByRiskSegments(
          walkingRoute.coordinates,
          backendRoute.segments
        );
        totalDistanceKm = walkingRoute.distanceMeters / 1000;
        durationSeconds = walkingRoute.durationSeconds;
        followsRoads = true;
      } catch {
        // OSRM erişilemezse backend düz segmentlerle devam et
        pathSegments = straightPathFromSegments(backendRoute.segments);
      }

      setData({
        ...backendRoute,
        path_segments: pathSegments,
        total_distance: totalDistanceKm,
        duration_seconds: durationSeconds,
        follows_roads: followsRoads,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rota hesaplanamadı.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, load };
}
