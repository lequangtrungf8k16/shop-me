export interface OrderItemPayload {
   productId: number;
   quantity: number;
}

export interface CheckoutPayload {
   customerName: string;
   customerPhone: string;
   shippingAddress: string;
   paymentMethod: string;
   items: OrderItemPayload[];
}

// Response từ API sau khi đặt hàng thành công
export interface OrderItem {
   id: number;
   productId: number;
   quantity: number;
   price: string;
}

export interface Order {
   id: number;
   customerName: string;
   customerPhone: string;
   shippingAddress: string;
   totalAmount: string;
   status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
   paymentMethod: string;
   orderItems: OrderItem[];
   createdAt: string;
}
