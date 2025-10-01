import { createContext, useContext } from 'react';
import type { Customer, Product, Order, ProductCategory } from '../types';

// Interface para o objeto de notificação, para manter a tipagem forte
interface Notification {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

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
  deleteCustomer: (id: string) => Promise<void>;
  
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'totalSold' | 'priceHistory' | 'customPackaging'>) => Promise<Product | null>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  addCategory: (category: Pick<ProductCategory, 'name' | 'description' | 'isActive'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<ProductCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  addOrder: (order: Omit<Order, 'id' | 'customer' | 'number' | 'created_at'>) => Promise<void>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  
  refetch: () => Promise<void>;

  // --- FUNÇÃO DE NOTIFICAÇÃO REINTEGRADA ---
  addNotification: (notification: Notification) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};