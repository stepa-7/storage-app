import {
  Modal,
  Stack,
  Group,
  NumberInput,
  Button,
  TextInput,
  Select,
  Text,
  Alert,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';

import { useStorageStore } from '@app/store/StoreContext';
import { unitsApi } from '@shared/api';
import { useZodForm } from '@shared/lib';
import { createStorageSchema, type CreateStorageSchema } from '@shared/schemas';
import { type Storage, type Unit } from '@shared/types';

interface CreateStorageModalProps {
  opened: boolean;
  onClose: () => void;
  parentStorage?: Storage | null;
  onSuccess?: (storage: Storage) => void;
}

export const CreateStorageModal: React.FC<CreateStorageModalProps> = observer(
  ({ opened, onClose, parentStorage, onSuccess }) => {
    const { createStorage, isLoading, error } = useStorageStore();
    const [units, setUnits] = React.useState<Unit[]>([]);
    const [unitsLoading, setUnitsLoading] = React.useState(false);

    const isUuid = (value: string): boolean =>
      /^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/.test(value);

    const form = useZodForm(createStorageSchema, {
      name: '',
      maxCapacity: 1,
      unit: '', // Будет установлено после загрузки единиц измерения
      parentId: undefined,
    });

    // Загружаем единицы измерения при монтировании компонента
    useEffect(() => {
      const loadUnits = async () => {
        setUnitsLoading(true);
        try {
          const unitsData = await unitsApi.getUnits();
          setUnits(unitsData);
          // Устанавливаем первую единицу как значение по умолчанию
          if (unitsData.length > 0) {
            form.setFieldValue('unit', unitsData[0].id);
          }
        } catch (error) {
          console.error('Ошибка загрузки единиц измерения:', error);
          // Fallback на базовые единицы измерения
          const fallbackUnits = [
            { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Количество', symbol: 'шт' },
            { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Килограммы', symbol: 'кг' },
          ];
          setUnits(fallbackUnits);
          form.setFieldValue('unit', fallbackUnits[0].id);
        } finally {
          setUnitsLoading(false);
        }
      };

      loadUnits();
    }, []); // Загружаем только один раз при монтировании

    // Устанавливаем parentId при открытии модалки
    useEffect(() => {
      if (opened && parentStorage?.id && isUuid(parentStorage.id)) {
        form.setFieldValue('parentId', parentStorage.id);
      }
    }, [opened, parentStorage?.id]); // form стабилен, не добавляем в зависимости

    const handleSubmit = async (values: CreateStorageSchema) => {
      // Проверяем название на допустимые символы
      if (!/^[a-zA-Z0-9\sа-яА-ЯёЁ]+$/.test(values.name)) {
        form.setFieldError('name', 'Разрешены только буквы, цифры, пробелы и кириллица');
        return;
      }

      const newStorage = await createStorage(values);
      if (newStorage) {
        // Очищаем форму при успешном создании
        form.setValues({
          name: '',
          maxCapacity: 1,
          unit: '',
          parentId: undefined,
        });
        onSuccess?.(newStorage);
        onClose();
      }
    };

    const handleClose = () => {
      if (!isLoading) {
        // Очищаем форму при закрытии
        form.setValues({
          name: '',
          maxCapacity: 1,
          unit: '',
          parentId: undefined,
        });
        onClose();
      }
    };

    // Опции для селекта из загруженных единиц измерения
    const unitOptions = units.map((unit) => ({
      value: unit.id,
      label: unit.name,
    }));

    // Проверяем заполненность обязательных полей
    const isFormValid =
      form.values.name.trim().length > 0 && form.values.maxCapacity > 0 && form.values.unit;

    return (
      <Modal
        opened={opened}
        onClose={handleClose}
        title={
          <Text size="lg" fw={600}>
            {`Создать хранилище${parentStorage ? ` в "${parentStorage.name}"` : ''}`}
          </Text>
        }
        size="lg"
        centered
        closeOnClickOutside={false}
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        radius="md"
        shadow="xl"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg">
            <Stack gap="md">
              <TextInput
                label="Название хранилища"
                {...form.getInputProps('name')}
                withAsterisk
                disabled={isLoading}
                placeholder="Только буквы, цифры, пробелы и кириллица"
                size="md"
                autoFocus
                labelProps={{ mb: 6 }}
                error={form.errors.name}
              />

              <Group grow>
                <NumberInput
                  label="Максимальная вместимость"
                  {...form.getInputProps('maxCapacity')}
                  withAsterisk
                  disabled={isLoading}
                  placeholder="Введите вместимость"
                  size="md"
                  min={1}
                  allowNegative={false}
                  thousandSeparator=" "
                  labelProps={{ mb: 6 }}
                  error={form.errors.maxCapacity}
                />

                <Select
                  label="Единица измерения"
                  {...form.getInputProps('unit')}
                  withAsterisk
                  data={unitOptions}
                  placeholder={'Выберите единицу'}
                  disabled={
                    isLoading ||
                    unitsLoading ||
                    !form.values.name.trim() ||
                    form.values.maxCapacity <= 0
                  }
                  size="md"
                  allowDeselect={false}
                  labelProps={{ mb: 6 }}
                  error={form.errors.unit}
                />
              </Group>

              {parentStorage && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title="Родительское хранилище"
                  color="gray"
                >
                  Хранилище будет создано внутри: <strong>{parentStorage.name}</strong>
                </Alert>
              )}

              {/* Отображение ошибок валидации */}
              {form.errors.parentId && (
                <Alert icon={<IconAlertCircle size={16} />} title="Ошибка валидации" color="red">
                  {form.errors.parentId}
                </Alert>
              )}
            </Stack>

            {error && (
              <Alert icon={<IconAlertCircle size={16} />} title="Ошибка" color="red">
                {error}
              </Alert>
            )}

            <Group justify="flex-end" gap="md" pt="md">
              <Button variant="subtle" onClick={handleClose} disabled={isLoading} size="md">
                Отмена
              </Button>
              <Button
                type="submit"
                loading={isLoading}
                variant="filled"
                size="md"
                disabled={!isFormValid || isLoading}
              >
                Создать хранилище
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    );
  },
);

CreateStorageModal.displayName = 'CreateStorageModal';
