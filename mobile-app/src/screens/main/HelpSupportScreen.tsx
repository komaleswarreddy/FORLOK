import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Search, MessageCircle, Phone, Mail, HelpCircle, Bug, MessageSquare } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '@constants/theme';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { useLanguage } from '@context/LanguageContext';

const HelpSupportScreen = () => {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const popularTopics = [
    'How to create a pooling offer',
    'How to book a rental vehicle',
    'Payment issues',
    'Cancellation policy',
    'How to rate a trip',
    'Document verification',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('helpSupport.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('helpSupport.searchPlaceholder')}
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('helpSupport.popularTopics')}:</Text>
        {popularTopics.map((topic, index) => (
          <Card key={index} style={styles.topicCard}>
            <TouchableOpacity style={styles.topicItem}>
              <HelpCircle size={20} color={COLORS.primary} />
              <Text style={styles.topicText}>{topic}</Text>
            </TouchableOpacity>
          </Card>
        ))}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>{t('helpSupport.contactSupport')}:</Text>
        
        <Card style={styles.contactCard}>
          <TouchableOpacity style={styles.contactItem}>
            <MessageCircle size={24} color={COLORS.primary} />
            <Text style={styles.contactLabel}>{t('helpSupport.chat')}</Text>
          </TouchableOpacity>
        </Card>

        <Card style={styles.contactCard}>
          <TouchableOpacity style={styles.contactItem}>
            <Phone size={24} color={COLORS.primary} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>{t('helpSupport.phone')}</Text>
              <Text style={styles.contactValue}>+91 1800-XXX-XXXX</Text>
            </View>
          </TouchableOpacity>
        </Card>

        <Card style={styles.contactCard}>
          <TouchableOpacity style={styles.contactItem}>
            <Mail size={24} color={COLORS.primary} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>{t('helpSupport.email')}</Text>
              <Text style={styles.contactValue}>support@yaaryatra.com</Text>
            </View>
          </TouchableOpacity>
        </Card>

        <View style={styles.divider} />

        <Button
          title={t('helpSupport.faqs')}
          onPress={() => {}}
          variant="outline"
          size="medium"
          style={styles.supportButton}
        />
        <Button
          title="Report a Bug"
          onPress={() => {}}
          variant="outline"
          size="medium"
          style={styles.supportButton}
        />
        <Button
          title="Feedback"
          onPress={() => navigation.navigate('Feedback' as never)}
          variant="outline"
          size="medium"
          style={styles.supportButton}
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
  searchContainer: {
    marginBottom: SPACING.lg,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    paddingVertical: SPACING.sm,
  },
  sectionTitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  topicCard: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  topicText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
  },
  contactCard: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  contactValue: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  supportButton: {
    marginBottom: SPACING.sm,
  },
});

export default HelpSupportScreen;






