'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { apiPost, apiPatch, apiPut } from '@/lib/api-server';
import type { CrearDesplazamientoResult, EstadoDesplazamiento } from '@/types/desplazamiento';

const crearSchema = z.object({
  rutaId: z.string().min(1),
  motivoDesplazamiento: z.string().min(1).max(1000),
  tiempoAntelacion: z.string().min(1),
  rutaPrincipalNombre: z.string().min(1),
  tiempoTraslado: z.string().min(1),
  recorridoKms: z.coerce.number().positive(),
  rutaAlternaNombre: z.string().optional(),
  tiempoTrasladoAlterno: z.string().optional(),
  horaSalida: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:mm requerido'),
  horaLlegada: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:mm requerido'),
  novedades: z.string().optional(),
  preoperacionalRealizado: z.coerce.boolean(),
  documentacionVerificada: z.coerce.boolean(),
  tipoVehiculo: z.enum(['CARGA_PESADA', 'TRANSPORTE_PERSONAL', 'MOTO', 'TRANSPORTE_PUBLICO']),
  transportaProducto: z.coerce.boolean(),
  cualProducto: z.string().optional(),
});

export interface DesplazamientoFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function crearDesplazamientoAction(
  _prev: DesplazamientoFormState,
  formData: FormData,
): Promise<DesplazamientoFormState> {
  const raw = Object.fromEntries(formData.entries());

  const parsed = crearSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.');
      fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  let result: CrearDesplazamientoResult;
  try {
    result = await apiPost<CrearDesplazamientoResult>(
      '/api/desplazamientos',
      parsed.data,
    );
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Error al crear el desplazamiento' };
  }

  redirect(`/desplazamientos/${result.id}`);
}

const editarSchema = crearSchema.omit({ rutaId: true });

export async function editarDesplazamientoAction(
  id: string,
  _prev: DesplazamientoFormState,
  formData: FormData,
): Promise<DesplazamientoFormState> {
  const raw = Object.fromEntries(formData.entries());

  const parsed = editarSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join('.')] = issue.message;
    }
    return { fieldErrors };
  }

  try {
    await apiPut(`/api/desplazamientos/${id}`, parsed.data);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Error al guardar los cambios' };
  }

  redirect(`/desplazamientos/${id}`);
}

export async function cambiarEstadoAction(
  id: string,
  estado: EstadoDesplazamiento,
  observaciones?: string,
): Promise<{ error?: string }> {
  try {
    await apiPatch(`/api/desplazamientos/${id}/estado`, { estado, observaciones });
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Error al cambiar estado' };
  }
  revalidatePath(`/desplazamientos/${id}`);
  return {};
}
