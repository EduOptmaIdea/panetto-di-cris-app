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
  mostSoldCategory: ProductCategory | null;
  
  // CRUD operations
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'isGiftEligible' | 'totalOrders' | 'totalSpent' | 'completedOrders' | 'cancelledOrders' | 'pendingOrders' | 'paidSpent' | 'pendingSpent'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (category: Pick<ProductCategory, 'name' | 'description' | 'isActive'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<ProductCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addOrder: (
    order: Omit<Order, 'id' | 'orderDate' | 'customer' | 'order_number'> & {
      items: OrderItem[];
      order_number?: number;
    }
  ) => Promise<void>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>; // ✅ deleteCustomer adicionado aqui
  refetch: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};