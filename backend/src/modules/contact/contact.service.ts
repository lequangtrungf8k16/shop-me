import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import { notifyAdmins } from "../notifications/notification.service";

export const createContactMessage = async (data: {
  name: string; email: string; subject: string; message: string; userId?: number;
}) => {
  const contact = await prisma.contactMessage.create({
    data: { name: data.name, email: data.email, subject: data.subject, message: data.message, userId: data.userId ?? null },
  });
  notifyAdmins({ type: "CONTACT_MESSAGE", title: "Tin nhắn hỗ trợ mới",
    message: `${data.name} (${data.email}): ${data.subject}`, metadata: { messageId: contact.id } });
  return contact;
};

export const adminGetContactMessages = async (page = 1, limit = 15, status?: string) => {
  const skip = (page - 1) * limit;
  const where = status ? { status: status as any } : {};
  const [messages, total] = await Promise.all([
    prisma.contactMessage.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, fullName: true } } } }),
    prisma.contactMessage.count({ where }),
  ]);
  return { messages, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

export const adminReplyContactMessage = async (id: number, reply: string) => {
  const msg = await prisma.contactMessage.findUnique({ where: { id } });
  if (!msg) throw new AppError("Tin nhắn không tồn tại", 404);
  return prisma.contactMessage.update({ where: { id }, data: { adminReply: reply, status: "REPLIED", repliedAt: new Date() } });
};

export const adminCloseContactMessage = async (id: number) => {
  return prisma.contactMessage.update({ where: { id }, data: { status: "CLOSED" } });
};
