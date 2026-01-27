import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import {
  ArrowLeft,
  Search,
  Filter,
  BarChart3,
  KeyRound,
  CheckCircle,
  AlertCircle,
  MapPin,
  Calendar,
  Clock,
  Shield,
  TrendingUp,
  Download,
} from 'lucide-react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '@constants/theme';
import { Card } from '@components/common/Card';
import { useLanguage } from '@context/LanguageContext';

const { width } = Dimensions.get('window');

const RentalManagementScreen = () => {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('All');

  const tabs = [
    t('common.all'),
    t('admin.rentalManagement.active'),
    t('admin.rentalManagement.pending'),
    t('admin.rentalManagement.expired'),
    t('admin.rentalManagement.suspended'),
    t('admin.rentalManagement.flagged'),
  ];

  const rentals = [
    {
      id: 'RENT20240115001',
      owner: 'Priya M.',
      ownerId: '67890',
      vehicle: 'Honda City',
      vehicleNumber: 'KA-02-CD-5678',
      location: 'Bangalore',
      date: '15 Jan 2024',
      time: '10:00 AM - 6:00 PM',
      price: '₹800/hour',
      status: 'Active',
      type: 'Individual',
    },
    {
      id: 'RENT20240115002',
      owner: 'ABC Car Rentals',
      ownerId: 'COMP001',
      vehicle: 'Maruti Swift',
      vehicleNumber: 'KA-03-EF-9012',
      location: 'Mumbai',
      date: '16 Jan 2024',
      time: '9:00 AM - 8:00 PM',
      price: '₹600/hour',
      status: 'Active',
      type: 'Company',
    },
  ];

  const stats = {
    total: 5678,
    active: 3456,
    pending: 234,
    suspended: 12,
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Blue Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('admin.rentalManagement.title')}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Search size={20} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Filter size={20} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <BarChart3 size={20} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Download size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Image Background with Statistics Cards */}
        <View style={styles.imageContainer}>
          <ImageBackground
            source={require('../../../assets/rental.jpg')}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            <View style={styles.overlay} />
            <BlurView intensity={50} style={styles.blurContainer}>
              <View style={styles.statsContainer}>
                <Card style={styles.statCard}>
                  <View style={styles.statTrendTopRight}>
                    <TrendingUp size={12} color={COLORS.success} />
                    <Text style={styles.statTrendText}>+15%</Text>
                  </View>
                  <View style={styles.statIconContainer}>
                    <KeyRound size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>{stats.total.toLocaleString()}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>{t('admin.rentalManagement.totalRentals')}</Text>
                  </View>
                </Card>

                <Card style={styles.statCard}>
                  <View style={styles.statTrendTopRight}>
                    <TrendingUp size={12} color={COLORS.success} />
                    <Text style={styles.statTrendText}>+10%</Text>
                  </View>
                  <View style={[styles.statIconContainer, { backgroundColor: COLORS.success + '30' }]}>
                    <CheckCircle size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>{stats.active.toLocaleString()}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>{t('admin.rentalManagement.active')}</Text>
                  </View>
                </Card>

                <Card style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: COLORS.warning + '30' }]}>
                    <Clock size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>{stats.pending.toLocaleString()}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>{t('admin.rentalManagement.pending')}</Text>
                  </View>
                </Card>

                <Card style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: COLORS.error + '30' }]}>
                    <Shield size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>{stats.suspended}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>{t('admin.rentalManagement.suspended')}</Text>
                  </View>
                </Card>
              </View>
            </BlurView>
          </ImageBackground>
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Rentals List */}
        <View style={styles.rentalsSection}>
        {rentals.map((rental) => (
          <Card key={rental.id} style={styles.rentalCard}>
            <View style={styles.rentalHeader}>
              <View style={styles.rentalHeaderLeft}>
                <View style={styles.rentalIdContainer}>
                  <Text style={styles.rentalId}>{rental.id}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      rental.status === 'Active' && styles.statusActive,
                      rental.status === 'Pending' && styles.statusPending,
                    ]}
                  >
                    <Text style={styles.statusText}>{rental.status}</Text>
                  </View>
                </View>
                <View style={styles.ownerInfo}>
                  <Text style={styles.ownerName}>{rental.owner}</Text>
                  <Text style={styles.ownerId}>ID: {rental.ownerId} • {rental.type}</Text>
                </View>
              </View>
            </View>

            <View style={styles.rentalDetails}>
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <KeyRound size={18} color={COLORS.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>{t('admin.rentalManagement.vehicle')}</Text>
                  <Text style={styles.detailValue}>{rental.vehicle} ({rental.vehicleNumber})</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <MapPin size={18} color={COLORS.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>{t('admin.rentalManagement.location')}</Text>
                  <Text style={styles.detailValue}>{rental.location}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Calendar size={18} color={COLORS.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>{t('admin.rentalManagement.dateTime')}</Text>
                  <Text style={styles.detailValue}>{rental.date} • {rental.time}</Text>
                </View>
              </View>

              <View style={styles.rentalMetrics}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{rental.price}</Text>
                  <Text style={styles.metricLabel}>{t('admin.rentalManagement.perHour')}</Text>
                </View>
              </View>
            </View>

            <View style={styles.rentalActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('RentalDetails' as never, { rentalId: rental.id } as never)}
              >
                <Text style={styles.actionButtonText}>{t('admin.rentalManagement.viewDetails')}</Text>
              </TouchableOpacity>
              {rental.status === 'Pending' && (
                <TouchableOpacity style={[styles.actionButton, styles.approveButton]}>
                  <CheckCircle size={16} color={COLORS.white} />
                  <Text style={[styles.actionButtonText, styles.approveButtonText]}>{t('admin.rentalManagement.approve')}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.actionButton, styles.suspendButton]}>
                <AlertCircle size={16} color={COLORS.error} />
                <Text style={[styles.actionButtonText, styles.suspendButtonText]}>{t('admin.rentalManagement.suspend')}</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
        </View>

        {/* Pagination */}
        <View style={styles.pagination}>
          <TouchableOpacity style={styles.pageButton}>
            <Text style={styles.pageButtonText}>{t('admin.rentalManagement.previous')}</Text>
          </TouchableOpacity>
          <View style={styles.pageNumbers}>
            <TouchableOpacity style={[styles.pageNumber, styles.pageNumberActive]}>
              <Text style={[styles.pageNumberText, styles.pageNumberTextActive]}>1</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pageNumber}>
              <Text style={styles.pageNumberText}>2</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pageNumber}>
              <Text style={styles.pageNumberText}>3</Text>
            </TouchableOpacity>
            <Text style={styles.pageEllipsis}>...</Text>
          </View>
          <TouchableOpacity style={styles.pageButton}>
            <Text style={styles.pageButtonText}>{t('admin.rentalManagement.next')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.paginationInfo}>{t('admin.rentalManagement.showing', { start: 1, end: 10, total: stats.total.toLocaleString() })}</Text>
      </ScrollView>
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
    paddingVertical: SPACING.md,
    paddingTop: SPACING.xl,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xl,
    color: COLORS.white,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: SPACING.sm,
  },
  headerRight: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconButton: {
    padding: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  imageContainer: {
    width: '100%',
    height: 280,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7, 25, 82, 0.75)',
  },
  blurContainer: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  statCard: {
    width: (width - SPACING.md * 3) / 2,
    height: 100,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.sm,
    backgroundColor: COLORS.white + '95',
    position: 'relative',
  },
  statTrendTopRight: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  statContent: {
    flex: 1,
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xl,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: SPACING.xs / 2,
  },
  statLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.white + 'CC',
  },
  statTrendText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.success,
    fontWeight: '600',
  },
  tabsContainer: {
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  tab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.white,
  },
  rentalsSection: {
    paddingHorizontal: SPACING.md,
  },
  rentalCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  rentalHeader: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rentalHeaderLeft: {
    flex: 1,
  },
  rentalIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  rentalId: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.lightGray,
  },
  statusActive: {
    backgroundColor: COLORS.success + '20',
  },
  statusPending: {
    backgroundColor: COLORS.warning + '20',
  },
  statusText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.text,
    fontWeight: '600',
  },
  ownerInfo: {
    marginTop: SPACING.xs,
  },
  ownerName: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  ownerId: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  rentalDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  rentalMetrics: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  metricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray + '40',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
  },
  metricValue: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  metricLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  rentalActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary + '20',
    gap: SPACING.xs,
  },
  actionButtonText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  approveButtonText: {
    color: COLORS.white,
  },
  suspendButton: {
    backgroundColor: COLORS.error + '20',
  },
  suspendButtonText: {
    color: COLORS.error,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  pageButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pageButtonText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  pageNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  pageNumber: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageNumberActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pageNumberText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
  },
  pageNumberTextActive: {
    color: COLORS.white,
  },
  pageEllipsis: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  paginationInfo: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
});

export default RentalManagementScreen;
