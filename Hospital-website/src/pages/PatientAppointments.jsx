import React from 'react';

function getUser() {
  try { return JSON.parse(localStorage.getItem('hms_user')); } catch { return null; }
}

export default function PatientAppointments() {
  const [appointments, setAppointments] = React.useState([]);
  const user = getUser();

  React.useEffect(() => {
    if (!user) return;
    fetch(`/api/appointments?patient_id=${user.id}`).then(r=>r.json()).then(j=>setAppointments(j.appointments || []));
  }, [user]);

  if (!user) return <div className="p-8">Please login as patient via /login</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">My Appointments</h2>
      <div className="space-y-4">
        {appointments.map(a => (
          <div key={a.id} className="p-4 border rounded">
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold">{a.doctor_name || 'Unassigned'}</h3>
                <p className="text-sm text-slate-500">{a.reason}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{a.appointment_date} {a.appointment_time}</p>
                <p className="text-sm text-slate-500">Status: {a.status}</p>
              </div>
            </div>
          </div>
        ))}
        {appointments.length === 0 && <p className="text-slate-500">No appointments yet.</p>}
      </div>
    </div>
  );
}
