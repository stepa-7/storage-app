// Константы приложения

export const API_BASE_URL = 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  // Аутентификация
  AUTH: {
    SIGNIN: '/auth/signin',
    SIGNUP: '/auth/signup',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  // Хранилища
  STORAGE: {
    LIST: '/storages',
    CREATE: '/storages',
    GET: (id: string) => `/storages/${id}`,
    UPDATE: (id: string) => `/storages/${id}`,
    DELETE: (id: string) => `/storages/${id}`,
  },
  // Объекты
  OBJECTS: {
    LIST: '/objects',
    CREATE: '/objects',
    GET: (id: string) => `/objects/${id}`,
    UPDATE: (id: string) => `/objects/${id}`,
    DELETE: (id: string) => `/objects/${id}`,
    QRCODE: (id: string) => `/objects/${id}/qrcode`,
    IMAGE: (id: string) => `/objects/${id}/image`,
  },
  // Шаблоны
  TEMPLATES: {
    LIST: '/templates',
    CREATE: '/templates',
    GET: (id: string) => `/templates/${id}`,
    UPDATE: (id: string) => `/templates/${id}`,
    DELETE: (id: string) => `/templates/${id}`,
  },
  // Единицы измерения
  UNITS: {
    LIST: '/units',
  },
} as const;

export const VALIDATION = {
  EMAIL: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 254,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
  },
  STORAGE: {
    NAME_MAX_LENGTH: 50,
    CAPACITY_MIN: 1,
    CAPACITY_MAX: 999999,
  },
  OBJECT: {
    NAME_MAX_LENGTH: 100,
    ATTRIBUTE_MAX_LENGTH: 100,
  },
  FILE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/png', 'image/jpeg', 'application/pdf', 'text/plain'],
  },
} as const;

export const STORAGE_UNITS = {
  COUNT: { label: 'Количество', short: 'шт' },
  KG: { label: 'Килограммы', short: 'кг' },
} as const;

export const ATTRIBUTE_TYPES = {
  TEXT: { label: 'Текст', value: 'TEXT' },
  NUMBER: { label: 'Число', value: 'NUMBER' },
  DATE: { label: 'Дата', value: 'DATE' },
  FILE: { label: 'Файл', value: 'FILE' },
} as const;

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  STORAGE: '/storages',
  STORAGE_VIEW: '/storage/:id',
  OBJECT_NEW: '/object/new',
  OBJECT_VIEW: '/object/:id',
  TEMPLATES: '/templates',
} as const;

export const HEADER_LINKS = [
  { link: ROUTES.STORAGE, label: 'Хранилища' },
  { link: ROUTES.TEMPLATES, label: 'Шаблоны' },
];

export const NOTIFICATION_DURATION = 5000; // 5 секунд

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const TOKEN_STORAGE_KEY = 'auth_token';
