import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Star } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '@constants/theme';
import { Button } from '@components/common/Button';
import { Card } from '@components/common/Card';
import { mockUsers, mockBookings } from '@constants/mockData';
import { useLanguage } from '@context/LanguageContext';

const RatingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useLanguage();
  const bookingId = (route.params as any)?.bookingId || 'booking1';
  const booking = mockBookings.find((b) => b.id === bookingId) || mockBookings[0];

  const [overallRating, setOverallRating] = useState(0);
  const [punctuality, setPunctuality] = useState(0);
  const [vehicleCondition, setVehicleCondition] = useState(0);
  const [driving, setDriving] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmit = () => {
    // Handle rating submission
    navigation.goBack();
  };

  const renderStars = (rating: number, onRatingChange: (rating: number) => void) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onRatingChange(star)}
            style={styles.starButton}
          >
            <Star
              size={32}
              color={star <= rating ? COLORS.warning : COLORS.lightGray}
              fill={star <= rating ? COLORS.warning : 'transparent'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('rating.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.userCard}>
          <Image
            source={{ uri: booking.driver?.photo || mockUsers.currentUser.profilePhoto }}
            style={styles.userPhoto}
          />
          <Text style={styles.userName}>{booking.driver?.name || t('bookingDetails.driver')}</Text>
        </Card>

        <Card style={styles.ratingCard}>
          <Text style={styles.ratingTitle}>{t('rating.howWasTrip')}</Text>
          {renderStars(overallRating, setOverallRating)}
          <Text style={styles.ratingHint}>({t('rating.tapToRate')})</Text>
        </Card>

        <Card style={styles.reviewCard}>
          <Text style={styles.reviewTitle}>{t('rating.writeReview')}:</Text>
          <TextInput
            style={styles.reviewInput}
            value={review}
            onChangeText={setReview}
            placeholder={t('rating.shareExperience')}
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={4}
          />
        </Card>

        <Card style={styles.aspectsCard}>
          <Text style={styles.aspectsTitle}>{t('rating.rateSpecificAspects')}:</Text>
          
          <View style={styles.aspectItem}>
            <Text style={styles.aspectLabel}>{t('rating.punctuality')}:</Text>
            {renderStars(punctuality, setPunctuality)}
          </View>

          <View style={styles.aspectItem}>
            <Text style={styles.aspectLabel}>{t('rating.vehicleCondition')}:</Text>
            {renderStars(vehicleCondition, setVehicleCondition)}
          </View>

          <View style={styles.aspectItem}>
            <Text style={styles.aspectLabel}>{t('rating.driving')}:</Text>
            {renderStars(driving, setDriving)}
          </View>
        </Card>

        <Button
          title={t('rating.submitReview')}
          onPress={handleSubmit}
          variant="primary"
          size="large"
          style={styles.submitButton}
          disabled={overallRating === 0}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.xl,
  },
  headerTitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xl,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  placeholder: { width: 40 },
  scrollContent: { padding: SPACING.md },
  userCard: {
    alignItems: 'center',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  userPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: SPACING.sm,
  },
  userName: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  ratingCard: {
    alignItems: 'center',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  ratingTitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  starButton: {
    padding: SPACING.xs,
  },
  ratingHint: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  reviewCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  reviewTitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  reviewInput: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    minHeight: 100,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    textAlignVertical: 'top',
  },
  aspectsCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  aspectsTitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  aspectItem: {
    marginBottom: SPACING.md,
  },
  aspectLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  submitButton: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
});

export default RatingScreen;
