import { prisma } from "../../config/prisma";
import { getIO } from "../../config/socket";
import type { NotificationType } from "../../generated/prisma/client";

interface CreateNotificationPayload {
  userId: number; type: NotificationType; title: string; message: string;
  metadata?: Record<string, unknown>;
}

export const createNotification = async (payload: CreateNotificationPayload) => {
  const notification = await prisma.notification.create({
    data: { userId: payload.userId, type: payload.type, title: payload.title, message: payload.message, metadata: payload.metadata ?? {} },
  });
  try { getIO().to(`user:${payload.userId}`).emit("notification:new", notification); } catch { /* offline */ }
  return notification;
};

export const notifyAdmins = (data: { type: string; title: string; message: string; metadata?: Record<string, unknown> }) => {
  try { getIO().to("admin").emit("notification:admin", { ...data, createdAt: new Date().toISOString() }); } catch { /* offline */ }
};

export const getUserNotifications = async (userId: number, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);
  return { notifications, unreadCount, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

export const markAsRead = async (userId: number, notificationId?: number) => {
  if (notificationId) {
    await prisma.notification.updateMany({ where: { id: notificationId, userId }, data: { isRead: true } });
  } else {
    await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
  }
};

export const getUnreadCount = async (userId: number) =>
  prisma.notification.count({ where: { userId, isRead: false } });
