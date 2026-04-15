# Relevamiento: Planificación de Desplazamientos Laborales 2026

**Formato:** FOR-SSTA-218 | **Versión:** 01 | **Fecha:** 27/12/2022  
**Fuente:** `Planificacion de desplazamientos laborales 2026.xlsx`  
**Relevamiento realizado:** 2026-04-15

---

## 1. Rutas identificadas (6 hojas)

| # | Nombre hoja Excel | Nombre completo de la ruta |
|---|-------------------|---------------------------|
| 1 | `DSPLAZAMIENTO BLOQUE CUBIRO LL` | San Luis de Palenque → Bloque Cubiro → Bloque Llanos 30 |
| 2 | `DSPLAZAMIENTO SARDINAS` | San Luis de Palenque → Estación Sardinas → Paravare → Jordan |
| 3 | `DSPLAZAMIENTOS BARQ-MARACAS.CRA` | San Luis de Palenque → Estación Barqueréña → Locación Maracas |
| 4 | `DSPLAZAMIENTOS LABORALES SLP-TR` | San Luis de Palenque → Trinidad (Pavimento 10 km) |
| 5 | `DSPLAZAMIENTO LUCERO-JORO-ZA` | San Luis de Palenque → Lucero → Joropera → Zaranda |
| 6 | `DSPLAZAMIENTOS LABORALES SLP-Y` | San Luis de Palenque → Yopal (Pavimento 101 km) |

> **Punto de origen común:** San Luis de Palenque (SLP) en todos los casos.

---

## 2. Estructura común: 14 secciones

Todas las rutas comparten exactamente las mismas 14 secciones en el mismo orden:

| Sección | Título | Tipo de dato |
|---------|--------|-------------|
| 1 | **Datos Generales** | Campos de texto/checkbox |
| 2 | **Ruta Principal** | Texto + kilómetros |
| 3 | **Rutas Alternas** | Texto libre |
| 4 | **Rutas Bloqueadas/Restringidas** | Texto libre |
| 5 | **Límites de Velocidad** | Tabla con variación por ruta ⚠️ |
| 6 | **Sitios Autorizados para Detenerse y Pernoctar** | Tabla: Km / Nombre / Municipio / Servicios |
| 7 | **Puestos de Control** | Tabla: Km / Nombre / Municipio / Servicios |
| 8 | **Puntos Críticos de la Ruta** | Tabla: Km (Desde/Hasta) / Sentido / Descripción |
| 9 | **Recomendaciones** | Texto por tipo de vía (6 categorías fijas) |
| 10 | **Puntos de Apoyo para Atención de Emergencias** | Tabla: Entidad / Ubicación / Teléfono / Equipos / P-D / Responsable |
| 11 | **Directorio Telefónico en Caso de Emergencia** | Tabla doble: Bomberos + Cruz Roja (Entidad / Área / Teléfono) |
| 12 | **Estaciones de Servicio y Talleres Autorizados** | Tabla doble (misma estructura que Sección 11) |
| 13 | **Puntos Críticos de Seguridad** (presencia grupos al margen) | Texto libre |
| 14 | **Planos de la Ruta** | Imagen embebida |

---

## 3. Detalle campos por sección

### Sección 1 — Datos Generales

| Campo | Tipo | Notas |
|-------|------|-------|
| Motivo del desplazamiento | texto | libre |
| Tiempo de antelación del desplazamiento | texto | libre |
| Ruta Principal | texto | nombre de la ruta |
| Tiempo de Traslado | texto | duración estimada |
| Recorrido Kms | número | kilómetros totales |
| Ruta Alterna | texto | nombre |
| Tiempo de Traslado (alterna) | texto | |
| Hora de salida | hora | |
| Hora de llegada | hora | |
| Novedades del desplazamiento | textarea | |
| Se realizó preoperacional al vehículo | checkbox (Sí/No) | |
| Se verificó documentación del vehículo y conductor | checkbox (Sí/No) | |
| Tipo de vehículo | radio (4 opciones) | Vehículo de Carga Pesada / Transporte de Personal / Moto / Transp. Público |
| Transporta algún producto | checkbox Sí/No + campo "Cuál" | |

### Sección 2 — Ruta Principal

| Campo | Tipo |
|-------|------|
| Kms Pavimentados | número |
| Kms Destapados | número |
| Kms Totales | número (calculado) |
| Municipios, veredas o caseríos que atraviesa | textarea |

### Sección 3 — Rutas Alternas
- Texto libre (descripción de rutas alternativas disponibles)

### Sección 4 — Rutas Bloqueadas/Restringidas
- Texto libre (zonas o tramos con restricción de paso)

### Sección 5 — Límites de Velocidad ⚠️ VARIACIÓN POR RUTA

