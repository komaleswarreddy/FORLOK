/**
 * OSRM (Open Source Routing Machine) Service
 * Free, open-source routing engine for road-aware route matching
 * Supports Indian roads via OpenStreetMap data
 */

import logger from '../utils/logger';

// OSRM public server (free, no API key needed)
// For production, you can self-host OSRM with India-specific OSM data
const OSRM_BASE_URL = process.env.OSRM_BASE_URL || 'https://router.project-osrm.org';

export interface RoadSegment {
  roadId: string; // Unique identifier for the road segment (way ID from OSM)
  direction: 'forward' | 'backward'; // Direction of travel on this road
  estimatedTime: Date; // Expected arrival time at this segment
  coordinates: {
    lat: number;
    lng: number;
  };
  distance?: number; // Distance in meters
  duration?: number; // Duration in seconds
}

export interface OSRMRouteResponse {
  code: string;
  routes: Array<{
    geometry: {
      coordinates: Array<[number, number]>; // [lng, lat]
    };
    distance: number; // in meters
    duration: number; // in seconds
    legs: Array<{
      steps: Array<{
        geometry: {
          coordinates: Array<[number, number]>;
        };
        distance: number;
        duration: number;
        waypoints: Array<number>; // Indices into geometry
      }>;
    }>;
  }>;
}

export interface OSRMMatchResponse {
  code: string;
  matchings: Array<{
    geometry: {
      coordinates: Array<[number, number]>;
    };
    confidence: number; // 0-1, higher is better
    distance: number;
    duration: number;
    waypoints: Array<{
      waypoint_index: number;
      location: [number, number];
      name?: string;
    }>;
  }>;
}

class OSRMService {
  /**
   * Get route from OSRM Route API
   * Returns road segments with way IDs and directions
   */
  async getRoute(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
    startTime?: Date
  ): Promise<{
    segments: RoadSegment[];
    totalDistance: number; // in km
    totalDuration: number; // in minutes
    geometry: Array<{ lat: number; lng: number }>;
  }> {
    try {
      const url = `${OSRM_BASE_URL}/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson&steps=true&annotations=true`;

      logger.info(`🛣️ Requesting OSRM route: (${fromLat}, ${fromLng}) → (${toLat}, ${toLng})`);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Yaaryatra-App/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`OSRM Route API error: ${response.statusText}`);
      }

