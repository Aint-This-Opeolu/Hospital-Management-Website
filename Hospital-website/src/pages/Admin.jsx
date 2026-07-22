import React from 'react';

function getUser(){ try { return JSON.parse(localStorage.getItem('hms_user')); } catch { return null; } }

export default function Admin(){
  const user = getUser();
  const [stats,setStats] = React.useState(null);
  const [appointments,setAppointments] = React.useState([]);

  React.useEffect(()=>{
    fetch('/api/admin/stats').then(r=>r.json()).then(j=>setStats(j));
    fetch('/api/admin/appointments').then(r=>r.json()).then(j=>setAppointments(j.appointments||[]));
  },[]);

  if (!user) return <div className="p-8">Please login as admin via /login</div>;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
          <div className="p-4 bg-white border rounded">Patients<br/>{stats.totalPatients}</div>
          <div className="p-4 bg-white border rounded">Doctors<br/>{stats.totalDoctors}</div>
          <div className="p-4 bg-white border rounded">Appointments<br/>{stats.totalAppointments}</div>
          <div className="p-4 bg-white border rounded">Pending<br/>{stats.pending}</div>
          <div className="p-4 bg-white border rounded">Confirmed<br/>{stats.confirmed}</div>
          <div className="p-4 bg-white border rounded">Cancelled<br/>{stats.cancelled}</div>
          <div className="p-4 bg-white border rounded">Completed<br/>{stats.completed}</div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Appointments</h3>
        <div className="overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left"><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Booked</th><th>Status</th></tr>
            </thead>
            <tbody>
              {appointments.map(a=> (
                <tr key={a.id} className="border-t"><td>{a.patient_name}</td><td>{a.doctor_name}</td><td>{a.appointment_date}</td><td>{a.appointment_time}</td><td>{a.booking_timestamp}</td><td>{a.status}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
