# QR Emergency Medical Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a beginner-friendly React web app where a user creates one emergency medical profile, receives a unique QR code, and a responder can scan it to view only approved emergency information without logging in.

**Architecture:** A Vite React SPA talks directly to Supabase using the anon key. Supabase Auth manages accounts, `medical_profiles` stores one row per user behind RLS, and a `security definer` RPC exposes only approved emergency fields by `public_id` for anonymous QR scans.

**Tech Stack:** React, Vite, Tailwind CSS, React Router, Supabase JS, react-qr-code, Lucide React, Vitest, React Testing Library

**Spec:** `docs/superpowers/specs/2026-10-01-medqr-emergency-profile-design.md`

## Global Constraints

- Use one custom table: `medical_profiles`.
- One medical profile per authenticated user.
- The QR stores only `/emergency/<public_id>`, never medical data directly.
- Public emergency access must work without login and expose only the approved emergency fields.
- Private CRUD must be restricted to the owner with Supabase RLS.
- Keep `.env` out of Git and include `.env.example` with placeholders only.
- MVP excludes hospital integration, doctor accounts, AI diagnosis, ambulance tracking, full offline sync, document uploads, and custom encryption.
- UI must be responsive, with the emergency page optimized for phone scanning and high readability.

## Review Focus

- Missing or malformed `public_id` must show a safe “Emergency profile not found” state, not crash.
- Supabase/network failure must show a retryable error state on public and private pages.
- Unauthenticated users opening `/dashboard` or `/profile` must be redirected to `/login`.
- A signed-in user must never be able to read/update another user's private row through the client.
- Required medical profile fields must block submission with understandable validation messages.

---

## File Structure

```text
medqr-hackathon/
├── README.md
├── .env.example
├── .gitignore
├── package.json
├── vite.config.js
├── index.html
├── supabase/
│   └── schema.sql
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── lib/
│   │   └── supabase.js
│   ├── auth/
│   │   ├── AuthProvider.jsx
│   │   └── ProtectedRoute.jsx
│   ├── components/
│   │   ├── AppShell.jsx
│   │   ├── Field.jsx
│   │   ├── LoadingState.jsx
│   │   └── ErrorState.jsx
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── EmergencyPage.jsx
│   └── services/
│       └── profiles.js
└── src/__tests__/
    ├── auth-routing.test.jsx
    ├── profile-form.test.jsx
    ├── qr-link.test.jsx
    └── emergency-page.test.jsx
```

### Task 1: Project shell and Supabase client

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `.gitignore`, `.env.example`
- Create: `src/main.jsx`, `src/App.jsx`, `src/index.css`, `src/lib/supabase.js`
- Test: `src/__tests__/auth-routing.test.jsx`

**Interfaces:**
- Produces: `supabase` client exported from `src/lib/supabase.js`.
- Produces: React Router routes for `/`, `/login`, `/register`, `/dashboard`, `/profile`, `/emergency/:publicId`.

- [ ] **Step 1: Write a failing route-render test** for the landing, login, and register routes.
- [ ] **Step 2: Run `npm test -- --run`** and confirm the test fails before the app shell exists.
- [ ] **Step 3: Scaffold Vite React, install dependencies, configure Vitest, create the Supabase client using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, and wire the routes.**
- [ ] **Step 4: Run `npm test -- --run`** and confirm the route-render test passes.
- [ ] **Step 5: Commit:** `feat: scaffold emergency profile app`.

### Task 2: Supabase database, RLS, and public RPC

**Files:**
- Create: `supabase/schema.sql`
- Create: `README.md` setup section

**Interfaces:**
- Produces table: `public.medical_profiles` with one row per `user_id` and unique `public_id`.
- Produces RPC: `public.get_emergency_profile(public_profile_id uuid)` returning only approved emergency fields.
- Private policy behavior: authenticated owner can select/insert/update/delete only their row.
- Public behavior: anon/authenticated may execute the RPC but cannot directly select private rows.

- [ ] **Step 1: Write SQL defining `medical_profiles` with UUID primary key, owner FK, generated unique `public_id`, emergency fields, timestamps, and unique `user_id`.**
- [ ] **Step 2: Add RLS policies using `auth.uid() = user_id` for owner CRUD and no anonymous table select policy.**
- [ ] **Step 3: Add `get_emergency_profile(public_profile_id uuid)` as `security definer`, returning only the nine approved public fields; grant execute to `anon` and `authenticated`.**
- [ ] **Step 4: Add an `updated_at` trigger and README instructions for running the SQL in Supabase SQL Editor.**
- [ ] **Step 5: Review the SQL for accidental public table reads and commit:** `feat: add secure Supabase schema`.

### Task 3: Authentication and protected routes

**Files:**
- Create: `src/auth/AuthProvider.jsx`, `src/auth/ProtectedRoute.jsx`
- Create: `src/pages/LoginPage.jsx`, `src/pages/RegisterPage.jsx`
- Modify: `src/App.jsx`
- Test: `src/__tests__/auth-routing.test.jsx`

