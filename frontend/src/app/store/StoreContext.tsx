import React, { createContext, useContext, type ReactNode } from 'react';

import { type RootStore } from './index';

const StoreContext = createContext<RootStore | null>(null);

interface StoreProviderProps {
  children: ReactNode;
  store: RootStore;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children, store }) => {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

export const useStore = (): RootStore => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return store;
};

export const useAuthStore = () => useStore().authStore;
export const useStorageStore = () => useStore().storageStore;
export const useTemplateStore = () => useStore().templateStore;
export const useObjectStore = () => useStore().objectStore;
export const useUnitStore = () => useStore().unitStore;
