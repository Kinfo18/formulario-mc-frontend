'use client';

import { useState, useTransition } from 'react';
import { cambiarEstadoAction } from '@/app/actions/desplazamientos';
import type { EstadoDesplazamiento } from '@/types/desplazamiento';

type Rol = 'ADMIN' | 'OPERACIONES' | 'CONDUCTOR';

interface Props {
  id: string;
  estado: EstadoDesplazamiento;
  rol: Rol;
  esPropietario: boolean;
}

interface Accion {
  label: string;
  nuevoEstado: EstadoDesplazamiento;
  variante: 'primary' | 'danger' | 'ghost';
  pedirObservacion?: boolean;
}

function getAcciones(estado: EstadoDesplazamiento, rol: Rol, esPropietario: boolean): Accion[] {
  const esOps = rol === 'ADMIN' || rol === 'OPERACIONES';
  const esConductorPropio = rol === 'CONDUCTOR' && esPropietario;

  switch (estado) {
    case 'BORRADOR':
      if (esOps || esConductorPropio) {
        return [{ label: 'Enviar a revisión', nuevoEstado: 'EN_REVISION', variante: 'primary' }];
      }
      return [];

    case 'EN_REVISION':
      if (!esOps) return [];
      return [
        { label: 'Aprobar', nuevoEstado: 'APROBADO', variante: 'primary' },
        { label: 'Rechazar', nuevoEstado: 'RECHAZADO', variante: 'danger', pedirObservacion: true },
        { label: 'Devolver a borrador', nuevoEstado: 'BORRADOR', variante: 'ghost' },
      ];

    case 'RECHAZADO':
      if (!esOps) return [];
      return [
        { label: 'Devolver a borrador', nuevoEstado: 'BORRADOR', variante: 'ghost' },
        { label: 'Archivar', nuevoEstado: 'ARCHIVADO', variante: 'ghost' },
      ];

    case 'APROBADO':
      if (!esOps) return [];
      return [{ label: 'Archivar', nuevoEstado: 'ARCHIVADO', variante: 'ghost' }];

    default:
      return [];
  }
}

const VARIANTE_CLASS: Record<string, string> = {
  primary:
    'px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50',
  danger:
    'px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50',
  ghost:
    'px-3 py-1.5 text-xs font-medium text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50',
};

export function CambiarEstadoButtons({ id, estado, rol, esPropietario }: Props) {
  const acciones = getAcciones(estado, rol, esPropietario);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [accionPendiente, setAccionPendiente] = useState<Accion | null>(null);
  const [observacion, setObservacion] = useState('');

  if (acciones.length === 0) return null;

  function ejecutar(accion: Accion, obs?: string) {
    setError(null);
    startTransition(async () => {
      const result = await cambiarEstadoAction(id, accion.nuevoEstado, obs);
      if (result.error) setError(result.error);
      else {
        setAccionPendiente(null);
        setObservacion('');
      }
    });
  }

  function handleClick(accion: Accion) {
    if (accion.pedirObservacion) {
      setAccionPendiente(accion);
    } else {
      ejecutar(accion);
    }
  }

  return (
    <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
      <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end">
        {acciones.map((a) => (
          <button
            key={a.nuevoEstado}
            onClick={() => handleClick(a)}
            disabled={isPending}
            className={VARIANTE_CLASS[a.variante]}
          >
            {isPending && accionPendiente?.nuevoEstado === a.nuevoEstado
              ? 'Guardando…'
              : a.label}
          </button>
        ))}
      </div>

      {accionPendiente && (
        <div className="w-full sm:max-w-sm bg-white border border-neutral-200 rounded-xl p-4 space-y-3 shadow-sm">
          <p className="text-xs font-medium text-neutral-700">
            Motivo de rechazo <span className="text-red-500">*</span>
          </p>
          <textarea
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            rows={3}
            placeholder="Describe el motivo del rechazo…"
            className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setAccionPendiente(null); setObservacion(''); }}
              className={VARIANTE_CLASS.ghost}
            >
              Cancelar
            </button>
            <button
              onClick={() => ejecutar(accionPendiente, observacion || undefined)}
              disabled={isPending || observacion.trim().length === 0}
              className={VARIANTE_CLASS.danger}
            >
              {isPending ? 'Guardando…' : 'Confirmar rechazo'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
