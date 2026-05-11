import type { AuthUserResponseDto } from '@/lib/api';

import { ApiError } from './api-error';
import { getServerRequestContext, requestServer } from './server-fetch';

export async function getServerSessionUser(): Promise<AuthUserResponseDto | null> {
  const ctx = await getServerRequestContext();

  if (!ctx.cookieHeader) {
    return null;
  }

  try {
    const me = await requestServer<AuthUserResponseDto>('/auth/me', ctx);
    return me ?? null;
  } catch (err) {
    if (
      err instanceof ApiError &&
      (err.status === 401 || err.status === 403)
    ) {
      return null;
    }
    return null;
  }
}
