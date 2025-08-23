import { API_ENDPOINTS } from '@shared/constants';
import { type Storage, type CreateStorageRequest, type UpdateStorageRequest } from '@shared/types';

import { api } from './client';

export const storageApi = {
  // Получение списка всех хранилищ
  getStorages: async (parentId?: string): Promise<Storage[]> => {
    const params = parentId ? { parent_id: parentId } : {};
    const response = await api.get<any[]>(API_ENDPOINTS.STORAGE.LIST, { params });

    // Маппим unit_id -> unit и parent_id -> parentId для совместимости с фронтендом
    return response.map((storage) => ({
      ...storage,
      unit: storage.unit_id,
      parentId: storage.parent_id,
    }));
  },

  // Получение хранилища по ID
  getStorage: async (id: string): Promise<Storage> => {
    const response = await api.get<any>(API_ENDPOINTS.STORAGE.GET(id));

    // Маппим unit_id -> unit и parent_id -> parentId для совместимости с фронтендом
    return {
      ...response,
      unit: response.unit_id,
      parentId: response.parent_id,
    };
  },

  // Создание нового хранилища
  createStorage: async (data: CreateStorageRequest): Promise<Storage> => {
    const backendData = {
      name: data.name,
      capacity: data.maxCapacity,
      unit_id: data.unit, // data.unit теперь должен быть UUID
      parent_id: data.parentId,
    };
    const response = await api.post<any>(API_ENDPOINTS.STORAGE.CREATE, backendData);

    // Маппим unit_id -> unit и parent_id -> parentId для совместимости с фронтендом
    return {
      ...response,
      unit: response.unit_id,
      parentId: response.parent_id,
    };
  },

  // Обновление хранилища
  updateStorage: async (id: string, data: UpdateStorageRequest): Promise<Storage> => {
    const backendData = {
      name: data.name,
      capacity: data.maxCapacity,
      parent_id: data.parentId,
    };
    const response = await api.patch<any>(API_ENDPOINTS.STORAGE.UPDATE(id), backendData);

    // Маппим unit_id -> unit и parent_id -> parentId для совместимости с фронтендом
    return {
      ...response,
      unit: response.unit_id,
      parentId: response.parent_id,
    };
  },

  // Удаление хранилища
  deleteStorage: async (id: string): Promise<void> => {
    return api.delete(API_ENDPOINTS.STORAGE.DELETE(id));
  },
};
