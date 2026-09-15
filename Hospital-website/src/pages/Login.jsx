import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { api } from '../utils/api';

export default function Login() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const json = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      localStorage.setItem('hms_user', JSON.stringify(json.user));
      localStorage.setItem('hms_token', json.token);
      nav('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally { setBusy(false); }
  }

  return (
    <div className="relative isolate flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden px-4 py-16">
      <div className="absolute inset-0 -z-20 bg-slate-950" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(15,23,42,.98),rgba(15,118,110,.72),rgba(30,64,175,.82))]" />
      <div className="absolute inset-0 -z-10 opacity-20 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1800')] bg-cover bg-center" />

      <div className="w-full max-w-md rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-2xl shadow-slate-950/25 backdrop-blur-md sm:p-9">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Kenny Care</p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">Sign in to access your secure hospital workspace.</p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@mail.com" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-12 text-slate-900 outline-none placeholder:text-slate-400 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20" autoComplete="email" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-12 text-slate-900 outline-none placeholder:text-slate-400 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20" autoComplete="current-password" />
            </div>
          </div>
          {error && <p className="rounded-xl border border-red-300/40 bg-red-950/30 px-4 py-3 text-sm text-red-100">{error}</p>}
          <button disabled={busy} className="w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60">{busy ? 'Signing in...' : 'Login securely'}</button>
        </form>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400"><LockKeyhole className="h-3.5 w-3.5" /> Protected Kenny Care access</p>
      </div>
    </div>
  );
}
