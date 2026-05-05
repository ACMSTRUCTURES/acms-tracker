# ACMS Tracker · DG II Arena

Single-file React PWA. Microsoft 365 sign-in. Project data lives in OneDrive as JSON files. iOS / Android / Mac / PC compatible.

## Architecture

```
acmstructures.github.io/acms-tracker/   ← the engine (PWA, public)
                │
                │  Microsoft sign-in (MSAL.js)
                │  reads/writes JSON via Graph API
                ▼
OneDrive: ACMS Tracker /
├── Arena.json              ← Diriyah Gate II Arena
├── <future-project>.json
└── ...
```

- **The HTML is the engine** — one app, never changes per project.
- **Each project = a JSON file** in the shared OneDrive folder.
- **Editor** (`ali.jibawy@acmstructures.com`) sees full UI, can edit, saves write back to OneDrive.
- **Viewers** (anyone else with folder access) sees read-only UI; **all costing data is stripped server-side** before reaching their browser.

## Files in this repo

| File | Purpose |
|---|---|
| `Arena_Gate_II_Tracker.html` | The PWA. |
| `Arena_Gate_II_Tracker_NoCosting.html` | Costing-hidden static copy (legacy; the new viewer mode handles this dynamically). |
| `manifest.json` | PWA manifest. |
| `sw.js` | Service worker — cache-first for app shell, network-only for auth/Graph. |
| `icon-180.png` `icon-192.png` `icon-512.png` | App icons (cyan ▶ on dark). |
| `Arena.json` | Initial project data. **Upload to your OneDrive `ACMS Tracker` folder once.** |

`Input/`, `*.py`, `check.mjs`, `ACMS_Project_Tracker.html`, `CLAUDE*.md` are local tooling — excluded by `.gitignore`.

## First-time deploy

### 1. Push to GitHub Pages

```sh
git push -u origin main
```

Then on github.com → Settings → Pages → Source = `main` branch / root → Save. URL becomes `https://acmstructures.github.io/acms-tracker/`.

### 2. Upload `Arena.json` to OneDrive

Open your `ACMS Tracker` folder in OneDrive. Drag `Arena.json` into it. That's the only project file the app will see on day one. (To add more projects later, just drop more JSONs in the same folder.)

### 3. Test from your laptop

Open `https://acmstructures.github.io/acms-tracker/Arena_Gate_II_Tracker.html`. Sign in with `ali.jibawy@acmstructures.com`. The project picker shows `Arena.json`. Tap it → the app loads. You're in editor mode.

### 4. Add to phones / desktops

- **iPhone:** Safari → URL → Share → Add to Home Screen → tap icon → sign in.
- **Mac Safari:** File → Add to Dock.
- **Chrome/Edge (desktop):** install icon in address bar.
- **Android Chrome:** menu → Install app.

### 5. Invite the 9 viewers

- In OneDrive, share the `ACMS Tracker` folder with each person's `@acmstructures.com` email — **Can view** is sufficient.
- Send them the GitHub Pages URL.
- They install on their device, sign in with their own ACMS Microsoft account → see read-only Arena project, no costing tab, no salary fields.

## Adding a new project

**On PC:**

1. In OneDrive, copy `Arena.json` → rename to `NewProject.json` (or whatever).
2. Open the app on PC → reload. `NewProject.json` appears in the picker.
3. Open it → fill in monoliths/dates/hours via the existing UI → auto-saves back to OneDrive.

For a wildly different project type (FRP, lab testing, etc.), open the JSON in VS Code and edit the `schema.roles` and `schema.services` arrays — the engine reads these to know which roles to schedule.

## Updating the app code

Edit `Arena_Gate_II_Tracker.html` locally, bump the cache version in `sw.js` (`v2` → `v3`), commit, push. Devices pick up the new version on next launch.

## Local development (no auth)

Open `Arena_Gate_II_Tracker.html` directly via `file://` or a local web server. The auth gate is disabled on non-HTTPS origins; the app falls back to embedded data + IndexedDB. Useful for quick iteration without signing in.

## Tenant config (already baked in)

```
Tenant ID:   772308f0-707a-45b1-842f-e688a990b0ed
Client ID:   386f3712-51c9-4264-a5e1-6776882fdeea
Editor:      ali.jibawy@acmstructures.com
Folder:      <ACMSTRUCTURES OneDrive> /ACMS Tracker/
```

Change these in the `<script>` block at the top of `Arena_Gate_II_Tracker.html` if you ever migrate tenant or transfer editor rights.
