import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import {
   createNotification,
   notifyAdmins,
} from "../notifications/notification.service";
import type { CheckoutInput } from "./order.schema";

export const createOrder = async (payload: CheckoutInput, userId?: number) => {
   const order = await prisma.$transaction(async (tx) => {
      let subTotal = 0;
      const orderItemsData = [];

      for (const item of payload.items) {
         const product = await tx.product.findUnique({
            where: { id: item.productId },
         });

         if (!product)
            throw new Error(`Sản phẩm có ID ${item.productId} không tồn tại`);
         if (product.stock < item.quantity) {
            throw new Error(
               `Sản phẩm "${product.name}" chỉ còn ${product.stock} cái. Vui lòng giảm số lượng.`,
            );
         }

         const priceToUse = product.priceDiscount ?? product.price;
         subTotal += Number(priceToUse) * item.quantity;

         await tx.product.update({
            where: { id: product.id },
            data: { stock: product.stock - item.quantity },
         });

         orderItemsData.push({
            productId: product.id,
            quantity: item.quantity,
            price: priceToUse,
         });
      }

      const tax = subTotal * 0.1;
      const finalTotalAmount = subTotal + tax;

      const newOrder = await tx.order.create({
         data: {
            customerName: payload.customerName,
            customerPhone: payload.customerPhone,
            shippingAddress: payload.shippingAddress,
            paymentMethod: payload.paymentMethod,
            totalAmount: finalTotalAmount,
            ...(userId ? { userId } : {}),
            orderItems: { create: orderItemsData },
         },
         include: { orderItems: true },
      });

      return newOrder;
   });

   if (userId) {
      await createNotification({
         userId,
         type: "ORDER_PLACED",
         title: "Đặt hàng thành công",
         message: `Đơn hàng #${order.id} của bạn đã được tiếp nhận. Chúng tôi sẽ xử lý trong thời gian sớm nhất.`,
         metadata: { orderId: order.id },
      });
   }

   notifyAdmins({
      type: "ORDER_PLACED",
      title: "Có đơn hàng mới",
      message: `${payload.customerName} vừa đặt đơn hàng #${order.id} — ${Number(order.totalAmount).toLocaleString("vi-VN")}₫`,
      metadata: { orderId: order.id },
   });

   return order;
};

// Cập nhật trạng thái đơn hàng — Admin thực hiện → notify user
export const updateOrderStatus = async (orderId: number, status: string) => {
   const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, userId: true, customerName: true },
   });

   if (!order) throw new AppError("Đơn hàng không tồn tại", 404);

   const statusLabels: Record<string, string> = {
      PROCESSING: "Đang đóng gói",
      SHIPPED: "Đang giao hàng",
      DELIVERED: "Đã giao thành công",
      CANCELLED: "Đã hủy",
   };

   const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
      include: { orderItems: true },
   });

   // Notify user nếu đơn hàng có liên kết tài khoản
   if (order.userId) {
      await createNotification({
         userId: order.userId,
         type: "ORDER_STATUS_CHANGED",
         title: "Cập nhật đơn hàng",
         message: `Đơn hàng #${orderId} của bạn: ${statusLabels[status] ?? status}`,
         metadata: { orderId, status },
      });
   }

   return updated;
};

export const getOrderById = async (id: number) => {
   const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
   });
   if (!order) throw new AppError("Đơn hàng không tồn tại", 404);
   return order;
};
