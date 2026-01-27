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
  Download,
  Clock,
  TrendingUp,
  DollarSign,
  Car,
  KeyRound,
  FileText,
} from 'lucide-react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '@constants/theme';
import { Card } from '@components/common/Card';
import { useLanguage } from '@context/LanguageContext';

const { width } = Dimensions.get('window');

const RidesHistoryScreen = () => {
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState('All');

  const transactions = [
    {
      id: 'YA20240115001',
      userName: 'Rajesh K.',
      service: 'Car Pool',
      date: '15 Jan 2024',
      route: 'Bangalore → Mumbai',
      revenue: '₹450',
      status: 'Completed',
    },
    {
      id: 'YA20240115002',
      userName: 'Priya M.',
      service: 'Rental',
      date: '15 Jan 2024',
      route: 'Honda City, 4 hours',
      revenue: '₹3,200',
      status: 'Completed',
    },
    {
      id: 'YA20240114001',
      userName: 'Amit S.',
      service: 'Bike Pool',
      date: '14 Jan 2024',
      route: 'Pune → Mumbai',
      revenue: '₹300',
      status: 'Completed',
    },
  ];

  const summary = {
    total: 123456,
    totalRevenue: 24567890,
    pooling: { count: 89234, revenue: 8945000 },
    rentals: { count: 34222, revenue: 15622890 },
  };

  const stats = {
    total: summary.total,
    revenue: summary.totalRevenue,
    pooling: summary.pooling.count,
    rentals: summary.rentals.count,
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Blue Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('admin.ridesHistory.title')}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Search size={20} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Filter size={20} color={COLORS.white} />
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
                    <Text style={styles.statTrendText}>+18%</Text>
                  </View>
                  <View style={styles.statIconContainer}>
                    <Clock size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>{stats.total.toLocaleString()}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>Total Rides</Text>
                  </View>
                </Card>

                <Card style={styles.statCard}>
                  <View style={styles.statTrendTopRight}>
                    <TrendingUp size={12} color={COLORS.success} />
                    <Text style={styles.statTrendText}>+22%</Text>
                  </View>
                  <View style={[styles.statIconContainer, { backgroundColor: COLORS.success + '30' }]}>
                    <DollarSign size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>₹{(stats.revenue / 10000000).toFixed(1)}Cr</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>Total Revenue</Text>
                  </View>
                </Card>

                <Card style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: COLORS.primary + '30' }]}>
                    <Car size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>{stats.pooling.toLocaleString()}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>Pooling</Text>
                  </View>
                </Card>

                <Card style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: COLORS.warning + '30' }]}>
                    <KeyRound size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>{stats.rentals.toLocaleString()}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>Rentals</Text>
                  </View>
                </Card>
              </View>
            </BlurView>
          </ImageBackground>
        </View>

        {/* Export Options - Moved to Top */}
        <View style={styles.exportOptions}>
          <TouchableOpacity style={styles.exportButton}>
            <Download size={18} color={COLORS.white} />
            <Text style={styles.exportButtonText}>{t('admin.ridesHistory.exportCSV')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportButton}>
            <FileText size={18} color={COLORS.white} />
            <Text style={styles.exportButtonText}>{t('admin.ridesHistory.exportPDF')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportButton}>
            <FileText size={18} color={COLORS.white} />
            <Text style={styles.exportButtonText}>{t('admin.ridesHistory.generateReport')}</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Options */}
        <Card style={styles.filterCard}>
          <Text style={styles.filterTitle}>{t('admin.ridesHistory.filterOptions')}:</Text>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>{t('admin.ridesHistory.serviceType')}:</Text>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[styles.filterButton, activeFilter === 'All' && styles.filterButtonActive]}
                onPress={() => setActiveFilter('All')}
              >
                <Text style={[styles.filterButtonText, activeFilter === 'All' && styles.filterButtonTextActive]}>{t('common.all')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, activeFilter === 'Pooling' && styles.filterButtonActive]}
                onPress={() => setActiveFilter('Pooling')}
              >
                <Text style={[styles.filterButtonText, activeFilter === 'Pooling' && styles.filterButtonTextActive]}>{t('admin.ridesHistory.pooling')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, activeFilter === 'Rental' && styles.filterButtonActive]}
                onPress={() => setActiveFilter('Rental')}
              >
                <Text style={[styles.filterButtonText, activeFilter === 'Rental' && styles.filterButtonTextActive]}>{t('admin.ridesHistory.rentals')}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.filterActions}>
            <TouchableOpacity style={styles.applyButton}>
              <Text style={styles.applyButtonText}>{t('admin.ridesHistory.applyFilters')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetButton}>
              <Text style={styles.resetButtonText}>{t('common.reset')}</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Transaction Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{t('admin.ridesHistory.transactionSummary')}:</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{summary.total.toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>{t('admin.ridesHistory.totalTransactions')}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>₹{(summary.totalRevenue / 10000000).toFixed(1)}Cr</Text>
              <Text style={styles.summaryLabel}>{t('admin.ridesHistory.totalRevenue')}</Text>
            </View>
          </View>
          <View style={styles.summaryBreakdown}>
            <Text style={styles.breakdownItem}>
              • {t('admin.ridesHistory.pooling')}: {summary.pooling.count.toLocaleString()} (₹{(summary.pooling.revenue / 1000000).toFixed(1)}M)
            </Text>
            <Text style={styles.breakdownItem}>
              • {t('admin.ridesHistory.rentals')}: {summary.rentals.count.toLocaleString()} (₹{(summary.rentals.revenue / 1000000).toFixed(1)}M)
            </Text>
          </View>
        </Card>

        {/* Transaction List */}
        <Text style={styles.sectionTitle}>{t('admin.ridesHistory.transactionList')}:</Text>
        <View style={styles.transactionsSection}>
        {transactions.map((transaction) => (
          <Card key={transaction.id} style={styles.transactionCard}>
            <View style={styles.transactionHeader}>
              <Text style={styles.transactionId}>#{transaction.id}</Text>
              <View style={[styles.statusBadge, styles.statusCompleted]}>
                <Text style={styles.statusText}>{transaction.status}</Text>
              </View>
            </View>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionDetail}>
                <Text style={styles.detailLabel}>User:</Text> {transaction.userName}
              </Text>
              <Text style={styles.transactionDetail}>
                <Text style={styles.detailLabel}>Service:</Text> {transaction.service}
              </Text>
              <Text style={styles.transactionDetail}>
                <Text style={styles.detailLabel}>Date:</Text> {transaction.date}
              </Text>
              <Text style={styles.transactionDetail}>
                <Text style={styles.detailLabel}>Route:</Text> {transaction.route}
              </Text>
              <Text style={styles.transactionDetail}>
                <Text style={styles.detailLabel}>Revenue:</Text> {transaction.revenue}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => navigation.navigate('TransactionDetails' as never, { transactionId: transaction.id } as never)}
            >
              <Text style={styles.detailsButtonText}>View Details</Text>
            </TouchableOpacity>
          </Card>
        ))}
        </View>

        {/* Pagination */}
        <View style={styles.pagination}>
          <TouchableOpacity style={styles.pageButton}>
            <Text style={styles.pageButtonText}>{t('admin.ridesHistory.previous')}</Text>
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
            <Text style={styles.pageButtonText}>{t('admin.ridesHistory.next')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.paginationInfo}>
          {t('admin.ridesHistory.showing', { start: 1, end: 10, total: summary.total.toLocaleString() })}
        </Text>
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
  exportOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary,
    gap: SPACING.xs,
  },
  exportButtonText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
  filterCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  filterTitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  filterRow: {
    marginBottom: SPACING.sm,
  },
  filterLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.lightGray + '40',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  filterActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  applyButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    fontWeight: '600',
  },
  resetButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
  },
  resetButtonText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  summaryCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  summaryTitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.lightGray + '40',
    borderRadius: BORDER_RADIUS.md,
  },
  summaryValue: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xl,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  summaryBreakdown: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  breakdownItem: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.lg,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  transactionsSection: {
    paddingHorizontal: SPACING.md,
  },
  transactionCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  transactionId: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusCompleted: {
    backgroundColor: COLORS.success + '30',
  },
  statusText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.text,
    fontWeight: '600',
  },
  transactionDetails: {
    marginBottom: SPACING.sm,
  },
  transactionDetail: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  detailLabel: {
    fontWeight: '600',
    color: COLORS.text,
  },
  detailsButton: {
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  detailsButtonText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    fontWeight: '600',
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

export default RidesHistoryScreen;
