import { prisma } from "../../config/prisma";

// Doanh thu theo 12 tháng gần nhất
export const getRevenueByMonth = async () => {
   const now = new Date();
   const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
   });

   const results = await Promise.all(
      months.map(({ year, month }) =>
         prisma.order
            .aggregate({
               _sum: { totalAmount: true },
               _count: { id: true },
               where: {
                  status: "DELIVERED",
                  createdAt: {
                     gte: new Date(year, month - 1, 1),
                     lt: new Date(year, month, 1),
                  },
               },
            })
            .then((r) => ({
               label: `T${month}/${year}`,
               revenue: Number(r._sum.totalAmount ?? 0),
               orders: r._count.id,
            })),
      ),
   );

   return results;
};

// Sản phẩm bán chạy nhất
export const getTopProducts = async (limit = 10) => {
   const items = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: limit,
   });

   const productIds = items.map((i) => i.productId);
   const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, thumbnail: true, price: true },
   });

   const productMap = new Map(products.map((p) => [p.id, p]));

   return items.map((item) => ({
      product: productMap.get(item.productId),
      totalSold: item._sum.quantity ?? 0,
   }));
};

// Tóm tắt tổng quan cho report
export const getReportSummary = async () => {
   const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

   const [
      revenueThisMonth,
      revenuePrevMonth,
      ordersThisMonth,
      newUsersThisMonth,
      totalRevenue,
   ] = await Promise.all([
      prisma.order.aggregate({
         _sum: { totalAmount: true },
         where: {
            status: "DELIVERED",
            createdAt: { gte: thirtyDaysAgo },
         },
      }),
      prisma.order.aggregate({
         _sum: { totalAmount: true },
         where: {
            status: "DELIVERED",
            createdAt: {
               gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
               lt: thirtyDaysAgo,
            },
         },
      }),
      prisma.order.count({
         where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.user.count({
         where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.order.aggregate({
         _sum: { totalAmount: true },
         where: { status: "DELIVERED" },
      }),
   ]);

   const thisMonth = Number(revenueThisMonth._sum.totalAmount ?? 0);
   const prevMonth = Number(revenuePrevMonth._sum.totalAmount ?? 0);
   const growth =
      prevMonth > 0 ? ((thisMonth - prevMonth) / prevMonth) * 100 : 0;

   return {
      revenueThisMonth: thisMonth,
      revenuePrevMonth: prevMonth,
      growth: Math.round(growth * 10) / 10,
      ordersThisMonth,
      newUsersThisMonth,
      totalRevenue: Number(totalRevenue._sum.totalAmount ?? 0),
   };
};
