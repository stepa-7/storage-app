import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { useColorScheme, useHotkeys, useLocalStorage } from '@mantine/hooks';
import React from 'react';

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const preferred = useColorScheme(); // 'light' | 'dark'

  const [colorScheme, setColorScheme] = useLocalStorage<'light' | 'dark'>({
    key: 'app-color-scheme',
    defaultValue: preferred,
    getInitialValueInEffect: false,
  });

  const toggleColorScheme = () => setColorScheme(colorScheme === 'light' ? 'dark' : 'light');

  useHotkeys([
    ['mod+J', () => toggleColorScheme()], // ⌘+J / Ctrl+J для переключения темы
  ]);

  return (
    <>
      <ColorSchemeScript defaultColorScheme="auto" />
      <MantineProvider defaultColorScheme={colorScheme}>{children}</MantineProvider>
    </>
  );
};
