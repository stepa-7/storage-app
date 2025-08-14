import { type ModalProps as MantineModalProps } from '@mantine/core';
export interface ModalProps extends Omit<MantineModalProps, 'opened'> {
  opened: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '55%' | '70%' | '85%';
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}
