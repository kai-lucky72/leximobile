# 02 — Architecture

The app is a single React Native client with no custom backend. State is local; the only network dependency is the Free Dictionary API.

## Layered view

```mermaid
---
id: e92cb68e-fc74-451a-b23f-344c22f64ba8
---
flowchart TB
    subgraph Device["📱 Mobile Device (React Native + Expo)"]
        direction TB

        subgraph UI["UI Layer · expo-router screens + components"]
            Home["Home (index.tsx)"]
            Details["Word Details ([term].tsx)"]
            Recent["History (recent.tsx)"]
            Saved["Saved (saved.tsx)"]
            Settings["Settings (settings.tsx)"]
            Drawer["AppDrawerContent"]
        end

        subgraph State["State Layer · React Context"]
            Lexi["LexiProvider<br/>• history (persisted)<br/>• savedWords (persisted)<br/>• cachedWords (in-memory)"]
        end

        subgraph Services["Services Layer"]
            API["dictionary-api.ts<br/>axios client + parser"]
            Store["local-store.ts<br/>AsyncStorage wrapper"]
            Audio["expo-audio<br/>useAudioPlayer"]
        end

        subgraph Persistence["Device Storage"]
            AsyncS[("AsyncStorage<br/>@lexitech/search-history<br/>@lexitech/saved-words")]
        end

        UI <--> Lexi
        UI --> API
        UI --> Audio
        Lexi --> Store
        Store <--> AsyncS
    end

    API -- "HTTPS GET" --> Ext[("api.dictionaryapi.dev<br/>/api/v2/entries/en/{word}")]

    classDef ext fill:#fde68a,stroke:#b45309,color:#000
    class Ext ext
```

## Module responsibilities

| Layer | Module | Responsibility |
|---|---|---|
| UI | [`src/app/*`](../src/app), [`src/components/*`](../src/components) | Screens + reusable components. Pulls data from context, dispatches actions. Owns no business logic. |
| State | [`src/providers/lexi-provider.tsx`](../src/providers/lexi-provider.tsx) | Single React Context. Owns history, saved words, in-memory cache. Hydrates from AsyncStorage on mount. |
| Services — API | [`src/services/dictionary-api.ts`](../src/services/dictionary-api.ts) | axios client. Builds URL, parses JSON into normalized `WordEntry`, throws typed `DictionaryApiError`. |
| Services — Storage | [`src/services/local-store.ts`](../src/services/local-store.ts) | Thin, corruption-tolerant wrapper around `AsyncStorage`. |
| Services — Audio | `expo-audio` consumed in `[term].tsx` | Loads + plays the pronunciation MP3, tracks play/pause/stop. |
| Routing | [`src/app/_layout.tsx`](../src/app/_layout.tsx) | `expo-router` Drawer, registers all screens, sets up `GestureHandlerRootView` + `SafeAreaProvider`. |

## Why this shape

- **No state library** — Context + local state is enough for this scope; saves ~50 KB of JS and an extra dependency.
- **Services are pure modules** — no React imports, so they're trivially unit-testable.
- **Single error type** with a discriminated `kind` field — UI branches deterministically, not by string matching.
- **One Context, not many** — avoids provider tree-walks; everything related to a word (history/saved/cache) is co-located.

## Build & run topology

```mermaid
flowchart LR
    Dev["Developer machine<br/>(Metro / Expo CLI)"] -- "expo start" --> Bundler[Metro Bundler]
    Bundler -- "adb reverse :8081" --> Phone[Android Phone over USB]
    Bundler -- "QR / LAN" --> Other[Other devices on LAN]
    Phone -- "Expo Go / dev client" --> App[Running App]
    App -- "HTTPS" --> Cloud[(Dictionary API)]
```
