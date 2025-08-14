import { API_ENDPOINTS } from '@shared/constants';
import {
  type ObjectTemplate,
  type CreateTemplateRequest,
  type PaginatedResponse,
} from '@shared/types';

import { api } from './client';

export const templatesApi = {
  // Получение списка шаблонов
  getTemplates: async (page = 1, limit = 20): Promise<PaginatedResponse<ObjectTemplate>> => {
    return api.get<PaginatedResponse<ObjectTemplate>>(
      `${API_ENDPOINTS.TEMPLATES.LIST}?page=${page}&limit=${limit}`,
    );
  },

  // Получение активных шаблонов
  getActiveTemplates: async (): Promise<ObjectTemplate[]> => {
    return api.get<ObjectTemplate[]>(`${API_ENDPOINTS.TEMPLATES.LIST}?isActive=true`);
  },

  // Получение шаблона по ID
  getTemplate: async (id: string): Promise<ObjectTemplate> => {
    return api.get<ObjectTemplate>(API_ENDPOINTS.TEMPLATES.GET(id));
  },

  // Создание нового шаблона
  createTemplate: async (data: CreateTemplateRequest): Promise<ObjectTemplate> => {
    return api.post<ObjectTemplate>(API_ENDPOINTS.TEMPLATES.CREATE, data);
  },

  // Обновление шаблона
  updateTemplate: async (
    id: string,
    data: Partial<CreateTemplateRequest>,
  ): Promise<ObjectTemplate> => {
    return api.put<ObjectTemplate>(API_ENDPOINTS.TEMPLATES.UPDATE(id), data);
  },

  // Удаление шаблона
  deleteTemplate: async (id: string): Promise<void> => {
    return api.delete(API_ENDPOINTS.TEMPLATES.DELETE(id));
  },

  // Активация/деактивация шаблона
  toggleTemplateStatus: async (id: string, isActive: boolean): Promise<ObjectTemplate> => {
    return api.patch<ObjectTemplate>(`/templates/${id}/status`, { isActive });
  },
};
