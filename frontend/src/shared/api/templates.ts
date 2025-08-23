import { API_ENDPOINTS } from '@shared/constants';
import {
  type ObjectTemplate,
  type CreateTemplateRequest,
  type UpdateTemplateRequest,
} from '@shared/types';

import { api } from './client';

export const templatesApi = {
  // Получение списка шаблонов
  getTemplates: async (params?: {
    is_deleted?: boolean;
    name?: string;
  }): Promise<ObjectTemplate[]> => {
    return api.get<ObjectTemplate[]>(API_ENDPOINTS.TEMPLATES.LIST, { params });
  },

  // Получение активных шаблонов
  getActiveTemplates: async (): Promise<ObjectTemplate[]> => {
    return api.get<ObjectTemplate[]>(`${API_ENDPOINTS.TEMPLATES.LIST}?is_deleted=false`);
  },

  // Получение шаблона по ID
  getTemplate: async (id: string): Promise<ObjectTemplate> => {
    return api.get<ObjectTemplate>(API_ENDPOINTS.TEMPLATES.GET(id));
  },

  // Создание нового шаблона
  createTemplate: async (data: CreateTemplateRequest): Promise<ObjectTemplate> => {
    const backendData = {
      name: data.name,
      description: data.description || '',
      schema: data.schema,
    };
    return api.post<ObjectTemplate>(API_ENDPOINTS.TEMPLATES.CREATE, backendData);
  },

  // Обновление шаблона
  updateTemplate: async (id: string, data: UpdateTemplateRequest): Promise<ObjectTemplate> => {
    const backendData: Partial<{
      name: string;
      description: string;
      is_deleted: boolean;
    }> = {};
    if (data.name) backendData.name = data.name;
    if (data.description) backendData.description = data.description;
    if (data.is_deleted !== undefined) backendData.is_deleted = data.is_deleted;

    return api.patch<ObjectTemplate>(API_ENDPOINTS.TEMPLATES.UPDATE(id), backendData);
  },

  // Удаление шаблона
  deleteTemplate: async (id: string): Promise<void> => {
    return api.delete(API_ENDPOINTS.TEMPLATES.DELETE(id));
  },
};
