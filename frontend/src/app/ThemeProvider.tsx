import { MantineProvider, ColorSchemeScript, createTheme } from '@mantine/core';
import React from 'react';

// монохромная палитра
const primary = [
  '#FAFAFA', // 0
  '#F0F0F0', // 1
  '#E0E0E0', // 2
  '#C0C0C0', // 3
  '#9E9E9E', // 4
  '#757575', // 5
  '#424242', // 6
  '#212121', // 7
  '#121212', // 8
  '#000000', // 9
] as const;

const theme = createTheme({
  primaryColor: 'primary',
  colors: { primary },
  primaryShade: 6,
  autoContrast: true,

  components: {
    // Card: {
    //   styles: () => ({
    //     root: {
    //       position: 'relative',
    //       isolation: 'isolate',
    //       backgroundColor: 'transparent !important',
    //       overflow: 'hidden',
    //       transition: 'all 0.3s ease',
    //       /* liquid glass overlays с адаптацией к темам */
    //       '&::before': {
    //         content: '""',
    //         position: 'absolute',
    //         inset: 0,
    //         zIndex: -1,
    //         pointerEvents: 'none',
    //         borderRadius: 'inherit',
    //         backgroundColor: 'light-dark(var(--glass-overlay), var(--glass-overlay))',
    //         border: '1px solid light-dark(var(--glass-border), var(--glass-border))',
    //         transition: 'all 0.3s ease',
    //       },
    //       '&::after': {
    //         content: '""',
    //         position: 'absolute',
    //         inset: 0,
    //         zIndex: -2,
    //         pointerEvents: 'none',
    //         borderRadius: 'inherit',
    //         backdropFilter: 'blur(8px)',
    //         WebkitBackdropFilter: 'blur(8px)',
    //         filter: 'url(#card-glass-distortion)',
    //         WebkitFilter: 'url(#card-glass-distortion)',
    //       },
    //     },
    //   }),
    // },
  },

  fontFamily: 'ALS Hauss, Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  headings: {
    fontFamily: 'ALS Hauss, Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
});

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <ColorSchemeScript defaultColorScheme="auto" />
    <MantineProvider theme={theme} defaultColorScheme="auto">
      {children}
    </MantineProvider>
  </>
);
