import { Select } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { useUnitStore } from '@app/store/StoreContext';

import type { UnitSelectProps } from './types';
import styles from './UnitSelect.module.scss';

export const UnitSelect: React.FC<UnitSelectProps> = observer(
  ({
    label = 'Единица измерения',
    value,
    onChange,
    required,
    disabled,
    options,
    loading,
    placeholder,
    error,
    ...props
  }) => {
    const { unitOptions, isLoading } = useUnitStore();
    const data = options ?? unitOptions;
    const effectiveLoading = Boolean(loading ?? isLoading);

    return (
      <div className={styles.selectContainer}>
        {label && (
          <label className={`${styles.label} ${required ? styles.required : ''}`}>{label}</label>
        )}
        <Select
          className={styles.select}
          data={data}
          value={value}
          onChange={(value) => onChange?.(value || '')}
          placeholder={placeholder || 'Выберите единицу измерения'}
          disabled={disabled || effectiveLoading}
          error={error}
          searchable
          clearable
          {...props}
        />
      </div>
    );
  },
);

UnitSelect.displayName = 'UnitSelect';
