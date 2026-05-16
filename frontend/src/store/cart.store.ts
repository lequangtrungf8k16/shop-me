import { CartItem } from "@/types/product.type";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Định nghĩa các trạng thái và hành động của Store
interface CartState {
   items: CartItem[];
   addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
   removeFromCart: (id: number) => void;
   updateQuantity: (id: number, quantity: number) => void;
   clearCart: () => void;
   getTotalPrice: () => number;
   getTotalItems: () => number;
}

// 3. Khởi tạo Store với middleware persist
export const useCartStore = create<CartState>()(
   persist(
      (set, get) => ({
         items: [], // Khởi tạo giỏ hàng rỗng

         // Thêm sản phẩm vào giỏ
         addToCart: (item, quantity = 1) => {
            const currentItems = get().items;
            const existingItem = currentItems.find((i) => i.id === item.id);

            if (existingItem) {
               // Nếu đã có trong giỏ, tăng số lượng lên (nhưng không vượt quá tồn kho)
               set({
                  items: currentItems.map((i) =>
                     i.id === item.id
                        ? {
                             ...i,
                             quantity: Math.min(i.quantity + quantity, i.stock),
                          }
                        : i,
                  ),
               });
            } else {
               // Nếu chưa có, thêm mới
               set({ items: [...currentItems, { ...item, quantity }] });
            }
         },

         // Xóa 1 sản phẩm khỏi giỏ
         removeFromCart: (id) => {
            set({ items: get().items.filter((i) => i.id !== id) });
         },

         // Cập nhật số lượng trực tiếp (khi bấm nút + / - trong giỏ hàng)
         updateQuantity: (id, quantity) => {
            set({
               items: get().items.map((i) =>
                  // Đảm bảo số lượng luôn >= 1 và <= số tồn kho
                  i.id === id
                     ? {
                          ...i,
                          quantity: Math.max(1, Math.min(quantity, i.stock)),
                       }
                     : i,
               ),
            });
         },

         // Xóa sạch giỏ hàng (Sau khi thanh toán thành công)
         clearCart: () => set({ items: [] }),

         // Tính tổng tiền
         getTotalPrice: () => {
            return get().items.reduce(
               (total, item) => total + item.price * item.quantity,
               0,
            );
         },

         // Tính tổng số lượng sản phẩm
         getTotalItems: () => {
            return get().items.reduce(
               (total, item) => total + item.quantity,
               0,
            );
         },
      }),
      {
         name: "tech-pulse-cart", // Tên key lưu trong Local Storage của trình duyệt
      },
   ),
);
