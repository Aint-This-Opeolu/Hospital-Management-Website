const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Create appointment (patient)
router.post('/', (req, res) => {
  const {
    patient_id, patient_name, email, doctor_id, doctor_name,
    appointment_date, appointment_time, reason
  } = req.body;

  const booking_timestamp = new Date().toISOString();
  const status = 'pending';

  const stmt = db.prepare(`INSERT INTO appointments (
    patient_id, patient_name, doctor_id, doctor_name, appointment_date, appointment_time, booking_timestamp, status, reason
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  const info = stmt.run(patient_id || null, patient_name, doctor_id || null, doctor_name || null, appointment_date, appointment_time, booking_timestamp, status, reason || '');

  const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(info.lastInsertRowid);
  res.json({ appointment });
});

// Get appointments (with optional filters)
router.get('/', (req, res) => {
  const { doctor_id, patient_id, status } = req.query;
  let q = 'SELECT * FROM appointments';
  const clauses = [];
  const params = [];
  if (doctor_id) { clauses.push('doctor_id = ?'); params.push(doctor_id); }
  if (patient_id) { clauses.push('patient_id = ?'); params.push(patient_id); }
  if (status) { clauses.push('status = ?'); params.push(status); }
  if (clauses.length) q += ' WHERE ' + clauses.join(' AND ');
  q += ' ORDER BY booking_timestamp DESC';
  const stmt = db.prepare(q);
  const rows = stmt.all(...params);
  res.json({ appointments: rows });
});

// Update appointment status or notes
router.patch('/:id', (req, res) => {
  const id = req.params.id;
  const { status, consultation_notes } = req.body;
  const updates = [];
  const params = [];
  if (status) { updates.push('status = ?'); params.push(status); }
  if (consultation_notes !== undefined) { updates.push('consultation_notes = ?'); params.push(consultation_notes); }
  if (!updates.length) return res.status(400).json({ error: 'no updates provided' });
  params.push(id);
  const q = `UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`;
  db.prepare(q).run(...params);
  const appt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
  res.json({ appointment: appt });
});

module.exports = router;
