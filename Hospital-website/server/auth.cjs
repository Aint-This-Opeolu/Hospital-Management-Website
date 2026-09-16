const crypto = require('crypto');

const SECRET = process.env.HMS_SECRET || 'kenny-care-local-secret';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function createToken(user) {
  const payload = Buffer.from(JSON.stringify({ sub: user.id, email: user.email, role: user.role, doctorId: user.doctor_id })).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  if (expected !== signature) return null;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

module.exports = { hashPassword, createToken, verifyToken };
