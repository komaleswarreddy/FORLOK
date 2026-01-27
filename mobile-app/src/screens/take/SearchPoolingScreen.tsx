import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ImageBackground, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Search, Filter, Car, Bike, Star, MapPin, Calendar, ArrowRight } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS, SPACING, SHADOWS, BORDER_RADIUS } from '@constants/theme';
import { Card } from '@components/common/Card';
import { Button as CustomButton } from '@components/common/Button';
import { Input } from '@components/common/Input';
import { useLanguage } from '@context/LanguageContext';
import { poolingApi } from '@utils/apiClient';
import { LocationData } from '@components/common/LocationPicker';

interface RouteParams {
  from?: LocationData;
  to?: LocationData;
  date?: string;
}

const SearchPoolingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useLanguage();
  const params = (route.params as RouteParams) || {};
  
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fromLocation, setFromLocation] = useState<LocationData | null>(params.from || null);
  const [toLocation, setToLocation] = useState<LocationData | null>(params.to || null);
  const [date, setDate] = useState(params.date || new Date().toISOString().split('T')[0]);

  const loadOffers = async () => {
    if (!fromLocation || !toLocation) {
      Alert.alert('Missing Information', 'Please select both From and To locations');
      return;
    }

    // Validate coordinates are present
    if (!fromLocation.lat || !fromLocation.lng || !toLocation.lat || !toLocation.lng) {
      Alert.alert('Invalid Location', 'Please select valid locations with coordinates');
      console.error('❌ Missing coordinates:', { fromLocation, toLocation });
      return;
    }

    try {
      setLoading(true);
      
      // Ensure coordinates are numbers
      const fromLat = typeof fromLocation.lat === 'number' ? fromLocation.lat : parseFloat(String(fromLocation.lat));
      const fromLng = typeof fromLocation.lng === 'number' ? fromLocation.lng : parseFloat(String(fromLocation.lng));
      const toLat = typeof toLocation.lat === 'number' ? toLocation.lat : parseFloat(String(toLocation.lat));
      const toLng = typeof toLocation.lng === 'number' ? toLocation.lng : parseFloat(String(toLocation.lng));

      if (isNaN(fromLat) || isNaN(fromLng) || isNaN(toLat) || isNaN(toLng)) {
        Alert.alert('Invalid Coordinates', 'Location coordinates are invalid. Please reselect locations.');
        console.error('❌ Invalid coordinates:', { fromLat, fromLng, toLat, toLng });
        return;
      }

      console.log('🔍 Searching pools with coordinates:', {
        from: { address: fromLocation.address, lat: fromLat, lng: fromLng },
        to: { address: toLocation.address, lat: toLat, lng: toLng },
        date,
      });

      const response = await poolingApi.searchOffers({
        fromLat,
        fromLng,
        toLat,
        toLng,
        date: date || undefined, // Pass date string directly
      });
      
      if (response.success && response.data) {
        const offersData = response.data.offers || response.data || [];
        setOffers(offersData);
        console.log(`✅ Loaded ${offersData.length} pooling offers`);
      } else {
        console.warn('⚠️ No offers found:', response.error);
        setOffers([]);
        Alert.alert('No Results', 'No pooling offers found for this route. Try different locations.');
      }
    } catch (error: any) {
      console.error('❌ Error loading offers:', error);
      Alert.alert('Error', `Failed to load offers: ${error.message || 'Unknown error'}`);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFromLocation = () => {
    navigation.navigate('LocationPicker' as never, {
      title: 'Select From Location',
      onLocationSelect: (location: LocationData) => {
        setFromLocation(location);
        setOffers([]); // Clear offers when location changes
      },
    } as never);
  };

  const handleSelectToLocation = () => {
    navigation.navigate('LocationPicker' as never, {
      title: 'Select To Location',
      onLocationSelect: (location: LocationData) => {
        setToLocation(location);
        setOffers([]); // Clear offers when location changes
      },
    } as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/pooling search.jpg')}
        style={styles.headerImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <BlurView intensity={50} style={styles.blurContainer}>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={[styles.iconButton, styles.backButton]}
            >
              <ArrowLeft size={20} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.quotationContainer}>
              <Text style={styles.quotationText}>
                {t('searchPooling.quotation')}
              </Text>
            </View>
          </View>
        </BlurView>
      </ImageBackground>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Location Selection Card */}
        <View style={styles.searchCard}>
          <Text style={styles.searchCardTitle}>Search Pooling Offers</Text>
          
          <TouchableOpacity onPress={handleSelectFromLocation} activeOpacity={0.7}>
            <Input
              label={t('dashboard.from')}
              value={fromLocation?.address || ''}
              placeholder="Select pickup location"
              editable={false}
              containerStyle={styles.locationInput}
              leftIcon={<MapPin size={20} color={COLORS.primary} />}
            />
          </TouchableOpacity>

          <View style={styles.arrowDivider}>
            <ArrowRight size={18} color={COLORS.textSecondary} />
          </View>

          <TouchableOpacity onPress={handleSelectToLocation} activeOpacity={0.7}>
            <Input
              label={t('dashboard.to')}
              value={toLocation?.address || ''}
              placeholder="Select destination"
              editable={false}
              containerStyle={styles.locationInput}
              leftIcon={<MapPin size={20} color={COLORS.primary} />}
            />
          </TouchableOpacity>

          <View style={styles.dateContainer}>
            <Calendar size={18} color={COLORS.textSecondary} />
            <Text style={styles.dateText}>
              {new Date(date).toLocaleDateString('en-IN', { 
                weekday: 'short',
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })}
            </Text>
          </View>

          {/* Search Button */}
          <CustomButton
            title={loading ? 'Searching...' : 'Search Offers'}
            onPress={loadOffers}
            variant="primary"
            size="large"
            style={styles.searchButton}
            disabled={loading || !fromLocation || !toLocation}
          />
        </View>

        {/* Results Header */}
        {fromLocation && toLocation && (
          <View style={styles.resultsHeader}>
            <View style={styles.resultsHeaderLeft}>
              <Text style={styles.resultsCount}>
                {loading 
                  ? 'Searching...' 
                  : offers.length > 0 
                    ? `Found ${offers.length} ${offers.length === 1 ? 'pool' : 'pools'}`
                    : 'No pools found'}
              </Text>
              {offers.length > 0 && (
                <Text style={styles.resultsSubtext}>
                  {fromLocation.address.split(',')[0]} → {toLocation.address.split(',')[0]}
                </Text>
              )}
            </View>
            {offers.length > 0 && (
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => navigation.navigate('Filter' as never)}
              >
                <Filter size={20} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Searching for pooling offers...</Text>
          </View>
        ) : offers.length > 0 ? (
          offers.map((offer) => (
            <Card key={offer.offerId || offer._id} style={styles.offerCard}>
              <View style={styles.offerHeader}>
                {offer.vehicle?.type?.toLowerCase() === 'car' ? (
                  <Car size={24} color={COLORS.primary} />
                ) : (
                  <Bike size={24} color={COLORS.primary} />
                )}
                <Text style={styles.timeText}>
                  {offer.time || new Date(offer.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Text style={styles.driverName}>
                {offer.driver?.name || offer.driverId || 'Driver'}
              </Text>
              <View style={styles.ratingContainer}>
                <Star size={16} color={COLORS.warning} fill={COLORS.warning} />
                <Text style={styles.ratingText}>
                  {offer.driver?.rating || 0} ({offer.driver?.totalReviews || 0} {t('common.reviews')})
                </Text>
              </View>
              <Text style={styles.seatsText}>
                {t('searchPooling.available')}: {offer.availableSeats || 0} {t('searchPooling.seats')}
              </Text>
              <Text style={styles.priceText}>₹{offer.price || 0} {t('searchPooling.perPerson')}</Text>
              <CustomButton 
                title={t('searchPooling.viewDetails')} 
                onPress={() => navigation.navigate('PoolingDetails' as never, { 
                  offerId: offer.offerId || offer._id, 
                  offer,
                  passengerRoute: {
                    from: fromLocation,
                    to: toLocation,
                  }
                } as never)} 
                variant="primary" 
                size="small" 
                style={styles.detailsButton} 
              />
            </Card>
          ))
        ) : fromLocation && toLocation && !loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No pooling offers found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search criteria or selecting different locations</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerImage: {
    width: '100%',
    height: 200,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary,
    opacity: 0.6,
  },
  blurContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    height: '100%',
    position: 'relative',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: SPACING.md,
    top: SPACING.xl,
  },
  quotationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  quotationText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '100%',
  },
  scrollContent: { padding: SPACING.md },
  searchCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  searchCardTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    fontWeight: '600',
  },
  locationInput: {
    marginBottom: SPACING.md,
  },
  arrowDivider: {
    alignItems: 'center',
    marginVertical: SPACING.xs,
    marginLeft: SPACING.md,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  dateText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  searchButton: {
    marginTop: SPACING.sm,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  resultsHeaderLeft: {
    flex: 1,
  },
  resultsCount: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  resultsSubtext: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerCard: { marginBottom: SPACING.md, padding: SPACING.md },
  offerHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  timeText: { fontFamily: FONTS.regular, fontSize: FONTS.sizes.md, color: COLORS.text, fontWeight: 'bold' },
  driverName: { fontFamily: FONTS.regular, fontSize: FONTS.sizes.md, color: COLORS.text, marginBottom: SPACING.xs },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.xs },
  ratingText: { fontFamily: FONTS.regular, fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  seatsText: { fontFamily: FONTS.regular, fontSize: FONTS.sizes.sm, color: COLORS.text, marginBottom: SPACING.xs },
  priceText: { fontFamily: FONTS.regular, fontSize: FONTS.sizes.md, color: COLORS.primary, fontWeight: 'bold', marginBottom: SPACING.sm },
  detailsButton: { marginTop: SPACING.xs },
  loadMore: { alignItems: 'center', padding: SPACING.md },
  loadMoreText: { fontFamily: FONTS.regular, fontSize: FONTS.sizes.md, color: COLORS.primary },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
});

export default SearchPoolingScreen;

