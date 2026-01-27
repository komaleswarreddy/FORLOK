import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Bell, CheckCircle, Star, AlertCircle } from 'lucide-react-native';
import { COLORS, FONTS, SPACING } from '@constants/theme';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { mockNotifications } from '@constants/mockData';
import { useLanguage } from '@context/LanguageContext';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState(mockNotifications);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleAction = (notificationId: string, action: string) => {
    // Handle notification actions
    console.log('Action:', action, 'for notification:', notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_request':
        return <Bell size={24} color={COLORS.primary} />;
      case 'booking_confirmed':
        return <CheckCircle size={24} color={COLORS.success} />;
      case 'rating_request':
        return <Star size={24} color={COLORS.warning} />;
      default:
        return <AlertCircle size={24} color={COLORS.textSecondary} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text style={styles.markAllText}>{t('notifications.markAllRead')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Bell size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>{t('notifications.noNotifications')}</Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.read && styles.unreadCard,
              ]}
            >
              <View style={styles.notificationHeader}>
                {getNotificationIcon(notification.type)}
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                </View>
              </View>
              {notification.actionRequired && (
                <View style={styles.actionButtons}>
                  {notification.type === 'booking_request' && (
                    <>
                      <Button
                        title="Accept"
                        onPress={() => handleAction(notification.id, 'accept')}
                        variant="primary"
                        size="small"
                        style={styles.actionButton}
                      />
                      <Button
                        title="Decline"
                        onPress={() => handleAction(notification.id, 'decline')}
                        variant="outline"
                        size="small"
                        style={styles.actionButton}
                      />
                    </>
                  )}
                  {notification.type === 'rating_request' && (
                    <Button
                      title="Rate Now"
                      onPress={() => {
                        navigation.navigate('Rating' as never, { bookingId: 'booking1' } as never);
                      }}
                      variant="primary"
                      size="small"
                      style={styles.actionButton}
                    />
                  )}
                </View>
              )}
            </Card>
          ))
        )}
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
  markAllText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
  },
  scrollContent: { padding: SPACING.md },
  notificationCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  unreadCard: {
    backgroundColor: COLORS.primary + '10',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  notificationHeader: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  notificationMessage: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  notificationTime: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  actionButton: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
});

export default NotificationsScreen;
