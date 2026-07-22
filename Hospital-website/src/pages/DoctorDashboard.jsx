import React from 'react';

function getUser(){ try { return JSON.parse(localStorage.getItem('hms_user')); } catch { return null; } }

export default function DoctorDashboard(){
  const user = getUser();
  const [appointments, setAppointments] = React.useState([]);

  React.useEffect(()=>{
    if (!user) return;
    fetch(`/api/appointments?doctor_id=${user.id}`).then(r=>r.json()).then(j=>setAppointments(j.appointments || []));
  }, [user]);

  if (!user) return <div className="p-8">Please login as doctor via /login</div>;

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Doctor Dashboard — {user.name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white border rounded">Total<br/>{appointments.length}</div>
        <div className="p-4 bg-white border rounded">Pending<br/>{appointments.filter(a=>a.status==='pending').length}</div>
        <div className="p-4 bg-white border rounded">Confirmed<br/>{appointments.filter(a=>a.status==='confirmed').length}</div>
        <div className="p-4 bg-white border rounded">Completed<br/>{appointments.filter(a=>a.status==='completed').length}</div>
      </div>

      <div className="space-y-4">
        {appointments.map(a=> (
          <div key={a.id} className="p-4 border rounded">
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold">{a.patient_name}</h3>
                <p className="text-sm text-slate-500">{a.reason}</p>
                <p className="text-sm text-slate-400">Booked: {a.booking_timestamp}</p>
              </div>
              <div className="text-right space-y-2">
                <p>{a.appointment_date} {a.appointment_time}</p>
                <p className="text-sm">Status: {a.status}</p>
                <div className="flex gap-2 justify-end">
                  {a.status==='pending' && <button onClick={async()=>{ await fetch(`/api/appointments/${a.id}`, {method:'PATCH', headers:{'content-type':'application/json'}, body:JSON.stringify({status:'confirmed'})}); const res=await fetch(`/api/appointments?doctor_id=${user.id}`); setAppointments((await res.json()).appointments); }} className="px-3 py-1 bg-emerald-600 text-white rounded">Accept</button>}
                  {a.status==='pending' && <button onClick={async()=>{ await fetch(`/api/appointments/${a.id}`, {method:'PATCH', headers:{'content-type':'application/json'}, body:JSON.stringify({status:'declined'})}); const res=await fetch(`/api/appointments?doctor_id=${user.id}`); setAppointments((await res.json()).appointments); }} className="px-3 py-1 bg-red-600 text-white rounded">Decline</button>}
                  {a.status==='confirmed' && <button onClick={async()=>{ await fetch(`/api/appointments/${a.id}`, {method:'PATCH', headers:{'content-type':'application/json'}, body:JSON.stringify({status:'completed'})}); const res=await fetch(`/api/appointments?doctor_id=${user.id}`); setAppointments((await res.json()).appointments); }} className="px-3 py-1 bg-blue-600 text-white rounded">Mark Completed</button>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
