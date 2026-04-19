import { redirect, notFound } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { apiGet } from '@/lib/api-server';
import { editarUsuarioAction } from '@/app/actions/usuarios';
import { UsuarioForm } from '../../UsuarioForm';
import type { UserRole } from '@/types/auth';

interface UsuarioDetalle {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  activo: boolean;
}

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [user, { id }] = await Promise.all([getSessionUser(), params]);
  if (!user || user.rol !== 'ADMIN') redirect('/dashboard');

  let usuario: UsuarioDetalle;
  try {
    usuario = await apiGet<UsuarioDetalle>(`/api/admin/usuarios/${id}`);
  } catch {
    notFound();
  }

  const action = editarUsuarioAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Editar usuario</h1>
        <p className="text-sm text-neutral-500 mt-0.5">{usuario.email}</p>
      </div>
      <UsuarioForm
        action={action}
        defaultValues={{ nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }}
        isEdit
      />
    </div>
  );
}
