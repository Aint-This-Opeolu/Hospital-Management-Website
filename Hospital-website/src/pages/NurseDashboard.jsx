import React from 'react';
import { Activity, ClipboardPlus, HeartPulse, UserRound } from 'lucide-react';
import { api } from '../utils/api';

const panel = 'rounded-2xl border border-slate-200 bg-white shadow-sm';
const input = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20';

function Metric({ label, value, icon: Icon }) {
  return <div className={`${panel} p-5`}><div className="flex items-center justify-between"><p className="text-sm text-slate-500">{label}</p><Icon className="h-5 w-5 text-blue-600" /></div><p className="mt-3 text-3xl font-bold text-slate-900">{value}</p></div>;
}

export default function NurseDashboard({ user }) {
  const [patients, setPatients] = React.useState([]);
  const [observations, setObservations] = React.useState([]);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const [form, setForm] = React.useState({ patient_id: '', temperature: '', blood_pressure: '', pulse: '', respiratory_rate: '', notes: '' });

  async function load() {
    const [patientData, observationData] = await Promise.all([api('/api/clinical/patients'), api('/api/clinical/observations')]);
    setPatients(patientData.patients || []);
    setObservations(observationData.observations || []);
  }

  React.useEffect(() => { load().catch(() => {}); }, []);

  async function save(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      await api('/api/clinical/observations', { method: 'POST', body: JSON.stringify(form) });
      setMessage('Observation saved to the patient record.');
      setForm({ patient_id: '', temperature: '', blood_pressure: '', pulse: '', respiratory_rate: '', notes: '' });
      load();
    } catch (requestError) { setError(requestError.message); }
  }

  return <div className="space-y-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Kenny Care Hospital</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Nursing workspace</h1><p className="mt-1 text-slate-500">{user.name} · Patient observations and ward support</p></div><div className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">Clinical records</div></div><div className="grid grid-cols-2 gap-4 lg:grid-cols-3"><Metric label="Patients in care" value={patients.length} icon={UserRound} /><Metric label="Observations recorded" value={observations.length} icon={Activity} /><Metric label="Latest care updates" value={observations.slice(0, 3).length} icon={HeartPulse} /></div><div className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]"><section className={`${panel} overflow-hidden`}><div className="border-b border-slate-100 px-6 py-5"><div className="flex items-center gap-2"><UserRound className="h-5 w-5 text-blue-600" /><h2 className="text-xl font-bold text-slate-900">Patients in care</h2></div><p className="mt-1 text-sm text-slate-500">Select a patient to record their latest observations.</p></div><div className="divide-y divide-slate-100">{patients.map((patient) => <button type="button" key={patient.id} onClick={() => setForm({ ...form, patient_id: String(patient.id) })} className={`flex w-full items-center gap-3 px-6 py-4 text-left transition hover:bg-blue-50 ${String(form.patient_id) === String(patient.id) ? 'bg-blue-50' : ''}`}><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700">{patient.name.slice(0, 1)}</div><div><p className="font-semibold text-slate-900">{patient.name}</p><p className="mt-1 text-sm text-slate-500">{patient.phone || patient.email}</p></div></button>)}{patients.length === 0 && <div className="px-6 py-14 text-center"><p className="font-semibold text-slate-700">No patients assigned</p><p className="mt-1 text-sm text-slate-500">Assigned patients will appear here.</p></div>}</div></section><section className={`${panel} p-6`}><div className="mb-5 flex items-start gap-3"><div className="rounded-xl bg-blue-50 p-2 text-blue-600"><ClipboardPlus className="h-5 w-5" /></div><div><h2 className="text-xl font-bold text-slate-900">Record observations</h2><p className="mt-1 text-sm text-slate-500">Capture vital signs and nursing notes.</p></div></div><form onSubmit={save} className="grid gap-3 sm:grid-cols-2"><select required value={form.patient_id} onChange={(event) => setForm({ ...form, patient_id: event.target.value })} className={`${input} sm:col-span-2`}><option value="">Select patient</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}</select><input placeholder="Temperature" value={form.temperature} onChange={(event) => setForm({ ...form, temperature: event.target.value })} className={input} /><input placeholder="Blood pressure" value={form.blood_pressure} onChange={(event) => setForm({ ...form, blood_pressure: event.target.value })} className={input} /><input placeholder="Pulse" value={form.pulse} onChange={(event) => setForm({ ...form, pulse: event.target.value })} className={input} /><input placeholder="Respiratory rate" value={form.respiratory_rate} onChange={(event) => setForm({ ...form, respiratory_rate: event.target.value })} className={input} /><textarea placeholder="Nursing notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className={`${input} min-h-28 sm:col-span-2`} /><button className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/15 transition hover:bg-blue-700 sm:col-span-2">Save observation</button>{message && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 sm:col-span-2">{message}</p>}{error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2">{error}</p>}</form></section></div></div>;
}
