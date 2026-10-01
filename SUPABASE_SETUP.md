# Supabase Setup - Quick Version

## What you create

Use **one Supabase project**.

- `auth.users` is created and managed automatically by Supabase Auth.
- You create one custom table: `public.medical_profiles`.

The easiest setup is **not** to manually create columns. Open **Supabase -> SQL Editor**, paste the complete contents of `supabase/schema.sql`, and click **Run**.

## Required custom table

`medical_profiles` contains:

```text
id                         uuid (primary key)
user_id                    uuid (unique, references auth.users.id)
public_id                  uuid (unique, automatically generated)
full_name                  text (required)
blood_group                text (required)
allergies                  text
medications                text
medical_conditions         text
critical_notes             text
emergency_contact_name     text (required)
emergency_contact_relation text
emergency_contact_phone    text (required)
created_at                 timestamptz
updated_at                 timestamptz
```

## Why `public_id` exists

Do not put `user_id` into the QR. The QR uses the random `public_id`:

```text
/emergency/<public_id>
```

The RPC function uses that ID to return only the emergency-safe fields.

## RLS

The SQL file enables Row Level Security so a signed-in user can directly read or edit only their own row.

The public emergency page does not get direct anonymous table access. It calls the limited `get_emergency_profile()` database function instead.
