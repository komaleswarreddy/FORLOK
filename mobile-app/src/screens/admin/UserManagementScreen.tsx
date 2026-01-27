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
  Users,
  CheckCircle,
  AlertCircle,
  Shield,
  Clock,
  UserCheck,
  Building2,
  TrendingUp,
  Download,
} from 'lucide-react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '@constants/theme';
import { Card } from '@components/common/Card';
import { useLanguage } from '@context/LanguageContext';

const { width } = Dimensions.get('window');

const UserManagementScreen = () => {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('All');

  const tabs = [
    t('common.all'),
    t('admin.userManagement.individual'),
    t('admin.userManagement.company'),
    t('admin.userManagement.verified'),
    t('admin.userManagement.pending'),
    t('admin.userManagement.suspended'),
  ];

  const users = [
    {
      id: '12345',
      name: 'Rajesh K.',
      type: 'Individual',
      status: 'Verified',
      joined: '15 Jan 2024',
    },
    {
      id: '67890',
      name: 'Priya M.',
      type: 'Individual',
      status: 'Verified',
      joined: '14 Jan 2024',
    },
    {
      id: 'COMP001',
      name: 'ABC Cars',
      type: 'Company',
      status: 'Verified',
      joined: '10 Jan 2024',
    },
    {
      id: '22222',
      name: 'Amit S.',
      type: 'Individual',
      status: 'Pending',
      joined: '16 Jan 2024',
    },
  ];

  const stats = {
    total: 45678,
    individual: 38456,
    company: 7222,
    verified: 42100,
    pending: 3578,
    suspended: 23,
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Blue Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('admin.userManagement.title')}</Text>
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
                    <Text style={styles.statTrendText}>+25%</Text>
                  </View>
                  <View style={styles.statIconContainer}>
                    <Users size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>{stats.total.toLocaleString()}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>{t('admin.userManagement.totalUsers')}</Text>
                  </View>
                </Card>

                <Card style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: COLORS.primary + '30' }]}>
                    <UserCheck size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>{stats.individual.toLocaleString()}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>{t('admin.userManagement.individual')}</Text>
                  </View>
                </Card>

                <Card style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: COLORS.warning + '30' }]}>
                    <Building2 size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>{stats.company.toLocaleString()}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>{t('admin.userManagement.company')}</Text>
                  </View>
                </Card>

                <Card style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: COLORS.success + '30' }]}>
                    <CheckCircle size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>{stats.verified.toLocaleString()}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>{t('admin.userManagement.verified')}</Text>
                  </View>
                </Card>

                <Card style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: COLORS.warning + '30' }]}>
                    <Clock size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>{stats.pending.toLocaleString()}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>{t('admin.userManagement.pending')}</Text>
                  </View>
                </Card>

                <Card style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: COLORS.error + '30' }]}>
                    <Shield size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>{stats.suspended}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>{t('admin.userManagement.suspended')}</Text>
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

        {/* Users List */}
        <View style={styles.usersSection}>
        {users.map((user) => (
          <Card key={user.id} style={styles.userCard}>
            <View style={styles.userHeader}>
              <View>
                <Text style={styles.userId}>User ID: {user.id}</Text>
                <Text style={styles.userName}>{user.name}</Text>
              </View>
              <View style={[styles.statusBadge, user.status === 'Verified' ? styles.statusVerified : styles.statusPending]}>
                <Text style={styles.statusText}>{user.status}</Text>
              </View>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userDetail}>
                <Text style={styles.detailLabel}>Type:</Text> {user.type}
              </Text>
              <Text style={styles.userDetail}>
                <Text style={styles.detailLabel}>Joined:</Text> {user.joined}
              </Text>
            </View>
            <View style={styles.userActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('UserDetails' as never, { userId: user.id } as never)}
              >
                <Text style={styles.actionButtonText}>View</Text>
              </TouchableOpacity>
              {user.status === 'Pending' && (
                <TouchableOpacity style={[styles.actionButton, styles.verifyButton]}>
                  <CheckCircle size={16} color={COLORS.white} />
                  <Text style={[styles.actionButtonText, styles.verifyButtonText]}>Verify</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.actionButton, styles.suspendButton]}>
                <AlertCircle size={16} color={COLORS.error} />
                <Text style={[styles.actionButtonText, styles.suspendButtonText]}>Suspend</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
        </View>

        {/* Pagination */}
        <View style={styles.pagination}>
          <TouchableOpacity style={styles.pageButton}>
            <Text style={styles.pageButtonText}>{t('admin.userManagement.previous')}</Text>
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
            <Text style={styles.pageButtonText}>{t('admin.userManagement.next')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.paginationInfo}>{t('admin.userManagement.showing', { start: 1, end: 10, total: stats.total.toLocaleString() })}</Text>
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
    height: 420,
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
  usersSection: {
    paddingHorizontal: SPACING.md,
  },
  userCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  userId: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs / 2,
  },
  userName: {
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
  statusVerified: {
    backgroundColor: COLORS.success + '30',
  },
  statusPending: {
    backgroundColor: COLORS.warning + '30',
  },
  statusText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.text,
    fontWeight: '600',
  },
  userDetails: {
    marginBottom: SPACING.sm,
  },
  userDetail: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  detailLabel: {
    fontWeight: '600',
    color: COLORS.text,
  },
  userActions: {
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
  verifyButton: {
    backgroundColor: COLORS.success,
  },
  verifyButtonText: {
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

export default UserManagementScreen;
