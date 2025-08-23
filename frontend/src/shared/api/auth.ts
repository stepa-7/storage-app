import { API_ENDPOINTS } from '@shared/constants';
import type { AuthResponse, SigninRequest, SignupRequest } from '@shared/types';

import { api } from './client';

export const authApi = {
  // Вход в систему
  signin: async (credentials: SigninRequest): Promise<AuthResponse> => {
    return api.post<AuthResponse>(API_ENDPOINTS.AUTH.SIGNIN, credentials);
  },

  // Регистрация нового пользователя
  signup: async (userData: SignupRequest): Promise<{ signup: string }> => {
    return api.post<{ signup: string }>(API_ENDPOINTS.AUTH.SIGNUP, userData);
  },

  // Обновление access token по refresh token из HTTP-only cookie
  refresh: async (): Promise<AuthResponse> => {
    return api.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH);
  },

  // Выход из системы
  logout: async (): Promise<{ logout: string }> => {
    return api.post<{ logout: string }>(API_ENDPOINTS.AUTH.LOGOUT);
  },
};
