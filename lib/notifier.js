import prisma from './prisma';

export async function notify(title, message, type = 'INFO', userId = null) {
  try {
    await prisma.notification.create({
      data: {
        title,
        message,
        type,
        userId
      }
    });
    // In a real app, you might trigger a WebSocket or SSE event here
  } catch (error) {
    console.error('Notification Error:', error);
  }
}
