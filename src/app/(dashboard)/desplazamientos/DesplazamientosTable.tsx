'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
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

const MAX_SELECTION = 50;

interface Props {
  desplazamientos: DesplazamientoResumen[];
  puedeExportar: boolean;
}

export function DesplazamientosTable({ desplazamientos, puedeExportar }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const allIds = desplazamientos.map((d) => d.id);
  const allChecked = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const someChecked = selected.size > 0;

  function toggleAll() {
    if (allChecked) {
      setSelected(new Set());
    } else {
      const next = new Set(selected);
      for (const id of allIds) {
        if (next.size < MAX_SELECTION) next.add(id);
      }
      setSelected(next);
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX_SELECTION) {
        next.add(id);
      }
      return next;
    });
  }

  function handleBulkDownload() {
    setError(null);
    startTransition(async () => {
      const ids = Array.from(selected);
      const res = await fetch('/api/pdf/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError((body as Record<string, unknown>).error as string ?? 'Error al generar el ZIP');
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `desplazamientos-${new Date().toISOString().split('T')[0]}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setSelected(new Set());
    });
  }

  return (
    <div className="space-y-3">
      {puedeExportar && someChecked && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-neutral-900 text-white rounded-xl text-sm">
          <span className="font-medium text-xs sm:text-sm">
            {selected.size} {selected.size === 1 ? 'seleccionado' : 'seleccionados'}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {error && <span className="text-red-300 text-xs">{error}</span>}
            <button
              onClick={() => setSelected(new Set())}
              className="text-neutral-400 hover:text-white transition-colors text-xs min-h-[36px] px-2"
            >
              Cancelar
            </button>
            <button
              onClick={handleBulkDownload}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-50 min-h-[36px]"
            >
              {isPending ? 'Generando ZIP…' : '↓ Descargar ZIP'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-neutral-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              {puedeExportar && (
                <th className="px-4 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-500"
                    aria-label="Seleccionar todos"
                    title={allChecked ? 'Deseleccionar todos' : 'Seleccionar todos'}
                  />
                </th>
              )}
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
                {puedeExportar && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(d.id)}
                      onChange={() => toggleOne(d.id)}
                      className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-500"
                      aria-label={`Seleccionar ${d.codigo}`}
                      disabled={!selected.has(d.id) && selected.size >= MAX_SELECTION}
                    />
                  </td>
                )}
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
    </div>
  );
}
