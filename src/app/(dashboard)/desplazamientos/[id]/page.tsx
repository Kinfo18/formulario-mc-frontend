import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiGet } from '@/lib/api-server';
import { getSessionUser } from '@/lib/session';
import type { EstadoDesplazamiento, TipoVehiculo } from '@/types/desplazamiento';
import { DescargarPdfButton } from './DescargarPdfButton';
import { CambiarEstadoButtons } from './CambiarEstadoButtons';

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

const VEHICULO_LABEL: Record<TipoVehiculo, string> = {
  CARGA_PESADA: 'Carga pesada',
  TRANSPORTE_PERSONAL: 'Transporte de personal',
  MOTO: 'Moto',
  TRANSPORTE_PUBLICO: 'Transporte público',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DesplazamientoDetalle = Record<string, any>;

export default async function DesplazamientoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, desp] = await Promise.all([
    getSessionUser(),
    apiGet<DesplazamientoDetalle>(`/api/desplazamientos/${id}`).catch(() => null),
  ]);

  if (!desp) notFound();

  const esOps = user?.rol === 'ADMIN' || user?.rol === 'OPERACIONES';
  const esPropietario = desp.conductor?.id === user?.id;

  const puedeEditar =
    desp.estado === 'BORRADOR' && (esOps || esPropietario);

  const puedeDescargarPdf = esOps || esPropietario;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/desplazamientos" className="text-xs text-neutral-400 hover:text-neutral-600">
              ← Desplazamientos
            </Link>
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900 font-mono">{desp.codigo}</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{desp.ruta?.nombre}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${ESTADO_COLOR[desp.estado as EstadoDesplazamiento]}`}>
            {ESTADO_LABEL[desp.estado as EstadoDesplazamiento]}
          </span>
          {puedeEditar && (
            <Link
              href={`/desplazamientos/${id}/editar`}
              className="text-xs px-3 py-1.5 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Editar
            </Link>
          )}
          {puedeDescargarPdf && <DescargarPdfButton id={id} />}
          {user?.rol && (
            <CambiarEstadoButtons
              id={id}
              estado={desp.estado as EstadoDesplazamiento}
              rol={user.rol as 'ADMIN' | 'OPERACIONES' | 'CONDUCTOR'}
              esPropietario={esPropietario}
            />
          )}
        </div>
      </div>

      {/* Banner de rechazo */}
      {desp.estado === 'RECHAZADO' && desp.observaciones && (
        <div className="flex gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
          <span className="shrink-0">✕</span>
          <div>
            <p className="font-medium mb-0.5">Desplazamiento rechazado</p>
            <p className="text-red-700">{desp.observaciones}</p>
          </div>
        </div>
      )}

      {/* Sección 1: Datos generales */}
      <Card title="1. Datos generales">
        <Grid>
          <Info label="Motivo" value={desp.motivoDesplazamiento} span={2} />
          <Info label="Conductor" value={desp.conductor?.nombre} />
          <Info label="Tipo de vehículo" value={VEHICULO_LABEL[desp.tipoVehiculo as TipoVehiculo]} />
          <Info label="Ruta principal" value={desp.rutaPrincipalNombre} />
          <Info label="Tiempo de traslado" value={desp.tiempoTraslado} />
          <Info label="Hora salida" value={desp.horaSalida} />
          <Info label="Hora llegada" value={desp.horaLlegada} />
          <Info label="Recorrido (km)" value={desp.recorridoKms?.toString()} />
          <Info label="Antelación" value={desp.tiempoAntelacion} />
          {desp.rutaAlternaNombre && <Info label="Ruta alterna" value={desp.rutaAlternaNombre} />}
          {desp.novedades && <Info label="Novedades" value={desp.novedades} span={2} />}
          <Info label="Preoperacional" value={desp.preoperacionalRealizado ? 'Sí' : 'No'} />
          <Info label="Documentación" value={desp.documentacionVerificada ? 'Verificada' : 'Pendiente'} />
          {desp.transportaProducto && <Info label="Producto" value={desp.cualProducto ?? '—'} />}
        </Grid>
      </Card>

      {/* Sección 2: Ruta principal */}
      <Card title="2. Ruta principal">
        <Grid>
          <Info label="KM pavimentados" value={desp.kmsPavimentados?.toString() ?? '—'} />
          <Info label="KM destapados" value={desp.kmsDestapados?.toString() ?? '—'} />
          <Info label="KM totales" value={desp.kmsTotales?.toString() ?? '—'} />
          <Info label="Municipios" value={desp.municipiosAtravesados ?? '—'} span={2} />
        </Grid>
      </Card>

      {/* Sección 5: Límites de velocidad */}
      {desp.limitesVelocidad?.length > 0 && (
        <Card title="5. Límites de velocidad">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-2 pr-4 font-medium text-neutral-500">Zona</th>
                  {desp.ruta?.varianteLimiteVelocidad === 'UNICA' ? (
                    <th className="text-left py-2 pr-4 font-medium text-neutral-500">KM permitido</th>
                  ) : (
                    <>
                      <th className="text-left py-2 pr-4 font-medium text-neutral-500">Cargado</th>
                      <th className="text-left py-2 pr-4 font-medium text-neutral-500">Descargado</th>
                    </>
                  )}
                  <th className="text-left py-2 font-medium text-neutral-500">Requisito</th>
                </tr>
              </thead>
              <tbody>
                {desp.limitesVelocidad.map((l: DesplazamientoDetalle) => (
                  <tr key={l.id} className="border-b border-neutral-100 last:border-0">
                    <td className="py-2 pr-4">{l.zona}</td>
                    {desp.ruta?.varianteLimiteVelocidad === 'UNICA' ? (
                      <td className="py-2 pr-4">{l.kmPermitido ?? '—'}</td>
                    ) : (
                      <>
                        <td className="py-2 pr-4">{l.velocidadCargado ?? '—'}</td>
                        <td className="py-2 pr-4">{l.velocidadDescargado ?? '—'}</td>
                      </>
                    )}
                    <td className="py-2 text-neutral-500 text-xs">{l.requisito ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Secciones de tablas */}
      {desp.puestosControl?.length > 0 && (
        <Card title="7. Puestos de control">
          <SimpleTable
            headers={['KM', 'Nombre', 'Municipio']}
            rows={desp.puestosControl.map((p: DesplazamientoDetalle) => [p.km?.toString() ?? '—', p.nombre, p.municipio ?? '—'])}
          />
        </Card>
      )}

      {desp.contactosEmergencia?.length > 0 && (
        <Card title="11. Directorio de emergencias">
          <SimpleTable
            headers={['Entidad', 'Área', 'Teléfono']}
            rows={desp.contactosEmergencia.map((c: DesplazamientoDetalle) => [c.entidad, c.area ?? '—', c.telefono])}
          />
        </Card>
      )}

      {/* Fecha */}
      <p className="text-xs text-neutral-400 text-right">
        Creado: {new Date(desp.createdAt).toLocaleString('es-CO')}
      </p>
    </div>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">{children}</div>;
}

function Info({ label, value, span }: { label: string; value: string | undefined; span?: number }) {
  return (
    <div className={span === 2 ? 'col-span-2' : ''}>
      <p className="text-xs font-medium text-neutral-500 mb-0.5">{label}</p>
      <p className="text-sm text-neutral-800">{value ?? '—'}</p>
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
              <th key={h} className="text-left py-2 pr-4 font-medium text-neutral-500">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-neutral-100 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-4 text-neutral-700">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
