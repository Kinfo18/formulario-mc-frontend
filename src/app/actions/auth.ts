'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { setSessionCookie, deleteSessionCookie } from '@/lib/session';
import type { LoginFormState } from '@/types/auth';

const loginSchema = z.object({
  email: z.string().email({ message: 'Correo inválido' }).max(254),
  password: z.string().min(1, { message: 'Contraseña requerida' }).max(128),
});

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    const issues = parsed.error.issues;
    return { error: issues[0]?.message ?? 'Datos inválidos' };
  }

  const apiUrl = process.env.API_URL ?? 'http://localhost:4000';

  let body: { success: boolean; data?: { token: string } };

  try {
    const res = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(5000),
    });

    body = await res.json();

    if (!res.ok || !body.success || !body.data?.token) {
      return { error: 'Credenciales inválidas' };
    }
  } catch {
    return { error: 'No se pudo conectar con el servidor' };
  }

  await setSessionCookie(body.data.token);
  redirect('/dashboard');
}

export async function logoutAction(): Promise<void> {
  await deleteSessionCookie();
  redirect('/login');
}
