import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'react-qr-code'
import { Check, Copy, Edit3, ExternalLink, HeartPulse, Phone, ShieldCheck } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import AppShell from '../components/AppShell'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import { getOwnProfile } from '../services/profiles'

export function buildEmergencyUrl(publicId) {
  if (!publicId) return ''
  return `${window.location.origin}/emergency/${publicId}`
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function loadProfile() {
    setLoading(true)
    setError('')
    try {
      setProfile(await getOwnProfile(user?.id))
    } catch (err) {
      setError(err?.message || 'Could not load your profile.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
    // user id is the only load dependency
  }, [user?.id])

  async function copyLink(url) {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-600">Personal emergency card</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Your emergency QR</h1>
            <p className="mt-2 max-w-2xl text-slate-600">Keep one QR on your phone or printed card. Your medical details can be updated without changing the QR.</p>
          </div>
        </div>

        {loading && <div className="mt-8"><LoadingState label="Loading your profile..." /></div>}

        {!loading && error && (
          <div className="mt-8"><ErrorState title="Could not load your profile" message={error} onRetry={loadProfile} /></div>
        )}

        {!loading && !error && !profile && (
          <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-soft sm:p-10">
            <div className="max-w-2xl">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-600">
                <HeartPulse className="h-7 w-7" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-2xl font-black text-slate-950">Create your first emergency profile</h2>
              <p className="mt-3 leading-7 text-slate-600">Add the minimum information a responder may need. Once saved, the system creates your unique public emergency link and QR code.</p>
              <Link to="/profile" className="mt-6 inline-flex rounded-xl bg-red-500 px-5 py-3 font-bold text-white hover:bg-red-600">Create medical profile</Link>
            </div>
          </section>
        )}

        {!loading && !error && profile && (() => {
          const emergencyUrl = buildEmergencyUrl(profile.public_id)
          return (
            <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Scan in emergency</p>
                    <h2 className="mt-1 text-2xl font-black text-slate-950">Unique QR code</h2>
                  </div>
                  <ShieldCheck className="h-7 w-7 text-emerald-600" aria-hidden="true" />
                </div>

                <div className="mx-auto mt-7 w-full max-w-xs rounded-3xl border border-slate-200 bg-white p-5">
                  <QRCode value={emergencyUrl} className="h-auto w-full" aria-label="Emergency profile QR code" />
                </div>

                <p className="mt-5 break-all rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">{emergencyUrl}</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <button type="button" onClick={() => copyLink(emergencyUrl)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied' : 'Copy link'}
                  </button>
                  <a href={emergencyUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800">
                    <ExternalLink className="h-4 w-4" /> Preview page
                  </a>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-red-600">Emergency profile</p>
                    <h2 className="mt-1 text-3xl font-black text-slate-950">{profile.full_name}</h2>
                  </div>
                  <Link to="/profile" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
                    <Edit3 className="h-4 w-4" /> Edit
                  </Link>
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <Info label="Blood group" value={profile.blood_group} emphasis />
                  <Info label="Allergies" value={profile.allergies || 'None provided'} />
                  <Info label="Current medications" value={profile.medications || 'None provided'} />
                  <Info label="Medical conditions" value={profile.medical_conditions || 'None provided'} />
                  <div className="sm:col-span-2"><Info label="Critical notes" value={profile.critical_notes || 'None provided'} /></div>
                </div>

                <div className="mt-7 rounded-2xl bg-red-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">Emergency contact</p>
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-black text-slate-950">{profile.emergency_contact_name}</p>
                      <p className="text-sm text-slate-600">{profile.emergency_contact_relation || 'Emergency contact'}</p>
                    </div>
                    <a className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-600" href={`tel:${profile.emergency_contact_phone}`}>
                      <Phone className="h-4 w-4" /> Call
                    </a>
                  </div>
                </div>
              </section>
            </div>
          )
        })()}
      </main>
    </AppShell>
  )
}

function Info({ label, value, emphasis = false }) {
  return (
    <div className={`rounded-2xl border p-4 ${emphasis ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-2 whitespace-pre-wrap font-semibold text-slate-900 ${emphasis ? 'text-2xl' : 'text-base'}`}>{value}</p>
    </div>
  )
}
