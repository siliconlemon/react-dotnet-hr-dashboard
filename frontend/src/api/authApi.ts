import type { AuthResponseDto } from './types';

/**
 * Showcase login: creates a JWT for the seeded Demo account (no password).
 */
export async function loginAsDemo(signal?: AbortSignal): Promise<AuthResponseDto> {
  const res = await fetch('/api/auth/demo', {
    method: 'POST',
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!res.ok) {
    const text = (await res.text()).trim();
    throw new Error(text || 'demo_login_failed');
  }
  return res.json() as Promise<AuthResponseDto>;
}
