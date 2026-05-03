import { readStoredAccessToken } from '../auth/tokenStorage';

/**
 * Fetch wrapper that attaches `Authorization: Bearer` when a session token exists.
 * All HR API calls should use this instead of raw `fetch` so routes protected with JWT receive the token.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = readStoredAccessToken();
  const headers = new Headers(init?.headers ?? undefined);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  return fetch(input, { ...init, headers });
}
