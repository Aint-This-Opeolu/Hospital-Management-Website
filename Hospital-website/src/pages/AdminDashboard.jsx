import React from 'react';
import { Activity, Clock3, Plus, Search, ShieldCheck, UserRound, X } from 'lucide-react';
import { api } from '../utils/api';

const panel = 'rounded-2xl border border-slate-200 bg-white shadow-sm';
const input = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20';

function Metric({ label, value, icon: Icon }) {
  return <div className={`${panel} p-5`}><div className="flex items-center justify-between"><p className="text-sm text-slate-500">{label}</p><Icon className="h-5 w-5 text-blue-600" /></div><p className="mt-3 text-3xl font-bold text-slate-900">{value}</p></div>;
}

function formatDate(value) {
  if (!value) return 'Not recorded';
  return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

export default function AdminDashboard({ user }) {
  const [stats, setStats] = React.useState(null);
  const [users, setUsers] = React.useState([]);
  const [logs, setLogs] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [form, setForm] = React.useState({ name: '', email: '', password: '', role: 'doctor', doctor_id: '', phone: '' });

  async function loadAdminData() {
    const [summary, staff, activity] = await Promise.all([
      api('/api/admin/stats').catch(() => null),
      api('/api/admin/users').catch(() => ({ users: [] })),
      api('/api/admin/activity-logs').catch(() => ({ logs: [] }))
    ]);
    setStats(summary);
    setUsers(staff.users || []);
    setLogs(activity.logs || []);
  }

  React.useEffect(() => { loadAdminData(); }, []);

  async function createUser(event) {
    event.preventDefault();
    setMessage('');
    try {
      await api('/api/admin/users', { method: 'POST', body: JSON.stringify(form) });
      setMessage('Staff account created successfully.');
      setForm({ name: '', email: '', password: '', role: 'doctor', doctor_id: '', phone: '' });
      setIsModalOpen(false);
      loadAdminData();
    } catch (error) { setMessage(error.message); }
  }

  const filteredUsers = users.filter((staff) => [staff.name, staff.email, staff.role, staff.doctorId, staff.doctor_id].filter(Boolean).some((value) => value.toLowerCase().includes(search.toLowerCase())));
  const doctorCount = users.filter((staff) => staff.role === 'doctor').length;

  return <div className="space-y-8">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Kenny Care Hospital</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Administrator overview</h1><p className="mt-1 text-slate-500">{user.name} · Access control, activity, and operations</p></div><button onClick={() => { setMessage(''); setIsModalOpen(true); }} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/15 transition hover:bg-blue-700"><Plus className="h-5 w-5" /> Create staff account</button></div>
 
  {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div>}
 
  {stats && <div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><Metric label="Patients" value={stats.totalPatients} icon={UserRound} /><Metric label="Appointments" value={stats.totalAppointments} icon={Clock3} /><Metric label="Active users" value={stats.totalUsers || users.filter((staff) => staff.active).length} icon={ShieldCheck} /><Metric label="Activity events" value={logs.length} icon={Activity} /></div>}
 
  <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
  <section className={`${panel} overflow-hidden`}><div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-5"><div><h2 className="text-xl font-bold text-slate-900">User management</h2><p className="mt-1 text-sm text-slate-500">{doctorCount} doctor accounts · {users.length} staff accounts total</p></div><div className="relative w-full sm:w-64"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search staff" className={`${input} py-2.5 pl-9`} /></div></div><div className="max-h-[31rem] overflow-y-auto">{filteredUsers.map((staff) => <div key={staff.id} className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4 last:border-0"><div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700">{staff.name?.slice(0, 1) || 'U'}</div><div className="min-w-0"><p className="truncate font-semibold text-slate-900">{staff.name}</p><p className="truncate text-sm text-slate-500">{staff.email}</p></div></div><div className="shrink-0 text-right"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold capitalize text-slate-600">{staff.role}</span><p className={`mt-1 text-xs ${staff.active ? 'text-emerald-600' : 'text-rose-600'}`}>{staff.active ? 'Active' : 'Disabled'}</p></div></div>)}{filteredUsers.length === 0 && <p className="px-6 py-12 text-center text-sm text-slate-500">No matching accounts.</p>}</div></section>
 
  <section className={`${panel} overflow-hidden`}><div className="border-b border-slate-100 px-6 py-5"><div className="flex items-center gap-2"><Activity className="h-5 w-5 text-blue-600" /><h2 className="text-xl font-bold text-slate-900">Activity logs</h2></div><p className="mt-1 text-sm text-slate-500">Recent authentication and operational events.</p></div><div className="max-h-[31rem] overflow-y-auto">{logs.map((log) => <div key={log.id} className="border-b border-slate-100 px-6 py-4 last:border-0"><div className="flex items-start justify-between gap-3"><p className="font-semibold text-slate-900">{log.action} <span className="font-normal text-slate-500">{log.entity}</span></p><span className="shrink-0 text-xs text-slate-400">{formatDate(log.createdAt || log.created_at)}</span></div><p className="mt-1 text-sm text-slate-500">{log.details || 'Activity recorded'} · {log.actorName || 'System'}</p></div>)}{logs.length === 0 && <div className="px-6 py-12 text-center"><Activity className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm text-slate-500">No activity has been recorded yet.</p></div>}</div></section>
  </div>
 
  {isModalOpen && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-sm"><div role="dialog" aria-modal="true" aria-labelledby="create-staff-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white/80 bg-white/95 p-6 shadow-2xl shadow-slate-950/30 sm:p-9"><div className="mb-7 flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Access control</p><h2 id="create-staff-title" className="mt-1 text-2xl font-bold text-slate-900">Create staff account</h2><p className="mt-2 text-sm text-slate-500">Create credentials for a doctor, nurse, reception staff member, or administrator.</p></div><button type="button" onClick={() => setIsModalOpen(false)} aria-label="Close create staff modal" className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button></div><form onSubmit={createUser} className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Dr. Adaora Eze" className={`${input} mt-2`} /></label><label className="text-sm font-semibold text-slate-700">Email address<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="staff@kennycare.local" className={`${input} mt-2`} /></label><label className="text-sm font-semibold text-slate-700">Temporary password<input required type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Create a temporary password" className={`${input} mt-2`} /></label><label className="text-sm font-semibold text-slate-700">Phone number<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="e.g. 09026787124" className={`${input} mt-2`} /></label><label className="text-sm font-semibold text-slate-700 sm:col-span-2">Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className={`${input} mt-2`}><option value="doctor">Doctor</option><option value="nurse">Nurse</option><option value="reception">Reception Staff</option><option value="admin">Administrator</option></select></label>{form.role === 'doctor' && <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Doctor ID<input value={form.doctor_id} onChange={(event) => setForm({ ...form, doctor_id: event.target.value })} placeholder="Optional internal doctor ID" className={`${input} mt-2`} /></label>}<div className="flex justify-end gap-3 pt-3 sm:col-span-2"><button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button><button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/15 hover:bg-blue-700">Create account</button></div></form></div></div>}
  </div>;
}
