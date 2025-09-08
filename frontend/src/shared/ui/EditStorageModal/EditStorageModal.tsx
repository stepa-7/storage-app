import { Text, Stack, Button, Box, Select, TextInput, NumberInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconEdit } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';

import { useStorageStore, useUnitStore } from '@app/store/StoreContext';
import { type UpdateStorageSchema } from '@shared/schemas/storage';
import { type StorageWithDetails, type UpdateStorageRequest } from '@shared/types';

import { BaseModal } from '../BaseModal';

import styles from './EditStorageModal.module.scss';

interface EditStorageModalProps {
  opened: boolean;
  onClose: () => void;
  storage: StorageWithDetails | null;
  onSuccess?: (updatedStorage: StorageWithDetails) => void;
}

interface ParentStorageOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export const EditStorageModal: React.FC<EditStorageModalProps> = observer(
  ({ opened, onClose, storage, onSuccess }) => {
    const storageStore = useStorageStore();
    const unitStore = useUnitStore();

    const [parentOptions, setParentOptions] = useState<ParentStorageOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<UpdateStorageSchema>({
      initialValues: {
        name: '',
        maxCapacity: undefined,
        parentId: null,
      },
      validate: {
        name: (value) => {
          if (!value || value.trim().length === 0) return 'Название обязательно';
          if (value.length > 50) return `Название не должно превышать 50 символов`;
          if (!/^[a-zA-Z0-9\sа-яА-ЯёЁ]+$/.test(value))
            return 'Название может содержать только буквы, цифры и пробелы';
          return null;
        },
        maxCapacity: (value) => {
          if (!value || value <= 0) return 'Вместимость должна быть больше 0';
          if (value > 999999) return 'Вместимость не должна превышать 999999';
          return null;
        },
        parentId: (value) => {
          if (
            value &&
            value.trim() &&
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
          ) {
            return 'Неверный формат ID родительского хранилища';
          }
          return null;
        },
      },
    });

    // Загружаем список всех хранилищ для выбора родителя
    useEffect(() => {
      if (opened) {
        storageStore.loadAllStorages();
        unitStore.loadUnits();
      }
    }, [opened, storageStore, unitStore]);

    // Заполняем опции родительских хранилищ
    useEffect(() => {
      if (storageStore.storages.length > 0 && storage) {
        const options: ParentStorageOption[] = [
          { value: '', label: 'Нет родителя' },
          ...storageStore.storages
            .filter((s) => s.id !== storage.id) // Исключаем текущее хранилище
            .map((s) => ({
              value: s.id,
              label: s.name,
              disabled: wouldCreateCycle(s.id, storage.id), // Предотвращаем циклы
            })),
        ];
        setParentOptions(options);
      }
    }, [storageStore.storages, storage]);

    // Проверяем, создаст ли выбор родителя цикл
    const wouldCreateCycle = (parentId: string, currentId: string): boolean => {
      let currentParentId = parentId;
      const visited = new Set<string>();

      while (currentParentId) {
        if (visited.has(currentParentId)) {
          return true; // Найден цикл
        }
        visited.add(currentParentId);

        if (currentParentId === currentId) {
          return true; // Цикл с текущим хранилищем
        }

        const parent = storageStore.storages.find((s) => s.id === currentParentId);
        currentParentId = parent?.parentId || '';
      }

      return false;
    };

    // Заполняем форму данными хранилища при открытии
    useEffect(() => {
      if (storage && opened) {
        form.setValues({
          name: storage.name,
          maxCapacity: storage.capacity,
          parentId: storage.parentId || null,
        });
      }
    }, [storage, opened]);

    const onSubmit = async (data: UpdateStorageSchema) => {
      if (!storage) return;

      setIsLoading(true);
      try {
        // Фильтруем только измененные поля
        const updateData = Object.fromEntries(
          Object.entries(data).filter(([, value]) => value !== undefined && value !== null),
        );

        const result = await storageStore.updateStorage(storage.id, {
          ...updateData,
          parentId: updateData.parentId === null ? undefined : updateData.parentId,
        } as UpdateStorageRequest);

        if (result) {
          // Преобразуем результат в StorageWithDetails для совместимости
          const updatedStorageWithDetails: StorageWithDetails = {
            ...result,
            maxCapacity: result.capacity,
            currentCapacity: result.fullness,
            children: storage.children || [],
            objects: storage.objects || [],
          };

          onSuccess?.(updatedStorageWithDetails);
          onClose();
        }
      } catch (error) {
        console.error('Ошибка обновления хранилища:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleClose = () => {
      form.reset();
      onClose();
    };

    if (!storage) return null;

    const modalTitle = (
      <Text size="lg" fw={600} id="edit-modal-title">
        Редактирование хранилища
      </Text>
    );

    const modalContent = (
      <Box p="xl">
        <form onSubmit={form.onSubmit(onSubmit)}>
          <Stack gap="md" mb="lg">
            <TextInput
              label="Название хранилища"
              placeholder="Введите название"
              {...form.getInputProps('name')}
              disabled={isLoading}
              size="md"
              withAsterisk
              labelProps={{ mb: 6 }}
            />

            <NumberInput
              label="Вместимость"
              placeholder="Введите вместимость"
              {...form.getInputProps('maxCapacity')}
              disabled={isLoading}
              size="md"
              withAsterisk
              min={1}
              max={999999}
              step={1}
              allowNegative={false}
              thousandSeparator=" "
              labelProps={{ mb: 6 }}
            />

            <Select
              label="Родительское хранилище"
              data={parentOptions}
              {...form.getInputProps('parentId')}
              placeholder="Выберите родительское хранилище"
              searchable
              clearable
              disabled={storageStore.isLoading || isLoading}
              size="md"
              labelProps={{ mb: 6 }}
            />
          </Stack>

          {/* Actions */}
          <div className={styles.actions}>
            <Button variant="subtle" onClick={handleClose} size="md" disabled={isLoading}>
              Отмена
            </Button>
            <Button
              variant="filled"
              type="submit"
              size="md"
              loading={isLoading}
              leftSection={<IconEdit size={16} />}
              disabled={storageStore.isLoading}
            >
              Сохранить
            </Button>
          </div>
        </form>
      </Box>
    );

    return (
      <BaseModal
        opened={opened}
        onClose={handleClose}
        title={modalTitle}
        size="md"
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        {modalContent}
      </BaseModal>
    );
  },
);

EditStorageModal.displayName = 'EditStorageModal';
