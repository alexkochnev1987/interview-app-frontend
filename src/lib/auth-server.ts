import { cookies } from 'next/headers';

import type { AuthUserResponseDto } from '@/lib/api';

function backendBaseUrl(): string {
  return process.env.BACKEND_URL || 'http://localhost:3000';
}

export async function getServerSessionUser(): Promise<AuthUserResponseDto | null> {
  const jar = await cookies();
  const pairs = jar.getAll().map((c) => `${c.name}=${c.value}`).join('; ');
  if (!pairs) {
    return null;
  }

  try {
    const res = await fetch(`${backendBaseUrl()}/auth/me`, {
      headers: {
        Cookie: pairs,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    return (await res.json()) as AuthUserResponseDto;
  } catch {
    return null;
  }
}
