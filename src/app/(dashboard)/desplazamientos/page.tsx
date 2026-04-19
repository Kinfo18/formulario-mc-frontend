import Link from 'next/link';
import { Suspense } from 'react';
import { apiGetPaginated, apiGet } from '@/lib/api-server';
import { getSessionUser } from '@/lib/session';
import type { DesplazamientoResumen, EstadoDesplazamiento } from '@/types/desplazamiento';
import { DesplazamientosFilters, type Conductor, type Ruta } from './DesplazamientosFilters';
import { ExportButton } from './ExportButton';

const ESTADO_LABEL: Record<EstadoDesplazamiento, string> = {
  BORRADOR: 'Borrador',
  EN_REVISION: 'En revisión',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
  ARCHIVADO: 'Archivado',
};

const ESTADO_COLOR: Record<EstadoDesplazamiento, string> = {
  BORRADOR: 'bg-neutral-100 text-neutral-600',
  EN_REVISION: 'bg-blue-50 text-blue-700',
  APROBADO: 'bg-green-50 text-green-700',
  RECHAZADO: 'bg-red-50 text-red-700',
  ARCHIVADO: 'bg-neutral-100 text-neutral-400',
};

type SearchParams = {
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  tipoVehiculo?: string;
  conductorId?: string;
  rutaId?: string;
  q?: string;
  page?: string;
};

export default async function DesplazamientosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10));

  const qs = new URLSearchParams();
  qs.set('limit', '20');
  qs.set('page', String(page));
  if (params.estado) qs.set('estado', params.estado);
  if (params.fechaDesde) qs.set('fechaDesde', params.fechaDesde);
  if (params.fechaHasta) qs.set('fechaHasta', params.fechaHasta);
  if (params.tipoVehiculo) qs.set('tipoVehiculo', params.tipoVehiculo);
  if (params.conductorId) qs.set('conductorId', params.conductorId);
  if (params.rutaId) qs.set('rutaId', params.rutaId);
  if (params.q) qs.set('q', params.q);

  const usuario = await getSessionUser();
  const puedeExportar = usuario?.rol === 'ADMIN' || usuario?.rol === 'OPERACIONES';

  const [desplazamientosResult, rutasResult, conductoresResult] = await Promise.allSettled([
    apiGetPaginated<DesplazamientoResumen>(`/api/desplazamientos?${qs.toString()}`),
    apiGet<Array<{ id: string; nombre: string }>>('/api/rutas'),
    puedeExportar ? apiGet<Conductor[]>('/api/auth/conductores') : Promise.resolve([] as Conductor[]),
  ]);

  if (desplazamientosResult.status === 'rejected') {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
        Error al cargar los desplazamientos. Intente nuevamente.
      </div>
    );
  }

  const { data: desplazamientos, meta } = desplazamientosResult.value;
  const rutas: Ruta[] = rutasResult.status === 'fulfilled'
    ? rutasResult.value.map((r) => ({ id: r.id, nombre: r.nombre }))
    : [];
  const conductores: Conductor[] = conductoresResult.status === 'fulfilled'
    ? conductoresResult.value
    : [];

  const hasFilters = !!(
    params.estado ||
    params.fechaDesde ||
    params.fechaHasta ||
    params.tipoVehiculo ||
    params.conductorId ||
    params.rutaId ||
    params.q
  );

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Desplazamientos</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {meta.total} {meta.total === 1 ? 'registro' : 'registros'}
            {hasFilters ? ' con los filtros aplicados' : ' en total'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {puedeExportar && (
            <ExportButton searchParams={params} />
          )}
          <Link
            href="/desplazamientos/nuevo"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            + Nuevo desplazamiento
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <Suspense>
        <DesplazamientosFilters
          estado={params.estado}
          fechaDesde={params.fechaDesde}
          fechaHasta={params.fechaHasta}
          tipoVehiculo={params.tipoVehiculo}
          conductorId={params.conductorId}
          rutaId={params.rutaId}
          q={params.q}
          conductores={conductores.length > 0 ? conductores : undefined}
          rutas={rutas.length > 0 ? rutas : undefined}
        />
      </Suspense>

      {/* Tabla o estado vacío */}
      {desplazamientos.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-sm">
            {hasFilters
              ? 'No hay desplazamientos que coincidan con los filtros.'
              : 'No hay desplazamientos registrados aún.'}
          </p>
          {!hasFilters && (
            <Link
              href="/desplazamientos/nuevo"
              className="text-sm text-neutral-900 underline mt-2 inline-block"
            >
              Crear el primero
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  <th className="text-left px-4 py-3 font-medium text-neutral-500">Código</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-500">Ruta</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-500 hidden sm:table-cell">
                    Conductor
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-500 hidden md:table-cell">
                    Salida
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-500">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-500 hidden lg:table-cell">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody>
                {desplazamientos.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/desplazamientos/${d.id}`}
                        className="font-mono text-xs text-neutral-700 hover:text-neutral-900 hover:underline"
                      >
                        {d.codigo}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-neutral-800 max-w-[180px] truncate">
                      {d.ruta.nombre}
                    </td>
                    <td className="px-4 py-3 text-neutral-600 hidden sm:table-cell">
                      {d.conductor.nombre}
                    </td>
                    <td className="px-4 py-3 text-neutral-600 hidden md:table-cell font-mono">
                      {d.horaSalida}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLOR[d.estado]}`}
                      >
                        {ESTADO_LABEL[d.estado]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-xs hidden lg:table-cell">
                      {new Date(d.createdAt).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {meta.totalPages > 1 && (
            <Pagination current={page} total={meta.totalPages} baseParams={params} />
          )}
        </>
      )}
    </div>
  );
}

// ── Paginación (server component) ────────────────────────────────────────────

function Pagination({
  current,
  total,
  baseParams,
}: {
  current: number;
  total: number;
  baseParams: SearchParams;
}) {
  const buildUrl = (p: number) => {
    const qs = new URLSearchParams();
    if (baseParams.estado) qs.set('estado', baseParams.estado);
    if (baseParams.fechaDesde) qs.set('fechaDesde', baseParams.fechaDesde);
    if (baseParams.fechaHasta) qs.set('fechaHasta', baseParams.fechaHasta);
    if (baseParams.tipoVehiculo) qs.set('tipoVehiculo', baseParams.tipoVehiculo);
    if (baseParams.conductorId) qs.set('conductorId', baseParams.conductorId);
    if (baseParams.rutaId) qs.set('rutaId', baseParams.rutaId);
    if (baseParams.q) qs.set('q', baseParams.q);
    qs.set('page', String(p));
    return `/desplazamientos?${qs.toString()}`;
  };

  const linkClass =
    'text-xs px-3 py-1.5 border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-colors';
  const disabledClass =
    'text-xs px-3 py-1.5 border border-neutral-100 rounded-lg text-neutral-300 cursor-default';

  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-neutral-500">
        Página {current} de {total}
      </p>
      <div className="flex gap-2">
        {current > 1 ? (
          <Link href={buildUrl(current - 1)} className={linkClass}>
            ← Anterior
          </Link>
        ) : (
          <span className={disabledClass}>← Anterior</span>
        )}
        {current < total ? (
          <Link href={buildUrl(current + 1)} className={linkClass}>
            Siguiente →
          </Link>
        ) : (
          <span className={disabledClass}>Siguiente →</span>
        )}
      </div>
    </div>
  );
}
