const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();
const hashPassword = (password) => crypto.createHash('sha256').update(password).digest('hex');

const doctors = [
  { id: '1', name: 'Dr. Chukwuemeka Nwafor', specialization: 'Orthopedic Surgeon', email: 'doctor@kennycare.local' },
  { id: '2', name: 'Dr. Adaora Eze', specialization: 'General Surgeon & Diabetic Foot Care', email: 'adaora.eze@kennycare.local' },
  { id: '3', name: 'Dr. Uchechukwu Nnadi', specialization: 'Orthopedic Surgeon' },
  { id: '4', name: 'Dr. Chidinma Okonkwo', specialization: 'Interventional Cardiologist' },
  { id: '5', name: 'Dr. Ifeoma Nwankwo', specialization: 'Orthopedic Surgeon' },
  { id: '6', name: 'Dr. Kelechi Obi', specialization: 'General & ENT' },
  { id: '7', name: 'Dr. Amarachi Nweke', specialization: 'Gastroenterologist' },
  { id: '8', name: 'Dr. Obinna Anya', specialization: 'Dermatologist (Skin)' },
  { id: '9', name: 'Dr. Chinelo Okafor', specialization: 'Pediatrician' },
  { id: '10', name: 'Dr. Chijioke Umeh', specialization: 'Urologist' },
  { id: '11', name: 'Dr. Chisom Ibekwe', specialization: 'MD General & Endocrinologist' },
  { id: '12', name: 'Dr. Onyinyechi Nwosu', specialization: 'Anesthesia' },
  { id: '13', name: 'Dr. Somtochukwu Nnadiebube', specialization: 'Gynecologist & Obstetrics' },
  { id: '14', name: 'Dr. Chukwuemeka Azubuike', specialization: 'Neurologist' },
  { id: '15', name: 'Dr. Nkemjika Uzoho', specialization: 'Gynecologist & Obstetrics' },
  { id: '16', name: 'Dr. Kamsiyochukwu Anyanwu', specialization: 'Industrial Specialist' },
  { id: '17', name: 'Dr. Chukwuma Madu', specialization: 'General Physician' },
  { id: '18', name: 'Dr. Nneka Nwosu', specialization: 'General Physician' },
  { id: '19', name: 'Dr. Uchenna Eze', specialization: 'Dental (MDS)' },
  { id: '20', name: 'Dr. Ifunanya Nwachukwu', specialization: 'General Physician' },
  { id: '21', name: 'Dr. Chidera Okereke', specialization: 'Psychologist' },
  { id: '22', name: 'Dr. Chibuike Ndubuaku', specialization: 'Physiotherapy' },
  { id: '23', name: 'Dr. Chisom Okeke', specialization: 'Physiotherapy' }
];

for (const doctor of doctors) {
  doctor.email ||= `doctor-${doctor.id}@kennycare.local`;
}

const users = [
  { name: 'System Administrator', email: 'admin@kennycare.local', password: 'Admin@123', role: 'admin' },
  { name: 'Nurse Chiamaka Okafor', email: 'nurse@kennycare.local', password: 'Nurse@123', role: 'nurse' },
  { name: 'Reception Staff', email: 'reception@kennycare.local', password: 'Reception@123', role: 'reception' },
  { name: 'Demo Patient', email: 'patient@kennycare.local', password: 'Patient@123', role: 'patient' }
];

users.push(...doctors.map((doctor) => ({
  name: doctor.name,
  email: doctor.email,
  password: 'Doctor@123',
  role: 'doctor',
  doctorId: doctor.id
})));

async function main() {
  for (const doctor of doctors) await prisma.doctor.upsert({ where: { id: doctor.id }, update: doctor, create: doctor });
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, passwordHash: hashPassword(user.password), role: user.role, doctorId: user.doctorId || null, active: true },
      create: { name: user.name, email: user.email, passwordHash: hashPassword(user.password), role: user.role, doctorId: user.doctorId || null }
    });
  }
  const patientUser = users.find((user) => user.role === 'patient');
  await prisma.patient.upsert({ where: { email: patientUser.email }, update: { name: patientUser.name }, create: { name: patientUser.name, email: patientUser.email } });
}

main().then(() => prisma.$disconnect()).catch(async (error) => { console.error(error); await prisma.$disconnect(); process.exit(1); });
