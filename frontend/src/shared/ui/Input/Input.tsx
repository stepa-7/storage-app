import { type JSX } from 'react';

import styles from './Input.module.scss';
import type { InputProps } from './types';

export function Input({
  label,
  placeholder,
  error,
  value,
  onChange,
  className,
  ...props
}: InputProps): JSX.Element {
  const effectivePlaceholder = placeholder ?? ' ';
  const hasError = Boolean(error);

  return (
    <div
      className={`${styles.inputContainer} ${hasError ? styles.hasError : ''} ${className || ''}`}
    >
      <input
        className={styles.inputField}
        placeholder={effectivePlaceholder}
        aria-label={label}
        aria-invalid={hasError || undefined}
        value={value}
        onChange={(e) => onChange?.(e.currentTarget.value)}
        {...props}
      />
      {label && <label className={styles.inputLabel}>{label}</label>}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
