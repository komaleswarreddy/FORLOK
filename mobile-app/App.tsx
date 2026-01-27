import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { COLORS } from './src/constants/theme';

// Import screens
import SplashScreen from './src/screens/auth/SplashScreen';
import OnboardingScreen from './src/screens/auth/OnboardingScreen';
import SignInScreen from './src/screens/auth/SignInScreen';
import SignUpScreen from './src/screens/auth/SignUpScreen';
import UserTypeSelectionScreen from './src/screens/auth/UserTypeSelectionScreen';
import IndividualRegistrationScreen from './src/screens/registration/IndividualRegistrationScreen';
import DocumentVerificationScreen from './src/screens/registration/DocumentVerificationScreen';
import VerificationPendingScreen from './src/screens/registration/VerificationPendingScreen';
import MainDashboardScreen from './src/screens/main/MainDashboardScreen';
import OfferServicesScreen from './src/screens/offer/OfferServicesScreen';
import CreatePoolingOfferScreen from './src/screens/offer/CreatePoolingOfferScreen';
import CreateRentalOfferScreen from './src/screens/offer/CreateRentalOfferScreen';
import TakeServicesScreen from './src/screens/take/TakeServicesScreen';
import SearchPoolingScreen from './src/screens/take/SearchPoolingScreen';
import SearchRentalScreen from './src/screens/take/SearchRentalScreen';
import PoolingDetailsScreen from './src/screens/take/PoolingDetailsScreen';
import RentalDetailsScreen from './src/screens/take/RentalDetailsScreen';
import PaymentScreen from './src/screens/main/PaymentScreen';
import PriceSummaryScreen from './src/screens/main/PriceSummaryScreen';
import BookingConfirmationScreen from './src/screens/main/BookingConfirmationScreen';
import HistoryScreen from './src/screens/history/HistoryScreen';
import CompanyHistoryScreen from './src/screens/history/CompanyHistoryScreen';
import BookingDetailsScreen from './src/screens/history/BookingDetailsScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import CompanyProfileScreen from './src/screens/profile/CompanyProfileScreen';
import SettingsScreen from './src/screens/profile/SettingsScreen';
import LocationPickerScreen from './src/screens/main/LocationPickerScreen';
import TripTrackingScreen from './src/screens/main/TripTrackingScreen';
import DriverTripScreen from './src/screens/main/DriverTripScreen';
import BookFoodScreen from './src/screens/main/BookFoodScreen';
import MyOffersScreen from './src/screens/offer/MyOffersScreen';
import CompanyMyOffersScreen from './src/screens/offer/CompanyMyOffersScreen';
import CompanyOfferDetailsScreen from './src/screens/offer/CompanyOfferDetailsScreen';
import OwnerRentalManagementScreen from './src/screens/offer/OwnerRentalManagementScreen';
import EndRentalScreen from './src/screens/offer/EndRentalScreen';
import CompanyVehicleManagementScreen from './src/screens/main/CompanyVehicleManagementScreen';
import CompanyEarningsScreen from './src/screens/main/CompanyEarningsScreen';
import NotificationsScreen from './src/screens/main/NotificationsScreen';
import ChatScreen from './src/screens/main/ChatScreen';
import ChatListScreen from './src/screens/main/ChatListScreen';
import RatingScreen from './src/screens/history/RatingScreen';
import CompanyRegistrationScreen from './src/screens/registration/CompanyRegistrationScreen';
import CompanyDashboardScreen from './src/screens/main/CompanyDashboardScreen';
import AddVehicleScreen from './src/screens/main/AddVehicleScreen';
import VehicleInformationScreen from './src/screens/main/VehicleInformationScreen';
import VehicleDetailsScreen from './src/screens/profile/VehicleDetailsScreen';
import FilterScreen from './src/screens/main/FilterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import HelpSupportScreen from './src/screens/main/HelpSupportScreen';
import FeedbackScreen from './src/screens/main/FeedbackScreen';
import LoadingScreen from './src/screens/main/LoadingScreen';
import ErrorScreen from './src/screens/main/ErrorScreen';

