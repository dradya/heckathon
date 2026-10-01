import { ArrowRight, HeartPulse, QrCode, ShieldCheck, Smartphone, UserRoundCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

const steps = [
  { icon: UserRoundCheck, title: 'Create your profile', text: 'Add only the emergency medical information you want available during an emergency.' },
  { icon: QrCode, title: 'Get your unique QR', text: 'Your QR stores a secure public link, not your medical details directly.' },
  { icon: Smartphone, title: 'Scan when needed', text: 'A responder can scan the QR and view the limited emergency profile without signing in.' },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-lg font-black">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-red-500"><HeartPulse className="h-5 w-5" /></span>
          MedQR
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/10">Sign in</Link>
          <Link to="/register" className="rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-950 hover:bg-slate-100">Create profile</Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:pt-24">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-red-200">
            <ShieldCheck className="h-4 w-4" /> Emergency information access
          </div>
          <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[1.04] tracking-tight sm:text-6xl">Emergency medical profile, one scan away.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Create a personal emergency profile and QR code so essential user-provided information can be accessed if you are unable to communicate.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-6 py-3.5 font-black text-white hover:bg-red-600">Create your QR <ArrowRight className="h-5 w-5" /></Link>
            <Link to="/login" className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 font-bold text-white hover:bg-white/10">I already have an account</Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 rounded-full bg-red-500/10 blur-3xl" />
          <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
            <div className="rounded-3xl bg-white p-6 text-slate-950">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Emergency profile</p>
                  <p className="mt-1 text-2xl font-black">Demo Patient</p>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600"><HeartPulse /></div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Card label="Blood group" value="O+" strong />
                <Card label="Allergy" value="Penicillin" />
                <Card label="Condition" value="Asthma" />
                <Card label="Contact" value="Parent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-red-300">How it works</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">Simple enough to use in seconds.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <article key={title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-red-500/15 text-red-300"><Icon className="h-5 w-5" /></div>
                  <span className="text-sm font-black text-slate-500">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
              </article>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-sm leading-6 text-slate-500">MedQR displays information entered by the user. It does not verify medical claims and does not replace clinical checks, professional judgement, or official medical records.</p>
        </div>
      </section>
    </main>
  )
}

function Card({ label, value, strong = false }) {
  return (
    <div className={`rounded-2xl p-4 ${strong ? 'bg-red-50' : 'bg-slate-50'}`}>
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className={`mt-1 font-black ${strong ? 'text-2xl text-red-700' : 'text-slate-950'}`}>{value}</p>
    </div>
  )
}
