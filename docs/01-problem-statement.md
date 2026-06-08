# 01 — Problem Statement

## Brief

LexiTech Solutions Ltd has been contracted to build a cross-platform mobile **Dictionary App** that lets users quickly look up English words, see definitions and parts of speech, hear pronunciations, and review their search history. The app consumes the public [Free Dictionary API](https://api.dictionaryapi.dev/) and must work on both Android and iOS from a single codebase.

## In-scope user goals

- Search for any English word.
- View definitions, phonetic spellings, parts of speech, and example sentences.
- Listen to pronunciations when the API provides audio.
- See multiple meanings of a word.
- Recover gracefully when a word isn't found or when offline.
- Re-open recent searches without retyping.
- Bookmark words for later.

## Out of scope

- User accounts / authentication.
- A custom backend — the only data source is the public API.
- Word-of-the-day generated server-side (the home feature card is static).
- Translation between languages.

## Hard constraints (from the brief)

| Constraint | Where honored |
|---|---|
| Cross-platform (Android + iOS) | React Native via Expo SDK 56 — single codebase |
| Built with React Native | `react-native@0.85.3` + `expo@~56.0.8` |
| HTTP via axios | [`src/services/dictionary-api.ts`](../src/services/dictionary-api.ts) |
| Validate input where applicable | `runSearch` empty check + `sanitizeSearchInput` in `SearchBar` |
| User-facing error messages on failure | Typed `DictionaryApiError` → branched UI |
| Tested via Expo CLI | `package.json` scripts: `expo start`, `expo run:android`, `expo run:ios` |

## Success criteria

1. User submits a word → sees full definitions within seconds.
2. User submits a non-word → sees a friendly "Word not found" screen, not a crash.
3. User submits while offline → sees a "Connection problem" screen with Retry.
4. User re-opens the app → recent searches and saved words persist.
5. Same APK / IPA shape ships on both platforms without per-OS branches in app code.
