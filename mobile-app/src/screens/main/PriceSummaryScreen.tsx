import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, IndianRupee, CheckCircle, Info } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '@constants/theme';
import { Button } from '@components/common/Button';
import { Card } from '@components/common/Card';
import { useLanguage } from '@context/LanguageContext';

interface RouteParams {
  offerId: string;
  offer: any;
  passengerRoute: {
    from: { address: string; lat: number; lng: number };
    to: { address: string; lat: number; lng: number };
  };
  priceBreakdown: {
    baseDistance: number;
    baseRatePerKm: number;
    basePrice: number;
    timeMultiplier: number;
    timeMultiplierLabel: string;
    supplyMultiplier: number;
    supplyMultiplierLabel: string;
    finalPrice: number;
    platformFee: number;
    totalAmount: number;
    breakdown: {
      distance: number;
      baseRate: number;
      distanceCharge: number;
      timeMultiplier: number;
      timeCharge: number;
      supplyMultiplier: number;
      supplyAdjustment: number;
      subtotal: number;
      platformFee: number;
      total: number;
    };
  };
}

const PriceSummaryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useLanguage();
  const params = (route.params as RouteParams) || {};

  const handleProceedToPayment = () => {
    navigation.navigate('Payment' as never, {
      bookingId: null, // Will be created after payment
      offer: params.offer,
      passengerRoute: params.passengerRoute,
      priceBreakdown: params.priceBreakdown,
      type: 'pooling',
    } as never);
  };

  const { priceBreakdown, passengerRoute } = params;

  if (!priceBreakdown) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Price Summary</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Price information not available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Price Summary</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.routeCard}>
          <Text style={styles.sectionTitle}>Route</Text>
          <View style={styles.routeRow}>
            <Text style={styles.routeLabel}>From:</Text>
            <Text style={styles.routeValue}>{passengerRoute?.from?.address || 'N/A'}</Text>
          </View>
          <View style={styles.routeRow}>
            <Text style={styles.routeLabel}>To:</Text>
            <Text style={styles.routeValue}>{passengerRoute?.to?.address || 'N/A'}</Text>
          </View>
        </Card>

        <Card style={styles.priceCard}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Distance:</Text>
            <Text style={styles.breakdownValue}>{priceBreakdown.breakdown.distance} km</Text>
          </View>
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Base Rate:</Text>
            <Text style={styles.breakdownValue}>₹{priceBreakdown.breakdown.baseRate}/km</Text>
          </View>
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Distance Charge:</Text>
            <Text style={styles.breakdownValue}>₹{priceBreakdown.breakdown.distanceCharge}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Time:</Text>
            <Text style={styles.breakdownValue}>{priceBreakdown.timeMultiplierLabel}</Text>
          </View>
          
          {priceBreakdown.breakdown.timeCharge > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Time Charge:</Text>
              <Text style={styles.breakdownValue}>+₹{priceBreakdown.breakdown.timeCharge}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Supply/Demand:</Text>
            <Text style={styles.breakdownValue}>{priceBreakdown.supplyMultiplierLabel}</Text>
          </View>
          
          {priceBreakdown.breakdown.supplyAdjustment !== 0 && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Supply Adjustment:</Text>
              <Text style={[styles.breakdownValue, priceBreakdown.breakdown.supplyAdjustment < 0 && styles.negativeValue]}>
                {priceBreakdown.breakdown.supplyAdjustment > 0 ? '+' : ''}₹{Math.abs(priceBreakdown.breakdown.supplyAdjustment)}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Subtotal:</Text>
            <Text style={styles.breakdownValue}>₹{priceBreakdown.breakdown.subtotal}</Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Platform Fee:</Text>
            <Text style={styles.breakdownValue}>₹{priceBreakdown.breakdown.platformFee}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <View style={styles.totalAmountContainer}>
              <IndianRupee size={24} color={COLORS.primary} />
              <Text style={styles.totalAmount}>{priceBreakdown.breakdown.total}</Text>
            </View>
          </View>
        </Card>

        <View style={styles.infoCard}>
          <Info size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Price is calculated based on distance, time of day, and market supply/demand.
          </Text>
        </View>

        <Button
          title="Proceed to Payment"
          onPress={handleProceedToPayment}
          variant="primary"
          size="large"
          style={styles.proceedButton}
          icon={<CheckCircle size={20} color={COLORS.white} />}
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
  routeCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  priceCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  sectionTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  routeRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  routeLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    width: 60,
  },
  routeValue: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    flex: 1,
    fontWeight: '500',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  breakdownLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  breakdownValue: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  negativeValue: {
    color: COLORS.success,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: SPACING.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
  },
  totalLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    fontWeight: '600',
  },
  totalAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  totalAmount: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.sizes.xxl,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${COLORS.primary}10`,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  infoText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  proceedButton: {
    marginBottom: SPACING.xl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
});

export default PriceSummaryScreen;
