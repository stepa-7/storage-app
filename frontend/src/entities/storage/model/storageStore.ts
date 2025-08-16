import { makeAutoObservable, runInAction } from 'mobx';

import { storageApi } from '@shared/api';
import { type Storage, type CreateStorageRequest, type ApiError } from '@shared/types';

export class StorageStore {
  storages: Storage[] = [];
  storageTree: Storage[] = [];
  currentStorage: Storage | null = null;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Загрузка списка хранилищ
  loadStorages = async (): Promise<void> => {
    this.setLoading(true);
    this.clearError();

    try {
      const storages = await storageApi.getStorages();
      runInAction(() => {
        this.storages = storages;
      });
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.message || 'Ошибка загрузки хранилищ';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Загрузка дерева хранилищ
  loadStorageTree = async (): Promise<void> => {
    this.setLoading(true);
    this.clearError();

    try {
      const tree = await storageApi.getStorageTree();
      runInAction(() => {
        this.storageTree = tree;
      });
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.message || 'Ошибка загрузки дерева хранилищ';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Загрузка конкретного хранилища
  loadStorage = async (id: string): Promise<void> => {
    this.setLoading(true);
    this.clearError();

    try {
      const storage = await storageApi.getStorage(id);
      runInAction(() => {
        this.currentStorage = storage;
      });
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.message || 'Ошибка загрузки хранилища';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Создание нового хранилища
  createStorage = async (data: CreateStorageRequest): Promise<Storage | null> => {
    this.setLoading(true);
    this.clearError();

    try {
      const newStorage = await storageApi.createStorage(data);

      runInAction(() => {
        this.storages.push(newStorage);
        // Обновляем дерево хранилищ
        this.loadStorageTree();
      });

      return newStorage;
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.message || 'Ошибка создания хранилища';
      });
      return null;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Обновление хранилища
  updateStorage = async (
    id: string,
    data: Partial<CreateStorageRequest>,
  ): Promise<Storage | null> => {
    this.setLoading(true);
    this.clearError();

    try {
      const updatedStorage = await storageApi.updateStorage(id, data);

      runInAction(() => {
        const index = this.storages.findIndex((s) => s.id === id);
        if (index !== -1) {
          this.storages[index] = updatedStorage;
        }

        if (this.currentStorage?.id === id) {
          this.currentStorage = updatedStorage;
        }

        // Обновляем дерево хранилищ
        this.loadStorageTree();
      });

      return updatedStorage;
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.message || 'Ошибка обновления хранилища';
      });
      return null;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Удаление хранилища
  deleteStorage = async (id: string): Promise<boolean> => {
    this.setLoading(true);
    this.clearError();

    try {
      await storageApi.deleteStorage(id);

      runInAction(() => {
        this.storages = this.storages.filter((s) => s.id !== id);

        if (this.currentStorage?.id === id) {
          this.currentStorage = null;
        }

        // Обновляем дерево хранилищ
        this.loadStorageTree();
      });

      return true;
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.message || 'Ошибка удаления хранилища';
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Перемещение хранилища
  moveStorage = async (id: string, newParentId: string): Promise<boolean> => {
    this.setLoading(true);
    this.clearError();

    try {
      const movedStorage = await storageApi.moveStorage(id, newParentId);

      runInAction(() => {
        const index = this.storages.findIndex((s) => s.id === id);
        if (index !== -1) {
          this.storages[index] = movedStorage;
        }

        // Обновляем дерево хранилищ
        this.loadStorageTree();
      });

      return true;
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.message || 'Ошибка перемещения хранилища';
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Установка состояния загрузки
  private setLoading = (loading: boolean) => {
    this.isLoading = loading;
  };

  // Очистка ошибки
  private clearError = () => {
    this.error = null;
  };

  // Получение хранилища по ID
  getStorageById = (id: string): Storage | undefined => {
    return this.storages.find((s) => s.id === id);
  };

  // Получение дочерних хранилищ
  getChildStorages = (parentId: string): Storage[] => {
    return this.storages.filter((s) => s.parentId === parentId);
  };

  // Получение корневых хранилищ (без родителя)
  getRootStorages = (): Storage[] => {
    return this.storages.filter((s) => !s.parentId);
  };

  // Проверка, можно ли удалить хранилище
  canDeleteStorage = (storage: Storage): boolean => {
    return storage.currentCapacity === 0 && storage.children.length === 0;
  };

  // Вычисление процента заполненности хранилища
  getStorageFillPercentage = (storage: Storage): number => {
    if (storage.maxCapacity === 0) return 0;
    return Math.round((storage.currentCapacity / storage.maxCapacity) * 100);
  };
}
