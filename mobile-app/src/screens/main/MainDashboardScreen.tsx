import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Video, ResizeMode } from 'expo-av';
import { Menu, Bell, User, Clock, MapPin, Calendar, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '@constants/theme';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import { Card } from '@components/common/Card';
import { BottomTabNavigator } from '@components/navigation/BottomTabNavigator';
import { useLanguage } from '@context/LanguageContext';
import { dashboardApi } from '@utils/apiClient';

const { width } = Dimensions.get('window');

const MainDashboardScreen = () => {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const videoRef = useRef<Video>(null);
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [date, setDate] = useState('Today, 15 Jan 2024');
  const [vehicleType, setVehicleType] = useState<'Car' | 'Bike' | null>(null);
  const [passengers, setPassengers] = useState(1);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [financialData, setFinancialData] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const recentSearches = [
    { from: 'Bangalore', to: 'Mumbai' },
    { from: 'Delhi', to: 'Jaipur' },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoadingStats(true);
      const [statsResponse, financialResponse] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getFinancial(),
      ]);

      if (statsResponse.success) {
        setDashboardStats(statsResponse.data);
      }
      if (financialResponse.success) {
        setFinancialData(financialResponse.data);
      }
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Menu size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Notifications' as never)}
          >
            <Bell size={24} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Profile' as never)}
          >
            <User size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            {t('dashboard.welcomeBack')}, {dashboardStats?.user?.name || 'User'}
          </Text>
          <Text style={styles.welcomeQuote}>{t('dashboard.startRide')}</Text>
        </View>

        {/* Financial Cards */}
        {financialData && (
          <View style={styles.financialCardsContainer}>
            <Card style={styles.financialCard}>
              <View style={styles.financialCardHeader}>
                <TrendingUp size={24} color={COLORS.success} />
                <Text style={styles.financialCardTitle}>Inflow</Text>
              </View>
              <View style={styles.financialCardAmount}>
                <IndianRupee size={28} color={COLORS.success} />
                <Text style={[styles.financialCardValue, { color: COLORS.success }]}>
                  {financialData.inflowAmount || 0}
                </Text>
              </View>
              <Text style={styles.financialCardSubtitle}>Money to be received</Text>
            </Card>

            <Card style={styles.financialCard}>
              <View style={styles.financialCardHeader}>
                <TrendingDown size={24} color={COLORS.error} />
                <Text style={styles.financialCardTitle}>Outflow</Text>
              </View>
              <View style={styles.financialCardAmount}>
                <IndianRupee size={28} color={COLORS.error} />
                <Text style={[styles.financialCardValue, { color: COLORS.error }]}>
                  {financialData.outflowAmount || 0}
                </Text>
              </View>
              <Text style={styles.financialCardSubtitle}>Money to be paid</Text>
            </Card>
          </View>
        )}

        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={require('../../../assets/videos/dashboard.mp4')}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            isLooping
            isMuted
            shouldPlay
          />
          <View style={styles.blurOverlay}>
            <View style={styles.locationFieldsContainer}>
              <TouchableOpacity
                onPress={() => (navigation.navigate as any)('LocationPicker', { type: 'from' })}
                style={styles.locationFieldWrapper}
              >
                <Input
                  label={t('dashboard.from')}
                  value={fromLocation}
                  placeholder={t('dashboard.selectLocation')}
                  editable={false}
                  containerStyle={styles.locationInput}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => (navigation.navigate as any)('LocationPicker', { type: 'to' })}
                style={styles.locationFieldWrapper}
              >
                <Input
                  label={t('dashboard.to')}
                  value={toLocation}
                  placeholder={t('dashboard.selectLocation')}
                  editable={false}
                  containerStyle={styles.locationInput}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.searchSection}>

          <TouchableOpacity>
            <Input
              label={t('dashboard.date')}
              value={date}
              placeholder="Today, 15 Jan 2024"
              editable={false}
              containerStyle={styles.locationInput}
            />
          </TouchableOpacity>

          <View style={styles.vehicleTypeContainer}>
            <Text style={styles.label}>{t('dashboard.selectYourVehicle')}</Text>
            <View style={styles.vehicleTypeOptions}>
              <TouchableOpacity
                style={[
                  styles.vehicleTypeButton,
                  vehicleType === 'Car' && styles.vehicleTypeSelected,
                ]}
                onPress={() => {
                  setVehicleType('Car');
                  setPassengers(1);
                }}
              >
                <Image
                  source={require('../../../assets/car.jpg')}
                  style={styles.vehicleImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.vehicleTypeButton,
                  vehicleType === 'Bike' && styles.vehicleTypeSelected,
                ]}
                onPress={() => {
                  setVehicleType('Bike');
                  setPassengers(1);
                }}
              >
                <Image
                  source={require('../../../assets/bike.jpg')}
                  style={styles.vehicleImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.passengerContainer}>
            <Text style={styles.label}>{t('dashboard.passengers')}</Text>
            <View style={styles.passengerRangeContainer}>
              <View style={styles.passengerRangeRow}>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.passengerRangeButton,
                      passengers === num && styles.passengerRangeSelected,
                      vehicleType === 'Bike' && styles.passengerRangeDisabled,
                    ]}
                    onPress={() => vehicleType === 'Car' && setPassengers(num)}
                    disabled={vehicleType === 'Bike'}
                  >
                    <Text
                      style={[
                        styles.passengerRangeText,
                        passengers === num && styles.passengerRangeTextSelected,
                        vehicleType === 'Bike' && styles.passengerRangeTextDisabled,
                      ]}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {vehicleType === 'Bike' && (
                <Text style={styles.disabledHint}>Not available for Bike</Text>
              )}
            </View>
          </View>

          <Button
            title={t('dashboard.searchPools')}
            onPress={() => navigation.navigate('SearchPooling' as never)}
            variant="primary"
            size="large"
            style={styles.searchButton}
          />
        </View>

        <View style={styles.recentSearches}>
          <Text style={styles.recentTitle}>{t('dashboard.recentSearches')}:</Text>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recentItem}
              onPress={() => {
                setFromLocation(search.from);
                setToLocation(search.to);
              }}
            >
              <Clock size={16} color={COLORS.textSecondary} />
              <Text style={styles.recentText}>
                {search.from} → {search.to}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.xl,
  },
  headerTitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xl,
    color: COLORS.white,
    fontWeight: 'bold',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: -1,
  },
  menuButton: {
    padding: SPACING.xs,
  },
  headerRight: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  iconButton: {
    padding: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  videoContainer: {
    width: width - SPACING.md * 2,
    height: 220,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  welcomeContainer: {
    marginBottom: SPACING.lg,
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.md,
  },
  welcomeText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xxl,
    color: COLORS.primary,
    marginBottom: SPACING.xs / 2,
    textAlign: 'left',
  },
  welcomeQuote: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'left',
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.67)',
  },
  locationFieldsContainer: {
    gap: SPACING.md,
  },
  locationFieldWrapper: {
    width: '100%',
  },
  searchSection: {
    marginBottom: SPACING.lg,
  },
  locationInput: {
    marginBottom: 0,
  },
  vehicleTypeContainer: {
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  label: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  vehicleTypeOptions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  vehicleTypeButton: {
    flex: 1,
    height: 140,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  vehicleTypeSelected: {
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  passengerContainer: {
    marginBottom: SPACING.lg,
  },
  passengerRangeContainer: {
    marginTop: SPACING.sm,
  },
  passengerRangeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  passengerRangeButton: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passengerRangeSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  passengerRangeDisabled: {
    opacity: 0.5,
  },
  passengerRangeText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  passengerRangeTextSelected: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  passengerRangeTextDisabled: {
    color: COLORS.textSecondary,
  },
  disabledHint: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  searchButton: {
    marginTop: SPACING.md,
  },
  recentSearches: {
    marginTop: SPACING.lg,
  },
  recentTitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  recentText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  financialCardsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  financialCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
  },
  financialCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  financialCardTitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  financialCardAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  financialCardValue: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
  },
  financialCardSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
});

export default MainDashboardScreen;

