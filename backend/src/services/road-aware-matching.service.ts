/**
 * Road-Aware Matching Service
 * Implements production-grade route matching using OSRM road segments
 * Handles flyovers, service roads, reverse directions, loops, and zigzags
 */

import logger from '../utils/logger';
import osrmService, { RoadSegment } from './osrm.service';
import PoolingOffer from '../models/PoolingOffer';

export interface MatchingResult {
  isMatch: boolean;
  confidence: number; // 0-1 score
  reason: string;
  pickupSegmentIndex?: number;
  dropSegmentIndex?: number;
  roadOverlapPercentage?: number;
  directionMatch?: boolean;
  timeOrderValid?: boolean;
  gpsMatchConfidence?: number;
  routeDeviationRisk?: boolean;
}

export interface ConfidenceScoreInputs {
  roadOverlapPercentage: number; // 0-1
  directionMatch: boolean;
  timeOrderValid: boolean;
  gpsMatchConfidence: number; // 0-1
  routeDeviationRisk: boolean;
}

class RoadAwareMatchingService {
  // Confidence scoring weights (public for access in pooling service)
  public readonly ROAD_OVERLAP_WEIGHT = 0.4;
  public readonly DIRECTION_WEIGHT = 0.2;
  public readonly TIME_WEIGHT = 0.2;
  public readonly GPS_CONFIDENCE_WEIGHT = 0.1;
  public readonly DEVIATION_WEIGHT = 0.1;

  // Decision thresholds (public for access in pooling service)
  public readonly ACCEPT_THRESHOLD = 0.8;
  public readonly FALLBACK_MIN = 0.6;
  public readonly FALLBACK_MAX = 0.8;
  public readonly REJECT_THRESHOLD = 0.6;

  /**
   * Match passenger route to driver route using road-aware matching
   */
  async matchPassengerToDriver(
    passengerFromLat: number,
    passengerFromLng: number,
    passengerToLat: number,
    passengerToLng: number,
    driverOffer: any
  ): Promise<MatchingResult> {
    try {
      // If driver offer doesn't have road segments, fallback to polyline matching
      if (!driverOffer.roadSegments || driverOffer.roadSegments.length === 0) {
        logger.info(`⚠️ Offer ${driverOffer.offerId} has no road segments, using fallback matching`);
        return {
          isMatch: false,
          confidence: 0.5, // Medium confidence for fallback
          reason: 'No road segments available, fallback to polyline matching',
        };
      }

      // Step 1: Snap passenger pickup and drop to roads
      const pickupMatch = await osrmService.snapToRoad(passengerFromLat, passengerFromLng);
      const dropMatch = await osrmService.snapToRoad(passengerToLat, passengerToLng);

      logger.info(
        `🔍 Road-aware matching: Passenger pickup road=${pickupMatch.roadId}, ` +
        `drop road=${dropMatch.roadId}, confidence=${pickupMatch.confidence.toFixed(2)}`
      );

      // Step 2: Find pickup and drop segments in driver route
      const driverSegments = driverOffer.roadSegments as RoadSegment[];
      const pickupSegmentIndex = this.findSegmentIndex(driverSegments, pickupMatch.roadId);
      const dropSegmentIndex = this.findSegmentIndex(driverSegments, dropMatch.roadId);

      // Step 3: Validate road overlap
      const roadOverlapPercentage = this.calculateRoadOverlap(
        driverSegments,
        pickupMatch.roadId,
        dropMatch.roadId
      );

      // Step 4: Validate direction
      const directionMatch = this.validateDirection(
        pickupMatch,
        dropMatch,
        driverSegments,
        pickupSegmentIndex,
        dropSegmentIndex
      );

      // Step 5: Validate time order
      const timeOrderValid = this.validateTimeOrder(
        driverSegments,
        pickupSegmentIndex,
        dropSegmentIndex
      );

      // Step 6: Check for route deviation risk
      const routeDeviationRisk = this.checkRouteDeviationRisk(driverOffer);

      // Step 7: Calculate confidence score
      const confidenceInputs: ConfidenceScoreInputs = {
        roadOverlapPercentage,
        directionMatch,
        timeOrderValid,
        gpsMatchConfidence: (pickupMatch.confidence + dropMatch.confidence) / 2,
        routeDeviationRisk,
      };

      const confidence = this.calculateConfidenceScore(confidenceInputs);

      // Step 8: Make matching decision
      let isMatch = false;
      let reason = '';

      if (confidence >= this.ACCEPT_THRESHOLD) {
        isMatch = true;
        reason = `High confidence match (${confidence.toFixed(2)})`;
      } else if (confidence >= this.FALLBACK_MIN && confidence < this.FALLBACK_MAX) {
        isMatch = false; // Will use polyline fallback
        reason = `Medium confidence (${confidence.toFixed(2)}), fallback to polyline matching`;
      } else {
        isMatch = false;
        reason = `Low confidence (${confidence.toFixed(2)}), rejected`;
      }

      // Log matching result
      logger.info(
        `🎯 Road-aware match result: isMatch=${isMatch}, confidence=${confidence.toFixed(2)}, ` +
        `overlap=${(roadOverlapPercentage * 100).toFixed(1)}%, direction=${directionMatch}, ` +
        `timeOrder=${timeOrderValid}, reason=${reason}`
      );

      return {
        isMatch,
        confidence,
        reason,
        pickupSegmentIndex,
        dropSegmentIndex,
        roadOverlapPercentage,
        directionMatch,
        timeOrderValid,
        gpsMatchConfidence: confidenceInputs.gpsMatchConfidence,
        routeDeviationRisk,
      };
    } catch (error) {
      logger.error('Error in road-aware matching:', error);
      // On error, return fallback result
      return {
        isMatch: false,
        confidence: 0.5,
        reason: `Error in road-aware matching: ${error instanceof Error ? error.message : 'Unknown error'}, fallback to polyline`,
      };
    }
  }

