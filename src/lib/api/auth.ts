import { client, handle } from './client';
import type { AuthUserResponseDto, LoginPayload, LogoutResponse, TeamMember } from './types';

export async function updateUserRole(
  id: string,
  role: 'super_admin' | 'admin' | 'hr' | 'candidate',
): Promise<TeamMember> {
  return handle(client.PATCH('/users/{id}/role', {
    params: { path: { id } },
    body: { role },
  }));
}

export async function login(data: LoginPayload): Promise<AuthUserResponseDto> {
  return handle(client.POST('/auth/login', {
    body: data,
  }));
}

export async function demoLogin(): Promise<AuthUserResponseDto> {
  return handle(client.POST('/auth/demo'));
}

export async function logout(): Promise<LogoutResponse> {
  return handle(client.POST('/auth/logout'));
}