**Interfaces:**
- `AuthProvider` exposes `{ user, loading, signOut }` through context.
- `ProtectedRoute` redirects unauthenticated users to `/login` after auth loading finishes.
- Login uses `supabase.auth.signInWithPassword({ email, password })`.
- Registration uses `supabase.auth.signUp({ email, password })`.

- [ ] **Step 1: Add failing tests for protected-route redirect and visible login/register forms.**
- [ ] **Step 2: Run the tests and confirm failure.**
- [ ] **Step 3: Implement auth session subscription, login, registration, sign-out, and protected routing.**
- [ ] **Step 4: Run tests and confirm they pass.**
- [ ] **Step 5: Commit:** `feat: add Supabase authentication`.

### Task 4: Medical profile service and create/edit form

**Files:**
- Create: `src/services/profiles.js`
- Create: `src/components/Field.jsx`, `src/components/LoadingState.jsx`, `src/components/ErrorState.jsx`
- Create: `src/pages/ProfilePage.jsx`
- Test: `src/__tests__/profile-form.test.jsx`

**Interfaces:**
- `getOwnProfile(userId)` returns the signed-in user's profile or `null`.
- `saveOwnProfile(userId, input)` upserts the user's single profile and returns the saved row.
- Required fields: `full_name`, `blood_group`, `emergency_contact_name`, `emergency_contact_phone`.
- Optional fields: allergies, medications, medical conditions, critical notes, emergency contact relation.

- [ ] **Step 1: Write failing tests that required fields block submission and a valid form calls `saveOwnProfile`.**
- [ ] **Step 2: Run the tests and confirm failure.**
- [ ] **Step 3: Implement profile service queries scoped by `user_id` and build the create/edit form with validation and clear success/error states.**
- [ ] **Step 4: Run tests and confirm they pass.**
- [ ] **Step 5: Commit:** `feat: add medical profile editor`.

### Task 5: Dashboard and unique QR code

**Files:**
- Create: `src/pages/DashboardPage.jsx`
- Create: `src/components/AppShell.jsx`
- Modify: `src/App.jsx`
- Test: `src/__tests__/qr-link.test.jsx`

**Interfaces:**
- Dashboard loads the owner's profile through `getOwnProfile(user.id)`.
- QR value is `${window.location.origin}/emergency/${profile.public_id}`.
- If no profile exists, dashboard shows a clear CTA linking to `/profile`.

- [ ] **Step 1: Write failing tests for the no-profile CTA and exact QR URL construction.**
- [ ] **Step 2: Run the tests and confirm failure.**
- [ ] **Step 3: Implement the responsive dashboard, profile summary, QR rendering, copy-link action, edit-profile link, and sign-out.**
- [ ] **Step 4: Run tests and confirm they pass.**
- [ ] **Step 5: Commit:** `feat: add dashboard and emergency QR`.

### Task 6: Public emergency page

**Files:**
- Modify: `src/services/profiles.js`
- Create: `src/pages/EmergencyPage.jsx`
- Test: `src/__tests__/emergency-page.test.jsx`

**Interfaces:**
- `getEmergencyProfile(publicId)` calls `supabase.rpc('get_emergency_profile', { public_profile_id: publicId })` and returns the single public row or `null`.
- Emergency page never requires auth.
- Page displays only the fields returned by the RPC.

- [ ] **Step 1: Write failing tests for valid profile rendering, invalid/not-found ID, and network error with retry UI.**
- [ ] **Step 2: Run tests and confirm failure.**
- [ ] **Step 3: Implement the RPC service call and a high-contrast mobile-first emergency page with tap-to-call contact link.**
- [ ] **Step 4: Run tests and confirm they pass.**
- [ ] **Step 5: Commit:** `feat: add public emergency profile`.

### Task 7: Landing page, polish, setup documentation, and production verification

**Files:**
- Create: `src/pages/LandingPage.jsx`
- Modify: `src/index.css`, `README.md`
- Verify: all test files and production build

**Interfaces:**
- README documents prerequisites, install commands, `.env` variables, Supabase SQL setup, local run, and Vercel deployment.
- Landing page explains the emergency use case without claiming clinical verification or replacement of official medical records.

- [ ] **Step 1: Implement the responsive landing page and consistent visual styling across auth, dashboard, profile, and emergency screens.**
- [ ] **Step 2: Write README setup steps for Node/npm, Supabase project creation, running `supabase/schema.sql`, environment variables, `npm install`, `npm run dev`, and Vercel.**
- [ ] **Step 3: Run `npm test -- --run` and require all tests to pass.**
- [ ] **Step 4: Run `npm run build` and require a successful production build with no unresolved imports.**
- [ ] **Step 5: Check `.gitignore` includes `.env` and the ZIP contains `.env.example` but no real credentials.**
- [ ] **Step 6: Commit:** `docs: finish hackathon app setup and verification`.
