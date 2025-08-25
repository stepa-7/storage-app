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
    deleted?: boolean;
    name?: string;
  }): Promise<ObjectTemplate[]> => {
    const templates = await api.get<ObjectTemplate[]>(API_ENDPOINTS.TEMPLATES.LIST, { params });
    return templates;
  },

  // Получение активных шаблонов
  getActiveTemplates: async (): Promise<ObjectTemplate[]> => {
    return api.get<ObjectTemplate[]>(`${API_ENDPOINTS.TEMPLATES.LIST}?deleted=false`);
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
      deleted: boolean;
    }> = {};
    if (data.name) backendData.name = data.name;
    if (data.description) backendData.description = data.description;
    if (data.deleted !== undefined) backendData.deleted = data.deleted;

    return api.patch<ObjectTemplate>(API_ENDPOINTS.TEMPLATES.UPDATE(id), backendData);
  },

  // Удаление шаблона (деактивация через DELETE)
  deleteTemplate: async (id: string): Promise<void> => {
    try {
      await api.delete(API_ENDPOINTS.TEMPLATES.DELETE(id));
    } catch (error) {
      console.error('API: Ошибка в DELETE запросе:', error);
      throw error;
    }
  },
};
