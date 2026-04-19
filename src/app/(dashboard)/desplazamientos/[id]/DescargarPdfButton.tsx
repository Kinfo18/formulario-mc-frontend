'use client';

interface Props {
  id: string;
}

export function DescargarPdfButton({ id }: Props) {
  return (
    <a
      href={`/api/pdf/${id}`}
      className="text-xs px-3 py-1.5 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
    >
      Descargar PDF
    </a>
  );
}
