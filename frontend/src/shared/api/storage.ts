import { API_ENDPOINTS } from '@shared/constants';
import { type Storage, type CreateStorageRequest } from '@shared/types';

import { api } from './client';

export const storageApi = {
  // Получение списка всех хранилищ
  getStorages: async (): Promise<Storage[]> => {
    return api.get<Storage[]>(API_ENDPOINTS.STORAGE.LIST);
  },

  // Получение хранилища по ID
  getStorage: async (id: string): Promise<Storage> => {
    return api.get<Storage>(API_ENDPOINTS.STORAGE.GET(id));
  },

  // Создание нового хранилища
  createStorage: async (data: CreateStorageRequest): Promise<Storage> => {
    return api.post<Storage>(API_ENDPOINTS.STORAGE.CREATE, data);
  },

  // Обновление хранилища
  updateStorage: async (id: string, data: Partial<CreateStorageRequest>): Promise<Storage> => {
    return api.put<Storage>(API_ENDPOINTS.STORAGE.UPDATE(id), data);
  },

  // Удаление хранилища
  deleteStorage: async (id: string): Promise<void> => {
    return api.delete(API_ENDPOINTS.STORAGE.DELETE(id));
  },

  // Получение дерева хранилищ
  getStorageTree: async (): Promise<Storage[]> => {
    return api.get<Storage[]>('/storage/tree');
  },

  // Перемещение хранилища
  moveStorage: async (id: string, newParentId: string): Promise<Storage> => {
    return api.post<Storage>(`/storage/${id}/move`, { parentId: newParentId });
  },
};
