import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, AlertTriangle, Lightbulb, MessageSquare, Send, CreditCard, XCircle } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '@constants/theme';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { useLanguage } from '@context/LanguageContext';

const { width } = Dimensions.get('window');

const FeedbackScreen = () => {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const [feedbackType, setFeedbackType] = useState<'issue' | 'suggestion' | 'complaint' | null>(null);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const feedbackTypes = [
    { id: 'issue', label: t('feedback.complaint'), icon: CreditCard, color: COLORS.error },
    { id: 'suggestion', label: t('feedback.suggestion'), icon: Lightbulb, color: COLORS.primary },
    { id: 'complaint', label: t('feedback.complaint'), icon: XCircle, color: COLORS.warning },
  ];

  const handleSubmit = () => {
    if (!feedbackType) {
      Alert.alert(t('common.error'), t('feedback.selectType'));
      return;
    }
    if (!subject.trim()) {
      Alert.alert(t('common.error'), t('feedback.enterSubject'));
      return;
    }
    if (!description.trim()) {
      Alert.alert(t('common.error'), t('feedback.enterDescription'));
      return;
    }

    // In real app, submit to backend
    Alert.alert(
      t('common.success'),
      t('feedback.submitSuccess'),
      [
        {
          text: t('common.ok'),
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('feedback.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Feedback Image */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../../../assets/feedback.png')}
            style={styles.feedbackImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.description}>
          {t('feedback.description')}
        </Text>

        {/* Feedback Type Selection */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{t('feedback.type')} *</Text>
          <View style={styles.feedbackTypesContainer}>
            {feedbackTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.feedbackTypeCard,
                  feedbackType === type.id && styles.feedbackTypeCardSelected,
                  feedbackType === type.id && { borderColor: type.color },
                ]}
                onPress={() => setFeedbackType(type.id as any)}
              >
                <View style={styles.feedbackTypeIconContainer}>
                  {React.createElement(type.icon, {
                    size: 32,
                    color: feedbackType === type.id ? type.color : COLORS.textSecondary,
                  })}
                </View>
                <Text
                  style={[
                    styles.feedbackTypeLabel,
                    feedbackType === type.id && { color: type.color },
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Subject Input */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{t('feedback.subject')} *</Text>
          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
            placeholder={t('feedback.subjectPlaceholder')}
            placeholderTextColor={COLORS.textSecondary}
            maxLength={100}
          />
          <Text style={styles.charCount}>{subject.length}/100</Text>
        </Card>

        {/* Description Input */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{t('feedback.message')} *</Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder={t('feedback.descriptionPlaceholder')}
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </Card>

        {/* Priority Selection */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{t('feedback.priority')}</Text>
          <View style={styles.priorityContainer}>
            <TouchableOpacity
              style={[
                styles.priorityButton,
                priority === 'high' && styles.priorityButtonSelected,
                priority === 'high' && styles.priorityHigh,
              ]}
              onPress={() => setPriority('high')}
            >
              <Text
                style={[
                  styles.priorityText,
                  priority === 'high' && styles.priorityTextSelected,
                ]}
              >
                High
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.priorityButton,
                priority === 'medium' && styles.priorityButtonSelected,
                priority === 'medium' && styles.priorityMedium,
              ]}
              onPress={() => setPriority('medium')}
            >
              <Text
                style={[
                  styles.priorityText,
                  priority === 'medium' && styles.priorityTextSelected,
                ]}
              >
                Medium
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.priorityButton,
                priority === 'low' && styles.priorityButtonSelected,
                priority === 'low' && styles.priorityLow,
              ]}
              onPress={() => setPriority('low')}
            >
              <Text
                style={[
                  styles.priorityText,
                  priority === 'low' && styles.priorityTextSelected,
                ]}
              >
                Low
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Additional Info */}
        <View style={styles.infoCard}>
          <MessageSquare size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Your feedback will be reviewed by our support team. We typically respond within 24-48 hours.
          </Text>
        </View>

        {/* Submit Button */}
        <Button
          title={t('feedback.submit')}
          onPress={handleSubmit}
          variant="primary"
          size="large"
          style={styles.submitButton}
          icon={<Send size={20} color={COLORS.white} />}
        />
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: -1,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    marginBottom: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  feedbackImage: {
    width: '100%',
    height: '100%',
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  card: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  cardTitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  feedbackTypesContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    flexWrap: 'wrap',
  },
  feedbackTypeCard: {
    flex: 1,
    minWidth: '30%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  feedbackTypeCardSelected: {
    borderWidth: 2,
    backgroundColor: COLORS.primary + '10',
  },
  feedbackTypeIconContainer: {
    marginBottom: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackTypeLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  input: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
  },
  textArea: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    minHeight: 120,
  },
  charCount: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityButtonSelected: {
    borderWidth: 2,
  },
  priorityHigh: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + '10',
  },
  priorityMedium: {
    borderColor: COLORS.warning,
    backgroundColor: COLORS.warning + '10',
  },
  priorityLow: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + '10',
  },
  priorityText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  priorityTextSelected: {
    color: COLORS.primary,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: 'transparent',
    borderWidth: 0,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  submitButton: {
    marginTop: SPACING.md,
  },
});

export default FeedbackScreen;
