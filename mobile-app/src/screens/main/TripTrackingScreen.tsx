import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Phone, MessageCircle, Info, MapPin, Clock, Navigation, AlertCircle } from 'lucide-react-native';
import { COLORS, FONTS, SPACING } from '@constants/theme';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { useLanguage } from '@context/LanguageContext';
import { trackingApi, bookingApi } from '@utils/apiClient';
import { WebView } from 'react-native-webview';

interface RouteParams {
  bookingId?: string;
  booking?: any;
}

const TripTrackingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useLanguage();
  const params = (route.params as RouteParams) || {};
  const bookingId = params.bookingId || params.booking?.bookingId;
  
  const [booking, setBooking] = useState<any>(params.booking || null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [eta, setEta] = useState(0);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState('0m');
  const [loading, setLoading] = useState(true);
  const [mapHTML, setMapHTML] = useState<string>('');
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (bookingId) {
      loadBooking();
      startLocationTracking();
    }

    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
    };
  }, [bookingId]);

  const loadBooking = async () => {
    if (!bookingId) return;

    try {
      const response = await bookingApi.getBooking(bookingId);
      if (response.success && response.data) {
        setBooking(response.data);
      }
    } catch (error: any) {
      console.error('Error loading booking:', error);
    }
  };

  const startLocationTracking = () => {
    // Fetch location immediately
    fetchDriverLocation();
    fetchTripMetrics();

    // Poll for location updates every 5 seconds
    locationIntervalRef.current = setInterval(() => {
      fetchDriverLocation();
      fetchTripMetrics();
    }, 5000);
  };

  const fetchDriverLocation = async () => {
    if (!bookingId) return;

    try {
      const response = await trackingApi.getDriverLocation(bookingId);
      if (response.success && response.data) {
        const location = response.data.location;
        setDriverLocation({ lat: location.lat, lng: location.lng });
        updateMap(location.lat, location.lng);
      }
    } catch (error: any) {
      console.error('Error fetching driver location:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTripMetrics = async () => {
    if (!bookingId) return;

    try {
      const response = await trackingApi.getTripMetrics(bookingId);
      if (response.success && response.data) {
        setEta(response.data.eta || 0);
        setDistance(response.data.distance || 0);
        setDuration(response.data.duration || '0m');
      }
    } catch (error: any) {
      console.error('Error fetching trip metrics:', error);
    }
  };

  const updateMap = (lat: number, lng: number) => {
    const destinationLat = typeof booking?.route?.to === 'object' 
      ? booking.route.to.lat 
      : booking?.route?.to?.lat || lat;
    const destinationLng = typeof booking?.route?.to === 'object' 
      ? booking.route.to.lng 
      : booking?.route?.to?.lng || lng;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { margin: 0; padding: 0; }
    #map { width: 100%; height: 100vh; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map').setView([${lat}, ${lng}], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);
    
    // Driver location marker
    const driverMarker = L.marker([${lat}, ${lng}], {
      icon: L.divIcon({
        className: 'driver-marker',
        html: '<div style="background: ${COLORS.primary}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })
    }).addTo(map);
    
    // Destination marker
    const destMarker = L.marker([${destinationLat}, ${destinationLng}], {
      icon: L.divIcon({
        className: 'dest-marker',
        html: '<div style="background: ${COLORS.success}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })
    }).addTo(map);
    
    // Route line
    const routeLine = L.polyline([
      [${lat}, ${lng}],
      [${destinationLat}, ${destinationLng}]
    ], {
      color: '${COLORS.primary}',
      weight: 4,
      opacity: 0.7
    }).addTo(map);
    
    // Fit bounds to show both markers
    map.fitBounds([
      [${lat}, ${lng}],
      [${destinationLat}, ${destinationLng}]
    ], { padding: [50, 50] });
    
    // Update driver marker position (for real-time updates)
    function updateDriverPosition(newLat, newLng) {
      driverMarker.setLatLng([newLat, newLng]);
      routeLine.setLatLngs([
        [newLat, newLng],
        [${destinationLat}, ${destinationLng}]
      ]);
      map.fitBounds([
        [newLat, newLng],
        [${destinationLat}, ${destinationLng}]
      ], { padding: [50, 50] });
    }
    
    // Expose update function to parent
    window.updateDriverPosition = updateDriverPosition;
  </script>
</body>
</html>
    `;
    setMapHTML(html);
  };

  const handleWebViewMessage = (event: any) => {
    // Handle any messages from WebView if needed
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => {}}>
            <Phone size={24} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Chat' as never)}
            style={styles.headerButton}
          >
            <MessageCircle size={24} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}}>
            <Info size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statusBar}>
        <Text style={styles.statusText}>{t('tripTracking.tripInProgress')}</Text>
        <Text style={styles.etaText}>{t('tripTracking.eta')}: {eta} {t('common.minutes')}</Text>
      </View>

      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.mapPlaceholder}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.mapHint}>Loading map...</Text>
          </View>
        ) : mapHTML ? (
          <WebView
            source={{ html: mapHTML }}
            style={styles.webView}
            javaScriptEnabled={true}
            onMessage={handleWebViewMessage}
          />
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapHint}>{t('tripTracking.liveMapView')}</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.tripDetailsCard}>
          <Text style={styles.sectionTitle}>{t('tripTracking.tripDetails')}:</Text>
          <View style={styles.detailItem}>
            <MapPin size={20} color={COLORS.primary} />
            <Text style={styles.detailText}>
              {t('tripTracking.pickup')}: {typeof booking?.route?.from === 'string' 
                ? booking.route.from 
                : booking?.route?.from?.address || 'N/A'}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <MapPin size={20} color={COLORS.primary} />
            <Text style={styles.detailText}>
              {t('tripTracking.drop')}: {typeof booking?.route?.to === 'string' 
                ? booking.route.to 
                : booking?.route?.to?.address || 'N/A'}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Clock size={20} color={COLORS.primary} />
            <Text style={styles.detailText}>
              {t('tripTracking.started')}: {booking?.time || booking?.date ? new Date(booking.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Navigation size={20} color={COLORS.primary} />
            <Text style={styles.detailText}>{t('tripTracking.distance')}: {distance} km</Text>
          </View>
          <View style={styles.detailItem}>
            <Clock size={20} color={COLORS.primary} />
            <Text style={styles.detailText}>{t('tripTracking.duration')}: {duration}</Text>
          </View>
        </Card>

        <Card style={styles.driverCard}>
          <View style={styles.driverInfo}>
            <Image
              source={{ uri: booking?.driver?.photo || booking?.owner?.photo || 'https://via.placeholder.com/100' }}
              style={styles.driverPhoto}
            />
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>{booking?.driver?.name || booking?.owner?.name || 'Driver'}</Text>
              <Text style={styles.driverRating}>⭐ {booking?.driver?.rating || 0} ({booking?.driver?.totalReviews || 0} {t('common.reviews')})</Text>
            </View>
          </View>
          <View style={styles.driverActions}>
            <Button
              title={t('tripTracking.call')}
              onPress={() => {}}
              variant="primary"
              size="small"
              style={styles.actionButton}
            />
            <Button
              title={t('tripTracking.message')}
              onPress={() => navigation.navigate('Chat' as never)}
              variant="outline"
              size="small"
              style={styles.actionButton}
            />
          </View>
        </Card>

        <View style={styles.emergencyContainer}>
          <Button
            title={t('tripTracking.bookFood')}
            onPress={() => {
              const fromLocation = typeof booking?.route?.from === 'object' 
                ? booking.route.from 
                : { address: booking?.route?.from || 'N/A' };
              const toLocation = typeof booking?.route?.to === 'object' 
                ? booking.route.to 
                : { address: booking?.route?.to || 'N/A' };
              
              navigation.navigate('BookFood' as never, { 
                from: fromLocation.address || fromLocation,
                to: toLocation.address || toLocation,
                fromLat: fromLocation.lat,
                fromLng: fromLocation.lng,
                toLat: toLocation.lat,
                toLng: toLocation.lng,
              } as never);
            }}
            variant="primary"
            size="medium"
            style={styles.emergencyButton}
          />
          <Button
            title={t('tripTracking.emergencyContact')}
            onPress={() => {}}
            variant="outline"
            size="medium"
            style={styles.emergencyButton}
          />
          <Button
            title={t('tripTracking.reportIssue')}
            onPress={() => {}}
            variant="outline"
            size="medium"
            style={styles.emergencyButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.xl,
  },
  headerRight: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  headerButton: {
    marginLeft: SPACING.sm,
  },
  statusBar: {
    backgroundColor: COLORS.primary + '20',
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  etaText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  mapContainer: {
    height: 300,
    backgroundColor: COLORS.lightGray,
    position: 'relative',
  },
  webView: {
    flex: 1,
    height: 300,
  },
  mapPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapMarker: {
    position: 'absolute',
    alignItems: 'center',
  },
  userMarker: {
    top: '40%',
    left: '30%',
  },
  destinationMarker: {
    bottom: '20%',
    right: '20%',
  },
  markerLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.text,
    marginTop: SPACING.xs,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mapHint: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
  },
  scrollContent: { padding: SPACING.md },
  tripDetailsCard: { padding: SPACING.md, marginBottom: SPACING.md },
  sectionTitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  detailText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  driverCard: { padding: SPACING.md, marginBottom: SPACING.md },
  driverInfo: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  driverPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  driverDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  driverName: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  driverRating: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  driverActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  emergencyContainer: {
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  emergencyButton: {
    marginBottom: SPACING.sm,
  },
});

export default TripTrackingScreen;
