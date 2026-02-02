# Road-Aware Matching System - Implementation Summary

## Overview

This document describes the implementation of a production-grade, road-aware, direction-safe, time-ordered, real-time matching system for YAARYATRA's car-pooling feature. The system uses **ONLY free and open-source tools** (OSRM, Nominatim, OpenStreetMap) and is implemented as **additive layers** without breaking existing functionality.

## Key Features Implemented

### 1. Road-Aware Route Matching ✅
- **Service**: `backend/src/services/osrm.service.ts`
- **Functionality**: 
  - Uses OSRM Route API to generate road segments when driver creates pooling offer
  - Stores route as ordered list of road segments (road_id, direction, estimated_time)
  - Works in parallel with existing polyline storage (doesn't replace it)

### 2. Direction-Safe Passenger Matching ✅
- **Service**: `backend/src/services/road-aware-matching.service.ts`
- **Functionality**:
  - Snaps passenger pickup/drop locations to real roads using OSRM Match API
  - Validates that passenger road segments appear in same order and direction as driver route
  - Rejects matches where direction differs (prevents reverse-direction pooling errors)

### 3. Time-Ordered Matching (Loop & Zigzag Safe) ✅
- **Service**: `backend/src/services/road-aware-matching.service.ts`
- **Functionality**:
  - Attaches expected timestamps to each driver road segment at route creation
  - Validates pickup_time < drop_time for passenger matching
  - Works even if same road_id appears multiple times (handles loops/zigzags)

### 4. Real-Time Route Deviation Handling ✅
- **Service**: `backend/src/services/tracking.service.ts` (integrated)
- **Functionality**:
  - Continuously receives driver GPS updates during active trips
  - Map-matches GPS batches to road segments using OSRM Match API
  - If detected road sequence diverges from stored route, updates route state dynamically
  - Recalculates ETAs for all upcoming passenger pickups
  - Does NOT cancel trips automatically on deviation; adapts instead

### 5. Confidence Scoring System ✅
- **Service**: `backend/src/services/road-aware-matching.service.ts`
- **Scoring Components**:
  - Road overlap percentage (40% weight)
  - Direction match (20% weight)
  - Time order validation (20% weight)
  - GPS match confidence (10% weight)
  - Route deviation risk (10% weight)
- **Decision Thresholds**:
  - Accept if score ≥ 0.8
  - Fallback to polyline if score 0.6-0.8
  - Reject if score < 0.6

## Files Created/Modified

### New Files Created:
1. **`backend/src/services/osrm.service.ts`**
   - OSRM Route API integration
   - OSRM Match API integration
   - Road segment extraction

2. **`backend/src/services/road-aware-matching.service.ts`**
   - Road-aware matching logic
   - Confidence scoring
   - Route deviation handling

### Files Modified:
1. **`backend/src/models/PoolingOffer.ts`**
   - Added `roadSegments[]` field (additive, optional)
   - Preserves existing `polyline` field

2. **`backend/src/models/Booking.ts`**
   - Added `passengerPickupSegment` field (additive, optional)
   - Added `passengerDropSegment` field (additive, optional)

3. **`backend/src/services/pooling.service.ts`**
   - Integrated road segment generation in `createOffer()`
   - Integrated road-aware matching in `searchOffers()` with polyline fallback
   - Preserves all existing polyline logic

4. **`backend/src/services/tracking.service.ts`**
   - Added real-time route deviation detection
   - Integrated with road-aware matching service

## Implementation Flow

### Driver Creates Pooling Offer:
```
1. Driver enters route (from → to)
2. System generates polyline (existing logic - preserved)
3. System generates road segments using OSRM Route API (NEW)
4. Both polyline and road segments stored in database
5. Road segments include: road_id, direction, estimated_time
```

### Passenger Searches for Pools:
```
1. Passenger enters pickup and drop locations
2. System tries road-aware matching first:
   - Snaps pickup/drop to roads using OSRM Match API
   - Validates road segments exist in driver route
   - Validates direction matches
   - Validates time order (pickup_time < drop_time)
   - Calculates confidence score
3. If confidence ≥ 0.8: Accept match
4. If confidence 0.6-0.8: Fallback to polyline matching
5. If confidence < 0.6: Reject match
6. If road segments unavailable: Use polyline matching (existing logic)
```

### Real-Time Route Deviation:
```
1. Driver location updates during active trip
2. System collects recent GPS coordinates (last 5 minutes)
3. System map-matches GPS to roads using OSRM Match API
4. System compares matched road sequence with stored route
5. If deviation detected:
   - Recalculates route from current position to destination
   - Updates road segments in offer
   - Recalculates ETAs
   - Passengers see updated route on next fetch
6. Trip continues (not cancelled)
```

## Technical Details

### OSRM Integration
- **Base URL**: `https://router.project-osrm.org` (public, free)
- **Route API**: `/route/v1/driving/{coords}?overview=full&geometries=geojson&steps=true`
- **Match API**: `/match/v1/driving/{coords}?overview=full&geometries=geojson&steps=true`
- **No API keys required**
- **Supports Indian roads** (via OpenStreetMap data)

### Data Model Extensions
- **PoolingOffer.roadSegments[]**: Optional array of road segments
- **Booking.passengerPickupSegment**: Optional pickup segment reference
- **Booking.passengerDropSegment**: Optional drop segment reference
- **All fields are optional** - system works with or without them

### Fallback Strategy
- If OSRM unavailable → Uses polyline matching (existing logic)
- If road segments missing → Uses polyline matching (existing logic)
- If confidence low (0.6-0.8) → Uses polyline matching (existing logic)
- **No functionality is broken** - all existing code preserved

## Benefits

1. **Handles Flyovers vs Service Roads**: Road-aware matching distinguishes between different road levels
2. **Prevents Reverse-Direction Errors**: Direction validation ensures same-direction travel
3. **Handles Loops & Zigzags**: Time-ordered matching works even with complex routes
4. **Adapts to Route Changes**: Real-time deviation handling updates routes dynamically
5. **Reduces False Positives**: Confidence scoring filters ambiguous matches
6. **Backward Compatible**: Existing polyline logic preserved as fallback

## Testing Recommendations

1. **Test with Indian roads**: Flyovers, service roads, complex intersections
2. **Test reverse directions**: Ensure opposite-direction matches are rejected
3. **Test loops**: Routes that visit same location multiple times
4. **Test route deviations**: Active trips with traffic reroutes
5. **Test fallback**: Ensure polyline matching works when OSRM unavailable

## Configuration

### Environment Variables (Optional):
- `OSRM_BASE_URL`: Override OSRM server URL (default: `https://router.project-osrm.org`)

### For Production (Self-Hosted OSRM):
1. Download India-specific OSM data
2. Build OSRM with India data
3. Set `OSRM_BASE_URL` to your self-hosted instance
4. Better performance and India-specific road data

## Notes

- **No paid APIs used** - All services are free and open-source
- **No API keys required** - Works out of the box
- **Student-friendly** - Simple setup, no complex infrastructure
- **Production-ready** - Confidence scoring and error handling included
- **Non-breaking** - All existing functionality preserved

---

*Implementation Date: 2024*  
*Status: Complete and Ready for Testing*
