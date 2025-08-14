import { makeAutoObservable, runInAction } from 'mobx';

import { objectsApi } from '@shared/api';
import { type StorageObject, type CreateObjectRequest, type ApiError } from '@shared/types';

export class ObjectStore {
  objects: StorageObject[] = [];
  currentObject: StorageObject | null = null;
  pagination = {
    page: 1,
    limit: 20,
    total: 0,
  };
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Загрузка списка объектов с пагинацией
  loadObjects = async (page = 1, limit = 20): Promise<void> => {
    this.setLoading(true);
    this.clearError();

    try {
      const response = await objectsApi.getObjects(page, limit);
      runInAction(() => {
        this.objects = response.data;
        this.pagination = {
          page: response.page,
          limit: response.limit,
          total: response.total,
        };
      });
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.message || 'Ошибка загрузки объектов';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Загрузка объектов по хранилищу
  loadObjectsByStorage = async (storageId: string, page = 1, limit = 20): Promise<void> => {
    this.setLoading(true);
    this.clearError();

    try {
      const response = await objectsApi.getObjectsByStorage(storageId, page, limit);
      runInAction(() => {
        this.objects = response.data;
        this.pagination = {
          page: response.page,
          limit: response.limit,
          total: response.total,
        };
      });
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.message || 'Ошибка загрузки объектов хранилища';
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
        this.error = apiError.message || 'Ошибка загрузки объекта';
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
      const newObject = await objectsApi.createObject(data);

      runInAction(() => {
        this.objects.unshift(newObject);
        this.pagination.total += 1;
      });

      return newObject;
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.message || 'Ошибка создания объекта';
      });
      return null;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Обновление объекта
  updateObject = async (
    id: string,
    data: Partial<CreateObjectRequest>,
  ): Promise<StorageObject | null> => {
    this.setLoading(true);
    this.clearError();

    try {
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
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.message || 'Ошибка обновления объекта';
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
      await objectsApi.deleteObject(id);

      runInAction(() => {
        this.objects = this.objects.filter((o) => o.id !== id);
        this.pagination.total = Math.max(0, this.pagination.total - 1);

        if (this.currentObject?.id === id) {
          this.currentObject = null;
        }
      });

      return true;
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.message || 'Ошибка удаления объекта';
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Перемещение объекта в другое хранилище
  moveObject = async (id: string, newStorageId: string): Promise<boolean> => {
    this.setLoading(true);
    this.clearError();

    try {
      const movedObject = await objectsApi.moveObject(id, newStorageId);

      runInAction(() => {
        const index = this.objects.findIndex((o) => o.id === id);
        if (index !== -1) {
          this.objects[index] = movedObject;
        }

        if (this.currentObject?.id === id) {
          this.currentObject = movedObject;
        }
      });

      return true;
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.message || 'Ошибка перемещения объекта';
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

  // Получение объекта по ID
  getObjectById = (id: string): StorageObject | undefined => {
    return this.objects.find((o) => o.id === id);
  };

  // Получение объектов по хранилищу
  getObjectsByStorage = (storageId: string): StorageObject[] => {
    return this.objects.filter((o) => o.storageId === storageId);
  };

  // Проверка, есть ли объекты
  get hasObjects(): boolean {
    return this.objects.length > 0;
  }

  // Получение количества объектов
  get objectsCount(): number {
    return this.objects.length;
  }

  // Проверка, есть ли следующая страница
  get hasNextPage(): boolean {
    return this.pagination.page * this.pagination.limit < this.pagination.total;
  }

  // Проверка, есть ли предыдущая страница
  get hasPrevPage(): boolean {
    return this.pagination.page > 1;
  }

  // Переход на следующую страницу
  nextPage = async (): Promise<void> => {
    if (this.hasNextPage) {
      await this.loadObjects(this.pagination.page + 1, this.pagination.limit);
    }
  };

  // Переход на предыдущую страницу
  prevPage = async (): Promise<void> => {
    if (this.hasPrevPage) {
      await this.loadObjects(this.pagination.page - 1, this.pagination.limit);
    }
  };

  // Переход на конкретную страницу
  goToPage = async (page: number): Promise<void> => {
    if (page >= 1 && page <= Math.ceil(this.pagination.total / this.pagination.limit)) {
      await this.loadObjects(page, this.pagination.limit);
    }
  };
}
