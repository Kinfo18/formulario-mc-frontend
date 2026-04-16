# Definición del Formulario Base y Campos Variables por Ruta

**Basado en:** `docs/relevamiento-rutas.md`  
**Fecha:** 2026-04-15

---

## 1. Principio general

El formulario `FOR-SSTA-218` tiene **14 secciones idénticas** para las 6 rutas.  
La única variación estructural está en la **Sección 5 (Límites de Velocidad)**.  
El resto del contenido variable (nombres de sitios, puntos de control, etc.) proviene de la `RutaPlantilla` cargada desde la BD — no cambia la estructura del formulario.

---

## 2. Campos comunes (idénticos en todas las rutas)

### Sección 1 — Datos Generales

```typescript
type DatosGenerales = {
  motivoDesplazamiento: string                          // texto libre
  tiempoAntelacion: string                              // texto libre
  rutaPrincipalNombre: string                           // nombre de la ruta
  tiempoTraslado: string                                // ej: "2h 30min"
  recorridoKms: number                                  // km totales
  rutaAlternaNombre: string                             // texto libre
  tiempoTrasladoAlterno: string                         // texto libre
  horaSalida: string                                    // HH:mm
  horaLlegada: string                                   // HH:mm
  novedades: string                                     // textarea
  preoperacionalRealizado: boolean
  documentacionVerificada: boolean
  tipoVehiculo: 'carga_pesada' | 'transporte_personal' | 'moto' | 'transporte_publico'
  transportaProducto: boolean
  cualProducto: string | null                           // requerido si transportaProducto === true
}
```

### Sección 2 — Ruta Principal

```typescript
type RutaPrincipal = {
  kmsPavimentados: number
  kmsDestapados: number
  kmsTotales: number                                    // calculado: pavimentados + destapados
  municipiosAtravesados: string                         // textarea
}
```

### Sección 3 — Rutas Alternas

```typescript
type RutasAlternas = {
  descripcion: string                                   // textarea libre
}
```

### Sección 4 — Rutas Bloqueadas/Restringidas

```typescript
type RutasBloqueadas = {
  descripcion: string                                   // textarea libre
}
```

### Sección 6 — Sitios Autorizados para Detenerse y Pernoctar

```typescript
type SitioPernocte = {
  km: number
  nombre: string
  municipio: string
  servicios: string
}
// Array dinámico: SitioPernocte[] (mínimo 0, sin máximo fijo)
```

### Sección 7 — Puestos de Control

```typescript
type PuestoControl = {
  km: number
  nombre: string
  municipio: string
  servicios: string
}
// Array dinámico: PuestoControl[]
```

### Sección 8 — Puntos Críticos de la Ruta

```typescript
type PuntoCritico = {
  kmDesde: number
  kmHasta: number
  sentido: string                                       // ej: "Ida", "Vuelta", "Ambos"
  descripcion: string
}
// Array dinámico: PuntoCritico[]
```

### Sección 9 — Recomendaciones

```typescript
type Recomendaciones = {
  viasDestapadas: string
  zonasUrbanas: string
  curvasPeligrosas: string
  interseccionesYCruces: string
  puentesFuenteHidrica: string
  tramosRectosPavimentados: string
}
// 6 campos fijos de textarea — pre-cargados desde RutaPlantilla
```

### Sección 10 — Puntos de Apoyo para Atención de Emergencias

```typescript
type PuntoApoyo = {
  entidad: string
  ubicacion: string
  telefono: string
  equiposDisponibles: string
  pd: string                                            // "P" = Propio, "D" = Disponible
  responsable: string
}
// Array dinámico: PuntoApoyo[]
```

### Sección 11 — Directorio Telefónico en Caso de Emergencia

```typescript
type ContactoEmergencia = {
  entidad: string                                       // "BOMBEROS" | "CRUZ ROJA" | otro
  area: string
  telefono: string
}
// Array dinámico: ContactoEmergencia[]
// Pre-cargado desde RutaPlantilla con Bomberos y Cruz Roja
```

### Sección 12 — Estaciones de Servicio y Talleres Autorizados

```typescript
type EstacionServicio = {
  entidad: string
  area: string
  telefono: string
}
// Array dinámico: EstacionServicio[]
// Pre-cargado desde RutaPlantilla
```

### Sección 13 — Puntos Críticos de Seguridad

```typescript
type PuntosCriticosSeguridad = {
  descripcion: string                                   // textarea libre
}
// Pre-cargado desde RutaPlantilla
```

### Sección 14 — Planos de la Ruta

```typescript
type PlanosRuta = {
  imagenUrl: string                                     // URL desde Supabase Storage
  // Solo lectura: pre-cargado desde RutaPlantilla, no editable por conductor
}
```

### Firmas (fuera de las 14 secciones)

```typescript
type Firmas = {
  firmaCondutor: string                                 // data URL (canvas signature_pad)
  firmaOperaciones: string                              // data URL (canvas signature_pad)
}
```

---

## 3. Campo variable: Sección 5 según ruta

