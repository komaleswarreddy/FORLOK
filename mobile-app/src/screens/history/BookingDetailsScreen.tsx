import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Share2, Settings, MapPin, Calendar, Clock, Phone, MessageCircle, Car, Tag, User, CreditCard, IndianRupee, ArrowDown, Star, CheckCircle } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS, SPACING, SHADOWS, BORDER_RADIUS } from '@constants/theme';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { useLanguage } from '@context/LanguageContext';
import { bookingApi } from '@utils/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BookingDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useLanguage();
  const params = route.params as any;
  const passedBooking = params?.booking;
  const bookingId = params?.bookingId || passedBooking?.bookingId || passedBooking?.id;
  
  const [booking, setBooking] = useState<any>(passedBooking || null);
  const [loading, setLoading] = useState(!!bookingId && !passedBooking);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentUserId();
    // Always load booking from backend to ensure renter info is populated
    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  const loadCurrentUserId = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      setCurrentUserId(userId);
    } catch (error) {
      console.error('Error loading current user ID:', error);
    }
  };

  const loadBooking = async () => {
    if (!bookingId) return;

    try {
      setLoading(true);
      console.log('📋 Loading booking details:', bookingId);

      const response = await bookingApi.getBooking(bookingId);
      
      if (response.success && response.data) {
        const bookingData = response.data;
        
        // Map backend format to UI format
        const mappedBooking = {
          id: bookingData.bookingId || bookingData._id,
          bookingId: bookingData.bookingId || bookingData._id,
          bookingNumber: bookingData.bookingNumber || bookingData.bookingId,
          type: bookingData.serviceType || 'pooling',
          serviceType: bookingData.serviceType || 'pooling',
          status: bookingData.status || 'pending',
          date: bookingData.date ? new Date(bookingData.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A',
          time: bookingData.time || (bookingData.startTime ? bookingData.startTime : new Date(bookingData.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })),
          startTime: bookingData.startTime || null,
          endTime: bookingData.endTime || null,
          route: bookingData.route ? {
            from: typeof bookingData.route.from === 'string' ? bookingData.route.from : bookingData.route.from?.address || 'N/A',
            to: typeof bookingData.route.to === 'string' ? bookingData.route.to : bookingData.route.to?.address || 'N/A',
          } : null,
          location: bookingData.location || null,
          vehicle: bookingData.vehicle ? {
            brand: bookingData.vehicle.brand || 'N/A',
            number: bookingData.vehicle.number || 'N/A',
            type: bookingData.vehicle.type || 'car',
            model: bookingData.vehicle.vehicleModel || bookingData.vehicle.model || null,
          } : null,
          driver: bookingData.driver || null,
          owner: bookingData.owner || null,
          renter: bookingData.renter || null, // Renter info if populated
          userId: bookingData.userId || null, // Renter's userId
          duration: bookingData.duration || null,
          amount: bookingData.amount || 0,
          totalAmount: bookingData.totalAmount || bookingData.amount || 0,
          platformFee: bookingData.platformFee || 0,
          paymentMethod: bookingData.paymentMethod || 'N/A',
          paymentStatus: bookingData.paymentStatus || 'pending',
          passengers: bookingData.passengers || [],
          rentalOfferId: bookingData.rentalOfferId || null,
          poolingOfferId: bookingData.poolingOfferId || null,
          ...bookingData, // Keep original data
        };

        // If renter info is missing, try to fetch from conversation (like ChatScreen does)
        if (mappedBooking.serviceType === 'rental' && !mappedBooking.renter && mappedBooking.bookingId) {
          try {
            const chatApi = (await import('@utils/apiClient')).chatApi;
            const convResponse = await chatApi.getConversationByBooking(mappedBooking.bookingId);
            if (convResponse.success && convResponse.data && convResponse.data.participants) {
              // Find renter participant (role === 'renter')
              const renterParticipant = convResponse.data.participants.find(
                (p: any) => p.role === 'renter'
              );
              if (renterParticipant) {
                mappedBooking.renter = {
                  userId: renterParticipant.userId,
                  name: renterParticipant.name,
                  photo: renterParticipant.photo,
                  rating: renterParticipant.rating,
                  totalReviews: renterParticipant.totalReviews,
                };
                mappedBooking.user = renterParticipant; // Also set as user for compatibility
                console.log('✅ Fetched renter info from conversation:', renterParticipant);
              }
            }
          } catch (error) {
            console.warn('⚠️ Failed to fetch renter info from conversation:', error);
          }
        }

        setBooking(mappedBooking);
        console.log('✅ Loaded booking details:', mappedBooking);
        console.log('🔍 Renter info:', mappedBooking.renter);
        console.log('🔍 User info:', mappedBooking.user);
        console.log('🔍 Owner info:', mappedBooking.owner);
      } else {
        Alert.alert('Error', response.error || 'Failed to load booking details');
        navigation.goBack();
      }
    } catch (error: any) {
      console.error('❌ Error loading booking:', error);
      Alert.alert('Error', `Failed to load booking: ${error.message || 'Unknown error'}`);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading booking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>Booking not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Ensure vehicle properties exist with fallbacks
  const vehicleBrand = booking.vehicle?.brand || 'Vehicle';
  const vehicleNumber = booking.vehicle?.number || 'N/A';
  const isRental = booking.serviceType === 'rental' || booking.type === 'rental';
  
  // Determine user role for rental bookings
  const isOwner = isRental && currentUserId && booking.owner?.userId === currentUserId;
  const isRenter = isRental && currentUserId && booking.userId === currentUserId;
  
  // Get button text based on service type and user role
  const getMessageButtonText = () => {
    if (isRental) {
      if (isOwner) return 'Message Renter';
      if (isRenter) return 'Message Owner';
      return 'Message Owner'; // Default fallback
    }
    return 'Message Driver'; // For pooling
  };

  const formatTime = (timeStr?: string): string => {
    if (!timeStr) return 'N/A';
    // Handle both HH:mm and 12-hour formats
    const ampmMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (ampmMatch) {
      return timeStr; // Already formatted
    }
    // Convert HH:mm to 12-hour format
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/booking details.jpg')}
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
              <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
                <Share2 size={20} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
                <Settings size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t('bookingDetails.title')}</Text>
          </View>
        </BlurView>
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Booking Header Card */}
        <View style={styles.bookingHeaderCard}>
          <View style={styles.bookingIdContainer}>
            <Text style={styles.bookingIdLabel}>{t('bookingDetails.bookingId')}</Text>
            <Text style={styles.bookingId}>{booking.bookingId || 'N/A'}</Text>
          </View>
          <View style={[
            styles.statusBadge, 
            booking.status === 'confirmed' && styles.statusConfirmed, 
            booking.status === 'completed' && styles.statusCompleted, 
            booking.status === 'cancelled' && styles.statusCancelled
          ]}>
            <Text style={styles.statusText}>{booking.status?.toUpperCase() || 'N/A'}</Text>
          </View>
        </View>

        {/* Service Type, Date & Time Flags */}
        <View style={styles.flagsContainer}>
          <View style={styles.flagBadge}>
            <Tag size={16} color={COLORS.primary} />
            <Text style={styles.flagText}>
              {booking.type === 'pooling' ? t('history.pooling') : t('history.rental')}
            </Text>
          </View>
          {booking.date && (
            <View style={styles.flagBadge}>
              <Calendar size={16} color={COLORS.primary} />
              <Text style={styles.flagText}>{booking.date}</Text>
            </View>
          )}
          {booking.time && (
            <View style={styles.flagBadge}>
              <Clock size={16} color={COLORS.primary} />
              <Text style={styles.flagText}>{booking.time}</Text>
            </View>
          )}
        </View>

        {/* Route Card (Pooling) or Rental Details Card */}
        {isRental ? (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Car size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Rental Details</Text>
            </View>
            <View style={styles.divider} />
            {booking.startTime && booking.endTime && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Clock size={18} color={COLORS.primary} />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Rental Period</Text>
                  <Text style={styles.detailValue}>
                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                  </Text>
                </View>
              </View>
            )}
            {booking.duration && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Clock size={18} color={COLORS.primary} />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Duration</Text>
                  <Text style={styles.detailValue}>{booking.duration} hours</Text>
                </View>
              </View>
            )}
            {(booking.location?.address || booking.route?.from?.address) && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <MapPin size={18} color={COLORS.primary} />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Pickup Location</Text>
                  <Text style={styles.detailValue}>
                    {booking.location?.address || booking.route?.from?.address || 'N/A'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        ) : (
          booking.route && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <MapPin size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>{t('bookingDetails.route')}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.routeFrom}>
                <View style={styles.routeIconContainer}>
                  <MapPin size={18} color={COLORS.primary} />
                </View>
                <View style={styles.routeInfo}>
                  <Text style={styles.routeLabel}>{t('dashboard.from')}</Text>
                  <Text style={styles.routeText}>
                    {typeof booking.route?.from === 'string' 
                      ? booking.route.from 
                      : booking.route?.from?.address || 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.arrowContainer}>
                <ArrowDown size={24} color={COLORS.primary} />
              </View>
              <View style={styles.routeTo}>
                <View style={styles.routeIconContainer}>
                  <MapPin size={18} color={COLORS.primary} />
                </View>
                <View style={styles.routeInfo}>
                  <Text style={styles.routeLabel}>{t('dashboard.to')}</Text>
                  <Text style={styles.routeText}>
                    {typeof booking.route?.to === 'string' 
                      ? booking.route.to 
                      : booking.route?.to?.address || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          )
        )}


        {/* Driver/Owner/Renter Information Card */}
        {(booking.driver || booking.owner || (isRental && isOwner)) && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <User size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>
                {isRental 
                  ? (isOwner ? 'Renter Information' : 'Owner Information')
                  : 'Driver Information'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.driverInfo}>
              <Image 
                source={{ 
                  uri: isRental && isOwner
                    ? (booking.renter?.photo || booking.user?.profilePhoto || booking.userId?.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400')
                    : (booking.driver || booking.owner)?.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
                }} 
                style={styles.driverPhoto} 
              />
              <View style={styles.driverDetails}>
                <Text style={styles.driverName}>
                  {isRental && isOwner
                    ? (booking.renter?.name || booking.user?.name || (typeof booking.userId === 'object' ? booking.userId?.name : null) || 'Renter')
                    : (booking.driver || booking.owner)?.name || (isRental ? 'Owner' : 'Driver')}
                </Text>
                {((isRental && isOwner) 
                  ? (booking.renter?.rating || booking.user?.rating || booking.userId?.rating)
                  : (booking.driver || booking.owner)?.rating) && (
                  <View style={styles.ratingContainer}>
                    <Star size={16} color={COLORS.warning} fill={COLORS.warning} />
                    <Text style={styles.ratingText}>
                      {(isRental && isOwner)
                        ? ((booking.renter?.rating || booking.user?.rating || booking.userId?.rating) || 0)
                        : ((booking.driver || booking.owner)?.rating || 0)} 
                      {' '}
                      ({((isRental && isOwner)
                        ? ((booking.renter?.totalReviews || booking.user?.totalReviews || booking.userId?.totalReviews) || 0)
                        : ((booking.driver || booking.owner)?.totalReviews || 0))} reviews)
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.driverActions}>
              <Button
                title="View Profile"
                onPress={() => {}}
                variant="outline"
                size="small"
                style={styles.actionButton}
              />
              {(booking.driver || booking.owner)?.phone && (
                <TouchableOpacity style={styles.iconButtonContainer}>
                  <Phone size={18} color={COLORS.primary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.iconButtonContainer}
                onPress={async () => {
                  try {
                    const chatApi = (await import('@utils/apiClient')).chatApi;
                    const serviceType = booking.serviceType || (booking.rentalOfferId ? 'rental' : 'pooling');
                    
                    if (serviceType === 'pooling' && booking.poolingOfferId) {
                      // For pooling, get group conversation
                      const groupConvResponse = await chatApi.getGroupConversationByOffer(booking.poolingOfferId);
                      if (groupConvResponse.success && groupConvResponse.data) {
                        navigation.navigate('Chat' as never, {
                          conversationId: groupConvResponse.data.conversationId,
                          type: 'pooling',
                          isGroup: true,
                          offerId: booking.poolingOfferId,
                        } as never);
                      } else {
                        // Fallback to chat list
                        navigation.navigate('ChatList' as never);
                      }
                    } else {
                      // For rental, use individual conversation
                      if (booking.bookingId || booking._id) {
                        // Determine other user: if owner, we'll get renter from conversation; if renter, show owner
                        const otherUser = isOwner ? null : booking.owner;
                        navigation.navigate('Chat' as never, {
                          bookingId: booking.bookingId || booking._id,
                          type: 'rental',
                          otherUser: otherUser || booking.owner,
                        } as never);
                      }
                    }
                  } catch (error) {
                    console.error('Error navigating to chat:', error);
                    navigation.navigate('ChatList' as never);
                  }
                }}
              >
                <MessageCircle size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Vehicle Details Card */}
        {booking.vehicle && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Car size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>{t('bookingDetails.vehicle')}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Car size={18} color={COLORS.primary} />
              </View>
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>{t('bookingDetails.vehicle')}</Text>
                <Text style={styles.detailValue}>{vehicleBrand}</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Tag size={18} color={COLORS.primary} />
              </View>
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>{t('addVehicle.vehicleNumber')}</Text>
                <Text style={styles.detailValue}>{vehicleNumber}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Passengers Card */}
        {booking.passengers && booking.passengers.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <User size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>{t('bookingDetails.passengerInformation')}</Text>
            </View>
            <View style={styles.divider} />
            {(booking.passengers || []).map((passenger: any, index: number) => (
              <View key={index} style={styles.passengerItem}>
                <View style={styles.passengerIconContainer}>
                  <User size={18} color={COLORS.primary} />
                </View>
                <View style={styles.passengerInfo}>
                  <Text style={styles.passengerName}>{passenger?.name || 'Passenger'}</Text>
                  <Text style={styles.passengerStatus}>{passenger?.status || 'N/A'}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Payment/Settlement Details Card */}
        {isRental && isOwner ? (
          /* Owner View: Settlement Details */
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <IndianRupee size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Settlement Details</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Rental Amount</Text>
              <View style={styles.paymentValueContainer}>
                <IndianRupee size={18} color={COLORS.primary} />
                <Text style={styles.paymentValue}>{booking.amount || 0}</Text>
              </View>
            </View>
            {booking.platformFee > 0 && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Platform Fee</Text>
                <View style={styles.paymentValueContainer}>
                  <IndianRupee size={18} color={COLORS.textSecondary} />
                  <Text style={styles.paymentValue}>{booking.platformFee}</Text>
                </View>
              </View>
            )}
            <View style={[styles.paymentRow, { marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border }]}>
              <Text style={[styles.paymentLabel, { fontWeight: '600' }]}>Your Earnings</Text>
              <View style={styles.paymentValueContainer}>
                <IndianRupee size={20} color={COLORS.success} />
                <Text style={[styles.paymentValue, { fontSize: FONTS.sizes.xl, color: COLORS.success }]}>
                  {booking.amount - (booking.platformFee || 0)}
                </Text>
              </View>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Method</Text>
              <View style={styles.paymentMethodContainer}>
                <CreditCard size={16} color={COLORS.primary} />
                <Text style={styles.paymentMethodText}>
                  {booking.paymentMethod === 'offline_cash' ? 'Cash (Collect from renter)' : booking.paymentMethod || 'N/A'}
                </Text>
              </View>
            </View>
            <View style={[
              styles.paymentStatusContainer,
              booking.paymentStatus === 'paid' && { backgroundColor: `${COLORS.success}15` },
              booking.paymentStatus === 'pending' && { backgroundColor: `${COLORS.warning}15` },
            ]}>
              <CheckCircle 
                size={16} 
                color={
                  booking.paymentStatus === 'paid' ? COLORS.success :
                  booking.paymentStatus === 'pending' ? COLORS.warning :
                  COLORS.textSecondary
                } 
              />
              <Text style={[
                styles.paymentStatusText,
                {
                  color: booking.paymentStatus === 'paid' ? COLORS.success :
                         booking.paymentStatus === 'pending' ? COLORS.warning :
                         COLORS.textSecondary
                }
              ]}>
                {booking.paymentMethod === 'offline_cash'
                  ? 'Collect cash from renter at vehicle return'
                  : booking.paymentStatus === 'paid'
                  ? 'Payment received - Settlement pending'
                  : booking.paymentStatus === 'pending'
                  ? 'Payment pending'
                  : 'N/A'}
              </Text>
            </View>
          </View>
        ) : (
          /* Renter View: Payment Details */
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <IndianRupee size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Payment Details</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Amount</Text>
              <View style={styles.paymentValueContainer}>
                <IndianRupee size={18} color={COLORS.primary} />
                <Text style={styles.paymentValue}>{booking.amount || booking.totalAmount || 0}</Text>
              </View>
            </View>
            {booking.platformFee > 0 && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Platform Fee</Text>
                <View style={styles.paymentValueContainer}>
                  <IndianRupee size={18} color={COLORS.textSecondary} />
                  <Text style={styles.paymentValue}>{booking.platformFee}</Text>
                </View>
              </View>
            )}
            {booking.totalAmount && booking.totalAmount !== booking.amount && (
              <View style={[styles.paymentRow, { marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border }]}>
                <Text style={[styles.paymentLabel, { fontWeight: '600' }]}>Total</Text>
                <View style={styles.paymentValueContainer}>
                  <IndianRupee size={20} color={COLORS.primary} />
                  <Text style={[styles.paymentValue, { fontSize: FONTS.sizes.xl }]}>{booking.totalAmount}</Text>
                </View>
              </View>
            )}
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Method</Text>
              <View style={styles.paymentMethodContainer}>
                <CreditCard size={16} color={COLORS.primary} />
                <Text style={styles.paymentMethodText}>{booking.paymentMethod || 'N/A'}</Text>
              </View>
            </View>
            <View style={[
              styles.paymentStatusContainer,
              booking.paymentStatus === 'paid' && { backgroundColor: `${COLORS.success}15` },
              booking.paymentStatus === 'pending' && { backgroundColor: `${COLORS.warning}15` },
              booking.paymentStatus === 'failed' && { backgroundColor: `${COLORS.error}15` },
            ]}>
              <CheckCircle 
                size={16} 
                color={
                  booking.paymentStatus === 'paid' ? COLORS.success :
                  booking.paymentStatus === 'pending' ? COLORS.warning :
                  booking.paymentStatus === 'failed' ? COLORS.error :
                  COLORS.textSecondary
                } 
              />
              <Text style={[
                styles.paymentStatusText,
                {
                  color: booking.paymentStatus === 'paid' ? COLORS.success :
                         booking.paymentStatus === 'pending' ? COLORS.warning :
                         booking.paymentStatus === 'failed' ? COLORS.error :
                         COLORS.textSecondary
                }
              ]}>
                {booking.paymentStatus === 'pending' && booking.paymentMethod === 'offline_cash'
                  ? 'Payment Pending - Pay at vehicle return'
                  : booking.paymentStatus === 'paid'
                  ? 'Payment Successful'
                  : booking.paymentStatus === 'pending'
                  ? 'Payment Pending'
                  : booking.paymentStatus === 'failed'
                  ? 'Payment Failed'
                  : booking.paymentStatus || 'N/A'}
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {(booking.status === 'confirmed' || booking.status === 'in_progress') && (
            <>
              {/* For renters: Show Track Trip and Book Food (only for pooling) */}
              {isRenter && booking.serviceType === 'pooling' && (
                <>
                  <Button
                    title={t('bookingDetails.trackTrip')}
                    onPress={() => navigation.navigate('TripTracking' as never, { 
                      bookingId: booking.bookingId || booking.id,
                      booking: booking 
                    } as never)}
                    variant="primary"
                    size="large"
                    style={styles.actionButtonLarge}
                  />
                  <Button
                    title={t('bookingDetails.bookFood')}
                    onPress={() => {
                      const fromLocation = typeof booking.route?.from === 'object' 
                        ? booking.route.from 
                        : { address: booking.route?.from || 'Bangalore' };
                      const toLocation = typeof booking.route?.to === 'object' 
                        ? booking.route.to 
                        : { address: booking.route?.to || 'Mumbai' };
                      
                      navigation.navigate('BookFood' as never, { 
                        from: fromLocation.address || fromLocation,
                        to: toLocation.address || toLocation,
                        fromLat: fromLocation.lat,
                        fromLng: fromLocation.lng,
                        toLat: toLocation.lat,
                        toLng: toLocation.lng,
                      } as never);
                    }}
                    variant="outline"
                    size="large"
                    style={styles.actionButtonLarge}
                  />
                </>
              )}
              
              {/* Message button for both owner and renter */}
              <Button
                title={getMessageButtonText()}
                onPress={async () => {
                  try {
                    const chatApi = (await import('@utils/apiClient')).chatApi;
                    const serviceType = booking.serviceType || (booking.rentalOfferId ? 'rental' : 'pooling');
                    
                    if (serviceType === 'pooling' && booking.poolingOfferId) {
                      // For pooling, get group conversation
                      const groupConvResponse = await chatApi.getGroupConversationByOffer(booking.poolingOfferId);
                      if (groupConvResponse.success && groupConvResponse.data) {
                        navigation.navigate('Chat' as never, {
                          conversationId: groupConvResponse.data.conversationId,
                          type: 'pooling',
                          isGroup: true,
                          offerId: booking.poolingOfferId,
                        } as never);
                      } else {
                        // Fallback to chat list
                        navigation.navigate('ChatList' as never);
                      }
                    } else if (serviceType === 'rental') {
                      // For rental, use individual conversation
                      if (booking.bookingId || booking._id) {
                        // Determine other user: if owner, we'll get renter from conversation; if renter, show owner
                        // Don't pass otherUser for owner - let ChatScreen extract it from conversation to ensure correct name
                        const otherUser = isOwner ? null : booking.owner;
                        navigation.navigate('Chat' as never, {
                          bookingId: booking.bookingId || booking._id,
                          type: 'rental',
                          otherUser: otherUser,
                        } as never);
                      }
                    } else {
                      navigation.navigate('ChatList' as never);
                    }
                  } catch (error) {
                    console.error('Error navigating to chat:', error);
                    navigation.navigate('ChatList' as never);
                  }
                }}
                variant="outline"
                size="large"
                style={styles.actionButtonLarge}
              />
              
              {/* Cancel Booking - Only for renters */}
              {isRenter && booking.status === 'confirmed' && (
                <Button
                  title={t('bookingDetails.cancelBooking')}
                  onPress={() => {}}
                  variant="outline"
                  size="large"
                  style={[styles.actionButtonLarge, styles.cancelButton]}
                />
              )}
              
              {/* Manage Rental button - Only for owners */}
              {isRental && isOwner && booking.rentalOfferId && (
                <Button
                  title="Manage Rental"
                  onPress={() => {
                    navigation.navigate('OwnerRentalManagement' as never, {
                      offerId: booking.rentalOfferId,
                      offer: null, // Will be loaded in the screen
                    } as never);
                  }}
                  variant="primary"
                  size="large"
                  style={styles.actionButtonLarge}
                />
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
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
  scrollContent: { 
    padding: SPACING.md,
    paddingTop: SPACING.lg,
  },
  bookingHeaderCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  bookingIdContainer: {
    flex: 1,
  },
  bookingIdLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  bookingId: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xl,
    color: COLORS.text,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  statusConfirmed: {
    backgroundColor: `${COLORS.secondary}20`,
  },
  statusCompleted: {
    backgroundColor: `${COLORS.success}20`,
  },
  statusCancelled: {
    backgroundColor: `${COLORS.error}20`,
  },
  statusText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.text,
    fontWeight: '600',
  },
  flagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  flagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    gap: SPACING.xs,
  },
  flagText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  routeFrom: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  routeTo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  routeText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  arrowContainer: {
    alignItems: 'center',
    marginVertical: SPACING.xs,
    marginLeft: SPACING.md + 36,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  detailValue: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  driverPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: SPACING.md,
    borderWidth: 3,
    borderColor: `${COLORS.primary}20`,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  ratingText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  driverActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
  },
  iconButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}10`,
  },
  passengerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  passengerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  passengerInfo: {
    flex: 1,
  },
  passengerName: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  passengerStatus: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  paymentLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  paymentValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paymentValue: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xl,
    color: COLORS.primary,
    fontWeight: '600',
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  paymentMethodText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  paymentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.success}15`,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
  },
  paymentStatusText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.success,
    fontWeight: '500',
    marginLeft: SPACING.xs,
  },
  actionsContainer: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  actionButtonLarge: {
    marginBottom: SPACING.sm,
  },
  cancelButton: {
    borderColor: COLORS.error,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    fontWeight: '600',
  },
});

export default BookingDetailsScreen;
