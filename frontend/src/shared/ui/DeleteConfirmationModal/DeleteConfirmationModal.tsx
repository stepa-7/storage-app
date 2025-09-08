import { Text, Stack, Button, Box } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import React from 'react';

import { BaseModal } from '../BaseModal';

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
  const modalTitle = (
    <Text size="lg" fw={600} id="delete-modal-title">
      {title}
    </Text>
  );

  const modalContent = (
    <>
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
    </>
  );

  const modalFooter = (
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
  );

  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title={modalTitle}
      size={size}
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Box p="xl">
        {modalContent}
        {modalFooter}
      </Box>
    </BaseModal>
  );
};