// Admin Screens
import AdminLoginScreen from './src/screens/admin/AdminLoginScreen';
import AdminDashboardScreen from './src/screens/admin/AdminDashboardScreen';
import PoolingManagementScreen from './src/screens/admin/PoolingManagementScreen';
import RentalManagementScreen from './src/screens/admin/RentalManagementScreen';
import RidesHistoryScreen from './src/screens/admin/RidesHistoryScreen';
import UserManagementScreen from './src/screens/admin/UserManagementScreen';
import FeedbackManagementScreen from './src/screens/admin/FeedbackManagementScreen';
import FeedbackDetailsScreen from './src/screens/admin/FeedbackDetailsScreen';
import AnalyticsScreen from './src/screens/admin/AnalyticsScreen';
import AdminSettingsScreen from './src/screens/admin/AdminSettingsScreen';
import { LanguageProvider } from './src/context/LanguageContext';
import { websocketService } from './src/services/websocket.service';

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    loadFonts();
    
    // Initialize WebSocket connection when app starts
    websocketService.connect();
    
    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
    };
  }, []);

  const loadFonts = async () => {
    try {
      await Font.loadAsync({
        'MomoTrustDisplay-Regular': require('./assets/fonts/MomoTrustDisplay-Regular.ttf'),
      });
    } catch (error) {
      console.warn('Font loading error:', error);
      // Fallback to system font if custom font fails
    } finally {
      setFontsLoaded(true);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <LanguageProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor={COLORS.primary} />
          <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          {/* Auth Flow */}
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="UserTypeSelection" component={UserTypeSelectionScreen} />
          
          {/* Registration Flow */}
          <Stack.Screen name="IndividualRegistration" component={IndividualRegistrationScreen} />
          <Stack.Screen name="DocumentVerification" component={DocumentVerificationScreen} />
          <Stack.Screen name="CompanyRegistration" component={CompanyRegistrationScreen} />
          <Stack.Screen name="VerificationPending" component={VerificationPendingScreen} />
          
          {/* Main App */}
          <Stack.Screen name="MainDashboard" component={MainDashboardScreen} />
          <Stack.Screen name="CompanyDashboard" component={CompanyDashboardScreen} />
          
          {/* Offer Services */}
          <Stack.Screen name="OfferServices" component={OfferServicesScreen} />
          <Stack.Screen name="CreatePoolingOffer" component={CreatePoolingOfferScreen} />
          <Stack.Screen name="CreateRentalOffer" component={CreateRentalOfferScreen} />
          <Stack.Screen name="MyOffers" component={MyOffersScreen} />
          <Stack.Screen name="CompanyMyOffers" component={CompanyMyOffersScreen} />
          <Stack.Screen name="CompanyOfferDetails" component={CompanyOfferDetailsScreen} />
          <Stack.Screen name="CompanyVehicleManagement" component={CompanyVehicleManagementScreen} />
          <Stack.Screen name="CompanyEarnings" component={CompanyEarningsScreen} />
          <Stack.Screen name="OwnerRentalManagement" component={OwnerRentalManagementScreen} />
          <Stack.Screen name="EndRental" component={EndRentalScreen} />
          
          {/* Take Services */}
          <Stack.Screen name="TakeServices" component={TakeServicesScreen} />
          <Stack.Screen name="SearchPooling" component={SearchPoolingScreen} />
          <Stack.Screen name="SearchRental" component={SearchRentalScreen} />
          <Stack.Screen name="PoolingDetails" component={PoolingDetailsScreen} />
          <Stack.Screen name="RentalDetails" component={RentalDetailsScreen} />
          
          {/* Booking & Payment */}
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="PriceSummary" component={PriceSummaryScreen} />
          <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
          <Stack.Screen name="TripTracking" component={TripTrackingScreen} />
          <Stack.Screen name="DriverTrip" component={DriverTripScreen} />
          <Stack.Screen name="BookFood" component={BookFoodScreen} />
          
          {/* History */}
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="CompanyHistory" component={CompanyHistoryScreen} />
          <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
          <Stack.Screen name="Rating" component={RatingScreen} />
          
          {/* Profile & Settings */}
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="CompanyProfile" component={CompanyProfileScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          
          {/* Utility Screens */}
          <Stack.Screen name="LocationPicker" component={LocationPickerScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="ChatList" component={ChatListScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          
          {/* Company Screens */}
          <Stack.Screen name="AddVehicle" component={AddVehicleScreen} />
          <Stack.Screen name="VehicleInformation" component={VehicleInformationScreen} />
          <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
          
          {/* Additional Screens */}
          <Stack.Screen name="Filter" component={FilterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
          <Stack.Screen name="Feedback" component={FeedbackScreen} />
          <Stack.Screen name="Loading" component={LoadingScreen} />
          <Stack.Screen name="Error" component={ErrorScreen} />
          
          {/* Admin Screens */}
          <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          <Stack.Screen name="PoolingManagement" component={PoolingManagementScreen} />
          <Stack.Screen name="RentalManagement" component={RentalManagementScreen} />
          <Stack.Screen name="RidesHistory" component={RidesHistoryScreen} />
          <Stack.Screen name="UserManagement" component={UserManagementScreen} />
          <Stack.Screen name="FeedbackManagement" component={FeedbackManagementScreen} />
          <Stack.Screen name="FeedbackDetails" component={FeedbackDetailsScreen} />
          <Stack.Screen name="Analytics" component={AnalyticsScreen} />
          <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
});

