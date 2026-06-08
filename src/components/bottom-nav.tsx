import { startTransition } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LexiTheme, type BottomTabKey } from '@/constants/lexi-theme';

type TabConfig = {
  key: BottomTabKey;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  route: '/' | '/saved' | '/recent';
};

const tabs: TabConfig[] = [
  { key: 'home', icon: 'compass-outline', label: 'Explore', route: '/' },
  { key: 'saved', icon: 'bookmark-outline', label: 'Saved', route: '/saved' },
  { key: 'recent', icon: 'history', label: 'Recent', route: '/recent' },
];

export function BottomNav({ activeTab }: { activeTab: BottomTabKey }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <Pressable
            accessibilityRole="button"
            key={tab.key}
            onPress={() => {
              if (!isActive) {
                startTransition(() => {
                  router.replace(tab.route as never);
                });
              }
            }}
            style={({ pressed }) => [
              styles.tabButton,
              isActive && styles.tabButtonActive,
              pressed && styles.tabButtonPressed,
            ]}>
            <MaterialCommunityIcons
              color={isActive ? LexiTheme.colors.textSoft : LexiTheme.colors.textMuted}
              name={tab.icon}
              size={18}
            />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: LexiTheme.colors.background,
    borderTopColor: LexiTheme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  tabButton: {
    alignItems: 'center',
    borderRadius: 999,
    gap: 4,
    minWidth: 76,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  tabButtonActive: {
    backgroundColor: LexiTheme.colors.surfaceStrongAlt,
  },
  tabButtonPressed: {
    opacity: 0.82,
  },
  tabLabel: {
    color: LexiTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  tabLabelActive: {
    color: LexiTheme.colors.textSoft,
  },
});
