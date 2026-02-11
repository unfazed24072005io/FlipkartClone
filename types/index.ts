export type UserRole = 'user' | 'seller' | 'distributor' | 'admin';

export type UserStatus = 'active' | 'blocked';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  address?: string;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  createdAt: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  basePrice: number;
  discountPercent: number;
  inventory: number;
  weightKg: number;
  images: string[];
  active: boolean;
  createdAt: number;
  rating?: number;
  reviewCount?: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  active: boolean;
  createdAt: number;
}

export interface DeliveryCharge {
  id: string;
  name: string;
  pricePerKg: number;
}

export interface PriceOverride {
  productId: string;
  overridePrice: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  weightKg: number;
}

export interface Order {
  id: string;
  uid: string;
  role: UserRole;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  location: string;
  address: string;
  phone: string;
  status: OrderStatus;
  createdAt: number;
  updatedAt?: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalSellers: number;
  totalDistributors: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
  pendingOrders: number;
}

export interface SellerStats {
  totalOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
  pendingOrders: number;
}
