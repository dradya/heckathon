import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Save, ShieldCheck } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import ErrorState from '../components/ErrorState'
import Field from '../components/Field'
import LoadingState from '../components/LoadingState'
import { getOwnProfile, saveOwnProfile } from '../services/profiles'

const EMPTY_PROFILE = {
  full_name: '',
  blood_group: '',
  allergies: '',
  medications: '',
  medical_conditions: '',
  critical_notes: '',
  emergency_contact_name: '',
  emergency_contact_relation: '',
  emergency_contact_phone: '',
}

const BLOOD_GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((value) => ({
  value,
  label: value || 'Select blood group',
}))

export function validateProfile(form) {
  const errors = {}
  if (!form.full_name.trim()) errors.full_name = 'Full name is required.'
  if (!form.blood_group.trim()) errors.blood_group = 'Blood group is required.'
  if (!form.emergency_contact_name.trim()) errors.emergency_contact_name = 'Emergency contact name is required.'
  if (!form.emergency_contact_phone.trim()) errors.emergency_contact_phone = 'Emergency contact phone is required.'
  return errors
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [form, setForm] = useState(EMPTY_PROFILE)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadProfile() {
    setLoading(true)
    setLoadError('')
    try {
      const profile = await getOwnProfile(user?.id)
      if (profile) {
        setForm(Object.fromEntries(Object.keys(EMPTY_PROFILE).map((key) => [key, profile[key] ?? ''])))
      }
    } catch (error) {
      setLoadError(error.message || 'Unable to load your medical profile.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
    // The authenticated user id is the only load dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setSuccess('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaveError('')
    setSuccess('')

    const nextErrors = validateProfile(form)
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      setSaveError('Please complete the required fields before saving.')
      return
    }

    setSaving(true)
    try {
      await saveOwnProfile(user.id, form)
      setSuccess('Profile saved. Your QR will always show the latest saved emergency information.')
    } catch (error) {
      setSaveError(error.message || 'Unable to save your profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState label="Loading your medical profile..." />
  if (loadError) return <div className="mx-auto max-w-3xl p-6"><ErrorState message={loadError} onRetry={loadProfile} /></div>

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="rounded-3xl bg-white p-6 shadow-soft sm:p-9">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700"><ShieldCheck className="h-6 w-6" /></div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">Medical profile</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">Fields marked * are required. Enter only information you want available for emergency use.</p>
            </div>
          </div>

          <form className="mt-8 space-y-8" onSubmit={handleSubmit} noValidate>
            <section>
              <h2 className="text-lg font-bold text-slate-900">Essential information</h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <Field label="Full name" name="full_name" value={form.full_name} onChange={updateField} error={errors.full_name} required autoComplete="name" />
                <Field label="Blood group" name="blood_group" as="select" options={BLOOD_GROUPS} value={form.blood_group} onChange={updateField} error={errors.blood_group} required />
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">Emergency medical details</h2>
              <p className="mt-1 text-sm text-slate-500">Use short, clear information. Write “None known” where appropriate if you want that explicitly shown.</p>
              <div className="mt-4 grid gap-5">
                <Field label="Allergies" name="allergies" as="textarea" rows={3} value={form.allergies} onChange={updateField} placeholder="e.g. Penicillin, peanuts" />
                <Field label="Current medications" name="medications" as="textarea" rows={3} value={form.medications} onChange={updateField} placeholder="e.g. Salbutamol inhaler" />
                <Field label="Medical conditions" name="medical_conditions" as="textarea" rows={3} value={form.medical_conditions} onChange={updateField} placeholder="e.g. Asthma, diabetes" />
                <Field label="Critical notes" name="critical_notes" as="textarea" rows={3} value={form.critical_notes} onChange={updateField} placeholder="Any short emergency-critical note" />
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">Emergency contact</h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <Field label="Emergency contact name" name="emergency_contact_name" value={form.emergency_contact_name} onChange={updateField} error={errors.emergency_contact_name} required />
                <Field label="Relationship" name="emergency_contact_relation" value={form.emergency_contact_relation} onChange={updateField} placeholder="e.g. Parent, sibling" />
                <Field label="Emergency contact phone" name="emergency_contact_phone" type="tel" value={form.emergency_contact_phone} onChange={updateField} error={errors.emergency_contact_phone} required placeholder="e.g. +91 98765 43210" />
              </div>
            </section>

            {saveError && <p className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700" role="alert">{saveError}</p>}
            {success && <p className="rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800" role="status">{success}</p>}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <Link to="/dashboard" className="rounded-xl border border-slate-300 px-5 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50">Cancel</Link>
              <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
                <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
