import { startTransition } from 'react';
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';

import { AppShell } from '@/components/app-shell';
import { LexiTheme } from '@/constants/lexi-theme';
import { useLexi } from '@/providers/lexi-provider';
import type { SearchHistoryItem } from '@/types/dictionary';

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

function timestampShort(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)} MIN AGO`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} HOUR${hours === 1 ? '' : 'S'} AGO`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'YESTERDAY';
  return `${days} DAYS AGO`;
}

function openWord(key: string) {
  startTransition(() => {
    router.push({
      pathname: '/word/[term]' as never,
      params: { term: key },
    } as never);
  });
}

function ActiveSearchCard({ item }: { item: SearchHistoryItem }) {
  return (
    <View style={styles.activeCard}>
      <View style={styles.activeBadgeRow}>
        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>ACTIVE SEARCH</Text>
        </View>
        <Text style={styles.activeTime}>{timeAgo(item.searchedAt)}</Text>
      </View>
      <Text style={styles.activeWord}>{item.word}</Text>
      {item.phonetic ? <Text style={styles.activePhonetic}>{item.phonetic}</Text> : null}
      <Text numberOfLines={3} style={styles.activeExcerpt}>
        {item.excerpt}
      </Text>
      <View style={styles.activeActions}>
        <Pressable
          onPress={() => openWord(item.key)}
          style={({ pressed }) => [styles.fullDefBtn, pressed && styles.pressed]}>
          <MaterialCommunityIcons color="#FFFFFF" name="book-open-variant" size={16} />
          <Text style={styles.fullDefText}>Full Definition</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            void Share.share({ message: `${item.word} — ${item.excerpt}`, title: item.word });
          }}
          style={({ pressed }) => [styles.shareBtn, pressed && styles.pressed]}>
          <MaterialCommunityIcons color={LexiTheme.colors.textPrimary} name="share-variant" size={18} />
        </Pressable>
      </View>
    </View>
  );
}

