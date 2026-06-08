import { startTransition, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';

import { AppShell } from '@/components/app-shell';
import { LexiTheme } from '@/constants/lexi-theme';
import { SearchBar } from '@/components/search-bar';
import { useLexi } from '@/providers/lexi-provider';
import type { DictionaryScreenError } from '@/types/dictionary';

const QUICK_LINKS: {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  route: '/recent' | '/saved' | '/settings';
}[] = [
  { label: 'Recent Searches', icon: 'history', route: '/recent' },
  { label: 'Saved Words', icon: 'bookmark-outline', route: '/saved' },
  { label: 'Settings', icon: 'cog-outline', route: '/settings' },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { history } = useLexi();
  const [query, setQuery] = useState('');
  const [error, setError] = useState<DictionaryScreenError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasHistory = history.length > 0;

  function runSearch(rawWord: string) {
    const normalizedWord = rawWord.trim().toLowerCase();
    if (!normalizedWord) {
      setError({
        kind: 'validation',
        message: 'Please enter a word to search.',
      });
      return;
    }

    setError(null);
    setIsSubmitting(true);

    startTransition(() => {
      router.push({
        pathname: '/word/[term]' as never,
        params: { term: normalizedWord },
      } as never);
    });

    setTimeout(() => setIsSubmitting(false), 250);
  }

  const searchBar = (
    <SearchBar
      error={error?.message}
      onChangeText={(value) => {
        setQuery(value);
        if (error) {
          setError(null);
        }
      }}
      onSubmit={() => runSearch(query)}
      placeholder={hasHistory ? 'Search for a word...' : 'Search'}
      submitting={isSubmitting}
      value={query}
    />
  );

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
      rightActions={
        hasHistory
          ? [
              {
                icon: 'account-circle-outline',
                label: 'Profile',
                onPress: () => {
                  startTransition(() => {
                    router.replace('/settings' as never);
                  });
                },
              },
            ]
          : []
      }
      title="LexiTech">
      {hasHistory ? (
        <>
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Master Your Language</Text>
            <Text style={styles.heroSubtitle}>
              Explore deep etymologies, precise phonetics, and contextual usage with our scholarly digital lexicon.
            </Text>
            {searchBar}
          </View>

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
              onPress={() => runSearch('ephemeral')}
              style={({ pressed }) => [styles.featureCta, pressed && styles.pressed]}>
              <Text style={styles.featureCtaText}>EXPLORE ETYMOLOGY</Text>
              <MaterialCommunityIcons color={LexiTheme.colors.textPrimary} name="arrow-right" size={18} />
            </Pressable>
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
        </>
      ) : (
        <>
          <View style={styles.bookIconWrap}>
            <MaterialCommunityIcons
              color={LexiTheme.colors.mintText}
              name="book-open-page-variant"
              size={26}
            />
          </View>

          {searchBar}

          <View style={styles.illustration}>
            <View style={styles.illustrationCircleOuter}>
              <View style={styles.illustrationCircle}>
                <MaterialCommunityIcons
                  color={LexiTheme.colors.mintText}
                  name="bookshelf"
                  size={62}
                />
              </View>
            </View>
          </View>

          <View style={styles.copyBlock}>
            <Text style={styles.title}>Ready to explore?</Text>
            <Text style={styles.subtitle}>
              Search any English word to see its meaning, pronunciation, and examples.
            </Text>
          </View>

          <View style={styles.tagRow}>
            {['#etymology', '#phonetics', '#synonyms'].map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagChipText}>{tag}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    gap: 14,
  },
  heroTitle: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 26,
    fontWeight: '700',
  },
  heroSubtitle: {
    color: LexiTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  featureCard: {
    backgroundColor: LexiTheme.colors.surface,
    borderColor: LexiTheme.colors.border,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
    padding: 22,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
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
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  featureTitle: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 30,
    fontWeight: '700',
    marginTop: 8,
  },
  featurePhonetic: {
    color: LexiTheme.colors.textMuted,
    fontSize: 15,
    fontStyle: 'italic',
  },
  featureExcerpt: {
    color: LexiTheme.colors.textBody,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 6,
  },
  featureCta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  featureCtaText: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  quickAccessCard: {
    backgroundColor: LexiTheme.colors.surfaceStrong,
    borderRadius: 14,
    gap: 6,
    padding: 22,
  },
  quickAccessTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  quickLink: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 6,
  },
  quickLinkText: {
    color: LexiTheme.colors.textSoft,
    fontSize: 15,
  },
  quoteCard: {
    backgroundColor: '#071F3A',
    borderRadius: 14,
    minHeight: 140,
    overflow: 'hidden',
    padding: 22,
  },
  quoteGlow: {
    backgroundColor: 'rgba(144, 239, 239, 0.12)',
    borderRadius: 999,
    height: 140,
    position: 'absolute',
    right: -40,
    top: -30,
    width: 140,
  },
  quoteText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontStyle: 'italic',
    lineHeight: 26,
  },
  quoteAuthor: {
    color: 'rgba(121, 157, 214, 0.85)',
    fontSize: 13,
    marginTop: 8,
  },
  pressed: {
    opacity: 0.78,
  },
  bookIconWrap: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: LexiTheme.colors.mintSoft,
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  illustration: {
    alignItems: 'center',
    marginTop: 12,
  },
  illustrationCircleOuter: {
    alignItems: 'center',
    backgroundColor: 'rgba(144, 239, 239, 0.18)',
    borderRadius: 999,
    height: 168,
    justifyContent: 'center',
    width: 168,
  },
  illustrationCircle: {
    alignItems: 'center',
    backgroundColor: LexiTheme.colors.mintSoft,
    borderRadius: 999,
    height: 132,
    justifyContent: 'center',
    width: 132,
  },
  copyBlock: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: LexiTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 300,
    textAlign: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 4,
  },
  tagChip: {
    backgroundColor: LexiTheme.colors.mintBadge,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  tagChipText: {
    color: LexiTheme.colors.mintText,
    fontSize: 13,
    fontWeight: '600',
  },
});
