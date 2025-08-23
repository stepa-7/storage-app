import { Container, Paper, Text, Stack, Button } from '@mantine/core';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { useAuthStore } from '@app/store/StoreContext';
import LogoText from '@shared/assets/icons/logo_text/logo_text.svg?react';
import { ROUTES } from '@shared/constants';
import { useZodForm } from '@shared/lib';
import { signinSchema, type SigninSchema } from '@shared/schemas';
import { Input, ThemeToggle } from '@shared/ui';
import GridMotion from '@shared/ui/GridMotion/GridMotion';

import styles from './LoginPage.module.scss';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    signin,
    isAuthenticated,
    isLoading,
    error,
    clearError: clearErrorFromStore,
  } = useAuthStore();

  const clearError = useCallback(() => {
    clearErrorFromStore();
  }, [clearErrorFromStore]);

  // Локальное состояние для ошибки API
  const [apiError, setApiError] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  const form = useZodForm(signinSchema, {
    login: '',
    password: '',
  });

  // Перенаправление если уже авторизован
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.STORAGE);
    }
  }, [isAuthenticated, navigate]);

  // Очистка ошибок при монтировании компонента
  const resetForm = useCallback(() => {
    form.clearErrors();
    form.reset();
  }, []); // form стабилен, не добавляем в зависимости

  useEffect(() => {
    clearError();
    setApiError(null);
    resetForm();
  }, [clearError, resetForm]);

  const handleSubmit = async (values: SigninSchema) => {
    setApiError(null);

    const { success, error: returnedError } = await signin(values);
    if (success) {
      navigate(ROUTES.STORAGE);
    } else {
      const effectiveError = returnedError || error || 'Произошла ошибка';

      // Под формой показываем системные ошибки и ошибки аутентификации
      if (
        effectiveError === 'Пользователь не найден' ||
        effectiveError === 'Произошла ошибка' ||
        effectiveError === 'Неверный логин или пароль' ||
        effectiveError.includes('Неверный') ||
        effectiveError.includes('неверный')
      ) {
        setApiError(effectiveError);
      } else {
        // Остальные ошибки пытаемся привязать к конкретным полям
        if (effectiveError.includes('логин') || effectiveError.includes('login')) {
          form.setFieldError('login', effectiveError);
        } else if (effectiveError.includes('пароль') || effectiveError.includes('password')) {
          form.setFieldError('password', effectiveError);
        } else {
          // Если не можем определить поле - показываем под формой
          setApiError(effectiveError);
        }
      }
    }
  };

  const handleInputChange = (field: keyof SigninSchema, value: string) => {
    form.setFieldValue(field, value);
    // Очищаем ошибку поля при вводе
    if (form.errors[field]) {
      form.clearFieldError(field);
    }
    if (apiError) {
      setApiError(null);
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
        <ThemeToggle size="xl" radius="md" />
      </div>

      <Container size={560} className={styles.container}>
        <Paper shadow="md" p="xl" radius={24} className={styles.form}>
          <Stack gap="lg">
            <div className={styles.header}>
              <div className={styles.logoContainer}>
                <LogoText />
              </div>
              <Text className={styles.subtitle} ta="center" size="md">
                Цифровая система хранения
              </Text>
            </div>

            <form ref={formRef} onSubmit={form.onSubmit(handleSubmit)}>
              <div className={styles.formFields}>
                <Input
                  label="Логин"
                  type="text"
                  value={form.values.login}
                  onChange={(value) => handleInputChange('login', value)}
                  error={form.errors.login as string}
                  required
                  disabled={isLoading}
                />

                <Input
                  label="Пароль"
                  type="password"
                  value={form.values.password}
                  onChange={(value) => handleInputChange('password', value)}
                  error={form.errors.password as string}
                  required
                  disabled={isLoading}
                />

                {(apiError || error) && <div className={styles.error}>{apiError || error}</div>}

                <Button
                  variant="filled"
                  size="lg"
                  loading={isLoading}
                  fullWidth
                  onClick={() => formRef.current?.requestSubmit()}
                >
                  Войти
                </Button>
              </div>
            </form>

            <Text className={styles.footerText} ta="center" size="sm">
              Нет аккаунта?{' '}
              <Link to={ROUTES.REGISTER} className={styles.link}>
                Зарегистрироваться
              </Link>
            </Text>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
};
