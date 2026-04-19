// Enums — deben coincidir con backend/src/generated/prisma/enums.ts
export type ZonaVelocidad =
  | 'LOCACIONES'
  | 'VIA_DESTAPADA'
  | 'VIA_PAVIMENTADA'
  | 'AREAS_URBANAS'
  | 'ZONA_ESCOLAR'
  | 'DESCENSOS_PELIGROSOS'
  | 'OTRO_REQUISITOS_CLIENTE';

export type EstadoDesplazamiento =
  | 'BORRADOR'
  | 'EN_REVISION'
  | 'APROBADO'
  | 'RECHAZADO'
  | 'ARCHIVADO';

export type TipoVehiculo =
  | 'CARGA_PESADA'
  | 'TRANSPORTE_PERSONAL'
  | 'MOTO'
  | 'TRANSPORTE_PUBLICO';

export type VarianteLimiteVelocidad = 'UNICA' | 'DUAL';

// Plantillas de ruta
export interface RutaResumen {
  id: string;
  nombre: string;
  descripcion: string | null;
  varianteLimiteVelocidad: VarianteLimiteVelocidad;
  activa: boolean;
  kmsPavimentados: number | null;
  kmsDestapados: number | null;
}

export interface LimiteVelocidad {
  id: string;
  zona: ZonaVelocidad;
  kmPermitido: number | null;
  velocidadCargado: number | null;
  velocidadDescargado: number | null;
  requisito: string | null;
}

export interface RutaBloqueada {
  id: string;
  descripcion: string;
  orden: number;
}

export interface SitioPernocte {
  id: string;
  km: number | null;
  nombre: string;
  municipio: string | null;
  servicios: string | null;
  orden: number;
}

export interface PuestoControl {
  id: string;
  km: number | null;
  nombre: string;
  municipio: string | null;
  servicios: string | null;
  orden: number;
}

export interface PuntoCritico {
  id: string;
  kmDesde: number | null;
  kmHasta: number | null;
  sentido: string | null;
  descripcion: string;
  orden: number;
}

export interface PuntoApoyo {
  id: string;
  entidad: string;
  ubicacion: string | null;
  telefono: string | null;
  equiposDisponibles: string | null;
  pd: string | null;
  responsable: string | null;
  orden: number;
}

export interface ContactoEmergencia {
  id: string;
  entidad: string;
  area: string | null;
  telefono: string;
  orden: number;
}

export interface EstacionServicio {
  id: string;
  entidad: string;
  area: string | null;
  telefono: string | null;
  orden: number;
}

export interface RutaCompleta extends RutaResumen {
  planoRutaUrl: string | null;
  municipiosAtravesados: string | null;
  rutaAlternaDescripcion: string | null;
  recViasDestapadas: string | null;
  recZonasUrbanas: string | null;
  recCurvasPeligrosas: string | null;
  recIntersecciones: string | null;
  recPuentesFuenteHidrica: string | null;
  recTramosRectos: string | null;
  puntosCriticosSeguridad: string | null;
  rutasBloqueadas: RutaBloqueada[];
  limitesVelocidad: LimiteVelocidad[];
  sitiosPernocte: SitioPernocte[];
  puestosControl: PuestoControl[];
  puntosCriticos: PuntoCritico[];
  puntosApoyo: PuntoApoyo[];
  contactosEmergencia: ContactoEmergencia[];
  estacionesServicio: EstacionServicio[];
}

// Desplazamientos
export interface DesplazamientoResumen {
  id: string;
  codigo: string;
  estado: EstadoDesplazamiento;
  horaSalida: string;
  horaLlegada: string;
  motivoDesplazamiento: string;
  tipoVehiculo: TipoVehiculo;
  createdAt: string;
  ruta: { id: string; nombre: string };
  conductor: { id: string; nombre: string; email: string };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DesplazamientosResponse {
  data: DesplazamientoResumen[];
  meta: PaginationMeta;
}

// Formulario de creación — Sección 1 (campos que llena el conductor)
export interface CrearDesplazamientoInput {
  rutaId: string;
  motivoDesplazamiento: string;
  tiempoAntelacion: string;
  rutaPrincipalNombre: string;
  tiempoTraslado: string;
  recorridoKms: number;
  rutaAlternaNombre?: string;
  tiempoTrasladoAlterno?: string;
  horaSalida: string;
  horaLlegada: string;
  novedades?: string;
  preoperacionalRealizado: boolean;
  documentacionVerificada: boolean;
  tipoVehiculo: TipoVehiculo;
  transportaProducto: boolean;
  cualProducto?: string;
}

export interface DesplazamientoCompleto {
  id: string;
  codigo: string;
  estado: EstadoDesplazamiento;
  tipoVehiculo: TipoVehiculo;
  motivoDesplazamiento: string;
  tiempoAntelacion: string;
  rutaPrincipalNombre: string;
  tiempoTraslado: string;
  recorridoKms: number;
  rutaAlternaNombre: string | null;
  tiempoTrasladoAlterno: string | null;
  horaSalida: string;
  horaLlegada: string;
  novedades: string | null;
  preoperacionalRealizado: boolean;
  documentacionVerificada: boolean;
  transportaProducto: boolean;
  cualProducto: string | null;
  observaciones: string | null;
  kmsPavimentados: number | null;
  kmsDestapados: number | null;
  kmsTotales: number | null;
  municipiosAtravesados: string | null;
  rutasAlternasDescripcion: string | null;
  recViasDestapadas: string | null;
  recZonasUrbanas: string | null;
  recCurvasPeligrosas: string | null;
  recIntersecciones: string | null;
  recPuentesFuenteHidrica: string | null;
  recTramosRectos: string | null;
  puntosCriticosSeguridad: string | null;
  planoRutaUrl: string | null;
  createdAt: string;
  updatedAt: string;
  ruta: { id: string; nombre: string; varianteLimiteVelocidad: VarianteLimiteVelocidad };
  conductor: { id: string; nombre: string; email: string };
  rutasBloqueadas: RutaBloqueada[];
  limitesVelocidad: LimiteVelocidad[];
  sitiosPernocte: SitioPernocte[];
  puestosControl: PuestoControl[];
  puntosCriticos: PuntoCritico[];
  puntosApoyo: PuntoApoyo[];
  contactosEmergencia: ContactoEmergencia[];
  estacionesServicio: EstacionServicio[];
}

export interface Firma {
  rol: 'CONDUCTOR' | 'OPERACIONES';
  dataUrl: string;
}

export interface CrearDesplazamientoResult {
  id: string;
  codigo: string;
  estado: EstadoDesplazamiento;
  createdAt: string;
}
