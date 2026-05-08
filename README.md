# Basira / بصيرة

Basira (بصيرة, "insight") is an Arabic-first React Native / Expo app for discovering books. It opens with a short story honouring **Ibn al-Haytham (Alhazen)** — the father of optics — and then lets the reader search for books or scan an ISBN with the camera.

## Features

- **Real book search** powered by the public [Google Books API](https://developers.google.com/books/docs/v1/using).
- **ISBN camera lookup** — point the device camera at the barcode on a book's back cover and Basira fetches the matching title.
- **Arabic-first UI**, RTL-aware copy, result cards, empty/error states, and button labels.
- **Ibn al-Haytham intro** preserved as a quiet reminder of the heritage behind the name.

## Tech stack

- Expo SDK 52 (React Native 0.72, React 18)
- TypeScript (strict)
- React Navigation (native stack)
- `expo-camera` for barcode scanning
- Google Books REST API (no key required for basic search)

## Project structure

```
App.tsx                # Navigation root (Story → Home → Scan)
screens/
  StoryScreen.tsx      # Ibn al-Haytham intro
  HomeScreen.tsx       # Search UI
  ScanScreen.tsx       # ISBN camera scanner
services/
  googleBooks.ts       # Thin Google Books API client
hooks/
  useBookSearch.ts     # Debounced search hook with loading/error state
```

## Running locally

```bash
npm install
npm start         # Expo dev server (scan QR with Expo Go)
npm run android   # Build/run on an Android device or emulator
npm run ios       # Build/run on an iOS simulator (macOS only)
npm run web       # Run in the browser (camera scan is mobile-only)
npm run typecheck # TypeScript check (tsc --noEmit)
```

The first time you tap the **scan button**, the OS will ask for camera permission. Basira only uses the camera to read ISBN/EAN barcodes — it doesn't record or upload images.

## Manual test plan

- Search for a common term (e.g. "ابن الهيثم", "Harry Potter"). Expect a list of results with covers, authors, year and short description.
- Clear the search box → empty/idle state with guidance copy.
- Disable network → search shows the connection-error state.
- Tap the barcode button → camera opens (after permission). Scan a book ISBN → book details appear; tap "مسح كتاب آخر" to scan again or "العودة" to return to search.

## Release notes — v0.2.0

- Renamed app to **Basira (بصيرة)**; updated `app.json` (name, slug, version, splash colour) and `package.json`.
- **Feature 1 — Real Search v1**: replaced the mocked book list with a debounced live search against Google Books, including loading/empty/error states and HTTPS cover URLs.
- **Feature 7 — Camera Book Lookup**: new `Scan` screen that uses `expo-camera`'s barcode scanner to look up books by ISBN, with full permission handling, no-result handling and a clear path back to search.
- **Feature 8 — Arabic-first polish**: Arabic copy throughout, RTL-aware text alignment, redesigned result cards, friendlier empty/error messaging.
- Added `typecheck`, `build` and `test` scripts so the existing CI workflow has something to run.

## Known limitations

- The Google Books API is anonymous; results may be rate-limited under heavy use. Add an API key via `key=` if needed.
- Barcode scanning requires a physical device camera (Expo Go on iOS/Android). The `web` build does not scan.
- No automated tests yet — `npm test` is currently a no-op so CI doesn't fail.

## Roadmap

- Book detail screen with full description and saved-list support.
- Offline cache of recent searches.
- Optional Google Books API key via Expo config.
