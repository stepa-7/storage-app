import { ObjectStore } from '@entities/object/model/objectStore';
import { StorageStore } from '@entities/storage/model/storageStore';
import { TemplateStore } from '@entities/template/model/templateStore';
import { UnitStore } from '@entities/unit/model/unitStore';
import { AuthStore } from '@entities/user/model/authStore';

export class RootStore {
  authStore: AuthStore;
  storageStore: StorageStore;
  templateStore: TemplateStore;
  objectStore: ObjectStore;
  unitStore: UnitStore;

  constructor() {
    this.authStore = new AuthStore();
    this.storageStore = new StorageStore();
    this.templateStore = new TemplateStore();
    this.objectStore = new ObjectStore();
    this.unitStore = new UnitStore();

    // Инъекция зависимостей
    this.objectStore.setStorageStore(this.storageStore);
  }

  // Инициализация приложения
  initialize = async (): Promise<void> => {
    // Если пользователь аутентифицирован, загружаем базовые данные
    if (this.authStore.isAuthenticated) {
      try {
        await Promise.all([
          this.storageStore.loadStorages(),
          this.templateStore.loadActiveTemplates(),
          this.unitStore.loadUnits(),
          this.objectStore.loadObjects(), // Загружаем все объекты при инициализации
        ]);

        // Пересчитываем заполненность хранилищ на основе загруженных объектов
        this.recalculateStorageFullness();
      } catch (error) {
        console.error('Error during store initialization:', error);
        throw error;
      }
    }
  };

  // Пересчет заполненности всех хранилищ
  private recalculateStorageFullness(): void {
    const storageFullness: Record<string, number> = {};

    // Подсчитываем объемы объектов по хранилищам
    // Преобразуем MobX Proxy в обычные объекты для безопасного доступа к свойствам
    this.objectStore.objects.forEach((obj) => {
      const plainObj = {
        storage_id: obj.storage_id,
        size: obj.size,
        is_decommissioned: obj.is_decommissioned,
      };

      if (!plainObj.is_decommissioned) {
        storageFullness[plainObj.storage_id] =
          (storageFullness[plainObj.storage_id] || 0) + plainObj.size;
      }
    });

    // Обновляем заполненность в StorageStore
    this.storageStore.recalculateAllFullness(storageFullness);
  }

  // Очистка всех stores при выходе
  clearAllStores(): void {
    this.storageStore.storages = [];
    this.storageStore.currentStorage = null;

    this.templateStore.templates = [];
    this.templateStore.activeTemplates = [];
    this.templateStore.currentTemplate = null;

    this.objectStore.objects = [];
    this.objectStore.currentObject = null;
  }
}

// Создаем экземпляр корневого store
export const rootStore = new RootStore();

// Экспортируем типы для использования в компонентах
export type RootStoreType = typeof rootStore;
