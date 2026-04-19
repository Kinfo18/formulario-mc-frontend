import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { crearUsuarioAction } from '@/app/actions/usuarios';
import { UsuarioForm } from '../UsuarioForm';

export default async function NuevoUsuarioPage() {
  const user = await getSessionUser();
  if (!user || user.rol !== 'ADMIN') redirect('/dashboard');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Nuevo usuario</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          El usuario podrá iniciar sesión inmediatamente con la contraseña asignada.
        </p>
      </div>
      <UsuarioForm action={crearUsuarioAction} />
    </div>
  );
}
