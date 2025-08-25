import {
  Title,
  Card,
  Text,
  Group,
  Button,
  Stack,
  Grid,
  Badge,
  Modal,
  Image,
  Divider,
  Skeleton,
  Box,
  Paper,
} from '@mantine/core';
import { DeleteConfirmationModal } from '@shared/ui/DeleteConfirmationModal';
import { PageLayout } from '@shared/ui/PageLayout';
import { Breadcrumbs } from '@shared/ui/Breadcrumbs';
import { notifications } from '@mantine/notifications';
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconDownload,
  IconQrcode,
  IconPackage,
  IconInfoCircle,
  IconTag,
  IconMapPin,
} from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useObjectStore, useTemplateStore, useUnitStore } from '@app/store/StoreContext';
import { ROUTES } from '@shared/constants';
import { generateQRCode, createObjectUrl } from '@shared/lib';
import { objectsApi } from '@shared/api/objects';

import styles from './ObjectViewPage.module.scss';

export const ObjectViewPage: React.FC = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loadObject, currentObject, isLoading, deleteObject, error } = useObjectStore();
  const { getTemplateById } = useTemplateStore();
  const { getUnitById } = useUnitStore();

  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadObject(id);
    }
  }, [id, loadObject]);

  // Загружаем изображение при получении объекта
  useEffect(() => {
    if (currentObject) {
      const loadImage = async () => {
        try {
          const url = await objectsApi.getObjectImage(currentObject.id);
          // Проверяем, что URL действительно валидный
          if (url && (url.startsWith('blob:') || url.startsWith('data:'))) {
            setImageUrl(url);
          } else {
            setImageUrl(null);
          }
        } catch (error) {
          setImageUrl(null);
        }
      };
      loadImage();
    } else {
      setImageUrl(null);
    }
  }, [currentObject]);

  // Очищаем URL при изменении imageUrl
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  // Генерируем QR-код при открытии модального окна
  useEffect(() => {
    if (showQRModal && currentObject) {
      const generateQR = async () => {
        try {
          const qrUrl = await generateQRCode(currentObject.id, { mode: 'server' });
          setQrCodeUrl(qrUrl);
        } catch {
          try {
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
    navigate(-1);
  };

  const handleEdit = () => {
    if (!currentObject) return;

    notifications.show({
      title: 'В разработке',
      message: 'Функция редактирования находится в разработке',
      color: 'blue',
    });
  };

  const handleDelete = async () => {
    if (!currentObject) return;

    setIsDeleting(true);
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
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleDownloadQR = async () => {
    if (!currentObject) return;

    try {
      let qrDataUrl: string;
      try {
        qrDataUrl = await generateQRCode(currentObject.id, { mode: 'server' });
      } catch {
        const objectUrl = createObjectUrl(currentObject.id);
        qrDataUrl = await generateQRCode(objectUrl, { mode: 'client' });
      }

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
      <PageLayout title="Загрузка объекта" subtitle="Пожалуйста, подождите...">
        <Grid gutter="lg">
          <Grid.Col span={12}>
            <Card shadow="sm" padding="xl" radius="md">
              <Stack gap="lg">
                <Group gap="lg">
                  <Skeleton height={240} width={240} radius="md" />
                  <Stack gap="md" style={{ flex: 1 }}>
                    <Skeleton height={24} width="60%" />
                    <Skeleton height={20} width="40%" />
                    <Skeleton height={20} width="50%" />
                    <Skeleton height={32} width={100} />
                  </Stack>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={12}>
            <Card shadow="sm" padding="xl" radius="md">
              <Stack gap="lg">
                <Skeleton height={28} width="30%" />
                <Divider />
                <Grid gutter="md">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Grid.Col key={i} span={{ base: 12, sm: 6 }}>
                      <Skeleton height={80} radius="sm" />
                    </Grid.Col>
                  ))}
                </Grid>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </PageLayout>
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
          return new Date(value as string).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        } catch {
          return String(value);
        }
      case 'NUMBER':
        return typeof value === 'number' ? value.toLocaleString('ru-RU') : String(value);
      case 'FILE':
        return value ? 'Файл загружен' : 'Файл не загружен';
      case 'BOOLEAN':
        return value ? 'Да' : 'Нет';
      case 'TEXT':
        return String(value) || '—';
      default:
        return String(value) || '—';
    }
  };

  const getAttributeIcon = (type: string) => {
    switch (type) {
      case 'DATE':
        return <IconInfoCircle size={16} />;
      case 'NUMBER':
        return <IconDownload size={16} />;
      case 'FILE':
        return <IconDownload size={16} />;
      case 'BOOLEAN':
        return <IconInfoCircle size={16} />;
      default:
        return <IconTag size={16} />;
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
    <PageLayout
      title={currentObject.name}
      subtitle={
        <Group gap="xs" align="center">
          <IconTag size={16} />
          <Text size="sm" c="dimmed">
            {template?.name || 'Неизвестный шаблон'}
          </Text>
          {unit && (
            <>
              <Text size="sm" c="dimmed">
                •
              </Text>
              <Text size="sm" c="dimmed">
                Единица: {unit.name} ({unit.symbol})
              </Text>
            </>
          )}
        </Group>
      }
      action={{
        label: 'QR-код',
        icon: <IconQrcode size={16} />,
        onClick: () => setShowQRModal(true),
        variant: 'light',
      }}
    >
      {/* Кнопка "Назад" */}
      <Box mb="lg">
        <Button
          variant="subtle"
          onClick={handleBack}
          leftSection={<IconArrowLeft size={16} />}
          size="sm"
        >
          Назад
        </Button>
      </Box>

      <Grid gutter="lg">
        {/* Основная информация */}
        <Grid.Col span={12}>
          <Card shadow="sm" padding="xl" radius="md" className={styles.mainCard}>
            <Stack gap="lg">
              {/* Расположение объекта */}
              {currentObject.storage_id && (
                <Group gap="xs" align="center">
                  <IconMapPin size={16} className={styles.locationIcon} />
                  <Text size="sm" c="dimmed" fw={500}>
                    Расположение:
                  </Text>
                  <Breadcrumbs storageId={currentObject.storage_id} />
                </Group>
              )}

              <Group gap="lg" align="flex-start" wrap="wrap">
                {/* Фото объекта */}
                <div className={styles.photoSection}>
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={currentObject.name}
                      radius="md"
                      className={styles.objectPhoto}
                      fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' fill='%23f8f9fa'/%3E%3Cg fill='%23dee2e6'%3E%3Ccircle cx='120' cy='100' r='24'/%3E%3Cpath d='M120 140c-22.1 0-40-17.9-40-40s17.9-40 40-40 40 17.9 40 40-17.9 40-40 40zm0-72c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32z'/%3E%3C/g%3E%3C/svg%3E"
                      onError={() => setImageUrl(null)}
                    />
                  ) : (
                    <div className={styles.noPhoto}>
                      <IconPackage size={48} className={styles.noPhotoIcon} />
                      <Text size="sm" c="dimmed" ta="center">
                        Фото отсутствует
                      </Text>
                    </div>
                  )}
                </div>

                {/* Основные данные */}
                <div className={styles.infoSection}>
                  <Stack gap="lg">
                    <Group gap="md">
                      <div>
                        <Text size="sm" c="dimmed" mb={4}>
                          Размер
                        </Text>
                        <Group gap="xs" align="center">
                          <Text fw={600} size="lg">
                            {currentObject.size.toLocaleString('ru-RU')} {unit?.symbol || 'шт'}
                          </Text>
                        </Group>
                      </div>
                    </Group>

                    <Group gap="md">
                      <div>
                        <Text size="sm" c="dimmed" mb={4}>
                          Дата создания
                        </Text>
                        <Text fw={600} size="lg">
                          {formatDate(currentObject.created_at)}
                        </Text>
                      </div>
                    </Group>

                    <div>
                      <Text size="sm" c="dimmed" mb={8}>
                        Статус
                      </Text>
                      <Badge
                        color={currentObject.is_decommissioned ? 'red' : 'green'}
                        variant="light"
                        size="lg"
                        radius="md"
                        className={styles.statusBadge}
                      >
                        {currentObject.is_decommissioned ? 'Списан' : 'Активен'}
                      </Badge>
                    </div>
                  </Stack>
                </div>
              </Group>

              {/* Действия */}
              <Divider />
              <Group justify="flex-end" gap="sm">
                <Button
                  variant="light"
                  onClick={handleEdit}
                  leftSection={<IconEdit size={16} />}
                  size="sm"
                >
                  Редактировать
                </Button>
                <Button
                  variant="light"
                  color="red"
                  onClick={() => setShowDeleteModal(true)}
                  leftSection={<IconTrash size={16} />}
                  size="sm"
                >
                  Удалить
                </Button>
              </Group>
            </Stack>
          </Card>
        </Grid.Col>

        {/* Атрибуты шаблона */}
        {template && Object.keys(template.schema).length > 0 && (
          <Grid.Col span={12}>
            <Card shadow="sm" padding="xl" radius="md" className={styles.attributesCard}>
              <Stack gap="lg">
                <Group gap="sm" align="center">
                  <IconTag size={20} className={styles.sectionIcon} />
                  <Title order={3} className={styles.sectionTitle}>
                    Атрибуты
                  </Title>
                </Group>
                <Divider />
                <Grid gutter="md">
                  {Object.entries(template.schema).map(([key, attribute], index) => {
                    const value = currentObject.attributes[key];
                    return (
                      <Grid.Col key={key} span={{ base: 12, sm: 6, md: 4 }}>
                        <Paper
                          p="md"
                          radius="md"
                          className={styles.attributeItem}
                          withBorder
                          style={{ '--animation-order': index } as React.CSSProperties}
                        >
                          <Stack gap="xs">
                            <Group gap="xs" align="center">
                              <IconInfoCircle size={16} className={styles.attributeIcon} />
                              <Text size="sm" c="dimmed" fw={500}>
                                {attribute.name}
                                {attribute.required && (
                                  <Text component="span" c="red" ml={4}>
                                    *
                                  </Text>
                                )}
                              </Text>
                            </Group>
                            <Group gap="xs" align="center">
                              {getAttributeIcon(attribute.type)}
                              <Text fw={600} size="md">
                                {formatAttributeValue(key, value)}
                              </Text>
                            </Group>
                          </Stack>
                        </Paper>
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
          <Group gap="sm" align="center">
            <IconQrcode size={20} />
            <Text size="lg" fw={600}>
              QR-код объекта
            </Text>
          </Group>
        }
        centered
        size="xl"
        closeOnClickOutside={false}
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        radius="md"
        shadow="xl"
        classNames={{
          header: styles.modalHeader,
          body: styles.modalBody,
        }}
      >
        <Stack gap="xl" align="center">
          {qrCodeUrl ? (
            <>
              <Box className={styles.qrContainer}>
                <Image src={qrCodeUrl} alt="QR код" className={styles.qrImage} />
              </Box>
              <Text size="sm" c="dimmed" ta="center" maw={400}>
                Сканируйте QR-код для быстрого доступа к объекту
              </Text>
              <Button
                variant="light"
                onClick={handleDownloadQR}
                leftSection={<IconDownload size={16} />}
                size="md"
                radius="md"
              >
                Скачать QR-код
              </Button>
            </>
          ) : (
            <Stack gap="md" align="center">
              <Skeleton height={300} width={300} radius="md" />
              <Text size="sm" c="dimmed">
                Генерация QR-кода...
              </Text>
            </Stack>
          )}
        </Stack>
      </Modal>

      {/* Модальное окно подтверждения удаления */}
      <DeleteConfirmationModal
        opened={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Подтверждение удаления"
        itemName={currentObject.name}
        description="Это действие нельзя отменить."
        size="md"
        loading={isDeleting}
      />
    </PageLayout>
  );
});
