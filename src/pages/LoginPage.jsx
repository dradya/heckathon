import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { HeartPulse } from 'lucide-react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setSubmitting(false)

    if (authError) {
      setError(authError.message)
      return
    }

    navigate(location.state?.from || '/dashboard', { replace: true })
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-7 shadow-soft sm:p-9">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 font-bold text-slate-900">
          <HeartPulse className="h-6 w-6 text-red-500" /> MedQR
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Sign in</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Manage your emergency profile and personal QR code.</p>

        {!isSupabaseConfigured && (
          <p className="mt-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
            Supabase is not configured yet. Copy <code>.env.example</code> to <code>.env</code> and add your project values.
          </p>
        )}

        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-slate-700">
            Email
            <input className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Password
            <input className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </label>

          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}

          <button className="w-full rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60" disabled={submitting} type="submit">
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          New here? <Link className="font-semibold text-red-600 hover:text-red-700" to="/register">Create account</Link>
        </p>
      </div>
    </main>
  )
}
