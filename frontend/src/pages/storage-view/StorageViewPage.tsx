import { Container, Title, Card, Text, Group, Button, Progress, Stack, Grid } from '@mantine/core';
import { IconPlus, IconPackage, IconTrash, IconEdit, IconArrowBarDown } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useStorageStore, useObjectStore, useUnitStore } from '@app/store/StoreContext';
import { ROUTES } from '@shared/constants';
import { Breadcrumbs } from '@shared/ui/Breadcrumbs';

import styles from './StorageViewPage.module.scss';

export const StorageViewPage: React.FC = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loadStorage, currentStorage, isLoading, getChildStorages } = useStorageStore();
  const {
    loadObjects,
    getObjectsForStorage,
    isLoading: objectsLoading,
    deleteObject,
  } = useObjectStore();
  const { units } = useUnitStore();

  // Функция для перезагрузки всех данных страницы
  const refreshData = useCallback(() => {
    if (id) {
      loadStorage(id);
      loadObjects({ storage_id: id });
    }
  }, [id, loadStorage, loadObjects]);

  useEffect(() => {
    refreshData();
  }, [refreshData, id]); // Добавляем id в зависимости

  // Перезагружаем данные при каждом возвращении на страницу
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refreshData]);

  if (isLoading || !currentStorage) {
    return (
      <div className={styles.loading}>
        <Text>Загрузка хранилищ...</Text>
      </div>
    );
  }

  const fillPercentage = Math.round((currentStorage.fullness / currentStorage.capacity) * 100);

  // Получаем объекты для текущего хранилища
  const storageObjects = id ? getObjectsForStorage(id) : [];

  const handleAddObject = () => {
    if (id) {
      navigate(ROUTES.OBJECT_NEW, { state: { storageId: id } });
    }
  };

  const handleViewObject = (objectId: string) => {
    navigate(ROUTES.OBJECT_VIEW.replace(':id', objectId));
  };

  const handleEditObject = (objectId: string) => {
    // TODO: Реализовать страницу редактирования объекта
    console.warn('Edit object functionality not implemented:', objectId);
  };

  const handleMoveObject = (objectId: string) => {
    // TODO: Реализовать модальное окно перемещения объекта
    console.warn('Move object functionality not implemented:', objectId);
  };

  const handleDeleteObject = async (objectId: string) => {
    try {
      const success = await deleteObject(objectId);
      if (success) {
        // Обновляем данные страницы
        refreshData();
      }
    } catch (error) {
      console.error('Failed to delete object:', error);
    }
  };

  // Получаем дочерние хранилища
  const childStorages = getChildStorages(currentStorage.id);

  // Функция для получения единицы измерения объекта
  const getObjectUnit = (unitId: string) => {
    const unit = units.find((u) => u.id === unitId);
    return unit?.symbol || 'кг';
  };

  // Функция для получения единицы измерения хранилища
  const getStorageUnit = (unitId: string) => {
    const unit = units.find((u) => u.id === unitId);
    return unit?.symbol || 'кг';
  };

  return (
    <div className={styles.page}>
      <Container size="xl" className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <Breadcrumbs storageId={currentStorage.id} />
            <Title order={2} className={styles.title}>
              {currentStorage.name}
            </Title>
          </div>

          <div className={styles.actions}>
            <Button variant="filled" onClick={handleAddObject} leftSection={<IconPlus size={16} />}>
              Объект
            </Button>
          </div>
        </div>

        {/* Прогресс заполненности */}
        <Card padding="lg" radius="md" className={styles.progressCard}>
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Text size="lg" fw={600}>
                Заполненность хранилища
              </Text>
              <Text
                size="lg"
                fw={600}
                c={fillPercentage > 80 ? 'red.7' : fillPercentage > 60 ? 'orange.6' : 'green.6'}
              >
                {fillPercentage.toFixed(1)}%
              </Text>
            </Group>

            <Progress
              value={fillPercentage}
              size="lg"
              radius="sm"
              color={fillPercentage > 80 ? 'red' : fillPercentage > 60 ? 'orange' : 'green'}
              style={{ marginBottom: '8px' }}
            />

            <Group justify="space-between" align="center">
              <Text size="sm" c="dimmed">
                Занято: {currentStorage.fullness} {getStorageUnit(currentStorage.unit)}
              </Text>
              <Text size="sm" c="dimmed">
                Свободно: {(currentStorage.capacity - currentStorage.fullness).toFixed(1)}{' '}
                {getStorageUnit(currentStorage.unit)}
              </Text>
            </Group>

            <Text size="xs" c="dimmed" ta="center" mt="xs">
              Максимальная ёмкость: {currentStorage.capacity} {getStorageUnit(currentStorage.unit)}
            </Text>
          </Stack>
        </Card>

        {/* Вложенные хранилища */}
        {childStorages.length > 0 && (
          <div className={styles.section}>
            <Title order={2} mb="md">
              Вложенные хранилища
            </Title>
            <Grid gutter="md">
              {childStorages.map((child) => (
                <Grid.Col key={child.id} span={{ base: 12, sm: 6, md: 4 }}>
                  <Card
                    shadow="sm"
                    padding="md"
                    radius="md"
                    className={styles.childStorageCard}
                    onClick={() => navigate(ROUTES.STORAGE_VIEW.replace(':id', child.id))}
                  >
                    <Stack gap="xs">
                      <Text fw={500} size="sm">
                        {child.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {child.fullness}/{child.capacity} {getStorageUnit(child.unit)}
                      </Text>
                      <Progress
                        value={Math.round((child.fullness / child.capacity) * 100)}
                        size="sm"
                        color={child.fullness / child.capacity > 0.8 ? 'red' : 'blue'}
                      />
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </div>
        )}

        {/* Объекты хранения */}
        <div className={styles.section}>
          <Title order={2} mb="md">
            Объекты хранения
          </Title>

          {objectsLoading ? (
            <div className={styles.loading}>
              <Text>Загрузка объектов...</Text>
            </div>
          ) : storageObjects.length === 0 ? (
            <div className={styles.empty}>
              <IconPackage size={48} color="var(--mantine-color-gray-4)" />
              <Text size="lg" c="dimmed" ta="center">
                Объекты не найдены
              </Text>
              <Button
                variant="light"
                onClick={handleAddObject}
                leftSection={<IconPlus size={16} />}
              >
                Добавить первый объект
              </Button>
            </div>
          ) : (
            <Grid gutter="md">
              {storageObjects.map((object) => (
                <Grid.Col key={object.id} span={{ base: 12, sm: 6, md: 4 }}>
                  <Card shadow="sm" padding="md" radius="md" className={styles.objectCard}>
                    <Stack gap="md">
                      {/* Фото объекта */}
                      {object.photo_url ? (
                        <div className={styles.objectPhoto}>
                          <img src={object.photo_url} alt={object.name} className={styles.photo} />
                        </div>
                      ) : (
                        <div className={styles.noPhoto}>
                          <IconPackage size={32} color="var(--mantine-color-gray-4)" />
                        </div>
                      )}

                      {/* Информация об объекте */}
                      <div className={styles.objectInfo}>
                        <Text fw={500} size="sm" className={styles.objectName}>
                          {object.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Размер: {object.size} {getObjectUnit(object.unit_id)}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Создан: {new Date(object.created_at).toLocaleDateString('ru-RU')}
                        </Text>
                      </div>

                      {/* Действия */}
                      <Group gap="xs" justify="space-between">
                        <Button
                          variant="light"
                          size="xs"
                          onClick={() => handleViewObject(object.id)}
                        >
                          Просмотр
                        </Button>

                        <Group gap="xs">
                          <Button
                            variant="subtle"
                            size="xs"
                            onClick={() => handleEditObject(object.id)}
                            leftSection={<IconEdit size={14} />}
                          >
                            Изменить
                          </Button>

                          <Button
                            variant="subtle"
                            size="xs"
                            onClick={() => handleMoveObject(object.id)}
                            leftSection={<IconArrowBarDown size={14} />}
                          >
                            Переместить
                          </Button>

                          <Button
                            variant="subtle"
                            size="xs"
                            color="red"
                            onClick={() => handleDeleteObject(object.id)}
                            leftSection={<IconTrash size={14} />}
                          >
                            Удалить
                          </Button>
                        </Group>
                      </Group>
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          )}
        </div>
      </Container>
    </div>
  );
});
