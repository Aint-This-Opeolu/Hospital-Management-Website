const express = require('express');
const router = express.Router();
const { prisma } = require('../db.cjs');
const { hashPassword } = require('../auth.cjs');
const { recordActivity } = require('../activity.cjs');

router.get('/stats', async (req, res, next) => {
  try {
    const [totalPatients, totalDoctors, totalAppointments, totalUsers, pending, confirmed, cancelled, completed] = await Promise.all([
      prisma.patient.count(), prisma.doctor.count(), prisma.appointment.count(), prisma.user.count({ where: { active: true } }),
      prisma.appointment.count({ where: { status: 'pending' } }), prisma.appointment.count({ where: { status: 'confirmed' } }),
      prisma.appointment.count({ where: { status: 'declined' } }), prisma.appointment.count({ where: { status: 'completed' } })
    ]);
    res.json({ totalPatients, totalDoctors, totalAppointments, totalUsers, pending, confirmed, cancelled, completed });
  } catch (error) { next(error); }
});

router.get('/appointments', async (req, res, next) => { try { res.json({ appointments: await prisma.appointment.findMany({ orderBy: { bookingTimestamp: 'desc' } }) }); } catch (error) { next(error); } });
router.get('/doctors', async (req, res, next) => { try { res.json({ doctors: await prisma.doctor.findMany() }); } catch (error) { next(error); } });
router.post('/doctors', async (req, res, next) => { try { const { id, name, specialization, email } = req.body; if (!id || !name) return res.status(400).json({ error: 'id and name required' }); res.status(201).json({ doctor: await prisma.doctor.create({ data: { id, name, specialization: specialization || 'General', email } }) }); } catch (error) { next(error); } });
router.delete('/doctors/:id', async (req, res, next) => { try { await prisma.doctor.delete({ where: { id: req.params.id } }); res.json({ ok: true }); } catch (error) { next(error); } });
router.get('/patients', async (req, res, next) => { try { res.json({ patients: await prisma.patient.findMany({ orderBy: { registrationDate: 'desc' } }) }); } catch (error) { next(error); } });
router.get('/users', async (req, res, next) => { try { const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, doctorId: true, phone: true, dateCreated: true, lastLogin: true, active: true }, orderBy: { dateCreated: 'desc' } }); res.json({ users }); } catch (error) { next(error); } });
router.get('/activity-logs', async (req, res, next) => { try { const logs = await prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }); res.json({ logs }); } catch (error) { next(error); } });

router.post('/users', async (req, res, next) => {
  try {
    const { name, email, password, role, doctor_id, phone } = req.body;
    if (!name || !email || !password || !['admin', 'doctor', 'nurse', 'reception'].includes(role)) return res.status(400).json({ error: 'name, email, password and valid staff role are required' });
    const user = await prisma.user.create({ data: { name, email: email.trim().toLowerCase(), passwordHash: hashPassword(password), role, doctorId: doctor_id || null, phone } });
    if (role === 'doctor') await prisma.doctor.upsert({ where: { id: doctor_id || `staff-${user.id}` }, update: { name, email: user.email }, create: { id: doctor_id || `staff-${user.id}`, name, email: user.email, specialization: 'General Medicine' } });
    await recordActivity({ user: req.user, action: 'CREATE', entity: 'User', entityId: user.id, details: `Created ${role} account for ${name}` });
    res.status(201).json({ user });
  } catch (error) { res.status(409).json({ error: 'A user with that email already exists' }); }
});

router.patch('/users/:id', async (req, res, next) => { try { if (typeof req.body.active !== 'boolean') return res.status(400).json({ error: 'active must be boolean' }); await prisma.user.update({ where: { id: Number(req.params.id) }, data: { active: req.body.active } }); await recordActivity({ user: req.user, action: 'UPDATE', entity: 'User', entityId: req.params.id, details: `Account ${req.body.active ? 'activated' : 'disabled'}` }); res.json({ ok: true }); } catch (error) { next(error); } });
router.get('/reports', async (req, res, next) => {
  try {
    const from = req.query.from || '2000-01-01'; const to = req.query.to || '2999-12-31';
    const [attendance, doctorLoad] = await Promise.all([
      prisma.$queryRaw`SELECT appointment_date, COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status = 'completed')::int AS completed, COUNT(*) FILTER (WHERE status IN ('cancelled', 'declined'))::int AS cancelled FROM appointments WHERE appointment_date BETWEEN ${from} AND ${to} GROUP BY appointment_date ORDER BY appointment_date`,
      prisma.$queryRaw`SELECT COALESCE(doctor_name, 'Unassigned') AS doctor_name, COUNT(*)::int AS consultations FROM appointments WHERE appointment_date BETWEEN ${from} AND ${to} GROUP BY doctor_name ORDER BY consultations DESC`
    ]);
    res.json({ attendance, doctorLoad, generatedAt: new Date().toISOString() });
  } catch (error) { next(error); }
});
module.exports = router;
