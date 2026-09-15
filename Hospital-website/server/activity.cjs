const { prisma } = require('./db.cjs');

async function recordActivity({ user, action, entity, entityId, details }) {
  try {
    await prisma.activityLog.create({
      data: {
        actorId: user?.user_id || user?.id || null,
        actorName: user?.name || null,
        actorRole: user?.role || null,
        action,
        entity,
        entityId: entityId === undefined || entityId === null ? null : String(entityId),
        details: details || null
      }
    });
  } catch (error) {
    console.error('Activity log failed:', error.message);
  }
}

module.exports = { recordActivity };