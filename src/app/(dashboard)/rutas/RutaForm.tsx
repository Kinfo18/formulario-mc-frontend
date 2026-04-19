'use client';

import { useActionState, useState } from 'react';
import type { RutaFormState } from '@/app/actions/rutas';
import type { RutaCompleta, VarianteLimiteVelocidad, ZonaVelocidad } from '@/types/desplazamiento';

const ZONAS: Array<{ value: ZonaVelocidad; label: string }> = [
  { value: 'LOCACIONES', label: 'Locaciones' },
  { value: 'VIA_DESTAPADA', label: 'Vía destapada' },
  { value: 'VIA_PAVIMENTADA', label: 'Vía pavimentada' },
  { value: 'AREAS_URBANAS', label: 'Áreas urbanas' },
  { value: 'ZONA_ESCOLAR', label: 'Zona escolar' },
  { value: 'DESCENSOS_PELIGROSOS', label: 'Descensos peligrosos' },
  { value: 'OTRO_REQUISITOS_CLIENTE', label: 'Otros / Requisitos cliente' },
];

interface Props {
  serverAction: (prev: RutaFormState, formData: FormData) => Promise<RutaFormState>;
  defaultValues?: Partial<RutaCompleta>;
  submitLabel?: string;
}

export default function RutaForm({
  serverAction,
  defaultValues,
  submitLabel = 'Guardar ruta',
}: Props) {
  const [state, formAction, pending] = useActionState<RutaFormState, FormData>(
    serverAction,
    {},
  );

  const [variante, setVariante] = useState<VarianteLimiteVelocidad>(
    defaultValues?.varianteLimiteVelocidad ?? 'DUAL',
  );

  const fe = state.fieldErrors ?? {};

  const getLimite = (zona: ZonaVelocidad) =>
    defaultValues?.limitesVelocidad?.find((l) => l.zona === zona);

  return (
    <form action={formAction} className="space-y-8">
      {state.error && (
        <div role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {state.error}
        </div>
      )}

      {/* ── Información general ── */}
      <Section title="Información general">
        <Field label="Nombre de la ruta" required error={fe.nombre}>
          <input
            name="nombre"
            type="text"
            required
            defaultValue={defaultValues?.nombre ?? ''}
            className={inputClass(!!fe.nombre)}
            placeholder="Ej: Ruta Cubiro — Bogotá"
          />
        </Field>

        <Field label="Descripción" error={fe.descripcion}>
          <textarea
            name="descripcion"
            rows={2}
            defaultValue={defaultValues?.descripcion ?? ''}
            className={inputClass(false)}
            placeholder="Breve descripción del recorrido (opcional)"
          />
        </Field>

        <Field label="Variante de límite de velocidad" required>
          <select
            name="varianteLimiteVelocidad"
            value={variante}
            onChange={(e) => setVariante(e.target.value as VarianteLimiteVelocidad)}
            className={inputClass(false)}
          >
            <option value="DUAL">Dual — Cargado / Descargado</option>
            <option value="UNICA">Única — KM permitido</option>
          </select>
          <p className="text-xs text-neutral-400 mt-1">
            {variante === 'DUAL'
              ? 'Se registrará velocidad diferente según si el vehículo está cargado o descargado.'
              : 'Se registrará un único límite de velocidad por zona.'}
          </p>
        </Field>
      </Section>

      {/* ── Sección 2: Kilometraje ── */}
      <Section title="2. Kilometraje y municipios">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="KM pavimentados" error={fe.kmsPavimentados}>
            <input
              name="kmsPavimentados"
              type="number"
              step="0.1"
              min="0"
              defaultValue={defaultValues?.kmsPavimentados ?? ''}
              className={inputClass(!!fe.kmsPavimentados)}
              placeholder="0.0"
            />
          </Field>
          <Field label="KM destapados" error={fe.kmsDestapados}>
            <input
              name="kmsDestapados"
              type="number"
              step="0.1"
              min="0"
              defaultValue={defaultValues?.kmsDestapados ?? ''}
              className={inputClass(!!fe.kmsDestapados)}
              placeholder="0.0"
            />
          </Field>
        </div>

        <Field label="Municipios atravesados" error={fe.municipiosAtravesados}>
          <textarea
            name="municipiosAtravesados"
            rows={2}
            defaultValue={defaultValues?.municipiosAtravesados ?? ''}
            className={inputClass(false)}
            placeholder="Ej: Bogotá, Facatativá, Villeta…"
          />
        </Field>
      </Section>

      {/* ── Sección 5: Límites de velocidad ── */}
      <Section title="5. Límites de velocidad">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-2 pr-4 font-medium text-neutral-500 whitespace-nowrap">
                  Zona
                </th>
                {variante === 'UNICA' ? (
                  <th className="text-left py-2 pr-4 font-medium text-neutral-500 whitespace-nowrap">
                    KM permitido
                  </th>
                ) : (
                  <>
                    <th className="text-left py-2 pr-4 font-medium text-neutral-500 whitespace-nowrap">
                      Cargado (km/h)
                    </th>
                    <th className="text-left py-2 pr-4 font-medium text-neutral-500 whitespace-nowrap">
                      Descargado (km/h)
                    </th>
                  </>
                )}
                <th className="text-left py-2 font-medium text-neutral-500">Requisito</th>
              </tr>
            </thead>
            <tbody>
              {ZONAS.map(({ value: zona, label }) => {
                const existing = getLimite(zona);
                return (
                  <tr key={zona} className="border-b border-neutral-100 last:border-0">
                    <td className="py-2 pr-4 text-neutral-700 text-xs whitespace-nowrap">
                      {label}
                    </td>
                    {variante === 'UNICA' ? (
                      <td className="py-2 pr-4">
                        <input
                          name={`lv_${zona}_kmPermitido`}
                          type="number"
                          step="0.1"
                          min="0"
                          defaultValue={existing?.kmPermitido ?? ''}
                          className="w-24 px-2 py-1 text-xs border border-neutral-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                        />
                      </td>
                    ) : (
                      <>
                        <td className="py-2 pr-4">
                          <input
                            name={`lv_${zona}_velocidadCargado`}
                            type="number"
                            step="1"
                            min="0"
                            defaultValue={existing?.velocidadCargado ?? ''}
                            className="w-24 px-2 py-1 text-xs border border-neutral-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                          />
                        </td>
                        <td className="py-2 pr-4">
                          <input
                            name={`lv_${zona}_velocidadDescargado`}
                            type="number"
                            step="1"
                            min="0"
                            defaultValue={existing?.velocidadDescargado ?? ''}
                            className="w-24 px-2 py-1 text-xs border border-neutral-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                          />
                        </td>
                      </>
                    )}
                    <td className="py-2">
                      <input
                        name={`lv_${zona}_requisito`}
                        type="text"
                        defaultValue={existing?.requisito ?? ''}
                        placeholder="Opcional"
                        className="w-full px-2 py-1 text-xs border border-neutral-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── Sección 9: Recomendaciones ── */}
      <Section title="9. Recomendaciones de conducción">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: 'recViasDestapadas', label: 'Vías destapadas' },
            { name: 'recZonasUrbanas', label: 'Zonas urbanas' },
            { name: 'recCurvasPeligrosas', label: 'Curvas peligrosas' },
            { name: 'recIntersecciones', label: 'Intersecciones' },
            { name: 'recPuentesFuenteHidrica', label: 'Puentes / fuentes hídricas' },
            { name: 'recTramosRectos', label: 'Tramos rectos' },
          ].map(({ name, label }) => (
            <Field key={name} label={label}>
              <textarea
                name={name}
                rows={2}
                defaultValue={
                  (defaultValues as Record<string, unknown>)?.[name] as string ?? ''
                }
                className={inputClass(false)}
                placeholder="Opcional"
              />
            </Field>
          ))}
        </div>
      </Section>

      {/* ── Otros ── */}
      <Section title="Otros datos">
        <Field label="Descripción ruta alterna (Sección 3)">
          <textarea
            name="rutaAlternaDescripcion"
            rows={2}
            defaultValue={defaultValues?.rutaAlternaDescripcion ?? ''}
            className={inputClass(false)}
            placeholder="Opcional"
          />
        </Field>

        <Field label="Puntos críticos de seguridad (Sección 13)">
          <textarea
            name="puntosCriticosSeguridad"
            rows={3}
            defaultValue={defaultValues?.puntosCriticosSeguridad ?? ''}
            className={inputClass(false)}
            placeholder="Opcional"
          />
        </Field>
      </Section>

      {/* ── Acciones ── */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-2">
        <a
          href="/rutas"
          className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors px-4 py-2.5 text-center rounded-lg hover:bg-neutral-100 sm:w-auto"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={pending}
          className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? 'Guardando…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
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

function inputClass(hasError: boolean) {
  return `w-full px-3 py-2.5 text-sm rounded-lg border ${
    hasError
      ? 'border-red-400 focus:ring-red-400'
      : 'border-neutral-300 focus:ring-neutral-900'
  } bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow`;
}
