export interface UnitSelectProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[]; // опциональные опции извне
  loading?: boolean; // внешний флаг загрузки
  placeholder?: string;
  error?: string;
  'data-testid'?: string;
}
