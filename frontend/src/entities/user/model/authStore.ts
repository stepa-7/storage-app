import { makeAutoObservable, runInAction } from 'mobx';

import { authApi } from '@shared/api';
import { setAccessToken, clearAccessToken } from '@shared/api/client';
import type { User, SigninRequest, SignupRequest, ApiError, AuthErrorType } from '@shared/types';
import { getAuthErrorMessage } from '@shared/types';

// Ключи для localStorage
const AUTH_STORAGE_KEY = 'auth_user';
const TOKEN_STORAGE_KEY = 'auth_token';

export class AuthStore {
  user: User | null = null;
  isAuthenticated = false;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.initializeAuth();
  }

  // Инициализация аутентификации при загрузке приложения
  private initializeAuth = () => {
    try {
      // Пытаемся восстановить состояние из localStorage
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

      if (savedUser && savedToken) {
        const user = JSON.parse(savedUser);
        runInAction(() => {
          this.user = user;
          this.isAuthenticated = true;
        });

        // Восстанавливаем токен в API клиенте
        setAccessToken(savedToken);
      }
    } catch (error) {
      console.error('Error in initializeAuth:', error);
      this.clearAuth();
    }
  };

  // Сохранение состояния в localStorage
  private saveAuthToStorage = (user: User) => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      // localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch {
      // Игнорируем ошибки localStorage
    }
  };

  // Очистка состояния из localStorage
  private clearAuthFromStorage = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // Игнорируем ошибки localStorage
    }
  };

  // Вход в систему
  signin = async (
    credentials: SigninRequest,
  ): Promise<{ success: boolean; error?: string; code?: AuthErrorType }> => {
    this.setLoading(true);
    // НЕ очищаем ошибку здесь, чтобы она отображалась в UI
    // this.clearError();

    try {
      const response = await authApi.signin(credentials);

      // Создаем пользователя на основе логина (API не возвращает user)
      const user: User = {
        id: 1,
        login: credentials.login,
        mail: credentials.login, // Временно используем логин как email
        role: ['GUEST'],
      };

      runInAction(() => {
        this.user = user;
        this.isAuthenticated = true;
        this.error = null; // Очищаем ошибку только при успехе
      });

      // Сохраняем access token в памяти (refresh token автоматически в HTTP-only cookie)
      console.log('AuthStore - signin - response.accessToken:', response.accessToken);
      setAccessToken(response.accessToken);

      // Сохраняем состояние в localStorage
      this.saveAuthToStorage(user);

      // Проверяем, что токен сохранился
      const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      console.log(
        'AuthStore - signin - savedToken in localStorage:',
        savedToken ? 'Present' : 'Missing',
      );

      return { success: true };
    } catch (error) {
      const apiError = error as ApiError;

      // Проверяем, является ли ошибка известной ошибкой аутентификации
      const errorType = apiError.error as AuthErrorType;
      let errorMessage = 'Ошибка входа в систему';
      let code: AuthErrorType | undefined;

      if (errorType === 'invalid_credentials') {
        code = errorType;
        errorMessage = getAuthErrorMessage(errorType);
      } else if (apiError.error) {
        errorMessage = apiError.error;
      }

      runInAction(() => {
        this.error = errorMessage;
      });
      return { success: false, error: errorMessage, code };
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Регистрация
  signup = async (
    credentials: SignupRequest,
  ): Promise<{ success: boolean; error?: string; code?: AuthErrorType }> => {
    this.setLoading(true);
    // НЕ очищаем ошибку здесь, чтобы она отображалась в UI
    // this.clearError();

    try {
      await authApi.signup(credentials);
      runInAction(() => {
        this.error = null; // Очищаем ошибку только при успехе
      });
      return { success: true };
    } catch (error) {
      const apiError = error as ApiError;

      // Проверяем, является ли ошибка известной ошибкой аутентификации
      const errorType = apiError.error as AuthErrorType;
      let errorMessage = 'Ошибка регистрации';
      let code: AuthErrorType | undefined;

      if (['login_exists', 'email_exists'].includes(errorType)) {
        code = errorType;
        errorMessage = getAuthErrorMessage(errorType);
      } else if (apiError.error) {
        errorMessage = apiError.error;
      }

      runInAction(() => {
        this.error = errorMessage;
      });
      return { success: false, error: errorMessage, code };
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Выход из системы
  logout = async (): Promise<void> => {
    try {
      await authApi.logout();
      // Refresh token автоматически удаляется сервером из HTTP-only cookie
    } catch {
      // Игнорируем ошибки при выходе
    } finally {
      this.clearAuth();
    }
  };

  // Обновление токена
  refreshToken = async (): Promise<boolean> => {
    try {
      const response = await authApi.refresh();

      // Создаем пользователя на основе токена
      const user: User = {
        id: 1,
        login: 'user',
        mail: 'user@example.com',
        role: ['GUEST'],
      };

      runInAction(() => {
        this.user = user;
        this.isAuthenticated = true;
      });

      // Обновляем access token в памяти
      setAccessToken(response.accessToken);

      return true;
    } catch (error) {
      const apiError = error as ApiError;

      // Проверяем, является ли ошибка известной ошибкой аутентификации
      const errorType = apiError.error as AuthErrorType;
      if (errorType === 'refresh_invalid_or_expired') {
        runInAction(() => {
          this.error = getAuthErrorMessage(errorType);
        });
      }

      this.clearAuth();
      return false;
    }
  };

  // Инициализация данных пользователя
  initialize = async (): Promise<void> => {
    if (this.isAuthenticated && this.user) {
      try {
        // Проверяем валидность токена, пытаясь обновить его
        await this.refreshToken();
      } catch {
        // Если не удалось обновить токен, очищаем аутентификацию
        this.clearAuth();
      }
    }
  };

  // Очистка данных аутентификации
  private clearAuth = () => {
    runInAction(() => {
      this.user = null;
      this.isAuthenticated = false;
      this.error = null;
    });

    // Очищаем access token из памяти
    clearAccessToken();

    // Очищаем состояние из localStorage
    this.clearAuthFromStorage();

    // Refresh token автоматически удаляется сервером из HTTP-only cookie
  };

  // Установка состояния загрузки
  private setLoading = (loading: boolean) => {
    this.isLoading = loading;
  };

  // Очистка ошибки
  clearError = () => {
    this.error = null;
  };

  // Получение ролей пользователя
  get userRoles(): string[] {
    return this.user?.role || [];
  }

  // Проверка, является ли пользователь администратором
  get isAdmin(): boolean {
    return this.userRoles.includes('ADMIN');
  }
}
