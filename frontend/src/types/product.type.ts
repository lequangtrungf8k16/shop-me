// Định nghĩa Danh mục
export interface Category {
   id: number;
   name: string;
   slug: string;
}

// Định nghĩa Sản phẩm (Dùng cho cả Home, Detail và API)
export interface Product {
   id: number;
   name: string;
   slug: string;
   description: string;
   price: string;
   priceDiscount: string | null;
   stock: number;
   thumbnail: string;
   images?: string[];
   category: Category;
}

// Định nghĩa Sản phẩm trong Giỏ hàng (Kế thừa từ Product nhưng thêm quantity)
export interface CartItem extends Pick<
   Product,
   "id" | "name" | "slug" | "thumbnail" | "stock"
> {
   price: number;
   quantity: number;
}
