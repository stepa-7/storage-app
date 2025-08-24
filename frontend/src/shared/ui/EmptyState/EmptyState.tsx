import { Button, Text, Stack } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import React from 'react';

import styles from './EmptyState.module.scss';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'minimal';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  variant = 'default',
}) => {
  return (
    <div className={`${styles.emptyState} ${styles[variant]}`}>
      {icon && <div className={styles.icon}>{icon}</div>}

      <Stack gap="xs" align="center">
        <Text size="lg" fw={600} c="dimmed" ta="center">
          {title}
        </Text>

        {description && (
          <Text size="sm" c="dimmed" ta="center" className={styles.description}>
            {description}
          </Text>
        )}

        {actionLabel && onAction && (
          <Button
            variant="filled"
            size="md"
            onClick={onAction}
            leftSection={<IconPlus size={16} />}
            className={styles.actionButton}
          >
            {actionLabel}
          </Button>
        )}
      </Stack>
    </div>
  );
};
