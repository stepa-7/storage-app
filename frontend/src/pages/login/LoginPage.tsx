import { Container, Paper, Title, Text, Stack, ActionIcon } from '@mantine/core';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '@app/store/StoreContext';
import { ROUTES, VALIDATION } from '@shared/constants';
import { Input, Button } from '@shared/ui';
import GridMotion from '@shared/ui/GridMotion/GridMotion';

import styles from './LoginPage.module.scss';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signin, isAuthenticated, isLoading, error } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  });

  const formRef = useRef<HTMLFormElement>(null);

  // Перенаправление если уже авторизован
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.STORAGE);
    }
  }, [isAuthenticated, navigate]);

  const validateForm = (): boolean => {
    const errors = {
      email: '',
      password: '',
    };

    // Валидация email
    if (!formData.email) {
      errors.email = 'Email обязателен';
    } else if (!VALIDATION.EMAIL.PATTERN.test(formData.email)) {
      errors.email = 'Неверный формат email';
    } else if (formData.email.length < VALIDATION.EMAIL.MIN_LENGTH) {
      errors.email = `Email должен содержать минимум ${VALIDATION.EMAIL.MIN_LENGTH} символа`;
    } else if (formData.email.length > VALIDATION.EMAIL.MAX_LENGTH) {
      errors.email = `Email не должен превышать ${VALIDATION.EMAIL.MAX_LENGTH} символов`;
    }

    // Валидация пароля
    if (!formData.password) {
      errors.password = 'Пароль обязателен';
    } else if (formData.password.length < VALIDATION.PASSWORD.MIN_LENGTH) {
      errors.password = `Пароль должен содержать минимум ${VALIDATION.PASSWORD.MIN_LENGTH} символов`;
    } else if (formData.password.length > VALIDATION.PASSWORD.MAX_LENGTH) {
      errors.password = `Пароль не должен превышать ${VALIDATION.PASSWORD.MAX_LENGTH} символов`;
    }

    setFormErrors(errors);
    return !errors.email && !errors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const success = await signin(formData);
    if (success) {
      navigate(ROUTES.STORAGE);
    }
  };

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Очищаем ошибку при вводе
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const toggleTheme = () => {
    const root = document.documentElement;
    const current = root.getAttribute('data-mantine-color-scheme') ?? 'light';
    const next = current === 'light' ? 'dark' : 'light';
    root.setAttribute('data-mantine-color-scheme', next);
    try {
      localStorage.setItem('app-color-scheme', next);
    } catch (err) {
      console.warn('Failed to persist color scheme', err);
    }
  };

  return (
    <div className={styles.page}>
      {/* Фон GridMotion */}
      <div className={styles.background}>
        <GridMotion gradientColor="rgba(255,255,255,0.25)" />
      </div>

      {/* SVG фильтр для имитации жидкого стекла */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
        <defs>
          <filter id="glass-distortion">
            <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Переключатель темы */}
      <div className={styles.themeToggle}>
        <ActionIcon
          variant="transparent"
          className={styles.themeButton}
          aria-label="Toggle theme"
          onClick={toggleTheme}
          title="Переключить тему"
        >
          🌓
        </ActionIcon>
      </div>

      <Container size={560} className={styles.container}>
        <Paper shadow="md" p="xl" radius={24} className={styles.form}>
          <Stack gap="lg">
            <div className={styles.header}>
              <Title ta="center" className={styles.title}>
                Vaultify
              </Title>
              <Text className={styles.subtitle} ta="center" size="md">
                Цифровая система хранения
              </Text>
            </div>

            <form ref={formRef} onSubmit={handleSubmit}>
              <div className={styles.formFields}>
                <Input
                  label="Эл. почта"
                  type="email"
                  value={formData.email}
                  onChange={(value) => handleInputChange('email', value)}
                  required
                  disabled={isLoading}
                />

                <Input
                  label="Пароль"
                  type="password"
                  value={formData.password}
                  onChange={(value) => handleInputChange('password', value)}
                  required
                  disabled={isLoading}
                />

                {(formErrors.email || formErrors.password) && (
                  <div className={styles.errorMessage}>
                    {formErrors.email || formErrors.password}
                  </div>
                )}

                {error && <div className={styles.errorMessage}>{error}</div>}

                <Button
                  variant="primary"
                  size="lg"
                  loading={isLoading}
                  className={styles.submitButton}
                  fullWidth
                  onClick={() => formRef.current?.requestSubmit()}
                >
                  Войти
                </Button>
              </div>
            </form>

            <Text className={styles.footerText} ta="center" size="sm">
              Нет аккаунта? <span>Зарегистрироваться</span>
            </Text>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
};
