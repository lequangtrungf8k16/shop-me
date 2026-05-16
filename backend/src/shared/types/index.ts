import type { Category, Product, Order, OrderItem } from "@prisma/client";

export interface ApiResponse<T = any> {
   status: "success" | "error";
   message: string;
   data?: T;
   errors?: any;
}

export interface OrderItemPayload {
   productId: number;
   quantity: number;
}

export interface CreateOrderPayload {
   customerName: string;
   customerPhone: string;
   shippingAddress: string;
   city: string;
   paymentMethod: string;
   items: OrderItemPayload[];
}

export type { Category, Product, Order, OrderItem };
