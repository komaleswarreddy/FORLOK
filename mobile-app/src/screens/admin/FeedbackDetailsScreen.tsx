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
import { useNavigation, useRoute } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import {
  ArrowLeft,
  CreditCard,
  Lightbulb,
  XCircle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  MessageSquare,
  AlertCircle,
  Download,
  Send,
} from 'lucide-react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '@constants/theme';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { useLanguage } from '@context/LanguageContext';

const { width } = Dimensions.get('window');

const FeedbackDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { feedbackId } = route.params as { feedbackId: string };

  // Mock feedback data - in real app, fetch based on feedbackId
  const feedback = {
    id: feedbackId || 'FB20240115001',
    type: 'Payment Issue',
    user: 'Rajesh K.',
    userId: '12345',
    email: 'rajesh.k@example.com',
    phone: '+91 98765 43210',
    submitted: '15 Jan 2024, 10:30 AM',
    status: 'Pending',
    priority: 'High',
    subject: 'Payment not processed for ride booking',
    description: 'I booked a ride on 14th January but the payment was not processed. I received a confirmation but the amount was not deducted from my account. Please investigate and resolve this issue.',
    attachments: [],
    responses: [],
    icon: CreditCard,
  };

  const IconComponent = feedback.icon;

  const getStatusColor = () => {
    switch (feedback.status) {
      case 'Pending':
        return COLORS.warning;
      case 'Acknowledged':
        return COLORS.primary;
      case 'Resolved':
        return COLORS.success;
      default:
        return COLORS.textSecondary;
    }
  };

  const getPriorityColor = () => {
    switch (feedback.priority) {
      case 'High':
        return COLORS.error;
      case 'Medium':
        return COLORS.warning;
      case 'Low':
        return COLORS.success;
      default:
        return COLORS.textSecondary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Blue Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('admin.feedbackDetails.title')}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Download size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Image Background */}
        <View style={styles.imageContainer}>
          <ImageBackground
            source={require('../../../assets/feedback.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            <View style={styles.overlay} />
            <BlurView intensity={50} style={styles.blurContainer}>
              <View style={styles.feedbackHeaderContent}>
                <View style={styles.feedbackIconContainer}>
                  <IconComponent size={48} color={COLORS.white} />
                </View>
                <Text style={styles.feedbackTypeText}>{feedback.type}</Text>
                <View style={styles.feedbackIdBadge}>
                  <Text style={styles.feedbackIdText}>{feedback.id}</Text>
                </View>
              </View>
            </BlurView>
          </ImageBackground>
        </View>

        {/* Status and Priority */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>{feedback.status === 'Pending' ? t('admin.feedbackDetails.pending') : feedback.status === 'Acknowledged' ? t('admin.feedbackDetails.acknowledged') : feedback.status === 'Resolved' ? t('admin.feedbackDetails.resolved') : feedback.status}</Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() + '20' }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor() }]}>{feedback.priority} Priority</Text>
          </View>
        </View>

        {/* User Information */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <User size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>User Information</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{feedback.user}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User ID:</Text>
            <Text style={styles.infoValue}>{feedback.userId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{feedback.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{feedback.phone}</Text>
          </View>
        </Card>

        {/* Feedback Details */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <MessageSquare size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Feedback Details</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Subject:</Text>
            <Text style={styles.infoValue}>{feedback.subject}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Description:</Text>
            <Text style={styles.infoDescription}>{feedback.description}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoIconRow}>
              <Calendar size={16} color={COLORS.textSecondary} />
              <Text style={styles.infoLabel}>Submitted:</Text>
            </View>
            <Text style={styles.infoValue}>{feedback.submitted}</Text>
          </View>
        </Card>

        {/* Response Section */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <MessageSquare size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Response</Text>
          </View>
          {feedback.responses && feedback.responses.length > 0 ? (
            <View style={styles.responseContainer}>
              {feedback.responses.map((response: any, index: number) => (
                <View key={index} style={styles.responseItem}>
                  <Text style={styles.responseText}>{response.text}</Text>
                  <Text style={styles.responseDate}>{response.date}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noResponseContainer}>
              <Text style={styles.noResponseText}>No response yet</Text>
            </View>
          )}
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {feedback.status === 'Pending' && (
            <Button
              title="ACKNOWLEDGE"
              onPress={() => {}}
              variant="primary"
              size="large"
              style={styles.actionButton}
              icon={<CheckCircle size={20} color={COLORS.white} />}
            />
          )}
          {feedback.status !== 'Resolved' && (
            <Button
              title="RESOLVE"
              onPress={() => {}}
              variant="outline"
              size="large"
              style={styles.actionButton}
              icon={<CheckCircle size={20} color={COLORS.success} />}
            />
          )}
          {feedback.status === 'Resolved' && (
            <Button
              title="ARCHIVE"
              onPress={() => {}}
              variant="outline"
              size="large"
              style={styles.actionButton}
            />
          )}
          <Button
            title="SEND RESPONSE"
            onPress={() => {}}
            variant="primary"
            size="large"
            style={styles.actionButton}
            icon={<Send size={20} color={COLORS.white} />}
          />
        </View>
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
    height: 200,
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
    alignItems: 'center',
  },
  feedbackHeaderContent: {
    alignItems: 'center',
  },
  feedbackIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  feedbackTypeText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xl,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  feedbackIdBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white + '20',
  },
  feedbackIdText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  statusText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  priorityText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  card: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cardTitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.lg,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    alignItems: 'flex-start',
  },
  infoIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  infoLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
    width: 100,
  },
  infoValue: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    flex: 1,
  },
  infoDescription: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    flex: 1,
    lineHeight: 20,
    marginTop: SPACING.xs,
  },
  responseContainer: {
    marginTop: SPACING.sm,
  },
  responseItem: {
    padding: SPACING.md,
    backgroundColor: COLORS.lightGray + '40',
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  responseText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  responseDate: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  noResponseContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  noResponseText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  actionsContainer: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  actionButton: {
    marginBottom: SPACING.sm,
  },
});

export default FeedbackDetailsScreen;
