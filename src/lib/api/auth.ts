import { request, requestVoid } from './client';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function getMe(): Promise<AuthUser> {
  return request<AuthUser>('/auth/me');
}

export async function logout(): Promise<void> {
  return requestVoid('/auth/logout', { method: 'POST' });
}
