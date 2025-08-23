import {
  Container,
  Title,
  Card,
  Text,
  Button,
  Stack,
  Group,
  Grid,
  TextInput,
  NumberInput,
  Select,
  FileInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconUpload, IconArrowLeft, IconArrowRight, IconCheck } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';

import { useObjectStore, useTemplateStore } from '@app/store/StoreContext';
import { ROUTES } from '@shared/constants';
import { baseObjectSchema, buildAttributesSchemaFromTemplate } from '@shared/schemas';
import {
  type CreateObjectRequest,
  type ObjectTemplate,
  type TemplateAttribute,
} from '@shared/types';

import styles from './ObjectNewPage.module.scss';

type FormData = z.infer<typeof baseObjectSchema> & {
  attributes: Record<string, string | number | boolean>;
};

export const ObjectNewPage: React.FC = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createObject, isLoading } = useObjectStore();
  const { loadActiveTemplates, activeTemplates } = useTemplateStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<ObjectTemplate | null>(null);
  const [units] = useState([
    { id: '1', name: 'Количество', symbol: 'шт' },
    { id: '2', name: 'Килограммы', symbol: 'кг' },
  ]);

  // Получаем storageId из state навигации
  const storageId = location.state?.storageId;

  // Создаем динамическую схему на основе выбранного шаблона
  const createValidationSchema = (template: ObjectTemplate | null) => {
    if (!template) {
      return baseObjectSchema.extend({
        attributes: z.record(z.string(), z.unknown()).optional().default({}),
      });
    }

    const attributesSchema = buildAttributesSchemaFromTemplate(template.schema);
    return baseObjectSchema.extend({
      attributes: attributesSchema,
    });
  };

  const form = useForm<FormData>({
    initialValues: {
      template_id: '',
      name: '',
      size: 1,
      unit_id: '1',
      attributes: {},
      photo: undefined,
    },
    validate: (values) => {
      const schema = createValidationSchema(selectedTemplate);
      const result = schema.safeParse(values);

      if (result.success) {
        return {};
      }

      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (!errors[path]) {
          errors[path] = issue.message;
        }
      });

      return errors;
    },
  });

  // Используем useRef для стабильной ссылки на form
  const formRef = useRef(form);
  formRef.current = form;

  useEffect(() => {
    loadActiveTemplates();
  }, [loadActiveTemplates]);

  // Отладочная информация при изменении activeTemplates
  useEffect(() => {
    // Активные шаблоны загружены
  }, [activeTemplates]);

  // Обновляем атрибуты при выборе шаблона
  useEffect(() => {
    if (selectedTemplate) {
      const initialAttributes: Record<string, string | number | boolean> = {};
      Object.entries(selectedTemplate.schema).forEach(([key, attr]) => {
        if (attr.type === 'NUMBER') {
          initialAttributes[key] = 0;
        } else if (attr.type === 'BOOLEAN') {
          initialAttributes[key] = false;
        } else {
          initialAttributes[key] = '';
        }
      });
      formRef.current.setFieldValue('attributes', initialAttributes);
    }
  }, [selectedTemplate]); // Убираю form из зависимостей

  const handleTemplateSelect = (templateId: string) => {
    const template = activeTemplates.find((t) => t.id === templateId);

    if (!template) {
      notifications.show({
        title: 'Ошибка',
        message: 'Шаблон не найден',
        color: 'red',
      });
      return;
    }

    setSelectedTemplate(template);
    form.setFieldValue('template_id', templateId);

    // Отладочная информация
    // Шаблон выбран
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Проверяем, что шаблон выбран
      if (!form.values.template_id) {
        notifications.show({
          title: 'Ошибка',
          message: 'Выберите шаблон для продолжения',
          color: 'red',
        });
        return;
      }

      // Проверяем, что selectedTemplate установлен
      if (!selectedTemplate) {
        notifications.show({
          title: 'Ошибка',
          message: 'Шаблон не найден',
          color: 'red',
        });
        return;
      }

      // Переходим на второй шаг
      setCurrentStep(2);

      // Отладочная информация
      // Переход на шаг 2
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async (values: FormData) => {
    if (!storageId) {
      notifications.show({
        title: 'Ошибка',
        message: 'Не указано хранилище',
        color: 'red',
      });
      return;
    }

    // Дополнительная валидация с Zod
    const schema = createValidationSchema(selectedTemplate);
    const validationResult = schema.safeParse(values);

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (!errors[path]) {
          errors[path] = issue.message;
        }
      });

      Object.entries(errors).forEach(([field, message]) => {
        form.setFieldError(field, message);
      });

      notifications.show({
        title: 'Ошибка валидации',
        message: 'Проверьте правильность заполнения полей',
        color: 'red',
      });
      return;
    }

    try {
      const createData: CreateObjectRequest = {
        template_id: values.template_id,
        storage_id: storageId,
        name: values.name,
        size: values.size,
        unit_id: values.unit_id,
        attributes: values.attributes,
        photo: values.photo || undefined,
      };

      const newObject = await createObject(createData);
      if (newObject) {
        notifications.show({
          title: 'Успех',
          message: 'Объект успешно создан',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
        navigate(ROUTES.STORAGE_VIEW.replace(':id', storageId));
      }
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось создать объект',
        color: 'red',
      });
    }
  };

  // Проверяем валидность формы для создания объекта
  const isObjectFormValid = (() => {
    if (!selectedTemplate) return false;

    // Проверяем основные поля
    const basicFieldsValid =
      form.values.name.trim().length > 0 &&
      form.values.size > 0 &&
      form.values.unit_id &&
      form.values.template_id;

    if (!basicFieldsValid) return false;

    // Проверяем обязательные атрибуты шаблона
    for (const [key, attribute] of Object.entries(selectedTemplate.schema)) {
      if (attribute.required) {
        const value = form.values.attributes[key];
        if (value === undefined || value === null || value === '') {
          return false;
        }
      }
    }

    return Object.keys(form.errors).length === 0;
  })();

  const renderAttributeField = (key: string, attribute: TemplateAttribute) => {
    const fieldName = `attributes.${key}`;

    switch (attribute.type) {
      case 'TEXT':
        return (
          <TextInput
            key={key}
            label={attribute.name}
            placeholder={`Введите ${attribute.name.toLowerCase()}`}
            required={attribute.required}
            {...form.getInputProps(fieldName)}
            labelProps={{ mb: 6 }}
          />
        );

      case 'NUMBER':
        return (
          <NumberInput
            key={key}
            label={attribute.name}
            placeholder={`Введите ${attribute.name.toLowerCase()}`}
            required={attribute.required}
            min={0}
            {...form.getInputProps(fieldName)}
            labelProps={{ mb: 6 }}
          />
        );

      case 'DATE':
        return (
          <TextInput
            key={key}
            label={attribute.name}
            type="date"
            required={attribute.required}
            {...form.getInputProps(fieldName)}
            labelProps={{ mb: 6 }}
          />
        );

      case 'BOOLEAN':
        return (
          <Select
            key={key}
            label={attribute.name}
            data={[
              { value: 'true', label: 'Да' },
              { value: 'false', label: 'Нет' },
            ]}
            required={attribute.required}
            onChange={(value) => form.setFieldValue(fieldName, value === 'true')}
            labelProps={{ mb: 6 }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.page}>
      <Container size="lg" className={styles.container}>
        <div className={styles.header}>
          <Title order={1} className={styles.title}>
            Создание нового объекта
          </Title>
          <Text size="lg" c="dimmed">
            {storageId ? `Хранилище: ${storageId}` : 'Хранилище не указано'}
          </Text>
        </div>

        {/* Шаги */}
        <div className={styles.steps}>
          <div className={`${styles.step} ${currentStep >= 1 ? styles.active : ''}`}>
            <div className={styles.stepNumber}>1</div>
            <Text size="sm">Выбор шаблона</Text>
          </div>
          <div className={`${styles.step} ${currentStep >= 2 ? styles.active : ''}`}>
            <div className={styles.stepNumber}>2</div>
            <Text size="sm">Заполнение данных</Text>
          </div>
        </div>

        {/* Шаг 1: Выбор шаблона */}
        {currentStep === 1 && (
          <Card shadow="sm" padding="xl" radius="md" className={styles.stepCard}>
            <Stack gap="lg">
              <Title order={2}>Выберите шаблон объекта</Title>

              <Grid gutter="md">
                {activeTemplates.map((template) => (
                  <Grid.Col key={template.id} span={{ base: 12, sm: 6, md: 4 }}>
                    <Card
                      shadow="sm"
                      padding="md"
                      radius="md"
                      className={`${styles.templateCard} ${
                        form.values.template_id === template.id ? styles.selected : ''
                      }`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <Stack gap="xs">
                        <Text fw={500} size="lg">
                          {template.name}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {template.description}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Атрибутов: {Object.keys(template.schema).length}
                        </Text>
                      </Stack>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>

              <Group justify="flex-end">
                <Button
                  variant="filled"
                  size="md"
                  onClick={handleNextStep}
                  disabled={!form.values.template_id}
                  rightSection={<IconArrowRight size={16} />}
                >
                  Далее
                </Button>
              </Group>
            </Stack>
          </Card>
        )}

        {/* Шаг 2: Заполнение данных */}
        {currentStep === 2 && selectedTemplate && (
          <Card shadow="sm" padding="xl" radius="md" className={styles.stepCard}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="lg">
                <Title order={2}>Заполните данные объекта</Title>

                {/* Основные поля */}
                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="Название объекта"
                      placeholder="Введите название"
                      required
                      {...form.getInputProps('name')}
                      labelProps={{ mb: 6 }}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 3 }}>
                    <NumberInput
                      label="Размер"
                      placeholder="Количество"
                      required
                      min={1}
                      {...form.getInputProps('size')}
                      labelProps={{ mb: 6 }}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 3 }}>
                    <Select
                      label="Единица измерения"
                      data={units.map((u) => ({ value: u.id, label: u.symbol }))}
                      required
                      {...form.getInputProps('unit_id')}
                      labelProps={{ mb: 6 }}
                    />
                  </Grid.Col>
                </Grid>

                {/* Фото объекта */}
                <div>
                  <Text size="sm" fw={500} mb="xs">
                    Фото объекта
                  </Text>
                  <FileInput
                    placeholder="Выберите файл"
                    accept="image/*,.pdf,.txt"
                    leftSection={<IconUpload size={16} />}
                    {...form.getInputProps('photo')}
                  />
                  <Text size="xs" c="dimmed" mt="xs">
                    Поддерживаемые форматы: PNG, PDF, TXT. Максимальный размер: 5MB
                  </Text>
                </div>

                {/* Атрибуты шаблона */}
                {Object.keys(selectedTemplate.schema).length > 0 && (
                  <div>
                    <Title order={3} mb="md">
                      Атрибуты шаблона &quot;{selectedTemplate.name}&quot;
                    </Title>
                    <Grid gutter="md">
                      {Object.entries(selectedTemplate.schema).map(([key, attribute]) => (
                        <Grid.Col key={key} span={{ base: 12, sm: 6 }}>
                          {renderAttributeField(key, attribute)}
                        </Grid.Col>
                      ))}
                    </Grid>
                  </div>
                )}

                {/* Кнопки навигации */}
                <Group justify="space-between">
                  <Button
                    variant="subtle"
                    size="md"
                    onClick={handlePrevStep}
                    leftSection={<IconArrowLeft size={16} />}
                  >
                    Назад
                  </Button>

                  <Group>
                    <Button
                      variant="subtle"
                      size="md"
                      onClick={() => navigate(ROUTES.STORAGE_VIEW.replace(':id', storageId || ''))}
                    >
                      Отмена
                    </Button>
                    <Button
                      type="submit"
                      variant="filled"
                      size="md"
                      loading={isLoading}
                      disabled={!isObjectFormValid || isLoading}
                      rightSection={<IconCheck size={16} />}
                    >
                      Создать объект
                    </Button>
                  </Group>
                </Group>
              </Stack>
            </form>
          </Card>
        )}
      </Container>
    </div>
  );
});
