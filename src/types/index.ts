export interface CustomerAddress {
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  whatsapp: string;
  email: string | null;
  address: string | null;
  observations: string | null;
  deliveryPreferences: string | null;
  createdAt: Date;
  totalOrders: number;
  totalSpent: number;
  is_gift_eligible?: boolean;
  completedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  paidSpent: number;
  pendingSpent: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean; // ✅ Novo campo
  productCount: number; // ✅ Novo campo
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  priceHistory: PriceHistory[];
  image: string | null;
  weight: number | null;
  isActive: boolean;
  createdAt: Date;
  totalSold: number;
}

export interface PriceHistory {
  date: Date;
  price: number;
  channel: SalesChannel;
}

export type SalesChannel = 'direct' | '99food' | 'whatsapp' | 'ifood';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'pix' | 'transfer';
export type DeliveryMethod = 'pickup' | 'delivery';

export interface OrderItem {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  total: number;
  itemDiscount?: number; // ✅ Novo campo
  finalUnitPrice?: number; // ✅ Novo campo
}

export interface Order {
  id: string;
  number?: number; // ✅ A propriedade agora é 'number'
  customerId: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  orderDiscount?: number; // ✅ Novo campo
  totalItemsDiscount?: number; // ✅ Novo campo
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  salesChannel: SalesChannel;
  orderDate: Date | null;
  estimatedDelivery?: Date | null;
  completedAt?: Date | null;
  notes: string | null;
}