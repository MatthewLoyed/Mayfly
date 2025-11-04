import React, { ReactNode } from 'react';

/**
 * Simplified ThemeProvider - app uses dark mode consistently
 * Kept for compatibility with existing code that might use useThemeContext
 */
interface ThemeContextType {
  effectiveTheme: 'dark';
}

const ThemeContext = React.createContext<ThemeContextType>({ effectiveTheme: 'dark' });

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={{ effectiveTheme: 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return { effectiveTheme: 'dark' as const };
}

