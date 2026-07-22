const express = require('express');
const router = express.Router();
const { db } = require('../db.cjs');
const { verifyToken } = require('../auth.cjs');

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' });
  req.user = decoded;
  next();
}

router.use(requireAuth);

router.post('/', (req, res) => {
  const { patient_name, doctor_id, doctor_name, appointment_date, appointment_time, reason } = req.body;
  const booking_timestamp = new Date().toISOString();
  const status = 'pending';
  const user = req.user;

  if (!patient_name || !appointment_date || !appointment_time) {
    return res.status(400).json({ error: 'patient_name, appointment_date and appointment_time are required' });
  }

  let doctorNameFinal = doctor_name || null;
  if (doctor_id && !doctorNameFinal) {
    const d = db.prepare('SELECT name FROM doctors WHERE id = ?').get(doctor_id);
    if (d) doctorNameFinal = d.name;
  }

  const patientId = user.role === 'patient' ? user.id : null;
  const stmt = db.prepare(`INSERT INTO appointments (patient_id, patient_name, doctor_id, doctor_name, appointment_date, appointment_time, booking_timestamp, status, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const info = stmt.run(patientId, patient_name, doctor_id || null, doctorNameFinal, appointment_date, appointment_time, booking_timestamp, status, reason || '');
  const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(info.lastInsertRowid);
  res.json({ appointment });
});

router.get('/', (req, res) => {
  const { doctor_id, patient_id, status, search } = req.query;
  const user = req.user;
  let q = 'SELECT * FROM appointments';
  const clauses = [];
  const params = [];

  if (user.role === 'doctor') {
    clauses.push('doctor_id = ?');
    params.push(user.doctor_id || user.id);
  } else if (user.role === 'patient') {
    clauses.push('patient_id = ?');
    params.push(user.id);
  }

  if (doctor_id) { clauses.push('doctor_id = ?'); params.push(doctor_id); }
  if (patient_id) { clauses.push('patient_id = ?'); params.push(patient_id); }
  if (status) { clauses.push('status = ?'); params.push(status); }
  if (search) {
    clauses.push('(patient_name LIKE ? OR doctor_name LIKE ? OR reason LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (clauses.length) q += ' WHERE ' + clauses.join(' AND ');
  q += ' ORDER BY booking_timestamp DESC';
  const stmt = db.prepare(q);
  const rows = stmt.all(...params);
  res.json({ appointments: rows });
});

router.patch('/:id', (req, res) => {
  const id = req.params.id;
  const { status, consultation_notes, appointment_date, appointment_time } = req.body;
  const user = req.user;
  const existing = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'appointment not found' });

  if (user.role === 'doctor' && existing.doctor_id !== (user.doctor_id || user.id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (user.role === 'patient' && existing.patient_id !== user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const updates = [];
  const params = [];
  if (status) { updates.push('status = ?'); params.push(status); }
  if (consultation_notes !== undefined) { updates.push('consultation_notes = ?'); params.push(consultation_notes); }
  if (appointment_date) { updates.push('appointment_date = ?'); params.push(appointment_date); }
  if (appointment_time) { updates.push('appointment_time = ?'); params.push(appointment_time); }
  if (!updates.length) return res.status(400).json({ error: 'no updates provided' });
  params.push(id);
  const q = `UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`;
  db.prepare(q).run(...params);
  const appt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
  res.json({ appointment: appt });
});

module.exports = router;
