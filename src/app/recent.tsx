import { startTransition } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router, useNavigation } from 'expo-router';

import { AppShell } from '@/components/app-shell';
import { EmptyStateCard } from '@/components/empty-state-card';
import { WordListItem } from '@/components/word-list-item';
import { LexiTheme } from '@/constants/lexi-theme';
import { useLexi } from '@/providers/lexi-provider';

function formatRecentLabel(searchedAt: string) {
  const searchedDate = new Date(searchedAt);
  return `Searched ${searchedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

export default function RecentScreen() {
  const navigation = useNavigation();
  const { clearHistory, history, removeHistoryItem } = useLexi();

  function confirmClearHistory() {
    Alert.alert('Clear recent searches?', 'This will remove all locally stored search history from this device.', [
      { style: 'cancel', text: 'Cancel' },
      { style: 'destructive', text: 'Clear', onPress: clearHistory },
    ]);
  }

  return (
    <AppShell
      activeTab="recent"
      leftAction={{
        icon: 'menu',
        label: 'Open navigation drawer',
        onPress: () => {
          if ('openDrawer' in navigation) {
            (navigation as { openDrawer: () => void }).openDrawer();
          }
        },
      }}
      rightActions={
        history.length
          ? [
              {
                icon: 'trash-can-outline',
                label: 'Clear recent searches',
                onPress: confirmClearHistory,
              },
            ]
          : []
      }
      title="LexiTech">
      <View style={styles.headerCopy}>
        <Text style={styles.title}>Recent Searches</Text>
        <Text style={styles.subtitle}>
          Review your latest searches and reopen an entry with one tap.
        </Text>
      </View>

      {history.length ? (
        <View style={styles.list}>
          {history.map((item) => (
            <WordListItem
              icon="history"
              item={item}
              key={item.key}
              onPress={() => {
                startTransition(() => {
                  router.push({
                    pathname: '/word/[term]' as never,
                    params: { term: item.key },
                  } as never);
                });
              }}
              onSecondaryPress={() => removeHistoryItem(item.key)}
              secondaryIcon="close"
              timestampLabel={formatRecentLabel(item.searchedAt)}
            />
          ))}
        </View>
      ) : (
        <EmptyStateCard
          description="Successful searches are stored locally on your device and shown here."
          icon="history"
          primaryAction={{
            label: 'Search a Word',
            onPress: () => {
              startTransition(() => {
                router.replace('/');
              });
            },
          }}
          title="No recent searches"
        />
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  headerCopy: {
    gap: 8,
  },
  title: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    color: LexiTheme.colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  list: {
    gap: 12,
  },
});
