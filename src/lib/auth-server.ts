import type { AuthUserResponseDto } from '@/lib/api';

import { ApiError } from './api-error';
import { getServerRequestContext, requestServer } from './server-fetch';

export type ServerSessionSnapshot = {
  user: AuthUserResponseDto | null;
  sessionVerifyFailed: boolean;
};

export async function getServerSessionSnapshot(): Promise<ServerSessionSnapshot> {
  const ctx = await getServerRequestContext();

  if (!ctx.cookieHeader) {
    return { user: null, sessionVerifyFailed: false };
  }

  try {
    const me = await requestServer<AuthUserResponseDto>('/auth/me', ctx);
    return { user: me ?? null, sessionVerifyFailed: false };
  } catch (err) {
    if (
      err instanceof ApiError &&
      (err.status === 401 || err.status === 403)
    ) {
      return { user: null, sessionVerifyFailed: false };
    }
    return { user: null, sessionVerifyFailed: true };
  }
}
