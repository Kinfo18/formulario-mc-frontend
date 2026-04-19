import { apiGet } from '@/lib/api-server';
import type { RutaResumen } from '@/types/desplazamiento';
import NuevoDesplazamientoForm from './NuevoDesplazamientoForm';

export default async function NuevoDesplazamientoPage() {
  let rutas: RutaResumen[] = [];
  try {
    rutas = await apiGet<RutaResumen[]>('/api/rutas');
  } catch {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
        Error al cargar las rutas disponibles. Intente nuevamente.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Nuevo desplazamiento</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Diligencia los datos del desplazamiento. Los demás campos se completarán automáticamente según la ruta elegida.
        </p>
      </div>
      <NuevoDesplazamientoForm rutas={rutas} />
    </div>
  );
}
