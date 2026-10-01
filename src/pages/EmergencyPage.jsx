import { useEffect, useState } from 'react'
import { AlertTriangle, HeartPulse, Info, Phone, ShieldAlert } from 'lucide-react'
import { useParams } from 'react-router-dom'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import { getEmergencyProfile, isUuid } from '../services/profiles'

export default function EmergencyPage() {
  const { publicId } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadProfile() {
    if (!isUuid(publicId)) {
      setProfile(null)
      setError('')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      setProfile(await getEmergencyProfile(publicId))
    } catch (err) {
      setError(err?.message || 'Could not load emergency information.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
    // publicId is the only load dependency
  }, [publicId])

  if (loading) {
    return <main className="min-h-screen bg-slate-950 px-4 py-10"><div className="mx-auto max-w-xl rounded-3xl bg-white p-6"><LoadingState label="Loading emergency information..." /></div></main>
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10">
        <div className="mx-auto max-w-xl">
          <ErrorState title="Could not load emergency information" message="The network or service may be unavailable. Please try again." onRetry={loadProfile} />
        </div>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10">
        <div className="mx-auto max-w-xl rounded-3xl bg-white p-7 text-center shadow-2xl">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-amber-700"><AlertTriangle className="h-7 w-7" /></div>
          <h1 className="mt-5 text-2xl font-black text-slate-950">Emergency profile not found</h1>
          <p className="mt-3 leading-7 text-slate-600">This QR may be invalid, expired, or no longer connected to a profile.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 px-3 py-4 sm:px-4 sm:py-8">
      <article className="mx-auto max-w-xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <header className="bg-red-600 px-5 py-5 text-white sm:px-7">
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]"><HeartPulse className="h-5 w-5" /> Emergency profile</div>
            <ShieldAlert className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">{profile.full_name}</h1>
          <p className="mt-2 text-sm leading-6 text-red-50">User-provided emergency information. Verify clinically where required.</p>
        </header>

        <div className="p-5 sm:p-7">
          <section className="rounded-3xl border-2 border-red-200 bg-red-50 p-5 text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-700">Blood group</p>
            <p className="mt-1 text-5xl font-black tracking-tight text-red-700">{profile.blood_group || '—'}</p>
          </section>

          <div className="mt-5 space-y-3">
            <EmergencyField label="Allergies" value={profile.allergies} danger />
            <EmergencyField label="Current medications" value={profile.medications} />
            <EmergencyField label="Medical conditions" value={profile.medical_conditions} />
            <EmergencyField label="Critical notes" value={profile.critical_notes} />
          </div>

          <section className="mt-6 rounded-3xl bg-slate-950 p-5 text-white">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Emergency contact</p>
            <div className="mt-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-xl font-black">{profile.emergency_contact_name}</p>
                <p className="mt-1 text-sm text-slate-300">{profile.emergency_contact_relation || 'Emergency contact'}</p>
                <p className="mt-1 text-sm font-semibold text-slate-200">{profile.emergency_contact_phone}</p>
              </div>
              <a
                href={`tel:${profile.emergency_contact_phone}`}
                aria-label={`Call ${profile.emergency_contact_name}`}
                className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600"
              >
                <Phone className="h-6 w-6" />
              </a>
            </div>
          </section>

          <div className="mt-5 flex items-start gap-2 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <Info className="mt-0.5 h-5 w-5 shrink-0" />
            <p>This information was entered by the profile owner and is not a substitute for clinical verification or official medical records.</p>
          </div>
        </div>
      </article>
    </main>
  )
}

function EmergencyField({ label, value, danger = false }) {
  const content = value?.trim() || 'Not provided'
  return (
    <section className={`rounded-2xl border p-4 ${danger && value ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
      <p className={`text-xs font-black uppercase tracking-[0.14em] ${danger && value ? 'text-red-700' : 'text-slate-500'}`}>{label}</p>
      <p className="mt-2 whitespace-pre-wrap text-base font-bold leading-6 text-slate-950">{content}</p>
    </section>
  )
}
