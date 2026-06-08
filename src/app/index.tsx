import { startTransition, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';

import { AppShell } from '@/components/app-shell';
import { LexiTheme } from '@/constants/lexi-theme';
import { SearchBar } from '@/components/search-bar';
import { useLexi } from '@/providers/lexi-provider';
import { fetchWordEntry, toWordSummary } from '@/services/dictionary-api';
import type { DictionaryScreenError } from '@/types/dictionary';

const QUICK_LINKS: {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  route: '/recent' | '/saved' | '/settings';
}[] = [
  { label: 'Recent Searches', icon: 'history', route: '/recent' },
  { label: 'Saved Words', icon: 'bookmark-outline', route: '/saved' },
  { label: 'Search Settings', icon: 'cog-outline', route: '/settings' },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { addHistoryItem, cacheWord } = useLexi();
  const [query, setQuery] = useState('');
  const [error, setError] = useState<DictionaryScreenError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function runSearch(rawWord: string) {
    const normalizedWord = rawWord.trim();
    if (!normalizedWord) {
      setError({
        kind: 'validation',
        message: 'Please enter a word to search.',
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const entry = await fetchWordEntry(normalizedWord);
      cacheWord(entry);
      addHistoryItem(toWordSummary(entry));
      startTransition(() => {
        router.push({
          pathname: '/word/[term]' as never,
          params: { term: entry.key },
        } as never);
      });
    } catch (searchError) {
      const nextError: DictionaryScreenError = {
        kind: 'unexpected',
        message: 'Something went wrong while searching. Please try again.',
      };

      if (searchError instanceof Error && 'kind' in searchError) {
        nextError.kind = searchError.kind as DictionaryScreenError['kind'];
        nextError.message = searchError.message;
      }

      setError(nextError);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSearch() {
    await runSearch(query);
  }

  return (
    <AppShell
      activeTab="home"
      leftAction={{
        icon: 'menu',
        label: 'Open navigation drawer',
        onPress: () => {
          if ('openDrawer' in navigation) {
            (navigation as { openDrawer: () => void }).openDrawer();
          }
        },
      }}
      rightActions={[
        {
          icon: 'account-circle-outline',
          label: 'Profile',
          onPress: () => {
            startTransition(() => {
              router.replace('/settings' as never);
            });
          },
        },
      ]}
      title="LexiTech">
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Master Your Language</Text>
        <Text style={styles.heroSubtitle}>
          Explore deep etymologies, precise phonetics, and contextual usage with our scholarly
          digital lexicon.
        </Text>
        <SearchBar
          error={error?.message}
          onChangeText={(value) => {
            setQuery(value);
            if (error) {
              setError(null);
            }
          }}
          onSubmit={handleSearch}
          submitting={isSubmitting}
          value={query}
        />
      </View>

      <View style={styles.cardStack}>
        <View style={styles.featureCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>WORD OF THE DAY</Text>
          </View>
          <Text style={styles.featureTitle}>Ephemeral</Text>
          <Text style={styles.featurePhonetic}>/uh-FEM-uh-ruhl/</Text>
          <Text style={styles.featureExcerpt}>
            {'Lasting for a very short time. Derived from the Greek "ephemeros", meaning short-lived.'}
          </Text>
          <Pressable
            onPress={() => {
              setQuery('ephemeral');
              void runSearch('ephemeral');
            }}
            style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}>
            <Text style={styles.linkText}>EXPLORE ETYMOLOGY</Text>
            <MaterialCommunityIcons
              color={LexiTheme.colors.textPrimary}
              name="arrow-right"
              size={18}
            />
          </Pressable>
          <View style={styles.featureDecoration} />
        </View>

        <View style={styles.quickAccessCard}>
          <Text style={styles.quickAccessTitle}>Quick Access</Text>
          {QUICK_LINKS.map((link) => (
            <Pressable
              key={link.label}
              onPress={() => {
                startTransition(() => {
                  router.replace(link.route as never);
                });
              }}
              style={({ pressed }) => [styles.quickLink, pressed && styles.pressed]}>
              <MaterialCommunityIcons color={LexiTheme.colors.textSoft} name={link.icon} size={18} />
              <Text style={styles.quickLinkText}>{link.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.quoteCard}>
          <View style={styles.quoteGlow} />
          <Text style={styles.quoteText}>
            {'"The limits of my language mean the limits of my world."'}
          </Text>
          <Text style={styles.quoteAuthor}>- Ludwig Wittgenstein</Text>
        </View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    alignItems: 'center',
    gap: 16,
  },
  heroTitle: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  heroSubtitle: {
    color: LexiTheme.colors.textMuted,
    fontSize: 18,
    lineHeight: 30,
    maxWidth: 360,
    textAlign: 'center',
  },
  cardStack: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: LexiTheme.colors.surface,
    borderColor: LexiTheme.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 24,
    ...Platform.select({
      android: {
        elevation: 1,
      },
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      web: {
        boxShadow: '0px 1px 2px rgba(15, 23, 42, 0.05)',
      },
    }),
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: LexiTheme.colors.mint,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: LexiTheme.colors.mintText,
    fontSize: 14,
    fontWeight: '500',
  },
  featureTitle: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 44,
    fontWeight: '700',
    marginTop: 16,
  },
  featurePhonetic: {
    color: LexiTheme.colors.textMuted,
    fontSize: 18,
    fontStyle: 'italic',
    marginTop: 4,
  },
  featureExcerpt: {
    color: LexiTheme.colors.textBody,
    fontSize: 16,
    lineHeight: 28,
    marginTop: 16,
    maxWidth: 280,
  },
  linkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 24,
  },
  linkText: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  featureDecoration: {
    backgroundColor: 'rgba(0, 30, 64, 0.06)',
    borderColor: 'rgba(0, 30, 64, 0.08)',
    borderRadius: 24,
    borderWidth: 1,
    height: 128,
    position: 'absolute',
    right: -44,
    top: -42,
    width: 118,
  },
  quickAccessCard: {
    backgroundColor: LexiTheme.colors.surfaceStrongAlt,
    borderColor: LexiTheme.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    padding: 24,
  },
  quickAccessTitle: {
    color: LexiTheme.colors.textSoft,
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 8,
  },
  quickLink: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  quickLinkText: {
    color: LexiTheme.colors.textSoft,
    fontSize: 18,
  },
  quoteCard: {
    backgroundColor: '#071F3A',
    borderRadius: 12,
    minHeight: 182,
    overflow: 'hidden',
    padding: 24,
  },
  quoteGlow: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 999,
    height: 160,
    position: 'absolute',
    right: -42,
    top: -34,
    width: 160,
  },
  quoteText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontStyle: 'italic',
    lineHeight: 34,
    marginTop: 54,
  },
  quoteAuthor: {
    color: 'rgba(121, 157, 214, 0.85)',
    fontSize: 16,
    marginTop: 8,
  },
  pressed: {
    opacity: 0.76,
  },
});
