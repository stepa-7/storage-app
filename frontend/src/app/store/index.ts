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

    this.objectStore.setStorageStore(this.storageStore);
  }

  initialize = async (): Promise<void> => {
    if (this.authStore.isAuthenticated) {
      try {
        await Promise.all([
          this.storageStore.loadStorages(),
          this.templateStore.loadActiveTemplates(),
          this.unitStore.loadUnits(),
        ]);

        this.recalculateStorageFullness();
      } catch (error) {
        console.error('Error during store initialization:', error);
        throw error;
      }
    }
  };

  private recalculateStorageFullness(): void {
    if (this.objectStore.objects.length === 0) {
      this.storageStore.recalculateAllFullness({});
      return;
    }

    const storageFullness: Record<string, number> = {};

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

    this.storageStore.recalculateAllFullness(storageFullness);
  }

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

export const rootStore = new RootStore();

export type RootStoreType = typeof rootStore;
