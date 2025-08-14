// Базовые типы для системы хранения

export interface User {
  id: string;
  email: string;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'USER' | 'ADMIN';

export interface Storage {
  id: string;
  name: string;
  maxCapacity: number;
  currentCapacity: number;
  unit: StorageUnit;
  parentId?: string;
  children: Storage[];
  objects: StorageObject[];
  createdAt: string;
  updatedAt: string;
}

export type StorageUnit = 'COUNT' | 'KG';

export interface StorageObject {
  id: string;
  name: string;
  templateId: string;
  template: ObjectTemplate;
  attributes: ObjectAttribute[];
  storageId: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ObjectTemplate {
  id: string;
  name: string;
  attributes: TemplateAttribute[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateAttribute {
  id: string;
  name: string;
  type: AttributeType;
  isRequired: boolean;
  maxLength?: number;
  maxFileSize?: number;
  allowedFileTypes?: string[];
}

export type AttributeType = 'TEXT' | 'NUMBER' | 'DATE' | 'FILE';

export interface ObjectAttribute {
  id: string;
  templateAttributeId: string;
  templateAttribute: TemplateAttribute;
  value: string | number | Date | File;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
  // refreshToken не возвращается в JSON, он устанавливается в HTTP-only cookie
}

export interface RefreshResponse {
  accessToken: string;
  user: User;
  // refreshToken устанавливается в HTTP-only cookie
}

export interface SigninRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface CreateStorageRequest {
  name: string;
  maxCapacity: number;
  unit: StorageUnit;
  parentId?: string;
}

export interface CreateObjectRequest {
  templateId: string;
  attributes: CreateObjectAttributeRequest[];
  storageId: string;
  photo?: File;
}

export interface CreateObjectAttributeRequest {
  templateAttributeId: string;
  value: string | number | Date | File;
}

export interface CreateTemplateRequest {
  name: string;
  attributes: CreateTemplateAttributeRequest[];
}

export interface CreateTemplateAttributeRequest {
  name: string;
  type: AttributeType;
  isRequired: boolean;
  maxLength?: number;
  maxFileSize?: number;
  allowedFileTypes?: string[];
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
