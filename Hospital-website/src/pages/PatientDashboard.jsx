import React from 'react';
import { KeyRound } from 'lucide-react';
import { api } from '../utils/api';

export default function PatientDashboard({ user }) {
  const [appointments, setAppointments] = React.useState([]);
  const [form, setForm] = React.useState({ current_password: '', new_password: '', confirm_password: '' });
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => { api('/api/appointments').then((data) => setAppointments(data.appointments || [])).catch(() => {}); }, []);

  async function changePassword(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    if (form.new_password !== form.confirm_password) { setError('New passwords do not match.'); return; }
    try {
      await api('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ current_password: form.current_password, new_password: form.new_password }) });
      setMessage('Password updated successfully.');
      setForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (requestError) { setError(requestError.message); }
  }

  return <div className="space-y-8"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Kenny Care Hospital</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Patient workspace</h1><p className="mt-1 text-slate-500">Welcome, {user.name} · Your appointments and account security</p></div><div className="grid gap-6 lg:grid-cols-[1fr_.75fr]"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-bold text-slate-900">My appointments</h2><p className="mt-1 text-sm text-slate-500">Your personal appointment history.</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{appointments.length} records</span></div><div className="space-y-3">{appointments.map((appointment) => <div key={appointment.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4"><p className="font-semibold text-slate-900">{appointment.doctor_name || 'Unassigned doctor'}</p><p className="mt-1 text-sm text-slate-500">{appointment.appointment_date} at {appointment.appointment_time} · <span className="capitalize">{appointment.status}</span></p></div>)}{appointments.length === 0 && <p className="py-10 text-center text-sm text-slate-500">No appointments yet.</p>}</div></section><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-start gap-3"><div className="rounded-xl bg-blue-50 p-2 text-blue-600"><KeyRound className="h-5 w-5" /></div><div><h2 className="text-xl font-bold text-slate-900">Set your password</h2><p className="mt-1 text-sm text-slate-500">Replace the temporary password given at registration.</p></div></div><form onSubmit={changePassword} className="space-y-3"><input required type="password" placeholder="Temporary password" value={form.current_password} onChange={(event) => setForm({ ...form, current_password: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /><input required minLength="8" type="password" placeholder="New password (8+ characters)" value={form.new_password} onChange={(event) => setForm({ ...form, new_password: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /><input required minLength="8" type="password" placeholder="Confirm new password" value={form.confirm_password} onChange={(event) => setForm({ ...form, confirm_password: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /><button className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700">Update password</button>{message && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}{error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}</form></section></div></div>;
}
