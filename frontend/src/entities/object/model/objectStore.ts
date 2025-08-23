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

  // Инъекция зависимости для StorageStore
  private storageStore?: StorageStoreInterface;

  constructor() {
    makeAutoObservable(this);
  }

  // Метод для инъекции StorageStore
  setStorageStore = (storageStore: StorageStoreInterface): void => {
    this.storageStore = storageStore;
  };

  // Загрузка списка объектов

  // Загрузка списка объектов

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
        this.objects = objects;
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

  // Загрузка конкретного объекта
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
      runInAction(() => {
        this.error = apiError.error || 'Ошибка загрузки объекта';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Создание нового объекта
  createObject = async (data: CreateObjectRequest): Promise<StorageObject | null> => {
    this.setLoading(true);
    this.clearError();

    try {
      // ВРЕМЕННЫЙ МОК: создаем объект локально
      // TODO: Убрать после подключения бэкенда
      const newObject: StorageObject = {
        id: Date.now().toString(),
        name: data.name,
        template_id: data.template_id,
        storage_id: data.storage_id,
        size: data.size,
        unit_id: data.unit_id,
        attributes: data.attributes,
        photo_url: undefined, // TODO: обработать загрузку фото
        is_decommissioned: false,
        created_by: '1',
        created_at: new Date().toISOString(),
      };

      runInAction(() => {
        this.objects.unshift(newObject);
      });

      // Обновляем заполненность хранилища
      if (this.storageStore) {
        this.storageStore.updateStorageFullness(newObject.storage_id, newObject.size);
      }

      return newObject;

      // ЗАКОММЕНТИРОВАНО: оригинальный код для бэкенда
      /*
      const newObject = await objectsApi.createObject(data);

      runInAction(() => {
        this.objects.unshift(newObject);
      });

      return newObject;
      */
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.error || 'Ошибка создания объекта';
      });
      return null;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Обновление объекта
  updateObject = async (id: string, data: UpdateObjectRequest): Promise<StorageObject | null> => {
    this.setLoading(true);
    this.clearError();

    try {
      // ВРЕМЕННЫЙ МОК: обновляем объект локально
      // TODO: Убрать после подключения бэкенда
      const existingObject = this.objects.find((o) => o.id === id);
      if (!existingObject) {
        throw new Error('Объект не найден');
      }

      const updatedObject: StorageObject = {
        ...existingObject,
        ...data,
      };

      runInAction(() => {
        const index = this.objects.findIndex((o) => o.id === id);
        if (index !== -1) {
          this.objects[index] = updatedObject;
        }

        if (this.currentObject?.id === id) {
          this.currentObject = updatedObject;
        }
      });

      return updatedObject;

      // ЗАКОММЕНТИРОВАНО: оригинальный код для бэкенда
      /*
      const updatedObject = await objectsApi.updateObject(id, data);

      runInAction(() => {
        const index = this.objects.findIndex((o) => o.id === id);
        if (index !== -1) {
          this.objects[index] = updatedObject;
        }

        if (this.currentObject?.id === id) {
          this.currentObject = updatedObject;
        }
      });

      return updatedObject;
      */
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.error || 'Ошибка обновления объекта';
      });
      return null;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Удаление объекта
  deleteObject = async (id: string): Promise<boolean> => {
    this.setLoading(true);
    this.clearError();

    try {
      // ВРЕМЕННЫЙ МОК: удаляем объект локально
      // TODO: Убрать после подключения бэкенда
      const objectToDelete = this.objects.find((o) => o.id === id);

      runInAction(() => {
        this.objects = this.objects.filter((o) => o.id !== id);

        if (this.currentObject?.id === id) {
          this.currentObject = null;
        }
      });

      // Обновляем заполненность хранилища
      if (objectToDelete && this.storageStore) {
        this.storageStore.updateStorageFullness(objectToDelete.storage_id, -objectToDelete.size);
      }

      return true;

      // ЗАКОММЕНТИРОВАНО: оригинальный код для бэкенда
      /*
      await objectsApi.deleteObject(id);

      runInAction(() => {
        this.objects = this.objects.filter((o) => o.id !== id);

        if (this.currentObject?.id === id) {
          this.currentObject = null;
        }
      });

      return true;
      */
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.error || 'Ошибка удаления объекта';
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Получение QR-кода для объекта
  getObjectQRCode = async (): Promise<Blob | null> => {
    try {
      // ВРЕМЕННЫЙ МОК: возвращаем пустой blob
      // TODO: Убрать после подключения бэкенда
      return new Blob(['Mock QR Code'], { type: 'image/png' });

      // ЗАКОММЕНТИРОВАНО: оригинальный код для бэкенда
      /*
      const qrCode = await objectsApi.getObjectQRCode(id);
      return qrCode;
      */
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.error || 'Ошибка получения QR-кода';
      });
      return null;
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

  // Получение объекта по ID
  getObjectById = (id: string): StorageObject | undefined => {
    return this.objects.find((o) => o.id === id);
  };

  // Получение объектов по хранилищу
  getObjectsByStorage = (storageId: string): StorageObject[] => {
    return this.objects.filter((o) => o.storage_id === storageId);
  };

  // Проверка, есть ли объекты
  get hasObjects(): boolean {
    return this.objects.length > 0;
  }

  // Получение количества объектов
  get objectsCount(): number {
    return this.objects.length;
  }

  // Получение объектов для конкретного хранилища
  getObjectsForStorage = (storageId: string): StorageObject[] => {
    const plainObjects = this.objects.map((obj) => ({
      id: obj.id,
      name: obj.name,
      template_id: obj.template_id,
      storage_id: obj.storage_id,
      size: obj.size,
      unit_id: obj.unit_id,
      attributes: obj.attributes,
      photo_url: obj.photo_url,
      is_decommissioned: obj.is_decommissioned,
      created_by: obj.created_by,
      created_at: obj.created_at,
    }));

    return plainObjects.filter((o) => o.storage_id === storageId && !o.is_decommissioned);
  };
}
