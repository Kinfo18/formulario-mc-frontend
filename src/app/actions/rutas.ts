'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { apiPost, apiPut, apiPatch } from '@/lib/api-server';
import type { ZonaVelocidad } from '@/types/desplazamiento';

const ZONAS: ZonaVelocidad[] = [
  'LOCACIONES',
  'VIA_DESTAPADA',
  'VIA_PAVIMENTADA',
  'AREAS_URBANAS',
  'ZONA_ESCOLAR',
  'DESCENSOS_PELIGROSOS',
  'OTRO_REQUISITOS_CLIENTE',
];

const rutaSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(200),
  descripcion: z.string().optional(),
  varianteLimiteVelocidad: z.enum(['UNICA', 'DUAL']).default('DUAL'),
  kmsPavimentados: z.coerce.number().optional(),
  kmsDestapados: z.coerce.number().optional(),
  municipiosAtravesados: z.string().optional(),
  rutaAlternaDescripcion: z.string().optional(),
  recViasDestapadas: z.string().optional(),
  recZonasUrbanas: z.string().optional(),
  recCurvasPeligrosas: z.string().optional(),
  recIntersecciones: z.string().optional(),
  recPuentesFuenteHidrica: z.string().optional(),
  recTramosRectos: z.string().optional(),
  puntosCriticosSeguridad: z.string().optional(),
});

export interface RutaFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

function extractLimitesVelocidad(raw: Record<string, unknown>) {
  return ZONAS.map((zona) => ({
    zona,
    kmPermitido: raw[`lv_${zona}_kmPermitido`]
      ? Number(raw[`lv_${zona}_kmPermitido`])
      : undefined,
    velocidadCargado: raw[`lv_${zona}_velocidadCargado`]
      ? Number(raw[`lv_${zona}_velocidadCargado`])
      : undefined,
    velocidadDescargado: raw[`lv_${zona}_velocidadDescargado`]
      ? Number(raw[`lv_${zona}_velocidadDescargado`])
      : undefined,
    requisito: ((raw[`lv_${zona}_requisito`] as string) ?? '').trim() || undefined,
  })).filter(
    (lv) =>
      lv.kmPermitido !== undefined ||
      lv.velocidadCargado !== undefined ||
      lv.velocidadDescargado !== undefined ||
      lv.requisito !== undefined,
  );
}

export async function crearRutaAction(
  _prev: RutaFormState,
  formData: FormData,
): Promise<RutaFormState> {
  const raw = Object.fromEntries(formData.entries());

  const parsed = rutaSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join('.')] = issue.message;
    }
    return { fieldErrors };
  }

  try {
    await apiPost('/api/rutas', {
      ...parsed.data,
      limitesVelocidad: extractLimitesVelocidad(raw),
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Error al crear la ruta' };
  }

  redirect('/rutas');
}

export async function editarRutaAction(
  id: string,
  _prev: RutaFormState,
  formData: FormData,
): Promise<RutaFormState> {
  const raw = Object.fromEntries(formData.entries());

  const parsed = rutaSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join('.')] = issue.message;
    }
    return { fieldErrors };
  }

  try {
    await apiPut(`/api/rutas/${id}`, {
      ...parsed.data,
      limitesVelocidad: extractLimitesVelocidad(raw),
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Error al actualizar la ruta' };
  }

  redirect('/rutas');
}

export async function toggleActivaRutaAction(id: string): Promise<void> {
  await apiPatch(`/api/rutas/${id}/activa`, {});
  revalidatePath('/rutas');
  redirect('/rutas');
}
