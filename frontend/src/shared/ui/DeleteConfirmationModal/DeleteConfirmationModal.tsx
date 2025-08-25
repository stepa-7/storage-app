import { Modal, Text, Stack, Button, Box, Divider } from '@mantine/core';
import { IconTrash, IconAlertTriangle } from '@tabler/icons-react';
import React from 'react';

import styles from './DeleteConfirmationModal.module.scss';

interface DeleteConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  description?: string;
  loading?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  opened,
  onClose,
  onConfirm,
  title,
  itemName,
  description = 'Это действие нельзя отменить.',
  loading = false,
  size = 'sm',
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={null}
      size={size}
      centered
      closeOnClickOutside={false}
      closeOnEscape={false}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      radius="md"
      shadow="md"
      padding={0}
      styles={{
        body: { padding: 0 },
        header: { display: 'none' },
        close: { display: 'none' },
      }}
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-description"
      role="alertdialog"
      className={styles.deleteModal}
    >
      <Box p="xl">
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <IconAlertTriangle size={20} />
          </div>
          <Text size="lg" fw={600} id="delete-modal-title">
            {title}
          </Text>
        </div>

        <Divider mb="lg" />

        {/* Content */}
        <Stack gap="md" mb="lg">
          <Text size="md">Вы действительно хотите удалить</Text>

          <div className={styles.itemNameContainer}>
            <Text size="lg" fw={600} c="red">
              {itemName}
            </Text>
          </div>

          <Text
            size="sm"
            c="dimmed"
            ta="center"
            id="delete-modal-description"
            className={styles.description}
          >
            {description}
          </Text>
        </Stack>

        {/* Actions */}
        <div className={styles.actions}>
          <Button variant="subtle" onClick={onClose} size="md">
            Отмена
          </Button>
          <Button
            variant="filled"
            color="red"
            size="md"
            onClick={onConfirm}
            loading={loading}
            leftSection={<IconTrash size={16} />}
          >
            Удалить
          </Button>
        </div>
      </Box>
    </Modal>
  );
};
