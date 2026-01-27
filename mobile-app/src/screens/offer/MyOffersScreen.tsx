import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Plus, Car, AlertCircle, X, Clock, MessageCircle } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '@constants/theme';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { useLanguage } from '@context/LanguageContext';
import { poolingApi, rentalApi } from '@utils/apiClient';

// Component to check if trip can be started based on time
const StartTripButton = ({ offer, onPress }: { offer: any; onPress: () => void }) => {
  const [canStart, setCanStart] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Don't show button if offer is completed
  if (offer.status === 'completed') {
    return null;
  }

  useEffect(() => {
    const checkTime = () => {
      // Don't allow starting if offer is completed
      if (offer.status === 'completed') {
        setCanStart(false);
        return;
      }

      if (!offer.date || !offer.time) {
        setCanStart(false);
        return;
      }

      const now = new Date();
      const offerDate = new Date(offer.date);
      const offerTime = offer.time; // Format: "9:00 AM" or "09:00"

      // Parse offer time
      const timeMatch = offerTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (!timeMatch) {
        setCanStart(false);
        return;
      }

      let offerHour = parseInt(timeMatch[1]);
      const offerMinute = parseInt(timeMatch[2]);
      const ampm = timeMatch[3]?.toUpperCase();

      // Convert to 24-hour format
      if (ampm === 'PM' && offerHour !== 12) {
        offerHour += 12;
      } else if (ampm === 'AM' && offerHour === 12) {
        offerHour = 0;
      }

      // Set offer date and time
      offerDate.setHours(offerHour, offerMinute, 0, 0);

      // Check if current time is at or after offer time (allow 5 minutes buffer)
      const timeDifference = now.getTime() - offerDate.getTime();
      const fiveMinutesInMs = 5 * 60 * 1000;

      if (timeDifference >= -fiveMinutesInMs) {
        setCanStart(true);
        setTimeRemaining('');
      } else {
        setCanStart(false);
        const minutesUntilStart = Math.ceil(-timeDifference / (60 * 1000));
        const hours = Math.floor(minutesUntilStart / 60);
        const minutes = minutesUntilStart % 60;
        if (hours > 0) {
          setTimeRemaining(`${hours}h ${minutes}m`);
        } else {
          setTimeRemaining(`${minutes}m`);
        }
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [offer.date, offer.time]);

  return (
    <View style={styles.startTripContainer}>
      <Button
        title={canStart ? "Start Trip" : `Start at ${offer.time}`}
        onPress={onPress}
        variant={canStart ? "primary" : "outline"}
        size="small"
        style={[styles.actionButton, !canStart && styles.disabledButton]}
        disabled={!canStart}
        icon={!canStart && <Clock size={16} color={COLORS.textSecondary} />}
      />
      {!canStart && timeRemaining && (
        <Text style={styles.timeRemainingText}>Wait {timeRemaining}</Text>
      )}
    </View>
  );
};

const MyOffersScreen = () => {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('All');
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [myOffers, setMyOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = [t('common.all'), t('myOffers.active'), t('myOffers.pending'), t('myOffers.expired')];

  const loadOffers = async () => {
    try {
      setLoading(true);
      const [poolingResponse, rentalResponse] = await Promise.all([
        poolingApi.getOffers(),
        rentalApi.getOffers(),
      ]);

      const offers: any[] = [];

      if (poolingResponse.success && poolingResponse.data) {
        const poolingOffers = Array.isArray(poolingResponse.data) ? poolingResponse.data : [];
        // Load booking counts for each pooling offer
        const bookingApi = (await import('@utils/apiClient')).bookingApi;
        const poolingOffersWithBookings = await Promise.all(
          poolingOffers.map(async (offer: any) => {
            let actualBookedSeats = 0;
            try {
              // Fetch actual bookings to get accurate seat count
              const bookingsResponse = await bookingApi.getAllBookingsByOffer(offer.offerId || offer._id, 'pooling');
              if (bookingsResponse.success && bookingsResponse.data) {
                const bookingsList = Array.isArray(bookingsResponse.data) 
                  ? bookingsResponse.data 
                  : [];
                // Count only confirmed, pending, or in_progress bookings (exclude cancelled)
                actualBookedSeats = bookingsList.filter((b: any) => 
                  b.status !== 'cancelled' && b.status !== 'completed'
                ).length;
              }
            } catch (error) {
              console.warn('Failed to load bookings for pooling offer:', offer.offerId, error);
              // Fallback to calculation if API fails
              actualBookedSeats = (offer.totalSeats || 0) - (offer.availableSeats || 0);
            }
            
            return {
              id: offer.offerId || offer._id,
              type: 'pooling',
              offerId: offer.offerId || offer._id,
              route: {
                from: offer.route?.from?.address || 'Unknown',
                to: offer.route?.to?.address || 'Unknown',
              },
              date: offer.date ? new Date(offer.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A',
              time: offer.time || new Date(offer.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              status: offer.status || 'active',
              seatsBooked: actualBookedSeats,
              totalSeats: offer.totalSeats || 0,
              ...offer,
            };
          })
        );
        offers.push(...poolingOffersWithBookings);
      }

      if (rentalResponse.success && rentalResponse.data) {
        const rentalOffers = Array.isArray(rentalResponse.data) ? rentalResponse.data : [];
        // Load booking counts for each rental offer
        const bookingApi = (await import('@utils/apiClient')).bookingApi;
        const offersWithBookings = await Promise.all(
          rentalOffers.map(async (offer: any) => {
            let totalBookings = 0;
            try {
              // Use getAllBookingsByOffer to get all bookings for accurate count
              const bookingsResponse = await bookingApi.getAllBookingsByOffer(offer.offerId || offer._id, 'rental');
              if (bookingsResponse.success && bookingsResponse.data) {
                const bookingsList = Array.isArray(bookingsResponse.data) 
                  ? bookingsResponse.data 
                  : [];
                totalBookings = bookingsList.length; // Already filtered to exclude cancelled
              }
            } catch (error) {
              console.warn('Failed to load bookings for offer:', offer.offerId, error);
            }
            
            return {
            id: offer.offerId || offer._id,
            type: 'rental',
            offerId: offer.offerId || offer._id,
              vehicle: {
                brand: offer.vehicle?.brand || 'Unknown',
                vehicleModel: offer.vehicle?.vehicleModel || offer.vehicle?.model || '',
                type: offer.vehicle?.type || 'car',
                photos: offer.vehicle?.photos || [],
                displayName: `${offer.vehicle?.brand || 'Unknown'} ${offer.vehicle?.vehicleModel || offer.vehicle?.model || ''}`,
              },
            duration: offer.duration || 'N/A',
            date: offer.date ? new Date(offer.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A',
            time: offer.time || new Date(offer.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              status: totalBookings > 0 ? 'booked' : (offer.status || 'active'),
              totalBookings: totalBookings,
            bookedBy: offer.bookedBy || null,
            ...offer,
            };
          })
        );
        offers.push(...offersWithBookings);
      }

      // Filter out completed offers - they should only appear in History
      const activeOffers = offers.filter((offer) => offer.status !== 'completed');
      
      setMyOffers(activeOffers);
      console.log(`✅ Loaded ${activeOffers.length} active offers (filtered out ${offers.length - activeOffers.length} completed) out of ${offers.length} total`);
    } catch (error: any) {
      console.error('❌ Error loading offers:', error);
      Alert.alert('Error', `Failed to load offers: ${error.message || 'Unknown error'}`);
      setMyOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  // Reload offers when screen comes into focus (to catch status changes like completed)
  useFocusEffect(
    React.useCallback(() => {
      loadOffers();
    }, [])
  );

  const filteredOffers = myOffers.filter((offer) => {
    // Completed offers are already filtered out in loadOffers, but double-check here
    if (offer.status === 'completed') return false;
    
    if (activeTab === 'All') return true;
    if (activeTab === 'Active') return offer.status === 'active';
    if (activeTab === 'Pending') return offer.status === 'pending';
    if (activeTab === 'Expired') return offer.status === 'expired';
    return offer.status === activeTab.toLowerCase();
  });

  const handleView = (offer: any) => {
    if (offer.type === 'pooling') {
      navigation.navigate('PoolingDetails' as never, { offer } as never);
    } else {
      // Navigate to rental management screen for owners
      navigation.navigate('OwnerRentalManagement' as never, { offerId: offer.offerId, offer } as never);
    }
  };

  const handleEdit = (offer: any) => {
    if (offer.type === 'pooling') {
      navigation.navigate('CreatePoolingOffer' as never, { offer } as never);
    } else {
      navigation.navigate('CreateRentalOffer' as never, { offer } as never);
    }
  };

  const handleCancelPress = (offer: any) => {
    setSelectedOffer(offer);
    setCancelModalVisible(true);
  };

  const handleCancelConfirm = () => {
    // Mock cancel functionality
    setCancelModalVisible(false);
    const offerType = selectedOffer?.type === 'pooling' ? t('myOffers.pooling') : t('myOffers.rental');
    Alert.alert(
      t('myOffers.cancelled'),
      t('myOffers.offerCancelled', { type: offerType }),
      [{ text: t('common.ok') }]
    );
    setSelectedOffer(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('myOffers.title')}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ChatList' as never)}
            style={styles.headerIconButton}
          >
            <MessageCircle size={22} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('OfferServices' as never)}
            style={styles.headerIconButton}
          >
            <Plus size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[styles.tabText, activeTab === tab && styles.activeTabText]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading offers...</Text>
          </View>
        ) : filteredOffers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('myOffers.noOffers')}</Text>
            <Button
              title={t('myOffers.createOffer')}
              onPress={() => navigation.navigate('OfferServices' as never)}
              variant="primary"
              size="medium"
              style={styles.createButton}
            />
          </View>
        ) : (
          filteredOffers.map((offer) => (
            <TouchableOpacity 
              key={offer.id} 
              onPress={() => handleView(offer)}
              activeOpacity={0.7}
            >
            <Card style={styles.offerCard}>
              <View style={styles.offerHeader}>
                {offer.type === 'pooling' ? (
                  <Car size={24} color={COLORS.primary} />
                ) : (
                  <Car size={24} color={COLORS.primary} />
                )}
                <Text style={styles.offerType}>
                  {offer.type === 'pooling' ? t('myOffers.pooling') : t('myOffers.rental')}
                </Text>
              </View>

              {/* Vehicle Image for Rental Offers */}
              {offer.type === 'rental' && offer.vehicle && (
                <Image 
                  source={{ 
                    uri: (offer.vehicle.photos && (offer.vehicle.photos.front || offer.vehicle.photos[0] || (Array.isArray(offer.vehicle.photos) ? offer.vehicle.photos[0] : ''))) ||
                         (offer.vehicle?.type === 'bike' 
                           ? 'https://images.unsplash.com/photo-1558980664-769d59546b3b?w=400&h=300&fit=crop'
                           : 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop')
                  }} 
                  style={styles.vehicleImage}
                  resizeMode="cover"
                />
              )}

              {offer.type === 'pooling' && offer.route && (
                <>
                  <Text style={styles.offerRoute}>
                    {typeof offer.route?.from === 'string' 
                      ? offer.route.from 
                      : offer.route?.from?.address || 'Unknown'} → {typeof offer.route?.to === 'string' 
                      ? offer.route.to 
                      : offer.route?.to?.address || 'Unknown'}
                  </Text>
                  <Text style={styles.offerDateTime}>
                    {offer.date}, {offer.time}
                  </Text>
                  {offer.status === 'active' && (
                    <Text style={styles.seatsText}>
                      {t('myOffers.seats')}: {offer.seatsBooked}/{offer.totalSeats} {t('myOffers.booked')}
                    </Text>
                  )}
                </>
              )}

              {offer.type === 'rental' && (
                <>
                  {/* Vehicle Image - Always show, use vehicle photos or fallback to internet image */}
                  <Image 
                    source={{ 
                      uri: (offer.vehicle?.photos && (
                        (Array.isArray(offer.vehicle.photos) && offer.vehicle.photos.length > 0 && offer.vehicle.photos[0]) ||
                        offer.vehicle.photos.front ||
                        offer.vehicle.photos[0]
                      )) ||
                      (offer.vehicle?.type === 'bike' 
                        ? 'https://images.unsplash.com/photo-1558980664-769d59546b3b?w=400&h=300&fit=crop'
                        : 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop')
                    }} 
                    style={styles.vehicleImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.offerVehicle}>
                    {offer.vehicle?.displayName || `${offer.vehicle?.brand || 'Unknown'} ${offer.vehicle?.vehicleModel || offer.vehicle?.model || ''}`}
                  </Text>
                  <Text style={styles.offerDateTime}>
                    {offer.date ? new Date(offer.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}, {offer.availableFrom || 'N/A'} - {offer.availableUntil || 'N/A'}
                  </Text>
                  {offer.totalBookings !== undefined && offer.totalBookings > 0 && (
                    <View style={styles.bookingCountContainer}>
                      <Text style={styles.bookingCountText}>
                        {offer.totalBookings} booking{offer.totalBookings !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  )}
                  {offer.status === 'booked' && offer.bookedBy && (
                    <Text style={styles.bookedByText}>
                      {t('myOffers.bookedBy')}: {offer.bookedBy}
                    </Text>
                  )}
                </>
              )}

              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    offer.status === 'active' && styles.statusActive,
                    offer.status === 'booked' && styles.statusBooked,
                    offer.status === 'completed' && styles.statusCompleted,
                  ]}
                >
                  <Text style={styles.statusText}>{offer.status}</Text>
                </View>
              </View>

              <View style={styles.actionsContainer}>
                {/* Chat button for both pooling and rental offers when there are bookings */}
                {(offer.seatsBooked > 0 || offer.totalBookings > 0) && (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ChatList' as never)}
                    style={styles.chatButton}
                  >
                    <MessageCircle size={18} color={COLORS.primary} />
                    <Text style={styles.chatButtonText}>Chat</Text>
                  </TouchableOpacity>
                )}
                
                {/* Only show StartTripButton for pooling offers */}
                {offer.type === 'pooling' && (offer.status === 'active' || offer.status === 'booked' || offer.status === 'pending') && (
                  <StartTripButton
                    offer={offer}
                    onPress={() => {
                      navigation.navigate('DriverTrip' as never, { 
                        offerId: offer.offerId,
                        offer: offer 
                      } as never);
                    }}
                  />
                )}
                {/* For rental offers, card is tappable to navigate to management screen */}
                {offer.type === 'rental' && offer.totalBookings > 0 && (
                  <Button
                    title="Manage Bookings"
                    onPress={() => handleView(offer)}
                    variant="primary"
                    size="small"
                    style={styles.actionButton}
                  />
                )}
              </View>
            </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setCancelModalVisible(false)}
            >
              <X size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <View style={styles.modalIcon}>
              <AlertCircle size={48} color={COLORS.error} />
            </View>

            <Text style={styles.modalTitle}>{t('myOffers.cancelOffer')}</Text>
            <Text style={styles.modalMessage}>
              {t('myOffers.cancelConfirmMessage', { type: selectedOffer?.type === 'pooling' ? t('myOffers.pooling') : t('myOffers.rental') })}
              {'\n\n'}
              {t('myOffers.cannotUndo')}
            </Text>

            <View style={styles.modalButtons}>
              <Button
                title={t('myOffers.noKeepIt')}
                onPress={() => setCancelModalVisible(false)}
                variant="outline"
                size="medium"
                style={styles.modalButton}
              />
              <Button
                title={t('myOffers.yesCancel')}
                onPress={handleCancelConfirm}
                variant="primary"
                size="medium"
                style={[styles.modalButton, styles.confirmCancelButton]}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    paddingTop: SPACING.xl + 8,
    backgroundColor: COLORS.primary,
    ...SHADOWS.md,
  },
  headerTitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xl,
    color: COLORS.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  headerIconButton: {
    padding: SPACING.xs,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.xs,
    ...SHADOWS.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    marginHorizontal: SPACING.xs,
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  scrollContent: { 
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  offerCard: { 
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    ...SHADOWS.md,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  offerType: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  offerRoute: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: 22,
    fontWeight: '500',
  },
  offerVehicle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  offerDateTime: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  seatsText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    fontWeight: '600',
    backgroundColor: `${COLORS.primary}10`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  bookedByText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  statusContainer: {
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.round,
  },
  statusActive: {
    backgroundColor: `${COLORS.success}20`,
  },
  statusBooked: {
    backgroundColor: `${COLORS.secondary}20`,
  },
  statusCompleted: {
    backgroundColor: `${COLORS.primary}20`,
  },
  statusText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.text,
    textTransform: 'capitalize',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flex: 1,
    ...SHADOWS.sm,
  },
  cancelButton: {
    borderColor: COLORS.error,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    minHeight: 400,
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  createButton: {
    minWidth: 200,
    ...SHADOWS.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    minHeight: 400,
  },
  loadingText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    padding: SPACING.xs,
    zIndex: 1,
  },
  modalIcon: {
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  modalTitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xl,
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  modalMessage: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    ...SHADOWS.sm,
  },
  confirmCancelButton: {
    backgroundColor: COLORS.error,
  },
  startTripContainer: {
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  timeRemainingText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  vehicleImage: {
    width: '100%',
    height: 180,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.lightGray,
  },
  bookingCountContainer: {
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },
  bookingCountText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  chatButtonText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default MyOffersScreen;
