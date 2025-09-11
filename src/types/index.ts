export interface Customer {
  id: string;
  name: string;
  whatsapp: string;
  address: string;
  observations?: string;
  deliveryPreferences?: string;
  createdAt: Date;
  totalOrders: number;
  totalSpent: number;
  is_gift_eligible?: boolean;
  
  // Novas propriedades
  completedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  paidSpent: number;
  pendingSpent: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  priceHistory: PriceHistory[];
  image?: string;
  weight?: number;
  customPackaging: boolean;
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
}

export interface Order {
  id: string;
  customerId: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  salesChannel: SalesChannel;
  orderDate: Date;
  estimatedDelivery?: Date;
  completedAt?: Date;
  notes?: string;
}