import React from 'react';
import { CalendarCheck2, ClipboardPlus, Plus, Search, UserPlus, X } from 'lucide-react';
import { api } from '../utils/api';

const input = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20';
const panel = 'rounded-2xl border border-slate-200 bg-white shadow-sm';

function Metric({ label, value, icon: Icon }) {
  return <div className={`${panel} p-5`}><div className="flex items-center justify-between"><p className="text-sm text-slate-500">{label}</p><Icon className="h-5 w-5 text-blue-600" /></div><p className="mt-3 text-3xl font-bold text-slate-900">{value}</p></div>;
}

export default function ReceptionDashboard({ user }) {
  const [appointments, setAppointments] = React.useState([]);
  const [patients, setPatients] = React.useState([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [registration, setRegistration] = React.useState({ name: '', email: '', phone: '', date_of_birth: '', gender: '', contact_address: '', next_of_kin: '', next_of_kin_phone: '', blood_group: '', known_allergies: '', temporary_password: '' });

  async function load() {
    const [appointmentData, patientData] = await Promise.all([api('/api/appointments'), api('/api/clinical/patients')]);
    setAppointments(appointmentData.appointments || []);
    setPatients(patientData.patients || []);
  }

  React.useEffect(() => { load().catch(() => {}); }, []);

  async function register(event) {
    event.preventDefault();
    try {
      const result = await api('/api/clinical/patients', { method: 'POST', body: JSON.stringify(registration) });
      setMessage(`Patient registered. Temporary login password: ${result.temporaryPassword}`);
      setRegistration({ name: '', email: '', phone: '', date_of_birth: '', gender: '', contact_address: '', next_of_kin: '', next_of_kin_phone: '', blood_group: '', known_allergies: '', temporary_password: '' });
      setIsModalOpen(false);
      load();
    } catch (error) { setMessage(error.message); }
  }

  async function updateAppointment(id, status) {
    await api(`/api/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    load();
  }

  return <div className="space-y-8">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Kenny Care Hospital</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Reception workspace</h1><p className="mt-1 text-slate-500">{user.name} · Patient registration and appointment coordination</p></div><button onClick={() => { setMessage(''); setIsModalOpen(true); }} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/15 transition hover:bg-blue-700"><Plus className="h-5 w-5" /> Register patient</button></div>
    {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div>}
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><Metric label="Registered patients" value={patients.length} icon={UserPlus} /><Metric label="Appointment requests" value={appointments.filter((item) => item.status === 'pending').length} icon={ClipboardPlus} /><Metric label="Confirmed" value={appointments.filter((item) => item.status === 'confirmed').length} icon={CalendarCheck2} /><Metric label="Completed" value={appointments.filter((item) => item.status === 'completed').length} icon={CalendarCheck2} /></div>
    <section className={`${panel} overflow-hidden`}><div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-5"><div><h2 className="text-xl font-bold text-slate-900">Appointment requests</h2><p className="mt-1 text-sm text-slate-500">Approve, decline, and coordinate patient visits.</p></div><div className="relative w-full sm:w-64"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input placeholder="Search requests" className={`${input} py-2.5 pl-9`} /></div></div><div className="divide-y divide-slate-100">{appointments.map((appointment) => <div key={appointment.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-5"><div><p className="font-semibold text-slate-900">{appointment.patient_name || 'Patient request'}</p><p className="mt-1 text-sm text-slate-500">{appointment.appointment_date} at {appointment.appointment_time} · {appointment.reason || 'General consultation'}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">{appointment.status}</span>{appointment.status === 'pending' && <><button onClick={() => updateAppointment(appointment.id, 'confirmed')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Approve</button><button onClick={() => updateAppointment(appointment.id, 'declined')} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600">Decline</button></>}</div></div>)}{appointments.length === 0 && <div className="px-6 py-14 text-center"><p className="font-semibold text-slate-700">No appointment requests</p><p className="mt-1 text-sm text-slate-500">New patient requests will appear here.</p></div>}</div></section>
    {isModalOpen && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-sm"><div role="dialog" aria-modal="true" aria-labelledby="register-patient-title" className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white/80 bg-white/95 p-6 shadow-2xl shadow-slate-950/30 sm:p-9"><div className="mb-7 flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Patient registration</p><h2 id="register-patient-title" className="mt-1 text-2xl font-bold text-slate-900">Register a patient</h2><p className="mt-2 text-sm text-slate-500">Create a complete patient record for appointments and clinical care.</p></div><button type="button" onClick={() => setIsModalOpen(false)} aria-label="Close patient registration modal" className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button></div><form onSubmit={register} className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Full name<input required value={registration.name} onChange={(event) => setRegistration({ ...registration, name: event.target.value })} placeholder="e.g. Chinedu Okafor" className={`${input} mt-2`} /></label><label className="text-sm font-semibold text-slate-700">Email address<input required type="email" value={registration.email} onChange={(event) => setRegistration({ ...registration, email: event.target.value })} placeholder="patient@example.com" className={`${input} mt-2`} /></label><label className="text-sm font-semibold text-slate-700">Phone number<input required value={registration.phone} onChange={(event) => setRegistration({ ...registration, phone: event.target.value })} placeholder="e.g. 09026787124" className={`${input} mt-2`} /></label><label className="text-sm font-semibold text-slate-700">Date of birth<input type="date" value={registration.date_of_birth} onChange={(event) => setRegistration({ ...registration, date_of_birth: event.target.value })} className={`${input} mt-2`} /></label><label className="text-sm font-semibold text-slate-700">Gender<input value={registration.gender} onChange={(event) => setRegistration({ ...registration, gender: event.target.value })} placeholder="e.g. Female" className={`${input} mt-2`} /></label><label className="text-sm font-semibold text-slate-700">Blood group<input value={registration.blood_group} onChange={(event) => setRegistration({ ...registration, blood_group: event.target.value })} placeholder="e.g. O+" className={`${input} mt-2`} /></label><label className="text-sm font-semibold text-slate-700">Next of kin<input value={registration.next_of_kin} onChange={(event) => setRegistration({ ...registration, next_of_kin: event.target.value })} placeholder="Full name" className={`${input} mt-2`} /></label><label className="text-sm font-semibold text-slate-700">Next of kin phone<input value={registration.next_of_kin_phone} onChange={(event) => setRegistration({ ...registration, next_of_kin_phone: event.target.value })} placeholder="Phone number" className={`${input} mt-2`} /></label><label className="text-sm font-semibold text-slate-700 sm:col-span-2">Contact address<input value={registration.contact_address} onChange={(event) => setRegistration({ ...registration, contact_address: event.target.value })} placeholder="Residential address" className={`${input} mt-2`} /></label><label className="text-sm font-semibold text-slate-700 sm:col-span-2">Known allergies<textarea value={registration.known_allergies} onChange={(event) => setRegistration({ ...registration, known_allergies: event.target.value })} placeholder="List allergies or write None" className={`${input} mt-2 min-h-24`} /></label><div className="flex justify-end gap-3 pt-3 sm:col-span-2"><button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button><button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/15 hover:bg-blue-700">Register patient</button></div></form></div></div>}
  </div>;
}
