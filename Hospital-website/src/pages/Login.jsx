import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [role, setRole] = React.useState('patient');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [doctorId, setDoctorId] = React.useState('1');
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    const payload = { role, name, email, doctor_id: doctorId };
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    const json = await res.json();
    if (json.user) {
      localStorage.setItem('hms_user', JSON.stringify(json.user));
      if (json.user.role === 'admin') nav('/admin');
      else if (json.user.role === 'doctor') nav('/doctor');
      else nav('/patient');
    } else {
      alert('Login failed');
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Login / Impersonate</h2>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold">Role</label>
          <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-3 py-2 border rounded">
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {role === 'patient' && (
          <>
            <div>
              <label className="block text-sm font-semibold">Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold">Email</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
          </>
        )}

        {role === 'doctor' && (
          <div>
            <label className="block text-sm font-semibold">Doctor ID</label>
            <input value={doctorId} onChange={e=>setDoctorId(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
        )}

        <div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Login</button>
        </div>
      </form>
    </div>
  );
}
