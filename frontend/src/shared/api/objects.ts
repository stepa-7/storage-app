import { API_ENDPOINTS } from '@shared/constants';
import {
  type StorageObject,
  type CreateObjectRequest,
  type UpdateObjectRequest,
} from '@shared/types';

import { api } from './client';

export const objectsApi = {
  // Получение списка объектов
  getObjects: async (params?: {
    storage_id?: string;
    template_id?: string;
    decommissioned?: boolean;
  }): Promise<StorageObject[]> => {
    return api.get<StorageObject[]>(API_ENDPOINTS.OBJECTS.LIST, { params });
  },

  // Получение объекта по ID
  getObject: async (id: string): Promise<StorageObject> => {
    return api.get<StorageObject>(API_ENDPOINTS.OBJECTS.GET(id));
  },

  // Создание нового объекта
  createObject: async (data: CreateObjectRequest): Promise<StorageObject> => {
    const formData = new FormData();

    // Добавляем основные данные
    formData.append('name', data.name);
    formData.append('template_id', data.template_id);
    formData.append('storage_id', data.storage_id);
    formData.append('size', String(data.size));
    formData.append('unit_id', data.unit_id);

    // Добавляем атрибуты как JSON строку
    formData.append('attributes', JSON.stringify(data.attributes));

    // Добавляем фото, если есть
    if (data.photo) {
      formData.append('photo', data.photo);
    }

    return api.post<StorageObject>(API_ENDPOINTS.OBJECTS.CREATE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Обновление объекта
  updateObject: async (id: string, data: UpdateObjectRequest): Promise<StorageObject> => {
    if (data.photo) {
      // Если есть файл, используем multipart/form-data
      const formData = new FormData();

      if (data.name) formData.append('name', data.name);
      if (data.storage_id) formData.append('storage_id', data.storage_id);
      if (data.size) formData.append('size', String(data.size));
      if (data.attributes) formData.append('attributes', JSON.stringify(data.attributes));
      if (data.is_decommissioned !== undefined)
        formData.append('is_decommissioned', String(data.is_decommissioned));
      if (data.photo) formData.append('photo', data.photo);

      return api.patch<StorageObject>(API_ENDPOINTS.OBJECTS.UPDATE(id), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      // Если файла нет, используем JSON
      return api.patch<StorageObject>(API_ENDPOINTS.OBJECTS.UPDATE(id), data);
    }
  },

  // Удаление объекта
  deleteObject: async (id: string): Promise<void> => {
    return api.delete(API_ENDPOINTS.OBJECTS.DELETE(id));
  },

  // Получение QR-кода для объекта
  getObjectQRCode: async (id: string): Promise<Blob> => {
    const response = await api.get<Blob>(API_ENDPOINTS.OBJECTS.QRCODE(id), {
      responseType: 'blob',
    });
    return response;
  },
};
