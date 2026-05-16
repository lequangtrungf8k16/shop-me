import redisClient from "../../config/redis";
import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";

// ─── Constants ───────────────────────────────────────────────────────────────
// Key Redis theo từng user, TTL 7 ngày
const CART_KEY = (userId: number) => `cart:${userId}`;
const CART_TTL = 60 * 60 * 24 * 7; // 7 ngày (giây)

// ─── Types ───────────────────────────────────────────────────────────────────
export interface CartItem {
   productId: number;
   quantity: number;
   name: string;
   slug: string;
   price: number;
   priceDiscount: number | null;
   thumbnail: string | null;
   stock: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Đọc giỏ hàng từ Redis, trả về mảng rỗng nếu chưa có
const readCart = async (userId: number): Promise<CartItem[]> => {
   try {
      const raw = await redisClient.get(CART_KEY(userId));
      if (!raw) return [];
      return JSON.parse(raw) as CartItem[];
   } catch {
      return [];
   }
};

// Ghi giỏ hàng vào Redis, reset TTL mỗi lần thao tác
const writeCart = async (userId: number, items: CartItem[]): Promise<void> => {
   await redisClient.setEx(CART_KEY(userId), CART_TTL, JSON.stringify(items));
};

// ─── Service functions ────────────────────────────────────────────────────────

// Lấy giỏ hàng hiện tại
export const getCart = async (userId: number): Promise<CartItem[]> => {
   return readCart(userId);
};

// Thêm / tăng số lượng sản phẩm vào giỏ
export const addToCart = async (
   userId: number,
   productId: number,
   quantity: number,
): Promise<CartItem[]> => {
   // Kiểm tra sản phẩm tồn tại và còn hàng
   const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
         id: true,
         name: true,
         slug: true,
         price: true,
         priceDiscount: true,
         thumbnail: true,
         stock: true,
      },
   });

   if (!product) throw new AppError("Sản phẩm không tồn tại", 404);
   if (product.stock <= 0) throw new AppError("Sản phẩm đã hết hàng", 400);

   const items = await readCart(userId);
   const existingIndex = items.findIndex((i) => i.productId === productId);

   if (existingIndex !== -1) {
      // Sản phẩm đã có trong giỏ → cộng thêm số lượng, giới hạn bởi stock
      const newQty = Math.min(
         items[existingIndex]!.quantity + quantity,
         product.stock,
      );
      items[existingIndex]!.quantity = newQty;
      // Cập nhật lại giá phòng trường hợp admin đổi giá
      items[existingIndex]!.price = Number(product.price);
      items[existingIndex]!.priceDiscount = product.priceDiscount
         ? Number(product.priceDiscount)
         : null;
      items[existingIndex]!.stock = product.stock;
   } else {
      // Sản phẩm chưa có → thêm mới
      items.push({
         productId: product.id,
         quantity: Math.min(quantity, product.stock),
         name: product.name,
         slug: product.slug,
         price: Number(product.price),
         priceDiscount: product.priceDiscount
            ? Number(product.priceDiscount)
            : null,
         thumbnail: product.thumbnail,
         stock: product.stock,
      });
   }

   await writeCart(userId, items);
   return items;
};

// Cập nhật số lượng của 1 sản phẩm trong giỏ
export const updateCartItem = async (
   userId: number,
   productId: number,
   quantity: number,
): Promise<CartItem[]> => {
   const items = await readCart(userId);
   const index = items.findIndex((i) => i.productId === productId);

   if (index === -1) {
      throw new AppError("Sản phẩm không có trong giỏ hàng", 404);
   }

   // Kiểm tra tồn kho thực tế từ DB
   const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true },
   });

   if (!product) throw new AppError("Sản phẩm không tồn tại", 404);

   const safeQty = Math.max(1, Math.min(quantity, product.stock));
   items[index]!.quantity = safeQty;
   items[index]!.stock = product.stock;

   await writeCart(userId, items);
   return items;
};

// Xóa 1 sản phẩm khỏi giỏ
export const removeFromCart = async (
   userId: number,
   productId: number,
): Promise<CartItem[]> => {
   const items = await readCart(userId);
   const filtered = items.filter((i) => i.productId !== productId);

   if (filtered.length === items.length) {
      throw new AppError("Sản phẩm không có trong giỏ hàng", 404);
   }

   await writeCart(userId, filtered);
   return filtered;
};

// Xóa toàn bộ giỏ hàng
export const clearCart = async (userId: number): Promise<void> => {
   await redisClient.del(CART_KEY(userId));
};
