import { makeAutoObservable, runInAction } from 'mobx';

// import { authApi } from '@shared/api'; // ЗАКОММЕНТИРОВАНО: используется только в заглушках
import { setAccessToken, clearAccessToken } from '@shared/api/client';
import type { User, SigninRequest, ApiError } from '@shared/types';

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
    // Проверяем, есть ли пользователь в памяти
    // Refresh token автоматически передается в HTTP-only cookie
    // Access token будет получен при первом запросе через interceptor
    if (this.user) {
      this.isAuthenticated = true;
    }
  };

  // Вход в систему
  signin = async (credentials: SigninRequest): Promise<boolean> => {
    this.setLoading(true);
    this.clearError();

    try {
      // ВРЕМЕННАЯ ЗАГЛУШКА: принимаем любые данные для тестирования
      // TODO: Убрать после подключения бэкенда
      const mockUser: User = {
        id: '1',
        email: credentials.email,
        roles: ['USER'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockToken = 'mock-token-' + Date.now();

      runInAction(() => {
        this.user = mockUser;
        this.isAuthenticated = true;
        this.error = null;
      });

      // Сохраняем access token в памяти (refresh token автоматически в HTTP-only cookie)
      setAccessToken(mockToken);

      return true;

      // ЗАКОММЕНТИРОВАНО: оригинальный код для бэкенда
      /*
      const response = await authApi.signin(credentials);
      
      runInAction(() => {
        this.user = response.user;
        this.isAuthenticated = true;
        this.error = null;
      });

      // Сохраняем access token в памяти (refresh token автоматически в HTTP-only cookie)
      setAccessToken(response.accessToken);

      return true;
      */
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.message || 'Ошибка входа в систему';
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Регистрация
  signup = async (): Promise<boolean> => {
    this.setLoading(true);
    this.clearError();

    try {
      // ВРЕМЕННАЯ ЗАГЛУШКА: всегда успешно
      // TODO: Убрать после подключения бэкенда
      runInAction(() => {
        this.error = null;
      });
      return true;

      // ЗАКОММЕНТИРОВАНО: оригинальный код для бэкенда
      /*
      await authApi.signup(userData);
      runInAction(() => {
        this.error = null;
      });
      return true;
      */
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.message || 'Ошибка регистрации';
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Выход из системы
  logout = async (): Promise<void> => {
    try {
      // ВРЕМЕННАЯ ЗАГЛУШКА: просто очищаем данные
      // TODO: Убрать после подключения бэкенда
      // await authApi.logout();
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
      // ВРЕМЕННАЯ ЗАГЛУШКА: просто возвращаем true если есть пользователь
      // TODO: Убрать после подключения бэкенда
      if (this.user) {
        return true;
      }

      // ЗАКОММЕНТИРОВАНО: оригинальный код для бэкенда
      /*
      const response = await authApi.refresh();
      
      runInAction(() => {
        this.user = response.user;
        this.isAuthenticated = true;
      });

      // Обновляем access token в памяти
      setAccessToken(response.accessToken);

      return true;
      */

      return false;
    } catch {
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
    // Refresh token автоматически удаляется сервером из HTTP-only cookie
  };

  // Установка состояния загрузки
  private setLoading = (loading: boolean) => {
    this.isLoading = loading;
  };

  // Очистка ошибки
  private clearError = () => {
    this.error = null;
  };

  // Получение ролей пользователя
  get userRoles(): string[] {
    return this.user?.roles || [];
  }

  // Проверка, является ли пользователь администратором
  get isAdmin(): boolean {
    return this.userRoles.includes('ADMIN');
  }
}
