"use client";

import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { Product } from "@/types/product.type";
import { toast } from "sonner";

export default function AddToCartButton({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const addToCart = useCartStore((s) => s.addToCart);

  const handleAdd = () => {
    if (product.stock <= 0) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }
    addToCart(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        thumbnail: product.thumbnail,
        stock: product.stock,
        price: Number(product.priceDiscount || product.price),
      },
      1,
    );
    toast.success("Đã thêm vào giỏ hàng!");
  };

  if (compact) {
    return (
      <button
        onClick={handleAdd}
        disabled={product.stock <= 0}
        className={`w-full text-[12px] font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
          product.stock > 0
            ? "bg-primary/10 text-primary border border-primary hover:bg-primary hover:text-on-primary"
            : "bg-surface-variant text-on-surface-variant cursor-not-allowed border border-surface-variant"
        }`}
      >
        <ShoppingCart size={14} />
        {product.stock > 0 ? "Thêm vào giỏ" : "Hết hàng"}
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={product.stock <= 0}
      className={`border text-[12px] font-semibold py-stack-default rounded-lg flex justify-center items-center gap-2 px-4 transition-colors ${
        product.stock > 0
          ? "border-primary text-primary hover:bg-primary/5 bg-surface-container-lowest"
          : "border-surface-variant text-on-surface-variant cursor-not-allowed bg-surface-variant"
      }`}
    >
      <ShoppingCart size={18} />
      {product.stock > 0 ? "THÊM VÀO GIỎ" : "HẾT HÀNG"}
    </button>
  );
}
