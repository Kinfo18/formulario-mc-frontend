'use client';

import { useActionState, useState, useTransition } from 'react';
import { crearDesplazamientoAction } from '@/app/actions/desplazamientos';
import type { DesplazamientoFormState } from '@/app/actions/desplazamientos';
import type { RutaResumen, RutaCompleta } from '@/types/desplazamiento';

const TIPO_VEHICULO_OPTIONS = [
  { value: 'CARGA_PESADA', label: 'Carga pesada' },
  { value: 'TRANSPORTE_PERSONAL', label: 'Transporte de personal' },
  { value: 'MOTO', label: 'Moto' },
  { value: 'TRANSPORTE_PUBLICO', label: 'Transporte público' },
] as const;

interface Props {
  rutas: RutaResumen[];
}

export default function NuevoDesplazamientoForm({ rutas }: Props) {
  const [state, action, pending] = useActionState<DesplazamientoFormState, FormData>(
    crearDesplazamientoAction,
    {},
  );

  const [rutaSeleccionada, setRutaSeleccionada] = useState<RutaCompleta | null>(null);
  const [cargandoRuta, setCargandoRuta] = useState(false);
  const [transportaProducto, setTransportaProducto] = useState(false);
  const [, startTransition] = useTransition();

  async function handleRutaChange(rutaId: string) {
    if (!rutaId) {
      setRutaSeleccionada(null);
      return;
    }
    setCargandoRuta(true);
    try {
      const res = await fetch(`/api/rutas/${rutaId}`);
      if (res.ok) {
        const body = await res.json();
        startTransition(() => setRutaSeleccionada(body.data));
      }
    } finally {
      setCargandoRuta(false);
    }
  }

  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-8">
      {/* Error global */}
      {state.error && (
        <div role="alert" aria-live="polite" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {state.error}
        </div>
      )}

      {/* ── Sección 0: Selección de ruta ── */}
      <Section title="Ruta">
        <Field label="Ruta de desplazamiento" required error={fe.rutaId}>
          <select
            name="rutaId"
            required
            onChange={(e) => handleRutaChange(e.target.value)}
            className={inputClass(!!fe.rutaId)}
          >
            <option value="">Seleccione una ruta…</option>
            {rutas.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
          {cargandoRuta && <p className="text-xs text-neutral-400 mt-1">Cargando plantilla…</p>}
        </Field>
      </Section>

      {/* ── Sección 1: Datos generales ── */}
      <Section title="1. Datos generales">
        <Field label="Motivo del desplazamiento" required error={fe.motivoDesplazamiento}>
          <textarea
            name="motivoDesplazamiento"
            required
            maxLength={1000}
            rows={3}
            className={inputClass(!!fe.motivoDesplazamiento)}
            placeholder="Describa el propósito del viaje"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tiempo de antelación" required error={fe.tiempoAntelacion}>
            <input name="tiempoAntelacion" type="text" required className={inputClass(!!fe.tiempoAntelacion)} placeholder="Ej: 2 horas" />
          </Field>
          <Field label="Tipo de vehículo" required error={fe.tipoVehiculo}>
            <select name="tipoVehiculo" required className={inputClass(!!fe.tipoVehiculo)}>
              <option value="">Seleccione…</option>
              {TIPO_VEHICULO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Ruta principal" required error={fe.rutaPrincipalNombre}>
            <input
              name="rutaPrincipalNombre"
              type="text"
              required
              defaultValue={rutaSeleccionada?.nombre ?? ''}
              className={inputClass(!!fe.rutaPrincipalNombre)}
              placeholder="Nombre de la ruta principal"
            />
          </Field>
          <Field label="Tiempo de traslado" required error={fe.tiempoTraslado}>
            <input name="tiempoTraslado" type="text" required className={inputClass(!!fe.tiempoTraslado)} placeholder="Ej: 3h 30min" />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Recorrido (km)" required error={fe.recorridoKms}>
            <input
              name="recorridoKms"
              type="number"
              step="0.1"
              min="0.1"
              required
              className={inputClass(!!fe.recorridoKms)}
              placeholder="0.0"
            />
          </Field>
          <div /> {/* spacer */}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Ruta alterna" error={fe.rutaAlternaNombre}>
            <input
              name="rutaAlternaNombre"
              type="text"
              defaultValue={rutaSeleccionada?.rutaAlternaDescripcion ?? ''}
              className={inputClass(!!fe.rutaAlternaNombre)}
              placeholder="Opcional"
            />
          </Field>
          <Field label="Tiempo traslado alterno" error={fe.tiempoTrasladoAlterno}>
            <input name="tiempoTrasladoAlterno" type="text" className={inputClass(!!fe.tiempoTrasladoAlterno)} placeholder="Opcional" />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Hora de salida" required error={fe.horaSalida}>
            <input name="horaSalida" type="time" required className={inputClass(!!fe.horaSalida)} />
          </Field>
          <Field label="Hora de llegada" required error={fe.horaLlegada}>
            <input name="horaLlegada" type="time" required className={inputClass(!!fe.horaLlegada)} />
          </Field>
        </div>

        <Field label="Novedades" error={fe.novedades}>
          <textarea name="novedades" rows={2} className={inputClass(!!fe.novedades)} placeholder="Ingrese novedades si las hay" />
        </Field>

        {/* Checkboxes */}
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-3 min-h-[44px] text-sm text-neutral-700 cursor-pointer">
            <input type="checkbox" name="preoperacionalRealizado" value="true" className="w-4 h-4 rounded border-neutral-300 accent-neutral-900 shrink-0" />
            Preoperacional realizado
          </label>
          <label className="flex items-center gap-3 min-h-[44px] text-sm text-neutral-700 cursor-pointer">
            <input type="checkbox" name="documentacionVerificada" value="true" className="w-4 h-4 rounded border-neutral-300 accent-neutral-900 shrink-0" />
            Documentación verificada
          </label>
          <label className="flex items-center gap-3 min-h-[44px] text-sm text-neutral-700 cursor-pointer">
            <input
              type="checkbox"
              name="transportaProducto"
              value="true"
              className="w-4 h-4 rounded border-neutral-300 accent-neutral-900 shrink-0"
              onChange={(e) => setTransportaProducto(e.target.checked)}
            />
            Transporta producto
          </label>
        </div>

        {transportaProducto && (
          <Field label="¿Cuál producto?" required error={fe.cualProducto}>
            <input name="cualProducto" type="text" required className={inputClass(!!fe.cualProducto)} placeholder="Describa el producto" />
          </Field>
        )}
      </Section>

      {/* ── Vista previa de la plantilla (solo lectura) ── */}
      {rutaSeleccionada && (
        <>
          {/* Sección 2: Ruta principal */}
          <Section title="2. Ruta principal" readOnly>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <InfoField label="KM pavimentados" value={rutaSeleccionada.kmsPavimentados?.toString() ?? '—'} />
              <InfoField label="KM destapados" value={rutaSeleccionada.kmsDestapados?.toString() ?? '—'} />
              <InfoField label="Municipios" value={rutaSeleccionada.municipiosAtravesados ?? '—'} />
            </div>
          </Section>

          {/* Sección 4: Rutas bloqueadas */}
          {rutaSeleccionada.rutasBloqueadas.length > 0 && (
            <Section title="4. Rutas bloqueadas" readOnly>
              <ul className="space-y-1 text-sm text-neutral-700">
                {rutaSeleccionada.rutasBloqueadas.map((r) => (
                  <li key={r.id} className="flex gap-2">
                    <span className="text-neutral-400 shrink-0">{r.orden}.</span>
                    {r.descripcion}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Sección 5: Límites de velocidad — condicional UNICA vs DUAL */}
          {rutaSeleccionada.limitesVelocidad.length > 0 && (
            <Section title="5. Límites de velocidad" readOnly>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-2 pr-4 font-medium text-neutral-500">Zona</th>
                      {rutaSeleccionada.varianteLimiteVelocidad === 'UNICA' ? (
                        <th className="text-left py-2 pr-4 font-medium text-neutral-500">KM permitido</th>
                      ) : (
                        <>
                          <th className="text-left py-2 pr-4 font-medium text-neutral-500">Cargado (km/h)</th>
                          <th className="text-left py-2 pr-4 font-medium text-neutral-500">Descargado (km/h)</th>
                        </>
                      )}
                      <th className="text-left py-2 font-medium text-neutral-500">Requisito</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rutaSeleccionada.limitesVelocidad.map((l) => (
                      <tr key={l.id} className="border-b border-neutral-100 last:border-0">
                        <td className="py-2 pr-4 text-neutral-700">{l.zona}</td>
                        {rutaSeleccionada.varianteLimiteVelocidad === 'UNICA' ? (
                          <td className="py-2 pr-4 text-neutral-700">{l.kmPermitido ?? '—'}</td>
                        ) : (
                          <>
                            <td className="py-2 pr-4 text-neutral-700">{l.velocidadCargado ?? '—'}</td>
                            <td className="py-2 pr-4 text-neutral-700">{l.velocidadDescargado ?? '—'}</td>
                          </>
                        )}
                        <td className="py-2 text-neutral-500 text-xs">{l.requisito ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* Sección 6: Sitios para pernoctar */}
          {rutaSeleccionada.sitiosPernocte.length > 0 && (
            <Section title="6. Sitios para pernoctar" readOnly>
              <SimpleTable
                headers={['KM', 'Nombre', 'Municipio', 'Servicios']}
                rows={rutaSeleccionada.sitiosPernocte.map((s) => [
                  s.km?.toString() ?? '—', s.nombre, s.municipio ?? '—', s.servicios ?? '—',
                ])}
              />
            </Section>
          )}

          {/* Sección 7: Puestos de control */}
          {rutaSeleccionada.puestosControl.length > 0 && (
            <Section title="7. Puestos de control" readOnly>
              <SimpleTable
                headers={['KM', 'Nombre', 'Municipio', 'Servicios']}
                rows={rutaSeleccionada.puestosControl.map((p) => [
                  p.km?.toString() ?? '—', p.nombre, p.municipio ?? '—', p.servicios ?? '—',
                ])}
              />
            </Section>
          )}

          {/* Sección 8: Puntos críticos de tránsito */}
          {rutaSeleccionada.puntosCriticos.length > 0 && (
            <Section title="8. Puntos críticos de tránsito" readOnly>
              <SimpleTable
                headers={['KM desde', 'KM hasta', 'Sentido', 'Descripción']}
                rows={rutaSeleccionada.puntosCriticos.map((p) => [
                  p.kmDesde?.toString() ?? '—',
                  p.kmHasta?.toString() ?? '—',
                  p.sentido ?? '—',
                  p.descripcion,
                ])}
              />
            </Section>
          )}

          {/* Sección 9: Recomendaciones */}
          {(rutaSeleccionada.recViasDestapadas ||
            rutaSeleccionada.recZonasUrbanas ||
            rutaSeleccionada.recCurvasPeligrosas) && (
            <Section title="9. Recomendaciones" readOnly>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <InfoField label="Vías destapadas" value={rutaSeleccionada.recViasDestapadas ?? '—'} />
                <InfoField label="Zonas urbanas" value={rutaSeleccionada.recZonasUrbanas ?? '—'} />
                <InfoField label="Curvas peligrosas" value={rutaSeleccionada.recCurvasPeligrosas ?? '—'} />
                <InfoField label="Intersecciones" value={rutaSeleccionada.recIntersecciones ?? '—'} />
                <InfoField label="Puentes / fuentes hídricas" value={rutaSeleccionada.recPuentesFuenteHidrica ?? '—'} />
                <InfoField label="Tramos rectos" value={rutaSeleccionada.recTramosRectos ?? '—'} />
              </div>
            </Section>
          )}

          {/* Sección 10: Puntos de apoyo a emergencias */}
          {rutaSeleccionada.puntosApoyo.length > 0 && (
            <Section title="10. Puntos de apoyo a emergencias" readOnly>
              <SimpleTable
                headers={['Entidad', 'Ubicación', 'Teléfono', 'Equipos', 'Responsable']}
                rows={rutaSeleccionada.puntosApoyo.map((p) => [
                  p.entidad, p.ubicacion ?? '—', p.telefono ?? '—',
                  p.equiposDisponibles ?? '—', p.responsable ?? '—',
                ])}
              />
            </Section>
          )}

          {/* Sección 11: Directorio telefónico */}
          {rutaSeleccionada.contactosEmergencia.length > 0 && (
            <Section title="11. Directorio de emergencias" readOnly>
              <SimpleTable
                headers={['Entidad', 'Área', 'Teléfono']}
                rows={rutaSeleccionada.contactosEmergencia.map((c) => [
                  c.entidad, c.area ?? '—', c.telefono,
                ])}
              />
            </Section>
          )}

          {/* Sección 12: Estaciones de servicio */}
          {rutaSeleccionada.estacionesServicio.length > 0 && (
            <Section title="12. Estaciones de servicio" readOnly>
              <SimpleTable
                headers={['Entidad', 'Área', 'Teléfono']}
                rows={rutaSeleccionada.estacionesServicio.map((e) => [
                  e.entidad, e.area ?? '—', e.telefono ?? '—',
                ])}
              />
            </Section>
          )}

          {/* Sección 13: Puntos críticos de seguridad */}
          {rutaSeleccionada.puntosCriticosSeguridad && (
            <Section title="13. Puntos críticos de seguridad" readOnly>
              <p className="text-sm text-neutral-700 whitespace-pre-line">
                {rutaSeleccionada.puntosCriticosSeguridad}
              </p>
            </Section>
          )}

          {/* Sección 14: Planos de ruta */}
          {rutaSeleccionada.planoRutaUrl && (
            <Section title="14. Planos de ruta" readOnly>
              <a
                href={rutaSeleccionada.planoRutaUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Ver plano de ruta →
              </a>
            </Section>
          )}
        </>
      )}

      {/* ── Acciones ── */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-2">
        <a href="/desplazamientos" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors px-4 py-2.5 text-center rounded-lg hover:bg-neutral-100 sm:w-auto">
          Cancelar
        </a>
        <button
          type="submit"
          disabled={pending}
          className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? 'Guardando…' : 'Guardar desplazamiento'}
        </button>
      </div>
    </form>
  );
}

// ── Sub-componentes utilitarios ──────────────────────────────────────────────

function Section({ title, children, readOnly }: { title: string; children: React.ReactNode; readOnly?: boolean }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
        {readOnly && (
          <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
            Datos de plantilla
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Field({ label, required, error, children }: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-neutral-500 mb-0.5">{label}</p>
      <p className="text-sm text-neutral-700">{value}</p>
    </div>
  );
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200">
            {headers.map((h) => (
              <th key={h} className="text-left py-2 pr-4 font-medium text-neutral-500 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-neutral-100 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-4 text-neutral-700 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full px-3 py-2.5 text-sm rounded-lg border ${
    hasError ? 'border-red-400 focus:ring-red-400' : 'border-neutral-300 focus:ring-neutral-900'
  } bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow`;
}
