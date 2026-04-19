import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { crearRutaAction } from '@/app/actions/rutas';
import RutaForm from '../RutaForm';

export default async function NuevaRutaPage() {
  const user = await getSessionUser();

  if (!user || (user.rol !== 'ADMIN' && user.rol !== 'OPERACIONES')) {
    redirect('/dashboard');
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/rutas"
          className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          ← Volver a rutas
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-900 mt-1">Nueva plantilla de ruta</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Los datos de esta plantilla se copiarán automáticamente al crear un desplazamiento.
        </p>
      </div>

      <RutaForm serverAction={crearRutaAction} submitLabel="Crear ruta" />
    </div>
  );
}
