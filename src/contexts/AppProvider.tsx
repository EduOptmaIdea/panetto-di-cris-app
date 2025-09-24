import React from 'react';
import { useSupabaseData } from '../hooks/useSupabase';
import { AppContext } from './AppContext';

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
    deleteCustomer,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    addOrder,
    updateOrder,
    deleteOrder, // ✅ Adicionado aqui
    mostSoldCategory,
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
        deleteCustomer,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addOrder,
        updateOrder,
        deleteOrder, // ✅ E aqui
        mostSoldCategory,
        refetch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};