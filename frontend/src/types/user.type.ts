export interface UserProfile {
   id: number;
   fullName: string;
   email: string;
   phone: string | null;
   role: "USER" | "ADMIN";
   isActive: boolean;
   createdAt: string;
   orders: UserOrder[];
}

export interface UserOrder {
   id: number;
   totalAmount: string;
   status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
   paymentMethod: string;
   createdAt: string;
   orderItems: { quantity: number }[];
}

// Dùng trong bảng Admin
export interface AdminUser {
   id: number;
   fullName: string;
   email: string;
   phone: string | null;
   role: "USER" | "ADMIN";
   isActive: boolean;
   createdAt: string;
   _count: { orders: number };
}
