import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { LexiTheme } from '@/constants/lexi-theme';
import type { SavedWordItem, SearchHistoryItem } from '@/types/dictionary';

type WordListItemProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  item: SearchHistoryItem | SavedWordItem;
  onPress: () => void;
  onSecondaryPress?: () => void;
  secondaryIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  timestampLabel: string;
};

export function WordListItem({
  icon,
  item,
  onPress,
  onSecondaryPress,
  secondaryIcon = 'chevron-right',
  timestampLabel,
}: WordListItemProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <View style={styles.contentRow}>
        <View style={styles.leadingIcon}>
          <MaterialCommunityIcons color={LexiTheme.colors.textSoft} name={icon} size={18} />
        </View>

        <View style={styles.textColumn}>
          <Text style={styles.word}>{item.word}</Text>
          {item.phonetic ? <Text style={styles.phonetic}>{item.phonetic}</Text> : null}
          <Text numberOfLines={2} style={styles.excerpt}>
            {item.excerpt}
          </Text>
          <Text style={styles.timestamp}>{timestampLabel}</Text>
        </View>
      </View>

      {onSecondaryPress ? (
        <Pressable onPress={onSecondaryPress} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
          <MaterialCommunityIcons color={LexiTheme.colors.textMuted} name={secondaryIcon} size={18} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: LexiTheme.colors.surface,
    borderColor: LexiTheme.colors.border,
    borderRadius: LexiTheme.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  leadingIcon: {
    alignItems: 'center',
    backgroundColor: LexiTheme.colors.surfaceStrongAlt,
    borderRadius: 999,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  word: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  phonetic: {
    color: LexiTheme.colors.textSoft,
    fontSize: 15,
  },
  excerpt: {
    color: LexiTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  timestamp: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 8,
  },
  secondaryButton: {
    borderRadius: 999,
    padding: 8,
  },
  pressed: {
    opacity: 0.74,
  },
});
