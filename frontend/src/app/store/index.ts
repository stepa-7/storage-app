import { ObjectStore } from '@entities/object/model/objectStore';
import { StorageStore } from '@entities/storage/model/storageStore';
import { TemplateStore } from '@entities/template/model/templateStore';
import { AuthStore } from '@entities/user/model/authStore';

export class RootStore {
  authStore: AuthStore;
  storageStore: StorageStore;
  templateStore: TemplateStore;
  objectStore: ObjectStore;

  constructor() {
    this.authStore = new AuthStore();
    this.storageStore = new StorageStore();
    this.templateStore = new TemplateStore();
    this.objectStore = new ObjectStore();
  }

  // Инициализация приложения
  async initialize(): Promise<void> {
    // Если пользователь аутентифицирован, загружаем базовые данные
    if (this.authStore.isAuthenticated) {
      await Promise.all([
        this.storageStore.loadStorageTree(),
        this.templateStore.loadActiveTemplates(),
      ]);
    }
  }

  // Очистка всех stores при выходе
  clearAllStores(): void {
    this.storageStore.storages = [];
    this.storageStore.storageTree = [];
    this.storageStore.currentStorage = null;

    this.templateStore.templates = [];
    this.templateStore.activeTemplates = [];
    this.templateStore.currentTemplate = null;

    this.objectStore.objects = [];
    this.objectStore.currentObject = null;
    this.objectStore.pagination = {
      page: 1,
      limit: 20,
      total: 0,
    };
  }
}

// Создаем экземпляр корневого store
export const rootStore = new RootStore();

// Экспортируем типы для использования в компонентах
export type RootStoreType = typeof rootStore;