```typescript
// Variante A — Solo Ruta: Bloque Cubiro / Llanos 30
type LimiteVelocidadUnico = {
  zona: ZonaVelocidad
  kmPermitido: number | null
  requisito: string | null
}

// Variante B — Rutas: Sardinas, Barqueréña, SLP-Trinidad, Lucero, SLP-Yopal
type LimiteVelocidadDual = {
  zona: ZonaVelocidad
  velocidadCargado: number | null
  velocidadDescargado: number | null
  requisito: string | null
}

type ZonaVelocidad =
  | 'locaciones'
  | 'via_destapada'
  | 'via_pavimentada'
  | 'areas_urbanas'
  | 'zona_escolar'
  | 'descensos_peligrosos'
  | 'otro_requisitos_cliente'

type VarianteLimiteVelocidad = 'unica' | 'dual'
```

### Hook condicional por ruta

```typescript
// src/hooks/useRutaSchema.ts
function useRutaSchema(rutaId: string): {
  varianteLimiteVelocidad: VarianteLimiteVelocidad
  schema: ZodSchema
}
```

---

## 4. Tipo completo del formulario

```typescript
type FormularioDesplazamiento = {
  // Metadatos
  rutaId: string
  conductorId: string

  // Secciones comunes
  datosGenerales: DatosGenerales
  rutaPrincipal: RutaPrincipal
  rutasAlternas: RutasAlternas
  rutasBloqueadas: RutasBloqueadas
  sitiosPernocte: SitioPernocte[]
  puestosControl: PuestoControl[]
  puntosCriticos: PuntoCritico[]
  recomendaciones: Recomendaciones
  puntosApoyo: PuntoApoyo[]
  contactosEmergencia: ContactoEmergencia[]
  estacionesServicio: EstacionServicio[]
  puntosCriticosSeguridad: PuntosCriticosSeguridad
  planosRuta: PlanosRuta

  // Sección variable (determinada por rutaId)
  limitesVelocidad: LimiteVelocidadUnico[] | LimiteVelocidadDual[]

  // Firmas
  firmas: Firmas
}
```

---

## 5. Campos pre-cargados vs editables

| Sección | Fuente | ¿Editable por conductor? |
|---------|--------|--------------------------|
| 1 — Datos Generales | Usuario (nuevo cada vez) | ✅ Sí |
| 2 — Ruta Principal | RutaPlantilla (referencia) | ✅ Sí (puede ajustar km) |
| 3 — Rutas Alternas | RutaPlantilla | ✅ Sí (puede modificar) |
| 4 — Rutas Bloqueadas | RutaPlantilla | ✅ Sí (puede agregar) |
| 5 — Límites Velocidad | RutaPlantilla | ✅ Sí (ingresa valores) |
| 6 — Sitios Pernocte | RutaPlantilla | ✅ Sí |
| 7 — Puestos Control | RutaPlantilla | ✅ Sí |
| 8 — Puntos Críticos | RutaPlantilla | ✅ Sí |
| 9 — Recomendaciones | RutaPlantilla | ⚠️ Solo lectura (texto fijo) |
| 10 — Puntos Apoyo | RutaPlantilla | ✅ Sí |
| 11 — Directorio Tel. | RutaPlantilla | ✅ Sí |
| 12 — Estaciones | RutaPlantilla | ✅ Sí |
| 13 — Puntos Seg. | RutaPlantilla | ⚠️ Solo lectura |
| 14 — Planos | RutaPlantilla (imagen) | ❌ No editable |
| Firmas | Usuario | ✅ Sí (canvas) |

---

## 6. Esquema de componentes React

```
src/components/forms/
├── DesplazamientoForm.tsx          # Orquestador principal (14 secciones + firmas)
├── secciones/
│   ├── SeccionDatosGenerales.tsx
│   ├── SeccionRutaPrincipal.tsx
│   ├── SeccionRutasAlternas.tsx
│   ├── SeccionRutasBloqueadas.tsx
│   ├── SeccionLimitesVelocidadUnica.tsx   # Variante A
│   ├── SeccionLimitesVelocidadDual.tsx    # Variante B
│   ├── SeccionSitiosPernocte.tsx
│   ├── SeccionPuestosControl.tsx
│   ├── SeccionPuntosCriticos.tsx
│   ├── SeccionRecomendaciones.tsx
│   ├── SeccionPuntosApoyo.tsx
│   ├── SeccionDirectorioEmergencia.tsx
│   ├── SeccionEstacionesServicio.tsx
│   ├── SeccionPuntosSeguridadCritica.tsx
│   └── SeccionPlanosRuta.tsx
└── shared/
    ├── TablaFilasDinamicas.tsx            # Tabla con add/remove fila genérica
    └── FirmaCanvas.tsx                    # signature_pad wrapper
```

---

## 7. Validaciones Zod clave

```typescript
// Condicional: transportaProducto requiere cualProducto
datosGenerales: z.object({
  transportaProducto: z.boolean(),
  cualProducto: z.string().nullable(),
}).refine(
  (d) => !d.transportaProducto || (d.cualProducto && d.cualProducto.trim().length > 0),
  { message: 'Especifique el producto transportado', path: ['cualProducto'] }
)

// Condicional: variante unica requiere kmPermitido
limitesVelocidad_unica: z.array(z.object({
  zona: z.enum([...zonas]),
  kmPermitido: z.number({ required_error: 'Requerido' }).positive(),
  requisito: z.string().nullable(),
}))

// Condicional: variante dual requiere cargado Y descargado
limitesVelocidad_dual: z.array(z.object({
  zona: z.enum([...zonas]),
  velocidadCargado: z.number({ required_error: 'Requerido' }).positive(),
  velocidadDescargado: z.number({ required_error: 'Requerido' }).positive(),
  requisito: z.string().nullable(),
}))
```
