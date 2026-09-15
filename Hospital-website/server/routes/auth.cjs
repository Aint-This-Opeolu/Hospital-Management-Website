const express = require('express');
const router = express.Router();
const { prisma } = require('../db.cjs');
const { hashPassword, createToken, verifyToken, authMiddleware } = require('../auth.cjs');
const { recordActivity } = require('../activity.cjs');

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const user = await prisma.user.findFirst({ where: { email: email.trim().toLowerCase(), active: true } });
    if (!user || user.passwordHash !== hashPassword(password)) return res.status(401).json({ error: 'Invalid email or password' });
    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
    const patient = user.role === 'patient' ? await prisma.patient.findUnique({ where: { email: user.email } }) : null;
    const tokenUser = { id: patient?.id || user.id, user_id: user.id, email: user.email, role: user.role, doctor_id: user.doctorId, name: patient?.name || user.name };
    await recordActivity({ user: tokenUser, action: 'LOGIN', entity: 'User', entityId: user.id, details: 'Successful sign in' });
    res.json({ user: tokenUser, token: createToken(tokenUser) });
  } catch (error) { next(error); }
});

router.get('/me', (req, res) => {
  const decoded = verifyToken(req.headers.authorization?.replace(/^Bearer\s+/i, ''));
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ user: decoded });
});

router.post('/change-password', authMiddleware(), async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password || new_password.length < 8) return res.status(400).json({ error: 'Current password and a new password of at least 8 characters are required' });
    const user = await prisma.user.findUnique({ where: { id: Number(req.user.user_id || req.user.id) } });
    if (!user || user.passwordHash !== hashPassword(current_password)) return res.status(401).json({ error: 'Current password is incorrect' });
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashPassword(new_password) } });
    await recordActivity({ user: req.user, action: 'UPDATE', entity: 'User', entityId: user.id, details: 'Password changed' });
    res.json({ ok: true });
  } catch (error) { next(error); }
});

module.exports = router;
