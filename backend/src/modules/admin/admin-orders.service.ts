import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import {
   createNotification,
   notifyAdmins,
} from "../notifications/notification.service";
import type { OrderStatus } from "../../generated/prisma/client";

export const adminGetOrders = async (
   page = 1,
   limit = 15,
   status?: string,
   search = "",
) => {
   const skip = (page - 1) * limit;

   const where = {
      ...(status ? { status: status as OrderStatus } : {}),
      ...(search
         ? {
              OR: [
                 { customerName: { contains: search } },
                 { customerPhone: { contains: search } },
              ],
           }
         : {}),
   };

   const [orders, total] = await Promise.all([
      prisma.order.findMany({
         where,
         skip,
         take: limit,
         orderBy: { createdAt: "desc" },
         include: {
            user: { select: { id: true, fullName: true, email: true } },
            _count: { select: { orderItems: true } },
         },
      }),
      prisma.order.count({ where }),
   ]);

   return {
      orders,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
   };
};

export const adminGetOrderDetail = async (id: number) => {
   const order = await prisma.order.findUnique({
      where: { id },
      include: {
         user: { select: { id: true, fullName: true, email: true } },
         orderItems: {
            include: {
               product: {
                  select: { id: true, name: true, thumbnail: true, slug: true },
               },
            },
         },
      },
   });
   if (!order) throw new AppError("Đơn hàng không tồn tại", 404);
   return order;
};

export const adminUpdateOrderStatus = async (
   orderId: number,
   status: OrderStatus,
) => {
   const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, userId: true, customerName: true, status: true },
   });
   if (!order) throw new AppError("Đơn hàng không tồn tại", 404);

   const STATUS_LABELS: Record<string, string> = {
      PROCESSING: "Đang đóng gói",
      SHIPPED: "Đang giao hàng",
      DELIVERED: "Đã giao thành công",
      CANCELLED: "Đã hủy",
   };

   const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status },
   });

   if (order.userId) {
      await createNotification({
         userId: order.userId,
         type: "ORDER_STATUS_CHANGED",
         title: "Cập nhật đơn hàng",
         message: `Đơn hàng #${orderId} của bạn: ${STATUS_LABELS[status] ?? status}`,
         metadata: { orderId, status },
      });
   }

   return updated;
};
