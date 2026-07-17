// src/context/ThemeContext.tsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import axios from 'axios';
import { createAppTheme, DEFAULT_PRIMARY_COLOR } from '../theme';
import { fetchMyOrganization, updateThemeColor } from '../services/organization.service';
import { useAuth } from '../hooks/useAuth';

const STORAGE_KEY = 'erp_theme_color';

type ThemeCtx = {
  themeColor: string;
  setThemeColor: (color: string) => Promise<void>;
};

const AppThemeContext = createContext<ThemeCtx | undefined>(undefined);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
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

  const theme = useMemo(() => createAppTheme(themeColor), [themeColor]);

  const value = useMemo(() => ({ themeColor, setThemeColor }), [themeColor]);

  return (
    <AppThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(AppThemeContext);
  if (!ctx) throw new Error('AppThemeContext not found');
  return ctx;
}
