# FitnessLink Web — Main App Plan

Companion to [PLAN.md](PLAN.md), which covers Phases 1–5 (auth, plans, payment, onboarding). This plan covers **Phases 6–15**: porting the main post-login experience from the iOS and Android apps to a responsive web app that scales from mobile (parity with native apps) up to desktop (denser, multi-pane layouts).

---

## 1. Goals & Non-Goals

**Goals**
- Port all post-login features from [iOS-fitnesslink-fit](../iOS-fitnesslink-fit) and [droid-fitnesslink-fit](../droid-fitnesslink-fit) to web
- On mobile (<640px), match the native apps screen-for-screen so the web app is a viable alternative to installing the native app
- On larger viewports, take advantage of the extra real estate (sidebars, side-by-side detail, data density, tables) rather than just centering a 428px column
- Hook up the real API at [fitnesslink-platform](../fitnesslink-platform) — runs locally on `http://localhost:5100` via `docker-compose up`, exposes Swagger/OpenAPI, and already has controllers for every feature area we need to port:
  - **Core:** Auth, Users, Workouts, Programs, Movements, Sessions, Goals, Habits, Milestones, Achievements, BodyTracking, Calendar, Reports, Content, Media, Personalization, Classification, AI, Sync
  - **Nutrition:** Foods, FoodEntries, Barcode, MealSlots, Grocery, NutritionGoals
  - **Notifications:** Notifications, NotificationPreferences, DeviceTokens
  - **Billing:** Plans, Subscriptions, Customers, Webhooks

**Non-Goals**
- Native app feature flag parity in both directions — we port, we don't design new features here
- **Offline support / PWA / installability** — this is a web app; it assumes connectivity. No service worker, no IndexedDB cache, no offline write queue, no "Add to Home Screen" flow. Users who need offline use the native apps
- Admin / trainer / coach dashboards — separate product surface

---

## 2. Scope — Feature Inventory

Grouped by the 5 main tabs in the mobile apps. Each cell is a distinct screen or modal.

| Section | Screens |
|---|---|
| **Home** | Dashboard, date scrubber, goal progress cards, today's habits, today's workout, daily summary |
| **Catalog** | Catalog hub, Workouts list, Workout detail, Workout editor (phases/exercises/groups/rest), Exercise browser, Movement preview, Programs list, Program detail, Program editor (weeks/days), Day slot editor, Workout picker |
| **Sessions** | Interactive session (rest timer, exercise preview, controls, progress bar, completed overlay with RPE), Playlist session (video-driven), Workout completed summary |
| **Calendar** | Month view, day cell indicators, scheduled workouts list, add-workout sheet, delete scheduled workout |
| **Nutrition** | Nutrition home, Calorie tracking dashboard (ring + macro bars + meal sections), Quick add, Barcode scanner, Scanned food review, Food entry detail, Custom food form, Recent foods, Food item detail, Meal type detail, Nutrition report, Metric detail, Summary, Goal settings, Goal notifications, Meal plan (weekly grid), Meal slot detail, Grocery list |
| **Progress** | Weight log (chart + entries), Measurements log (multi-body-part), Progress photos (capture/upload, gallery, compare), Photo entry detail |
| **Goals & Habits** | Goals list, Goal detail (identity + milestones + linked habits), Goal creation wizard, Habit detail (streak + heatmap), Achievements |
| **Profile** | Profile overview, Personal info, Preferences (units, language, theme), Notifications center, Notification settings, Workout report (by workout, by movement, by session), Nutrition report, Billing, Personalization profile, Developer settings, Logout |

Total: ~55 distinct screens post-login.

---

## 2.5 Design Direction

There's no Figma for the consumer web app yet. Two reference points:

- **Mobile**: mirror the iOS and Android app screens screen-for-screen. The SVGs in [public/](public/) already cover auth/onboarding; the native app code is the reference for the main-app screens.
- **Desktop**: take branding and layout cues from the [fitness-management](../fitness-management) Angular admin app. Reference PNGs live in [/Users/quincywilliams/FitnessLink-Roadmap/](../../FitnessLink-Roadmap/) (`Exercises.png`, `Exercises - Side Panel.png`). Where the two apps diverge (admin is B2B, ours is consumer), use creativity — the goal is brand consistency, not admin-app replication.

