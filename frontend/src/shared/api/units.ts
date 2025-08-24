import { API_ENDPOINTS } from '@shared/constants';
import { type Unit } from '@shared/types';

import { api } from './client';

export const unitsApi = {
  // Получение всех единиц измерения
  getUnits: async (): Promise<Unit[]> => {
    try {
      // Добавляем таймаут для предотвращения зависания
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 секунд таймаут

      const response = await api.get<Unit[]>(API_ENDPOINTS.UNITS.LIST, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      console.error('Ошибка загрузки единиц измерения:', error);
      throw error;
    }
  },
};
