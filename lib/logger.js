import prisma from './prisma';

export async function logAction(action, details, userEmail = null, entityType = null, entityId = null) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        details: typeof details === 'string' ? details : JSON.stringify(details),
        userEmail,
        entityType,
        entityId: entityId?.toString()
      }
    });
  } catch (error) {
    console.error('Logging Error:', error);
  }
}
