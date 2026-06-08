import { startTransition } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LexiTheme } from '@/constants/lexi-theme';
import { useLexi } from '@/providers/lexi-provider';

type DrawerContentProps = {
  navigation: {
    closeDrawer: () => void;
  };
};

const navItems = [
  { label: 'Home', icon: 'home-outline' as const, route: '/' as const },
  { label: 'Saved', icon: 'bookmark-outline' as const, route: '/saved' as const },
  { label: 'History', icon: 'history' as const, route: '/recent' as const },
  { label: 'Settings', icon: 'cog-outline' as const, route: '/settings' as const },
];

function formatHistoryLabel(searchedAt: string) {
  const date = new Date(searchedAt);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function AppDrawerContent({ navigation }: DrawerContentProps) {
  const { clearHistory, history } = useLexi();

  function navigateTo(route: '/' | '/saved' | '/recent' | '/settings') {
    navigation.closeDrawer();
    startTransition(() => {
      router.replace(route as never);
    });
  }

  function openWord(word: string) {
    navigation.closeDrawer();
    startTransition(() => {
      router.push({
        pathname: '/word/[term]' as never,
        params: { term: word },
      } as never);
    });
  }

  function confirmClearHistory() {
    Alert.alert('Clear search history?', 'This will remove all locally stored search history from this device.', [
      { style: 'cancel', text: 'Cancel' },
      {
        style: 'destructive',
        text: 'Clear',
        onPress: () => {
          clearHistory();
        },
      },
    ]);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.brand}>LexiTech</Text>
          <Pressable onPress={() => navigation.closeDrawer()} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
            <MaterialCommunityIcons color={LexiTheme.colors.textPrimary} name="close" size={18} />
          </Pressable>
        </View>

        <View style={styles.navSection}>
          {navItems.map((item) => (
            <Pressable key={item.label} onPress={() => navigateTo(item.route)} style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}>
              <MaterialCommunityIcons color={LexiTheme.colors.textPrimary} name={item.icon} size={18} />
              <Text style={styles.navLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.separator} />

        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Search History</Text>
          {history.length ? (
            <Pressable
              onPress={confirmClearHistory}
              style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.historyList}>
          {history.length ? (
            history.slice(0, 8).map((item) => (
              <Pressable key={item.key} onPress={() => openWord(item.key)} style={({ pressed }) => [styles.historyItem, pressed && styles.pressed]}>
                <View style={styles.historyItemText}>
                  <MaterialCommunityIcons color={LexiTheme.colors.textSoft} name="history" size={14} />
                  <Text style={styles.historyWord}>{item.word}</Text>
                </View>
                <Text style={styles.historyDate}>{formatHistoryLabel(item.searchedAt)}</Text>
              </Pressable>
            ))
          ) : (
            <Text style={styles.emptyText}>Your successful searches will appear here.</Text>
          )}
        </View>

        <View style={styles.dailyWordCard}>
          <Text style={styles.dailyWordLabel}>Daily Word</Text>
          <Text style={styles.dailyWordTitle}>Lexicon</Text>
          <Text style={styles.dailyWordText}>
            The vocabulary of a person, language, or branch of knowledge.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: LexiTheme.colors.background,
    flex: 1,
  },
  content: {
    gap: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brand: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  closeButton: {
    borderRadius: 999,
    padding: 8,
  },
  navSection: {
    gap: 8,
  },
  navButton: {
    alignItems: 'center',
    borderRadius: LexiTheme.radius.sm,
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  navLabel: {
    color: LexiTheme.colors.textBody,
    fontSize: 15,
    fontWeight: '500',
  },
  separator: {
    backgroundColor: LexiTheme.colors.border,
    height: 1,
  },
  historyHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyTitle: {
    color: LexiTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  clearButton: {
    paddingVertical: 4,
  },
  clearButtonText: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  historyList: {
    gap: 8,
  },
  historyItem: {
    alignItems: 'center',
    borderRadius: LexiTheme.radius.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  historyItemText: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  historyWord: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 16,
  },
  historyDate: {
    color: '#6B7280',
    fontSize: 12,
  },
  emptyText: {
    color: LexiTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 6,
  },
  dailyWordCard: {
    backgroundColor: 'rgba(0, 51, 102, 0.08)',
    borderColor: LexiTheme.colors.border,
    borderRadius: LexiTheme.radius.md,
    borderWidth: 1,
    gap: 4,
    marginTop: 8,
    padding: 18,
  },
  dailyWordLabel: {
    color: LexiTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dailyWordTitle: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  dailyWordText: {
    color: LexiTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.72,
  },
});
