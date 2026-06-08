# LexiTech Dictionary — Design Document

**Project:** LexiTech Dictionary Mobile App
**Client:** LexiTech Solutions Ltd, Kigali
**Stack:** React Native + Expo (SDK 56), expo-router, axios, expo-audio, AsyncStorage
**API:** Free Dictionary API — `https://api.dictionaryapi.dev/api/v2/entries/en/{word}`

---

## 1. Problem Statement

Build a cross-platform mobile app (Android + iOS) that lets users:

- Search English words.
- View definitions, parts of speech, and example sentences.
- Listen to pronunciations when available.
- Browse multiple meanings of a word.
- Recover gracefully when a word isn't found or when the network fails.

The app must consume the Free Dictionary API via `axios`, validate input, handle errors, and present results in a clean, responsive UI that follows modern mobile UX patterns.

---

## 2. High-Level Architecture

The app is a single React Native client. There is no custom backend — all data comes from the public Free Dictionary API. State is local (in-memory + AsyncStorage on the device).

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Mobile Device (RN + Expo)                    │
│                                                                      │
│   ┌──────────────────┐    ┌──────────────────────────────────────┐   │
│   │   UI Layer       │    │   State Layer                        │   │
│   │ (expo-router     │◄──►│   LexiProvider (React Context)       │   │
│   │  screens +       │    │   - history          (persisted)     │   │
│   │  components)     │    │   - savedWords       (persisted)     │   │
│   └──────────────────┘    │   - cachedWords      (in-memory)     │   │
│            │              └────────┬─────────────────────────────┘   │
│            │                       │                                 │
│            ▼                       ▼                                 │
│   ┌──────────────────┐    ┌──────────────────────────────────────┐   │
│   │  Services Layer  │    │  Persistence Layer                   │   │
│   │  dictionary-api  │    │  local-store (AsyncStorage)          │   │
│   │  (axios client)  │    │  - @lexitech/search-history          │   │
│   └────────┬─────────┘    │  - @lexitech/saved-words             │   │
│            │              └──────────────────────────────────────┘   │
│            │                                                         │
│            │              ┌──────────────────────────────────────┐   │
│            │              │  Audio Layer                         │   │
│            │              │  expo-audio (useAudioPlayer)         │   │
│            │              └──────────────────────────────────────┘   │
└────────────┼─────────────────────────────────────────────────────────┘
             │ HTTPS GET
             ▼
   ┌──────────────────────────────────────┐
   │  api.dictionaryapi.dev               │
   │  /api/v2/entries/en/{word}           │
   └──────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Module | Responsibility |
|---|---|---|
| UI | `src/app/*`, `src/components/*` | Screens and reusable components. Receives data from context, dispatches actions. |
| State | `src/providers/lexi-provider.tsx` | React Context. Owns history, saved words, in-memory word cache. Hydrates from AsyncStorage on mount. |
| Services | `src/services/dictionary-api.ts` | axios client. Builds URL, parses + normalizes JSON, throws typed `DictionaryApiError`. |
| Persistence | `src/services/local-store.ts` | Thin wrapper over `AsyncStorage` with corruption-tolerant reads. |
| Audio | `expo-audio` via `[term].tsx` | Loads audio URL, manages play / pause / stop / multiple sources. |
| Routing | `src/app/_layout.tsx` (expo-router Drawer) | Drawer navigation, screen registration. |

---

## 3. Data Flow Diagrams

### 3.1 Successful Word Search

```
User                Home (index.tsx)         Details ([term].tsx)        Dictionary API
 │                       │                          │                          │
 │ Types "education"     │                          │                          │
 │──────────────────────►│                          │                          │
 │ Taps Search           │                          │                          │
 │──────────────────────►│                          │                          │
 │                       │ validate(input)          │                          │
 │                       │ ─► non-empty? ✓          │                          │
 │                       │                          │                          │
 │                       │ router.push(/word/education)                        │
 │                       │ ─────────────────────────►                          │
 │                       │                          │ getCachedWord('education')│
 │                       │                          │   ─► miss                │
 │                       │                          │                          │
 │                       │                          │ setLoading(true)         │
 │                       │                          │ <render skeleton>        │
 │                       │                          │                          │
 │                       │                          │ fetchWordEntry           │
 │                       │                          │ ─────────────────────────►
 │                       │                          │                          │ GET /entries/en/education
 │                       │                          │ ◄─────────────────────── │ 200 OK + JSON[]
 │                       │                          │                          │
 │                       │                          │ parse → WordEntry        │
 │                       │                          │ cacheWord(entry)         │
 │                       │                          │ addHistoryItem(summary)  │
 │                       │                          │ setLoading(false)        │
 │                       │                          │ <render details>         │
 │ ◄─────────────────────────────────────────────── │                          │
```

### 3.2 Word Not Found (404)

