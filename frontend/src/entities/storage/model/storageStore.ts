import { makeAutoObservable, runInAction } from 'mobx';

import { storageApi } from '@shared/api';
import {
  type Storage,
  type StorageWithDetails,
  type CreateStorageRequest,
  type UpdateStorageRequest,
  type ApiError,
} from '@shared/types';

interface StorageTreeItem {
  id: string;
  name: string;
  itemCount?: number;
  children: StorageTreeItem[];
}

export class StorageStore {
  storages: Storage[] = [];
  storageTree: StorageTreeItem[] = [];
  currentStorage: Storage | null = null;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Загрузка списка хранилищ
  loadStorages = async (parentId?: string): Promise<void> => {
    this.setLoading(true);
    this.clearError();

    try {
      const storages = await storageApi.getStorages(parentId);
      runInAction(() => {
        this.storages = storages;
      });
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.error || 'Ошибка загрузки хранилищ';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Загрузка всех хранилищ для построения дерева
  loadAllStorages = async (): Promise<void> => {
    this.setLoading(true);
    this.clearError();

    try {
      // Загружаем все хранилища без фильтра по parentId
      const allStorages = await storageApi.getStorages();
      runInAction(() => {
        this.storages = allStorages;
      });
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.error || 'Ошибка загрузки всех хранилищ';
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
        this.error = apiError.error || 'Ошибка загрузки хранилища';
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
      });

      return newStorage;
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.error || 'Ошибка создания хранилища';
      });
      return null;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Обновление хранилища
  updateStorage = async (id: string, data: UpdateStorageRequest): Promise<Storage | null> => {
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
      });

      return updatedStorage;
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.error || 'Ошибка обновления хранилища';
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
      });

      return true;
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.error || 'Ошибка удаления хранилища';
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
    const storage = this.storages.find((s) => s.id === id);
    if (!storage) return undefined;

    // TODO: Получить количество объектов из objectStore
    const objectCount = 0; // Временно заглушка
    return {
      ...storage,
      currentCapacity: objectCount,
    };
  };

  // Получение дочерних хранилищ
  getChildStorages = (parentId: string): Storage[] => {
    const childStorages = this.storages.filter((s) => s.parentId === parentId);

    // TODO: Получить количество объектов из objectStore
    return childStorages.map((storage) => {
      const objectCount = 0; // Временно заглушка
      return {
        ...storage,
        currentCapacity: objectCount,
      };
    });
  };

  // Получение корневых хранилищ (без родителя)
  getRootStorages = (): Storage[] => {
    const rootStorages = this.storages.filter((s) => !s.parentId);

    // TODO: Получить количество объектов из objectStore
    return rootStorages.map((storage) => {
      const objectCount = 0; // Временно заглушка
      return {
        ...storage,
        currentCapacity: objectCount,
      };
    });
  };

  // Получение дерева хранилищ с деталями
  getStorageTree = (): StorageWithDetails[] => {
    // TODO: добавить injecthook для unitStore
    const buildTree = (parentId?: string): StorageWithDetails[] => {
      const children = this.storages.filter((s) => s.parentId === parentId);

      return children.map((storage) => {
        // TODO: Получить количество объектов из objectStore
        return {
          ...storage,
          // Добавляем алиасы для совместимости
          maxCapacity: storage.capacity,
          currentCapacity: storage.fullness,
          children: buildTree(storage.id),
          objects: [], // TODO: добавить объекты из objectStore
        };
      });
    };

    return buildTree();
  };

  // Вычисление процента заполненности хранилища
  getStorageFillPercentage = (storage: Storage): number => {
    if (storage.capacity === 0) return 0;
    return Math.round((storage.fullness / storage.capacity) * 100);
  };

  // Проверка, можно ли удалить хранилище (должно быть пустым)
  // canDeleteStorage = (_storage: Storage): boolean => {
  //   // TODO: Получить количество объектов из objectStore
  //   const objectCount = 0; // Временно заглушка
  //   return objectCount === 0;
  // };

  // Обновление заполненности хранилища (вызывается при добавлении/удалении объектов)
  updateStorageFullness = (storageId: string): void => {
    runInAction(() => {
      // TODO: Получить количество объектов из objectStore
      const objectCount = 0; // Временно заглушка

      const storage = this.storages.find((s) => s.id === storageId);
      if (storage) {
        storage.currentCapacity = objectCount;
      }

      if (this.currentStorage?.id === storageId) {
        this.currentStorage.currentCapacity = objectCount;
      }
    });
  };

  // Получение пути к хранилищу для breadcrumbs
  getStoragePath = (storageId: string): Storage[] => {
    const path: Storage[] = [];
    let currentStorageItem = this.storages.find((s) => s.id === storageId);

    while (currentStorageItem) {
      // TODO: Получить количество объектов из objectStore
      const objectCount = 0; // Временно заглушка
      const updatedStorage = {
        ...currentStorageItem,
        currentCapacity: objectCount,
      };
      path.unshift(updatedStorage);
      const parentId = currentStorageItem.parentId;
      currentStorageItem = parentId ? this.storages.find((s) => s.id === parentId) : undefined;
    }

    return path;
  };

  // Пересчет заполненности всех хранилищ (может потребоваться при инициализации)
  recalculateAllFullness = (storageFullness?: Record<string, number>): void => {
    runInAction(() => {
      if (storageFullness) {
        // Используем переданные данные о заполненности
        this.storages.forEach((storage) => {
          storage.currentCapacity = storageFullness[storage.id] || 0;
        });

        if (this.currentStorage) {
          this.currentStorage.currentCapacity = storageFullness[this.currentStorage.id] || 0;
        }
      } else {
        // Временно заглушка
        this.storages.forEach((storage) => {
          storage.currentCapacity = 0;
        });

        if (this.currentStorage) {
          this.currentStorage.currentCapacity = 0;
        }
      }
    });
  };

  // Загрузка дерева хранилищ для Sidebar
  fetchStorageTree = async (): Promise<void> => {
    this.setLoading(true);
    this.clearError();

    try {
      // Строим дерево из реальных данных с подсчётом заполненности
      const buildTree = (parentId?: string): StorageTreeItem[] => {
        const children = this.storages.filter((s) => s.parentId === parentId);

        return children.map((storage) => {
          // TODO: Получить количество объектов из objectStore
          const objectCount = 0; // Временно заглушка

          return {
            id: storage.id,
            name: storage.name,
            itemCount: objectCount,
            children: buildTree(storage.id),
          };
        });
      };

      // Если storages ещё не загружены, загружаем их
      if (this.storages.length === 0) {
        await this.loadStorages();
      }

      const tree = buildTree();

      runInAction(() => {
        this.storageTree = tree;
      });
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.error || 'Ошибка загрузки дерева хранилищ';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };
}
