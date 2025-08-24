import { AppShell } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import '@mantine/core/styles.css';
import { LoginPage } from '@pages/login';
import { ObjectNewPage } from '@pages/object-new';
import { ObjectViewPage } from '@pages/object-view';
import { RegisterPage } from '@pages/register';
import { StoragePage } from '@pages/storage';
import { StorageViewPage } from '@pages/storage-view';
import { TemplatesPage } from '@pages/templates';
import { ROUTES } from '@shared/constants';
import { HeaderSimple } from '@widgets/header-simple';
import { TreeNavbar } from '@widgets/tree-navbar';
import { NavbarProvider, useNavbar } from '@widgets/tree-navbar/NavbarContext';
// import { Sidebar } from '@widgets/sidebar';

import { rootStore } from './store';
import { StoreProvider, useAuthStore, useStore } from './store/StoreContext';
import { AppThemeProvider } from './ThemeProvider';

import '@mantine/notifications/styles.css';
import './App.css';

const AppContentInner: React.FC = observer(() => {
  const { isAuthenticated } = useAuthStore();
  const { initialize } = useStore();
  const { navbarWidth } = useNavbar();
  // const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      initialize()
        .then(() => {
          // App: Initialize completed
        })
        .catch((error) => {
          console.error('App: Initialize failed:', error);
        });
    }
  }, [isAuthenticated, initialize]);

  // const handleSidebarToggle = () => {
  //   setSidebarOpen(!sidebarOpen);
  // };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    );
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: navbarWidth, breakpoint: 'sm' }}
      padding={0}
      className="app-shell"
      layout="alt"
    >
      {/* Skip link для доступности */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          zIndex: 999,
          padding: '8px',
          background: '#000',
          color: '#fff',
          textDecoration: 'none',
        }}
        onFocus={(e) => {
          e.target.style.left = '8px';
          e.target.style.top = '8px';
        }}
        onBlur={(e) => {
          e.target.style.left = '-9999px';
        }}
      >
        Перейти к основному содержимому
      </a>

      <AppShell.Header>
        {/* <Header onSidebarToggle={handleSidebarToggle} sidebarOpen={sidebarOpen} />*/}
        <HeaderSimple />
      </AppShell.Header>

      <AppShell.Navbar>
        <TreeNavbar />
      </AppShell.Navbar>

      {/* <Sidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} /> */}

      <AppShell.Main id="main-content" role="main">
        <Routes>
          <Route path={ROUTES.STORAGE} element={<StoragePage />} />
          <Route path={ROUTES.STORAGE_VIEW} element={<StorageViewPage />} />
          <Route path={ROUTES.TEMPLATES} element={<TemplatesPage />} />
          <Route path={ROUTES.OBJECT_NEW} element={<ObjectNewPage />} />
          <Route path={ROUTES.OBJECT_VIEW} element={<ObjectViewPage />} />
          <Route path="*" element={<Navigate to={ROUTES.STORAGE} replace />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
});

const AppContent: React.FC = observer(() => {
  return (
    <NavbarProvider>
      <AppContentInner />
    </NavbarProvider>
  );
});

const App: React.FC = () => {
  return (
    <AppThemeProvider>
      {/* Глобальный SVG фильтр для liquid glass эффекта */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
        <defs>
          <filter id="card-glass-distortion">
            <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="3"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

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
