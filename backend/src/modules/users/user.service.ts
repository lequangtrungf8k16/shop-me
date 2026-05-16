import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import type { UpdateProfileInput } from "./user.schema";

// Lấy profile đầy đủ của user hiện tại (kèm đơn hàng)
export const getUserProfile = async (userId: number) => {
   const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
         id: true,
         fullName: true,
         email: true,
         phone: true,
         role: true,
         isActive: true,
         createdAt: true,
         // Lấy 10 đơn hàng gần nhất của user này
         orders: {
            take: 10,
            orderBy: { createdAt: "desc" },
            select: {
               id: true,
               totalAmount: true,
               status: true,
               paymentMethod: true,
               createdAt: true,
               orderItems: { select: { quantity: true } },
            },
         },
      },
   });

   if (!user) throw new AppError("Người dùng không tồn tại", 404);
   return user;
};

// Cập nhật thông tin cá nhân
export const updateUserProfile = async (
   userId: number,
   data: UpdateProfileInput,
) => {
   const updated = await prisma.user.update({
      where: { id: userId },
      data: {
         ...(data.fullName && { fullName: data.fullName }),
         ...(data.phone && { phone: data.phone }),
      },
      select: {
         id: true,
         fullName: true,
         email: true,
         phone: true,
         role: true,
      },
   });

   return updated;
};