> Esta es la única sección con diferencia estructural entre rutas.

**Zonas comunes a todas las rutas:**
- Locaciones
- Vía Destapada
- Vía Pavimentada
- Áreas Urbanas
- Zona Escolar
- Descensos Peligrosos
- Otro: Requisitos del cliente

**Variante A — Ruta 1 (Bloque Cubiro):**
| Descripción de la Zona | KM PERMITIDO | Requisito |
|------------------------|--------------|-----------|
| (velocidad única, sin diferenciar cargado/descargado) |

**Variante B — Rutas 2, 3, 4, 5 y 6 (todas las demás):**
| Descripción de la Zona | CARGADO | DESCARGADO | Requisito |
|------------------------|---------|------------|-----------|
| (velocidades diferenciadas según estado de carga del vehículo) |

### Sección 6 — Sitios Autorizados para Detenerse y Pernoctar

| Campo | Tipo |
|-------|------|
| Km | número |
| Nombre | texto |
| Municipio | texto |
| Servicios | texto |

_(Tabla con múltiples filas — aproximadamente 3 filas por ruta)_

### Sección 7 — Puestos de Control

Misma estructura que Sección 6: `Km / Nombre / Municipio / Servicios`  
_(~4 filas por ruta)_

### Sección 8 — Puntos Críticos de la Ruta

| Campo | Tipo |
|-------|------|
| Km Desde | número |
| Km Hasta | número |
| Sentido | texto |
| Descripción | textarea |

_(~4 filas por ruta)_

### Sección 9 — Recomendaciones

6 categorías fijas con texto libre:
1. En vías destapadas
2. En zonas urbanas
3. En curvas peligrosas, pronunciadas y sucesivas
4. En intersecciones y cruces
5. En puentes con paso de fuente hídrica
6. Tramos rectos en vía pavimentada

### Sección 10 — Puntos de Apoyo para Atención de Emergencias

| Campo | Tipo |
|-------|------|
| Entidad | texto |
| Ubicación | texto |
| Teléfono | texto |
| Equipos Disponibles | texto |
| P - D | texto (¿Propio/Disponible?) |
| Responsable / Persona de Contacto | texto |

_(~3 filas por ruta)_

### Sección 11 — Directorio Telefónico en Caso de Emergencia

Tabla doble (2 columnas de registros):
- **Bomberos** (filas: ~3)
- **Cruz Roja Colombiana** (filas: ~3)

Campos por registro: `Entidad / Área / Teléfono`

### Sección 12 — Estaciones de Servicio y Talleres Autorizados

Misma estructura de tabla doble que Sección 11.  
_(~3 filas por columna)_

### Sección 13 — Puntos Críticos de Seguridad

Texto libre. Documenta presencia de grupos al margen de la ley u otros riesgos de seguridad en la ruta.

### Sección 14 — Planos de la Ruta

- Imagen embebida en la celda (mapa de la ruta)
- Pie de imagen con nombre completo de la ruta
- **Implementación:** upload a Supabase Storage → URL pública embebida en el PDF

---

## 4. Campos de firma (pie de formulario)

| Campo | Tipo |
|-------|------|
| Firma Conductor | firma digital (canvas) |
| Firma Operaciones | firma digital (canvas) |

---

## 5. Encabezado común (todas las rutas)

```
Sistema de Gestión de Seguridad Salud en el Trabajo y Ambiente - PESV
FOR-SSTA - 218
Versión: 01
Fecha: 27/12/2022
PLANIFICACIÓN DE DESPLAZAMIENTOS LABORALES
```

---

## 6. Resumen de campos por tipo

| Tipo | Cantidad estimada |
|------|------------------|
| Texto corto (input) | ~12 |
| Textarea | ~10 |
| Número | ~5 |
| Hora | 2 |
| Checkbox / radio | ~5 |
| Tablas con filas dinámicas | 7 tablas |
| Firma digital | 2 |
| Imagen (plano de ruta) | 1 por ruta |

---

## 7. Claves de diseño para la implementación

1. **Un formulario base** con 14 secciones sirve para las 6 rutas.
2. **Sección 5 es la única variable:** al seleccionar la ruta, el esquema de velocidades cambia entre "KM Permitido único" (Ruta 1) o "Cargado/Descargado" (Rutas 2-6).
3. **Tablas con filas dinámicas** en secciones 6, 7, 8, 10, 11 y 12 — el conductor puede agregar/quitar filas.
4. **Sección 14 (Planos)** es solo de lectura — cargada desde la plantilla de ruta, no editable por el conductor.
5. **Firmas** al final del documento, fuera de las 14 secciones numeradas.
6. **El formulario es idéntico** en estructura entre rutas; solo cambia el contenido pre-cargado desde `RutaPlantilla` en BD.
