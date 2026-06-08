import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from 'expo-router';

import { AppShell } from '@/components/app-shell';
import { LexiTheme } from '@/constants/lexi-theme';
import { useLexi } from '@/providers/lexi-provider';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { clearHistory, clearSavedWords, history, savedWords } = useLexi();

  return (
    <AppShell
      leftAction={{
        icon: 'menu',
        label: 'Open navigation drawer',
        onPress: () => {
          if ('openDrawer' in navigation) {
            (navigation as { openDrawer: () => void }).openDrawer();
          }
        },
      }}
      showBottomNav={false}
      title="LexiTech">
      <View style={styles.headerCopy}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>
          Manage local word data stored on this device and keep the app tidy for exam testing.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Local Storage</Text>
        <Text style={styles.cardText}>
          Search history: {history.length} item{history.length === 1 ? '' : 's'}
        </Text>
        <Text style={styles.cardText}>
          Saved words: {savedWords.length} item{savedWords.length === 1 ? '' : 's'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Privacy First</Text>
        <Text style={styles.cardText}>
          Your search history stays on this device only and can be cleared whenever you want.
        </Text>

        <Pressable
          onPress={() => {
            Alert.alert('Clear search history', 'Remove all stored search history from this device?', [
              { style: 'cancel', text: 'Cancel' },
              { style: 'destructive', text: 'Clear', onPress: clearHistory },
            ]);
          }}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <Text style={styles.primaryButtonText}>Clear Search History</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            Alert.alert('Clear saved words', 'Remove all saved words from this device?', [
              { style: 'cancel', text: 'Cancel' },
              { style: 'destructive', text: 'Clear', onPress: clearSavedWords },
            ]);
          }}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
          <Text style={styles.secondaryButtonText}>Clear Saved Words</Text>
        </Pressable>
      </View>
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
  card: {
    backgroundColor: LexiTheme.colors.surface,
    borderColor: LexiTheme.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    padding: 24,
  },
  cardTitle: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  cardText: {
    color: LexiTheme.colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: LexiTheme.colors.surfaceStrong,
    borderRadius: 12,
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    borderColor: LexiTheme.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: LexiTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
