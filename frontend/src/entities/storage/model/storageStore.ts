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

  loadAllStorages = async (): Promise<void> => {
    this.setLoading(true);
    this.clearError();

    try {
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

  private setLoading = (loading: boolean) => {
    this.isLoading = loading;
  };

  private clearError = () => {
    this.error = null;
  };

  getStorageById = (id: string): Storage | undefined => {
    const storage = this.storages.find((s) => s.id === id);
    if (!storage) return undefined;

    const objectCount = 0;
    return {
      ...storage,
      currentCapacity: objectCount,
    };
  };

  getChildStorages = (parentId: string): Storage[] => {
    const childStorages = this.storages.filter((s) => s.parentId === parentId);

    return childStorages.map((storage) => {
      const objectCount = 0;
      return {
        ...storage,
        currentCapacity: objectCount,
      };
    });
  };

  getRootStorages = (): Storage[] => {
    const rootStorages = this.storages.filter((s) => !s.parentId);

    return rootStorages.map((storage) => {
      const objectCount = 0;
      return {
        ...storage,
        currentCapacity: objectCount,
      };
    });
  };

  getStorageTree = (): StorageWithDetails[] => {
    const buildTree = (parentId?: string): StorageWithDetails[] => {
      const children = this.storages.filter((s) => s.parentId === parentId);

      return children.map((storage) => {
        return {
          ...storage,
          maxCapacity: storage.capacity,
          currentCapacity: storage.fullness,
          children: buildTree(storage.id),
          objects: [],
        };
      });
    };

    return buildTree();
  };

  getStorageFillPercentage = (storage: Storage): number => {
    if (storage.capacity === 0) return 0;
    return Math.round((storage.fullness / storage.capacity) * 100);
  };

  updateStorageFullness = (storageId: string, delta: number): void => {
    runInAction(() => {
      const storage = this.storages.find((s) => s.id === storageId);
      if (storage) {
        storage.fullness = delta;
      }

      if (this.currentStorage?.id === storageId) {
        this.currentStorage.fullness = delta;
      }
    });
  };

  getStoragePath = (storageId: string): Storage[] => {
    const path: Storage[] = [];
    let currentStorageItem = this.storages.find((s) => s.id === storageId);

    while (currentStorageItem) {
      const objectCount = 0;
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

  recalculateAllFullness = (storageFullness?: Record<string, number>): void => {
    runInAction(() => {
      if (storageFullness) {
        this.storages.forEach((storage) => {
          storage.currentCapacity = storageFullness[storage.id] || 0;
        });

        if (this.currentStorage) {
          this.currentStorage.currentCapacity = storageFullness[this.currentStorage.id] || 0;
        }
      } else {
        this.storages.forEach((storage) => {
          storage.currentCapacity = 0;
        });

        if (this.currentStorage) {
          this.currentStorage.currentCapacity = 0;
        }
      }
    });
  };

  fetchStorageTree = async (): Promise<void> => {
    this.setLoading(true);
    this.clearError();

    try {
      const buildTree = (parentId?: string): StorageTreeItem[] => {
        const children = this.storages.filter((s) => s.parentId === parentId);

        return children.map((storage) => {
          const objectCount = 0;

          return {
            id: storage.id,
            name: storage.name,
            itemCount: objectCount,
            children: buildTree(storage.id),
          };
        });
      };

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
