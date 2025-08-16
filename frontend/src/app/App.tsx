import { AppShell } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { LoginPage } from '@pages/login';
import { ObjectNewPage } from '@pages/object-new';
import { ObjectViewPage } from '@pages/object-view';
import { StoragePage } from '@pages/storage';
import { TemplatesPage } from '@pages/templates';
import { ROUTES } from '@shared/constants';
import { Header } from '@widgets/header';

import { rootStore } from './store';
import { StoreProvider, useAuthStore } from './store/StoreContext';
import { AppThemeProvider } from './ThemeProvider';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import './App.css';

// Основной контент приложения
const AppContent: React.FC = observer(() => {
  const { isAuthenticated, initialize } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      initialize();
    }
  }, [isAuthenticated, initialize]);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    );
  }

  return (
    <AppShell header={{ height: 60 }} padding="md" className="app-shell">
      <AppShell.Header>
        <Header />
      </AppShell.Header>

      <AppShell.Main>
        <Routes>
          <Route path={ROUTES.STORAGE} element={<StoragePage />} />
          <Route path={ROUTES.STORAGE_VIEW} element={<StoragePage />} />
          <Route path={ROUTES.TEMPLATES} element={<TemplatesPage />} />
          <Route path={ROUTES.OBJECT_NEW} element={<ObjectNewPage />} />
          <Route path={ROUTES.OBJECT_VIEW} element={<ObjectViewPage />} />
          <Route path="*" element={<Navigate to={ROUTES.STORAGE} replace />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
});

// Главный компонент приложения
const App: React.FC = () => {
  return (
    <AppThemeProvider>
      <Notifications position="top-right" zIndex={1000} />
      <StoreProvider store={rootStore}>
        <Router>
          <AppContent />
        </Router>
      </StoreProvider>
    </AppThemeProvider>
  );
};

export default App;
