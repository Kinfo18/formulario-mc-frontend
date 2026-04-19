import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { apiGet } from '@/lib/api-server';
import type { RutaCompleta } from '@/types/desplazamiento';
import { editarRutaAction } from '@/app/actions/rutas';
import RutaForm from '../../RutaForm';

export default async function EditarRutaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getSessionUser();
  if (!user || (user.rol !== 'ADMIN' && user.rol !== 'OPERACIONES')) {
    redirect('/dashboard');
  }

  let ruta: RutaCompleta;
  try {
    ruta = await apiGet<RutaCompleta>(`/api/rutas/${id}`);
  } catch {
    notFound();
  }

  const action = editarRutaAction.bind(null, id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/rutas"
          className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          ← Volver a rutas
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-900 mt-1">Editar plantilla de ruta</h1>
        <p className="text-sm text-neutral-500 font-medium mt-0.5">{ruta.nombre}</p>
      </div>

      <RutaForm serverAction={action} defaultValues={ruta} submitLabel="Guardar cambios" />
    </div>
  );
}
