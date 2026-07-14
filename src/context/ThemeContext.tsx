/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  styles: {
    bg: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    hoverBg: string;
    badgeBg: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('momo_creator_theme', 'light');
  }, []);

  const styles = {
    bg: 'bg-light-bg-primary',
    surface: 'bg-light-bg-surface border-gray-200',
    textPrimary: 'text-light-text-primary',
    textSecondary: 'text-gray-500',
    border: 'border-gray-200',
    hoverBg: 'hover:bg-gray-100',
    badgeBg: 'bg-gray-100',
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode: false, setIsDarkMode, styles }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
