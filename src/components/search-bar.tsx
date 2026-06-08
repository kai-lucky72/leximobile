import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { LexiTheme } from '@/constants/lexi-theme';

type SearchBarProps = {
  error?: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  submitting?: boolean;
  value: string;
};

export function SearchBar({
  error,
  onChangeText,
  onSubmit,
  placeholder = 'Search for a word...',
  submitting,
  value,
}: SearchBarProps) {
  return (
    <View style={styles.wrapper}>
      <View style={[styles.searchContainer, !!error && styles.searchContainerError]}>
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
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor="#6B7280"
          returnKeyType="search"
          style={styles.input}
          value={value}
        />
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
    borderWidth: 2,
    flexDirection: 'row',
    minHeight: 58,
    paddingLeft: 18,
    paddingRight: 8,
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
