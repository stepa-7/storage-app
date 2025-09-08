// Базовые типы для системы хранения

export interface User {
  id: number;
  login: string;
  mail: string;
  role: UserRole[];
}

export type UserRole = 'ADMIN' | 'GUEST';

export interface Storage {
  id: string;
  name: string;
  capacity: number; // Максимальная вместимость (с бэкенда)
  fullness: number; // Текущая заполненность (с бэкенда)
  unit: string; // UUID единицы измерения
  parentId?: string;
  children?: Storage[];
  objects?: StorageObject[];
  createdAt: string;
  updatedAt: string;
  // Добавляем вычисляемые поля для совместимости
  maxCapacity?: number; // Алиас для capacity
  currentCapacity?: number; // Алиас для fullness
}

export interface StorageWithDetails extends Storage {
  children?: StorageWithDetails[];
  objects?: StorageObject[];
}

export interface Unit {
  id: string;
  name: string;
  symbol: string;
}

export interface StorageObject {
  id: string;
  name: string;
  template_id: string;
  storage_id: string;
  size: number;
  unit_id: string;
  attributes: Record<string, string | number | boolean>;
  photo_url?: string;
  is_decommissioned: boolean;
  created_by: string;
  created_at: string;
}

export interface StorageObjectWithDetails extends StorageObject {
  template: ObjectTemplate;
  unit: Unit;
}

export interface ObjectTemplate {
  id: string;
  name: string;
  description: string;
  schema: Record<string, TemplateAttribute>;
  deleted: boolean;
}

export interface TemplateAttribute {
  name: string;
  type: AttributeType;
  required?: boolean;
  maxLength?: number;
  maxFileSize?: number;
  allowedFileTypes?: string[];
}

export type AttributeType = 'TEXT' | 'NUMBER' | 'DATE' | 'FILE' | 'BOOLEAN';

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface SigninRequest {
  login: string; // Бэкенд ожидает login, а не email
  password: string;
}

export interface SignupRequest {
  login: string; // Бэкенд требует login
  email: string; // Бэкенд требует email
  password: string;
}

export interface CreateStorageRequest {
  name: string;
  maxCapacity: number; // Отправляем как maxCapacity на фронте
  unit: string; // UUID единицы измерения
  parentId?: string;
}

export interface UpdateStorageRequest {
  name?: string;
  maxCapacity?: number; // Отправляем как maxCapacity на фронте
  parentId?: string;
}

export interface CreateObjectRequest {
  name: string;
  template_id: string;
  storage_id: string;
  size: number;
  unit_id: string;
  attributes: Record<string, string | number | boolean>;
  photo?: File;
}

export interface UpdateObjectRequest {
  name?: string;
  storage_id?: string;
  size?: number;
  unit_id?: string;
  attributes?: Record<string, string | number | boolean>;
  photo?: File;
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  schema: Record<string, TemplateAttribute>;
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  deleted?: boolean;
}

export interface ApiError {
  error: string;
  message?: string;
  status?: number; // HTTP статус для определения типа ошибки
}

// Типы ошибок аутентификации
export type AuthErrorType =
  | 'login_exists'
  | 'email_exists'
  | 'invalid_credentials'
  | 'refresh_invalid_or_expired';

export interface AuthError {
  type: AuthErrorType;
  message: string;
}

// Функция для перевода ошибок аутентификации
export const getAuthErrorMessage = (errorType: AuthErrorType): string => {
  switch (errorType) {
    case 'login_exists':
      return 'Этот логин уже занят';
    case 'email_exists':
      return 'Этот email уже занят';
    case 'invalid_credentials':
      return 'Неверный логин или пароль';
    case 'refresh_invalid_or_expired':
      return 'Сессия истекла, войдите заново';
    default:
      return 'Произошла ошибка аутентификации';
  }
};

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
