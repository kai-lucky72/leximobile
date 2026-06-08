import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SavedWordItem, SearchHistoryItem } from '@/types/dictionary';

const HISTORY_STORAGE_KEY = '@lexitech/search-history';
const SAVED_STORAGE_KEY = '@lexitech/saved-words';

async function readJsonValue<T>(key: string): Promise<T> {
  try {
    const rawValue = await AsyncStorage.getItem(key);
    if (!rawValue) {
      return [] as T;
    }

    return JSON.parse(rawValue) as T;
  } catch {
    return [] as T;
  }
}

export async function loadSearchHistory() {
  return readJsonValue<SearchHistoryItem[]>(HISTORY_STORAGE_KEY);
}

export async function saveSearchHistory(items: SearchHistoryItem[]) {
  await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
}

export async function loadSavedWords() {
  return readJsonValue<SavedWordItem[]>(SAVED_STORAGE_KEY);
}

export async function saveSavedWords(items: SavedWordItem[]) {
  await AsyncStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(items));
}
