const express = require('express');
const router = express.Router();
const { prisma } = require('../db.cjs');
const { hashPassword, createToken, verifyToken } = require('../auth.cjs');
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

module.exports = router;
