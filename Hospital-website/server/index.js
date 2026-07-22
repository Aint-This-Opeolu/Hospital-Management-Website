const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { db, migrate } = require('./db');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Migrate DB
migrate();

// Simple seeding: if no doctors, insert from frontend data file if available
try {
  const stmt = db.prepare('SELECT COUNT(*) AS cnt FROM doctors');
  const row = stmt.get();
  if (row.cnt === 0) {
    // try to read seeded doctors from src/data/doctors.js
    const doctorsSeed = require(path.join(__dirname, '..', 'src', 'data', 'doctors.js')).doctors || require(path.join(__dirname, '..', 'src', 'data', 'doctors.js')).default || require(path.join(__dirname, '..', 'src', 'data', 'doctors.js'));
    if (Array.isArray(doctorsSeed)) {
      const insert = db.prepare('INSERT INTO doctors (id, name, specialization) VALUES (?, ?, ?)');
      const insertMany = db.transaction((items) => {
        for (const d of items) {
          insert.run(d.id, d.name, d.specialization || 'General');
        }
      });
      insertMany(doctorsSeed);
      console.log('Seeded doctors from frontend data');
    }
  }
} catch (e) {
  console.warn('Failed to seed doctors:', e.message);
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/admin', require('./routes/admin'));

// static serve (optional)
app.use('/api/static', express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`HMS API running on http://localhost:${PORT}`));
