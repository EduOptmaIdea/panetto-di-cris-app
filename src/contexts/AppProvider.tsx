import React from 'react';
import { useSupabaseData } from '../hooks/useSupabase';
import { AppContext } from './AppContext';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabaseData = useSupabaseData();

  return (
    <AppContext.Provider value={supabaseData}>
      {children}
    </AppContext.Provider>
  );
};