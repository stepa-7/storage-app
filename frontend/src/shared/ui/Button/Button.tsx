import { Button as MantineButton, type ButtonProps as MantineButtonProps } from '@mantine/core';
import React from 'react';

import styles from './Button.module.scss';

export interface ButtonProps extends Omit<MantineButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type,
  children,
  onClick,
  className,
  ...props
}) => {
  const getMantineVariant = (): MantineButtonProps['variant'] => {
    switch (variant) {
      case 'primary':
        return 'filled';
      case 'secondary':
        return 'outline';
      case 'danger':
        return 'filled';
      case 'ghost':
        return 'subtle';
      default:
        return 'filled';
    }
  };

  return (
    <MantineButton
      variant={getMantineVariant()}
      size={size}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      type={type}
      className={`${styles.button} ${styles[variant]} ${className || ''}`}
      {...props}
    >
      {children}
    </MantineButton>
  );
};
