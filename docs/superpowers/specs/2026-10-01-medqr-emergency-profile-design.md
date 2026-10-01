# QR Emergency Medical Profile — Design Spec

## Goal
Build a beginner-friendly hackathon web app where a user creates an emergency medical profile, receives a unique QR code, and a responder can scan that QR to view only limited emergency-critical information without logging in.

## Success Criteria
- User can sign up and log in.
- User can create and edit one medical profile.
- App generates one unique public emergency URL and QR code per profile.
- Scanning the QR opens a public emergency page without login.
- Public page shows only approved emergency fields.
- Private profile editing is restricted to the owner using Supabase RLS.
- Project is easy to run locally and deploy to Vercel.

## Tech Stack
- React + Vite
- Tailwind CSS
- React Router
- Supabase Auth + PostgreSQL
- react-qr-code
- Lucide React
- Vercel-ready frontend deployment

## Core User Flow
1. User signs up or logs in with Supabase Auth.
2. User completes a medical profile form.
3. App stores the profile in `medical_profiles`, linked to `auth.users.id` through `user_id`.
4. Each row has a generated `public_id` UUID.
5. App generates a QR code that points to `/emergency/<public_id>`.
6. A responder scans the QR.
7. The public emergency page fetches a limited public view of that profile by `public_id` and displays emergency-critical information.
8. The owner can later update the profile; the QR remains the same because it stores only the URL.

## Data Model
Use Supabase Auth for login accounts. Create one app table:

### `medical_profiles`
- `id` uuid primary key
- `user_id` uuid unique, references `auth.users(id)`
- `public_id` uuid unique
- `full_name` text
- `blood_group` text
- `allergies` text
- `medications` text
- `medical_conditions` text
- `critical_notes` text
- `emergency_contact_name` text
- `emergency_contact_relation` text
- `emergency_contact_phone` text
- `created_at` timestamptz
- `updated_at` timestamptz

For the hackathon, text fields are intentionally used instead of multiple normalized allergy/medication tables to keep implementation simple.

## Public vs Private Data
### Public emergency page
Shows only:
- full name
- blood group
- allergies
- medications
- medical conditions
- critical notes
- emergency contact name
- emergency contact relation
- emergency contact phone

### Private dashboard
Requires login and allows the owner to create/edit their own profile and view their QR.

## Security
- Enable RLS on `medical_profiles`.
- Authenticated users can select/insert/update/delete only their own row (`auth.uid() = user_id`).
- Do not allow anonymous direct table access.
- Create a PostgreSQL function `get_emergency_profile(public_profile_id uuid)` marked `security definer` that returns only the public emergency fields. Grant execute to `anon` and `authenticated`.
- The public emergency route calls this function, not the private table directly.
- `.env` stores only the Supabase URL and anon key. `.env` must stay out of Git.

## Pages
- `/` — landing page
- `/login` — sign in
- `/register` — sign up
- `/dashboard` — profile summary + QR
- `/profile` — create/edit medical profile
- `/emergency/:publicId` — public emergency view

## UI Direction
- Clean medical/emergency visual style.
- High contrast and large typography on the public emergency page.
- Mobile-first emergency page because responders will scan from a phone.
- Dashboard can be desktop/mobile responsive.

## Error Handling
- Invalid or expired public ID: show “Emergency profile not found”.
- Supabase unavailable: show a clear retry message.
- Unauthenticated private-route access: redirect to login.
- Required fields missing: block submission and show field validation.

## Testing
Verify:
1. New account signup/login.
2. Profile creation.
3. Profile update.
4. QR renders and points to correct public URL.
5. Public route works in incognito without login.
6. User A cannot read or update User B's private row.
7. Invalid QR/public ID shows a safe error state.

## Out of Scope for MVP
- Hospital integration
- Doctor accounts
- AI diagnosis
- Ambulance tracking
- Full offline sync
- Document uploads
- Encryption beyond HTTPS + Supabase platform controls
- Clinical verification of user-entered medical data

## Optional Stretch Features
- Download/print QR card
- Regenerate public ID to invalidate an old QR
- PWA/offline cached emergency summary
- Audit log of profile updates
