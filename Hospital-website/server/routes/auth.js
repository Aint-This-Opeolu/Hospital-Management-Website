const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Very small auth simulation: login by email and role (patient/doctor/admin)
router.post('/login', (req, res) => {
  const { email, name, role, doctor_id } = req.body;
  if (!email || !role) return res.status(400).json({ error: 'email and role required' });

  if (role === 'patient') {
    // ensure patient exists
    const p = db.prepare('SELECT * FROM patients WHERE email = ?').get(email);
    if (!p) {
      const info = db.prepare('INSERT INTO patients (name, email) VALUES (?, ?)').run(name || email.split('@')[0], email);
      const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(info.lastInsertRowid);
      return res.json({ user: { id: patient.id, name: patient.name, email: patient.email, role: 'patient' } });
    }
    return res.json({ user: { id: p.id, name: p.name, email: p.email, role: 'patient' } });
  }

  if (role === 'doctor') {
    const d = db.prepare('SELECT * FROM doctors WHERE id = ?').get(doctor_id);
    if (!d) return res.status(404).json({ error: 'doctor not found' });
    return res.json({ user: { id: d.id, name: d.name, role: 'doctor' } });
  }

  if (role === 'admin') {
    // simple admin auto-login
    return res.json({ user: { id: 'admin', name: name || 'Administrator', role: 'admin' } });
  }

  res.status(400).json({ error: 'invalid role' });
});

module.exports = router;
