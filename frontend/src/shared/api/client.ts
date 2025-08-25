import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { API_BASE_URL, TOKEN_STORAGE_KEY } from '@shared/constants';
import type { ApiError } from '@shared/types';

// Импортируем AuthStore для вызова clearAuth
import { rootStore } from '../../app/store';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// Single-flight для refresh токена (определяем ПОСЛЕ создания apiClient)
let refreshPromise: Promise<string> | null = null;

async function doRefresh(): Promise<string> {
  // Используем axios напрямую для refresh, чтобы избежать рекурсии
  const resp = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
  const { accessToken } = resp.data;
  setAccessToken(accessToken);
  return accessToken;
}

// Interceptor для добавления access token в заголовки и обработки FormData
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Не логируем ошибку для auth endpoints, так как токен там не нужен
      const url = config.url || '';
      const fullUrl = config.baseURL ? `${config.baseURL}${url}` : url;
      try {
        const isAuthPath = /\/auth\/(signin|signup|refresh)/.test(new URL(fullUrl).pathname);
        if (!isAuthPath) {
          console.warn('API Request - No token for non-auth endpoint:', url);
        }
      } catch {
        // Если не удалось распарсить URL, используем простую проверку
        const isAuthPath = /\/auth\/(signin|signup|refresh)/.test(url);
        if (!isAuthPath) {
          console.warn('API Request - No token for non-auth endpoint:', url);
        }
      }
    }

    // Автоматически управляем Content-Type заголовком
    if (config.data instanceof FormData) {
      // Для FormData убираем Content-Type - браузер сам установит boundary
      delete config.headers['Content-Type'];
    } else if (config.data && typeof config.data === 'object' && !config.headers['Content-Type']) {
      // Для JSON данных устанавливаем Content-Type если не задан
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor для обработки ответов и ошибок
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Если ошибка 401 и это не повторный запрос — пробуем refresh, НО не для /auth/*
    const status401 = error.response?.status === 401;
    const url: string = originalRequest?.url || '';
    // Улучшенная проверка auth paths с учетом baseURL
    const fullUrl = originalRequest?.baseURL ? `${originalRequest.baseURL}${url}` : url;
    let isAuthPath = false;
    try {
      isAuthPath = /\/auth\/(signin|signup|refresh)/.test(new URL(fullUrl).pathname);
    } catch {
      // Если не удалось распарсить URL, используем простую проверку
      isAuthPath = /\/auth\/(signin|signup|refresh)/.test(url);
    }
    if (status401 && !originalRequest._retry && !isAuthPath) {
      originalRequest._retry = true;

      try {
        // Single-flight refresh - если уже идет обновление, ждем его
        refreshPromise = refreshPromise ?? doRefresh();
        const newAccess = await refreshPromise;
        refreshPromise = null;

        // Повторяем оригинальный запрос с новым токеном
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return apiClient(originalRequest);
      } catch {
        refreshPromise = null;
        // Если не удалось обновить токен, полностью выходим
        clearAccessToken();
        rootStore.authStore.clearAuth(); // очищаем состояние AuthStore
        // Возвращаем оригинальную ошибку, а не ошибку refresh
        return Promise.reject(error);
      }
    }

    let errorMessage = 'Произошла ошибка';
    const status = error.response?.status as number | undefined;

    // Логируем ошибку для отладки
    console.error('API Error:', {
      status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
      error: error.message,
    });

    // 401 ошибки для auth endpoints или когда refresh не сработал
    if (status === 401) {
      const responseData = error.response?.data;
      if (typeof responseData === 'string') {
        errorMessage = responseData;
      } else if (responseData?.error) {
        errorMessage = responseData.error;
      } else {
        errorMessage = 'invalid_credentials';
      }
    } else if (status === 400) {
      const responseData = error.response.data;

      if (typeof responseData === 'string') {
        errorMessage = responseData;
      } else if (responseData?.error) {
        errorMessage = responseData.error;
      }
    } else if (status === 404) {
      errorMessage = 'Пользователь не найден';
    } else if (status && status >= 500) {
      // Детальная обработка 500 ошибок
      const responseData = error.response?.data;
      if (typeof responseData === 'string') {
        errorMessage = `Ошибка сервера: ${responseData}`;
      } else if (responseData?.error) {
        errorMessage = `Ошибка сервера: ${responseData.error}`;
      } else if (responseData?.message) {
        errorMessage = `Ошибка сервера: ${responseData.message}`;
      } else {
        errorMessage = 'Внутренняя ошибка сервера';
      }
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    const apiError: ApiError = {
      error: errorMessage,
      status,
    };

    return Promise.reject(apiError);
  },
);

const getAccessToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

const setAccessToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    console.error('Could not set access token in localStorage');
  }
};

const clearAccessToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    console.error('Could not remove access token from localStorage');
  }
};

// Экспорт функций для использования в stores
export { getAccessToken, setAccessToken, clearAccessToken, TOKEN_STORAGE_KEY };

// Типизированные методы для работы с API
export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.get(url, config).then((response) => response.data),

  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.post(url, data, config).then((response) => response.data),

  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.put(url, data, config).then((response) => response.data),

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.delete(url, config).then((response) => response.data),

  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.patch(url, data, config).then((response) => response.data),
};

export default apiClient;
