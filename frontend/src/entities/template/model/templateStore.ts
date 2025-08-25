import { makeAutoObservable, runInAction } from 'mobx';

import { templatesApi } from '@shared/api';
import {
  type ObjectTemplate,
  type CreateTemplateRequest,
  type UpdateTemplateRequest,
  type ApiError,
} from '@shared/types';

export class TemplateStore {
  templates: ObjectTemplate[] = [];
  activeTemplates: ObjectTemplate[] = [];
  currentTemplate: ObjectTemplate | null = null;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Загрузка списка шаблонов
  loadTemplates = async (params?: { deleted?: boolean; name?: string }): Promise<void> => {
    this.setLoading(true);
    this.clearError();

    try {
      const templates = await templatesApi.getTemplates(params);
      runInAction(() => {
        this.templates = templates;
        this.updateActiveTemplatesList();
      });
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.error || 'Ошибка загрузки шаблонов';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Загрузка активных шаблонов
  loadActiveTemplates = async (): Promise<void> => {
    this.setLoading(true);
    this.clearError();

    try {
      const templates = await templatesApi.getActiveTemplates();
      runInAction(() => {
        this.activeTemplates = templates;
      });
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.error || 'Ошибка загрузки активных шаблонов';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Загрузка конкретного шаблона
  loadTemplate = async (id: string): Promise<void> => {
    this.setLoading(true);
    this.clearError();

    try {
      const template = await templatesApi.getTemplate(id);
      runInAction(() => {
        this.currentTemplate = template;
      });
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.error || 'Ошибка загрузки шаблона';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Создание нового шаблона
  createTemplate = async (data: CreateTemplateRequest): Promise<ObjectTemplate | null> => {
    this.setLoading(true);
    this.clearError();

    try {
      // Реальный вызов API
      const newTemplate = await templatesApi.createTemplate(data);

      runInAction(() => {
        this.templates.push(newTemplate);
        this.updateActiveTemplatesList();
      });

      return newTemplate;
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.error || 'Ошибка создания шаблона';
      });
      return null;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Обновление шаблона
  updateTemplate = async (
    id: string,
    data: UpdateTemplateRequest,
  ): Promise<ObjectTemplate | null> => {
    this.setLoading(true);
    this.clearError();

    try {
      const updatedTemplate = await templatesApi.updateTemplate(id, data);

      runInAction(() => {
        const index = this.templates.findIndex((t) => t.id === id);
        if (index !== -1) {
          this.templates[index] = updatedTemplate;
        }

        if (this.currentTemplate?.id === id) {
          this.currentTemplate = updatedTemplate;
        }

        // Обновляем активные шаблоны
        this.updateActiveTemplatesList();
      });

      return updatedTemplate;
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.error || 'Ошибка обновления шаблона';
      });
      return null;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Деактивация шаблона (мягкое удаление через DELETE)
  deactivateTemplate = async (id: string): Promise<boolean> => {
    this.setLoading(true);
    this.clearError();

    try {
      // DELETE запрос не возвращает данные, просто ждем завершения
      await templatesApi.deleteTemplate(id);

      // Сразу обновляем локальное состояние
      runInAction(() => {
        const template = this.templates.find((t) => t.id === id);
        if (template) {
          template.deleted = true;
        }

        // Если это текущий шаблон, очищаем его
        if (this.currentTemplate?.id === id) {
          this.currentTemplate = null;
        }

        // Обновляем активные шаблоны
        this.updateActiveTemplatesList();
      });

      // Перезагружаем данные с сервера для полной синхронизации
      await this.loadTemplates();

      return true;
    } catch (error) {
      console.error('🔴 Ошибка в deactivateTemplate:', error);
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.error || 'Ошибка деактивации шаблона';
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Удаление шаблона
  deleteTemplate = async (id: string): Promise<boolean> => {
    this.setLoading(true);
    this.clearError();

    try {
      await templatesApi.deleteTemplate(id);

      runInAction(() => {
        // Удаляем шаблон из списка
        this.templates = this.templates.filter((t) => t.id !== id);

        // Если это текущий шаблон, очищаем его
        if (this.currentTemplate?.id === id) {
          this.currentTemplate = null;
        }

        // Обновляем активные шаблоны
        this.updateActiveTemplatesList();
      });

      return true;
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.error || 'Ошибка удаления шаблона';
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

  // Обновление списка активных шаблонов
  private updateActiveTemplatesList = () => {
    this.activeTemplates = this.templates.filter((t) => !t.deleted);
  };

  // Получение шаблона по ID
  getTemplateById = (id: string): ObjectTemplate | undefined => {
    return this.templates.find((t) => t.id === id);
  };

  // Получение активных шаблонов
  getActiveTemplates = (): ObjectTemplate[] => {
    return this.activeTemplates;
  };

  // Проверка, есть ли активные шаблоны
  get hasActiveTemplates(): boolean {
    return this.activeTemplates.length > 0;
  }

  // Получение количества шаблонов
  get templatesCount(): number {
    return this.templates.length;
  }

  // Получение количества активных шаблонов
  get activeTemplatesCount(): number {
    return this.activeTemplates.length;
  }
}
