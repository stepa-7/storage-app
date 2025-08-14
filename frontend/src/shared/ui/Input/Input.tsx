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

  return (
    <div className={`${styles.inputContainer} ${className || ''}`}>
      <input
        className={styles.inputField}
        placeholder={effectivePlaceholder}
        aria-label={label}
        aria-invalid={Boolean(error) || undefined}
        value={value}
        onChange={(e) => onChange?.(e.currentTarget.value)}
        {...props}
      />
      {label && <label className={styles.inputLabel}>{label}</label>}
      <span className={styles.inputHighlight} />
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
