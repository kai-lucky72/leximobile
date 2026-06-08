import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/bottom-nav';
import { LexiTheme, type BottomTabKey } from '@/constants/lexi-theme';

type HeaderAction = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  label: string;
};

type AppShellProps = {
  activeTab?: BottomTabKey;
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  leftAction: HeaderAction;
  rightActions?: HeaderAction[];
  scrollProps?: ScrollViewProps;
  showBottomNav?: boolean;
  title: string;
};

function HeaderButton({ icon, label, onPress }: HeaderAction) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
      <MaterialCommunityIcons color={LexiTheme.colors.textPrimary} name={icon} size={22} />
    </Pressable>
  );
}

export function AppShell({
  activeTab,
  children,
  contentContainerStyle,
  leftAction,
  rightActions = [],
  scrollProps,
  showBottomNav = true,
  title,
}: AppShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <HeaderButton {...leftAction} />
            <Text style={styles.headerTitle}>{title}</Text>
          </View>

          <View style={styles.headerActions}>
            {rightActions.map((action) => (
              <HeaderButton key={action.label} {...action} />
            ))}
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        bounces={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: showBottomNav ? Math.max(insets.bottom, 12) + 92 : Math.max(insets.bottom, 12) + 24 },
          contentContainerStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        {...scrollProps}>
        {children}
      </ScrollView>

      {showBottomNav && activeTab ? <BottomNav activeTab={activeTab} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: LexiTheme.colors.background,
    flex: 1,
  },
  headerSafeArea: {
    backgroundColor: LexiTheme.colors.background,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    alignItems: 'center',
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  headerTitle: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  headerTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pressed: {
    opacity: 0.72,
  },
  scrollContent: {
    gap: 24,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
});
