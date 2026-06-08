import { startTransition } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useNavigation } from 'expo-router';

import { AppShell } from '@/components/app-shell';
import { EmptyStateCard } from '@/components/empty-state-card';
import { WordListItem } from '@/components/word-list-item';
import { LexiTheme } from '@/constants/lexi-theme';
import { useLexi } from '@/providers/lexi-provider';

function formatSavedLabel(savedAt: string) {
  const savedDate = new Date(savedAt);
  return `Saved ${savedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

export default function SavedScreen() {
  const navigation = useNavigation();
  const { removeSavedWord, savedWords } = useLexi();

  return (
    <AppShell
      activeTab="saved"
      leftAction={{
        icon: 'menu',
        label: 'Open navigation drawer',
        onPress: () => {
          if ('openDrawer' in navigation) {
            (navigation as { openDrawer: () => void }).openDrawer();
          }
        },
      }}
      title="LexiTech">
      <View style={styles.headerCopy}>
        <Text style={styles.title}>Saved Words</Text>
        <Text style={styles.subtitle}>
          Keep important entries close by so you can revisit them without searching again.
        </Text>
      </View>

      {savedWords.length ? (
        <View style={styles.list}>
          {savedWords.map((item) => (
            <WordListItem
              icon="bookmark-outline"
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
              onSecondaryPress={() => removeSavedWord(item.key)}
              secondaryIcon="bookmark-remove-outline"
              timestampLabel={formatSavedLabel(item.savedAt)}
            />
          ))}
        </View>
      ) : (
        <EmptyStateCard
          description="Bookmark a word from the details screen and it will appear here for quick review."
          icon="bookmark-off-outline"
          primaryAction={{
            label: 'Explore Words',
            onPress: () => {
              startTransition(() => {
                router.replace('/');
              });
            },
          }}
          title="Nothing saved yet"
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
