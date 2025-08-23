import QRCode from 'qrcode';

// Интерфейс для опций генерации QR-кода
export interface QRCodeOptions {
  mode?: 'server' | 'client';
  size?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

// Создание URL для просмотра объекта
export function createObjectUrl(objectId: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  return `${baseUrl}/object/${objectId}`;
}

// Создание URL для просмотра хранилища
export function createStorageUrl(storageId: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  return `${baseUrl}/storage/${storageId}`;
}

// Генерация QR-кода
export async function generateQRCode(data: string, options: QRCodeOptions = {}): Promise<string> {
  const { mode = 'client', size = 256, margin = 1, errorCorrectionLevel = 'M' } = options;

  try {
    if (mode === 'server') {
      // Попытка получить QR-код с сервера
      throw new Error('Server QR generation not implemented yet');

      // ЗАКОММЕНТИРОВАНО: Реальная серверная генерация
      // const response = await fetch(`/api/objects/${data}/qrcode`);
      // if (!response.ok) throw new Error('Server QR generation failed');
      // const blob = await response.blob();
      // return URL.createObjectURL(blob);
    }

    // Клиентская генерация QR-кода
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      width: size,
      margin,
      errorCorrectionLevel,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
}

// Скачивание QR-кода как файла
export function downloadQRCode(dataUrl: string, filename: string = 'qrcode.png'): void {
  try {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;

    // Добавляем элемент в DOM, кликаем и удаляем
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to download QR code:', error);
    throw new Error('Failed to download QR code');
  }
}

// Создание QR-кода для объекта с моковыми данными
export function createMockQRCode(): string {
  // Возвращаем base64 изображение простого QR-кода
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
}

// Валидация URL для QR-кода
export function isValidQRData(data: string): boolean {
  if (!data || typeof data !== 'string') return false;

  try {
    // Проверяем, является ли data валидным URL
    new URL(data);
    return true;
  } catch {
    // Если не URL, проверяем длину текста
    return data.length > 0 && data.length < 2000;
  }
}

// Получение информации об объекте из QR-кода URL
export function parseObjectIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');

    // URL должен быть вида /object/{id}
    if (pathParts.length >= 3 && pathParts[1] === 'object') {
      return pathParts[2];
    }

    return null;
  } catch {
    return null;
  }
}

// Получение информации о хранилище из QR-кода URL
export function parseStorageIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');

    // URL должен быть вида /storage/{id}
    if (pathParts.length >= 3 && pathParts[1] === 'storage') {
      return pathParts[2];
    }

    return null;
  } catch {
    return null;
  }
}
