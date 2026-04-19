import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { apiGet } from '@/lib/api-server';
import type { RutaResumen } from '@/types/desplazamiento';
import { toggleActivaRutaAction } from '@/app/actions/rutas';

export default async function RutasPage() {
  const user = await getSessionUser();

  if (!user || (user.rol !== 'ADMIN' && user.rol !== 'OPERACIONES')) {
    redirect('/dashboard');
  }

  let rutas: RutaResumen[] = [];
  try {
    rutas = await apiGet<RutaResumen[]>('/api/rutas');
  } catch {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
        Error al cargar las rutas. Intente nuevamente.
      </div>
    );
  }

  const activas = rutas.filter((r) => r.activa);
  const inactivas = rutas.filter((r) => !r.activa);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Plantillas de rutas</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {activas.length} activas
            {inactivas.length > 0 && ` · ${inactivas.length} inactivas`}
          </p>
        </div>
        <Link
          href="/rutas/nueva"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          + Nueva ruta
        </Link>
      </div>

      {rutas.length === 0 ? (
        <div className="text-center py-16 text-neutral-400 text-sm">
          No hay plantillas de ruta registradas.{' '}
          <Link href="/rutas/nueva" className="text-neutral-900 underline">
            Crear la primera
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rutas.map((ruta) => {
            const toggle = toggleActivaRutaAction.bind(null, ruta.id);
            return (
              <div
                key={ruta.id}
                className={`bg-white border rounded-xl p-4 space-y-4 transition-colors ${
                  ruta.activa
                    ? 'border-neutral-200 hover:border-neutral-300'
                    : 'border-neutral-100 opacity-60'
                }`}
              >
                {/* Cabecera */}
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-sm font-semibold text-neutral-900 leading-snug">
                      {ruta.nombre}
                    </h2>
                    {!ruta.activa && (
                      <span className="shrink-0 text-xs font-medium bg-neutral-100 text-neutral-400 px-2 py-0.5 rounded-full">
                        Inactiva
                      </span>
                    )}
                  </div>
                  {ruta.descripcion && (
                    <p className="text-xs text-neutral-500 line-clamp-2">{ruta.descripcion}</p>
                  )}
                </div>

                {/* Métricas */}
                <div className="flex items-center gap-3 text-xs text-neutral-500">
                  <span>
                    {((ruta.kmsPavimentados ?? 0) + (ruta.kmsDestapados ?? 0)).toFixed(0)} km
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-medium ${
                      ruta.varianteLimiteVelocidad === 'DUAL'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    {ruta.varianteLimiteVelocidad === 'DUAL' ? 'Dual' : 'Única'}
                  </span>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 pt-1 border-t border-neutral-100">
                  <Link
                    href={`/rutas/${ruta.id}/editar`}
                    className="text-xs text-neutral-600 hover:text-neutral-900 px-2.5 py-1 rounded-md hover:bg-neutral-100 transition-colors"
                  >
                    Editar
                  </Link>
                  <form action={toggle} className="ml-auto">
                    <button
                      type="submit"
                      className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                        ruta.activa
                          ? 'text-red-500 hover:text-red-700 hover:bg-red-50'
                          : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                      }`}
                    >
                      {ruta.activa ? 'Desactivar' : 'Activar'}
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
