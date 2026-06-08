import { useEffect, useEffectEvent, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

import { AppShell } from '@/components/app-shell';
import { EmptyStateCard } from '@/components/empty-state-card';
import { MeaningCard } from '@/components/meaning-card';
import { LexiTheme } from '@/constants/lexi-theme';
import { useLexi } from '@/providers/lexi-provider';
import { fetchWordEntry, toWordSummary } from '@/services/dictionary-api';
import type { DictionaryScreenError, WordEntry } from '@/types/dictionary';

function buildShareMessage(entry: WordEntry) {
  const lines = [entry.word];
  if (entry.phonetic) {
    lines.push(entry.phonetic);
  }
  lines.push(entry.excerpt);
  if (entry.sourceUrls[0]) {
    lines.push(entry.sourceUrls[0]);
  }

  return lines.join('\n');
}

export default function WordDetailsScreen() {
  const { term } = useLocalSearchParams<{ term?: string | string[] }>();
  const normalizedTerm = Array.isArray(term) ? term[0] : term;
  const { addHistoryItem, cacheWord, getCachedWord, isSavedWord, toggleSavedWord } = useLexi();
  const cachedWord = normalizedTerm ? getCachedWord(normalizedTerm) : undefined;
  const [entry, setEntry] = useState<WordEntry | null>(cachedWord ?? null);
  const [error, setError] = useState<DictionaryScreenError | null>(null);
  const [loading, setLoading] = useState(Boolean(normalizedTerm) && !cachedWord);
  const [selectedAudioUrl, setSelectedAudioUrl] = useState(cachedWord?.audioOptions[0]?.url ?? '');
  const [reloadToken, setReloadToken] = useState(0);
  const player = useAudioPlayer(undefined, { downloadFirst: true, updateInterval: 200 });
  const playerStatus = useAudioPlayerStatus(player);
  const applyLoadedWord = useEffectEvent((nextEntry: WordEntry) => {
    cacheWord(nextEntry);
    addHistoryItem(toWordSummary(nextEntry));
    setEntry(nextEntry);
    setSelectedAudioUrl(nextEntry.audioOptions[0]?.url ?? '');
    setError(null);
  });
  const applyLoadError = useEffectEvent((wordError: unknown) => {
    const nextError: DictionaryScreenError = {
      kind: 'unexpected',
      message: 'Something went wrong while loading this word.',
    };

    if (wordError instanceof Error && 'kind' in wordError) {
      nextError.kind = wordError.kind as DictionaryScreenError['kind'];
      nextError.message = wordError.message;
    }

    setError(nextError);
  });
  const resolveCachedWord = useEffectEvent((key: string) => getCachedWord(key));

  useEffect(() => {
    const targetTerm = normalizedTerm?.trim();
    if (!targetTerm) {
      return;
    }

    let isMounted = true;

    async function loadWord(wordKey: string) {
      const currentCachedWord = resolveCachedWord(wordKey);
      if (currentCachedWord) {
        setEntry(currentCachedWord);
        setSelectedAudioUrl(currentCachedWord.audioOptions[0]?.url ?? '');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const nextEntry = await fetchWordEntry(wordKey);
        if (!isMounted) {
          return;
        }

        applyLoadedWord(nextEntry);
      } catch (wordError) {
        if (!isMounted) {
          return;
        }

        applyLoadError(wordError);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadWord(targetTerm);

    return () => {
      isMounted = false;
    };
  }, [normalizedTerm, player, reloadToken]);

  async function togglePlayback(url: string) {
    if (!url) {
      return;
    }

    if (selectedAudioUrl !== url) {
      setSelectedAudioUrl(url);
      player.replace(url);
      player.play();
      return;
    }

    if (playerStatus.playing) {
      player.pause();
      return;
    }

    player.replace(url);
    player.play();
  }

  async function stopPlayback() {
    player.pause();
    await player.seekTo(0);
  }

  const saved = entry ? isSavedWord(entry.key) : false;
  const missingTerm = !normalizedTerm;

  return (
    <AppShell
      leftAction={{
        icon: 'arrow-left',
        label: 'Go back',
        onPress: () => {
          router.back();
        },
      }}
      rightActions={[
        {
          icon: saved ? 'bookmark' : 'bookmark-outline',
          label: saved ? 'Remove bookmark' : 'Save word',
          onPress: () => {
            if (entry) {
              toggleSavedWord(toWordSummary(entry));
            }
          },
        },
        {
          icon: 'share-variant-outline',
          label: 'Share word',
          onPress: () => {
            if (entry) {
              void Share.share({
                message: buildShareMessage(entry),
                title: entry.word,
              });
            }
          },
        },
      ]}
      showBottomNav={false}
      title="LexiTech">
      {missingTerm ? (
        <EmptyStateCard
          description="Choose a word from search, history, or saved entries to open details."
          icon="text-search"
          primaryAction={{
            label: 'Back to Search',
            onPress: () => {
              router.replace('/');
            },
          }}
          title="No word selected"
        />
      ) : loading ? (
        <EmptyStateCard
          description="The dictionary service is fetching definitions and pronunciation details."
          icon="book-search-outline"
          title="Loading word details"
        />
      ) : error ? (
        <EmptyStateCard
          description={error.message}
          icon={error.kind === 'not-found' ? 'text-search' : 'wifi-alert'}
          primaryAction={{
            label: 'Try Another Search',
            onPress: () => {
              router.replace('/');
            },
          }}
          secondaryAction={{
            label: 'Retry',
            onPress: () => {
              setEntry(null);
              setError(null);
              setLoading(true);
              setReloadToken((current) => current + 1);
            },
          }}
          title={error.kind === 'not-found' ? 'Word not found' : 'Unable to load word'}
        />
      ) : entry ? (
        <>
          <View style={styles.wordHeader}>
            <Text style={styles.wordTitle}>{entry.word}</Text>
            <View style={styles.pronunciationRow}>
              {entry.phonetic ? (
                <View style={styles.phoneticBadge}>
                  <Text style={styles.phoneticText}>{entry.phonetic}</Text>
                </View>
              ) : null}
              {entry.audioOptions[0] ? (
                <Pressable
                  onPress={() => {
                    void togglePlayback(selectedAudioUrl || entry.audioOptions[0].url);
                  }}
                  style={({ pressed }) => [styles.playButton, pressed && styles.pressed]}>
                  <MaterialCommunityIcons
                    color="#FFFFFF"
                    name={playerStatus.playing ? 'pause' : 'volume-high'}
                    size={18}
                  />
                </Pressable>
              ) : null}
            </View>

            {entry.audioOptions.length > 1 ? (
              <View style={styles.audioList}>
                {entry.audioOptions.map((audioOption) => {
                  const isSelected = selectedAudioUrl === audioOption.url;
                  return (
                    <Pressable
                      key={audioOption.id}
                      onPress={() => {
                        void togglePlayback(audioOption.url);
                      }}
                      style={({ pressed }) => [
                        styles.audioChip,
                        isSelected && styles.audioChipSelected,
                        pressed && styles.pressed,
                      ]}>
                      <Text style={[styles.audioChipText, isSelected && styles.audioChipTextSelected]}>
                        {audioOption.label}
                      </Text>
                    </Pressable>
                  );
                })}

                {(playerStatus.playing || playerStatus.currentTime > 0) && (
                  <Pressable
                    onPress={() => void stopPlayback()}
                    style={({ pressed }) => [styles.stopChip, pressed && styles.pressed]}>
                    <Text style={styles.stopChipText}>Stop</Text>
                  </Pressable>
                )}
              </View>
            ) : null}
          </View>

          <View style={styles.sectionStack}>
            {entry.meanings.map((meaning) => (
              <MeaningCard
                key={meaning.id}
                meaning={meaning}
                sourceLabel={entry.licenseName ? `Source: ${entry.licenseName}` : undefined}
                sourceUrl={entry.sourceUrls[0]}
              />
            ))}

            {entry.synonyms.length ? (
              <View style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>Synonyms</Text>
                <View style={styles.tagWrap}>
                  {entry.synonyms.map((synonym) => (
                    <View key={synonym} style={styles.tag}>
                      <Text style={styles.tagText}>{synonym}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {entry.usageExamples.length ? (
              <View style={styles.infoCardMuted}>
                <Text style={styles.infoCardTitle}>Common Usage</Text>
                <View style={styles.bulletList}>
                  {entry.usageExamples.map((example) => (
                    <View key={example} style={styles.bulletRow}>
                      <View style={styles.bullet} />
                      <Text style={styles.bulletText}>{example}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            <View style={styles.quoteCard}>
              <Text style={styles.quoteText}>
                {'"Education is the most powerful weapon which you can use to change the world."'}
              </Text>
            </View>
          </View>
        </>
      ) : null}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  wordHeader: {
    gap: 12,
  },
  wordTitle: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 40,
    fontWeight: '700',
  },
  pronunciationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  phoneticBadge: {
    backgroundColor: 'rgba(0, 51, 102, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  phoneticText: {
    color: LexiTheme.colors.textSoft,
    fontSize: 16,
  },
  playButton: {
    alignItems: 'center',
    backgroundColor: LexiTheme.colors.surfaceStrong,
    borderRadius: 999,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  audioList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  audioChip: {
    backgroundColor: LexiTheme.colors.surface,
    borderColor: LexiTheme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  audioChipSelected: {
    backgroundColor: LexiTheme.colors.surfaceStrongAlt,
  },
  audioChipText: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  audioChipTextSelected: {
    color: LexiTheme.colors.textSoft,
  },
  stopChip: {
    backgroundColor: LexiTheme.colors.dangerSoft,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stopChipText: {
    color: LexiTheme.colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  sectionStack: {
    gap: 24,
  },
  infoCard: {
    backgroundColor: LexiTheme.colors.surface,
    borderColor: LexiTheme.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
    padding: 24,
  },
  infoCardMuted: {
    backgroundColor: 'rgba(0, 30, 64, 0.05)',
    borderColor: 'rgba(0, 30, 64, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
    padding: 24,
  },
  infoCardTitle: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: LexiTheme.colors.mintBadge,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  tagText: {
    color: LexiTheme.colors.mintText,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  bulletList: {
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bullet: {
    backgroundColor: LexiTheme.colors.textPrimary,
    borderRadius: 999,
    height: 6,
    marginTop: 9,
    width: 6,
  },
  bulletText: {
    color: LexiTheme.colors.textMuted,
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  quoteCard: {
    backgroundColor: LexiTheme.colors.surfaceStrongAlt,
    borderRadius: 12,
    minHeight: 132,
    padding: 24,
  },
  quoteText: {
    color: LexiTheme.colors.textSoft,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
  },
  pressed: {
    opacity: 0.76,
  },
});
