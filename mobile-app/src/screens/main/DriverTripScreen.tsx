import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, MapPin, Clock, Navigation, Play, Square, Phone, MessageCircle, Users, LogIn, LogOut, KeyRound, X } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '@constants/theme';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { useLanguage } from '@context/LanguageContext';
import { trackingApi, bookingApi } from '@utils/apiClient';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';

interface RouteParams {
  bookingId?: string;
  booking?: any;
  offerId?: string;
  offer?: any;
}

const DriverTripScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useLanguage();
  const params = (route.params as RouteParams) || {};
  const bookingId = params.bookingId || params.booking?.bookingId;

  const [booking, setBooking] = useState<any>(params.booking || null);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(params.bookingId || null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [eta, setEta] = useState(0);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState('0m');
  const [loading, setLoading] = useState(true);
  const [mapHTML, setMapHTML] = useState<string>('');
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const locationWatchRef = useRef<Location.LocationSubscription | null>(null);
  const [passengers, setPassengers] = useState<any[]>([]);
  const [stoppingLocations, setStoppingLocations] = useState<any[]>([]);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState<any>(null);
  const [passengerCode, setPassengerCode] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);

  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in kilometers
   */
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const toRad = (degrees: number) => (degrees * Math.PI) / 180;
    
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  /**
   * Calculate duration in minutes based on distance
   * Assumes average speed of 45 km/h for city driving
   */
  const calculateDuration = (distanceKm: number): string => {
    const averageSpeedKmh = 45; // Average city driving speed
    const durationHours = distanceKm / averageSpeedKmh;
    const durationMinutes = Math.round(durationHours * 60);
    
    if (durationMinutes < 60) {
      return `${durationMinutes}m`;
    } else {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  };

  /**
   * Calculate distance and duration from route coordinates
   */
  const calculateRouteMetrics = () => {
    let fromLat = 0;
    let fromLng = 0;
    let toLat = 0;
    let toLng = 0;

    // Get coordinates from booking
    if (booking?.route) {
      if (typeof booking.route.from === 'object' && booking.route.from.lat && booking.route.from.lng) {
        fromLat = booking.route.from.lat;
        fromLng = booking.route.from.lng;
      }
      if (typeof booking.route.to === 'object' && booking.route.to.lat && booking.route.to.lng) {
        toLat = booking.route.to.lat;
        toLng = booking.route.to.lng;
      }
    }
    
    // Fallback to offer if booking doesn't have coordinates
    if ((!fromLat || !fromLng || !toLat || !toLng) && params.offer?.route) {
      if (params.offer.route.from?.lat && params.offer.route.from?.lng) {
        fromLat = params.offer.route.from.lat;
        fromLng = params.offer.route.from.lng;
      }
      if (params.offer.route.to?.lat && params.offer.route.to?.lng) {
        toLat = params.offer.route.to.lat;
        toLng = params.offer.route.to.lng;
      }
    }

    // Calculate if we have valid coordinates
    if (fromLat && fromLng && toLat && toLng) {
      const calculatedDistance = calculateDistance(fromLat, fromLng, toLat, toLng);
      const calculatedDuration = calculateDuration(calculatedDistance);
      
      setDistance(parseFloat(calculatedDistance.toFixed(1)));
      setDuration(calculatedDuration);
      
      // Calculate ETA (same as duration for now, can be updated with real-time tracking)
      const durationMinutes = Math.round((calculatedDistance / 45) * 60);
      setEta(durationMinutes);
      
      console.log(`📍 Route metrics calculated: ${calculatedDistance.toFixed(2)} km, ${calculatedDuration}`);
    }
  };

  useEffect(() => {
    // If bookingId is provided, load booking
    // If offerId is provided, find the booking for that offer
    if (bookingId) {
      loadBooking();
    } else if (params.offerId) {
      findBookingForOffer();
    } else if (params.offer) {
      // If offer is provided but no booking yet, initialize with offer data
      initializeWithOffer(params.offer);
    }

    return () => {
      stopLocationTracking();
    };
  }, [bookingId, params.offerId, params.offer]);

  // Load passengers when trip is in progress
  useEffect(() => {
    if (isTracking && params.offerId) {
      loadPassengers();
    }
  }, [isTracking, params.offerId]);

  // Recalculate metrics when booking or offer data changes
  useEffect(() => {
    if (booking || params.offer) {
      // Use a small delay to ensure booking state is updated
      const timer = setTimeout(() => {
        calculateRouteMetrics();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [booking?.route?.from?.lat, booking?.route?.from?.lng, booking?.route?.to?.lat, booking?.route?.to?.lng, params.offer?.route?.from?.lat, params.offer?.route?.from?.lng, params.offer?.route?.to?.lat, params.offer?.route?.to?.lng]);

  const findBookingForOffer = async () => {
    if (!params.offerId) return;

    try {
      setLoading(true);
      // Determine service type from offer - check if it has rental-specific fields
      // If offer has 'pricePerHour' or 'minimumHours', it's a rental, otherwise pooling
      const serviceType = (params.offer?.pricePerHour || params.offer?.minimumHours) ? 'rental' : 'pooling';
      
      console.log(`🔍 Looking for booking: offerId=${params.offerId}, serviceType=${serviceType}`);
      
      const response = await bookingApi.getBookingByOffer(params.offerId, serviceType);
      
      console.log(`📦 Booking API response:`, response);
      
      if (response.success && response.data) {
        const booking = response.data;
        setBooking(booking);
        setCurrentBookingId(booking.bookingId);
        
        console.log(`✅ Booking found: ${booking.bookingId}`);
        
        // Initialize map with booking route
        if (booking.route) {
          const fromLat = typeof booking.route.from === 'object' 
            ? booking.route.from.lat 
            : booking.route.from?.lat || 0;
          const fromLng = typeof booking.route.from === 'object' 
            ? booking.route.from.lng 
            : booking.route.from?.lng || 0;
          
          if (fromLat && fromLng) {
            updateMap(fromLat, fromLng);
          }
        }
        
        // Calculate distance and duration from route
        calculateRouteMetrics();
        
        // If booking is already in_progress, start tracking
        if (booking.status === 'in_progress') {
          await requestLocationPermission();
          startLocationTracking();
          setIsTracking(true);
        }
      } else {
        // No booking found yet, try fallback: search driver bookings
        console.log(`⚠️ Direct API call failed, trying fallback search`);
        try {
          const driverBookingsResponse = await bookingApi.getDriverBookings({ 
            serviceType: serviceType 
          });
          
          console.log(`📦 Driver bookings fallback response:`, driverBookingsResponse);
          
          if (driverBookingsResponse.success && driverBookingsResponse.data?.bookings) {
            const bookings = Array.isArray(driverBookingsResponse.data.bookings) 
              ? driverBookingsResponse.data.bookings 
              : driverBookingsResponse.data.data?.bookings || [];
            
            console.log(`📋 Found ${bookings.length} driver bookings in fallback`);
            
            const matchingBooking = bookings.find(
              (b: any) => {
                const matches = (serviceType === 'pooling' && b.poolingOfferId === params.offerId) ||
                                (serviceType === 'rental' && b.rentalOfferId === params.offerId);
                console.log(`🔍 Fallback check: bookingId=${b.bookingId}, poolingOfferId=${b.poolingOfferId}, rentalOfferId=${b.rentalOfferId}, matches=${matches}`);
                return matches;
              }
            );
            
            if (matchingBooking) {
              setBooking(matchingBooking);
              setCurrentBookingId(matchingBooking.bookingId);
              console.log(`✅ Found booking via fallback: ${matchingBooking.bookingId}`);
              
              // Initialize map and metrics
              if (matchingBooking.route) {
                const fromLat = typeof matchingBooking.route.from === 'object' 
                  ? matchingBooking.route.from.lat 
                  : matchingBooking.route.from?.lat || 0;
                const fromLng = typeof matchingBooking.route.from === 'object' 
                  ? matchingBooking.route.from.lng 
                  : matchingBooking.route.from?.lng || 0;
                
                if (fromLat && fromLng) {
                  updateMap(fromLat, fromLng);
                }
              }
              calculateRouteMetrics();
              
              if (matchingBooking.status === 'in_progress') {
                await requestLocationPermission();
                startLocationTracking();
                setIsTracking(true);
              }
            } else {
              // No booking found, initialize with offer data
              console.log(`⚠️ No matching booking in fallback search`);
              if (params.offer) {
                await initializeWithOffer(params.offer);
              } else {
                navigation.goBack();
              }
            }
          } else {
            // No bookings available, initialize with offer data
            console.log(`⚠️ No driver bookings available`);
            if (params.offer) {
              await initializeWithOffer(params.offer);
            } else {
              navigation.goBack();
            }
          }
        } catch (fallbackError: any) {
          console.error('❌ Fallback search failed:', fallbackError);
          // Still initialize with offer data if available
          if (params.offer) {
            await initializeWithOffer(params.offer);
          } else {
            navigation.goBack();
          }
        }
      }
    } catch (error: any) {
      console.error('❌ Error finding booking:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      // If error but we have offer data, still initialize
      if (params.offer) {
        await initializeWithOffer(params.offer);
      } else {
        Alert.alert('Error', error.message || 'Failed to load booking');
        navigation.goBack();
      }
    } finally {
      setLoading(false);
    }
  };

  const loadBooking = async () => {
    if (!bookingId) return;

    try {
      setLoading(true);
      const response = await bookingApi.getBooking(bookingId);
      if (response.success && response.data) {
        const bookingData = response.data;
        setBooking(bookingData);
        
        // Initialize map with booking route
        if (bookingData.route) {
          const fromLat = typeof bookingData.route.from === 'object' 
            ? bookingData.route.from.lat 
            : bookingData.route.from?.lat || 0;
          const fromLng = typeof bookingData.route.from === 'object' 
            ? bookingData.route.from.lng 
            : bookingData.route.from?.lng || 0;
          
          if (fromLat && fromLng) {
            updateMap(fromLat, fromLng);
          }
        }
        
        // Calculate distance and duration from route
        calculateRouteMetrics();
        
        // If booking is already in_progress, start tracking
        if (bookingData.status === 'in_progress') {
          await requestLocationPermission();
          startLocationTracking();
          setIsTracking(true);
        }
      }
    } catch (error: any) {
      console.error('Error loading booking:', error);
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const loadPassengers = async () => {
    if (!params.offerId) return;

    try {
      const serviceType = (params.offer?.pricePerHour || params.offer?.minimumHours) ? 'rental' : 'pooling';
      const response = await bookingApi.getTripPassengers(params.offerId, serviceType);

      if (response.success && response.data) {
        const passengersList = response.data;
        setPassengers(passengersList);

        // Extract stopping locations from passenger routes
        const locations: any[] = [];
        passengersList.forEach((passenger: any) => {
          if (passenger.route?.from) {
            locations.push({
              type: 'pickup',
              location: passenger.route.from,
              passengerName: passenger.passengerName,
              bookingId: passenger.bookingId,
            });
          }
          if (passenger.route?.to) {
            locations.push({
              type: 'dropoff',
              location: passenger.route.to,
              passengerName: passenger.passengerName,
              bookingId: passenger.bookingId,
            });
          }
        });
        setStoppingLocations(locations);
      }
    } catch (error: any) {
      console.error('Error loading passengers:', error);
    }
  };

  const handleGetIn = async (passengerBookingId: string) => {
    try {
      const response = await bookingApi.markPassengerGotIn(passengerBookingId);
      if (response.success) {
        Alert.alert('Success', 'Passenger marked as got in');
        loadPassengers();
      } else {
        Alert.alert('Error', response.error || 'Failed to mark passenger');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to mark passenger');
    }
  };

  const handleGetOut = async (passengerBookingId: string) => {
    try {
      const response = await bookingApi.markPassengerGotOut(passengerBookingId);
      if (response.success && response.data) {
        const passengerCode = response.data.passengerCode;
        setSelectedPassenger({ bookingId: passengerBookingId, code: passengerCode });
        setShowCodeModal(true);
        Alert.alert(
          'Code Generated',
          `Passenger code: ${passengerCode}. Please share this code with the passenger, then verify it below.`,
          [{ text: 'OK' }]
        );
        // Don't reload passengers here - keep the button visible
        // loadPassengers();
      } else {
        Alert.alert('Error', response.error || 'Failed to generate code');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate code');
    }
  };

  const handleVerifyCode = async () => {
    if (!selectedPassenger || !passengerCode) {
      Alert.alert('Error', 'Please enter the passenger code');
      return;
    }

    if (passengerCode.length !== 4) {
      Alert.alert('Error', 'Code must be 4 digits');
      return;
    }

    try {
      setVerifyingCode(true);
      const response = await bookingApi.verifyPassengerCode(selectedPassenger.bookingId, passengerCode);

      if (response.success) {
        Alert.alert(
          'Success',
          response.data?.message || 'Passenger trip completed successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                setShowCodeModal(false);
                setPassengerCode('');
                setSelectedPassenger(null);
                loadPassengers();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Invalid code');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to verify code');
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleWithdraw = async (passengerBookingId: string) => {
    Alert.alert(
      'Request Withdrawal',
      'Are you sure you want to request withdrawal for this booking?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request',
          onPress: async () => {
            try {
              const response = await bookingApi.requestWithdrawal(passengerBookingId);
              if (response.success) {
                Alert.alert('Success', 'Withdrawal request submitted. Admin will process it.');
                loadPassengers();
              } else {
                Alert.alert('Error', response.error || 'Failed to request withdrawal');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to request withdrawal');
            }
          },
        },
      ]
    );
  };

  const startTrip = async () => {
    let activeBookingId = currentBookingId || bookingId;
    
    // If no booking ID, try to find booking for the offer
    if (!activeBookingId && params.offerId) {
      try {
        // Determine service type from offer - check if it has rental-specific fields
        const serviceType = (params.offer?.pricePerHour || params.offer?.minimumHours) ? 'rental' : 'pooling';
        
        console.log(`🚀 Start Trip: Looking for booking - offerId=${params.offerId}, serviceType=${serviceType}`);
        
        const response = await bookingApi.getBookingByOffer(params.offerId, serviceType);
        
        console.log(`📦 Start Trip API response:`, response);
        
        if (response.success && response.data) {
          activeBookingId = response.data.bookingId;
          setBooking(response.data);
          setCurrentBookingId(activeBookingId);
          console.log(`✅ Start Trip: Booking found - ${activeBookingId}`);
        } else {
          console.log(`⚠️ Start Trip: No booking found - success=${response.success}, data=${response.data}`);
          // Try alternative: get driver bookings and find one matching this offer
          try {
            console.log(`🔄 Fallback: Searching driver bookings for offer ${params.offerId}`);
            // Search all driver bookings (no status filter) to find any booking for this offer
            const driverBookingsResponse = await bookingApi.getDriverBookings({ 
              serviceType: serviceType 
            });
            
            console.log(`📦 Driver bookings response:`, driverBookingsResponse);
            
            if (driverBookingsResponse.success && driverBookingsResponse.data?.bookings) {
              const bookings = Array.isArray(driverBookingsResponse.data.bookings) 
                ? driverBookingsResponse.data.bookings 
                : driverBookingsResponse.data.data?.bookings || [];
              
              console.log(`📋 Found ${bookings.length} driver bookings`);
              
              // Find booking matching this offer, prioritizing active statuses
              const matchingBookings = bookings.filter(
                (b: any) => {
                  const matches = (serviceType === 'pooling' && b.poolingOfferId === params.offerId) ||
                                  (serviceType === 'rental' && b.rentalOfferId === params.offerId);
                  if (matches) {
                    console.log(`🔍 Found matching booking ${b.bookingId}: status=${b.status}, poolingOfferId=${b.poolingOfferId}, rentalOfferId=${b.rentalOfferId}`);
                  }
                  return matches;
                }
              );
              
              // Prioritize bookings with active statuses
              const activeStatuses = ['pending', 'confirmed', 'in_progress'];
              const activeBooking = matchingBookings.find((b: any) => activeStatuses.includes(b.status));
              const matchingBooking = activeBooking || matchingBookings[0];
              
              if (matchingBooking) {
                activeBookingId = matchingBooking.bookingId;
                setBooking(matchingBooking);
                setCurrentBookingId(activeBookingId);
                console.log(`✅ Start Trip: Found booking via driver bookings - ${activeBookingId}, status: ${matchingBooking.status}`);
              } else {
                console.log(`❌ No matching booking found in ${bookings.length} bookings`);
                throw new Error('No matching booking found');
              }
            } else {
              console.log(`❌ Driver bookings API failed or returned no data`);
              throw new Error('No bookings available');
            }
          } catch (fallbackError: any) {
            console.error('❌ Fallback booking search failed:', fallbackError);
            Alert.alert(
              'No Booking Found',
              'No booking has been made for this offer yet. Please wait for passengers to book before starting the trip.',
              [{ text: 'OK' }]
            );
            return;
          }
        }
      } catch (error: any) {
        console.error('❌ Error finding booking in startTrip:', error);
        console.error('Error response:', error.response || error.message);
        Alert.alert(
          'Error',
          `Failed to find booking: ${error.message || 'Unknown error'}. Please try again.`,
          [{ text: 'OK' }]
        );
        return;
      }
    }
    
    if (!activeBookingId) {
      console.log('\n❌ ERROR: No active booking ID after search');
      console.log('  - Cannot proceed to start trip without booking ID');
      
      Alert.alert(
        'Error',
        'Booking not found. Please ensure someone has booked this trip before starting.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('\n🎯 Step 4: Updating booking status to "in_progress"...');
    console.log('  - Booking ID:', activeBookingId);
    
    try {
      // Update booking status to 'in_progress'
      console.log('🌐 Calling updateBookingStatus API...');
      console.log('  - Endpoint: /api/bookings/:bookingId/status');
      console.log('  - Booking ID:', activeBookingId);
      console.log('  - New Status: in_progress');
      
      const response = await bookingApi.updateBookingStatus(activeBookingId, 'in_progress');
      
      console.log('\n📦 API Response (updateBookingStatus):');
      console.log('  - success:', response.success);
      console.log('  - data:', response.data);
      console.log('  - error:', response.error);
      console.log('  - message:', response.message);
      
      if (response.success) {
        // Reload booking to get updated status
        if (activeBookingId) {
          await loadBooking();
        } else {
          await findBookingForOffer();
        }
        
        // Start trip using new API
        const serviceType = (params.offer?.pricePerHour || params.offer?.minimumHours) ? 'rental' : 'pooling';
        const startTripResponse = await bookingApi.startTrip(params.offerId || '', serviceType);
        
        if (startTripResponse.success) {
        // Start location tracking
        await requestLocationPermission();
        startLocationTracking();
        setIsTracking(true);
          
          // Load passengers and update map with stopping locations
          await loadPassengers();
          if (currentLocation) {
            updateMap(currentLocation.lat, currentLocation.lng);
          }
        
        Alert.alert('Trip Started', 'Location tracking has started. Passengers can now see your location.');
        } else {
          Alert.alert('Error', startTripResponse.error || 'Failed to start trip');
        }
      } else {
        Alert.alert('Error', response.error || response.message || 'Failed to start trip');
      }
    } catch (error: any) {
      console.error('Error starting trip:', error);
      const errorMessage = error.message || error.error || 'Failed to start trip';
      Alert.alert('Error', errorMessage);
    }
  };

  const endTrip = async () => {
    if (!params.offerId) {
      Alert.alert('Error', 'Offer ID not found');
      return;
    }

    Alert.alert(
      'End Trip',
      'Are you sure you want to end this trip? All remaining bookings will be marked as completed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Trip',
          style: 'destructive',
          onPress: async () => {
            try {
              stopLocationTracking();
              setIsTracking(false);
              
              const serviceType = params.offer?.type === 'rental' ? 'rental' : 'pooling';
              
              // End entire trip (marks all bookings as completed and offer as completed)
              const response = await bookingApi.endTrip(params.offerId || '', serviceType);
              
              if (response.success) {
                Alert.alert('Trip Ended', 'Trip has been completed successfully. The offer has been removed from My Offers.');
                navigation.goBack();
              } else {
                Alert.alert('Error', response.error || 'Failed to end trip');
              }
            } catch (error: any) {
              console.error('Error ending trip:', error);
              Alert.alert('Error', error.message || 'Failed to end trip');
            }
          },
        },
      ]
    );
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to track your trip. Please enable it in settings.'
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const startLocationTracking = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    // Get initial location
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const { latitude, longitude } = location.coords;
      setCurrentLocation({ lat: latitude, lng: longitude });
      
      // Send initial location
      await updateLocation(latitude, longitude, location.coords.heading, location.coords.speed, location.coords.accuracy);
      
      // Update map
      updateMap(latitude, longitude);
      
      // Start watching location changes
      locationWatchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        async (location) => {
          const { latitude, longitude, heading, speed, accuracy } = location.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          await updateLocation(latitude, longitude, heading || undefined, speed || undefined, accuracy || undefined);
          updateMap(latitude, longitude);
        }
      );

      // Also fetch trip metrics periodically
      locationIntervalRef.current = setInterval(() => {
        fetchTripMetrics();
      }, 10000); // Every 10 seconds

      setIsTracking(true);
      console.log('✅ Location tracking started');
    } catch (error: any) {
      console.error('Error starting location tracking:', error);
      Alert.alert('Error', 'Failed to start location tracking');
    }
  };

  const stopLocationTracking = () => {
    if (locationWatchRef.current) {
      locationWatchRef.current.remove();
      locationWatchRef.current = null;
    }
    
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
    
    setIsTracking(false);
    console.log('🛑 Location tracking stopped');
  };

  const updateLocation = async (
    lat: number,
    lng: number,
    heading?: number,
    speed?: number,
    accuracy?: number
  ) => {
    const activeBookingId = currentBookingId || bookingId;
    if (!activeBookingId) {
      console.warn('⚠️ No booking ID available for location update');
      return;
    }

    try {
      const response = await trackingApi.updateLocation({
        bookingId: activeBookingId,
        lat,
        lng,
        heading,
        speed,
        accuracy,
      });

      if (response.success) {
        console.log(`📍 Location updated: ${lat}, ${lng}`);
      }
    } catch (error: any) {
      console.error('Error updating location:', error);
      // Don't show alert for every failed update to avoid spam
    }
  };

  const fetchTripMetrics = async () => {
    const activeBookingId = currentBookingId || bookingId;
    if (!activeBookingId) {
      // If no booking ID, calculate from route
      calculateRouteMetrics();
      return;
    }

    try {
      const response = await trackingApi.getTripMetrics(activeBookingId);
      if (response.success && response.data) {
        // Use API data if available, otherwise calculate from route
        if (response.data.distance && response.data.distance > 0) {
          setEta(response.data.eta || 0);
          setDistance(response.data.distance || 0);
          setDuration(response.data.duration || '0m');
        } else {
          calculateRouteMetrics();
        }
      } else {
        // Fallback to calculating from route
        calculateRouteMetrics();
      }
    } catch (error: any) {
      console.error('Error fetching trip metrics:', error);
      // Fallback to calculating from route
      calculateRouteMetrics();
    }
  };

  const updateMap = (lat: number, lng: number) => {
    // Get destination from booking or offer
    let destinationLat = lat;
    let destinationLng = lng;
    
    if (booking?.route?.to) {
      destinationLat = typeof booking.route.to === 'object' 
        ? booking.route.to.lat 
        : booking.route.to?.lat || lat;
      destinationLng = typeof booking.route.to === 'object' 
        ? booking.route.to.lng 
        : booking.route.to?.lng || lng;
    } else if (params.offer?.route?.to) {
      destinationLat = params.offer.route.to.lat || lat;
      destinationLng = params.offer.route.to.lng || lng;
    }

    // Build stopping locations markers (only pickup points)
    const stoppingMarkers = stoppingLocations
      .filter((stop) => stop.type === 'pickup')
      .map((stop, index) => {
        const stopLat = typeof stop.location === 'object' ? stop.location.lat : 0;
        const stopLng = typeof stop.location === 'object' ? stop.location.lng : 0;
        return `L.marker([${stopLat}, ${stopLng}], {
          icon: L.divIcon({
            className: 'stop-marker',
            html: '<div style="background: ${COLORS.warning}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
            iconSize: [18, 18],
            iconAnchor: [9, 9]
          })
        }).addTo(map);`;
      })
      .join('\n    ');

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
    const map = L.map('map').setView([${lat}, ${lng}], 15);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);
    
    // Current location marker (driver)
    const driverMarker = L.marker([${lat}, ${lng}], {
      icon: L.divIcon({
        className: 'driver-marker',
        html: '<div style="background: ${COLORS.primary}; width: 24px; height: 24px; border-radius: 50%; border: 4px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
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
    
    // Stopping locations markers (pickup points only)
    ${stoppingMarkers || ''}
    
    // Fit bounds - include all markers
    const bounds = [[${lat}, ${lng}], [${destinationLat}, ${destinationLng}]];
    ${stoppingLocations.filter((s) => s.type === 'pickup').length > 0
      ? stoppingLocations
          .filter((s) => s.type === 'pickup')
          .map((s) => {
            const sLat = typeof s.location === 'object' ? s.location.lat : 0;
            const sLng = typeof s.location === 'object' ? s.location.lng : 0;
            return `bounds.push([${sLat}, ${sLng}]);`;
          })
          .join('\n    ')
      : ''}
    map.fitBounds(bounds, { padding: [50, 50] });
    
    // Update function for real-time location
    window.updateDriverPosition = function(newLat, newLng) {
      driverMarker.setLatLng([newLat, newLng]);
      routeLine.setLatLngs([
        [newLat, newLng],
        [${destinationLat}, ${destinationLng}]
      ]);
      map.setView([newLat, newLng], map.getZoom());
    };
    
    // Update stopping locations if needed
    window.updateStoppingLocations = function(locations) {
      // This can be called to update stopping locations dynamically
    };
  </script>
</body>
</html>
    `;
    setMapHTML(html);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading trip details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Driver Trip</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.statusBar}>
        <View style={[
          styles.statusIndicator,
          { backgroundColor: isTracking ? `${COLORS.success}15` : `${COLORS.textSecondary}15` }
        ]}>
          <View style={[styles.statusDot, isTracking && styles.statusDotActive]} />
          <Text style={styles.statusText}>
            {isTracking ? 'Tracking Active' : 'Tracking Inactive'}
          </Text>
        </View>
        {isTracking && (
          <Text style={styles.etaText}>ETA: {eta} min</Text>
        )}
      </View>

      <View style={styles.mapContainer}>
        {mapHTML ? (
          <WebView
            source={{ html: mapHTML }}
            style={styles.webView}
            javaScriptEnabled={true}
          />
        ) : (
          <View style={styles.mapPlaceholder}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.mapHint}>Loading map...</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.tripDetailsCard}>
          <Text style={styles.sectionTitle}>Trip Details</Text>
          <View style={styles.detailItem}>
            <MapPin size={20} color={COLORS.primary} />
            <Text style={styles.detailText}>
              From: {typeof booking?.route?.from === 'string' 
                ? booking.route.from 
                : booking?.route?.from?.address || 'N/A'}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <MapPin size={20} color={COLORS.primary} />
            <Text style={styles.detailText}>
              To: {typeof booking?.route?.to === 'string' 
                ? booking.route.to 
                : booking?.route?.to?.address || 'N/A'}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Navigation size={20} color={COLORS.primary} />
            <Text style={styles.detailText}>Distance: {distance} km</Text>
          </View>
          <View style={styles.detailItem}>
            <Clock size={20} color={COLORS.primary} />
            <Text style={styles.detailText}>Duration: {duration}</Text>
          </View>
        </Card>

        {/* Stopping Locations Card */}
        {stoppingLocations.length > 0 && (
          <Card style={styles.stoppingLocationsCard}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Stopping Locations</Text>
            </View>
            {stoppingLocations.map((stop, index) => (
              <View key={index} style={styles.stoppingLocationItem}>
                <View style={styles.stoppingLocationInfo}>
                  <Text style={styles.stoppingLocationType}>
                    {stop.type === 'pickup' ? 'Pickup' : 'Dropoff'}
                  </Text>
                  <Text style={styles.stoppingLocationName}>{stop.passengerName}</Text>
                  <Text style={styles.stoppingLocationAddress}>
                    {typeof stop.location === 'object' ? stop.location.address : stop.location}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Passengers Card */}
        {passengers.length > 0 && (
          <Card style={styles.passengersCard}>
            <View style={styles.sectionHeader}>
              <Users size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Passengers ({passengers.length})</Text>
            </View>
            {passengers.map((passenger: any, index: number) => (
              <View key={index} style={styles.passengerItem}>
                <View style={styles.passengerInfo}>
                  <Text style={styles.passengerName}>{passenger.passengerName}</Text>
                  <Text style={styles.passengerRoute}>
                    {typeof passenger.route?.from === 'object' 
                      ? passenger.route.from.address?.split(',')[0] 
                      : 'From'} → {typeof passenger.route?.to === 'object' 
                      ? passenger.route.to.address?.split(',')[0] 
                      : 'To'}
                  </Text>
                </View>
                <View style={styles.passengerActions}>
                  {passenger.passengerStatus === 'waiting' && (
                    <Button
                      title="Get In"
                      onPress={() => handleGetIn(passenger.bookingId)}
                      variant="primary"
                      size="small"
                      style={styles.passengerActionButton}
                      icon={<LogIn size={16} color={COLORS.white} />}
                    />
                  )}
                  {(passenger.passengerStatus === 'got_in' || (passenger.passengerStatus === 'got_out' && passenger.status !== 'completed')) && (
                    <Button
                      title={passenger.passengerStatus === 'got_out' ? "Verify Code" : "Get Out"}
                      onPress={() => {
                        if (passenger.passengerStatus === 'got_out') {
                          // Show code verification modal with the generated code
                          setSelectedPassenger({ 
                            bookingId: passenger.bookingId, 
                            code: passenger.passengerCode || '' 
                          });
                          setShowCodeModal(true);
                        } else {
                          handleGetOut(passenger.bookingId);
                        }
                      }}
                      variant={passenger.passengerStatus === 'got_out' ? "primary" : "outline"}
                      size="small"
                      style={styles.passengerActionButton}
                      icon={passenger.passengerStatus === 'got_out' ? <KeyRound size={16} color={COLORS.white} /> : <LogOut size={16} color={COLORS.primary} />}
                    />
                  )}
                  {passenger.status === 'completed' && passenger.settlementStatus === 'driver_requested' && (
                    <Button
                      title="Withdraw"
                      onPress={() => handleWithdraw(passenger.bookingId)}
                      variant="primary"
                      size="small"
                      style={styles.passengerActionButton}
                      icon={<KeyRound size={16} color={COLORS.white} />}
                    />
                  )}
                </View>
              </View>
            ))}
          </Card>
        )}

        <View style={styles.actionsContainer}>
          {!isTracking ? (
            <Button
              title="Start Trip & Begin Tracking"
              onPress={startTrip}
              variant="primary"
              size="large"
              style={styles.actionButton}
              icon={<Play size={20} color={COLORS.white} />}
            />
          ) : (
            <Button
              title="End Trip"
              onPress={endTrip}
              variant="outline"
              size="large"
              style={[styles.actionButton, styles.endButton]}
              icon={<Square size={20} color={COLORS.error} />}
            />
          )}
        </View>
      </ScrollView>

      {/* Code Verification Modal */}
      <Modal
        visible={showCodeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCodeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowCodeModal(false);
                setPassengerCode('');
                setSelectedPassenger(null);
              }}
            >
              <X size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Enter Passenger Code</Text>
            <Text style={styles.modalSubtitle}>
              Please enter the 4-digit code provided by the passenger
            </Text>

            <TextInput
              style={styles.codeInput}
              value={passengerCode}
              onChangeText={setPassengerCode}
              placeholder="Enter 4-digit code"
              keyboardType="number-pad"
              maxLength={4}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowCodeModal(false);
                  setPassengerCode('');
                  setSelectedPassenger(null);
                }}
                variant="outline"
                size="medium"
                style={styles.modalButton}
              />
              <Button
                title={verifyingCode ? 'Verifying...' : 'Verify'}
                onPress={handleVerifyCode}
                variant="primary"
                size="medium"
                style={styles.modalButton}
                disabled={verifyingCode || passengerCode.length !== 4}
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
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    paddingTop: SPACING.xl + 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  headerTitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xl,
    color: COLORS.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 24,
  },
  statusBar: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.textSecondary,
  },
  statusDotActive: {
    backgroundColor: COLORS.success,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  etaText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    fontWeight: '700',
    backgroundColor: `${COLORS.primary}10`,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  mapContainer: {
    height: 280,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  webView: {
    flex: 1,
    height: 280,
    borderRadius: BORDER_RADIUS.lg,
  },
  mapPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  mapHint: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  tripDetailsCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  sectionTitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: SPACING.md,
    letterSpacing: 0.3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    flex: 1,
    lineHeight: 22,
  },
  passengersCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  passengerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
  },
  passengerName: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  passengerStatus: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.success,
    textTransform: 'capitalize',
    backgroundColor: `${COLORS.success}15`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    fontWeight: '600',
  },
  actionsContainer: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xs,
  },
  actionButton: {
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  endButton: {
    borderColor: COLORS.error,
    borderWidth: 2,
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
  stoppingLocationsCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  stoppingLocationItem: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
  },
  stoppingLocationInfo: {
    flex: 1,
  },
  stoppingLocationType: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  stoppingLocationName: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  stoppingLocationAddress: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  passengerInfo: {
    flex: 1,
  },
  passengerRoute: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  passengerActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  passengerActionButton: {
    minWidth: 100,
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
    ...SHADOWS.lg,
  },
  modalCloseButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    padding: SPACING.xs,
    zIndex: 1,
  },
  modalTitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xl,
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  codeInput: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.sizes.xxl,
    fontFamily: FONTS.medium,
    textAlign: 'center',
    letterSpacing: SPACING.md,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
  },
});

export default DriverTripScreen;