```
User              Home          Details              Dictionary API
 │ "xyzabc"        │              │                       │
 │────────────────►│              │                       │
 │                 │ push(/word/xyzabc)                   │
 │                 │ ────────────►│                       │
 │                 │              │ fetchWordEntry        │
 │                 │              │ ─────────────────────►│
 │                 │              │ ◄──────────────────── │ 404
 │                 │              │ throw DictionaryApiError('not-found')
 │                 │              │ catch → setError({kind:'not-found'})
 │                 │              │ setLoading(false)
 │                 │              │ <render "Word not found" page:
 │                 │              │  sad face / Search Again / OR /
 │                 │              │  Suggest a word / QUICK TIPS>
```

### 3.3 Network Failure

```
fetchWordEntry → axios → (no response) → DictionaryApiError('network')
                                              │
                                              ▼
Details screen renders:
  • CURRENT SEARCH card (showing failing term)
  • cloud-off icon + "Connection problem"
  • Retry  → bumps reloadToken → effect refetches
  • Check Settings → /settings
  • Offline Access tip
```

### 3.4 History Tap from Drawer

```
User taps "kigali" in drawer history
        │
        ▼
AppDrawerContent.openWord('kigali')
  → closeDrawer()
  → router.push(/word/kigali)
        │
        ▼
Details effect runs with normalizedTerm='kigali'
  → cache hit (same session)? render immediately
  → cache miss? fetchWordEntry('kigali') → re-render
```

---

## 4. API Surface

There is exactly one external endpoint consumed by the app.

| Method | URL | Purpose | Success | Failure |
|---|---|---|---|---|
| GET | `https://api.dictionaryapi.dev/api/v2/entries/en/{word}` | Fetch dictionary entries for an English word | `200` + JSON array of entries | `404` if not found; non-2xx for other failures; no response for offline |

The axios client is defined once with `baseURL` so each request only needs `encodeURIComponent(word)`.

### 4.1 Response Schema (excerpt)

```jsonc
[
  {
    "word": "education",
    "phonetic": "/ˌɛd.jʊˈkeɪ.ʃən/",
    "phonetics": [
      { "text": "/ˌɛd.jʊˈkeɪ.ʃən/", "audio": "https://.../education-uk.mp3" },
      { "text": "/ˌɛdʒ.əˈkeɪ.ʃən/", "audio": "https://.../education-us.mp3" }
    ],
    "meanings": [
      {
        "partOfSpeech": "noun",
        "definitions": [
          {
            "definition": "The process of receiving or giving systematic instruction…",
            "example": "a new system of public education",
            "synonyms": ["schooling", "teaching"],
            "antonyms": []
          }
        ],
        "synonyms": ["schooling"],
        "antonyms": []
      }
    ],
    "sourceUrls": ["https://en.wiktionary.org/wiki/education"],
    "license": { "name": "CC BY-SA 3.0", "url": "https://..." }
  }
]
```

### 4.2 Internal Type (after normalization)

```ts
type WordEntry = {
  key: string;                 // lowercased, trimmed - used as cache/history id
  word: string;
  phonetic?: string;
  audioOptions: AudioOption[]; // {id,label,url} deduped
  meanings: WordMeaning[];     // partOfSpeech + definitions[] + synonyms/antonyms
  sourceUrls: string[];
  licenseName?: string;
  excerpt: string;             // first definition, truncated for previews
  usageExamples: string[];     // up to 3 examples flattened across meanings
  synonyms: string[];          // top 8 unique synonyms
};
```

---

## 5. Pages / Screens

Routing is file-based via `expo-router` with a top-level `Drawer`.

| Route | File | Purpose |
|---|---|---|
| `/` | `src/app/index.tsx` | **Home.** Two variants based on `history.length`: first-time empty state (illustration + tag chips) or returning user (Master Your Language + Word of the Day + Quick Access + quote card). Search input + button. |
| `/word/[term]` | `src/app/word/[term].tsx` | **Word details.** Loading skeleton → results (title, phonetic, audio, meanings) → or error views (not-found / network / generic). |
| `/recent` | `src/app/recent.tsx` | **History.** Active-search card for the most recent word, then list rows. Empty state with Daily Wisdom + Privacy First info cards when no history yet. |
| `/saved` | `src/app/saved.tsx` | **Saved Words.** List of bookmarked entries; empty state if none. |
| `/settings` | `src/app/settings.tsx` | **Settings.** Shows live counts of stored items; lets the user clear history or saved words. |
| Drawer | `src/components/app-drawer-content.tsx` | Slide-in menu with Home / Bookmarks / History / Settings plus the 8 most recent history items as quick links, Clear button, Daily Word card. |

### Screen states (per Figma frames)

- **Home — Search Empty State**
- **Home — Search Validation** (inline error under SearchBar)
- **Splash Screen** (`expo-splash-screen`, configured in `app.json`)
- **Loading State** (skeleton placeholders + "SEARCHING DICTIONARY…")
- **Word Details — Success**
- **Word Details — Multiple Meanings**
- **Error — Word Not Found**
- **Error — Network Problem**
- **History — Active Search + list**
- **History — Empty** with Daily Wisdom / Privacy First
- **Saved — Empty / populated**
- **Drawer open**

---

