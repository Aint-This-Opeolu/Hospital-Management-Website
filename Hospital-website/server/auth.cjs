const crypto = require('crypto');

const SECRET = process.env.HMS_SECRET || 'hms-local-secret';
const SESSION_DURATION_SECONDS = 60 * 60;

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function createToken(user) {
  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    email: user.email,
    role: user.role,
    doctorId: user.doctor_id,
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS
  })).toString('base64url');
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
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!decoded.exp || decoded.exp <= Math.floor(Date.now() / 1000)) return null;
    return decoded;
  } catch {
    return null;
  }
}

function authMiddleware(requiredRoles) {
  const roles = requiredRoles ? (Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]) : null;
  return (req, res, next) => {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const decoded = verifyToken(token);
    if (!decoded || (roles && !roles.includes(decoded.role))) {
      return res.status(decoded ? 403 : 401).json({ error: decoded ? 'Forbidden' : 'Unauthorized' });
    }
    req.user = decoded;
    next();
  };
}

module.exports = { hashPassword, createToken, verifyToken, authMiddleware };
