import { HeartPulse, LogOut, UserRound } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function AppShell({ children }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  const navClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition ${
      isActive ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
    }`

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/dashboard" className="inline-flex items-center gap-2 font-black tracking-tight text-slate-950">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-red-500 text-white">
              <HeartPulse className="h-5 w-5" aria-hidden="true" />
            </span>
            MedQR
          </Link>

          <nav className="hidden items-center gap-1 sm:flex" aria-label="Primary navigation">
            <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
            <NavLink to="/profile" className={navClass}>Medical profile</NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden max-w-48 truncate text-xs text-slate-500 md:inline">{user?.email}</span>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>

        <div className="mx-auto flex max-w-6xl gap-2 px-4 pb-3 sm:hidden">
          <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
          <NavLink to="/profile" className={navClass}>
            <span className="inline-flex items-center gap-1.5"><UserRound className="h-4 w-4" /> Profile</span>
          </NavLink>
        </div>
      </header>

      {children}
    </div>
  )
}
