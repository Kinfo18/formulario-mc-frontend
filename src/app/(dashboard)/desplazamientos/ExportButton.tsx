'use client';

interface SearchParams {
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  tipoVehiculo?: string;
  conductorId?: string;
  rutaId?: string;
  q?: string;
}

interface Props {
  searchParams: SearchParams;
}

export function ExportButton({ searchParams }: Props) {
  const handleExport = () => {
    const qs = new URLSearchParams();
    if (searchParams.estado) qs.set('estado', searchParams.estado);
    if (searchParams.fechaDesde) qs.set('fechaDesde', searchParams.fechaDesde);
    if (searchParams.fechaHasta) qs.set('fechaHasta', searchParams.fechaHasta);
    if (searchParams.tipoVehiculo) qs.set('tipoVehiculo', searchParams.tipoVehiculo);
    if (searchParams.conductorId) qs.set('conductorId', searchParams.conductorId);
    if (searchParams.rutaId) qs.set('rutaId', searchParams.rutaId);
    if (searchParams.q) qs.set('q', searchParams.q);

    const url = `/api/desplazamientos/export${qs.toString() ? `?${qs.toString()}` : ''}`;
    window.open(url, '_blank', 'noopener');
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-colors"
      title="Exportar a CSV"
    >
      ↓ Exportar CSV
    </button>
  );
}
