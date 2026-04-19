'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { apiPost, apiPut, apiPatch } from '@/lib/api-server';
import { getSessionUser } from '@/lib/session';

export interface UsuarioFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

const crearSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(200),
  email: z.string().email('Email inválido').max(254),
  password: z.string().min(8, 'Mínimo 8 caracteres').max(128),
  rol: z.enum(['ADMIN', 'OPERACIONES', 'CONDUCTOR'], { message: 'Rol inválido' }),
});

const editarSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(200),
  email: z.string().email('Email inválido').max(254),
  password: z.string().max(128).optional(),
  rol: z.enum(['ADMIN', 'OPERACIONES', 'CONDUCTOR'], { message: 'Rol inválido' }),
});

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.rol !== 'ADMIN') redirect('/dashboard');
  return user;
}

export async function crearUsuarioAction(
  _prev: UsuarioFormState | null,
  formData: FormData,
): Promise<UsuarioFormState> {
  await requireAdmin();

  const raw = {
    nombre: formData.get('nombre'),
    email: formData.get('email'),
    password: formData.get('password'),
    rol: formData.get('rol'),
  };

  const parsed = crearSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((i) => [i.path[0], i.message]),
      ),
    };
  }

  try {
    await apiPost('/api/admin/usuarios', parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al crear el usuario' };
  }

  revalidatePath('/admin/usuarios');
  redirect('/admin/usuarios');
}

export async function editarUsuarioAction(
  id: string,
  _prev: UsuarioFormState | null,
  formData: FormData,
): Promise<UsuarioFormState> {
  await requireAdmin();

  const rawPassword = formData.get('password') as string;
  const raw = {
    nombre: formData.get('nombre'),
    email: formData.get('email'),
    password: rawPassword || undefined,
    rol: formData.get('rol'),
  };

  const parsed = editarSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((i) => [i.path[0], i.message]),
      ),
    };
  }

  const body: Record<string, unknown> = {
    nombre: parsed.data.nombre,
    email: parsed.data.email,
    rol: parsed.data.rol,
  };
  if (parsed.data.password) body.password = parsed.data.password;

  try {
    await apiPut(`/api/admin/usuarios/${id}`, body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al actualizar el usuario' };
  }

  revalidatePath('/admin/usuarios');
  redirect('/admin/usuarios');
}

export async function toggleEstadoUsuarioAction(id: string): Promise<void> {
  await requireAdmin();
  await apiPatch(`/api/admin/usuarios/${id}/estado`, {});
  revalidatePath('/admin/usuarios');
}
