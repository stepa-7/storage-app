import { Modal as MantineModal } from '@mantine/core';
import React from 'react';

import styles from './Modal.module.scss';
import type { ModalProps } from './types';

export const Modal: React.FC<ModalProps> = ({
  opened,
  onClose,
  title,
  children,
  size = 'md',
  closeOnClickOutside = true,
  closeOnEscape = true,
  className,
  ...props
}) => {
  return (
    <MantineModal
      opened={opened}
      onClose={onClose}
      title={title}
      size={size}
      closeOnClickOutside={closeOnClickOutside}
      closeOnEscape={closeOnEscape}
      className={`${styles.modal} ${className || ''}`}
      radius="md"
      centered
      {...props}
    >
      <div className={styles.content}>{children}</div>
    </MantineModal>
  );
};
