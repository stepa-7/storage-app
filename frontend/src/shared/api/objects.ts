import { API_ENDPOINTS } from '@shared/constants';
import {
  type StorageObject,
  type CreateObjectRequest,
  type PaginatedResponse,
} from '@shared/types';

import { api } from './client';

export const objectsApi = {
  // Получение списка объектов
  getObjects: async (page = 1, limit = 20): Promise<PaginatedResponse<StorageObject>> => {
    return api.get<PaginatedResponse<StorageObject>>(
      `${API_ENDPOINTS.OBJECTS.LIST}?page=${page}&limit=${limit}`,
    );
  },

  // Получение объекта по ID
  getObject: async (id: string): Promise<StorageObject> => {
    return api.get<StorageObject>(API_ENDPOINTS.OBJECTS.GET(id));
  },

  // Создание нового объекта
  createObject: async (data: CreateObjectRequest): Promise<StorageObject> => {
    const formData = new FormData();

    // Добавляем основные данные
    formData.append('templateId', data.templateId);
    formData.append('storageId', data.storageId);

    // Добавляем атрибуты
    data.attributes.forEach((attr, index) => {
      formData.append(`attributes[${index}][templateAttributeId]`, attr.templateAttributeId);
      if (attr.value instanceof File) {
        formData.append(`attributes[${index}][value]`, attr.value);
      } else {
        formData.append(`attributes[${index}][value]`, String(attr.value));
      }
    });

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
  updateObject: async (id: string, data: Partial<CreateObjectRequest>): Promise<StorageObject> => {
    return api.put<StorageObject>(API_ENDPOINTS.OBJECTS.UPDATE(id), data);
  },

  // Удаление объекта
  deleteObject: async (id: string): Promise<void> => {
    return api.delete(API_ENDPOINTS.OBJECTS.DELETE(id));
  },

  // Перемещение объекта в другое хранилище
  moveObject: async (id: string, newStorageId: string): Promise<StorageObject> => {
    return api.post<StorageObject>(API_ENDPOINTS.OBJECTS.MOVE(id), {
      storageId: newStorageId,
    });
  },

  // Получение объектов по хранилищу
  getObjectsByStorage: async (
    storageId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<StorageObject>> => {
    return api.get<PaginatedResponse<StorageObject>>(
      `${API_ENDPOINTS.OBJECTS.LIST}?storageId=${storageId}&page=${page}&limit=${limit}`,
    );
  },
};
