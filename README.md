# MedQR - QR Emergency Medical Profile

MedQR is a beginner-friendly hackathon web app where a user creates one emergency medical profile and receives a unique QR code. If the user cannot communicate during an emergency, a responder can scan the QR and view only the emergency information intentionally made public.

> **Important:** MedQR displays user-provided information. It is not a verified medical record and does not replace clinical checks, professional judgement, or official hospital systems.

## What the app includes

- Email/password sign-up and sign-in with Supabase Auth
- One medical profile per account
- Owner-only create/read/update/delete access through Supabase Row Level Security (RLS)
- A unique `public_id` and QR code for every medical profile
- A public emergency page that works without login
- Limited public fields exposed through a secure PostgreSQL RPC function
- Mobile-friendly emergency screen with tap-to-call emergency contact
- Vercel SPA routing support

## Tech stack

- React + Vite
- Tailwind CSS
- React Router
- Supabase Auth + PostgreSQL
- `react-qr-code`
- Lucide React
- Vitest + React Testing Library

## Database design

You need **one Supabase project**.

Supabase automatically manages login accounts in:

```text
auth.users
```

You create **one custom table**:

```text
medical_profiles
```

The important relationship is:

```text
auth.users.id  ->  medical_profiles.user_id
```

Each authenticated user can have only one `medical_profiles` row because `user_id` is unique.

### `medical_profiles` columns

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | uuid | Internal primary key |
| `user_id` | uuid | Links the row to Supabase Auth |
| `public_id` | uuid | Random public identifier used by the QR URL |
| `full_name` | text | Emergency display name |
| `blood_group` | text | User-entered blood group |
| `allergies` | text | Emergency allergies |
| `medications` | text | Current medications |
| `medical_conditions` | text | Important conditions |
| `critical_notes` | text | Other emergency-critical notes |
| `emergency_contact_name` | text | Contact person |
| `emergency_contact_relation` | text | Relationship to user |
| `emergency_contact_phone` | text | Tap-to-call number |
| `created_at` | timestamptz | Creation time |
| `updated_at` | timestamptz | Last update time |

## 1. Install prerequisites

Install:

- Node.js 20+ (Node 22 LTS is also fine)
- npm
- Git
- VS Code (recommended)

Check:

```bash
node -v
npm -v
git --version
```

## 2. Create the Supabase project

1. Go to Supabase and create a new project.
2. Wait for the project database to finish provisioning.
3. Open **SQL Editor**.
4. Open this project's `supabase/schema.sql` file.
5. Copy the entire SQL file into Supabase SQL Editor.
6. Click **Run**.

That SQL creates:

- `public.medical_profiles`
- RLS owner policies
- automatic `updated_at` trigger
- `get_emergency_profile(public_profile_id uuid)` public RPC

You do **not** have to manually create each column if you run `supabase/schema.sql`.

## 3. Configure authentication

In Supabase Dashboard:

1. Open **Authentication -> Providers -> Email**.
2. Keep Email provider enabled.
3. For a fast hackathon demo, you may disable **Confirm email** so a newly registered account can sign in immediately.
4. For a real deployment, enable email confirmation and configure proper email delivery.

## 4. Add environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

On Windows you can simply duplicate the file and rename the copy to `.env`.

Open Supabase **Project Settings -> API** and fill:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Use the **anon/public key**, never a Supabase `service_role` key in this frontend project.

`.env` is already ignored by Git.

## 5. Install and run

From the project folder:

```bash
npm install
npm run dev
```

Vite will show a local URL, normally:

```text
http://localhost:5173
```

## 6. Test the full demo flow

1. Register a test account.
2. Sign in.
3. Open **Medical profile**.
4. Fill the required fields and save.
5. Return to the dashboard.
6. Your unique QR code will appear.
7. Scan the QR using a phone, or click **Preview page**.
8. Open the emergency URL in an incognito/private browser window to confirm it works without login.
9. Edit the medical profile and save it again.
10. Scan the **same QR** again. The latest saved information should appear because the QR stores only the permanent public URL.

### Suggested fake demo data

Do not use a real person's sensitive medical information during the hackathon.

```text
Full name: Demo Patient
Blood group: O+
Allergies: Penicillin
Current medications: Salbutamol inhaler
Medical conditions: Asthma
Critical notes: Keep inhaler nearby
Emergency contact: Demo Contact
Relationship: Parent
Phone: +91 99999 99999
```

## 7. How the QR works

The QR does **not** contain the medical details directly.

Example QR value:

```text
https://your-app.vercel.app/emergency/550e8400-e29b-41d4-a716-446655440000
```

Flow:

```text
User signs in
   -> saves profile in Supabase
   -> Supabase assigns a random public_id
   -> app builds /emergency/<public_id>
   -> QR stores that URL
   -> responder scans QR
   -> public page calls the limited Supabase RPC
   -> emergency information is displayed
```

Because the medical data stays in the database, updating the profile does **not** require generating a new QR.

## 8. Security model

### Private access

RLS restricts direct `medical_profiles` access so an authenticated user can only access the row where:

```sql
auth.uid() = user_id
```

### Public QR access

Anonymous visitors do not get direct table access. The emergency page calls:

```text
get_emergency_profile(public_profile_id)
```

The function returns only these approved fields:

- full name
- blood group
- allergies
- medications
- medical conditions
- critical notes
- emergency contact name
- emergency contact relationship
- emergency contact phone

Anyone who possesses the QR/public link can see those fields, so users should only enter information they consent to expose for emergency access.

## 9. Run tests

```bash
npm test -- --run
```

## 10. Production build

```bash
npm run build
```

## 11. Deploy to Vercel

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Framework preset should detect **Vite**.
4. Add the two environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy.

`vercel.json` is included so direct links such as `/emergency/<public_id>` are rewritten to the React SPA instead of returning a 404.

After deployment, generate/save a profile again or refresh the dashboard so the displayed QR uses the deployed domain rather than `localhost`.

## Project structure

```text
medqr-hackathon/
├── src/
│   ├── auth/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── __tests__/
├── supabase/
│   └── schema.sql
├── .env.example
├── vercel.json
└── README.md
```

## Hackathon pitch in one line

> A QR-based emergency profile that lets responders quickly access limited, user-provided medical information when the patient cannot communicate.
