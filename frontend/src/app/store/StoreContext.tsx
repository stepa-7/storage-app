import React, { createContext, useContext, type ReactNode } from 'react';

import { type RootStoreType } from './index';

// Создаем контекст для stores
const StoreContext = createContext<RootStoreType | null>(null);

// Провайдер для stores
interface StoreProviderProps {
  children: ReactNode;
  store: RootStoreType;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children, store }) => {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

// Хук для использования stores в компонентах
export const useStore = (): RootStoreType => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return store;
};

// Хуки для отдельных stores
export const useAuthStore = () => useStore().authStore;
export const useStorageStore = () => useStore().storageStore;
export const useTemplateStore = () => useStore().templateStore;
export const useObjectStore = () => useStore().objectStore;
