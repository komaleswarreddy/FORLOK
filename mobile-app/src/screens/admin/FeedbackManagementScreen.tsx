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
  AlertTriangle,
  Lightbulb,
  XCircle,
  CheckCircle,
  CreditCard,
  MessageSquare,
  Clock,
  Shield,
  TrendingUp,
  Download,
} from 'lucide-react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '@constants/theme';
import { Card } from '@components/common/Card';
import { useLanguage } from '@context/LanguageContext';

const { width } = Dimensions.get('window');

const FeedbackManagementScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'Pending', 'Acknowledged', 'Resolved', 'Archived'];

  const feedbacks = [
    {
      id: 'FB20240115001',
      type: 'Payment Issue',
      user: 'Rajesh K.',
      userId: '12345',
      submitted: '15 Jan 2024, 10:30 AM',
      status: 'Pending',
      priority: 'High',
      icon: CreditCard,
    },
    {
      id: 'FB20240115002',
      type: 'Feature Suggestion',
      user: 'Priya M.',
      userId: '67890',
      submitted: '14 Jan 2024, 3:45 PM',
      status: 'Acknowledged',
      priority: 'Medium',
      icon: Lightbulb,
    },
    {
      id: 'FB20240114001',
      type: 'Complaint',
      user: 'Amit S.',
      userId: '11111',
      submitted: '13 Jan 2024, 11:20 AM',
      status: 'Resolved',
      priority: 'High',
      icon: XCircle,
    },
  ];

  const stats = {
    total: 1234,
    pending: 45,
    acknowledged: 234,
    resolved: 890,
    avgResponseTime: '2.5 hours',
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Blue Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('admin.feedbackManagement.title')}</Text>
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
            source={require('../../../assets/feedback.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            <View style={styles.overlay} />
            <BlurView intensity={50} style={styles.blurContainer}>
              <View style={styles.statsContainer}>
                <Card style={styles.statCard}>
                  <View style={styles.statTrendTopRight}>
                    <TrendingUp size={12} color={COLORS.success} />
                    <Text style={styles.statTrendText}>+20%</Text>
                  </View>
                  <View style={styles.statIconContainer}>
                    <MessageSquare size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>{stats.total.toLocaleString()}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>{t('admin.feedbackManagement.total')}</Text>
                  </View>
                </Card>

                <Card style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: COLORS.warning + '30' }]}>
                    <Clock size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>{stats.pending}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>{t('admin.feedbackManagement.pending')}</Text>
                  </View>
                </Card>

                <Card style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: COLORS.primary + '30' }]}>
                    <CheckCircle size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>{stats.acknowledged}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>{t('admin.feedbackManagement.acknowledged')}</Text>
                  </View>
                </Card>

                <Card style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: COLORS.success + '30' }]}>
                    <CheckCircle size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>{stats.resolved}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>{t('admin.feedbackManagement.resolved')}</Text>
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

        {/* Feedbacks List */}
        <View style={styles.feedbacksSection}>
        {feedbacks.map((feedback) => {
          const IconComponent = feedback.icon;
          return (
            <Card key={feedback.id} style={styles.feedbackCard}>
              <View style={styles.feedbackHeader}>
                <View style={styles.feedbackHeaderLeft}>
                  <View style={styles.feedbackIdContainer}>
                    <Text style={styles.feedbackId}>{feedback.id}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        feedback.status === 'Pending' && styles.statusPending,
                        feedback.status === 'Resolved' && styles.statusResolved,
                        feedback.status === 'Acknowledged' && styles.statusAcknowledged,
                      ]}
                    >
                      <Text style={styles.statusText}>{feedback.status === 'Pending' ? t('admin.feedbackManagement.pending') : feedback.status === 'Resolved' ? t('admin.feedbackManagement.resolved') : feedback.status === 'Acknowledged' ? t('admin.feedbackManagement.acknowledged') : feedback.status}</Text>
                    </View>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{feedback.user}</Text>
                    <Text style={styles.userId}>{t('admin.feedbackManagement.id')}: {feedback.userId}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.feedbackDetails}>
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <IconComponent size={18} color={COLORS.primary} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Feedback Type</Text>
                    <Text style={styles.detailValue}>{feedback.type}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <Clock size={18} color={COLORS.primary} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Submitted</Text>
                    <Text style={styles.detailValue}>{feedback.submitted}</Text>
                  </View>
                </View>

                <View style={styles.feedbackMetrics}>
                  <View style={styles.metricItem}>
                    <View style={[
                      styles.priorityBadge,
                      feedback.priority === 'High' && styles.priorityHigh,
                      feedback.priority === 'Medium' && styles.priorityMedium,
                      feedback.priority === 'Low' && styles.priorityLow,
                    ]}>
                      <Text style={styles.priorityText}>{feedback.priority} Priority</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.feedbackActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('FeedbackDetails' as never, { feedbackId: feedback.id } as never)}
                >
                  <Text style={styles.actionButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </Card>
          );
        })}
        </View>

        {/* Pagination */}
        <View style={styles.pagination}>
          <TouchableOpacity style={styles.pageButton}>
            <Text style={styles.pageButtonText}>{t('admin.feedbackManagement.previous')}</Text>
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
            <Text style={styles.pageButtonText}>{t('admin.feedbackManagement.next')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.paginationInfo}>{t('admin.feedbackManagement.showing', { start: 1, end: 10, total: stats.total.toLocaleString() })}</Text>
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
  feedbacksSection: {
    paddingHorizontal: SPACING.md,
  },
  feedbackCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  feedbackHeader: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  feedbackHeaderLeft: {
    flex: 1,
  },
  feedbackIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  feedbackId: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  userInfo: {
    marginTop: SPACING.xs,
  },
  userName: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  userId: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  feedbackDetails: {
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
  feedbackMetrics: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  metricItem: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.lightGray,
  },
  statusPending: {
    backgroundColor: COLORS.warning + '20',
  },
  statusResolved: {
    backgroundColor: COLORS.success + '20',
  },
  statusAcknowledged: {
    backgroundColor: COLORS.primary + '20',
  },
  statusText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.text,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.lightGray,
    alignSelf: 'flex-start',
  },
  priorityHigh: {
    backgroundColor: COLORS.error + '20',
  },
  priorityMedium: {
    backgroundColor: COLORS.warning + '20',
  },
  priorityLow: {
    backgroundColor: COLORS.success + '20',
  },
  priorityText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.text,
    fontWeight: '600',
  },
  feedbackActions: {
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

export default FeedbackManagementScreen;
