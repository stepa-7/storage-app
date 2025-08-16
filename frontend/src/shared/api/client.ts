import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { API_BASE_URL } from '@shared/constants';
import type { ApiError } from '@shared/types';

// Создаем базовый экземпляр Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Включаем передачу cookies для refresh токена
});

// Interceptor для добавления access token в заголовки
apiClient.interceptors.request.use(
  (config) => {
    // Получаем access token из памяти (не из localStorage)
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

    // Если ошибка 401 и это не повторный запрос
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Пытаемся обновить access token используя refresh token из HTTP-only cookie
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }, // Важно: передаем cookies
        );

        const { accessToken } = refreshResponse.data;

        // Сохраняем новый access token в памяти
        setAccessToken(accessToken);

        // Повторяем оригинальный запрос с новым токеном
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Если не удалось обновить токен, очищаем данные и перенаправляем на логин
        clearAccessToken();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Обработка других ошибок
    const apiError: ApiError = {
      message: error.response?.data?.message || 'Произошла ошибка',
      code: error.response?.data?.code,
      details: error.response?.data?.details,
    };

    return Promise.reject(apiError);
  },
);

// Функции для работы с access token в памяти (не в localStorage)
let accessToken: string | null = null;

const getAccessToken = (): string | null => {
  return accessToken;
};

const setAccessToken = (token: string): void => {
  accessToken = token;
};

const clearAccessToken = (): void => {
  accessToken = null;
};

// Экспортируем функции для использования в stores
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
