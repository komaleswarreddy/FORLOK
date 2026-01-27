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
  Car,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  TrendingUp,
  Clock,
  Shield,
  Download,
} from 'lucide-react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '@constants/theme';
import { Card } from '@components/common/Card';
import { Input } from '@components/common/Input';
import { useLanguage } from '@context/LanguageContext';

const { width } = Dimensions.get('window');

const PoolingManagementScreen = () => {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    t('common.all'),
    t('admin.poolingManagement.active'),
    t('admin.poolingManagement.pending'),
    t('admin.poolingManagement.expired'),
    t('admin.poolingManagement.suspended'),
    t('admin.poolingManagement.flagged'),
  ];

  // Mock data
  const offers = [
    {
      id: 'POOL20240115001',
      driver: 'Rajesh K.',
      driverId: '12345',
      route: 'Bangalore → Mumbai',
      date: '15 Jan 2024, 9:00 AM',
      vehicle: 'Car (Honda City)',
      seats: '2/4',
      price: '₹450',
      status: 'Active',
    },
    {
      id: 'POOL20240115002',
      driver: 'Priya M.',
      driverId: '67890',
      route: 'Delhi → Jaipur',
      date: '16 Jan 2024, 10:30 AM',
      vehicle: 'Car (Maruti Swift)',
      seats: '1/3',
      price: '₹500',
      status: 'Active',
    },
    {
      id: 'POOL20240115003',
      driver: 'Amit S.',
      driverId: '11111',
      route: 'Pune → Mumbai',
      date: '17 Jan 2024, 11:00 AM',
      vehicle: 'Bike (Royal Enfield)',
      seats: '0/1',
      price: '₹300',
      status: 'Pending',
    },
  ];

  const stats = {
    total: 12345,
    active: 8234,
    pending: 456,
    suspended: 23,
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Blue Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('admin.poolingManagement.title')}</Text>
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
            source={require('../../../assets/pooling.jpg')}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            <View style={styles.overlay} />
            <BlurView intensity={50} style={styles.blurContainer}>
              <View style={styles.statsContainer}>
                <Card style={styles.statCard}>
                  <View style={styles.statTrendTopRight}>
                    <TrendingUp size={12} color={COLORS.success} />
                    <Text style={styles.statTrendText}>+12%</Text>
                  </View>
                  <View style={styles.statIconContainer}>
                    <Car size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>{stats.total.toLocaleString()}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>{t('admin.poolingManagement.totalOffers')}</Text>
                  </View>
                </Card>

                <Card style={styles.statCard}>
                  <View style={styles.statTrendTopRight}>
                    <TrendingUp size={12} color={COLORS.success} />
                    <Text style={styles.statTrendText}>+8%</Text>
                  </View>
                  <View style={[styles.statIconContainer, { backgroundColor: COLORS.success + '30' }]}>
                    <CheckCircle size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>{stats.active.toLocaleString()}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>{t('admin.poolingManagement.active')}</Text>
                  </View>
                </Card>

                <Card style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: COLORS.warning + '30' }]}>
                    <Clock size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>{stats.pending.toLocaleString()}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>{t('admin.poolingManagement.pending')}</Text>
                  </View>
                </Card>

                <Card style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: COLORS.error + '30' }]}>
                    <Shield size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>{stats.suspended}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>{t('admin.poolingManagement.suspended')}</Text>
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

        {/* Offers List */}
        <View style={styles.offersSection}>
        {offers.map((offer) => (
          <Card key={offer.id} style={styles.offerCard}>
            <View style={styles.offerHeader}>
              <View style={styles.offerHeaderLeft}>
                <View style={styles.offerIdContainer}>
                  <Text style={styles.offerId}>{offer.id}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      offer.status === 'Active' && styles.statusActive,
                      offer.status === 'Pending' && styles.statusPending,
                    ]}
                  >
                    <Text style={styles.statusText}>{offer.status}</Text>
                  </View>
                </View>
                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>{offer.driver}</Text>
                  <Text style={styles.driverId}>ID: {offer.driverId}</Text>
                </View>
              </View>
            </View>

            <View style={styles.offerDetails}>
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <MapPin size={18} color={COLORS.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>{t('admin.poolingManagement.route')}</Text>
                  <Text style={styles.detailValue}>{offer.route}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Calendar size={18} color={COLORS.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>{t('admin.poolingManagement.dateTime')}</Text>
                  <Text style={styles.detailValue}>{offer.date}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Car size={18} color={COLORS.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>{t('admin.poolingManagement.vehicle')}</Text>
                  <Text style={styles.detailValue}>{offer.vehicle}</Text>
                </View>
              </View>

              <View style={styles.offerMetrics}>
                <View style={styles.metricItem}>
                  <View style={styles.metricIconContainer}>
                    <Users size={16} color={COLORS.textSecondary} />
                  </View>
                  <Text style={styles.metricValue}>{offer.seats}</Text>
                  <Text style={styles.metricLabel}>{t('admin.poolingManagement.seats')}</Text>
                </View>
                <View style={styles.metricItem}>
                  <View style={styles.metricIconContainer}>
                    <IndianRupee size={16} color={COLORS.textSecondary} />
                  </View>
                  <Text style={styles.metricValue}>{offer.price}</Text>
                  <Text style={styles.metricLabel}>{t('admin.poolingManagement.perPerson')}</Text>
                </View>
              </View>
            </View>

            <View style={styles.offerActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('PoolingOfferDetails' as never, { offerId: offer.id } as never)}
              >
                <Text style={styles.actionButtonText}>{t('admin.poolingManagement.viewDetails')}</Text>
              </TouchableOpacity>
              {offer.status === 'Pending' && (
                <TouchableOpacity style={[styles.actionButton, styles.approveButton]}>
                  <CheckCircle size={16} color={COLORS.white} />
                  <Text style={[styles.actionButtonText, styles.approveButtonText]}>{t('admin.poolingManagement.approve')}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.actionButton, styles.suspendButton]}>
                <AlertCircle size={16} color={COLORS.error} />
                <Text style={[styles.actionButtonText, styles.suspendButtonText]}>{t('admin.poolingManagement.suspend')}</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
        </View>

        {/* Pagination */}
        <View style={styles.pagination}>
          <TouchableOpacity style={styles.pageButton}>
            <Text style={styles.pageButtonText}>{t('admin.poolingManagement.previous')}</Text>
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
            <Text style={styles.pageButtonText}>{t('admin.poolingManagement.next')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.paginationInfo}>{t('admin.poolingManagement.showing', { start: 1, end: 10, total: stats.total.toLocaleString() })}</Text>
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
  offerCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  offerHeader: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  offerHeaderLeft: {
    flex: 1,
  },
  offerIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  offerId: {
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
  driverInfo: {
    marginTop: SPACING.xs,
  },
  driverName: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  driverId: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  offerDetails: {
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
  offerMetrics: {
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
  metricIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
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
  offerActions: {
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
  flagButton: {
    backgroundColor: COLORS.warning + '20',
  },
  flagButtonText: {
    color: COLORS.warning,
  },
  offersSection: {
    paddingHorizontal: SPACING.md,
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
  },
  bulkActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
});

export default PoolingManagementScreen;