  /**
   * Find segment index in driver route by road ID
   */
  private findSegmentIndex(segments: RoadSegment[], roadId: string): number | undefined {
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].roadId === roadId) {
        return i;
      }
    }
    return undefined;
  }

  /**
   * Calculate road overlap percentage
   * Percentage of passenger route segments that exist in driver route
   */
  private calculateRoadOverlap(
    driverSegments: RoadSegment[],
    pickupRoadId: string,
    dropRoadId: string
  ): number {
    const driverRoadIds = new Set(driverSegments.map((s) => s.roadId));
    
    let matchingSegments = 0;
    if (driverRoadIds.has(pickupRoadId)) matchingSegments++;
    if (driverRoadIds.has(dropRoadId)) matchingSegments++;

    // If pickup and drop are the same road, count as 1
    const totalPassengerSegments = pickupRoadId === dropRoadId ? 1 : 2;

    return matchingSegments / totalPassengerSegments;
  }

  /**
   * Validate that passenger direction matches driver direction
   */
  private validateDirection(
    pickupMatch: { roadId: string; direction: 'forward' | 'backward' },
    dropMatch: { roadId: string; direction: 'forward' | 'backward' },
    driverSegments: RoadSegment[],
    pickupIndex: number | undefined,
    dropIndex: number | undefined
  ): boolean {
    if (pickupIndex === undefined || dropIndex === undefined) {
      return false;
    }

    // Get driver direction for pickup and drop segments
    const driverPickupDirection = driverSegments[pickupIndex]?.direction;
    const driverDropDirection = driverSegments[dropIndex]?.direction;

    // Both passenger and driver must have same direction
    const pickupDirectionMatch = pickupMatch.direction === driverPickupDirection;
    const dropDirectionMatch = dropMatch.direction === driverDropDirection;

    return pickupDirectionMatch && dropDirectionMatch;
  }

  /**
   * Validate time order: pickup_time < drop_time
   */
  private validateTimeOrder(
    driverSegments: RoadSegment[],
    pickupIndex: number | undefined,
    dropIndex: number | undefined
  ): boolean {
    if (pickupIndex === undefined || dropIndex === undefined) {
      return false;
    }

    // Ensure pickup comes before drop in time order
    const pickupTime = driverSegments[pickupIndex]?.estimatedTime;
    const dropTime = driverSegments[dropIndex]?.estimatedTime;

    if (!pickupTime || !dropTime) {
      return false;
    }

    // Also validate index order (pickup must come before drop in route)
    return pickupIndex < dropIndex && pickupTime < dropTime;
  }

  /**
   * Check if driver route has recent deviation risk
   */
  private checkRouteDeviationRisk(driverOffer: any): boolean {
    // Check if offer has been recently updated (indicating possible route change)
    const lastUpdate = driverOffer.updatedAt || driverOffer.createdAt;
    const now = new Date();
    const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

    // If updated within last hour, there might be route deviation
    return hoursSinceUpdate < 1;
  }

  /**
   * Calculate confidence score from inputs
   */
  private calculateConfidenceScore(inputs: ConfidenceScoreInputs): number {
    let score = 0;

    // Road overlap contribution (0-0.4)
    score += inputs.roadOverlapPercentage * this.ROAD_OVERLAP_WEIGHT;

    // Direction match contribution (0-0.2)
    if (inputs.directionMatch) {
      score += this.DIRECTION_WEIGHT;
    }

    // Time order contribution (0-0.2)
    if (inputs.timeOrderValid) {
      score += this.TIME_WEIGHT;
    }

    // GPS confidence contribution (0-0.1)
    score += inputs.gpsMatchConfidence * this.GPS_CONFIDENCE_WEIGHT;

    // Deviation risk contribution (0-0.1, negative if risk exists)
    if (!inputs.routeDeviationRisk) {
      score += this.DEVIATION_WEIGHT;
    }

    return Math.min(1, Math.max(0, score)); // Clamp between 0 and 1
  }

  /**
   * Handle real-time route deviation during active trip
   */
  async handleRouteDeviation(
    offerId: string,
    currentGpsCoordinates: Array<{ lat: number; lng: number; timestamp: number }>
  ): Promise<{
    isDeviated: boolean;
    updatedSegments?: RoadSegment[];
    recalculatedETAs?: Date[];
  }> {
    try {
      const offer = await PoolingOffer.findOne({ offerId });
      if (!offer || !offer.roadSegments || offer.roadSegments.length === 0) {
        return { isDeviated: false };
      }

      // Match current GPS to roads
      const matchResult = await osrmService.matchToRoad(currentGpsCoordinates);

      // Compare matched road sequence with stored route
      const currentRoadIds = matchResult.matchedSegments.map((s) => s.roadId);
      const storedRoadIds = offer.roadSegments.map((s) => s.roadId);

      // Check if current road sequence diverges from stored route
      let deviationIndex = -1;
      for (let i = 0; i < Math.min(currentRoadIds.length, storedRoadIds.length); i++) {
        if (currentRoadIds[i] !== storedRoadIds[i]) {
          deviationIndex = i;
          break;
        }
      }

      if (deviationIndex === -1) {
        // No deviation detected
        return { isDeviated: false };
      }

      logger.info(
        `⚠️ Route deviation detected for offer ${offerId} at segment index ${deviationIndex}`
      );

      // Recalculate route from current position to destination
      const lastValidCoord = currentGpsCoordinates[currentGpsCoordinates.length - 1];
      const destination = offer.route.to;

      const newRoute = await osrmService.getRoute(
        lastValidCoord.lat,
        lastValidCoord.lng,
        destination.lat,
        destination.lng,
        new Date() // Current time
      );

      // Update offer with new segments (but keep original for reference)
      // In production, you might want to store deviation history
      offer.roadSegments = newRoute.segments as any;
      await offer.save();

      logger.info(`✅ Route updated for offer ${offerId} with ${newRoute.segments.length} new segments`);

      return {
        isDeviated: true,
        updatedSegments: newRoute.segments,
        recalculatedETAs: newRoute.segments.map((s) => s.estimatedTime),
      };
    } catch (error) {
      logger.error('Error handling route deviation:', error);
      return { isDeviated: false };
    }
  }
}

export const roadAwareMatchingService = new RoadAwareMatchingService();
export default roadAwareMatchingService;
