import { Container, Text, Button } from '@mantine/core';
import React from 'react';

import styles from './PageLayout.module.scss';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'filled' | 'light' | 'outline' | 'subtle';
  };
  children: React.ReactNode;
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  subtitle,
  action,
  children,
  className,
}) => {
  return (
    <div className={`${styles.pageLayout} ${className || ''}`}>
      <Container size="xl" className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <Text size="xl" fw={700} className={styles.title}>
              {title}
            </Text>
            {subtitle && (
              <Text size="md" c="dimmed" className={styles.subtitle}>
                {subtitle}
              </Text>
            )}
          </div>

          {action && (
            <Button
              variant={action.variant || 'filled'}
              size="md"
              onClick={action.onClick}
              leftSection={action.icon}
              className={styles.actionButton}
            >
              {action.label}
            </Button>
          )}
        </div>

        <div className={styles.content}>{children}</div>
      </Container>
    </div>
  );
};
