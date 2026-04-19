import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { z } from 'zod';
import type { AuthUser } from '@/types/auth';

const COOKIE_NAME = 'auth-token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  nombre: z.string(),
  rol: z.enum(['ADMIN', 'OPERACIONES', 'CONDUCTOR']),
});

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export const getSessionUser = cache(async (): Promise<AuthUser | null> => {
  const token = await getSessionToken();
  if (!token) return null;

  const apiUrl = process.env.API_URL ?? 'http://localhost:4000';

  try {
    const res = await fetch(`${apiUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;

    const body = await res.json();
    const parsed = authUserSchema.safeParse(body.data);
    if (!parsed.success) return null;
    return parsed.data;
  } catch (error) {
    console.error('[session] Error al verificar sesión:', error);
    return null;
  }
});
