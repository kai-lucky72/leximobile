# LexiTech Dictionary — Design Docs

First-hour design package for the LexiTech Dictionary Mobile App.
Each topic lives in its own file. Diagrams use [Mermaid](https://mermaid.js.org/), which GitHub and most modern Markdown viewers render natively.

## Index

| # | Document | Covers |
|---|---|---|
| 01 | [Problem Statement](01-problem-statement.md) | Brief, scope, constraints, success criteria |
| 02 | [Architecture](02-architecture.md) | Layered architecture diagram + module responsibilities |
| 03 | [Data Flow](03-data-flow.md) | Sequence diagrams for search, 404, network failure, history tap, audio |
| 04 | [API Endpoints](04-api-endpoints.md) | External endpoint, request/response, internal types |
| 05 | [Pages & Screens](05-pages-screens.md) | Route map, screen states, navigation graph |
| 06 | [Components](06-components.md) | Reusable component inventory + composition graph |
| 07 | [State Management](07-state-management.md) | Context state shape, action map, persistence |
| 08 | [Error Handling](08-error-handling.md) | Error taxonomy + decision tree |
| 09 | [Activity Mapping](09-activity-mapping.md) | Every brief sub-task → file:line that delivers it |

## Project meta

- **Stack:** React Native (Expo SDK 56) · expo-router · axios · expo-audio · AsyncStorage
- **External API:** Free Dictionary API — `https://api.dictionaryapi.dev/api/v2/entries/en/{word}`
- **Backend:** none (single-client app)
- **Persistence:** on-device AsyncStorage
- **Tested via:** Expo CLI (`expo start`, `expo run:android`, `expo run:ios`)
