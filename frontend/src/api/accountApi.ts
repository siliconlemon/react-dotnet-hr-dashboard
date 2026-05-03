import { apiFetch } from './http';
import type { PatchUserSettingsDto, UserAccountDto } from './types';

export async function fetchCurrentAccount(signal?: AbortSignal): Promise<UserAccountDto | null> {
  const res = await apiFetch('/api/account/me', { signal });
  if (res.status === 401) return null;
  if (!res.ok) {
    throw new Error('account_fetch_failed');
  }
  return res.json() as Promise<UserAccountDto>;
}

export async function patchAccountSettings(
  body: PatchUserSettingsDto,
  signal?: AbortSignal,
): Promise<UserAccountDto> {
  const res = await apiFetch('/api/account/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    const text = (await res.text()).trim();
    throw new Error(text || 'account_settings_patch_failed');
  }
  return res.json() as Promise<UserAccountDto>;
}
