import React from 'react';
import { Link } from 'react-router-dom';
import { api, getStoredUser } from '../utils/api';
import AdminDashboardPage from './AdminDashboard';
import ReceptionDashboardPage from './ReceptionDashboard';

const card = 'bg-white border border-slate-100 rounded-2xl p-5 shadow-sm';

function Metric({ label, value }) {
  return <div className={card}><p className="text-sm text-slate-500">{label}</p><p className="text-3xl font-bold text-slate-900 mt-2">{value}</p></div>;
}

function AppointmentList({ appointments, onUpdate }) {
  return <div className="space-y-3">{appointments.map((appointment) => <div key={appointment.id} className="border rounded-xl p-4 flex flex-wrap gap-3 justify-between"><div><p className="font-semibold">{appointment.patient_name || appointment.doctor_name || 'Appointment'}</p><p className="text-sm text-slate-500">{appointment.appointment_date} at {appointment.appointment_time} · {appointment.reason || 'General consultation'}</p></div><div className="flex items-center gap-2"><span className="text-sm capitalize text-slate-500">{appointment.status}</span>{onUpdate && appointment.status === 'pending' && <><button onClick={() => onUpdate(appointment.id, 'confirmed')} className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-sm">Approve</button><button onClick={() => onUpdate(appointment.id, 'declined')} className="px-3 py-1 rounded-lg bg-rose-600 text-white text-sm">Decline</button></>}</div></div>)}{appointments.length === 0 && <p className="text-slate-500">No records found.</p>}</div>;
}

function PatientDashboard({ user }) {
  const [appointments, setAppointments] = React.useState([]);
  React.useEffect(() => { api('/api/appointments').then((data) => setAppointments(data.appointments || [])).catch(() => {}); }, []);
  return <><Header title={`Welcome, ${user.name}`} subtitle="Your appointments and care journey" /><div className="grid md:grid-cols-3 gap-4 mb-8"><Metric label="Total appointments" value={appointments.length} /><Metric label="Upcoming" value={appointments.filter((item) => ['pending', 'confirmed'].includes(item.status)).length} /><Metric label="Completed visits" value={appointments.filter((item) => item.status === 'completed').length} /></div><section className={card}><div className="flex justify-between items-center mb-4"><h2 className="font-bold text-xl">My appointments</h2><Link to="/appointment" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Request appointment</Link></div><AppointmentList appointments={appointments.map((item) => ({ ...item, patient_name: item.doctor_name || 'Unassigned' }))} /></section></>;
}

function DoctorDashboard({ user }) {
  const [appointments, setAppointments] = React.useState([]);
  const [patients, setPatients] = React.useState([]);
  const [consultation, setConsultation] = React.useState({ patient_id: '', diagnosis: '', presenting_complaint: '', clinical_findings: '', treatment_prescribed: '', notes: '' });
  const [message, setMessage] = React.useState('');
  const load = React.useCallback(() => Promise.all([api('/api/appointments'), api('/api/clinical/patients')]).then(([a, p]) => { setAppointments(a.appointments || []); setPatients(p.patients || []); }), []);
  React.useEffect(() => { load().catch(() => {}); }, [load]);
  async function saveConsultation(event) { event.preventDefault(); try { await api('/api/clinical/consultations', { method: 'POST', body: JSON.stringify(consultation) }); setMessage('Consultation saved.'); setConsultation({ patient_id: '', diagnosis: '', presenting_complaint: '', clinical_findings: '', treatment_prescribed: '', notes: '' }); load(); } catch (error) { setMessage(error.message); } }
  return <><Header title={`Doctor dashboard`} subtitle={`${user.name} · Today’s schedule and clinical records`} /><div className="grid md:grid-cols-4 gap-4 mb-8"><Metric label="Today's schedule" value={appointments.length} /><Metric label="Pending requests" value={appointments.filter((item) => item.status === 'pending').length} /><Metric label="Completed" value={appointments.filter((item) => item.status === 'completed').length} /><Metric label="Patients" value={patients.length} /></div><div className="grid lg:grid-cols-2 gap-6"><section className={card}><h2 className="font-bold text-xl mb-4">Today's schedule</h2><AppointmentList appointments={appointments} onUpdate={async (id, status) => { await api(`/api/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); load(); }} /></section><section className={card}><h2 className="font-bold text-xl mb-4">Record consultation</h2><form onSubmit={saveConsultation} className="space-y-3"><select required value={consultation.patient_id} onChange={(event) => setConsultation({ ...consultation, patient_id: event.target.value })} className="w-full border rounded-lg p-2"><option value="">Select patient</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}</select><input required placeholder="Diagnosis" value={consultation.diagnosis} onChange={(event) => setConsultation({ ...consultation, diagnosis: event.target.value })} className="w-full border rounded-lg p-2" /><textarea placeholder="Presenting complaint and clinical findings" value={consultation.clinical_findings} onChange={(event) => setConsultation({ ...consultation, clinical_findings: event.target.value })} className="w-full border rounded-lg p-2" rows="3" /><textarea placeholder="Treatment prescribed and notes" value={consultation.treatment_prescribed} onChange={(event) => setConsultation({ ...consultation, treatment_prescribed: event.target.value })} className="w-full border rounded-lg p-2" rows="3" /><button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save consultation</button>{message && <p className="text-sm text-slate-500">{message}</p>}</form></section></div></>;
}

function DoctorWorkspace({ user }) {
  const [appointments, setAppointments] = React.useState([]);
  const [patients, setPatients] = React.useState([]);
  const [selectedPatient, setSelectedPatient] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [consultation, setConsultation] = React.useState({ diagnosis: '', presenting_complaint: '', clinical_findings: '', treatment_prescribed: '', notes: '' });

  async function loadWorkspace() {
    const [appointmentData, patientData] = await Promise.all([api('/api/appointments'), api('/api/clinical/patients')]);
    setAppointments(appointmentData.appointments || []);
    setPatients(patientData.patients || []);
  }

  React.useEffect(() => { loadWorkspace().catch(() => {}); }, []);

  async function updateAppointment(id, status) {
    await api(`/api/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    loadWorkspace();
  }

  async function saveConsultation(event) {
    event.preventDefault();
    try {
      await api('/api/clinical/consultations', { method: 'POST', body: JSON.stringify({ ...consultation, patient_id: selectedPatient }) });
      setMessage('Consultation saved to the patient record.');
      setSelectedPatient('');
      setConsultation({ diagnosis: '', presenting_complaint: '', clinical_findings: '', treatment_prescribed: '', notes: '' });
      loadWorkspace();
    } catch (error) { setMessage(error.message); }
  }

  return <div className="space-y-8">
    <Header title="Doctor workspace" subtitle={`${user.name} · Clinical overview and consultation records`} />
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Metric label="Today’s patients" value={appointments.length} />
      <Metric label="Awaiting decision" value={appointments.filter((item) => item.status === 'pending').length} />
      <Metric label="Completed visits" value={appointments.filter((item) => item.status === 'completed').length} />
      <Metric label="Patient records" value={patients.length} />
    </div>
    <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5"><div><h2 className="text-xl font-bold text-slate-900">Today’s schedule</h2><p className="mt-1 text-sm text-slate-500">Review and manage your consultation queue.</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{appointments.length} visits</span></div>
        <div className="divide-y divide-slate-100">{appointments.map((appointment) => <div key={appointment.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-5"><div className="flex items-center gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700">{(appointment.patient_name || 'P').slice(0, 1)}</div><div><p className="font-bold text-slate-900">{appointment.patient_name || 'Patient visit'}</p><p className="mt-1 text-sm text-slate-500">{appointment.appointment_time} · {appointment.reason || 'General consultation'}</p></div></div><div className="flex items-center gap-2"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">{appointment.status}</span>{appointment.status === 'pending' && <><button onClick={() => updateAppointment(appointment.id, 'confirmed')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Accept</button><button onClick={() => updateAppointment(appointment.id, 'declined')} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600">Decline</button></>}</div></div>)}{appointments.length === 0 && <div className="px-6 py-14 text-center"><p className="font-semibold text-slate-700">Your schedule is clear</p><p className="mt-1 text-sm text-slate-500">New appointment requests will appear here.</p></div>}</div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5"><h2 className="text-xl font-bold text-slate-900">Record consultation</h2><p className="mt-1 text-sm text-slate-500">Document findings securely in the patient record.</p></div><form onSubmit={saveConsultation} className="space-y-3"><select required value={selectedPatient} onChange={(event) => setSelectedPatient(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"><option value="">Select patient</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}</select><input required placeholder="Diagnosis" value={consultation.diagnosis} onChange={(event) => setConsultation({ ...consultation, diagnosis: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /><textarea placeholder="Presenting complaint" value={consultation.presenting_complaint} onChange={(event) => setConsultation({ ...consultation, presenting_complaint: event.target.value })} className="min-h-20 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /><textarea placeholder="Clinical findings" value={consultation.clinical_findings} onChange={(event) => setConsultation({ ...consultation, clinical_findings: event.target.value })} className="min-h-20 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /><textarea placeholder="Treatment prescribed and notes" value={consultation.treatment_prescribed} onChange={(event) => setConsultation({ ...consultation, treatment_prescribed: event.target.value })} className="min-h-20 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /><button className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700">Save consultation</button>{message && <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">{message}</p>}</form></section>
    </div>
  </div>;
}

function NurseDashboard({ user }) {
  const [patients, setPatients] = React.useState([]);
  const [form, setForm] = React.useState({ patient_id: '', temperature: '', blood_pressure: '', pulse: '', respiratory_rate: '', notes: '' });
  const [message, setMessage] = React.useState('');
  React.useEffect(() => { api('/api/clinical/patients').then((data) => setPatients(data.patients || [])).catch(() => {}); }, []);
  async function save(event) { event.preventDefault(); try { await api('/api/clinical/observations', { method: 'POST', body: JSON.stringify(form) }); setMessage('Observation recorded.'); } catch (error) { setMessage(error.message); } }
  return <><Header title="Nurse dashboard" subtitle={`${user.name} · Record ward observations`} /><div className="grid lg:grid-cols-2 gap-6"><section className={card}><h2 className="font-bold text-xl mb-4">Assigned patients</h2>{patients.map((patient) => <div key={patient.id} className="border-b py-3"><p className="font-semibold">{patient.name}</p><p className="text-sm text-slate-500">{patient.phone || patient.email}</p></div>)}</section><section className={card}><h2 className="font-bold text-xl mb-4">Record observations</h2><form onSubmit={save} className="grid sm:grid-cols-2 gap-3"><select required value={form.patient_id} onChange={(event) => setForm({ ...form, patient_id: event.target.value })} className="border rounded-lg p-2 sm:col-span-2"><option value="">Select patient</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}</select>{['temperature', 'blood_pressure', 'pulse', 'respiratory_rate'].map((field) => <input key={field} placeholder={field.replace('_', ' ')} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} className="border rounded-lg p-2" />)}<textarea placeholder="Nursing notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="border rounded-lg p-2 sm:col-span-2" /><button className="px-4 py-2 bg-blue-600 text-white rounded-lg sm:col-span-2">Save observation</button>{message && <p className="text-sm text-slate-500 sm:col-span-2">{message}</p>}</form></section></div></>;
}

function ReceptionDashboard({ user }) {
  const [appointments, setAppointments] = React.useState([]);
  const [patients, setPatients] = React.useState([]);
  const [registration, setRegistration] = React.useState({ name: '', email: '', phone: '', date_of_birth: '', gender: '', contact_address: '', next_of_kin: '', blood_group: '', known_allergies: '' });
  const [message, setMessage] = React.useState('');
  React.useEffect(() => { Promise.all([api('/api/appointments'), api('/api/clinical/patients')]).then(([a, p]) => { setAppointments(a.appointments || []); setPatients(p.patients || []); }).catch(() => {}); }, []);
  async function register(event) { event.preventDefault(); try { await api('/api/clinical/patients', { method: 'POST', body: JSON.stringify(registration) }); setMessage('Patient registered.'); setRegistration({ name: '', email: '', phone: '', date_of_birth: '', gender: '', contact_address: '', next_of_kin: '', blood_group: '', known_allergies: '' }); const data = await api('/api/clinical/patients'); setPatients(data.patients || []); } catch (error) { setMessage(error.message); } }
  return <><Header title="Reception dashboard" subtitle={`${user.name} · Patient registration and appointment coordination`} /><div className="grid md:grid-cols-4 gap-4 mb-8"><Metric label="Registered patients" value={patients.length} /><Metric label="Appointment requests" value={appointments.filter((item) => item.status === 'pending').length} /><Metric label="Confirmed" value={appointments.filter((item) => item.status === 'confirmed').length} /><Metric label="Completed" value={appointments.filter((item) => item.status === 'completed').length} /></div><div className="grid lg:grid-cols-2 gap-6"><section className={card}><h2 className="font-bold text-xl mb-4">Register patient</h2><form onSubmit={register} className="grid sm:grid-cols-2 gap-3"><input required placeholder="Full name" value={registration.name} onChange={(event) => setRegistration({ ...registration, name: event.target.value })} className="border rounded-lg p-2" /><input required type="email" placeholder="Email" value={registration.email} onChange={(event) => setRegistration({ ...registration, email: event.target.value })} className="border rounded-lg p-2" /><input required placeholder="Phone" value={registration.phone} onChange={(event) => setRegistration({ ...registration, phone: event.target.value })} className="border rounded-lg p-2" /><input type="date" value={registration.date_of_birth} onChange={(event) => setRegistration({ ...registration, date_of_birth: event.target.value })} className="border rounded-lg p-2" /><input placeholder="Gender" value={registration.gender} onChange={(event) => setRegistration({ ...registration, gender: event.target.value })} className="border rounded-lg p-2" /><input placeholder="Blood group" value={registration.blood_group} onChange={(event) => setRegistration({ ...registration, blood_group: event.target.value })} className="border rounded-lg p-2" /><input placeholder="Next of kin" value={registration.next_of_kin} onChange={(event) => setRegistration({ ...registration, next_of_kin: event.target.value })} className="border rounded-lg p-2" /><input placeholder="Address" value={registration.contact_address} onChange={(event) => setRegistration({ ...registration, contact_address: event.target.value })} className="border rounded-lg p-2" /><textarea placeholder="Known allergies" value={registration.known_allergies} onChange={(event) => setRegistration({ ...registration, known_allergies: event.target.value })} className="border rounded-lg p-2 sm:col-span-2" /><button className="px-4 py-2 bg-blue-600 text-white rounded-lg sm:col-span-2">Register patient</button>{message && <p className="text-sm text-slate-500 sm:col-span-2">{message}</p>}</form></section><section className={card}><h2 className="font-bold text-xl mb-4">Manage appointment requests</h2><AppointmentList appointments={appointments} onUpdate={async (id, status) => { await api(`/api/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); setAppointments(appointments.map((item) => item.id === id ? { ...item, status } : item)); }} /></section></div></>;
}

function AdminDashboard({ user }) {
  const [stats, setStats] = React.useState(null);
  const [users, setUsers] = React.useState([]);
  const [form, setForm] = React.useState({ name: '', email: '', password: '', role: 'doctor', doctor_id: '' });
  const [message, setMessage] = React.useState('');
  const load = React.useCallback(() => Promise.all([api('/api/admin/stats'), api('/api/admin/users')]).then(([summary, staff]) => { setStats(summary); setUsers(staff.users || []); }), []);
  React.useEffect(() => { load().catch(() => {}); }, [load]);
  async function createUser(event) { event.preventDefault(); try { await api('/api/admin/users', { method: 'POST', body: JSON.stringify(form) }); setMessage('Credential created.'); setForm({ name: '', email: '', password: '', role: 'doctor', doctor_id: '' }); load(); } catch (error) { setMessage(error.message); } }
  return <><Header title="Administrator dashboard" subtitle={`${user.name} · Hospital operations and access control`} />{stats && <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"><Metric label="Patients" value={stats.totalPatients} /><Metric label="Appointments today" value={stats.totalAppointments} /><Metric label="Pending requests" value={stats.pending} /><Metric label="System users" value={stats.totalUsers || users.length} /></div>}<div className="grid lg:grid-cols-2 gap-6"><section className={card}><h2 className="font-bold text-xl mb-4">Create staff credentials</h2><form onSubmit={createUser} className="space-y-3"><input required placeholder="Full name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full border rounded-lg p-2" /><input required type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full border rounded-lg p-2" /><input required type="password" placeholder="Temporary password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full border rounded-lg p-2" /><select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="w-full border rounded-lg p-2"><option value="doctor">Doctor</option><option value="nurse">Nurse</option><option value="reception">Reception Staff</option><option value="admin">Administrator</option></select>{form.role === 'doctor' && <input placeholder="Doctor ID (optional)" value={form.doctor_id} onChange={(event) => setForm({ ...form, doctor_id: event.target.value })} className="w-full border rounded-lg p-2" />}<button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Create account</button>{message && <p className="text-sm text-slate-500">{message}</p>}</form></section><section className={card}><h2 className="font-bold text-xl mb-4">User management</h2><div className="space-y-2">{users.map((staff) => <div key={staff.id} className="flex justify-between border-b py-2"><div><p className="font-semibold">{staff.name}</p><p className="text-sm text-slate-500">{staff.email} · {staff.role}</p></div><span className={staff.active ? 'text-emerald-600 text-sm' : 'text-rose-600 text-sm'}>{staff.active ? 'Active' : 'Disabled'}</span></div>)}</div></section></div></>;
}

function Header({ title, subtitle }) {
  return <div className="flex flex-wrap justify-between gap-4 items-end mb-8"><div><p className="text-blue-600 font-semibold text-xs uppercase tracking-wide">Kenny Care Hospital</p><h1 className="text-2xl font-bold mt-1">{title}</h1><p className="text-slate-500 mt-1">{subtitle}</p></div></div>;
}

export default function Dashboard() {
  const user = getStoredUser();
  if (!user) return <div className="max-w-3xl mx-auto p-8"><p>Please sign in to continue.</p><Link className="text-blue-600" to="/login">Go to login</Link></div>;
  const dashboards = { admin: AdminDashboardPage, doctor: DoctorWorkspace, nurse: NurseDashboard, reception: ReceptionDashboardPage, patient: PatientDashboard };
  const DashboardView = dashboards[user.role] || PatientDashboard;
  return <div className="max-w-7xl mx-auto p-6 md:p-10"><DashboardView user={user} /></div>;
}
