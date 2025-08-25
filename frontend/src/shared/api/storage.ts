import { API_ENDPOINTS } from '@shared/constants';
import { type Storage, type CreateStorageRequest, type UpdateStorageRequest } from '@shared/types';

import { api } from './client';

// Интерфейс для данных, приходящих с бэкенда
interface BackendStorage {
  id: string;
  name: string;
  capacity: number;
  fullness: number;
  unit_id: string;
  parent_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const storageApi = {
  // Получение списка всех хранилищ
  getStorages: async (parentId?: string): Promise<Storage[]> => {
    const params = parentId ? { parent_id: parentId } : {};
    const response = await api.get<BackendStorage[]>(API_ENDPOINTS.STORAGE.LIST, { params });

    // Маппим unit_id -> unit и parent_id -> parentId для совместимости с фронтендом
    return response.map((storage) => ({
      id: storage.id,
      name: storage.name,
      capacity: storage.capacity,
      fullness: storage.fullness,
      unit: storage.unit_id,
      parentId: storage.parent_id,
      createdAt: storage.created_at,
      updatedAt: storage.updated_at,
    }));
  },

  // Получение хранилища по ID
  getStorage: async (id: string): Promise<Storage> => {
    const response = await api.get<BackendStorage>(API_ENDPOINTS.STORAGE.GET(id));

    // Маппим unit_id -> unit и parent_id -> parentId для совместимости с фронтендом
    return {
      id: response.id,
      name: response.name,
      capacity: response.capacity,
      fullness: response.fullness,
      unit: response.unit_id,
      parentId: response.parent_id,
      createdAt: response.created_at,
      updatedAt: response.updated_at,
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
    const response = await api.post<BackendStorage>(API_ENDPOINTS.STORAGE.CREATE, backendData);

    // Маппим unit_id -> unit и parent_id -> parentId для совместимости с фронтендом
    return {
      id: response.id,
      name: response.name,
      capacity: response.capacity,
      fullness: response.fullness,
      unit: response.unit_id,
      parentId: response.parent_id,
      createdAt: response.created_at,
      updatedAt: response.updated_at,
    };
  },

  // Обновление хранилища
  updateStorage: async (id: string, data: UpdateStorageRequest): Promise<Storage> => {
    const backendData = {
      name: data.name,
      capacity: data.maxCapacity,
      parent_id: data.parentId,
    };
    const response = await api.patch<BackendStorage>(API_ENDPOINTS.STORAGE.UPDATE(id), backendData);

    // Маппим unit_id -> unit и parent_id -> parentId для совместимости с фронтендом
    return {
      id: response.id,
      name: response.name,
      capacity: response.capacity,
      fullness: response.fullness,
      unit: response.unit_id,
      parentId: response.parent_id,
      createdAt: response.created_at,
      updatedAt: response.updated_at,
    };
  },

  // Удаление хранилища
  deleteStorage: async (id: string): Promise<void> => {
    return api.delete(API_ENDPOINTS.STORAGE.DELETE(id));
  },
};
