# FitnessLink Web - Implementation Plan

## Overview
Next.js web application (App Router) for FitnessLink, built mobile-first and responsive up to large screens. This phase covers the **Authentication flow** and **Personalization questionnaire**.

---

## Design System (extracted from SVGs)

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#23AF8D` | Buttons, progress bars, splash bg, accents |
| `background` | `#F0F4F5` | Page backgrounds (auth forms, personalization) |
| `surface` | `#FFFFFF` | Cards, inputs |
| `text-primary` | `#000000` / `#1D1B20` | Headings, body |
| `text-on-primary` | `#FFFFFF` | Text on green buttons/surfaces |
| `border` | `#8E918F` | Input borders, subtle outlines (50% opacity) |

### Typography
- Brand wordmark: "FITNESS LINK" (bold + light weight split)
- All text is vectorized in the SVGs, so exact fonts TBD (likely a clean sans-serif like Inter or Poppins)

### Components (from SVG layouts)
- **Pill Button**: full-width, height 56px, border-radius 28px, green fill, white text (e.g., "Continue", "Login", "Sign Up")
- **Text Input**: full-width, rounded corners, border #8E918F
- **Progress Bar**: 4 equal segments, green fill for completed steps
- **Back Arrow**: top-left chevron navigation
- **Status Bar**: system clock/icons at top (handled by browser on web)

### Spacing (from 428px mobile viewport)
- Horizontal padding: 33px from edges (scales to ~8% of viewport)
- Button bottom margin: ~56px from bottom of viewport
- Content starts ~140px from top (below brand + progress bar)

---

## Responsive Breakpoints

Mobile-first approach. The SVGs are designed at **428x908** (roughly iPhone 14 Pro Max).

| Breakpoint | Width | Layout Strategy |
|------------|-------|----------------|
| **Mobile (default)** | < 640px | Single column, full-width forms, matches SVG designs exactly |
| **Tablet (sm/md)** | 640px - 1024px | Center content in max-width container (480px), add horizontal padding |
| **Desktop (lg)** | 1024px - 1280px | Split layout: left side = branding/hero image, right side = auth form (max 480px) |
| **Large (xl)** | > 1280px | Same split layout, constrained to max-width 1440px, centered |

### Scaling Strategy
- **Mobile**: Full-bleed forms, bottom-anchored CTA buttons, stacked layout
- **Tablet**: Forms centered in a card with subtle shadow, more breathing room
- **Desktop+**: Two-column layout where the left column shows the background hero image / branding (from the Home.svg background) and the right column contains the form. This is a common pattern for auth flows (think Spotify, Notion login pages)

---

## Screen Inventory & Routes

| # | Screen | Route | SVG Reference |
|---|--------|-------|---------------|
| 1 | Splash | `/` (loading state) | `splash.svg` |
| 2 | Welcome/Home | `/` | `Home.svg` |
| 3 | Login | `/login` | `Login.svg`, `Login_filled.svg` |
| 4 | Sign Up | `/signup` | `Signup.svg`, `Signup_filled.svg` |
| 5 | Forgot Password | `/forgot-password` | `Forgot Password.svg`, `Forgot Password_Filler.svg` |
| 6 | Plans | `/plans` | `Pland.svg` |
| 7 | Payment | `/payment` | `Payment.svg` |
| 8 | Personalization | `/onboarding` | `Personalization 1-4.svg` |

---

## User Flow

```
Splash (auto, 2s)
  |
  v
Welcome/Home
  |--- "Login" --> Login --> (success) --> Home/Dashboard
  |                  |--- "Forgot Password" --> Forgot Password --> (email sent) --> Login
  |
  |--- "Sign Up" --> Sign Up --> Plans --> Payment --> Personalization (4 steps) --> Home/Dashboard
```

---

## Project Structure

```
app-fitnesslink-web/
  src/
    app/
      layout.tsx                  # Root layout, font loading, providers
      page.tsx                    # Welcome/Home (with splash state)
      login/
        page.tsx
      signup/
        page.tsx
      forgot-password/
        page.tsx
      plans/
        page.tsx
      payment/
        page.tsx
      onboarding/
        page.tsx                  # Dynamic questionnaire (single page, 4 steps)
      api/
        auth/
          login/route.ts          # POST - mock login
          signup/route.ts         # POST - mock signup
          forgot-password/route.ts # POST - mock password reset
        plans/
          route.ts                # GET - mock plans list
        payment/
          route.ts                # POST - mock payment processing
        onboarding/
          questions/route.ts      # GET - mock personalization questions
          answers/route.ts        # POST - mock submit answers
    components/
      ui/
        Button.tsx                # Pill button component
        Input.tsx                 # Text input component
        ProgressBar.tsx           # Step progress indicator
        Logo.tsx                  # FitnessLink brand logo/wordmark
      layout/
        AuthLayout.tsx            # Shared layout for auth screens (responsive split)
        BackButton.tsx            # Back navigation arrow
    lib/
      api.ts                      # API client helpers (fetch wrappers)
      auth-context.tsx            # Auth state context provider
      validators.ts               # Form validation helpers
    types/
      index.ts                    # Shared TypeScript types
    styles/
      globals.css                 # Global styles, CSS variables, Tailwind config
```

---

## Mock API Specification