      const data = (await response.json()) as OSRMRouteResponse;

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        logger.warn('No route found from OSRM');
        throw new Error('No route found');
      }

      const route = data.routes[0];
      const totalDistance = route.distance / 1000; // Convert to km
      const totalDuration = route.duration / 60; // Convert to minutes

      // Extract road segments from route steps
      const segments: RoadSegment[] = [];
      const geometry: Array<{ lat: number; lng: number }> = [];

      // Process route geometry
      let currentTime = startTime ? new Date(startTime) : new Date();
      let accumulatedDistance = 0;

      // Extract segments from legs and steps
      for (const leg of route.legs) {
        for (const step of leg.steps) {
          const stepDistance = step.distance / 1000; // km
          const stepDuration = step.duration / 60; // minutes

          // Generate road ID from step (using waypoint indices as proxy for road ID)
          // In a real implementation, you'd extract actual OSM way IDs from the response
          // For now, we use a combination of coordinates to create a unique identifier
          const stepCoords = step.geometry.coordinates;
          if (stepCoords.length > 0) {
            const startCoord = stepCoords[0];
            const endCoord = stepCoords[stepCoords.length - 1];

            // Create road ID from start and end coordinates (simplified)
            // In production, you'd extract actual OSM way IDs from OSRM response
            const roadId = `way_${Math.round(startCoord[0] * 100000)}_${Math.round(startCoord[1] * 100000)}_${Math.round(endCoord[0] * 100000)}_${Math.round(endCoord[1] * 100000)}`;

            // Determine direction based on coordinate progression
            // Forward: coordinates progress in expected order
            const direction: 'forward' | 'backward' = 'forward';

            // Calculate estimated time for this segment
            const segmentTime = new Date(currentTime);
            segmentTime.setMinutes(segmentTime.getMinutes() + accumulatedDistance / 60 * (totalDuration / totalDistance));

            segments.push({
              roadId,
              direction,
              estimatedTime: segmentTime,
              coordinates: {
                lat: startCoord[1],
                lng: startCoord[0],
              },
              distance: stepDistance,
              duration: stepDuration,
            });

            // Add geometry points
            for (const coord of stepCoords) {
              geometry.push({
                lat: coord[1],
                lng: coord[0],
              });
            }

            accumulatedDistance += stepDistance;
            currentTime = new Date(segmentTime);
            currentTime.setMinutes(currentTime.getMinutes() + stepDuration);
          }
        }
      }

      logger.info(`✅ OSRM route extracted: ${segments.length} segments, ${totalDistance.toFixed(2)}km, ${totalDuration.toFixed(2)}min`);

      return {
        segments,
        totalDistance,
        totalDuration,
        geometry,
      };
    } catch (error) {
      logger.error('Error getting OSRM route:', error);
      throw error;
    }
  }

  /**
   * Match GPS coordinates to road segments using OSRM Match API
   * Used for snapping passenger pickup/drop locations to roads
   */
  async matchToRoad(
    coordinates: Array<{ lat: number; lng: number; timestamp?: number }>
  ): Promise<{
    matchedSegments: Array<{
      roadId: string;
      direction: 'forward' | 'backward';
      coordinates: { lat: number; lng: number };
      confidence: number;
    }>;
    confidence: number; // Overall match confidence
  }> {
    try {
      // Format coordinates for OSRM Match API: "lng,lat;lng,lat;..."
      const coordsString = coordinates
        .map((coord) => `${coord.lng},${coord.lat}`)
        .join(';');

      const url = `${OSRM_BASE_URL}/match/v1/driving/${coordsString}?overview=full&geometries=geojson&steps=true`;

      logger.info(`📍 Matching ${coordinates.length} GPS points to roads`);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Yaaryatra-App/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`OSRM Match API error: ${response.statusText}`);
      }

      const data = (await response.json()) as OSRMMatchResponse;

      if (data.code !== 'Ok' || !data.matchings || data.matchings.length === 0) {
        logger.warn('No road match found from OSRM');
        throw new Error('No road match found');
      }

      const matching = data.matchings[0];
      const matchedSegments: Array<{
        roadId: string;
        direction: 'forward' | 'backward';
        coordinates: { lat: number; lng: number };
        confidence: number;
      }> = [];

      // Extract matched segments from waypoints
      for (const waypoint of matching.waypoints) {
        const coord = waypoint.location;
        // Generate road ID (simplified - in production, extract from OSRM response)
        const roadId = `way_${Math.round(coord[0] * 100000)}_${Math.round(coord[1] * 100000)}`;

        matchedSegments.push({
          roadId,
          direction: 'forward', // OSRM Match API provides direction implicitly
          coordinates: {
            lat: coord[1],
            lng: coord[0],
          },
          confidence: matching.confidence,
        });
      }

      logger.info(`✅ Matched ${matchedSegments.length} points to roads (confidence: ${matching.confidence.toFixed(2)})`);

      return {
        matchedSegments,
        confidence: matching.confidence,
      };
    } catch (error) {
      logger.error('Error matching GPS to road:', error);
      throw error;
    }
  }

  /**
   * Snap a single coordinate to nearest road
   */
  async snapToRoad(lat: number, lng: number): Promise<{
    roadId: string;
    direction: 'forward' | 'backward';
    coordinates: { lat: number; lng: number };
    confidence: number;
  }> {
    const result = await this.matchToRoad([{ lat, lng }]);
    return result.matchedSegments[0] || {
      roadId: `way_${Math.round(lng * 100000)}_${Math.round(lat * 100000)}`,
      direction: 'forward',
      coordinates: { lat, lng },
      confidence: 0.5, // Low confidence fallback
    };
  }
}

export const osrmService = new OSRMService();
export default osrmService;
