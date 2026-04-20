# Backend Connection Plan

Getting the web app from "placeholder-backed demo" to "real data end-to-end" against the `fitnesslink-platform` API running at `http://localhost:5100`.

Current state:
- Auth works (Firebase Web SDK → session cookie mint via `/api/session/login`).
- Every screen calls the real API first and falls back to placeholder data on error.
- Every fetch is blocked at the browser's CORS check because the platform doesn't emit `Access-Control-Allow-Origin`.
- Every generated response type is `Promise<unknown>` because the platform's Swashbuckle output omits response schemas.

---

## Phase 1 — Platform prereqs (blocks everything)

Lives in `fitnesslink-platform`.

### 1a. CORS
Register CORS middleware **before** `UseAuthentication` so preflight `OPTIONS` gets answered by CORS, not rejected by auth.

```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// pipeline:
app.UseCors();            // must come BEFORE UseAuthentication
app.UseAuthentication();
app.UseAuthorization();
```

Verify:
```sh
curl -i -H "Origin: http://localhost:3000" -X OPTIONS http://localhost:5100/core/api/v1/goals
# expected: 204 with Access-Control-Allow-Origin: http://localhost:3000
```

### 1b. Response type annotations
Every action that returns data needs `[ProducesResponseType(typeof(Dto), StatusCodes.Status200OK)]` (or equivalent) so Swashbuckle emits a response schema.

Today, a representative controller method:
```csharp
[HttpGet]
public async Task<IActionResult> Get() => Ok(result);
```

Needs to become:
```csharp
[HttpGet]
[ProducesResponseType(typeof(GoalDto), StatusCodes.Status200OK)]
public async Task<ActionResult<GoalDto>> Get() => Ok(result);
```

Priority order (most-consumed on the web first):
- `WorkoutsController`, `ProgramsController`, `MovementsController`
- `GoalsController`, `HabitsController`, `MilestonesController`
- `SessionsController`, `CalendarController`
- `FoodsController`, `FoodEntriesController`, `NutritionGoalsController`, `MealSlotsController`, `GroceryController`
- `WeightController`, `MeasurementsController`, `ProgressPhotosController`
- `UsersController`, `AchievementsController`, `ReportsController`
- `NotificationsController`, `NotificationPreferencesController`
- `MediaController`, `BillingController` group

### 1c. First-sign-in flow
Decide:
- **(a)** Platform auto-creates a user record on first valid Firebase token (recommended — web does nothing special).
- **(b)** Web calls `POST /core/api/v1/users` once after first sign-in with Firebase's `uid` + `email`.

If (b), add a one-shot bootstrap call in the web `FirebaseAuthSync` or `/api/session/login` handler.

### 1d. Forgot-password redirect
Firebase `sendPasswordResetEmail` uses the default project redirect. Set it to `https://<your-domain>/login` in Firebase Console → Authentication → Templates → Password reset.

---

## Phase 2 — Web regen + tighten (pure web change, unblocked by Phase 1b)

Once response types emit from the platform:

### 2a. Regenerate
```sh
npm run gen:api          # fetches live spec → openapi.snapshot.json + src/types/api.ts
npm run gen:api:clients  # rebuilds src/lib/api/{core,nutrition,…}/*.ts with real return types
npm run gen:api:check    # verify CI drift gate still passes
```

Commit both `openapi.snapshot.json` and `src/types/api.ts`.

### 2b. Swap local shape aliases → generated DTOs
Grep for the cast pattern and replace:
```sh
rg '\(await \w+\.\w+\(.*\)\) as ' src
```

For each hit:
- Remove the `as LocalType` cast.
- Import the generated schema alias (e.g., `components["schemas"]["FitnessLink.Module.Core.Application.Features.Goals.DTOs.GoalDto"]`).
- Delete the local shape once all consumers are migrated.

Files that will shrink or go away once DTOs are generated:
- `src/lib/catalog/types.ts` — `WorkoutSummary`, `WorkoutDetail`, `WorkoutPhase`, `WorkoutExercise`, `ProgramSummary`, `ProgramDetail`, `MovementSummary`, `MovementDetail`.
- `src/lib/nutrition/types.ts` — `FoodSummary`, `FoodEntry`, `NutritionGoal`, `MealSlot`, `GroceryItem`.
- `src/lib/progress/types.ts` — `WeightEntry`, `MeasurementEntry`, `ProgressPhoto`.
- `src/lib/profile/types.ts` — `Goal`, `Milestone`, `HabitDetail`, `Achievement`, `AppNotification`, `NotificationPrefs`, `Subscription`, `SessionSummary`, `SessionDetail`.
- `src/lib/calendar/types.ts` — `ScheduledWorkout`.