### `POST /api/auth/signup`
**Request:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string"
}
```
**Response (201):**
```json
{
  "user": { "id": "uuid", "firstName": "string", "lastName": "string", "email": "string" },
  "token": "mock-jwt-token"
}
```

### `POST /api/auth/login`
**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```
**Response (200):**
```json
{
  "user": { "id": "uuid", "firstName": "string", "lastName": "string", "email": "string" },
  "token": "mock-jwt-token"
}
```

### `POST /api/auth/forgot-password`
**Request:**
```json
{ "email": "string" }
```
**Response (200):**
```json
{ "message": "Password reset email sent" }
```

### `GET /api/plans`
**Response (200):**
```json
{
  "plans": [
    {
      "id": "monthly",
      "name": "Monthly",
      "price": 14.99,
      "interval": "month",
      "description": "Billed monthly, cancel anytime",
      "features": ["Personalized workouts", "Progress tracking", "Nutrition guidance"]
    },
    {
      "id": "annual",
      "name": "Annual",
      "price": 119.99,
      "interval": "year",
      "savings": "Save 33%",
      "description": "Billed annually",
      "features": ["Everything in Monthly", "Priority support", "Advanced analytics"]
    }
  ]
}
```

### `POST /api/payment`
**Request:**
```json
{
  "planId": "monthly | annual",
  "paymentMethod": {
    "cardNumber": "string",
    "expiry": "string",
    "cvv": "string",
    "name": "string"
  }
}
```
**Response (200):**
```json
{
  "subscription": { "id": "uuid", "planId": "string", "status": "active", "startDate": "ISO date" }
}
```

### `GET /api/onboarding/questions`
**Response (200):**
```json
{
  "questions": [
    {
      "id": 1,
      "question": "What is your fitness goal?",
      "type": "single-select",
      "options": [
        { "id": "lose-weight", "label": "Lose Weight" },
        { "id": "build-muscle", "label": "Build Muscle" },
        { "id": "improve-endurance", "label": "Improve Endurance" },
        { "id": "stay-active", "label": "Stay Active" }
      ]
    },
    {
      "id": 2,
      "question": "What is your experience level?",
      "type": "single-select",
      "options": [
        { "id": "beginner", "label": "Beginner" },
        { "id": "intermediate", "label": "Intermediate" },
        { "id": "advanced", "label": "Advanced" }
      ]
    },
    {
      "id": 3,
      "question": "How many days per week can you work out?",
      "type": "single-select",
      "options": [
        { "id": "1-2", "label": "1-2 days" },
        { "id": "3-4", "label": "3-4 days" },
        { "id": "5-6", "label": "5-6 days" },
        { "id": "7", "label": "Every day" }
      ]
    },
    {
      "id": 4,
      "question": "Do you have access to a gym?",
      "type": "single-select",
      "options": [
        { "id": "full-gym", "label": "Full Gym" },
        { "id": "home-gym", "label": "Home Gym" },
        { "id": "no-equipment", "label": "No Equipment" }
      ]
    }
  ]
}
```

### `POST /api/onboarding/answers`
**Request:**
```json
{
  "answers": [
    { "questionId": 1, "selectedOptionId": "build-muscle" },
    { "questionId": 2, "selectedOptionId": "intermediate" },
    { "questionId": 3, "selectedOptionId": "3-4" },
    { "questionId": 4, "selectedOptionId": "full-gym" }
  ]
}
```
**Response (200):**
```json
{ "message": "Personalization complete", "profileComplete": true }
```

---

## Implementation Phases

### Phase 1: Project Setup
- [ ] Initialize Next.js 15 with App Router, TypeScript, Tailwind CSS
- [ ] Configure design tokens as CSS variables / Tailwind theme
- [ ] Create shared UI components (Button, Input, ProgressBar, Logo)
- [ ] Create AuthLayout (responsive: mobile full-bleed, desktop split-view)
- [ ] Set up auth context provider with mock state

### Phase 2: Authentication Screens
- [ ] Splash / Welcome screen with hero background + CTA buttons
- [ ] Login page with email/password form + validation
- [ ] Sign Up page with name/email/password form + validation
- [ ] Forgot Password page with email form + success state
- [ ] Wire up mock API routes for auth endpoints

### Phase 3: Plans & Payment
- [ ] Plans selection page (monthly/annual toggle or cards)
- [ ] Payment page with card form
- [ ] Wire up mock API routes for plans and payment

### Phase 4: Personalization Onboarding
- [ ] Single-page questionnaire with dynamic question rendering
- [ ] Progress bar (4 segments matching SVG design)
- [ ] Option selection UI (selectable cards/buttons)
- [ ] "Continue" button advances to next question
- [ ] Back button goes to previous question
- [ ] Submit all answers on final step
- [ ] Wire up mock API routes for questions and answers

### Phase 5: Integration & Polish
- [ ] Route protection (redirect unauthenticated users)
- [ ] Flow wiring: signup -> plans -> payment -> onboarding -> dashboard
- [ ] Loading states and error handling
- [ ] Responsive testing across breakpoints
- [ ] Animations/transitions between screens

---

## Tech Stack

| Category | Choice |
|----------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State | React Context (auth state) |
| Forms | Native React (useState) |
| Mock API | Next.js Route Handlers |
| Fonts | Inter (or confirmed from design) |

---

## Notes
- Mock API uses in-memory storage (resets on server restart) - suitable for UI development
- All mock endpoints include artificial 500ms delay to simulate real network conditions
- JWT tokens are mock strings; real auth will be integrated later
- The personalization questionnaire is a single `/onboarding` page that dynamically renders one question at a time with a progress bar, not separate routes per question
