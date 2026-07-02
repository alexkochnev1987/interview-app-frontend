import createClient from 'openapi-fetch';
import { paths, components } from '../api-types';
import { ApiError } from '../api-error';

export const client = createClient<paths>({
  baseUrl: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export type Schemas = components['schemas'];

type ApiResult<T> = { data?: T; error?: unknown; response: Response };

export function messageFromError(error: unknown, status: number): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === 'string' && maybeMessage.length > 0) {
      return maybeMessage;
    }
  }
  return `API error ${status}`;
}

export function messageFromBody(body: string, status: number): string {
  const trimmed = body.trim();
  if (trimmed.length === 0) return `API error ${status}`;
  try {
    const parsed = JSON.parse(trimmed) as { message?: unknown };
    if (typeof parsed.message === 'string' && parsed.message.length > 0) {
      return parsed.message;
    }
  } catch {}
  return trimmed;
}

export function extractMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === 'string' && maybeMessage.length > 0) {
      return maybeMessage;
    }
  }
  return fallback;
}

export interface HandleOptions {
  // Return an Error to throw a domain-specific error for a status, or undefined to fall through to default ApiError handling.
  onStatus?: (status: number, error: unknown) => Error | undefined;
}

export async function handle<T>(
  promise: Promise<ApiResult<T>>,
  options?: HandleOptions,
): Promise<T> {
  const { data, error, response } = await promise;

  if (options?.onStatus) {
    const mapped = options.onStatus(response.status, error);
    if (mapped) {
      throw mapped;
    }
  }

  if (error) {
    const message = messageFromError(error, response.status);
    const path = new URL(response.url).pathname;
    throw new ApiError(response.status, message, path);
  }

  if (data === undefined) {
    const path = new URL(response.url).pathname;
    throw new ApiError(response.status, `API error ${response.status}: Empty response body`, path);
  }

  return data;
}

export async function assertOk(res: Response, path: string): Promise<void> {
  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(res.status, messageFromBody(body, res.status), path, body);
  }
}

export async function postWithQuery<T>(
  path: string,
  query?: Record<string, string>,
): Promise<T> {
  const queryString = query ? '?' + new URLSearchParams(query).toString() : '';
  const res = await fetch(`/api${path}${queryString}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  await assertOk(res, path);

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
