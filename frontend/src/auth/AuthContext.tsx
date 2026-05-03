import type { PaletteMode } from '@mui/material';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fetchCurrentAccount } from '../api/accountApi';
import { loginAsDemo } from '../api/authApi';
import type { UserAccountDto } from '../api/types';
import type { Locale } from '../i18n';
import { useLocale } from '../i18n/useLocale';
import { useColorMode } from '../theme/useColorMode';
import { clearStoredAccessToken, readStoredAccessToken, writeStoredAccessToken } from './tokenStorage';

export type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated';

export type AuthContextValue = {
  status: AuthStatus;
  user: UserAccountDto | null;
  loginDemo: () => Promise<void>;
  logout: () => void;
  replaceUser: (user: UserAccountDto) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function applyServerPreferences(
  account: UserAccountDto,
  setMode: (mode: PaletteMode) => void,
  setLocale: (locale: Locale) => void,
): void {
  const { theme, uiLocale } = account.settings;
  if (theme === 'light' || theme === 'dark') {
    setMode(theme);
  }
  if (uiLocale === 'en' || uiLocale === 'cs') {
    setLocale(uiLocale);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setMode } = useColorMode();
  const { setLocale } = useLocale();
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<UserAccountDto | null>(null);

  const replaceUser = useCallback((next: UserAccountDto) => {
    setUser(next);
  }, []);

  useEffect(() => {
    const token = readStoredAccessToken();
    if (!token) {
      setStatus('unauthenticated');
      return;
    }

    const ac = new AbortController();
    void (async () => {
      try {
        const account = await fetchCurrentAccount(ac.signal);
        if (ac.signal.aborted) return;
        if (!account) {
          clearStoredAccessToken();
          setUser(null);
          setStatus('unauthenticated');
          return;
        }
        applyServerPreferences(account, setMode, setLocale);
        setUser(account);
        setStatus('authenticated');
      } catch {
        if (ac.signal.aborted) return;
        clearStoredAccessToken();
        setUser(null);
        setStatus('unauthenticated');
      }
    })();

    return () => ac.abort();
  }, [setLocale, setMode]);

  const loginDemo = useCallback(async () => {
    const res = await loginAsDemo();
    writeStoredAccessToken(res.accessToken);
    applyServerPreferences(res.user, setMode, setLocale);
    setUser(res.user);
    setStatus('authenticated');
  }, [setLocale, setMode]);

  const logout = useCallback(() => {
    clearStoredAccessToken();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo(
    (): AuthContextValue => ({
      status,
      user,
      loginDemo,
      logout,
      replaceUser,
    }),
    [status, user, loginDemo, logout, replaceUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx == null) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
