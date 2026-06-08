import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { LexiTheme } from '@/constants/lexi-theme';

type EmptyStateCardProps = {
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  primaryAction?: {
    label: string;
    onPress: () => void;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  title: string;
};

export function EmptyStateCard({
  description,
  icon,
  primaryAction,
  secondaryAction,
  title,
}: EmptyStateCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons color={LexiTheme.colors.textPrimary} name={icon} size={42} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {primaryAction ? (
        <Pressable onPress={primaryAction.onPress} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <Text style={styles.primaryButtonText}>{primaryAction.label}</Text>
        </Pressable>
      ) : null}

      {secondaryAction ? (
        <Pressable onPress={secondaryAction.onPress} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
          <Text style={styles.secondaryButtonText}>{secondaryAction.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderColor: LexiTheme.colors.border,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    overflow: 'hidden',
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(144, 239, 239, 0.22)',
    borderRadius: 999,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  title: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    color: LexiTheme.colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: LexiTheme.colors.surfaceStrong,
    borderRadius: LexiTheme.radius.md,
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    width: '100%',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    borderColor: LexiTheme.colors.border,
    borderRadius: LexiTheme.radius.md,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 14,
    width: '100%',
  },
  secondaryButtonText: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.78,
  },
});
