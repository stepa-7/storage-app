import {
  Card,
  Text,
  Button,
  Stack,
  Group,
  Table,
  Badge,
  ActionIcon,
  TextInput,
  Textarea,
  Switch,
  Grid,
  Select,
  ScrollArea,
  Tooltip,
  Alert,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash, IconFileSad, IconAlertCircle } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState, useRef } from 'react';

import { useTemplateStore } from '@app/store/StoreContext';
import { useZodForm } from '@shared/lib';
import { createTemplateSchema, type CreateTemplateSchema } from '@shared/schemas';
import {
  type ObjectTemplate,
  type CreateTemplateRequest,
  type UpdateTemplateRequest,
  type TemplateAttribute,
} from '@shared/types';
import { PageLayout, EmptyState, DeleteConfirmationModal, BaseModal } from '@shared/ui';

import styles from './TemplatesPage.module.scss';

export const TemplatesPage: React.FC = observer(() => {
  const {
    loadTemplates,
    templates,
    createTemplate,
    updateTemplate,
    isLoading,
    deactivateTemplate,
  } = useTemplateStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ObjectTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<ObjectTemplate | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deleted'>('all');

  // Используем useRef для стабильной ссылки на form
  const formRef = useRef<ReturnType<typeof useZodForm<CreateTemplateSchema>> | null>(null);

  const form = useZodForm(createTemplateSchema, {
    name: '',
    description: '',
    schema: {},
  });

  // Обновляем formRef при каждом рендере
  formRef.current = form;

  useEffect(() => {
    loadTemplates(); // Загружаем все шаблоны, включая деактивированные
  }, [loadTemplates]);

  const handleCreateTemplate = () => {
    form.reset();
    setShowCreateModal(true);
  };

  const handleEditTemplate = (template: ObjectTemplate) => {
    setEditingTemplate(template);
    form.setValues({
      name: template.name,
      description: template.description,
      schema: JSON.parse(JSON.stringify(template.schema)), // Безопасная копия
    });
    setShowEditModal(true);
  };

  const handleDeleteTemplate = async (template: ObjectTemplate) => {
    setTemplateToDelete(template);
    setShowDeleteModal(true);
  };

  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      const success = await deactivateTemplate(templateToDelete.id);
      if (success) {
        notifications.show({
          title: 'Успех',
          message: 'Шаблон удален',
          color: 'red',
        });
        setShowDeleteModal(false);
        setTemplateToDelete(null);
      } else {
        throw new Error('Не удалось деактивировать шаблон');
      }
    } catch (error) {
      console.error('🔄 Ошибка при деактивации:', error);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось деактивировать шаблон',
        color: 'red',
      });
    }
  };

  const handleSubmitCreate = async (values: CreateTemplateSchema) => {
    try {
      const createData: CreateTemplateRequest = {
        name: values.name,
        description: values.description,
        schema: values.schema as Record<string, TemplateAttribute>,
      };

      const newTemplate = await createTemplate(createData);
      if (newTemplate) {
        notifications.show({
          title: 'Успех',
          message: 'Шаблон успешно создан',
          color: 'green',
        });
        setShowCreateModal(false);
        form.reset();
      }
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось создать шаблон',
        color: 'red',
      });
    }
  };

  const handleFormKeyDown: React.KeyboardEventHandler<HTMLFormElement> = (event) => {
    const isSubmitHotkey = (event.metaKey || event.ctrlKey) && event.key === 'Enter';
    if (isSubmitHotkey) {
      event.preventDefault();
      // Используем актуальную ссылку на form
      const submit = formRef.current?.onSubmit((vals) => {
        void handleSubmitCreate(vals);
      });
      if (submit) {
        submit(event as React.FormEvent<HTMLFormElement>);
      }
    }
  };

  const handleSubmitEdit = async (values: CreateTemplateSchema) => {
    if (!editingTemplate) return;

    try {
      const updateData: UpdateTemplateRequest = {
        name: values.name,
        description: values.description,
      };

      const updatedTemplate = await updateTemplate(editingTemplate.id, updateData);
      if (updatedTemplate) {
        notifications.show({
          title: 'Успех',
          message: 'Шаблон успешно обновлен',
          color: 'green',
        });
        setShowEditModal(false);
        setEditingTemplate(null);
        form.reset();
      }
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось обновить шаблон',
        color: 'red',
      });
    }
  };

  const addAttribute = () => {
    const newKey = `attr_${Object.keys(form.values.schema).length + 1}`;
    const newAttribute: TemplateAttribute = {
      name: 'Новый атрибут',
      type: 'TEXT',
      required: false,
    };

    form.setFieldValue(`schema.${newKey}`, newAttribute);
  };

  const removeAttribute = (key: string) => {
    const newAttributes = { ...form.values.schema };
    delete newAttributes[key];
    form.setFieldValue('schema', newAttributes);
  };

  const updateAttribute = (
    key: string,
    field: keyof TemplateAttribute,
    value: string | number | boolean,
  ) => {
    const attribute = form.values.schema[key];
    if (attribute) {
      form.setFieldValue(`schema.${key}`, {
        ...attribute,
        [field]: value,
      });
    }
  };

  const filteredTemplates = templates.filter((template) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return !template.deleted;
    if (statusFilter === 'deleted') return template.deleted;
    return true;
  });

  // Проверяем валидность формы для создания шаблона
  const isCreateFormValid =
    form.values.name.trim().length > 0 &&
    form.values.description.trim().length > 0 &&
    Object.keys(form.errors).length === 0;

  // Проверяем валидность формы для редактирования шаблона
  const isEditFormValid =
    form.values.name.trim().length > 0 &&
    form.values.description.trim().length > 0 &&
    Object.keys(form.errors).length === 0;

  return (
    <PageLayout
      title="Управление шаблонами"
      subtitle="Создавайте и редактируйте шаблоны для объектов хранения"
      action={{
        label: 'Шаблон',
        icon: <IconPlus size={16} />,
        onClick: handleCreateTemplate,
      }}
    >
      <div>
        {/* Фильтр по статусу */}
        <Group justify="space-between" mb="md">
          <Group>
            <Text size="sm" fw={500}>
              Фильтр по статусу:
            </Text>
            <Group gap="xs">
              <Button
                variant={statusFilter === 'all' ? 'filled' : 'light'}
                size="xs"
                onClick={() => setStatusFilter('all')}
              >
                Все ({templates.length})
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'filled' : 'light'}
                size="xs"
                onClick={() => setStatusFilter('active')}
              >
                Доступные ({templates.filter((t) => !t.deleted).length})
              </Button>
              <Button
                variant={statusFilter === 'deleted' ? 'filled' : 'light'}
                size="xs"
                onClick={() => setStatusFilter('deleted')}
              >
                Удалённые ({templates.filter((t) => t.deleted).length})
              </Button>
            </Group>
          </Group>
        </Group>

        {/* Таблица шаблонов */}
        <div className={styles.container}>
          <div className={styles.templates}>
            {isLoading ? (
              <div className={styles.loading}>
                <Text>Загрузка шаблонов...</Text>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <EmptyState
                icon={<IconFileSad />}
                title="Шаблоны не найдены"
                description="Создайте новый шаблон, чтобы начать работу с объектами хранения."
                actionLabel="Создать шаблон"
                onAction={handleCreateTemplate}
              />
            ) : (
              <Table className={styles.table}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ textAlign: 'left' }}>Название</Table.Th>
                    <Table.Th style={{ textAlign: 'left' }}>Описание</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Количество атрибутов</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Статус</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Действия</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredTemplates.map((template) => (
                    <Table.Tr key={template.id}>
                      <Table.Td style={{ verticalAlign: 'middle' }}>
                        <Text fw={500}>{template.name}</Text>
                      </Table.Td>
                      <Table.Td style={{ verticalAlign: 'middle' }}>
                        <Text size="sm" c="dimmed" lineClamp={2}>
                          {template.description}
                        </Text>
                      </Table.Td>
                      <Table.Td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                        <Badge variant="subtle">{Object.keys(template.schema).length}</Badge>
                      </Table.Td>
                      <Table.Td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                        <Badge variant="subtle" color={template.deleted ? 'red' : 'green'}>
                          {template.deleted ? 'Удалён' : 'Доступен'}
                        </Badge>
                      </Table.Td>
                      <Table.Td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                        <Group gap="xs" justify="center">
                          {!template.deleted && (
                            <>
                              <ActionIcon
                                variant="subtle"
                                onClick={() => handleEditTemplate(template)}
                                title="Редактировать шаблон"
                              >
                                <IconEdit size={16} />
                              </ActionIcon>
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                onClick={() => handleDeleteTemplate(template)}
                                title="Удалить шаблон"
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </>
                          )}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </div>

          {/* Модальное окно создания шаблона */}
          <BaseModal
            opened={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            title={
              <Text size="lg" fw={600}>
                Создать шаблон
              </Text>
            }
            size="lg"
            closeOnClickOutside={false}
            closeOnEscape={false}
            footer={
              <Group justify="flex-end" gap="md">
                <Button variant="subtle" onClick={() => setShowCreateModal(false)} size="md">
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="filled"
                  size="md"
                  disabled={!isCreateFormValid || isLoading}
                  onClick={() => form.onSubmit(handleSubmitCreate)()}
                >
                  Создать шаблон
                </Button>
              </Group>
            }
          >
            <form onSubmit={form.onSubmit(handleSubmitCreate)} onKeyDown={handleFormKeyDown}>
              <Stack gap="lg">
                <Stack gap="md">
                  <TextInput
                    label="Название шаблона"
                    placeholder="Введите название шаблона"
                    withAsterisk
                    autoFocus
                    size="md"
                    {...form.getInputProps('name')}
                    labelProps={{ mb: 6 }}
                  />

                  <Textarea
                    label="Описание шаблона"
                    placeholder="Кратко опишите назначение шаблона"
                    withAsterisk
                    minRows={3}
                    size="md"
                    {...form.getInputProps('description')}
                    labelProps={{ mb: 6 }}
                  />
                </Stack>

                {/* Атрибуты */}
                <Stack gap="md">
                  <Group justify="space-between" align="center">
                    <Text size="lg" fw={500}>
                      Атрибуты шаблона
                    </Text>
                    <Button
                      variant="subtle"
                      size="md"
                      onClick={addAttribute}
                      leftSection={<IconPlus size={16} />}
                    >
                      Добавить атрибут
                    </Button>
                  </Group>

                  {Object.keys(form.values.schema).length === 0 ? (
                    <Alert icon={<IconAlertCircle size={16} />} title="Нет атрибутов" color="gray">
                      Нет атрибутов для отображения
                    </Alert>
                  ) : (
                    <ScrollArea.Autosize mah={360} type="always">
                      <Stack gap="md">
                        {Object.entries(form.values.schema).map(([key, attribute]) => (
                          <Card key={key} padding="md" radius="md" withBorder>
                            <Grid gutter="md" align="center">
                              <Grid.Col span={6}>
                                <TextInput
                                  label="Название атрибута"
                                  value={(attribute as TemplateAttribute).name}
                                  onChange={(event) =>
                                    updateAttribute(key, 'name', event.currentTarget.value)
                                  }
                                  withAsterisk
                                  size="sm"
                                  labelProps={{ mb: 6 }}
                                />
                              </Grid.Col>
                              <Grid.Col span={4}>
                                <Select
                                  label="Тип данных"
                                  data={[
                                    { value: 'TEXT', label: 'Текст' },
                                    { value: 'NUMBER', label: 'Число' },
                                    { value: 'DATE', label: 'Дата' },
                                    { value: 'BOOLEAN', label: 'Да/Нет' },
                                  ]}
                                  value={(attribute as TemplateAttribute).type}
                                  onChange={(value) =>
                                    updateAttribute(key, 'type', value || 'TEXT')
                                  }
                                  withAsterisk
                                  size="sm"
                                  labelProps={{ mb: 6 }}
                                  allowDeselect={false}
                                />
                              </Grid.Col>
                              <Grid.Col span={2}>
                                <Tooltip label="Удалить атрибут" withArrow>
                                  <ActionIcon
                                    variant="subtle"
                                    color="red"
                                    onClick={() => removeAttribute(key)}
                                    aria-label="Удалить атрибут"
                                    size="lg"
                                  >
                                    <IconTrash size={16} />
                                  </ActionIcon>
                                </Tooltip>
                              </Grid.Col>
                              <Grid.Col span={12}>
                                <Switch
                                  label="Обязательное поле при создании объекта"
                                  aria-label="Обязательное поле при создании объекта"
                                  checked={(attribute as TemplateAttribute).required}
                                  onChange={(event) =>
                                    updateAttribute(key, 'required', event.currentTarget.checked)
                                  }
                                  size="sm"
                                />
                              </Grid.Col>
                            </Grid>
                          </Card>
                        ))}
                      </Stack>
                    </ScrollArea.Autosize>
                  )}
                </Stack>
              </Stack>
            </form>
          </BaseModal>

          {/* Модальное окно редактирования шаблона */}
          <BaseModal
            opened={showEditModal}
            onClose={() => setShowEditModal(false)}
            title={
              <Text size="lg" fw={600}>
                Редактировать шаблон
              </Text>
            }
            size="lg"
            closeOnClickOutside={false}
            closeOnEscape={false}
            footer={
              <Group justify="flex-end" gap="md">
                <Button variant="subtle" onClick={() => setShowEditModal(false)} size="md">
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="filled"
                  size="md"
                  disabled={!isEditFormValid || isLoading}
                  onClick={() => form.onSubmit(handleSubmitEdit)()}
                >
                  Сохранить изменения
                </Button>
              </Group>
            }
          >
            <form onSubmit={form.onSubmit(handleSubmitEdit)}>
              <Stack gap="lg">
                <Stack gap="md">
                  <TextInput
                    label="Название шаблона"
                    placeholder="Введите название шаблона"
                    withAsterisk
                    size="md"
                    {...form.getInputProps('name')}
                    labelProps={{ mb: 6 }}
                  />

                  <Textarea
                    label="Описание шаблона"
                    placeholder="Кратко опишите назначение шаблона"
                    withAsterisk
                    minRows={3}
                    size="md"
                    {...form.getInputProps('description')}
                    labelProps={{ mb: 6 }}
                  />
                </Stack>

                {/* Атрибуты */}
                <Stack gap="md">
                  <div>
                    <Group gap="xs" align="center">
                      <IconEdit size={18} />
                      <Text size="md" fw={600}>
                        Атрибуты шаблона
                      </Text>
                      <Badge variant="light" color="gray" size="sm">
                        {Object.keys(editingTemplate?.schema || {}).length} шт.
                      </Badge>
                    </Group>
                    <Text size="sm" c="dimmed">
                      Только для просмотра
                    </Text>
                  </div>

                  {Object.keys(editingTemplate?.schema || {}).length === 0 ? (
                    <Alert icon={<IconAlertCircle size={16} />} title="Нет атрибутов" color="gray">
                      Нет атрибутов для отображения
                    </Alert>
                  ) : (
                    <ScrollArea.Autosize mah={360} type="always">
                      <Stack gap="sm">
                        {Object.entries(editingTemplate?.schema || {}).map(
                          ([key, attribute], index) => (
                            <Card
                              key={key}
                              padding="md"
                              radius="md"
                              withBorder
                              className={styles.attributeCard}
                            >
                              <Badge variant="outline" color="gray" size="lg" mb="md">
                                Атрибут {index + 1}
                              </Badge>

                              <Grid gutter="md" align="center">
                                <Grid.Col span={6}>
                                  <Text size="sm" fw={500} c="dimmed" mb={4}>
                                    Название атрибута
                                  </Text>
                                  <Text size="sm">{(attribute as TemplateAttribute).name}</Text>
                                </Grid.Col>
                                <Grid.Col span={4}>
                                  <Text size="sm" fw={500} c="dimmed" mb={4}>
                                    Тип данных
                                  </Text>
                                  <Text size="sm">
                                    {(() => {
                                      switch ((attribute as TemplateAttribute).type) {
                                        case 'TEXT':
                                          return 'Текст';
                                        case 'NUMBER':
                                          return 'Число';
                                        case 'DATE':
                                          return 'Дата';
                                        case 'BOOLEAN':
                                          return 'Да/Нет';
                                        default:
                                          return (attribute as TemplateAttribute).type;
                                      }
                                    })()}
                                  </Text>
                                </Grid.Col>
                              </Grid>

                              <Group justify="left" mt="md">
                                <Badge
                                  variant="light"
                                  color={(attribute as TemplateAttribute).required ? 'red' : 'gray'}
                                  size="sm"
                                >
                                  {(attribute as TemplateAttribute).required
                                    ? 'Обязательный атрибут'
                                    : 'Опциональный атрибут'}
                                </Badge>
                              </Group>
                            </Card>
                          ),
                        )}
                      </Stack>
                    </ScrollArea.Autosize>
                  )}
                </Stack>
              </Stack>
            </form>
          </BaseModal>

          {/* Модальное окно подтверждения удаления */}
          <DeleteConfirmationModal
            opened={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={confirmDeleteTemplate}
            title="Удаление шаблона"
            itemName={templateToDelete?.name || ''}
            description="Это действие нельзя отменить. Шаблон будет помечен как удаленный."
            loading={isLoading}
          />
        </div>
      </div>
    </PageLayout>
  );
});
