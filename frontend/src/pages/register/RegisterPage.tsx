import { Container, Paper, Text, Button, Stack } from '@mantine/core';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { useAuthStore } from '@app/store/StoreContext';
import logoText from '@shared/assets/icons/logo_text';
import { ROUTES } from '@shared/constants';
import { useZodForm } from '@shared/lib';
import { signupSchema, type SignupSchema } from '@shared/schemas';
import { Input, ThemeToggle } from '@shared/ui';
import GridMotion from '@shared/ui/GridMotion/GridMotion';

import styles from './RegisterPage.module.scss';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    signup,
    isAuthenticated,
    isLoading,
    error,
    clearError: clearErrorFromStore,
  } = useAuthStore();

  const clearError = useCallback(() => {
    clearErrorFromStore();
  }, [clearErrorFromStore]);

  // Локальное состояние для API ошибки
  const [apiError, setApiError] = useState<string | null>(null);

  // Состояние для отслеживания ошибок занятости полей
  const [fieldOccupancyErrors, setFieldOccupancyErrors] = useState<{
    login?: string;
    email?: string;
  }>({});

  const formRef = useRef<HTMLFormElement>(null);

  const form = useZodForm(signupSchema, {
    login: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Мемоизированная проверка совпадения паролей
  const passwordError = useMemo(() => {
    const { password, confirmPassword } = form.values;

    if (confirmPassword && password && password !== confirmPassword) {
      return 'Пароли не совпадают';
    }
    return undefined;
  }, [form.values]);

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
    setFieldOccupancyErrors({});
  }, []); // form стабилен, не добавляем в зависимости

  useEffect(() => {
    clearError();
    setApiError(null);
    resetForm();
  }, [clearError, resetForm]);

  const handleSubmit = async (values: SignupSchema) => {
    // Дополнительная проверка с Zod для отображения всех ошибок
    const validationResult = signupSchema.safeParse(values);

    if (!validationResult.success) {
      // Отображаем ошибки валидации
      validationResult.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof SignupSchema;
        form.setFieldError(field, issue.message);

        // Специально обрабатываем ошибку несовпадения паролей
        if (issue.path[0] === 'confirmPassword' && issue.message === 'Пароли не совпадают') {
          setApiError('Пароли не совпадают');
        }
      });
      return;
    }

    const signupData = {
      login: values.login.trim(),
      email: values.email.trim(),
      password: values.password,
    };

    setApiError(null);

    const { success, error: returnedError } = await signup(signupData);

    if (success) {
      navigate(ROUTES.STORAGE);
    } else {
      const effectiveError = returnedError || error;

      if (effectiveError) {
        // Обрабатываем ошибки занятости полей
        if (effectiveError.includes('логин') || effectiveError.includes('login')) {
          const errorMessage = 'Этот логин уже занят';
          form.setFieldError('login', errorMessage);
          setFieldOccupancyErrors((prev) => ({ ...prev, login: errorMessage }));
        } else if (effectiveError.includes('email') || effectiveError.includes('почт')) {
          const errorMessage = 'Этот email уже занят';
          form.setFieldError('email', errorMessage);
          setFieldOccupancyErrors((prev) => ({ ...prev, email: errorMessage }));
        } else {
          // Показываем общую ошибку для системных ошибок
          if (effectiveError === 'Произошла ошибка' || effectiveError.includes('Произошла')) {
            setApiError('Произошла ошибка');
          }
        }
      }
    }
  };

  const handleInputChange = useCallback(
    (field: keyof SignupSchema, value: string) => {
      form.setFieldValue(field, value);

      // Очищаем ошибку поля при вводе, КРОМЕ ошибок занятости
      if (form.errors[field] && field !== 'confirmPassword') {
        // Не очищаем ошибки занятости полей
        if (!fieldOccupancyErrors[field as keyof typeof fieldOccupancyErrors]) {
          form.clearFieldError(field);
        }
      }

      // Очищаем API ошибку при изменении данных (кроме ошибок занятости)
      if (apiError && !Object.values(fieldOccupancyErrors).some(Boolean)) {
        setApiError(null);
      }
    },
    [apiError, fieldOccupancyErrors, form],
  );

  // Функция для очистки ошибки занятости конкретного поля
  const clearFieldOccupancyError = useCallback(
    (field: 'login' | 'email') => {
      setFieldOccupancyErrors((prev) => {
        const newState = { ...prev };
        delete newState[field];
        return newState;
      });
      form.clearFieldError(field);
    },
    [form],
  );

  // Обработчик изменения логина
  const handleLoginChange = useCallback(
    (value: string) => {
      handleInputChange('login', value);
      // Если была ошибка занятости логина, очищаем её при изменении
      if (fieldOccupancyErrors.login) {
        clearFieldOccupancyError('login');
      }
    },
    [handleInputChange, fieldOccupancyErrors.login, clearFieldOccupancyError],
  );

  // Обработчик изменения email
  const handleEmailChange = useCallback(
    (value: string) => {
      handleInputChange('email', value);
      // Если была ошибка занятости email, очищаем её при изменении
      if (fieldOccupancyErrors.email) {
        clearFieldOccupancyError('email');
      }
    },
    [handleInputChange, fieldOccupancyErrors.email, clearFieldOccupancyError],
  );

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
                <logoText.LogoText />
              </div>
              <Text className={styles.subtitle} ta="center" size="md">
                Создайте аккаунт для управления хранилищами
              </Text>
            </div>

            <form ref={formRef} onSubmit={form.onSubmit(handleSubmit)}>
              <div className={styles.formFields}>
                <Input
                  label="Логин"
                  type="text"
                  value={form.values.login}
                  onChange={handleLoginChange}
                  error={form.errors.login as string}
                  required
                  disabled={isLoading}
                />

                <Input
                  label="Эл. почта"
                  type="email"
                  value={form.values.email}
                  onChange={handleEmailChange}
                  error={form.errors.email as string}
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

                <Input
                  label="Подтвердите пароль"
                  type="password"
                  value={form.values.confirmPassword}
                  onChange={(value) => handleInputChange('confirmPassword', value)}
                  error={passwordError || (form.errors.confirmPassword as string)}
                  required
                  disabled={isLoading}
                />

                {/* Показываем общую ошибку только для 500+ ошибок */}
                {apiError && <div className={styles.error}>{apiError}</div>}

                <Button
                  variant="filled"
                  size="lg"
                  loading={isLoading}
                  fullWidth
                  onClick={() => formRef.current?.requestSubmit()}
                >
                  Зарегистрироваться
                </Button>
              </div>
            </form>

            <Text className={styles.footerText} ta="center" size="sm">
              Уже есть аккаунт?{' '}
              <Link to={ROUTES.LOGIN} className={styles.link}>
                Войти
              </Link>
            </Text>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
};
