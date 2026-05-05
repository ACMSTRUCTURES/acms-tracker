# ACMS Tracker — Session continuation prompt

Paste this into a new Claude session to resume work without re-explaining context.

---

## What this is

A deployed Progressive Web App for ACMS Structures' internal project planning. Currently hosts the **Diriyah Gate II Arena** schedule. iOS / Android / desktop compatible.

**Live URL:** `https://acmstructures.github.io/acms-tracker/`
**Repo:** `ACMSTRUCTURES/acms-tracker` (public, GitHub Pages from `main` / root)
**Local dir:** `C:\Users\AliJibawy\OneDrive - ACMSTRUCTURES\ACMstructures\General Information\R&D\ACM-planning\`

---

## Tech stack

- **Single-file React PWA** — `index.html` (~330 KB). React 18 loaded from `esm.sh`, no build step.
- **Microsoft Entra auth** via MSAL.js (jsdelivr CDN).
- **Project data** lives in OneDrive → `ACMS Tracker/Arena.json`. Read/written via Microsoft Graph API.
- **Service worker** `sw.js` — versioned cache (`arena-gate-vN`), cache-first for app shell, network-only for `*.microsoftonline.com` / `graph.microsoft.com`.
- **PWA manifest** `manifest.json` — installable on iPhone (Safari), Android (Chrome), desktop.
- **IndexedDB** as canonical local cache (survives iOS Safari eviction).

---

## Tenant + auth config

Embedded in `index.html` under `window.ACMS_CONFIG`:

```
Tenant ID:        772308f0-707a-45b1-842f-e688a990b0ed
Client ID:        386f3712-51c9-4264-a5e1-6776882fdeea
Editor email:     ali.jibawy@acmstructures.com
Schedule editors: nour.jebbawi, mohamad.hallal, ibrahim.aldarsa, alaa.ghoul (all @acmstructures.com)
Redirect URI:     https://acmstructures.github.io/acms-tracker/
Folder share:     OneDrive → "ACMS Tracker" (shared with @acmstructures.com viewers)
```

Entra app permissions: `User.Read`, `Files.ReadWrite`, `Files.ReadWrite.All` (admin-consented).

---

## Three roles

| Role | Email match | What they see + can do |
|---|---|---|
| **EDITOR** | `ali.jibawy@acmstructures.com` | Everything. Edits resources, costing, schedule, all tabs. |
| **SCHEDULE EDITOR** | listed in `scheduleEditors[]` | Only Kanban / List / Gantt / Calendar tabs. Can edit task progress, status, dates. Cannot see costing / resources / panels. |
| **VIEWER** | everyone else with folder access | Same view as schedule editor. Edits silently fail (UI gated by `body[data-acms-role="viewer"]`). All cost data stripped from JSON server-side. |

Role detection at sign-in: `window.ACMS_IS_EDITOR`, `window.ACMS_IS_SCHEDULE_EDITOR`, `window.ACMS_USER`.

---

## File layout

**Root (deployed via GitHub Pages):**
```
index.html              ← main app (everything — React, MSAL, scheduler, UI)
manifest.json           ← PWA manifest
sw.js                   ← service worker (versioned cache)
icon-180/192/512.png    ← app icons
.nojekyll               ← disables Jekyll on GitHub Pages
README.md               ← deploy + invite docs
prompt.md               ← this file
```

**Local-only (gitignored):**
```
ACMS Tracker/           ← OneDrive shared folder (real project JSONs live here)
│   └── Arena.json
Input/                  ← Excel sources + extracted intermediate JSONs
_tools/                 ← local dev scripts (build_arena.py, splice.py, check.mjs, extract.js)
_archive/               ← legacy + reference (old templates, initial spec, Entra IDs backup)
```

---

## Currently invited team

OneDrive folder shared **Can view** with:
- Mohamad Hallal · Ibrahim Al Darsa · Nour Jebbawi · Alaa Ghoul
- `info@acmstructures.com` (test account, used to verify viewer mode)

Not yet invited: Batoul (external draftsman), Ali (BIM+PM), Resident Engineer.

---

## Pending work (in order of priority)

### 1. Add new projects from inside the app *(must-have)*

Currently to add a new project I copy `Arena.json` in OneDrive, rename, edit. Want:

- **`+ New Project` button** in the project picker (visible only to the editor).
- Click → prompt for project name + optional template ("Empty / Copy from current / Arena-shape with different monoliths").
- App writes a new `<Name>.json` to the OneDrive `ACMS Tracker` folder via Graph API (`createProject` already exists in `window.acmsGraph`).
- New project appears in everyone's picker on next refresh.
- The JSON should let projects vary on **scope** — different role lists, different services, different deliverables (use the existing `schema.roles` / `schema.services` / `schema.tabs` arrays). For non-Arena-shape projects (FRP, lab tests, etc.), the editor should be able to choose which roles + tabs apply.

### 2. Editor-only "Activity Dashboard" on the main page *(must-have)*

A dashboard showing **per-employee status** so I (Ali, editor) can see at a glance:

- Each employee + role
- Active (in progress) tasks they're working on, with monolith + service
- Tasks they completed today / this week
- Tasks blocked or overdue
- Hours logged vs hours assigned
- Any tasks they've manually moved (Gantt drag) since last review
- Quick filter: "show only employees with overdue tasks", "show only active work today"

**Visibility:** only when signed in as `ali.jibawy@acmstructures.com` (gate by `window.ACMS_IS_EDITOR`). Hide tab + strip data for everyone else. Could be a new top-level tab (e.g. between Gantt and List) or a separate "Dashboard" tab pinned to the front.

Source data: read from `state.tasks` (already computed) + `state.overrides` (which the schedule editors are writing). Aggregate by `task.owner` / `task.ownerId`.

### 3. Fix `NaN%` bug

In the feasibility banner role chips (top of page, e.g. `DM 1 · NaN%`). For viewers / schedule editors, role rate is stripped → utilization calc divides by undefined. Either omit the chips for non-editors or compute using hours capacity only.

### 4. Invite remaining team

Batoul (external), Ali (BIM+PM, his own access), Resident Engineer if real. Decide which need access.

### 5. Test schedule editor mode

With one of the engineers (Nour / Mohamad / Ibrahim / Alaa) — confirm cyan badge, restricted tabs, edit access works on Gantt drag + List inline progress.

---

## How to make code changes

1. Edit `index.html` (or `sw.js`, `manifest.json`) locally.
2. Bump `CACHE_NAME` in `sw.js` (`arena-gate-vN` → `vN+1`) so devices pick up the change.
3. `git add` + commit + `git push`.
4. GitHub Pages rebuilds in ~30–60 sec.
5. Devices update on next app launch (SW activates new cache, drops old).

---

## How to continue in a new session

Tell Claude:

> Read `index.html`, `sw.js`, `manifest.json`, `Arena.json`, and this `prompt.md` in the local directory. I want to work on item N from the pending list.

Where N is one of:
1. Schedule-editor onboarding (pick the engineer emails + push)
2. NaN% bug fix in feasibility banner
3. "+ New Project" button

Or describe a new request directly — Claude has full context from the files.
