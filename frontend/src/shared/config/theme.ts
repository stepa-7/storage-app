export const COLORS = {
  PRIMARY: '#00AAE6',
  WHITE: '#FFFFFF',
  LIGHT_BLUE: '#ECF2F9',
  DARK_BLUE: '#02162C',
  BLACK: '#000000',
  BLUE: '#2F80ED',
  DARK_GRAY: '#151515',
  CYAN: '#56CCF2',
  GRAY: '#353535',
  LIGHT_CYAN: '#C7F1FF',
  LIGHT_GRAY: '#C4C4C4',
  VERY_LIGHT_GRAY: '#E8E8E8',
  ERROR: '#ff4d4f',
  ERROR_HOVER: '#ff7875',
  ERROR_ACTIVE: '#d9363e',
} as const;

export type ColorKey = keyof typeof COLORS;
