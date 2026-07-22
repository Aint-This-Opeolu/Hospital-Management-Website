const express = require('express');
const router = express.Router();
const { db } = require('../db');

router.get('/stats', (req, res) => {
  const totalPatients = db.prepare('SELECT COUNT(*) AS cnt FROM patients').get().cnt;
  const totalDoctors = db.prepare('SELECT COUNT(*) AS cnt FROM doctors').get().cnt;
  const totalAppointments = db.prepare('SELECT COUNT(*) AS cnt FROM appointments').get().cnt;
  const pending = db.prepare("SELECT COUNT(*) AS cnt FROM appointments WHERE status='pending'").get().cnt;
  const confirmed = db.prepare("SELECT COUNT(*) AS cnt FROM appointments WHERE status='confirmed'").get().cnt;
  const cancelled = db.prepare("SELECT COUNT(*) AS cnt FROM appointments WHERE status='declined'").get().cnt;
  const completed = db.prepare("SELECT COUNT(*) AS cnt FROM appointments WHERE status='completed'").get().cnt;

  res.json({ totalPatients, totalDoctors, totalAppointments, pending, confirmed, cancelled, completed });
});

router.get('/appointments', (req, res) => {
  // reuse appointments endpoint logic for admin
  const rows = db.prepare('SELECT * FROM appointments ORDER BY booking_timestamp DESC').all();
  res.json({ appointments: rows });
});

router.get('/doctors', (req, res) => {
  const rows = db.prepare('SELECT * FROM doctors').all();
  res.json({ doctors: rows });
});

router.post('/doctors', (req, res) => {
  const { id, name, specialization } = req.body;
  if (!id || !name) return res.status(400).json({ error: 'id and name required' });
  db.prepare('INSERT INTO doctors (id, name, specialization) VALUES (?, ?, ?)').run(id, name, specialization || 'General');
  res.json({ ok: true });
});

router.delete('/doctors/:id', (req, res) => {
  db.prepare('DELETE FROM doctors WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

router.get('/patients', (req, res) => {
  const rows = db.prepare('SELECT * FROM patients').all();
  res.json({ patients: rows });
});

module.exports = router;
