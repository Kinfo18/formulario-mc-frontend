import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { apiGet } from '@/lib/api-server';
import type { DesplazamientoCompleto } from '@/types/desplazamiento';
import EditarDesplazamientoForm from './EditarDesplazamientoForm';

export default async function EditarDesplazamientoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [user, desp] = await Promise.all([
    getSessionUser(),
    apiGet<DesplazamientoCompleto>(`/api/desplazamientos/${id}`).catch(() => null),
  ]);

  if (!desp) notFound();

  if (desp.estado !== 'BORRADOR') {
    redirect(`/desplazamientos/${id}`);
  }

  const puedeEditar =
    user?.rol === 'ADMIN' ||
    user?.rol === 'OPERACIONES' ||
    desp.conductor.id === user?.id;

  if (!puedeEditar) {
    redirect(`/desplazamientos/${id}`);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href={`/desplazamientos/${id}`}
          className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          ← Volver al detalle
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-900 mt-1">
          Editar desplazamiento
        </h1>
        <p className="text-sm font-mono text-neutral-500 mt-0.5">{desp.codigo}</p>
      </div>

      <EditarDesplazamientoForm desp={desp} />
    </div>
  );
}
