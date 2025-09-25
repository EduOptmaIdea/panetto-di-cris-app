export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'cancelled';
export type SalesChannel = 'direct' | 'whatsapp' | '99food' | 'ifood';
export type DeliveryMethod = 'pickup' | 'delivery';
export type PaymentMethod = 'cash' | 'card' | 'pix' | 'transfer';

// Interface para o Histórico de Preços de um Produto
export interface PriceHistory {
  date: Date;
  price: number;
}

// Interface para Categoria de Produto
export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  productCount: number;
}

// Interface para Produto
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  weight: number | null;
  customPackaging?: boolean; // ✅ CORREÇÃO: Campo adicionado
  priceHistory: PriceHistory[];
  totalSold: number;
  createdAt: Date;
  image?: string | null;
  category: string;
  isActive: boolean;
}

// Interface para Cliente
export interface Customer {
  id: string;
  name: string;
  whatsapp: string;
  email?: string | null;
  address: string | null;
  observations?: string | null;
  deliveryPreferences?: string | null;
  createdAt: Date;
  totalOrders: number;
  totalSpent: number;
  isGiftEligible: boolean;
  completedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  paidSpent: number;
  pendingSpent: number;
}

// Interface para Item de Pedido
export interface OrderItem {
  productId: string;
  product: Product;
  quantity: number;
  unit_price: number;
  total: number;
  item_discount?: number;
  final_unit_price: number;
}

// Interface para Pedido (Order)
export interface Order {
  id: string;
  number: number;
  orderDate: Date | null; 
  customerId: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  orderDiscount?: number;
  totalItemsDiscount?: number;
  total: number;
  currentStatus: OrderStatus;
  currentPaymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  salesChannel: SalesChannel;
  notes?: string;
  estimatedDelivery?: Date | null;
  completedAt?: Date | null;
  paymentDate?: Date | null;
  created_at: string; 
}