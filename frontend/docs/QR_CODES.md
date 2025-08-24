# Генерация QR-кодов

В проекте реализована гибкая система генерации QR-кодов, поддерживающая как клиентскую, так и серверную генерацию.

## Архитектура

### Доступные режимы

1. **Client-side (по умолчанию)** - генерация на фронтенде
2. **Server-side** - генерация на бэкенде
3. **Hybrid** - автоматический fallback (сервер → клиент)

### API Endpoints

```yaml
GET /objects/{id}/qrcode
- Генерирует QR-код для объекта на сервере
- Возвращает: image/png
- Авторизация: Bearer token
```

## Настройка

### Переменные окружения

```bash
# Режим генерации (по умолчанию: 'client')
VITE_QR_MODE=client|server

# Примеры:
VITE_QR_MODE=client  # Только клиентская генерация
VITE_QR_MODE=server  # Приоритет серверной генерации
```

### Программная настройка

```typescript
import { generateQRCode } from '@shared/lib';

// Принудительно клиентская генерация
const qrUrl = await generateQRCode(objectUrl, { mode: 'client' });

// Принудительно серверная генерация
const qrUrl = await generateQRCode(objectId, { mode: 'server' });

// Автоматический выбор (по переменной окружения)
const qrUrl = await generateQRCode(textOrObjectId);
```

## Сравнение подходов

| Критерий               | Client-side           | Server-side        |
| ---------------------- | --------------------- | ------------------ |
| **Скорость**           | ⚡ Мгновенно          | 🌐 Зависит от сети |
| **Нагрузка на сервер** | ✅ Нет                | ❌ Есть            |
| **Офлайн работа**      | ✅ Да                 | ❌ Нет             |
| **Консистентность**    | ⚠️ Зависит от клиента | ✅ Единообразно    |
| **Брендинг/Логотипы**  | ❌ Ограниченно        | ✅ Полный контроль |
| **Размер бандла**      | ❌ +библиотека        | ✅ Без изменений   |
| **Кеширование**        | ⚠️ Браузер            | ✅ Сервер + CDN    |

## Рекомендации

### Для разработки

```bash
VITE_QR_MODE=client  # Быстрая разработка без сервера
```

### Для продакшена

```bash
VITE_QR_MODE=server  # Консистентность и брендинг
```

### Для PWA/офлайн

```bash
VITE_QR_MODE=client  # Работа без интернета
```

## Технические детали

### Текущая реализация

- **Библиотека**: `qrcode` для клиентской генерации
- **Fallback**: Автоматическое переключение при ошибке сервера
- **Формат**: Data URLs и Blob URLs
- **Размер**: 256x256px (настраивается)

### Интеграция с бэкендом

```typescript
// API клиент автоматически добавляет авторизацию
const response = await fetch('/objects/{id}/qrcode', {
  headers: { Authorization: `Bearer ${token}` },
});
const blob = await response.blob();
const url = URL.createObjectURL(blob);
```

### Обработка ошибок

```typescript
try {
  // Попытка серверной генерации
  const qrUrl = await generateQRCode(objectId, { mode: 'server' });
} catch (serverError) {
  // Fallback на клиентскую генерацию
  const objectUrl = createObjectUrl(objectId);
  const qrUrl = await generateQRCode(objectUrl, { mode: 'client' });
}
```

## Расширение функциональности

### Добавление брендинга

```typescript
// Для серверной генерации - настраивается на бэкенде
// Для клиентской - можно добавить логотип:
const qrUrl = await generateQRCode(text, {
  width: 512,
  margin: 4,
  color: {
    dark: '#000000',
    light: '#FFFFFF',
  },
});
```

### Пакетная генерация

```typescript
// Для массовой генерации лучше использовать сервер
const qrCodes = await Promise.all(objectIds.map((id) => generateQRCode(id, { mode: 'server' })));
```

## Мониторинг

### Метрики для отслеживания

- Время генерации QR-кодов
- Количество fallback'ов на клиент
- Ошибки генерации
- Использование кеша (для серверной генерации)

### Логирование

```typescript
// Автоматически логируется в консоль браузера
console.log('QR generation mode:', mode);
console.warn('Server QR failed, fallback to client');
console.error('QR generation failed:', error);
```
