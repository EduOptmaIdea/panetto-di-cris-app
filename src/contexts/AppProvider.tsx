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