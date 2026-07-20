// src/context/ThemeContext.tsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { createAppTheme, DEFAULT_PRIMARY_COLOR } from '../theme';
import { getLanguageDirection } from '../i18n';
import { fetchMyOrganization, updateThemeColor } from '../services/organization.service';
import { useAuth } from '../hooks/useAuth';

const STORAGE_KEY = 'erp_theme_color';

type ThemeCtx = {
  themeColor: string;
  setThemeColor: (color: string) => Promise<void>;
};

const AppThemeContext = createContext<ThemeCtx | undefined>(undefined);

// One emotion cache per direction — swapping stylis plugins on an existing
// cache doesn't re-flip already-inserted rules, so each direction needs its
// own cache instance rather than mutating one in place.
const ltrCache = createCache({ key: 'css' });
const rtlCache = createCache({ key: 'css-rtl', stylisPlugins: [prefixer, rtlPlugin] });

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { i18n } = useTranslation();
  const [themeColor, setThemeColorState] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) || DEFAULT_PRIMARY_COLOR,
  );

  useEffect(() => {
    const controller = new AbortController();

    if (isAuthenticated) {
      fetchMyOrganization(controller.signal)
        .then((org) => {
          setThemeColorState(org.theme_color);
          localStorage.setItem(STORAGE_KEY, org.theme_color);
        })
        .catch((err) => {
          if (!axios.isCancel(err)) {
            // keep whatever was cached/default on failure
          }
        });
    }

    return () => controller.abort();
  }, [isAuthenticated]);

  const setThemeColor = async (color: string) => {
    setThemeColorState(color);
    localStorage.setItem(STORAGE_KEY, color);
    await updateThemeColor(color);
  };

  const direction = getLanguageDirection(i18n.language);
  const theme = useMemo(() => createAppTheme(themeColor, direction), [themeColor, direction]);
  const cache = direction === 'rtl' ? rtlCache : ltrCache;

  // Native browser behavior (scrollbars, form controls, text selection) also
  // needs the document-level dir attribute, not just the MUI/emotion layer.
  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = i18n.language;
  }, [direction, i18n.language]);

  const value = useMemo(() => ({ themeColor, setThemeColor }), [themeColor]);

  return (
    <AppThemeContext.Provider value={value}>
      <CacheProvider value={cache}>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </MuiThemeProvider>
      </CacheProvider>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(AppThemeContext);
  if (!ctx) throw new Error('AppThemeContext not found');
  return ctx;
}
