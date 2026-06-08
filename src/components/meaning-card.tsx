import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { LexiTheme } from '@/constants/lexi-theme';
import type { WordMeaning } from '@/types/dictionary';

export function MeaningCard({
  meaning,
  sourceLabel,
  sourceUrl,
}: {
  meaning: WordMeaning;
  sourceLabel?: string;
  sourceUrl?: string;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{meaning.partOfSpeech.toUpperCase()}</Text>
      </View>

      <View style={styles.definitionStack}>
        {meaning.definitions.map((definition, index) => (
          <View key={definition.id} style={styles.definitionItem}>
            <View style={styles.definitionRow}>
              <Text style={styles.definitionIndex}>{index + 1}.</Text>
              <Text style={styles.definitionText}>{definition.definition}</Text>
            </View>

            {definition.example ? (
              <View style={styles.exampleBox}>
                <Text style={styles.exampleText}>{`"${definition.example}"`}</Text>
              </View>
            ) : null}
          </View>
        ))}
      </View>

      {sourceUrl ? (
        <View style={styles.footerRow}>
          <Text style={styles.sourceText}>{sourceLabel ?? 'Dictionary source available'}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void Linking.openURL(sourceUrl);
            }}
            style={({ pressed }) => [styles.sourceButton, pressed && styles.pressed]}>
            <Text style={styles.sourceButtonText}>View Full Entry</Text>
            <MaterialCommunityIcons color={LexiTheme.colors.textPrimary} name="open-in-new" size={14} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: LexiTheme.colors.surface,
    borderColor: LexiTheme.colors.border,
    borderRadius: LexiTheme.radius.md,
    borderWidth: 1,
    gap: 16,
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
    borderRadius: LexiTheme.radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  badgeText: {
    color: LexiTheme.colors.mintText,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  definitionStack: {
    gap: 28,
  },
  definitionItem: {
    gap: 16,
  },
  definitionRow: {
    flexDirection: 'row',
    gap: 16,
  },
  definitionIndex: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  definitionText: {
    color: LexiTheme.colors.textBody,
    flex: 1,
    fontSize: 18,
    lineHeight: 30,
  },
  exampleBox: {
    backgroundColor: LexiTheme.colors.mintSoft,
    borderBottomRightRadius: LexiTheme.radius.sm,
    borderLeftColor: LexiTheme.colors.mintText,
    borderLeftWidth: 4,
    borderTopRightRadius: LexiTheme.radius.sm,
    marginLeft: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  exampleText: {
    color: LexiTheme.colors.textMuted,
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  footerRow: {
    alignItems: 'center',
    borderTopColor: LexiTheme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  sourceButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  sourceButtonText: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  sourceText: {
    color: LexiTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  pressed: {
    opacity: 0.76,
  },
});
