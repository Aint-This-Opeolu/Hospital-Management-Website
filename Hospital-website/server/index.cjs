const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { migrate } = require('./db.cjs');
const { authMiddleware } = require('./auth.cjs');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/auth', require('./routes/auth.cjs'));
app.use('/api/appointments', authMiddleware(['patient', 'doctor', 'nurse', 'reception', 'admin']), require('./routes/appointments.cjs'));
app.use('/api/admin', authMiddleware('admin'), require('./routes/admin.cjs'));
app.use('/api/clinical', require('./routes/clinical.cjs'));
app.use('/api/static', express.static(path.join(__dirname, 'public')));
app.use((error, req, res, next) => { console.error(error); res.status(500).json({ error: 'Internal server error' }); });

const PORT = process.env.PORT || 4000;
migrate().then(() => app.listen(PORT, () => console.log(`Kenny Care API running on http://localhost:${PORT}`))).catch((error) => { console.error('Database connection failed:', error.message); process.exit(1); });
