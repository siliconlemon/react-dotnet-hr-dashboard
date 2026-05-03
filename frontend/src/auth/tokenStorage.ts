const ACCESS_TOKEN_KEY = 'hr-dashboard-access-token';

export function readStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function writeStoredAccessToken(token: string): void {
  try {
    window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearStoredAccessToken(): void {
  try {
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}
