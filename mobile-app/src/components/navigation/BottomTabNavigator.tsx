import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Home, Plus, Search, Clock, User } from 'lucide-react-native';
import { COLORS, FONTS, SPACING } from '@constants/theme';

interface TabItem {
  name: string;
  label: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  screen: string;
}

const tabs: TabItem[] = [
  { name: 'Home', label: 'Home', icon: Home, screen: 'MainDashboard' },
  { name: 'Offer', label: 'Offer', icon: Plus, screen: 'OfferServices' },
  { name: 'Take', label: 'Take', icon: Search, screen: 'TakeServices' },
  { name: 'History', label: 'History', icon: Clock, screen: 'History' },
  { name: 'Profile', label: 'Profile', icon: User, screen: 'Profile' },
];

export const BottomTabNavigator = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const getActiveTab = () => {
    const routeName = route.name;
    return tabs.findIndex(tab => tab.screen === routeName);
  };

  const activeIndex = getActiveTab();

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const isActive = activeIndex === index;
        const IconComponent = tab.icon;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => navigation.navigate(tab.screen as never)}
          >
            <IconComponent
              size={24}
              color={isActive ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabLabel,
                isActive && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: SPACING.sm,
    paddingBottom: SPACING.md,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
  },
  tabLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

