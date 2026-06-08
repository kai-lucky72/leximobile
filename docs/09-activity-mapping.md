# 09 — Activity → Implementation Mapping

Every brief sub-task is traced to the file (and key symbol) that delivers it. All file paths are relative to the project root.

## Activity 1 — Word Search & API Integration

| Sub-task | Delivered by |
|---|---|
| Search screen with text input + search button | [`src/components/search-bar.tsx`](../src/components/search-bar.tsx) (`TextInput` + Pressable Search button); used in [`src/app/index.tsx`](../src/app/index.tsx) on both Home variants |
| Validate input not empty | `runSearch` in `index.tsx` (`if (!normalizedWord) setError({kind:'validation'})`); SearchBar `sanitizeSearchInput` strips spaces + non-letters before submission |
| Capture word on submit | `onSubmitEditing={onSubmit}` on TextInput + `onPress={onSubmit}` on the button — both call `runSearch(query)` |
| Construct API URL dynamically | `dictionaryClient` with `baseURL` + `encodeURIComponent(word)` in [`src/services/dictionary-api.ts`](../src/services/dictionary-api.ts) |
| HTTP GET `…/entries/en/{word}` | `dictionaryClient.get(...)` in `fetchWordEntry` |
| Loading indicator during request | Skeleton placeholders + "SEARCHING DICTIONARY…" header in [`src/app/word/[term].tsx`](../src/app/word/[term].tsx) `loading` branch |
| Parse JSON response | `buildMeanings`, `pickPhonetic`, `buildAudioOptions`, `buildExcerpt` in `dictionary-api.ts` → `WordEntry` |
| Store fetched data temporarily | `cacheWord(entry)` in `LexiProvider` (in-memory `cachedWords`); details screen reads via `getCachedWord(key)` |

## Activity 2 — Display Word Details

| Sub-task | Delivered by |
|---|---|
| Extract word, phonetics, meanings, definitions | `fetchWordEntry` → typed `WordEntry` |
| Word at top, prominent | `<Text style={styles.wordTitle}>{entry.word}</Text>` (40 px / weight 700) in `[term].tsx` |
| Phonetic spelling | `phoneticBadge` chip showing `entry.phonetic` |
| Each part of speech | `MeaningCard` PoS badge per `entry.meanings[]` |
| All definitions under their PoS | `meaning.definitions.map(...)` numbered list in `MeaningCard` |
| Example sentences | `exampleBox` in `MeaningCard`; "Common Usage" bullet list aggregates examples at screen level |
| Multi-meaning + long-definition support | `entry.meanings.map(MeaningCard)`; everything inside `ScrollView`; `flex:1` + `lineHeight` on definition text |
| Consistent styling & spacing | Single `LexiTheme` token set in [`src/constants/lexi-theme.ts`](../src/constants/lexi-theme.ts); uniform `borderRadius`, `padding`, `gap`, typography |

## Activity 3 — Audio Pronunciation

| Sub-task | Delivered by |
|---|---|
| Check audio URL exists | `buildAudioOptions` filters phonetics with non-empty `audio`; `WordEntry.audioOptions` |
| Speaker icon next to word/phonetics | Round Pressable with `volume-high` icon in `pronunciationRow` |
| Load audio from URL | `useAudioPlayer(undefined, { downloadFirst: true })` from `expo-audio`; `player.replace(url)` |
| Play on tap | `togglePlayback(url)` → `player.replace(url); player.play()` |
| Multiple pronunciations | When `audioOptions.length > 1`: chip list with UK / US labels; selected chip highlighted |
| Hide audio if none provided | `{entry.audioOptions[0] ? <Pressable .../> : null}` |
| Manage play / pause / stop | `useAudioPlayerStatus` reads state; `togglePlayback` handles play/pause; dedicated red "Stop" chip calls `player.pause()` + `await player.seekTo(0)` |

## Activity 4 — Drawer Navigation & Search History

| Sub-task | Delivered by |
|---|---|
| Drawer navigation | `Drawer` from `expo-router/drawer` in [`src/app/_layout.tsx`](../src/app/_layout.tsx) with `AppDrawerContent` |
| Search history data structure | `SearchHistoryItem` in [`src/types/dictionary.ts`](../src/types/dictionary.ts); held in `LexiProvider`; persisted under `@lexitech/search-history` |
| Add word to history on success | `applyLoadedWord` → `addHistoryItem(toWordSummary(entry))` in `[term].tsx` |
| Display in drawer menu | [`src/components/app-drawer-content.tsx`](../src/components/app-drawer-content.tsx) — "SEARCH HISTORY" section with `history.slice(0, 8)` |
| Tap from drawer | `openWord(item.key)` → `closeDrawer()` + `router.push(/word/[term])` |
| Trigger API request on selection | Details effect re-runs on `normalizedTerm` change; cache miss → `fetchWordEntry` |
| Refresh detail screen | Effect resets `entry`, `loading`, `error`; `applyLoadedWord` updates state |
| Prevent duplicate entries | `upsertSummary` filters by `key` before prepending; words are lowercased + trimmed |

## Activity 5 — Error Handling & User Feedback

| Sub-task | Delivered by |
|---|---|
| Detect 404 | `if (error.response?.status === 404)` → `DictionaryApiError('not-found')` |
| User-friendly "Word not found" | Dedicated screen with sad face · Search Again · OR · Suggest a word · Quick Tips in `[term].tsx` |
| Handle network connectivity | `if (!error.response)` → `DictionaryApiError('network')` → Connection problem UI |
| Show error message on failure | EmptyStateCard with kind-specific copy for `unexpected`; the not-found and network branches have custom layouts |
| Hide loading on error | Render cascade: `missingTerm ? : loading ? : error ? : entry ? ...` — skeleton and error states are mutually exclusive |
| Crash-proof parsing | Empty-array guard, optional chaining throughout `buildMeanings`/`pickPhonetic`/`buildAudioOptions`, try/catch around `JSON.parse` in `local-store.ts`, `useLocalSearchParams` normalization, `isMounted` flag on async effects |
| Allow retry | `Retry` button bumps `reloadToken` → effect refetches; `Search Again` / `Suggest a word` route back to `/` |
| Empty-state messages | "No word selected", "No search history yet" (+ Daily Wisdom / Privacy First), "Nothing saved yet", drawer empty hint, inline SearchBar validation |

## Instruction sub-tasks

| Instruction | Status |
|---|---|
| First-hour design document | This `docs/` folder (you are reading it) |
| Android app built using React Native | Yes — RN 0.85 via Expo 56 |
| Input validation | `runSearch` empty check + `sanitizeSearchInput` |
| Error / validation messages on failure | Every error path renders user-facing copy |
| HTTP via axios | `axios.create` client; no `fetch` calls in app code |
| Testing via expo CLI | All scripts route through `expo`: `expo start`, `expo run:android`, `expo run:ios`, `expo start --web`, `expo lint` |
