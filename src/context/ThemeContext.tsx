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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('momo_creator_theme') === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('momo_creator_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Same classes in both modes: they point at the palette variables in index.css, which
  // `.dark` redefines. Tailwind's neutral greys here would clash with the plum palette.
  const styles = {
    bg: 'bg-bg-primary',
    surface: 'bg-bg-surface border-border-custom',
    textPrimary: 'text-text-primary',
    textSecondary: 'text-text-secondary',
    border: 'border-border-custom',
    hoverBg: 'hover:bg-bg-surface-hover',
    badgeBg: 'bg-bg-surface-hover',
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode, styles }}>
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