**Concrete desktop language, confirmed from the reference PNGs:**

| Element | Treatment |
|---|---|
| Sidebar | ~220–240px wide, white background, sits against the #F0F4F5 app surface; kettlebell + "FITNESSLINK" lockup in header; icon + label nav items; collapsible section groups (e.g. "My Fitness" expands to Workouts / Programs / Sessions); active state is a light-green wash + green icon + bolder text |
| Top bar | Personalized greeting ("Hello, {firstName}") with subtitle ("Have a nice day" / "Day 3 of your program" / dynamic), notification bell on the right, user avatar + name + role with chevron for menu |
| Content header | Section title in primary green (#23AF8D), subtitle in neutral gray, action row beneath (search input with magnifier icon, sort dropdown, saved filters), primary CTA as a green pill button with trailing icon on the far right |
| Cards & tables | White surfaces, subtle rounded corners (8–12px), low-contrast borders; table headers in light gray, primary-identifier column rendered as green link text, avatar/thumbnail leading the row, status pills at the end, overflow menu for row actions |
| Master-detail | Right-side slide-in panel (~340–400px) with close affordance; hero image on top, metadata, long-form description, tag chips in green fills, stats stack at bottom. Exactly the pattern called out in §3 — the admin app validates it |
| Chips / tags | Solid green fill (#23AF8D) with white text; rounded to full height; used for tags, interests, category labels. Darker pill for status (Draft/Pending) with gray/black fill |
| Empty states | Line-art illustration centered, single-line prompt, primary-green CTA below |

**Where creativity fills gaps** (features the admin app doesn't have, so no reference):
- Interactive session screen at desktop width — center stage video, left rail = workout outline, right rail = timer + controls + next-up preview (feel: a focused "now playing" view, brand palette preserved but darker/immersive)
- Nutrition calorie ring + macro bars — use the green primary for the progress arc; macros in the accent palette (orange/purple/blue) to differentiate protein/carbs/fat visually, matching the iOS asset catalog
- Habit heatmap — light-gray to primary-green gradient, GitHub-style cell grid, tooltip on hover
- Progress photo compare — side-by-side with a shared timeline scrubber; draggable divider for overlay mode

**Design tokens** (locked by the reference)

```
--primary:        #23AF8D
--primary-hover:  #1D9478
--primary-soft:   #E6F6F1  (active-nav wash, chip backgrounds on light)
--background:     #F0F4F5
--surface:        #FFFFFF
--text-primary:   #1D1B20
--text-secondary: #6B7280
--text-link:      #23AF8D
--border:         #E5E7EB
--status-draft:   #2F2F2F  (dark pill fill)
--accent-orange:  #F69833
--accent-purple:  #8B5CF6
--accent-blue:    #3B82F6
```

## 3. Responsive & Adaptive Strategy

This is the core of the user ask. Three distinct layout modes, not a single resized column.

### Breakpoints (Tailwind defaults)

| Name | Width | Layout mode |
|---|---|---|
| `base` | <640px | **Mobile parity** — single column, bottom tab bar, full-bleed, matches native apps |
| `sm` | 640–767 | **Mobile large** — same single-column layout with wider max-width, retains bottom tab bar |
| `md` | 768–1023 | **Tablet** — side nav rail (icons only, 80px), content area with two-pane master-detail where useful |
| `lg` | 1024–1279 | **Desktop** — full labeled left sidebar (240px), main content, optional right rail for context (session controls, summaries) |
| `xl` | ≥1280 | **Desktop wide** — same as `lg` with denser layouts (tables replace card lists, more columns in grids, charts side-by-side) |

### Adaptive patterns per screen archetype

| Archetype | Mobile | Tablet | Desktop |
|---|---|---|---|
| **Navigation** | Bottom tab bar (5 icons) | Icon rail on left | Labeled sidebar; user menu top-right |
| **Dashboard (Home)** | Stacked cards, horizontal scroll rows | 2-column grid of cards | 3-column dashboard with pinnable widgets, right rail for today's actions |
| **List → Detail** (Workouts, Programs, Food entries) | Push navigation (list, then detail) | Master-detail (list 40%, detail 60%) | Master-detail with filters sidebar (filters 20%, list 30%, detail 50%) |
| **Editor forms** (Workout editor, Custom food) | Full-screen form, stacked sections | Two-column: preview + form | Form with live preview pane |
| **Interactive session** | Full-screen immersive (matches native) | Full-screen with side panel for next exercise | Center stage video, left rail = workout outline, right rail = controls + timer; wake-lock enabled |
| **Calendar** | Single-month, tap day → sheet | Month + scheduled-list side panel | Month + week view + scheduled list (3-pane) |
| **Nutrition dashboard** | Ring + stacked macro bars + meal sections | Ring centered, macro bars in row, meals in 2-col | Overview top, meals as table with inline edit, analytics chart in right rail |
| **Reports** | Summary cards, swipeable tabs | Tabs + stacked charts | Tabs + charts grid; filters in left rail; export button top-right |
| **Modals / sheets** | Bottom sheet (slide up) | Centered dialog | Centered dialog or inline side panel |

### Implementation rule of thumb

- Design the mobile layout first (parity target).
- Wrap the primary content in an `AppShell` that swaps between `MobileShell` (bottom tabs) and `DesktopShell` (sidebar) at `md`.
- For each feature, expose a `useLayoutMode()` hook (`mobile | tablet | desktop`) so components can render different sub-layouts — not just different CSS. Cards on mobile often become table rows on desktop; that's structure, not styling.
- Avoid "just center the mobile column on desktop" — that's the failure mode we're explicitly avoiding.

---

## 4. Architecture Additions

The current app has: Next.js 16 App Router, Tailwind v4, React Context for auth, mock API routes. For the main app we need more.

### State & data fetching
- **TanStack Query (React Query v5)** for all server state — workouts, sessions, nutrition, progress. Handles caching, optimistic updates, and pagination (needed for history/reports).
- **Jotai** for client-side state — current session, selected date, layout mode, UI toggles, auth atoms. Migrate the existing `auth-context.tsx` to an atom-based auth store in Phase 6.
- **Zod** for response schema validation at the API boundary.

### API integration
- Target the real .NET API at [fitnesslink-platform](../fitnesslink-platform), served on `http://localhost:5100` during development (`docker-compose up` in that repo).
- Set `NEXT_PUBLIC_API_BASE_URL` per environment; default to `http://localhost:5100` for local.
- **Generate TypeScript types from the API's OpenAPI/Swagger spec.** Add `openapi-typescript` to the toolchain and a `pnpm gen:api` script that pulls `http://localhost:5100/swagger/v1/swagger.json` and writes to `src/types/api.ts`. Run it in CI so the types can't drift silently.
- Organize `src/lib/api/` by controller group matching the platform structure: `core/`, `nutrition/`, `notifications/`, `billing/`. Each module exports typed fetch functions and TanStack Query key factories.
- Keep the existing mock route handlers (`src/app/api/**`) as a local fallback gated by `NEXT_PUBLIC_USE_MOCKS=1` — useful when the API container isn't running. Phase out mocks per-controller as the real endpoints are integrated.
- Reference: `FitnessLink.API.postman.json` in the platform repo documents request/response shapes.
- The platform's `SyncController` is ignored by the web app — it's there for the native clients.

### Auth — Firebase Web SDK
**Confirmed:** use the **Firebase Web SDK** (`firebase` package, modular v9+ API) against the same Firebase project as the iOS and Android apps. The platform API's `FirebaseAuthMiddleware` validates the resulting ID tokens, so the contract is already aligned.

- Install `firebase` (client-side) and `firebase-admin` (server-side, only used inside Next.js route handlers for session-cookie verification).
- Initialize the client app in `src/lib/firebase/client.ts` using `initializeApp` — public config only, read from `NEXT_PUBLIC_FIREBASE_*` env vars.
- Providers to enable: email/password, Google, Apple — match what the native apps offer.
- On sign-in, call `user.getIdToken()` and attach `Authorization: Bearer <idToken>` to every API request via the TanStack Query fetcher. The Firebase SDK auto-refreshes tokens in the background; subscribe to `onIdTokenChanged` so the bearer token in our Jotai `idTokenAtom` stays current.
- **SSR / route protection:** on sign-in, POST the fresh ID token to a Next.js route handler that creates a Firebase **session cookie** (via `firebase-admin/auth`'s `createSessionCookie`) and sets it as httpOnly + secure + sameSite=lax. `src/middleware.ts` reads that cookie on every navigation and redirects unauthenticated users to `/login`. On sign-out, clear the cookie.
- **State:** the existing `src/lib/auth-context.tsx` is scaffolding — replace it in Phase 6 with Jotai atoms (`userAtom`, `idTokenAtom`, `authStatusAtom`) that subscribe to `onAuthStateChanged` / `onIdTokenChanged` once in a provider mounted at the root.
- **Mocks:** remove the placeholder `/api/auth/login`, `/api/auth/signup`, `/api/auth/forgot-password` routes — Firebase owns these flows. Keep the mock flag only for non-auth endpoints.

### Media
- **Video delivery:** workout videos live in **Azure Blob Storage**; the platform's `MediaController` (`POST /core/api/v1/media/resolve`) returns SAS-signed URLs. The web client treats the URL as opaque — it never talks to Azure directly.
- **Player:** plain HTML5 `<video>` with the resolved URL for MP4 (the expected format from Blob Storage). Wrap in a `VideoPlayer` component so the implementation can swap later without touching screens.
- **HLS:** hold on `HLS.js` — only adopt if `MediaController` starts returning `.m3u8` manifests. Safari handles HLS natively; other browsers would then need the polyfill. Budget it in Phase 10 only if/when needed.
- **Wake Lock API** during interactive sessions to keep the screen on.
- **Web Vibration API** for set-complete haptics on mobile browsers (graceful no-op where unsupported).

---

## 5. Native Features → Web Equivalents

| Native feature | Web approach | Notes |
|---|---|---|
| Barcode scanner (AVCapture / ML Kit) | `BarcodeDetector` API where supported + [ZXing-js/browser](https://github.com/zxing-js/browser) fallback | Desktop has no camera — always show manual search as primary path on desktop |
| Camera (progress photos, profile pic) | `<input type="file" accept="image/*" capture="environment">` for mobile, file picker for desktop; optional `getUserMedia` for live capture | Mobile Safari handles `capture` well; desktop falls back to file upload |
| Video playback (workout demos) | HTML5 `<video>` with signed URL from `MediaController`; add HLS.js only if the API starts returning `.m3u8` | Videos are stored in Azure Blob Storage; the backend API resolves SAS URLs — the web client never talks to Azure directly |
| Local SQLite | Not needed — the web app is online-only; all reads/writes hit the API directly | Server is source of truth |
| Push notifications | Out of scope — in-app notifications only, delivered via polling or SSE against the `NotificationsController` | Native apps handle true push |
| Haptics (rest complete) | `navigator.vibrate()` — mobile only | Silent no-op on desktop |
| Full-screen video | Fullscreen API | |
| Timer precision during session | `performance.now()` + `requestAnimationFrame`; also `setInterval` for simple countdown | Keep Wake Lock engaged to prevent throttling |
| Background audio cues | Preloaded `<audio>` elements triggered on state changes | |
| Health Kit / Google Fit | Not in Android code; out of scope. Manual entry only on web for now | |
| Torch toggle | Remove from web; API exists but very patchy | Show "good lighting helps" tip instead |

---

## 6. Design System Expansion

The current design system covers form-era components (Button, Input, Logo, ProgressBar, AuthLayout). The main app needs substantially more.

**New primitives to add to `src/components/ui/`**
- `Card`, `CardHeader`, `CardContent` (denser variants for desktop)
- `Tabs`, `Tab` (both pill-tab and underline variants — mobile and desktop feel)
- `Sheet` (bottom sheet on mobile, centered dialog on desktop — same component, different behavior via layout mode)
- `Select`, `Combobox`, `Popover`, `DatePicker`, `Slider`, `Stepper` (numeric +/-)
- `Avatar`, `Badge`, `Chip`, `StatCard`, `EmptyState`, `Skeleton`
- `Table` with sort, filter, row-click (desktop), auto-collapses to card list on mobile
- `Chart` wrappers (line, bar, area, radial/ring) — **Recharts** for all standard charts. Wrap in our own `<LineChart>`, `<BarChart>`, `<RingChart>` components so chart styling is locked to the design tokens in §2.5 and we can swap libraries later without page-level changes
- `Heatmap` (habit 365-day tracker) — custom SVG grid or `react-activity-calendar`; decide per-implementation. Not Recharts
- `RestTimerRing`, `ProgressRing` — custom SVG with `strokeDasharray` animation synced to `requestAnimationFrame`; precise control beats any chart library here
- `VideoPlayer`, `ImageUploader`, `BarcodeScanner`
- `WorkoutTimer` (elapsed), `RestTimer` (countdown with ring)
- `Heatmap` (habit 365-day tracker)
- `Calendar` (month, week, day views)

**Layout components in `src/components/layout/`**
- `AppShell` — routes between mobile and desktop shells
- `MobileShell` — header + content + bottom tab bar
- `DesktopShell` — sidebar + header + content + optional right rail
- `TabBar` (mobile), `Sidebar` (desktop)
- `PageHeader` with actions slot
- `MasterDetail` — two-pane layout that collapses to push-navigation on mobile

**Design tokens to add** (extend [globals.css](src/app/globals.css))
- Accent colors from iOS asset catalog: Orange (#F69833), Purple (#8B5CF6), Blue (#3B82F6) — used for different feature sections
- Semantic tokens: `success`, `warning`, `danger`, `info`
- Chart palette (8 distinct colors, AA contrast on both light and dark)
- Elevation tokens (shadow-sm, shadow-md, shadow-lg)
- Spacing scale already adequate via Tailwind

---

## 7. Phased Delivery Plan

Each phase is independently shippable — incomplete sections simply aren't added to the nav yet. No feature-flag system; work ships by being merged and linked in.

### Phase 6 — Foundation (shell, nav, design system, real API)
- AppShell + MobileShell + DesktopShell + adaptive nav
- Expanded design system primitives (Card, Tabs, Sheet, Table, Chart wrappers, etc.)
- **Jotai** set up with auth atoms replacing `auth-context.tsx`
- **TanStack Query** provider + devtools
- **Firebase Web SDK** integration (email/password, Google, Apple providers); Firebase Admin SDK in a Next.js route handler for session-cookie verification
- **OpenAPI type generation** pipeline: add `openapi-typescript`, `pnpm gen:api` script, wire into CI
- `src/lib/api/` client skeleton structured by platform controller groups (core, nutrition, notifications, billing); automatic bearer-token attachment
- Protected routes via `src/middleware.ts` reading the session cookie
- Layout mode hook, breakpoint-aware behavior
- Keep existing mock routes behind `NEXT_PUBLIC_USE_MOCKS` as a dev fallback

### Phase 7 — Home / Dashboard
- Date scrubber, goal progress cards, today's habits, today's workout, daily summary
- Desktop: 3-column dashboard with widgets

### Phase 8 — Catalog: Workouts & Programs (read)
- Workouts list + detail, Programs list + detail
- Exercise browser + movement preview
- Desktop master-detail

### Phase 9 — Catalog: Editors (write)
- Workout editor (phases, groups, movements, rest)
- Program editor (weeks, day slots, workout picker)
- Custom food form
- Desktop: live preview pane

### Phase 10 — Interactive Session
- Rest timer, exercise preview, controls, progress bar, completion + RPE
- Wake Lock, haptics, audio cues
- Playlist session (video-based)
- Desktop: left outline + center stage + right controls

### Phase 11 — Calendar
- Month view, day sheets, scheduled workouts list
- Desktop: add week view and 3-pane layout

### Phase 12 — Nutrition
- Nutrition dashboard (ring + macros + meal sections)
- Food logging: quick add, recent, custom food, food entry detail
- Barcode scanner (ZXing)
- Meal plan weekly grid, grocery list
- Nutrition goal settings
- Nutrition reports

### Phase 13 — Progress
- Weight log with chart
- Measurements log
- Progress photos (upload, gallery, compare)

### Phase 14 — Goals, Habits, Profile, Reports
- Goals list + detail + creation wizard
- Habits (detail, heatmap, achievements)
- Profile overview, personal info, preferences, billing
- Notifications center + settings
- Workout and nutrition reports with time-range filters

### Phase 15 — Polish
- Accessibility pass (keyboard nav, focus management, screen reader labels, color contrast AA)
- Performance pass (route-level code splitting, image optimization, bundle audit, TanStack Query cache tuning)
- Cross-browser testing (Safari iOS, Chrome Android, Chrome / Firefox / Safari / Edge desktop)
- End-to-end tests (Playwright) for the top 10 critical flows
- Error boundaries, connection-lost UX (toast + retry), loading skeletons everywhere
- Empty-state illustrations for every list screen

---

## 8. Decisions

All resolved before Phase 6 kickoff. Kept here for posterity and to anchor future debates.

1. ~~**Real API vs. keep mocks**~~ — **Resolved.** Target [fitnesslink-platform](../fitnesslink-platform) at `http://localhost:5100`; generate TS types from Swagger; keep mocks behind `NEXT_PUBLIC_USE_MOCKS` as a dev fallback. Phase out per-controller.
2. ~~**Design source of truth**~~ — **Resolved.** No Figma yet. Mobile = mirror iOS/Android screens. Desktop = take branding cues from the [fitness-management](../fitness-management) admin app (see reference PNGs in `/Users/quincywilliams/FitnessLink-Roadmap/`) and fill creative gaps for consumer-only features (session, heatmap, photo compare, etc.) while preserving the palette and layout idioms in §2.5.
3. ~~**Charting library**~~ — **Resolved.** Recharts for line / bar / area / radial via locally-wrapped components; custom SVG for the habit heatmap (or `react-activity-calendar`) and the animated rest-timer ring.
4. ~~**Offline scope**~~ — **Resolved.** None. Web app is online-only; users who need offline use the native apps.
5. ~~**Trainer/coach surface**~~ — **Resolved.** No. The web app is a web version of the mobile apps — consumer only. Trainer / coach / admin tooling lives in the separate [fitness-management](../fitness-management) Angular app and is out of scope here.
6. ~~**Auth provider**~~ — **Resolved.** Firebase Authentication — matches the platform's `FirebaseAuthMiddleware`. Web SDK on the client, Admin SDK in Next.js route handlers for session-cookie verification.
7. ~~**Video delivery**~~ — **Resolved.** Videos are in Azure Blob Storage, delivered via `POST /core/api/v1/media/resolve` which returns SAS-signed URLs. Web client uses plain `<video src={url}>`; no HLS.js unless/until the API starts returning `.m3u8`.
8. ~~**Feature flags**~~ — **Resolved.** None. Incomplete features simply aren't linked from the nav; merged-to-main is the gate.

---

## 9. Rough Size

- **Phases 6–15 combined**: roughly 16–22 engineer-weeks for a single senior FE engineer, including design review cycles and API integration debugging. Parallelizable to ~10–12 weeks with two engineers if Phase 6 lands first.
- Single biggest risk: Phase 10 (Interactive Session) — device wake-lock, timer precision under tab throttling, video loading states, and the UX of a hands-free workout on desktop all need dedicated testing time.

---

## 10. Success Criteria

- On mobile Safari / Chrome, every post-login screen renders at 375px width with feature parity to the native apps.
- On desktop (1440px), no screen is just a centered 428px mobile column — every screen uses the available width meaningfully.
- Core Web Vitals green on the dashboard, catalog list, and session screens.
- A user can sign up → complete onboarding → schedule a workout → run an interactive session → log nutrition → view their weekly report, on both a phone and a desktop, without needing the native app.
