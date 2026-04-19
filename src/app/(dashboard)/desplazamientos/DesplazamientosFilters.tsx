'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import type { EstadoDesplazamiento, TipoVehiculo } from '@/types/desplazamiento';

const ESTADOS: Array<{ value: EstadoDesplazamiento | ''; label: string }> = [
  { value: '', label: 'Todos los estados' },
  { value: 'BORRADOR', label: 'Borrador' },
  { value: 'EN_REVISION', label: 'En revisión' },
  { value: 'APROBADO', label: 'Aprobado' },
  { value: 'RECHAZADO', label: 'Rechazado' },
  { value: 'ARCHIVADO', label: 'Archivado' },
];

const TIPOS_VEHICULO: Array<{ value: TipoVehiculo | ''; label: string }> = [
  { value: '', label: 'Todos los vehículos' },
  { value: 'CARGA_PESADA', label: 'Carga pesada' },
  { value: 'TRANSPORTE_PERSONAL', label: 'Transporte personal' },
  { value: 'MOTO', label: 'Moto' },
  { value: 'TRANSPORTE_PUBLICO', label: 'Transporte público' },
];

export interface Conductor {
  id: string;
  nombre: string;
}

export interface Ruta {
  id: string;
  nombre: string;
}

interface Props {
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  tipoVehiculo?: string;
  conductorId?: string;
  rutaId?: string;
  q?: string;
  conductores?: Conductor[];
  rutas?: Ruta[];
}

const inputClass =
  'text-xs border border-neutral-200 rounded-lg px-3 py-1.5 bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1 transition-colors';

export function DesplazamientosFilters({
  estado,
  fechaDesde,
  fechaHasta,
  tipoVehiculo,
  conductorId,
  rutaId,
  q,
  conductores,
  rutas,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const clearAll = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  const hasFilters =
    !!estado || !!fechaDesde || !!fechaHasta || !!tipoVehiculo || !!conductorId || !!rutaId || !!q;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Búsqueda por código */}
      <input
        type="search"
        placeholder="Buscar código…"
        value={q ?? ''}
        onChange={(e) => updateFilter('q', e.target.value)}
        className={`${inputClass} w-36`}
        aria-label="Buscar por código"
      />

      {/* Estado */}
      <select
        value={estado ?? ''}
        onChange={(e) => updateFilter('estado', e.target.value)}
        className={inputClass}
        aria-label="Filtrar por estado"
      >
        {ESTADOS.map((e) => (
          <option key={e.value} value={e.value}>
            {e.label}
          </option>
        ))}
      </select>

      {/* Tipo de vehículo */}
      <select
        value={tipoVehiculo ?? ''}
        onChange={(e) => updateFilter('tipoVehiculo', e.target.value)}
        className={inputClass}
        aria-label="Filtrar por tipo de vehículo"
      >
        {TIPOS_VEHICULO.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      {/* Conductor — solo si se proveen */}
      {conductores && conductores.length > 0 && (
        <select
          value={conductorId ?? ''}
          onChange={(e) => updateFilter('conductorId', e.target.value)}
          className={inputClass}
          aria-label="Filtrar por conductor"
        >
          <option value="">Todos los conductores</option>
          {conductores.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      )}

      {/* Ruta — solo si se proveen */}
      {rutas && rutas.length > 0 && (
        <select
          value={rutaId ?? ''}
          onChange={(e) => updateFilter('rutaId', e.target.value)}
          className={inputClass}
          aria-label="Filtrar por ruta"
        >
          <option value="">Todas las rutas</option>
          {rutas.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}
            </option>
          ))}
        </select>
      )}

      {/* Rango de fechas */}
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={fechaDesde ?? ''}
          onChange={(e) => updateFilter('fechaDesde', e.target.value)}
          className={inputClass}
          title="Fecha desde"
          aria-label="Fecha desde"
        />
        <span className="text-xs text-neutral-400">—</span>
        <input
          type="date"
          value={fechaHasta ?? ''}
          onChange={(e) => updateFilter('fechaHasta', e.target.value)}
          className={inputClass}
          title="Fecha hasta"
          aria-label="Fecha hasta"
        />
      </div>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="text-xs text-neutral-500 hover:text-neutral-900 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
