const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrate() {
  await prisma.$connect();
}

module.exports = { prisma, migrate };
