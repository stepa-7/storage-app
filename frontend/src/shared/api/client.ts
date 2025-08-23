import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { API_BASE_URL, TOKEN_STORAGE_KEY } from '@shared/constants';
import type { ApiError } from '@shared/types';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor для добавления access token в заголовки
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.error('API Request - No token, no Authorization header');
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
    const isAuthPath = /\/auth\/(signin|signup|refresh)/.test(url);
    if (status401 && !originalRequest._retry && !isAuthPath) {
      originalRequest._retry = true;

      try {
        // Пытаемся обновить access token используя refresh token из HTTP-only cookie
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const { accessToken } = refreshResponse.data;

        // Сохраняем новый access token в памяти
        setAccessToken(accessToken);

        // Повторяем оригинальный запрос с новым токеном
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch {
        // Если не удалось обновить токен, пробрасываем исходную ошибку
        clearAccessToken();
        return Promise.reject(error);
      }
    }

    let errorMessage = 'Произошла ошибка';
    const status = error.response?.status as number | undefined;
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
      errorMessage = 'Произошла ошибка';
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
export { getAccessToken, setAccessToken, clearAccessToken };

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
