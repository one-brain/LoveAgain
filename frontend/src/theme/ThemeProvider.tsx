import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { FluentProvider } from '@fluentui/react-components';
import { cueDarkTheme, cueLightTheme, type ColorScheme } from './fluentTheme';

/** User preference: an explicit scheme, or follow the OS. */
export type ThemePreference = ColorScheme | 'system';

interface ThemeContextValue {
  preference: ThemePreference;
  scheme: ColorScheme;
  setPreference: (pref: ThemePreference) => void;
  toggle: () => void;
}

const STORAGE_KEY = 'theme';
const ThemeContext = createContext<ThemeContextValue | null>(null);

const readPreference = (): ThemePreference => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  // Legacy dark palettes (romantic, emerald, sapphire) collapse to Fluent dark.
  if (saved === 'romantic' || saved === 'emerald' || saved === 'sapphire') return 'dark';
  if (saved === 'champagne') return 'light';
  return 'system';
};

const systemScheme = (): ColorScheme =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readPreference);
  const [osScheme, setOsScheme] = useState<ColorScheme>(systemScheme);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const onChange = () => setOsScheme(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const scheme: ColorScheme = preference === 'system' ? osScheme : preference;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('romantic', 'emerald', 'champagne', 'sapphire');
    root.classList.toggle('dark', scheme === 'dark');
    root.style.colorScheme = scheme;
  }, [scheme]);

  const setPreference = useCallback((pref: ThemePreference) => {
    localStorage.setItem(STORAGE_KEY, pref);
    setPreferenceState(pref);
  }, []);

  const toggle = useCallback(() => {
    setPreference(scheme === 'dark' ? 'light' : 'dark');
  }, [scheme, setPreference]);

  const value = useMemo(
    () => ({ preference, scheme, setPreference, toggle }),
    [preference, scheme, setPreference, toggle],
  );

  return (
    <ThemeContext.Provider value={value}>
      <FluentProvider
        theme={scheme === 'dark' ? cueDarkTheme : cueLightTheme}
        applyStylesToPortals
        style={{ background: 'transparent', minHeight: '100%' }}
      >
        {children}
      </FluentProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
