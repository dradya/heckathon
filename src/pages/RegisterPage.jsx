import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HeartPulse } from 'lucide-react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setSubmitting(true)
    const { data, error: authError } = await supabase.auth.signUp({ email, password })
    setSubmitting(false)

    if (authError) {
      setError(authError.message)
      return
    }

    if (data.session) {
      navigate('/profile', { replace: true })
      return
    }

    setMessage('Account created. Check your email if email confirmation is enabled in Supabase.')
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-7 shadow-soft sm:p-9">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 font-bold text-slate-900">
          <HeartPulse className="h-6 w-6 text-red-500" /> MedQR
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Create account</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Create one private account to manage your emergency information.</p>

        {!isSupabaseConfigured && (
          <p className="mt-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Supabase is not configured yet. Add the values from your project to <code>.env</code>.</p>
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
          {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800" role="status">{message}</p>}

          <button className="w-full rounded-xl bg-red-500 px-4 py-3 font-semibold text-white transition hover:bg-red-600 disabled:opacity-60" disabled={submitting} type="submit">
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account? <Link className="font-semibold text-red-600 hover:text-red-700" to="/login">Sign in</Link>
        </p>
      </div>
    </main>
  )
}
