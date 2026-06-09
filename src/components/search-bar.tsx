import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { LexiTheme } from '@/constants/lexi-theme';

type SearchBarProps = {
  compact?: boolean;
  error?: string;
  onChangeText: (value: string) => void;
  onInvalidInput?: (message: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  submitting?: boolean;
  value: string;
};

// Allow letters, spaces, hyphen, apostrophe. Digits are rejected with a user-facing message.
// Other punctuation is silently dropped.
function sanitizeSearchInput(value: string): { sanitized: string; rejection: string | null } {
  let rejection: string | null = null;
  if (/\d/.test(value)) {
    rejection = 'Numbers are not allowed in a word.';
  }
  const sanitized = value.replace(/[^A-Za-z\s\-']/g, '');
  return { sanitized, rejection };
}

export function SearchBar({
  compact,
  error,
  onChangeText,
  onInvalidInput,
  onSubmit,
  placeholder = 'Search',
  submitting,
  value,
}: SearchBarProps) {
  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.searchContainer,
          compact && styles.searchContainerCompact,
          !!error && styles.searchContainerError,
        ]}>
        <MaterialCommunityIcons
          color={LexiTheme.colors.textMuted}
          name="magnify"
          size={18}
          style={styles.leadingIcon}
        />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          editable={!submitting}
          onChangeText={(next) => {
            const { sanitized, rejection } = sanitizeSearchInput(next);
            if (rejection) {
              onInvalidInput?.(rejection);
            }
            onChangeText(sanitized);
          }}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor="#9AA3B2"
          returnKeyType="search"
          style={styles.input}
          value={value}
        />
        {compact ? (
          <Pressable
            accessibilityRole="button"
            disabled={submitting}
            onPress={onSubmit}
            style={({ pressed }) => [styles.iconSubmit, pressed && styles.iconSubmitPressed]}>
            <MaterialCommunityIcons
              color={submitting ? LexiTheme.colors.textMuted : LexiTheme.colors.textPrimary}
              name={submitting ? 'dots-horizontal' : 'arrow-right'}
              size={18}
            />
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            disabled={submitting}
            onPress={onSubmit}
            style={({ pressed }) => [
              styles.searchButton,
              submitting && styles.searchButtonDisabled,
              pressed && styles.searchButtonPressed,
            ]}>
            <Text style={styles.searchButtonText}>{submitting ? 'Loading...' : 'Search'}</Text>
          </Pressable>
        )}
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <MaterialCommunityIcons color={LexiTheme.colors.danger} name="alert-circle-outline" size={16} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
    width: '100%',
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: LexiTheme.colors.surface,
    borderColor: LexiTheme.colors.border,
    borderRadius: LexiTheme.radius.pill,
    borderWidth: 1.5,
    flexDirection: 'row',
    minHeight: 52,
    paddingLeft: 18,
    paddingRight: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  searchContainerCompact: {
    minHeight: 48,
  },
  iconSubmit: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  iconSubmitPressed: {
    opacity: 0.7,
  },
  searchContainerError: {
    borderColor: '#F2B8B5',
  },
  leadingIcon: {
    marginRight: 10,
  },
  input: {
    color: LexiTheme.colors.textBody,
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
  },
  searchButton: {
    alignItems: 'center',
    backgroundColor: LexiTheme.colors.surfaceStrong,
    borderRadius: LexiTheme.radius.pill,
    justifyContent: 'center',
    minHeight: 40,
    minWidth: 102,
    paddingHorizontal: 20,
  },
  searchButtonDisabled: {
    opacity: 0.7,
  },
  searchButtonPressed: {
    opacity: 0.85,
  },
  searchButtonText: {
    color: LexiTheme.colors.surface,
    fontSize: 16,
    fontWeight: '500',
  },
  errorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 8,
  },
  errorText: {
    color: LexiTheme.colors.danger,
    fontSize: 16,
  },
});
