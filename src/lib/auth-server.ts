import { cache } from 'react';

import type { AuthUserResponseDto } from '@/lib/api';
import { DEFAULT_LOCALE } from '@/i18n/locales';

import { getServerRequestContext, requestServer } from './server-fetch';

export const fetchCachedServerAuthMe = cache(
  async (
    cookieHeader: string,
    origin: string,
  ): Promise<AuthUserResponseDto | undefined> => {
    return requestServer<AuthUserResponseDto>('/auth/me', {
      cookieHeader,
      origin,
      locale: DEFAULT_LOCALE,
    });
  },
);

export type ServerSessionSnapshot = {
  user: AuthUserResponseDto | null;
};

export async function getServerSessionSnapshot(): Promise<ServerSessionSnapshot> {
  const ctx = await getServerRequestContext();

  if (!ctx.cookieHeader) {
    return { user: null };
  }

  try {
    const me = await fetchCachedServerAuthMe(ctx.cookieHeader, ctx.origin);
    return { user: me ?? null };
  } catch {
    return { user: null };
  }
}
