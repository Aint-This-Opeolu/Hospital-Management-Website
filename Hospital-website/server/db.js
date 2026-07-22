const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'hms.sqlite'));

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      role TEXT,
      doctor_id TEXT
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id TEXT PRIMARY KEY,
      name TEXT,
      specialization TEXT
    );

    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER,
      doctor_id TEXT,
      patient_name TEXT,
      doctor_name TEXT,
      appointment_date TEXT,
      appointment_time TEXT,
      booking_timestamp TEXT,
      status TEXT,
      reason TEXT,
      consultation_notes TEXT,
      FOREIGN KEY(patient_id) REFERENCES patients(id),
      FOREIGN KEY(doctor_id) REFERENCES doctors(id)
    );
  `);
}

module.exports = { db, migrate };