Keep the *placeholder generators* only — they're useful for dev / Storybook / tests.

### 2c. Thin placeholder fallback
Today every fetcher has:
```ts
try { ... return items.length > 0 ? items : PLACEHOLDER; } catch { return PLACEHOLDER; }
```

Once real data flows, swap to:
```ts
const res = await api.foo();
return res.items ?? [];
```

Let errors surface through the toast system. Keep placeholder fallback behind a dev-only flag (`process.env.NEXT_PUBLIC_USE_MOCKS === "1"`) for offline demos.

---

## Phase 3 — Per-domain smoke pass

Walk each surface with a live signed-in user. Track field-name drift — where my request bodies don't match the controller's `CreateXRequest` shape.

| Surface | Flows to verify |
|---|---|
| Home | Today's habits + goals load real data; habit toggle writes via `habits.logHabit`; scheduled workout fetched from `/calendar/me` |
| Catalog | Workouts / Programs / Exercises lists paginate + search server-side; detail loads; editor `createWorkout` / `updateWorkout` / `createProgram` / `updateProgram` persists |
| Session | `sessions.createSession` → `sessions.completeSession` end-to-end with RPE |
| Nutrition | Log food via `foodEntries.createFoodEntry`; update goal via `nutritionGoals.createNutritionGoal`; grocery toggle via `grocery.toggleGrocery` |
| Progress | Weight + measurements create/delete; photo upload (blocked on Phase 4b) |
| Profile | `users.updateUser`, `users.preferencesUser`, `notificationPreferences.updateNotificationPreferencesMe`, goal creation wizard → `goals.createGoal` |
| Reports | `reports.listReportsWorkouts` returns real aggregated data |

For each failure, either:
- Update the web's request body shape to match the controller DTO.
- Flag a platform ticket if the endpoint behaves differently than the web needs.

---

## Phase 4 — Known deferrals

### 4a. Custom food POST
`FoodsController` has no POST today. The custom-food form (`src/components/nutrition/CustomFoodForm.tsx`) has a `saveCustomFood` stub with a `TODO` marker. Swap to `foods.createFood(body)` once the endpoint exists.

### 4b. Media upload (avatars + progress photos)
Decide between:
- **Direct-to-blob**: platform returns a SAS upload URL; web PUTs the file there directly; web then POSTs the returned `mediaId` to the consuming resource.
- **API upload**: web POSTs the file to a `POST /core/api/v1/media` endpoint; platform forwards to Azure Blob.

Direct-to-blob is cheaper and faster (no Kestrel intermediate). The existing `MediaController` only has `POST /media/resolve` (read-side) and `GET /media/me/today`, so the upload endpoint is net-new.

Web files waiting on this:
- `src/app/profile/personal/page.tsx` — avatar picker has a file preview; upload path is TODO.
- `src/app/progress/photos/new/page.tsx` — angle tiles stage files locally; upload path is TODO.

### 4c. Toast-on-success pattern
Mutations invalidate React Query cache but don't surface success toasts (e.g., "Workout saved"). Low-risk add once Phase 2c is in.

### 4d. Offline / PWA
Explicitly out of scope per PLAN_MAIN_APP.md §1. The error-UX + offline banner from FIT-102 is the full story.

---

## Who does what

| Work | Owner |
|---|---|
| Phase 1a — CORS | Web agent can patch + open PR on `fitnesslink-platform` |
| Phase 1b — Response annotations | Platform dev (can be scripted / batched) |
| Phase 1c — First-sign-in | Platform dev (one-line decision) |
| Phase 1d — Forgot-password redirect | Product owner (Firebase console) |
| Phase 2 — Web regen + cleanup | Web agent, after Phase 1 lands |
| Phase 3 — Smoke pass | Web agent + platform dev paired |
| Phase 4 | Decide per item when prioritized |

---

## Definition of done

- `npm run gen:api` returns a spec that generates typed responses for every consumed endpoint.
- Every screen in the app shows real authenticated data from `fitnesslink-platform` with no placeholder fallback fired.
- No CORS errors in the browser console against `http://localhost:5100`.
- Signing up a brand-new user routes cleanly through `/signup → /plans → /payment → /onboarding → /home` with server-backed persistence.
- A user's Firebase UID resolves to a platform `User` record on first request, and subsequent writes (goal, habit log, workout create, food entry) persist to the DB and reload correctly on refresh.
