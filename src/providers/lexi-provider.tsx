import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { saveSavedWords, saveSearchHistory, loadSavedWords, loadSearchHistory } from '@/services/local-store';
import type { SavedWordItem, SearchHistoryItem, WordEntry, WordSummary } from '@/types/dictionary';

type LexiContextValue = {
  cachedWords: Record<string, WordEntry>;
  history: SearchHistoryItem[];
  hasHydrated: boolean;
  savedWords: SavedWordItem[];
  addHistoryItem: (summary: WordSummary) => void;
  cacheWord: (entry: WordEntry) => void;
  clearHistory: () => void;
  clearSavedWords: () => void;
  getCachedWord: (key: string) => WordEntry | undefined;
  isSavedWord: (key: string) => boolean;
  removeHistoryItem: (key: string) => void;
  removeSavedWord: (key: string) => void;
  toggleSavedWord: (summary: WordSummary) => boolean;
};

const LexiContext = createContext<LexiContextValue | null>(null);

const HISTORY_LIMIT = 12;

function upsertSummary<T extends { key: string }>(items: T[], incoming: T, limit?: number) {
  const nextItems = [incoming, ...items.filter((item) => item.key !== incoming.key)];
  if (!limit) {
    return nextItems;
  }

  return nextItems.slice(0, limit);
}

export function LexiProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [savedWords, setSavedWords] = useState<SavedWordItem[]>([]);
  const [cachedWords, setCachedWords] = useState<Record<string, WordEntry>>({});
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function hydrate() {
      const [storedHistory, storedSavedWords] = await Promise.all([
        loadSearchHistory(),
        loadSavedWords(),
      ]);

      if (!isMounted) {
        return;
      }

      setHistory(storedHistory);
      setSavedWords(storedSavedWords);
      setHasHydrated(true);
    }

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  function cacheWord(entry: WordEntry) {
    setCachedWords((current) => ({
      ...current,
      [entry.key]: entry,
    }));
  }

  function getCachedWord(key: string) {
    return cachedWords[key.toLowerCase()];
  }

  function addHistoryItem(summary: WordSummary) {
    setHistory((current) => {
      const nextItems = upsertSummary(
        current,
        {
          ...summary,
          searchedAt: new Date().toISOString(),
        },
        HISTORY_LIMIT
      );
      void saveSearchHistory(nextItems);
      return nextItems;
    });
  }

  function removeHistoryItem(key: string) {
    setHistory((current) => {
      const nextItems = current.filter((item) => item.key !== key);
      void saveSearchHistory(nextItems);
      return nextItems;
    });
  }

  function clearHistory() {
    setHistory(() => {
      void saveSearchHistory([]);
      return [];
    });
  }

  function toggleSavedWord(summary: WordSummary) {
    let isNowSaved = false;

    setSavedWords((current) => {
      const existingItem = current.find((item) => item.key === summary.key);
      const nextItems = existingItem
        ? current.filter((item) => item.key !== summary.key)
        : upsertSummary(current, {
            ...summary,
            savedAt: new Date().toISOString(),
          });

      isNowSaved = !existingItem;
      void saveSavedWords(nextItems);
      return nextItems;
    });

    return isNowSaved;
  }

  function removeSavedWord(key: string) {
    setSavedWords((current) => {
      const nextItems = current.filter((item) => item.key !== key);
      void saveSavedWords(nextItems);
      return nextItems;
    });
  }

  function clearSavedWords() {
    setSavedWords(() => {
      void saveSavedWords([]);
      return [];
    });
  }

  function isSavedWord(key: string) {
    return savedWords.some((item) => item.key === key.toLowerCase());
  }

  return (
    <LexiContext.Provider
      value={{
        cachedWords,
        history,
        hasHydrated,
        savedWords,
        addHistoryItem,
        cacheWord,
        clearHistory,
        clearSavedWords,
        getCachedWord,
        isSavedWord,
        removeHistoryItem,
        removeSavedWord,
        toggleSavedWord,
      }}>
      {children}
    </LexiContext.Provider>
  );
}

export function useLexi() {
  const context = useContext(LexiContext);
  if (!context) {
    throw new Error('useLexi must be used within a LexiProvider.');
  }

  return context;
}
