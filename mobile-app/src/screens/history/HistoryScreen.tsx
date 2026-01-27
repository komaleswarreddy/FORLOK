import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ImageBackground, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Calendar, Search, Car, Key, Clock } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '@constants/theme';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { BottomTabNavigator } from '@components/navigation/BottomTabNavigator';
import { useLanguage } from '@context/LanguageContext';
import { bookingApi, rentalApi } from '@utils/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HistoryScreen = () => {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('All');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const tabs = [t('history.all'), t('history.upcoming'), t('history.past'), t('history.cancelled')];

  const loadBookings = async () => {
    try {
      setLoading(true);
      console.log('📋 Loading bookings...');

      const response = await bookingApi.getBookings();
      
      if (response.success && response.data) {
        const bookingsData = response.data.bookings || response.data || [];
        
        // Map backend booking format to UI format
        const mappedBookings = bookingsData.map((booking: any) => ({
          id: booking.bookingId || booking._id,
          bookingId: booking.bookingId || booking._id,
          type: booking.serviceType || 'pooling',
          status: booking.status || 'pending',
          date: booking.date ? new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A',
          time: booking.time || new Date(booking.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          route: booking.route ? {
            from: typeof booking.route.from === 'string' ? booking.route.from : booking.route.from?.address || 'N/A',
            to: typeof booking.route.to === 'string' ? booking.route.to : booking.route.to?.address || 'N/A',
          } : null,
          vehicle: booking.vehicle ? {
            brand: booking.vehicle.brand || 'N/A',
            number: booking.vehicle.number || 'N/A',
            type: booking.vehicle.type || 'car',
          } : null,
          driver: booking.driver || booking.owner || null,
          duration: booking.duration || null,
          amount: booking.amount || booking.totalAmount || 0,
          paymentMethod: booking.paymentMethod || 'N/A',
          paymentStatus: booking.paymentStatus || 'pending',
          passengers: booking.passengers || [],
          ...booking, // Keep original data for details screen
        }));

        setBookings(mappedBookings);
        console.log(`✅ Loaded ${mappedBookings.length} bookings`);
      } else {
        console.warn('⚠️ No bookings found:', response.error);
        setBookings([]);
      }
    } catch (error: any) {
      console.error('❌ Error loading bookings:', error);
      Alert.alert('Error', `Failed to load bookings: ${error.message || 'Unknown error'}`);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentUserId();
    loadBookings();
  }, []);

  const loadCurrentUserId = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      setCurrentUserId(userId);
    } catch (error) {
      console.error('Error loading current user ID:', error);
    }
  };

  // Reload when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadBookings();
    }, [])
  );

  const getTabKey = (tabLabel: string) => {
    // Map translated labels to keys
    if (tabLabel === t('history.all')) return 'All';
    if (tabLabel === t('history.upcoming')) return 'Upcoming';
    if (tabLabel === t('history.past')) return 'Past';
    if (tabLabel === t('history.cancelled')) return 'Cancelled';
    return tabLabel;
  };

  const filteredBookings = bookings.filter((booking) => {
    const tabKey = getTabKey(activeTab);
    if (tabKey === 'All') return true;
    if (tabKey === 'Upcoming') return booking.status === 'confirmed' || booking.status === 'pending' || booking.status === 'in_progress';
    if (tabKey === 'Past') return booking.status === 'completed';
    if (tabKey === 'Cancelled') return booking.status === 'cancelled';
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/history iamge.jpg')}
        style={styles.headerImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <BlurView intensity={50} style={styles.blurContainer}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.iconButton}
            >
              <ArrowLeft size={20} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconButton}>
                <Calendar size={20} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Search size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t('history.title')}</Text>
          </View>
        </BlurView>
      </ImageBackground>
      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading bookings...</Text>
          </View>
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <Card key={booking.id || booking.bookingId} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                {booking.type === 'pooling' ? (
                  <Car size={24} color={COLORS.primary} />
                ) : (
                  <Key size={24} color={COLORS.primary} />
                )}
                <View style={styles.bookingDateContainer}>
                  <Clock size={16} color={COLORS.textSecondary} />
                  <Text style={styles.bookingDate}>{booking.date}</Text>
                </View>
              </View>
              <Text style={styles.bookingType}>
                {booking.type === 'pooling' ? t('history.pooling') : t('history.rental')}
              </Text>
              {booking.route && (
                <Text style={styles.bookingRoute}>
                  {typeof booking.route.from === 'string' 
                    ? booking.route.from 
                    : booking.route.from?.address || 'N/A'} → {typeof booking.route.to === 'string' 
                    ? booking.route.to 
                    : booking.route.to?.address || 'N/A'}
                </Text>
              )}
              {booking.vehicle && (
                <Text style={styles.bookingVehicle}>
                  {booking.vehicle.brand} {booking.vehicle.number && `(${booking.vehicle.number})`} {booking.duration && `- ${booking.duration} hours`}
                </Text>
              )}
              <View style={styles.bookingFooter}>
                <View style={[styles.statusBadge, booking.status === 'confirmed' && styles.statusConfirmed, booking.status === 'completed' && styles.statusCompleted, booking.status === 'cancelled' && styles.statusCancelled]}>
                  <Text style={styles.statusText}>{booking.status}</Text>
                </View>
                <View style={styles.actions}>
                  <Button 
                    title={t('history.viewDetails')} 
                    onPress={() => navigation.navigate('BookingDetails' as never, { 
                      bookingId: booking.bookingId || booking.id,
                      booking: booking 
                    } as never)} 
                    variant="outline" 
                    size="small" 
                    style={styles.detailsButton} 
                  />
                  {booking.status === 'completed' && (
                    <Button 
                      title={t('history.rate')} 
                      onPress={() => navigation.navigate('Rating' as never, { booking } as never)} 
                      variant="primary" 
                      size="small" 
                      style={styles.rateButton} 
                    />
                  )}
                </View>
              </View>
            </Card>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bookings found</Text>
            <Text style={styles.emptySubtext}>
              {activeTab === t('history.all')
                ? 'You haven\'t made any bookings yet'
                : `No ${activeTab.toLowerCase()} bookings`}
            </Text>
          </View>
        )}
      </ScrollView>
      <BottomTabNavigator />
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
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.sm,
  },
  headerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xl,
    color: COLORS.white,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: { flexDirection: 'row', backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, padding: SPACING.md, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: COLORS.primary },
  tabText: { fontFamily: FONTS.regular, fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  activeTabText: { color: COLORS.primary, fontWeight: 'bold' },
  scrollContent: { padding: SPACING.md },
  bookingCard: { padding: SPACING.md, marginBottom: SPACING.md },
  bookingHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  bookingDateContainer: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  bookingDate: { fontFamily: FONTS.regular, fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  bookingType: { fontFamily: FONTS.regular, fontSize: FONTS.sizes.md, color: COLORS.text, marginBottom: SPACING.xs },
  bookingRoute: { fontFamily: FONTS.regular, fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  bookingVehicle: { fontFamily: FONTS.regular, fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  bookingFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.sm },
  statusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: 4 },
  statusConfirmed: { backgroundColor: COLORS.secondary + '20' },
  statusCompleted: { backgroundColor: COLORS.success + '20' },
  statusCancelled: { backgroundColor: COLORS.error + '20' },
  statusText: { fontFamily: FONTS.regular, fontSize: FONTS.sizes.xs, color: COLORS.text, textTransform: 'capitalize' },
  actions: { flexDirection: 'row', gap: SPACING.xs },
  detailsButton: { marginRight: SPACING.xs },
  rateButton: {},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  loadingText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
});

export default HistoryScreen;

