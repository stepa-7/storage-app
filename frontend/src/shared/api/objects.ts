import { API_ENDPOINTS } from '@shared/constants';
import {
  type StorageObject,
  type CreateObjectRequest,
  type UpdateObjectRequest,
} from '@shared/types';

import { api } from './client';

export const objectsApi = {
  getObjects: async (params?: {
    storage_id?: string;
    template_id?: string;
    decommissioned?: boolean;
  }): Promise<StorageObject[]> => {
    return api.get<StorageObject[]>(API_ENDPOINTS.OBJECTS.LIST, { params });
  },

  getObject: async (id: string): Promise<StorageObject> => {
    const response = await api.get<StorageObject>(API_ENDPOINTS.OBJECTS.GET(id));
    return response;
  },

  createObject: async (data: CreateObjectRequest): Promise<StorageObject> => {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Название объекта обязательно');
    }

    if (!data.template_id || data.template_id.trim().length === 0) {
      throw new Error('ID шаблона обязателен');
    }

    if (!data.storage_id || data.storage_id.trim().length === 0) {
      throw new Error('ID хранилища обязателен');
    }

    if (!data.unit_id || data.unit_id.trim().length === 0) {
      throw new Error('ID единицы измерения обязателен');
    }

    if (!data.size || data.size <= 0) {
      throw new Error('Размер должен быть больше 0');
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (data.template_id && !uuidRegex.test(data.template_id)) {
      throw new Error('Неверный формат template_id');
    }

    if (data.storage_id && !uuidRegex.test(data.storage_id)) {
      throw new Error('Неверный формат storage_id');
    }

    if (data.unit_id && !uuidRegex.test(data.unit_id)) {
      throw new Error('Неверный формат unit_id');
    }

    if (data.attributes && typeof data.attributes === 'object') {
      const cleanAttributes: Record<string, string | number | boolean> = {};
      Object.entries(data.attributes).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'boolean') {
            cleanAttributes[key] = value ? 'true' : 'false';
          } else {
            cleanAttributes[key] = value;
          }
        }
      });
      data.attributes = cleanAttributes;
    }

    if (data.photo) {
      if (!(data.photo instanceof File)) {
        throw new Error('Некорректный файл');
      }

      if (data.photo.size === 0) {
        throw new Error('Файл пустой');
      }

      if (data.photo.size > 5 * 1024 * 1024) {
        throw new Error('Файл слишком большой');
      }

      const formData = new FormData();

      formData.append('name', data.name);
      formData.append('templateId', data.template_id);
      formData.append('storageId', data.storage_id);
      formData.append('size', String(data.size));
      formData.append('unitId', data.unit_id);

      if (data.attributes && Object.keys(data.attributes).length > 0) {
        formData.append('attributes', JSON.stringify(data.attributes));
      }

      formData.append('photo', data.photo);

      return api.post<StorageObject>(API_ENDPOINTS.OBJECTS.CREATE, formData, {
        timeout: 30000,
      });
    } else {
      const jsonData: Record<string, any> = {
        name: data.name,
        template_id: data.template_id,
        storage_id: data.storage_id,
        size: data.size,
        unit_id: data.unit_id,
      };

      if (data.attributes && Object.keys(data.attributes).length > 0) {
        jsonData.attributes = data.attributes;
      }

      return api.post<StorageObject>(API_ENDPOINTS.OBJECTS.CREATE, jsonData);
    }
  },

  updateObject: async (id: string, data: UpdateObjectRequest): Promise<StorageObject> => {
    if (data.photo) {
      const formData = new FormData();

      if (data.name) formData.append('name', data.name);
      if (data.storage_id) formData.append('storageId', data.storage_id);
      if (data.size) formData.append('size', String(data.size));
      if (data.attributes) {
        formData.append('attributes', JSON.stringify(data.attributes));
      }
      if (data.is_decommissioned !== undefined)
        formData.append('is_decommissioned', String(data.is_decommissioned));
      if (data.photo) formData.append('photo', data.photo);

      return api.patch<StorageObject>(API_ENDPOINTS.OBJECTS.UPDATE(id), formData, {
        timeout: 30000,
      });
    } else {
      const jsonData: Record<
        string,
        string | number | boolean | Record<string, string | number | boolean>
      > = {};

      if (data.name) jsonData.name = data.name;
      if (data.storage_id) jsonData.storage_id = data.storage_id;
      if (data.size) jsonData.size = data.size;
      if (data.attributes && Object.keys(data.attributes).length > 0)
        jsonData.attributes = data.attributes;
      if (data.is_decommissioned !== undefined) jsonData.is_decommissioned = data.is_decommissioned;

      return api.patch<StorageObject>(API_ENDPOINTS.OBJECTS.UPDATE(id), jsonData);
    }
  },

  deleteObject: async (id: string): Promise<void> => {
    return api.delete(API_ENDPOINTS.OBJECTS.DELETE(id));
  },

  getObjectQRCode: async (id: string): Promise<Blob> => {
    const response = await api.get<Blob>(API_ENDPOINTS.OBJECTS.QRCODE(id), {
      responseType: 'blob',
    });
    return response;
  },

  getObjectImage: async (id: string): Promise<string> => {
    const response = await api.get<Blob>(API_ENDPOINTS.OBJECTS.IMAGE(id), {
      responseType: 'blob',
    });

    const url = URL.createObjectURL(response);
    return url;
  },
};
