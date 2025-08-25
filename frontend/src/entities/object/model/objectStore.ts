import { makeAutoObservable, runInAction } from 'mobx';

import { objectsApi } from '@shared/api';
import {
  type StorageObject,
  type CreateObjectRequest,
  type UpdateObjectRequest,
  type ApiError,
} from '@shared/types';

interface StorageStoreInterface {
  updateStorageFullness: (storageId: string, delta: number) => void;
}

export class ObjectStore {
  objects: StorageObject[] = [];
  currentObject: StorageObject | null = null;
  isLoading = false;
  error: string | null = null;

  private storageStore?: StorageStoreInterface;

  constructor() {
    makeAutoObservable(this);
  }

  setStorageStore = (storageStore: StorageStoreInterface): void => {
    this.storageStore = storageStore;
  };

  loadObjects = async (params?: {
    storage_id?: string;
    template_id?: string;
    decommissioned?: boolean;
  }): Promise<void> => {
    this.setLoading(true);
    this.clearError();

    try {
      const objects = await objectsApi.getObjects(params);
      runInAction(() => {
        if (params?.storage_id) {
          this.objects = this.objects.filter((obj) => obj.storage_id !== params.storage_id);
          this.objects.push(...objects);
          this.updateStorageFullness(params.storage_id);
        } else {
          this.objects = objects;
        }
      });
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.error || 'Ошибка загрузки объектов';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  loadObject = async (id: string): Promise<void> => {
    this.setLoading(true);
    this.clearError();

    try {
      const object = await objectsApi.getObject(id);

      runInAction(() => {
        this.currentObject = object;
      });
    } catch (error) {
      const apiError = error as ApiError;
      console.error('ObjectStore.loadObject error:', apiError);
      runInAction(() => {
        this.error = apiError.error || 'Ошибка загрузки объекта';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  createObject = async (data: CreateObjectRequest): Promise<StorageObject | null> => {
    this.setLoading(true);
    this.clearError();

    try {
      const newObject = await objectsApi.createObject(data);

      runInAction(() => {
        this.objects.unshift(newObject);
      });

      if (this.storageStore) {
        this.storageStore.updateStorageFullness(newObject.storage_id, newObject.size);
      }

      return newObject;
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.error || 'Ошибка создания объекта';

      runInAction(() => {
        this.error = errorMessage;
      });

      throw new Error(errorMessage);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  updateObject = async (id: string, data: UpdateObjectRequest): Promise<StorageObject | null> => {
    this.setLoading(true);
    this.clearError();

    try {
      const oldObject = this.objects.find((obj) => obj.id === id);

      const updatedObject = await objectsApi.updateObject(id, data);

      runInAction(() => {
        const index = this.objects.findIndex((o) => o.id === id);
        if (index !== -1) {
          this.objects[index] = updatedObject;
        }

        if (this.currentObject?.id === id) {
          this.currentObject = updatedObject;
        }

        if (this.storageStore && oldObject) {
          if (data.storage_id && data.storage_id !== oldObject.storage_id) {
            this.updateStorageFullness(oldObject.storage_id);
            this.updateStorageFullness(data.storage_id);
          } else if (data.size !== undefined && data.size !== oldObject.size) {
            this.updateStorageFullness(oldObject.storage_id);
          }
        }
      });

      return updatedObject;
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.error || 'Ошибка обновления объекта';

      runInAction(() => {
        this.error = errorMessage;
      });

      throw new Error(errorMessage);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  deleteObject = async (id: string): Promise<boolean> => {
    this.setLoading(true);
    this.clearError();

    try {
      const objectToDelete = this.objects.find((obj) => obj.id === id);

      await objectsApi.deleteObject(id);

      runInAction(() => {
        this.objects = this.objects.filter((o) => o.id !== id);

        if (this.currentObject?.id === id) {
          this.currentObject = null;
        }

        if (objectToDelete && this.storageStore) {
          this.updateStorageFullness(objectToDelete.storage_id);
        }
      });

      return true;
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.error || 'Ошибка удаления объекта';

      runInAction(() => {
        this.error = errorMessage;
      });

      throw new Error(errorMessage);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  updateStorageFullness = (storageId: string): void => {
    if (this.storageStore) {
      const totalSize = this.objects
        .filter((obj) => obj.storage_id === storageId && !obj.is_decommissioned)
        .reduce((sum, obj) => sum + obj.size, 0);

      this.storageStore.updateStorageFullness(storageId, totalSize);
    }
  };

  getObjectQRCode = async (id: string): Promise<Blob | null> => {
    try {
      const qrCode = await objectsApi.getObjectQRCode(id);
      return qrCode;
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.error || 'Ошибка получения QR-кода';
      });
      return null;
    }
  };

  private setLoading = (loading: boolean) => {
    this.isLoading = loading;
  };

  private clearError = () => {
    this.error = null;
  };

  getObjectById = (id: string): StorageObject | undefined => {
    return this.objects.find((o) => o.id === id);
  };

  getObjectsByStorage = (storageId: string): StorageObject[] => {
    return this.objects.filter((o) => o.storage_id === storageId);
  };

  get hasObjects(): boolean {
    return this.objects.length > 0;
  }

  get objectsCount(): number {
    return this.objects.length;
  }

  getObjectsForStorage = (storageId: string): StorageObject[] => {
    return this.objects.filter((o) => o.storage_id === storageId && !o.is_decommissioned);
  };
}
