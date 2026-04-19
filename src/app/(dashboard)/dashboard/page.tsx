import Link from 'next/link';
import { getSessionUser } from '@/lib/session';
import { apiGetPaginated } from '@/lib/api-server';
import type { DesplazamientoResumen, EstadoDesplazamiento } from '@/types/desplazamiento';

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

const STAT_CARDS = [
  {
    estado: 'BORRADOR' as EstadoDesplazamiento,
    label: 'Borrador',
    dotClass: 'bg-neutral-400',
  },
  {
    estado: 'EN_REVISION' as EstadoDesplazamiento,
    label: 'En revisión',
    dotClass: 'bg-blue-500',
  },
  {
    estado: 'APROBADO' as EstadoDesplazamiento,
    label: 'Aprobados',
    dotClass: 'bg-green-500',
  },
  {
    estado: 'RECHAZADO' as EstadoDesplazamiento,
    label: 'Rechazados',
    dotClass: 'bg-red-500',
  },
];

export default async function DashboardPage() {
  const user = await getSessionUser();

  const [borradorRes, enRevisionRes, aprobadoRes, rechazadoRes, recientesRes] =
    await Promise.all([
      apiGetPaginated<DesplazamientoResumen>(
        '/api/desplazamientos?estado=BORRADOR&limit=1',
      ).catch(() => null),
      apiGetPaginated<DesplazamientoResumen>(
        '/api/desplazamientos?estado=EN_REVISION&limit=1',
      ).catch(() => null),
      apiGetPaginated<DesplazamientoResumen>(
        '/api/desplazamientos?estado=APROBADO&limit=1',
      ).catch(() => null),
      apiGetPaginated<DesplazamientoResumen>(
        '/api/desplazamientos?estado=RECHAZADO&limit=1',
      ).catch(() => null),
      apiGetPaginated<DesplazamientoResumen>(
        '/api/desplazamientos?limit=5',
      ).catch(() => null),
    ]);

  const statValues = [
    borradorRes?.meta.total ?? 0,
    enRevisionRes?.meta.total ?? 0,
    aprobadoRes?.meta.total ?? 0,
    rechazadoRes?.meta.total ?? 0,
  ];

  const recientes = recientesRes?.data ?? [];

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">
          Bienvenido, {user?.nombre}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Panel de Planificación de Desplazamientos Laborales 2026
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STAT_CARDS.map((card, i) => (
          <Link
            key={card.estado}
            href={`/desplazamientos?estado=${card.estado}`}
            className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-neutral-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2 h-2 rounded-full ${card.dotClass}`} />
              <p className="text-xs font-medium text-neutral-500">{card.label}</p>
            </div>
            <p className="text-3xl font-semibold text-neutral-900 tabular-nums">
              {statValues[i]}
            </p>
          </Link>
        ))}
      </div>

      {/* Últimos desplazamientos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">
            Últimos desplazamientos
          </h2>
          <Link
            href="/desplazamientos"
            className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Ver todos →
          </Link>
        </div>

        {recientes.length === 0 ? (
          <div className="text-center py-12 text-neutral-400 text-sm border border-neutral-200 rounded-xl bg-white">
            <p>No hay desplazamientos registrados aún.</p>
            <Link
              href="/desplazamientos/nuevo"
              className="text-neutral-900 underline mt-2 inline-block"
            >
              Crear el primero
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  <th className="text-left px-4 py-3 font-medium text-neutral-500">
                    Código
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-500 hidden sm:table-cell">
                    Ruta
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-500 hidden md:table-cell">
                    Conductor
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-500">
                    Estado
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-500 hidden lg:table-cell">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody>
                {recientes.map((d) => (
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
                    <td className="px-4 py-3 text-neutral-700 max-w-[180px] truncate hidden sm:table-cell">
                      {d.ruta.nombre}
                    </td>
                    <td className="px-4 py-3 text-neutral-600 hidden md:table-cell">
                      {d.conductor.nombre}
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
        )}
      </div>
    </div>
  );
}
