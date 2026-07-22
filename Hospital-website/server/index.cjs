const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { db, migrate } = require('./db.cjs');
const path = require('path');
const { verifyToken } = require('./auth.cjs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

function authMiddleware(requiredRole) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: 'Unauthorized' });
    if (requiredRole && decoded.role !== requiredRole) return res.status(403).json({ error: 'Forbidden' });
    req.user = decoded;
    next();
  };
}

// Migrate DB
migrate();

// Simple seeding: if no doctors, insert a couple of entries
try {
  const stmt = db.prepare('SELECT COUNT(*) AS cnt FROM doctors');
  const row = stmt.get();
  if (row.cnt === 0) {
    const insert = db.prepare('INSERT INTO doctors (id, name, specialization) VALUES (?, ?, ?)');
    const insertMany = db.transaction((items) => {
      for (const d of items) {
        insert.run(d.id, d.name, d.specialization || 'General');
      }
    });
    insertMany([
      { id: '1', name: 'Dr. Chukwuemeka Nwafor', specialization: 'General' },
      { id: '2', name: 'Dr. Adaora Eze', specialization: 'General' }
    ]);
    console.log('Seeded basic doctors');
  }
} catch (e) { console.warn('Seed failed', e.message); }

// Routes
app.use('/api/auth', require('./routes/auth.cjs'));
app.use('/api/appointments', authMiddleware('patient'), require('./routes/appointments.cjs'));
app.use('/api/admin', authMiddleware('admin'), require('./routes/admin.cjs'));

app.use('/api/static', express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`HMS API running on http://localhost:${PORT}`));
