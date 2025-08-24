import { makeAutoObservable, runInAction } from 'mobx';

import { unitsApi } from '@shared/api';
import { type Unit, type ApiError } from '@shared/types';

export class UnitStore {
  units: Unit[] = [];
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Загрузка списка единиц измерения
  loadUnits = async (): Promise<void> => {
    this.setLoading(true);
    this.clearError();

    try {
      const units = await unitsApi.getUnits();
      runInAction(() => {
        this.units = units;
      });
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.error || 'Ошибка загрузки единиц измерения';
      });
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

  // Получение единицы по ID
  getUnitById = (id: string): Unit | undefined => {
    return this.units.find((u) => u.id === id);
  };

  // Получение единицы по символу
  getUnitBySymbol = (symbol: string): Unit | undefined => {
    return this.units.find((u) => u.symbol === symbol);
  };

  // Получение всех единиц в виде опций для селекта
  get unitOptions() {
    return this.units.map((unit) => ({
      value: unit.id,
      label: `${unit.name} (${unit.symbol})`,
    }));
  }

  // Проверка, есть ли единицы
  get hasUnits(): boolean {
    return this.units.length > 0;
  }
}
