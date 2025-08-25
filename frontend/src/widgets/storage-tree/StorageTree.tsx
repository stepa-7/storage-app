import { Card, Text, Group, ActionIcon, Progress } from '@mantine/core';
import {
  IconPlus,
  IconTrash,
  IconBox,
  IconChevronDown,
  IconChevronRight,
} from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useStorageStore, useUnitStore } from '@app/store/StoreContext';
import { ROUTES } from '@shared/constants';
import { type StorageWithDetails } from '@shared/types';
import { EmptyState } from '@shared/ui';

import styles from './StorageTree.module.scss';

interface StorageTreeProps {
  onAddStorage: (parentId?: string) => void;
  onDeleteStorage: (storage: StorageWithDetails) => void;
}

interface StorageNodeProps {
  storage: StorageWithDetails;
  level: number;
  onAddStorage: (parentId?: string) => void;
  onDeleteStorage: (storage: StorageWithDetails) => void;
}

const StorageNode: React.FC<StorageNodeProps> = observer(
  ({ storage, level, onAddStorage, onDeleteStorage }) => {
    const [isExpanded, setIsExpanded] = useState(level === 0);
    const navigate = useNavigate();
    const { units } = useUnitStore();

    const currentCapacity = storage.currentCapacity ?? storage.fullness ?? 0;
    const maxCapacity = storage.maxCapacity ?? storage.capacity ?? 1;
    const fillPercentage = Math.round((currentCapacity / maxCapacity) * 100);
    const canDelete = currentCapacity === 0;

    // Функция для получения единицы измерения хранилища
    const getStorageUnit = (unitId: string) => {
      const unit = units.find((u) => u.id === unitId);
      return unit?.symbol || 'кг';
    };

    const handleToggleExpand = () => {
      setIsExpanded(!isExpanded);
    };

    const handleAddChild = () => {
      onAddStorage(storage.id);
    };

    const handleDelete = () => {
      onDeleteStorage(storage);
    };

    const handleView = () => {
      // Переходим на страницу просмотра хранилища
      navigate(ROUTES.STORAGE_VIEW.replace(':id', storage.id));
    };

    return (
      <div className={styles.storageNode} style={{ marginLeft: `${level * 20}px` }}>
        <Card
          shadow="sm"
          padding="sm"
          radius="md"
          className={styles.storageCard}
          onClick={handleView}
        >
          <Group justify="space-between" align="center">
            <Group gap="xs" align="center">
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleExpand();
                }}
                className={styles.expandButton}
              >
                {storage.children && storage.children.length > 0 ? (
                  isExpanded ? (
                    <IconChevronDown size={18} />
                  ) : (
                    <IconChevronRight size={18} />
                  )
                ) : (
                  <></>
                )}
              </ActionIcon>

              <div>
                <Text size="sm" fw={500} className={styles.storageName}>
                  {storage.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {currentCapacity}/{maxCapacity} {getStorageUnit(storage.unit)}
                </Text>
              </div>
            </Group>

            <Group gap="xs">
              <Progress
                value={fillPercentage}
                size="sm"
                w={60}
                color={fillPercentage > 80 ? 'red' : fillPercentage > 60 ? 'yellow' : 'green'}
              />
              <Text size="xs" c="dimmed" w={30}>
                {fillPercentage}%
              </Text>

              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddChild();
                }}
                title="Добавить хранилище"
              >
                <IconPlus size={16} />
              </ActionIcon>

              {canDelete && (
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  title="Удалить хранилище"
                >
                  <IconTrash size={16} />
                </ActionIcon>
              )}
            </Group>
          </Group>
        </Card>

        {isExpanded && storage.children && storage.children.length > 0 && (
          <div className={styles.children}>
            {storage.children.map((child) => (
              <StorageNode
                key={child.id}
                storage={child}
                level={level + 1}
                onAddStorage={onAddStorage}
                onDeleteStorage={onDeleteStorage}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);

export const StorageTree: React.FC<StorageTreeProps> = observer(
  ({ onAddStorage, onDeleteStorage }) => {
    const { storages, isLoading, loadAllStorages } = useStorageStore();

    React.useEffect(() => {
      loadAllStorages();
    }, [loadAllStorages]);

    const buildTree = (parentId: string | null): StorageWithDetails[] => {
      const filtered = storages.filter((s) => s.parentId === parentId);

      return filtered.map((storage) => ({
        ...storage,
        children: buildTree(storage.id),
      }));
    };

    // Важно: не кешируем через useMemo, чтобы MobX-изменения массива (push/splice) отражались сразу
    const storageTree = buildTree(null);

    if (isLoading) {
      return (
        <div className={styles.loading}>
          <Text>Загрузка хранилищ...</Text>
        </div>
      );
    }

    if (storageTree.length === 0) {
      return (
        <EmptyState
          title="Хранилища не найдены"
          description="Похоже, у вас еще нет хранилищ. Нажмите кнопку ниже, чтобы создать новое."
          icon={<IconBox />}
          actionLabel="Создать хранилище"
          onAction={() => onAddStorage()}
        />
      );
    }

    return (
      <div className={styles.container}>
        <div className={styles.tree}>
          {storageTree.map((storage) => (
            <StorageNode
              key={storage.id}
              storage={storage}
              level={0}
              onAddStorage={onAddStorage}
              onDeleteStorage={onDeleteStorage}
            />
          ))}
        </div>
      </div>
    );
  },
);
