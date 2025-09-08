import { Modal, Text, Box, Button, Group } from '@mantine/core';
import React from 'react';

import styles from './BaseModal.module.scss';

interface BaseModalProps {
  opened: boolean;
  onClose: () => void;
  title?: string | React.ReactNode;

  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  centered?: boolean;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;

  // Новые пропы для автоматических кнопок
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  submitDisabled?: boolean;
  submitIcon?: React.ReactNode;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  opened,
  onClose,
  title,
  size = 'md',
  children,
  footer,
  closeOnClickOutside = false,
  closeOnEscape = false,
  centered = true,
  className,
  bodyClassName,
  headerClassName,
  onSubmit,
  submitLabel = 'Сохранить',
  cancelLabel = 'Отмена',
  isLoading = false,
  submitDisabled = false,
  submitIcon,
}) => {
  const renderTitle = () => {
    if (!title) return null;

    if (typeof title === 'string') {
      return (
        <Text size="lg" fw={600}>
          {title}
        </Text>
      );
    }

    return title;
  };

  const renderFooter = () => {
    // Если передан footer, используем его
    if (footer) return footer;

    // Если переданы пропы для автоматических кнопок, генерируем их
    if (onSubmit) {
      return (
        <Group justify="flex-end" gap="sm">
          <Button variant="outline" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={submitDisabled}
            onClick={onSubmit}
            leftSection={submitIcon}
          >
            {submitLabel}
          </Button>
        </Group>
      );
    }

    return null;
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={renderTitle()}
      size={size}
      centered={centered}
      closeOnClickOutside={closeOnClickOutside}
      closeOnEscape={closeOnEscape}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      radius="md"
      shadow="lg"
      padding={0}
      className={className}
      classNames={{
        body: bodyClassName,
        header: headerClassName,
      }}
      styles={{
        body: { padding: footer ? 'var(--mantine-spacing-xl)' : 0 },
        header: title
          ? {
              padding: 'var(--mantine-spacing-md) var(--mantine-spacing-xl)',
              borderBottom: '1px solid var(--mantine-color-default-border)',
            }
          : { display: 'none' },
        close: title ? {} : { display: 'none' },
      }}
    >
      {children}
      {renderFooter() && <Box className={styles.footer}>{renderFooter()}</Box>}
    </Modal>
  );
};

BaseModal.displayName = 'BaseModal';
