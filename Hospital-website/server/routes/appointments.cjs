const express = require('express');
const router = express.Router();
const { prisma } = require('../db.cjs');
const { authMiddleware } = require('../auth.cjs');
router.use(authMiddleware(['patient', 'doctor', 'nurse', 'reception', 'admin']));

const shape = (appointment) => ({ ...appointment, booking_timestamp: appointment.bookingTimestamp?.toISOString(), appointment_date: appointment.appointmentDate, appointment_time: appointment.appointmentTime, patient_id: appointment.patientId, doctor_id: appointment.doctorId, patient_name: appointment.patientName, doctor_name: appointment.doctorName, consultation_notes: appointment.consultationNotes });

router.post('/', async (req, res, next) => {
  try {
    const { patient_name, doctor_id, doctor_name, appointment_date, appointment_time, reason } = req.body;
    if (!patient_name || !appointment_date || !appointment_time) return res.status(400).json({ error: 'patient_name, appointment_date and appointment_time are required' });
    if (!['patient', 'reception', 'admin'].includes(req.user.role)) return res.status(403).json({ error: 'Only patients or reception staff can schedule appointments' });
    const doctor = doctor_id ? await prisma.doctor.findUnique({ where: { id: doctor_id } }) : null;
    const existing = doctor_id && await prisma.appointment.findFirst({ where: { doctorId: doctor_id, appointmentDate: appointment_date, appointmentTime: appointment_time, status: { notIn: ['cancelled', 'declined'] } } });
    if (existing) return res.status(409).json({ error: 'The doctor is already booked for that time' });
    const appointment = await prisma.appointment.create({ data: { patientId: req.user.role === 'patient' ? req.user.id : (req.body.patient_id || null), patientName: patient_name, doctorId: doctor_id || null, doctorName: doctor_name || doctor?.name || null, appointmentDate: appointment_date, appointmentTime: appointment_time, status: 'pending', reason: reason || '', createdBy: req.user.user_id || req.user.id } });
    res.status(201).json({ appointment: shape(appointment) });
  } catch (error) { next(error); }
});

router.get('/', async (req, res, next) => {
  try {
    const where = {};
    if (req.user.role === 'doctor') where.doctorId = req.user.doctor_id || String(req.user.id);
    if (req.user.role === 'patient') where.patientId = req.user.id;
    if (req.query.doctor_id) where.doctorId = req.query.doctor_id;
    if (req.query.patient_id) where.patientId = Number(req.query.patient_id);
    if (req.query.status) where.status = req.query.status;
    if (req.query.search) where.OR = [{ patientName: { contains: req.query.search, mode: 'insensitive' } }, { doctorName: { contains: req.query.search, mode: 'insensitive' } }, { reason: { contains: req.query.search, mode: 'insensitive' } }];
    const appointments = await prisma.appointment.findMany({ where, orderBy: { bookingTimestamp: 'desc' } });
    res.json({ appointments: appointments.map(shape) });
  } catch (error) { next(error); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'appointment not found' });
    if (req.user.role === 'doctor' && existing.doctorId !== (req.user.doctor_id || String(req.user.id))) return res.status(403).json({ error: 'Forbidden' });
    if (req.user.role === 'patient' && existing.patientId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    const data = {};
    for (const [input, output] of [['status', 'status'], ['consultation_notes', 'consultationNotes'], ['appointment_date', 'appointmentDate'], ['appointment_time', 'appointmentTime']]) if (req.body[input] !== undefined) data[output] = req.body[input];
    if (!Object.keys(data).length) return res.status(400).json({ error: 'no updates provided' });
    res.json({ appointment: shape(await prisma.appointment.update({ where: { id }, data })) });
  } catch (error) { next(error); }
});
module.exports = router;
