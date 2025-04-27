import { useState, useEffect, ReactNode } from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';

interface ThemeProviderProps {
  children: ReactNode;
  publishableKey: string;
}

export function ThemeProvider({ children, publishableKey }: ThemeProviderProps) {
  const [isDark, setIsDark] = useState(() => 
    document.documentElement.classList.contains('dark') || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    const handleThemeChange = (event: CustomEvent<{ isDark: boolean }>) => {
      setIsDark(event.detail.isDark);
    };

    window.addEventListener('themeChange', handleThemeChange as EventListener);
    return () => window.removeEventListener('themeChange', handleThemeChange as EventListener);
  }, []);

  return (
    <ClerkProvider 
      publishableKey={publishableKey}
      appearance={{
        baseTheme: isDark ? dark : undefined,
        variables: { colorPrimary: '#2563eb' },
      }}
    >
      {children}
    </ClerkProvider>
  );
} 