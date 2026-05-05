# DG II Arena · ACMS Tracker

Single-file React app, packaged as a Progressive Web App. No build step — plain HTML / CSS / JS plus React 18 via `esm.sh`.

## Files

| File | Purpose |
|---|---|
| `Arena_Gate_II_Tracker.html` | Main app (resource planner, costing, invoicing). |
| `Arena_Gate_II_Tracker_NoCosting.html` | Same app with all financial data hidden. |
| `manifest.json` | PWA manifest. |
| `sw.js` | Service worker — versioned cache, offline-capable. |
| `icon-180.png` / `icon-192.png` / `icon-512.png` | App icons. |

`Input/`, `*.py`, `check.mjs`, `ACMS_Project_Tracker.html` are local tooling and are excluded from deploy via `.gitignore`.

## Local preview

Open `Arena_Gate_II_Tracker.html` directly in any modern browser. The first load needs internet (React + Google Fonts pull from CDN); after that the service worker caches everything for offline use.

## Deploy to GitHub Pages

1. Create a new public repo (e.g. `arena-tracker`) on GitHub.

2. From this folder:

   ```sh
   git remote add origin https://github.com/<your-user>/arena-tracker.git
   git push -u origin main
   ```

3. On GitHub: **Settings → Pages → Source = "Deploy from a branch" → Branch: `main`, folder: `/ (root)` → Save.**

4. Wait ~1 minute. Your app is live at:

   ```
   https://<your-user>.github.io/arena-tracker/Arena_Gate_II_Tracker.html
   ```

> The PWA needs HTTPS — GitHub Pages provides this automatically.

## Add to iPhone home screen

1. Open the Pages URL in **Safari** on your iPhone.
2. Tap the **Share** button → **Add to Home Screen**.
3. Confirm the title (defaults to "Arena") → Add.

The icon appears on your home screen. Tap it — the app opens fullscreen, no browser chrome, with offline support.

> First-time install needs internet so the service worker can cache React + fonts. Subsequent launches work offline.

## Updating after a code change

Bump the cache version in `sw.js`:

```js
const CACHE_NAME = 'arena-gate-v2';   // was v1
```

Commit + push. iPhones will pick up the new bundle on next launch (the SW activates the new cache and drops the old).

If a clean reset is needed on a device, in Safari: **Settings → Safari → Advanced → Website Data → search "github.io" → Remove**, or just delete and re-add the home-screen icon.

## Data persistence

The app uses **IndexedDB** as the canonical store (key `acms_arena_gate_v2`), with localStorage as a one-time migration source for older saves. iOS Safari evicts localStorage after ~7 days of inactivity, but IndexedDB survives. Every save also mirrors to localStorage for best-effort fast reloads.

Export your data anytime via the **JSON** button in the view bar. Re-import is manual (paste back via DevTools `idbSet('acms_arena_gate_v2', '<json>')`).

## Browser compatibility

Tested working on iOS Safari 16+, desktop Chrome / Firefox / Safari. Drag-to-move on the Gantt uses mouse events; touch falls back to tap (which opens the modal — tap a bar to edit dates manually).
