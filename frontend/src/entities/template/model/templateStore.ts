import { makeAutoObservable, runInAction } from 'mobx';

import { templatesApi } from '@shared/api';
import { type ObjectTemplate, type CreateTemplateRequest, type ApiError } from '@shared/types';

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
  loadTemplates = async (): Promise<void> => {
    this.setLoading(true);
    this.clearError();

    try {
      const response = await templatesApi.getTemplates();
      runInAction(() => {
        this.templates = response.data;
      });
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.message || 'Ошибка загрузки шаблонов';
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
        this.error = apiError.message || 'Ошибка загрузки активных шаблонов';
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
        this.error = apiError.message || 'Ошибка загрузки шаблона';
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
      const newTemplate = await templatesApi.createTemplate(data);

      runInAction(() => {
        this.templates.push(newTemplate);
        if (newTemplate.isActive) {
          this.activeTemplates.push(newTemplate);
        }
      });

      return newTemplate;
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.message || 'Ошибка создания шаблона';
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
    data: Partial<CreateTemplateRequest>,
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
        this.error = apiError.message || 'Ошибка обновления шаблона';
      });
      return null;
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
        this.templates = this.templates.filter((t) => t.id !== id);
        this.activeTemplates = this.activeTemplates.filter((t) => t.id !== id);

        if (this.currentTemplate?.id === id) {
          this.currentTemplate = null;
        }
      });

      return true;
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.message || 'Ошибка удаления шаблона';
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Переключение статуса шаблона (активен/неактивен)
  toggleTemplateStatus = async (id: string, isActive: boolean): Promise<boolean> => {
    this.setLoading(true);
    this.clearError();

    try {
      const updatedTemplate = await templatesApi.toggleTemplateStatus(id, isActive);

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

      return true;
    } catch (error) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.message || 'Ошибка изменения статуса шаблона';
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
    this.activeTemplates = this.templates.filter((t) => t.isActive);
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
