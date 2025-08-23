import {
  Container,
  Title,
  Card,
  Text,
  Group,
  Button,
  Stack,
  Grid,
  Badge,
  ActionIcon,
  Modal,
  Image,
  Divider,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconDownload,
  IconQrcode,
  IconPackage,
  IconCalendar,
  IconRuler,
} from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useObjectStore, useTemplateStore, useUnitStore } from '@app/store/StoreContext';
import { ROUTES } from '@shared/constants';
import { generateQRCode, createObjectUrl } from '@shared/lib';

import styles from './ObjectViewPage.module.scss';

export const ObjectViewPage: React.FC = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loadObject, currentObject, isLoading, deleteObject } = useObjectStore();
  const { getTemplateById } = useTemplateStore();
  const { getUnitById } = useUnitStore();

  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadObject(id);
    }
  }, [id, loadObject]);

  // Генерируем QR-код при открытии модального окна
  useEffect(() => {
    if (showQRModal && currentObject) {
      // Пробуем сначала серверную генерацию, потом клиентскую как fallback
      const generateQR = async () => {
        try {
          // Попытка серверной генерации
          const qrUrl = await generateQRCode(currentObject.id, { mode: 'server' });
          setQrCodeUrl(qrUrl);
        } catch {
          try {
            // Fallback: клиентская генерация
            const objectUrl = createObjectUrl(currentObject.id);
            const qrUrl = await generateQRCode(objectUrl, { mode: 'client' });
            setQrCodeUrl(qrUrl);
          } catch {
            notifications.show({
              title: 'Ошибка',
              message: 'Не удалось сгенерировать QR-код',
              color: 'red',
            });
          }
        }
      };

      generateQR();
    }
  }, [showQRModal, currentObject]);

  const handleBack = () => {
    navigate(-1); // Возвращаемся на предыдущую страницу
  };

  const handleEdit = () => {
    if (!currentObject) return;

    // TODO: Создать страницу редактирования объекта
    // Пока показываем уведомление
    notifications.show({
      title: 'В разработке',
      message: 'Функция редактирования находится в разработке',
      color: 'blue',
    });
  };

  const handleDelete = async () => {
    if (!currentObject) return;

    try {
      const success = await deleteObject(currentObject.id);
      if (success) {
        notifications.show({
          title: 'Успех',
          message: 'Объект успешно удален',
          color: 'green',
        });
        navigate(ROUTES.STORAGE);
      }
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось удалить объект',
        color: 'red',
      });
    }
    setShowDeleteModal(false);
  };

  const handleDownloadQR = async () => {
    if (!currentObject) return;

    try {
      // Используем тот же подход - сначала сервер, потом клиент
      let qrDataUrl: string;
      try {
        qrDataUrl = await generateQRCode(currentObject.id, { mode: 'server' });
      } catch {
        const objectUrl = createObjectUrl(currentObject.id);
        qrDataUrl = await generateQRCode(objectUrl, { mode: 'client' });
      }

      // Скачиваем QR-код
      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = `qr-code-${currentObject.name}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      notifications.show({
        title: 'Успех',
        message: 'QR-код успешно скачан',
        color: 'green',
      });
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось скачать QR-код',
        color: 'red',
      });
    }
  };

  if (isLoading || !currentObject) {
    return (
      <div className={styles.loading}>
        <Container size="md">
          <Text ta="center" size="lg">
            Загрузка объекта...
          </Text>
        </Container>
      </div>
    );
  }

  const template = getTemplateById(currentObject.template_id);
  const unit = getUnitById(currentObject.unit_id);

  const formatAttributeValue = (key: string, value: unknown) => {
    const attribute = template?.schema[key];
    if (!attribute) return String(value);

    switch (attribute.type) {
      case 'DATE':
        try {
          return new Date(value as string).toLocaleDateString('ru-RU');
        } catch {
          return String(value);
        }
      case 'NUMBER':
        return typeof value === 'number' ? value.toString() : String(value);
      case 'FILE':
        return value ? 'Файл загружен' : 'Файл не загружен';
      default:
        return String(value);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className={styles.page}>
      <Container size="md" className={styles.container}>
        {/* Заголовок */}
        <div className={styles.header}>
          <Group gap="md">
            <Button variant="subtle" onClick={handleBack} leftSection={<IconArrowLeft size={16} />}>
              Назад
            </Button>
            <div className={styles.titleSection}>
              <Title order={1} className={styles.title}>
                {currentObject.name}
              </Title>
              <Text size="lg" c="dimmed">
                {template?.name || 'Неизвестный шаблон'}
              </Text>
            </div>
          </Group>

          <Group gap="sm">
            <Button
              variant="subtle"
              onClick={() => setShowQRModal(true)}
              leftSection={<IconQrcode size={16} />}
            >
              QR-код
            </Button>
            <ActionIcon variant="subtle" size="md" onClick={handleEdit} title="Редактировать">
              <IconEdit size={18} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="red"
              size="md"
              onClick={() => setShowDeleteModal(true)}
              title="Удалить"
            >
              <IconTrash size={18} />
            </ActionIcon>
          </Group>
        </div>

        <Grid gutter="md">
          {/* Основная информация */}
          <Grid.Col span={12}>
            <Card shadow="sm" padding="lg" radius="md" className={styles.mainCard}>
              <Stack gap="md">
                <Group justify="space-between" align="flex-start">
                  {/* Фото объекта */}
                  <div className={styles.photoSection}>
                    {currentObject.photo_url ? (
                      <Image
                        src={currentObject.photo_url}
                        alt={currentObject.name}
                        radius="md"
                        className={styles.objectPhoto}
                      />
                    ) : (
                      <div className={styles.noPhoto}>
                        <IconPackage size={48} color="var(--mantine-color-gray-4)" />
                        <Text size="sm" c="dimmed" ta="center">
                          Фото отсутствует
                        </Text>
                      </div>
                    )}
                  </div>

                  {/* Основные данные */}
                  <div className={styles.infoSection}>
                    <Stack gap="sm">
                      <Group gap="md">
                        <IconRuler size={18} color="var(--mantine-color-gray-6)" />
                        <div>
                          <Text size="sm" c="dimmed">
                            Размер
                          </Text>
                          <Text fw={500}>
                            {currentObject.size} {unit?.symbol || 'шт'}
                          </Text>
                        </div>
                      </Group>

                      <Group gap="md">
                        <IconCalendar size={18} color="var(--mantine-color-gray-6)" />
                        <div>
                          <Text size="sm" c="dimmed">
                            Дата создания
                          </Text>
                          <Text fw={500}>{formatDate(currentObject.created_at)}</Text>
                        </div>
                      </Group>

                      <div>
                        <Text size="sm" c="dimmed" mb="xs">
                          Статус
                        </Text>
                        <Badge
                          color={currentObject.is_decommissioned ? 'red' : 'green'}
                          variant="light"
                        >
                          {currentObject.is_decommissioned ? 'Списан' : 'Активен'}
                        </Badge>
                      </div>
                    </Stack>
                  </div>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Атрибуты шаблона */}
          {template && Object.keys(template.schema).length > 0 && (
            <Grid.Col span={12}>
              <Card shadow="sm" padding="lg" radius="md" className={styles.attributesCard}>
                <Stack gap="md">
                  <Title order={3}>Атрибуты</Title>
                  <Divider />
                  <Grid gutter="md">
                    {Object.entries(template.schema).map(([key, attribute]) => {
                      const value = currentObject.attributes[key];
                      return (
                        <Grid.Col key={key} span={{ base: 12, sm: 6 }}>
                          <div className={styles.attributeItem}>
                            <Text size="sm" c="dimmed" mb="xs">
                              {attribute.name}
                              {attribute.required && (
                                <Text component="span" c="red" ml="xs">
                                  *
                                </Text>
                              )}
                            </Text>
                            <Text fw={500}>{formatAttributeValue(key, value) || '—'}</Text>
                          </div>
                        </Grid.Col>
                      );
                    })}
                  </Grid>
                </Stack>
              </Card>
            </Grid.Col>
          )}
        </Grid>

        {/* Модальное окно QR-кода */}
        <Modal
          opened={showQRModal}
          onClose={() => setShowQRModal(false)}
          title={
            <Text size="lg" fw={600}>
              QR-код объекта
            </Text>
          }
          centered
          size="xl"
          closeOnClickOutside={false}
          overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
          radius="md"
          shadow="xl"
        >
          <Stack gap="lg" align="center">
            {qrCodeUrl ? (
              <>
                <div
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Image
                    src={qrCodeUrl}
                    alt="QR код"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                    }}
                  />
                </div>
                <Text size="sm" c="dimmed" ta="center">
                  Сканируйте QR-код для быстрого доступа к объекту
                </Text>
                <Button
                  variant="subtle"
                  onClick={handleDownloadQR}
                  leftSection={<IconDownload size={16} />}
                  size="md"
                >
                  Скачать QR-код
                </Button>
              </>
            ) : (
              <Text>Генерация QR-кода...</Text>
            )}
          </Stack>
        </Modal>

        {/* Модальное окно подтверждения удаления */}
        <Modal
          opened={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title={
            <Text size="lg" fw={600}>
              Подтверждение удаления
            </Text>
          }
          centered
          size="lg"
          closeOnClickOutside={false}
          overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
          radius="md"
          shadow="xl"
        >
          <Stack gap="lg">
            <Text>
              Вы уверены, что хотите удалить объект{' '}
              <strong>&quot;{currentObject.name}&quot;</strong>?
            </Text>
            <Text size="sm" c="dimmed">
              Это действие нельзя отменить.
            </Text>
            <Group justify="flex-end" gap="md" pt="md">
              <Button variant="subtle" onClick={() => setShowDeleteModal(false)} size="md">
                Отмена
              </Button>
              <Button color="red" onClick={handleDelete} size="md">
                Удалить
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Container>
    </div>
  );
});