## 6. Component Inventory

| Component | File | Role |
|---|---|---|
| `AppShell` | `src/components/app-shell.tsx` | Layout primitive — safe-area header (title + left/right actions), scroll container, optional bottom nav. |
| `BottomNav` | `src/components/bottom-nav.tsx` | Explore / Saved / Recent tabs with active highlight. |
| `SearchBar` | `src/components/search-bar.tsx` | Validated text input with sanitizer (strips spaces + non-letters), labeled Search button, inline error row. |
| `MeaningCard` | `src/components/meaning-card.tsx` | One card per part of speech: badge + numbered definitions + example boxes + source link. |
| `EmptyStateCard` | `src/components/empty-state-card.tsx` | Reusable empty / error card with icon + title + description + up to two action buttons. |
| `WordListItem` | `src/components/word-list-item.tsx` | Compact list row used in saved screen. |
| `AppDrawerContent` | `src/components/app-drawer-content.tsx` | Custom drawer body (nav + history + daily word). |

---

## 7. State Management

All shared state lives in **`LexiProvider`** (React Context, `src/providers/lexi-provider.tsx`).

```
LexiProvider
├── history: SearchHistoryItem[]   ◄── persisted in @lexitech/search-history
├── savedWords: SavedWordItem[]    ◄── persisted in @lexitech/saved-words
├── cachedWords: Record<key, WordEntry>  (in-memory only, session scope)
└── hasHydrated: boolean
```

**Actions**

| Action | Effect |
|---|---|
| `addHistoryItem(summary)` | Upserts by `key`, prepends, caps at 12, persists. **Prevents duplicates.** |
| `removeHistoryItem(key)` / `clearHistory()` | Remove single / all entries. |
| `toggleSavedWord(summary)` | Bookmark toggle; persists. |
| `removeSavedWord(key)` / `clearSavedWords()` | Single / all. |
| `cacheWord(entry)` / `getCachedWord(key)` | In-memory cache for fast re-navigation. |
| `isSavedWord(key)` | Drives the bookmark icon state. |

Persistence is fire-and-forget (`void saveSearchHistory(...)`) — state updates are synchronous, writes are async.

---

## 8. Error Strategy

Single error type, discriminated by `kind`:

```ts
class DictionaryApiError extends Error {
  kind: 'not-found' | 'network' | 'unexpected';
  status?: number;
}
```

`fetchWordEntry` catches axios errors and maps to:

| Condition | `kind` | UI |
|---|---|---|
| `response.status === 404` | `not-found` | Sad-face screen, Search Again, Suggest a word, QUICK TIPS |
| `!error.response` (offline / timeout) | `network` | CURRENT SEARCH card + cloud-off + Retry + Check Settings + Offline Access |
| Other non-2xx / empty payload | `unexpected` | Generic "Unable to load word" + Retry |
| Caught at UI layer (validation) | `validation` (UI-only) | Inline message under SearchBar |

`AsyncStorage` reads are wrapped in `try / catch` returning `[]` to survive corrupted JSON.

---

## 9. Cross-Platform Considerations

- React Native 0.85 via Expo SDK 56 — single codebase, runs on Android + iOS + Web.
- Audio: `expo-audio` plugin in `app.json`; Android permissions declared (`RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`, foreground service for media).
- Splash + adaptive icons configured for Android and iOS.
- Drawer + gesture handler set up via `GestureHandlerRootView` and `SafeAreaProvider` at the app root.
- TypeScript strict; no `any` in core logic.

---

## 10. Mapping Activities → Implementation

| Activity | Sub-tasks | Modules |
|---|---|---|
| **1 — Search & API** | Validation, capture, URL build, GET, loading, parse, temp store | `search-bar.tsx`, `index.tsx`, `dictionary-api.ts`, `[term].tsx`, `lexi-provider.tsx` |
| **2 — Display Details** | Word title, phonetic, PoS, definitions, examples, multi-meaning layout | `[term].tsx`, `meaning-card.tsx` |
| **3 — Audio** | Detect audio, speaker icon, load, play, multi-source, hide if absent, play/pause/stop | `dictionary-api.ts` (`buildAudioOptions`), `[term].tsx` (`useAudioPlayer`) |
| **4 — Drawer + History** | Drawer, data structure, add on success, list in drawer, tap-to-load, refresh, dedupe | `_layout.tsx`, `app-drawer-content.tsx`, `lexi-provider.tsx`, `local-store.ts`, `recent.tsx` |
| **5 — Errors & Feedback** | 404, network, generic, hide loaders, crash-proof parsing, retry, empty states | `dictionary-api.ts`, `[term].tsx`, `empty-state-card.tsx`, multiple screens |

---

## 11. Constraints Honored

- ✅ React Native (via Expo).
- ✅ `axios` for HTTP (not `fetch`).
- ✅ Input validation (empty check + character whitelist).
- ✅ Friendly error messages on every failure path.
- ✅ Testable through `expo cli` (`npx expo start` / `expo run:android`).
- ✅ Runs on Android **and** iOS from the same codebase.
