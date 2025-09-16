import { createContext, useContext } from 'react';
import type { Customer, Product, Order, OrderItem, ProductCategory } from '../types';

interface AppContextType {
  // Data
  customers: Customer[];
  products: Product[];
  categories: ProductCategory[];
  orders: Order[];
  loading: boolean;
  error: string | null;

  // CRUD operations
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'isGiftEligible' | 'totalOrders' | 'totalSpent' | 'completedOrders' | 'cancelledOrders' | 'pendingOrders' | 'paidSpent' | 'pendingSpent'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'totalSold' | 'category'> & { categoryId: string }) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  addOrder: (
    order: Omit<Order, 'id' | 'orderDate' | 'customer' | 'order_number'> & {
      items: OrderItem[];
      order_number?: number;
    }
  ) => Promise<void>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
  refetch: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};