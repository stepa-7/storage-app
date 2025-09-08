import {
  TextInput,
  NumberInput,
  Select,
  Stack,
  FileInput,
  Switch,
  Text,
  Alert,
  Divider,
  Box,
  Button,
  Modal,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPhoto, IconEdit } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';

import { useStorageStore, useTemplateStore } from '@app/store/StoreContext';
import { objectsApi } from '@shared/api';
import { useZodForm } from '@shared/lib';
import { updateObjectSchema, type UpdateObjectSchema } from '@shared/schemas';
import { type StorageObject, type ObjectTemplate, type UpdateObjectRequest } from '@shared/types';

import styles from './EditObjectModal.module.scss';

interface EditObjectModalProps {
  object: StorageObject | null;
  opened: boolean;
  onClose: () => void;
  onSuccess?: (updatedObject: StorageObject) => void;
}

export const EditObjectModal: React.FC<EditObjectModalProps> = observer(
  ({ object, opened, onClose, onSuccess }) => {
    const { storages } = useStorageStore();
    const { templates } = useTemplateStore();

    const [isLoading, setIsLoading] = useState(false);
    const [currentPhoto, setCurrentPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const form = useZodForm(updateObjectSchema, {
      name: '',
      storage_id: '',
      size: 0,
      attributes: {},
      photo: null,
    });

    // Заполняем форму при открытии модального окна
    useEffect(() => {
      if (object && opened) {
        form.setValues({
          name: object.name,
          storage_id: object.storage_id,
          size: object.size,
          attributes: object.attributes,
          photo: null,
        });

        // Сбрасываем фото
        setCurrentPhoto(null);
        setPhotoPreview(null);
      }
    }, [object, opened]);

    const handlePhotoChange = (file: File | null) => {
      if (file) {
        setCurrentPhoto(file);
        const url = URL.createObjectURL(file);
        setPhotoPreview(url);
      } else {
        setCurrentPhoto(null);
        setPhotoPreview(null);
      }
      form.setFieldValue('photo', file);
    };

    const handleSubmit = async (values: UpdateObjectSchema) => {
      if (!object) return;

      setIsLoading(true);
      try {
        const updateData: UpdateObjectRequest = {
          name: values.name,
          storage_id: values.storage_id,
          size: values.size,
          attributes: values.attributes,
          photo: values.photo || undefined,
        };

        const updatedObject = await objectsApi.updateObject(object.id, updateData);

        notifications.show({
          title: 'Успех',
          message: 'Объект успешно обновлен',
          color: 'green',
        });

        onSuccess?.(updatedObject);
        onClose();
      } catch (error) {
        console.error('Ошибка при обновлении объекта:', error);
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось обновить объект',
          color: 'red',
        });
      } finally {
        setIsLoading(false);
      }
    };

    const getTemplateById = (id: string): ObjectTemplate | undefined => {
      return templates.find((t) => t.id === id);
    };

    const template = object ? getTemplateById(object.template_id) : null;

    if (!object) return null;

    const modalTitle = (
      <Text size="lg" fw={600}>
        Редактировать объект
      </Text>
    );

    const modalContent = (
      <Box p="xl">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {/* Основная информация */}
            <Text size="sm" fw={500} c="dimmed">
              Основная информация
            </Text>

            <TextInput
              label="Название"
              placeholder="Введите название объекта"
              {...form.getInputProps('name')}
              disabled={isLoading}
              size="md"
              withAsterisk
              labelProps={{ mb: 6 }}
              required
            />

            <NumberInput
              label="Размер"
              placeholder="Введите размер"
              min={0}
              step={1}
              {...form.getInputProps('size')}
              disabled={isLoading}
              size="md"
              withAsterisk
              labelProps={{ mb: 6 }}
              required
            />

            <Select
              label="Хранилище"
              placeholder="Выберите хранилище"
              data={storages.map((s) => ({ value: s.id, label: s.name }))}
              {...form.getInputProps('storage_id')}
              disabled={isLoading}
              size="md"
              withAsterisk
              labelProps={{ mb: 6 }}
              required
            />

            {/* Атрибуты шаблона */}
            {template && Object.keys(template.schema).length > 0 && (
              <>
                <Divider />
                <Text size="sm" fw={500} c="dimmed">
                  Атрибуты шаблона &ldquo;{template.name}&rdquo;
                </Text>

                {Object.entries(template.schema).map(([key, attr]) => (
                  <div key={key}>
                    {attr.type === 'TEXT' && (
                      <TextInput
                        label={attr.name}
                        placeholder={`Введите ${attr.name.toLowerCase()}`}
                        {...form.getInputProps(`attributes.${key}`)}
                        disabled={isLoading}
                        size="md"
                        labelProps={{ mb: 6 }}
                        required={attr.required}
                      />
                    )}

                    {attr.type === 'NUMBER' && (
                      <NumberInput
                        label={attr.name}
                        placeholder={`Введите ${attr.name.toLowerCase()}`}
                        {...form.getInputProps(`attributes.${key}`)}
                        disabled={isLoading}
                        size="md"
                        labelProps={{ mb: 6 }}
                        required={attr.required}
                      />
                    )}

                    {attr.type === 'BOOLEAN' && (
                      <Switch
                        label={attr.name}
                        {...form.getInputProps(`attributes.${key}`, { type: 'checkbox' })}
                        disabled={isLoading}
                      />
                    )}

                    {attr.type === 'DATE' && (
                      <TextInput
                        label={attr.name}
                        type="date"
                        {...form.getInputProps(`attributes.${key}`)}
                        disabled={isLoading}
                        size="md"
                        labelProps={{ mb: 6 }}
                        required={attr.required}
                      />
                    )}

                    {attr.type === 'FILE' && (
                      <FileInput
                        label={attr.name}
                        placeholder="Выберите файл"
                        accept="image/*,.pdf,.txt"
                        {...form.getInputProps(`attributes.${key}`)}
                        disabled={isLoading}
                        size="md"
                        labelProps={{ mb: 6 }}
                        required={attr.required}
                      />
                    )}
                  </div>
                ))}
              </>
            )}

            {/* Фото объекта */}
            <Divider />
            <Text size="sm" fw={500} c="dimmed">
              Фото объекта
            </Text>

            {object.photo_url && (
              <Alert icon={<IconPhoto size={16} />} title="Текущее фото">
                <Text size="sm" mb="xs">
                  У объекта уже есть фото
                </Text>
                <img
                  src={object.photo_url}
                  alt="Фото объекта"
                  style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                />
              </Alert>
            )}

            <FileInput
              label="Новое фото"
              placeholder="Выберите файл"
              accept="image/*"
              value={currentPhoto}
              onChange={handlePhotoChange}
              disabled={isLoading}
              size="md"
              labelProps={{ mb: 6 }}
            />

            {photoPreview && (
              <div>
                <Text size="sm" mb="xs">
                  Предпросмотр:
                </Text>
                <img
                  src={photoPreview}
                  alt="Предпросмотр"
                  style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                />
              </div>
            )}

            {/* Actions */}
            <div className={styles.actions}>
              <Button variant="subtle" onClick={onClose} size="md">
                Отмена
              </Button>
              <Button
                variant="filled"
                type="submit"
                size="md"
                loading={isLoading}
                leftSection={<IconEdit size={16} />}
              >
                Сохранить
              </Button>
            </div>
          </Stack>
        </form>
      </Box>
    );

    return (
      <Modal
        opened={opened}
        onClose={onClose}
        title={modalTitle}
        size="lg"
        closeOnClickOutside={false}
        closeOnEscape={false}
        centered
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        radius="md"
        shadow="lg"
        styles={{
          header: {
            padding: 'var(--mantine-spacing-md) var(--mantine-spacing-xl)',
            borderBottom: '1px solid var(--mantine-color-default-border)',
          },
        }}
      >
        {modalContent}
      </Modal>
    );
  },
);
