// In production, requests go to /api/* which Next.js rewrites to the backend.
// This avoids Mixed Content (HTTPS frontend -> HTTP backend).
const API_URL = '/api';

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body || res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export async function requestVoid(path: string, options?: RequestInit): Promise<void> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body || res.statusText}`);
  }
}