function HistoryRow({
  item,
  category,
  onRemove,
}: {
  item: SearchHistoryItem;
  category: string;
  onRemove: () => void;
}) {
  return (
    <Pressable
      onLongPress={onRemove}
      onPress={() => openWord(item.key)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.rowIcon}>
        <MaterialCommunityIcons color={LexiTheme.colors.textSoft} name="book-open-variant" size={16} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTimestamp}>{timestampShort(item.searchedAt)}</Text>
        <Text style={styles.rowWord}>{item.word}</Text>
        <Text numberOfLines={1} style={styles.rowExcerpt}>{`"${item.excerpt}"`}</Text>
        <View style={styles.rowTags}>
          <View style={styles.rowTag}>
            <Text style={styles.rowTagText}>Noun</Text>
          </View>
          <View style={[styles.rowTag, styles.rowTagAlt]}>
            <Text style={[styles.rowTagText, styles.rowTagTextAlt]}>{category}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function RecentScreen() {
  const navigation = useNavigation();
  const { clearHistory, history, removeHistoryItem } = useLexi();

  const [active, ...rest] = history;

  function confirmClearHistory() {
    Alert.alert(
      'Clear search history?',
      'This will remove all locally stored search history from this device.',
      [
        { style: 'cancel', text: 'Cancel' },
        { style: 'destructive', text: 'Clear', onPress: clearHistory },
      ],
    );
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
          ? [{ icon: 'trash-can-outline', label: 'Clear history', onPress: confirmClearHistory }]
          : []
      }
      title="LexiTech">
      <View style={styles.headerCopy}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>Your recent linguistic explorations and term lookups.</Text>
      </View>

      {history.length ? (
        <>
          {active ? <ActiveSearchCard item={active} /> : null}
          {rest.map((item, index) => (
            <HistoryRow
              category={index % 2 === 0 ? 'Social Sciences' : 'Reference'}
              item={item}
              key={item.key}
              onRemove={() => removeHistoryItem(item.key)}
            />
          ))}
        </>
      ) : (
        <>
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <MaterialCommunityIcons
                color={LexiTheme.colors.textPrimary}
                name="history"
                size={32}
              />
            </View>
            <Text style={styles.emptyTitle}>History</Text>
            <Text style={styles.emptySubtitle}>No search history yet.</Text>

            <Pressable
              onPress={() => {
                startTransition(() => {
                  router.replace('/');
                });
              }}
              style={({ pressed }) => [styles.startBtn, pressed && styles.pressed]}>
              <MaterialCommunityIcons color="#FFFFFF" name="magnify" size={16} />
              <Text style={styles.startBtnText}>Start Searching</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                startTransition(() => {
                  router.replace('/saved');
                });
              }}
              style={({ pressed }) => [styles.savedBtn, pressed && styles.pressed]}>
              <Text style={styles.savedBtnText}>View Saved Words</Text>
            </Pressable>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <MaterialCommunityIcons
                color={LexiTheme.colors.mintText}
                name="creation"
                size={18}
              />
              <Text style={styles.infoTitle}>Daily Wisdom</Text>
            </View>
            <Text style={styles.infoText}>
              Exploring history helps you track your linguistic growth and rediscover complex etymologies.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <MaterialCommunityIcons
                color={LexiTheme.colors.mintText}
                name="shield-check-outline"
                size={18}
              />
              <Text style={styles.infoTitle}>Privacy First</Text>
            </View>
            <Text style={styles.infoText}>
              Your search history is stored locally on your device and can be cleared at any time from settings.
            </Text>
          </View>
        </>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  headerCopy: {
    gap: 6,
  },
  title: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: LexiTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  activeCard: {
    backgroundColor: LexiTheme.colors.surface,
    borderColor: LexiTheme.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    padding: 18,
  },
  activeBadgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activeBadge: {
    backgroundColor: LexiTheme.colors.mintBadge,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeBadgeText: {
    color: LexiTheme.colors.mintText,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  activeTime: {
    color: LexiTheme.colors.textMuted,
    fontSize: 12,
  },
  activeWord: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  activePhonetic: {
    color: LexiTheme.colors.textSoft,
    fontSize: 14,
    fontStyle: 'italic',
  },
  activeExcerpt: {
    color: LexiTheme.colors.textBody,
    fontSize: 14,
    lineHeight: 20,
  },
  activeActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  fullDefBtn: {
    alignItems: 'center',
    backgroundColor: LexiTheme.colors.surfaceStrong,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  fullDefText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  shareBtn: {
    alignItems: 'center',
    borderColor: LexiTheme.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 42,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: LexiTheme.colors.surface,
    borderColor: LexiTheme.colors.border,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    padding: 24,
  },
  emptyIconWrap: {
    alignItems: 'center',
    backgroundColor: LexiTheme.colors.mintSoft,
    borderRadius: 999,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  emptyTitle: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  emptySubtitle: {
    color: LexiTheme.colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  startBtn: {
    alignItems: 'center',
    backgroundColor: LexiTheme.colors.surfaceStrong,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 12,
    width: '100%',
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  savedBtn: {
    alignItems: 'center',
    borderColor: LexiTheme.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
    width: '100%',
  },
  savedBtnText: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: LexiTheme.colors.surface,
    borderColor: LexiTheme.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    padding: 16,
  },
  infoHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  infoTitle: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  infoText: {
    color: LexiTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  row: {
    backgroundColor: LexiTheme.colors.surface,
    borderColor: LexiTheme.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  rowIcon: {
    alignItems: 'center',
    backgroundColor: LexiTheme.colors.surfaceStrongAlt,
    borderRadius: 999,
    height: 30,
    justifyContent: 'center',
    marginTop: 14,
    width: 30,
  },
  rowBody: {
    flex: 1,
    gap: 4,
  },
  rowTimestamp: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'right',
  },
  rowWord: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  rowExcerpt: {
    color: LexiTheme.colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
  },
  rowTags: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  rowTag: {
    backgroundColor: 'rgba(0, 30, 64, 0.06)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  rowTagAlt: {
    backgroundColor: LexiTheme.colors.mintSoft,
  },
  rowTagText: {
    color: LexiTheme.colors.textBody,
    fontSize: 11,
    fontWeight: '600',
  },
  rowTagTextAlt: {
    color: LexiTheme.colors.mintText,
  },
  pressed: {
    opacity: 0.78,
  },
});
