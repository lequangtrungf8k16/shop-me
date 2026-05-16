import { prisma } from "../../config/prisma";

// Lấy thống kê tổng quan cho Dashboard
export const getDashboardStats = async () => {
   // Chạy song song tất cả query để tối ưu tốc độ
   const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueResult,
      recentOrders,
      ordersByStatus,
   ] = await Promise.all([
      // Tổng số user
      prisma.user.count(),

      // Tổng số sản phẩm
      prisma.product.count(),

      // Tổng số đơn hàng
      prisma.order.count(),

      // Tổng doanh thu (chỉ tính đơn đã giao)
      prisma.order.aggregate({
         _sum: { totalAmount: true },
         where: { status: "DELIVERED" },
      }),

      // 5 đơn hàng mới nhất
      prisma.order.findMany({
         take: 5,
         orderBy: { createdAt: "desc" },
         select: {
            id: true,
            customerName: true,
            totalAmount: true,
            status: true,
            paymentMethod: true,
            createdAt: true,
         },
      }),

      // Thống kê đơn hàng theo trạng thái
      prisma.order.groupBy({
         by: ["status"],
         _count: { id: true },
      }),
   ]);

   return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: revenueResult._sum.totalAmount ?? 0,
      recentOrders,
      ordersByStatus,
   };
};

// Lấy danh sách user với phân trang
export const getAllUsers = async (page: number = 1, limit: number = 10) => {
   const skip = (page - 1) * limit;

   const [users, total] = await Promise.all([
      prisma.user.findMany({
         skip,
         take: limit,
         orderBy: { createdAt: "desc" },
         select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true,
            _count: { select: { orders: true } },
         },
      }),
      prisma.user.count(),
   ]);

   return {
      users,
      pagination: {
         total,
         page,
         limit,
         totalPages: Math.ceil(total / limit),
      },
   };
};

// Khóa / mở khóa tài khoản user
export const toggleUserStatus = async (userId: number) => {
   const user = await prisma.user.findUnique({ where: { id: userId } });
   if (!user) throw new Error("Người dùng không tồn tại");

   const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: {
         id: true,
         fullName: true,
         email: true,
         isActive: true,
      },
   });

   return updated;
};
