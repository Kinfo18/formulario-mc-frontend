import 'server-only';
import { getSessionToken } from './session';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';

async function apiFetchRaw(path: string, init?: RequestInit): Promise<Record<string, unknown>> {
  const token = await getSessionToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as Record<string, unknown>)?.error as string ?? `Error ${res.status}`);
  }

  return res.json();
}

export async function apiGet<T>(path: string): Promise<T> {
  const body = await apiFetchRaw(path);
  return body.data as T;
}

export async function apiGetPaginated<T>(path: string): Promise<{
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}> {
  const body = await apiFetchRaw(path);
  return {
    data: body.data as T[],
    meta: body.meta as { total: number; page: number; limit: number; totalPages: number },
  };
}

export async function apiPost<T>(path: string, data: unknown): Promise<T> {
  const body = await apiFetchRaw(path, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return body.data as T;
}

export async function apiPut<T>(path: string, data: unknown): Promise<T> {
  const body = await apiFetchRaw(path, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return body.data as T;
}

export async function apiPatch<T>(path: string, data: unknown): Promise<T> {
  const body = await apiFetchRaw(path, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return body.data as T;
}
