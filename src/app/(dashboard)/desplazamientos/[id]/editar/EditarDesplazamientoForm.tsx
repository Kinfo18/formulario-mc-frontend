'use client';

import { useActionState, useState } from 'react';
import { editarDesplazamientoAction } from '@/app/actions/desplazamientos';
import type { DesplazamientoFormState } from '@/app/actions/desplazamientos';
import type { DesplazamientoCompleto } from '@/types/desplazamiento';

const TIPO_VEHICULO_OPTIONS = [
  { value: 'CARGA_PESADA', label: 'Carga pesada' },
  { value: 'TRANSPORTE_PERSONAL', label: 'Transporte de personal' },
  { value: 'MOTO', label: 'Moto' },
  { value: 'TRANSPORTE_PUBLICO', label: 'Transporte público' },
] as const;

interface Props {
  desp: DesplazamientoCompleto;
}

export default function EditarDesplazamientoForm({ desp }: Props) {
  const action = editarDesplazamientoAction.bind(null, desp.id);
  const [state, formAction, pending] = useActionState<DesplazamientoFormState, FormData>(
    action,
    {},
  );

  const [transportaProducto, setTransportaProducto] = useState(desp.transportaProducto);

  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-8">
      {state.error && (
        <div role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {state.error}
        </div>
      )}

      {/* Ruta (solo informativa, no editable) */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-4 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-neutral-400 shrink-0" />
        <div>
          <p className="text-xs font-medium text-neutral-500">Ruta</p>
          <p className="text-sm font-medium text-neutral-900">{desp.ruta.nombre}</p>
        </div>
      </div>

      {/* ── Sección 1: Datos generales ── */}
      <Section title="1. Datos generales">
        <Field label="Motivo del desplazamiento" required error={fe.motivoDesplazamiento}>
          <textarea
            name="motivoDesplazamiento"
            required
            maxLength={1000}
            rows={3}
            defaultValue={desp.motivoDesplazamiento}
            className={inputClass(!!fe.motivoDesplazamiento)}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tiempo de antelación" required error={fe.tiempoAntelacion}>
            <input
              name="tiempoAntelacion"
              type="text"
              required
              defaultValue={desp.tiempoAntelacion}
              className={inputClass(!!fe.tiempoAntelacion)}
              placeholder="Ej: 2 horas"
            />
          </Field>
          <Field label="Tipo de vehículo" required error={fe.tipoVehiculo}>
            <select
              name="tipoVehiculo"
              required
              defaultValue={desp.tipoVehiculo}
              className={inputClass(!!fe.tipoVehiculo)}
            >
              {TIPO_VEHICULO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
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
              defaultValue={desp.rutaPrincipalNombre}
              className={inputClass(!!fe.rutaPrincipalNombre)}
            />
          </Field>
          <Field label="Tiempo de traslado" required error={fe.tiempoTraslado}>
            <input
              name="tiempoTraslado"
              type="text"
              required
              defaultValue={desp.tiempoTraslado}
              className={inputClass(!!fe.tiempoTraslado)}
              placeholder="Ej: 3h 30min"
            />
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
              defaultValue={desp.recorridoKms}
              className={inputClass(!!fe.recorridoKms)}
            />
          </Field>
          <div />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Ruta alterna" error={fe.rutaAlternaNombre}>
            <input
              name="rutaAlternaNombre"
              type="text"
              defaultValue={desp.rutaAlternaNombre ?? ''}
              className={inputClass(!!fe.rutaAlternaNombre)}
              placeholder="Opcional"
            />
          </Field>
          <Field label="Tiempo traslado alterno" error={fe.tiempoTrasladoAlterno}>
            <input
              name="tiempoTrasladoAlterno"
              type="text"
              defaultValue={desp.tiempoTrasladoAlterno ?? ''}
              className={inputClass(!!fe.tiempoTrasladoAlterno)}
              placeholder="Opcional"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Hora de salida" required error={fe.horaSalida}>
            <input
              name="horaSalida"
              type="time"
              required
              defaultValue={desp.horaSalida}
              className={inputClass(!!fe.horaSalida)}
            />
          </Field>
          <Field label="Hora de llegada" required error={fe.horaLlegada}>
            <input
              name="horaLlegada"
              type="time"
              required
              defaultValue={desp.horaLlegada}
              className={inputClass(!!fe.horaLlegada)}
            />
          </Field>
        </div>

        <Field label="Novedades" error={fe.novedades}>
          <textarea
            name="novedades"
            rows={2}
            defaultValue={desp.novedades ?? ''}
            className={inputClass(!!fe.novedades)}
            placeholder="Ingrese novedades si las hay"
          />
        </Field>

        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-3 min-h-[44px] text-sm text-neutral-700 cursor-pointer">
            <input
              type="checkbox"
              name="preoperacionalRealizado"
              value="true"
              defaultChecked={desp.preoperacionalRealizado}
              className="w-4 h-4 rounded border-neutral-300 accent-neutral-900 shrink-0"
            />
            Preoperacional realizado
          </label>
          <label className="flex items-center gap-3 min-h-[44px] text-sm text-neutral-700 cursor-pointer">
            <input
              type="checkbox"
              name="documentacionVerificada"
              value="true"
              defaultChecked={desp.documentacionVerificada}
              className="w-4 h-4 rounded border-neutral-300 accent-neutral-900 shrink-0"
            />
            Documentación verificada
          </label>
          <label className="flex items-center gap-3 min-h-[44px] text-sm text-neutral-700 cursor-pointer">
            <input
              type="checkbox"
              name="transportaProducto"
              value="true"
              defaultChecked={desp.transportaProducto}
              className="w-4 h-4 rounded border-neutral-300 accent-neutral-900 shrink-0"
              onChange={(e) => setTransportaProducto(e.target.checked)}
            />
            Transporta producto
          </label>
        </div>

        {transportaProducto && (
          <Field label="¿Cuál producto?" required error={fe.cualProducto}>
            <input
              name="cualProducto"
              type="text"
              required
              defaultValue={desp.cualProducto ?? ''}
              className={inputClass(!!fe.cualProducto)}
              placeholder="Describa el producto"
            />
          </Field>
        )}
      </Section>

      {/* ── Secciones 2-14: datos de plantilla (solo lectura) ── */}

      <Section title="2. Ruta principal" readOnly>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <InfoField label="KM pavimentados" value={desp.kmsPavimentados?.toString() ?? '—'} />
          <InfoField label="KM destapados" value={desp.kmsDestapados?.toString() ?? '—'} />
          <InfoField label="Municipios" value={desp.municipiosAtravesados ?? '—'} />
        </div>
      </Section>

      {desp.rutasBloqueadas.length > 0 && (
        <Section title="4. Rutas bloqueadas" readOnly>
          <ul className="space-y-1 text-sm text-neutral-700">
            {desp.rutasBloqueadas.map((r) => (
              <li key={r.id} className="flex gap-2">
                <span className="text-neutral-400 shrink-0">{r.orden}.</span>
                {r.descripcion}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {desp.limitesVelocidad.length > 0 && (
        <Section title="5. Límites de velocidad" readOnly>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-2 pr-4 font-medium text-neutral-500">Zona</th>
                  {desp.ruta.varianteLimiteVelocidad === 'UNICA' ? (
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
                {desp.limitesVelocidad.map((l) => (
                  <tr key={l.id} className="border-b border-neutral-100 last:border-0">
                    <td className="py-2 pr-4 text-neutral-700">{l.zona}</td>
                    {desp.ruta.varianteLimiteVelocidad === 'UNICA' ? (
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

      {desp.sitiosPernocte.length > 0 && (
        <Section title="6. Sitios para pernoctar" readOnly>
          <SimpleTable
            headers={['KM', 'Nombre', 'Municipio', 'Servicios']}
            rows={desp.sitiosPernocte.map((s) => [
              s.km?.toString() ?? '—', s.nombre, s.municipio ?? '—', s.servicios ?? '—',
            ])}
          />
        </Section>
      )}

      {desp.puestosControl.length > 0 && (
        <Section title="7. Puestos de control" readOnly>
          <SimpleTable
            headers={['KM', 'Nombre', 'Municipio', 'Servicios']}
            rows={desp.puestosControl.map((p) => [
              p.km?.toString() ?? '—', p.nombre, p.municipio ?? '—', p.servicios ?? '—',
            ])}
          />
        </Section>
      )}

      {desp.puntosCriticos.length > 0 && (
        <Section title="8. Puntos críticos de tránsito" readOnly>
          <SimpleTable
            headers={['KM desde', 'KM hasta', 'Sentido', 'Descripción']}
            rows={desp.puntosCriticos.map((p) => [
              p.kmDesde?.toString() ?? '—',
              p.kmHasta?.toString() ?? '—',
              p.sentido ?? '—',
              p.descripcion,
            ])}
          />
        </Section>
      )}

      {(desp.recViasDestapadas || desp.recZonasUrbanas || desp.recCurvasPeligrosas) && (
        <Section title="9. Recomendaciones" readOnly>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <InfoField label="Vías destapadas" value={desp.recViasDestapadas ?? '—'} />
            <InfoField label="Zonas urbanas" value={desp.recZonasUrbanas ?? '—'} />
            <InfoField label="Curvas peligrosas" value={desp.recCurvasPeligrosas ?? '—'} />
            <InfoField label="Intersecciones" value={desp.recIntersecciones ?? '—'} />
            <InfoField label="Puentes / fuentes hídricas" value={desp.recPuentesFuenteHidrica ?? '—'} />
            <InfoField label="Tramos rectos" value={desp.recTramosRectos ?? '—'} />
          </div>
        </Section>
      )}

      {desp.puntosApoyo.length > 0 && (
        <Section title="10. Puntos de apoyo a emergencias" readOnly>
          <SimpleTable
            headers={['Entidad', 'Ubicación', 'Teléfono', 'Equipos', 'Responsable']}
            rows={desp.puntosApoyo.map((p) => [
              p.entidad, p.ubicacion ?? '—', p.telefono ?? '—',
              p.equiposDisponibles ?? '—', p.responsable ?? '—',
            ])}
          />
        </Section>
      )}

      {desp.contactosEmergencia.length > 0 && (
        <Section title="11. Directorio de emergencias" readOnly>
          <SimpleTable
            headers={['Entidad', 'Área', 'Teléfono']}
            rows={desp.contactosEmergencia.map((c) => [
              c.entidad, c.area ?? '—', c.telefono,
            ])}
          />
        </Section>
      )}

      {desp.estacionesServicio.length > 0 && (
        <Section title="12. Estaciones de servicio" readOnly>
          <SimpleTable
            headers={['Entidad', 'Área', 'Teléfono']}
            rows={desp.estacionesServicio.map((e) => [
              e.entidad, e.area ?? '—', e.telefono ?? '—',
            ])}
          />
        </Section>
      )}

      {desp.puntosCriticosSeguridad && (
        <Section title="13. Puntos críticos de seguridad" readOnly>
          <p className="text-sm text-neutral-700 whitespace-pre-line">
            {desp.puntosCriticosSeguridad}
          </p>
        </Section>
      )}

      {desp.planoRutaUrl && (
        <Section title="14. Planos de ruta" readOnly>
          <a
            href={desp.planoRutaUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            Ver plano de ruta →
          </a>
        </Section>
      )}

      {/* ── Acciones ── */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-2">
        <a
          href={`/desplazamientos/${desp.id}`}
          className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors px-4 py-2.5 text-center rounded-lg hover:bg-neutral-100 sm:w-auto"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={pending}
          className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function Section({
  title,
  children,
  readOnly,
}: {
  title: string;
  children: React.ReactNode;
  readOnly?: boolean;
}) {
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

function Field({
  label,
  required,
  error,
  children,
}: {
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
              <th
                key={h}
                className="text-left py-2 pr-4 font-medium text-neutral-500 whitespace-nowrap"
              >
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
    hasError
      ? 'border-red-400 focus:ring-red-400'
      : 'border-neutral-300 focus:ring-neutral-900'
  } bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow`;
}
