import React, { createContext, useContext, useState } from 'react';
import { useSupabaseData } from '../hooks/useSupabase';
import type { Customer, Product, Order, ProductCategory } from '../types';

interface AppContextType {
  // Data
  customers: Customer[];
  products: Product[];
  categories: ProductCategory[];
  orders: Order[];
  loading: boolean;
  error: string | null;
  
  // CRUD operations
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent'>) => Promise<any>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'totalSold' | 'priceHistory'>) => Promise<any>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'orderDate'>) => Promise<any>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
  refetch: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    customers,
    products,
    categories,
    orders,
    loading,
    error,
    addCustomer,
    updateCustomer,
    addProduct,
    updateProduct,
    addOrder,
    updateOrder,
    refetch,
  } = useSupabaseData();

  return (
    <AppContext.Provider
      value={{
        customers,
        products,
        categories,
        orders,
        loading,
        error,
        addCustomer,
        updateCustomer,
        addProduct,
        updateProduct,
        addOrder,
        updateOrder,
        refetch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};