import {
  AppShell,
  Group,
  Text,
  Button,
  Avatar,
  Menu,
  UnstyledButton,
  ActionIcon,
} from '@mantine/core';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { useAuthStore } from '@app/store/StoreContext';
import { ROUTES } from '@shared/constants';

import styles from './Header.module.scss';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const isActiveRoute = (route: string): boolean => {
    return location.pathname.startsWith(route);
  };

  const navigationItems = [
    { label: 'Хранилища', route: ROUTES.STORAGE },
    { label: 'Шаблоны', route: ROUTES.TEMPLATES },
  ];

  // Кнопка переключения темы: используем documentElement dataset, чтобы сигнально переключать
  const toggleTheme = () => {
    const root = document.documentElement;
    const current = root.getAttribute('data-mantine-color-scheme') ?? 'light';
    const next = current === 'light' ? 'dark' : 'light';
    root.setAttribute('data-mantine-color-scheme', next);
    // Сохраним настройку, чтобы не потерять при перезагрузке (совместимо с AppThemeProvider)
    try {
      localStorage.setItem('app-color-scheme', next);
    } catch (err) {
      console.warn('Failed to persist color scheme', err);
    }
  };

  return (
    <AppShell.Header className={styles.header}>
      <div className={styles.container}>
        {/* Логотип и название */}
        <Group className={styles.brand}>
          <div className={styles.logo}>□</div>
          <Text size="xl" fw={700} className={styles.title}>
            Система хранения
          </Text>
        </Group>

        {/* Навигация */}
        <nav className={styles.navigation}>
          {navigationItems.map((item) => (
            <Button
              key={item.route}
              variant="transparent"
              onClick={() => navigate(item.route)}
              className={`${styles.navItem} ${isActiveRoute(item.route) ? styles.active : ''}`}
            >
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Пользователь и переключатель темы */}
        <Group className={styles.userSection}>
          <ActionIcon
            variant="transparent"
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label="Переключить тему"
          >
            🌓
          </ActionIcon>

          <Menu shadow="md" width={200}>
            <Menu.Target>
              <UnstyledButton className={styles.userButton}>
                <Group>
                  <Avatar size="sm" radius="xl" />
                  <div className={styles.userInfo}>
                    <Text size="sm" fw={500}>
                      {user?.email || 'Пользователь'}
                    </Text>
                  </div>
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item onClick={handleLogout}>Выйти</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </div>
    </AppShell.Header>
  );
};
