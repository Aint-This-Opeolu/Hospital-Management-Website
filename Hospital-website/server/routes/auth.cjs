const express = require('express');
const router = express.Router();
const { db } = require('../db.cjs');
const { hashPassword, createToken, verifyToken } = require('../auth.cjs');

router.post('/login', (req, res) => {
  const { email, password, name, role, doctor_id } = req.body;
  if (!email || !password || !role) return res.status(400).json({ error: 'email, password and role required' });

  const passwordHash = hashPassword(password);

  if (role === 'patient') {
    let patient = db.prepare('SELECT * FROM patients WHERE email = ?').get(email);
    let user = db.prepare('SELECT * FROM users WHERE email = ? AND role = ?').get(email, 'patient');

    if (!patient) {
      const info = db.prepare('INSERT INTO patients (name, email) VALUES (?, ?)').run(name || email.split('@')[0], email);
      patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(info.lastInsertRowid);
    }

    if (!user) {
      db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run(patient.name || name || email.split('@')[0], email, passwordHash, 'patient');
      user = db.prepare('SELECT * FROM users WHERE email = ? AND role = ?').get(email, 'patient');
    }

    if (user.password_hash !== passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = createToken({ id: patient.id, email, role: 'patient', name: patient.name });
    return res.json({ user: { id: patient.id, name: patient.name, email, role: 'patient' }, token });
  }

  if (role === 'doctor') {
    const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(doctor_id);
    if (!doctor) return res.status(404).json({ error: 'doctor not found' });

    let user = db.prepare('SELECT * FROM users WHERE email = ? AND role = ?').get(doctor.email || `${doctor.id}@hms.local`, 'doctor');
    if (!user) {
      db.prepare('INSERT INTO users (name, email, password_hash, role, doctor_id) VALUES (?, ?, ?, ?, ?)').run(doctor.name, doctor.email || `${doctor.id}@hms.local`, passwordHash, 'doctor', doctor.id);
      user = db.prepare('SELECT * FROM users WHERE email = ? AND role = ?').get(doctor.email || `${doctor.id}@hms.local`, 'doctor');
    }

    if (user.password_hash !== passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = createToken({ id: doctor.id, email: doctor.email || `${doctor.id}@hms.local`, role: 'doctor', doctor_id: doctor.id, name: doctor.name });
    return res.json({ user: { id: doctor.id, name: doctor.name, role: 'doctor' }, token });
  }

  if (role === 'admin') {
    const adminEmail = email || 'admin@hms.local';
    let user = db.prepare('SELECT * FROM users WHERE email = ? AND role = ?').get(adminEmail, 'admin');
    if (!user) {
      db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run(name || 'Administrator', adminEmail, passwordHash, 'admin');
      user = db.prepare('SELECT * FROM users WHERE email = ? AND role = ?').get(adminEmail, 'admin');
    }

    if (user.password_hash !== passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

    const token = createToken({ id: 'admin', email: adminEmail, role: 'admin', name: name || 'Administrator' });
    return res.json({ user: { id: 'admin', name: name || 'Administrator', role: 'admin' }, token });
  }

  res.status(400).json({ error: 'invalid role' });
});

router.get('/me', (req, res) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ user: decoded });
});

module.exports = router;
