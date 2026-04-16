# Wireframes y Flujo de Usuario

**Fecha:** 2026-04-15  
**Formato:** Diagramas Mermaid + descripción de pantallas

---

## 1. Flujo de usuario por rol

```mermaid
flowchart TD
    A([Inicio]) --> B[/login\]
    B --> C{Rol}

    C -->|CONDUCTOR| D[Dashboard Conductor]
    C -->|OPERACIONES| E[Dashboard Operaciones]
    C -->|ADMIN| F[Dashboard Admin]

    D --> D1[Mis Desplazamientos]
    D --> D2[Nuevo Desplazamiento]
    D2 --> D3[Formulario 14 secciones]
    D3 --> D4[Firma Canvas]
    D4 --> D5[Enviar a Revisión]
    D1 --> D6[Ver / Editar borrador]
    D1 --> D7[Descargar PDF propio]

    E --> E1[Todos los Desplazamientos]
    E --> E2[Gestión de Rutas]
    E1 --> E3[Revisar desplazamiento]
    E3 --> E4{Decisión}
    E4 -->|Aprobar| E5[Firmar Operaciones]
    E4 -->|Rechazar| E6[Enviar observación]
    E5 --> E7[PDF generado]
    E7 --> E8[Descargar / Enviar correo]
    E2 --> E9[CRUD plantillas de ruta]

    F --> F1[Panel Usuarios]
    F --> F2[Todos los Desplazamientos]
    F --> F3[Gestión de Rutas]
    F1 --> F4[Crear / Editar / Desactivar usuarios]
    F2 --> F5[Ver / Editar / Archivar cualquier desplazamiento]
```

---

## 2. Flujo detallado: Crear desplazamiento (Conductor)

```mermaid
sequenceDiagram
    actor C as Conductor
    participant UI as Frontend
    participant API as Backend API
    participant DB as PostgreSQL
    participant S3 as Supabase Storage

    C->>UI: Clic "Nuevo Desplazamiento"
    UI->>API: GET /api/rutas
    API->>DB: SELECT rutas activas
    DB-->>API: [lista de rutas]
    API-->>UI: rutas[]
    UI->>C: Mostrar selector de ruta

    C->>UI: Selecciona ruta
    UI->>API: GET /api/rutas/:id
    API->>DB: SELECT plantilla con datos precargados
    DB-->>API: plantilla completa
    API-->>UI: plantilla (secciones 2-14 pre-cargadas)
    UI->>C: Formulario con datos precargados

    C->>UI: Completa Sección 1 (Datos Generales)
    C->>UI: Revisa/ajusta secciones 2-13
    C->>UI: Dibuja firma en canvas
    UI->>API: POST /api/desplazamientos (estado: BORRADOR)
    API->>DB: INSERT desplazamiento
    DB-->>API: desplazamiento.id
    API-->>UI: { success: true, id }

    C->>UI: Clic "Enviar a Revisión"
    UI->>API: PUT /api/desplazamientos/:id (estado: EN_REVISION)
    API->>DB: UPDATE estado
    DB-->>API: ok
    API-->>UI: { success: true }
    UI->>C: "Enviado. En espera de aprobación."
```

---

## 3. Pantallas y layout

### 3.1 Login (`/login`)

```
┌──────────────────────────────────────┐
│  [Logo MECAT / empresa]              │
│                                      │
│  Planificación de Desplazamientos    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  Correo electrónico          │    │
│  └──────────────────────────────┘    │
│  ┌──────────────────────────────┐    │
│  │  Contraseña              👁  │    │
│  └──────────────────────────────┘    │
│                                      │
│  [ Ingresar ]                        │
│                                      │
│  ¿Olvidaste tu contraseña?           │
└──────────────────────────────────────┘
```

---

### 3.2 Dashboard (`/dashboard`)

```
┌─────────────────────────────────────────────────────────┐
│ [≡] Planif. Desplazamientos    [👤 Nombre] [Cerrar sesión]│
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ Inicio   │  Resumen                                     │
│          │  ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│ Desplaz. │  │ Borradores│ │En revisión│ │Aprobados │     │
│          │  │    3      │ │    1      │ │    12    │     │
│ Rutas    │  └──────────┘ └──────────┘ └──────────┘     │
│ (OPS)    │                                              │
│          │  Últimos desplazamientos                     │
│ Usuarios │  ┌─────────────────────────────────────────┐ │
│ (ADMIN)  │  │ Ruta          │ Fecha  │ Estado │ Acción│ │
│          │  │ Bloque Cubiro │ 14 abr │ ✅ Apro│  PDF  │ │
│          │  │ Sardinas      │ 12 abr │ 🔄 Rev │  Ver  │ │
│          │  └─────────────────────────────────────────┘ │
│          │                                              │
│          │  [ + Nuevo Desplazamiento ]                  │
└──────────┴──────────────────────────────────────────────┘
```

---

### 3.3 Listado de desplazamientos (`/dashboard/desplazamientos`)

```
┌─────────────────────────────────────────────────────────┐
│ Desplazamientos                    [ + Nuevo ]          │
├─────────────────────────────────────────────────────────┤
│ Filtros: [Ruta ▼] [Estado ▼] [Fecha inicio] [Fecha fin] │
│          [Conductor ▼ solo OPERACIONES/ADMIN]  [Buscar] │
├──────┬──────────────┬────────┬───────────┬─────┬───────┤
│  #   │ Ruta         │ Fecha  │ Conductor │ Est.│ Acc.  │
├──────┼──────────────┼────────┼───────────┼─────┼───────┤
│ 0042 │ Bloque Cubiro│ 15 abr │ J. García │  ✅ │ 👁 📄 │
│ 0041 │ Sardinas     │ 14 abr │ M. López  │  🔄 │ 👁 ✓  │
│ 0040 │ Yopal        │ 12 abr │ J. García │  📝 │ 👁 ✏  │
└──────┴──────────────┴────────┴───────────┴─────┴───────┘
│ Página 1 de 5   [ < ]  [ 1 2 3 ... 5 ]  [ > ]         │
└─────────────────────────────────────────────────────────┘

Leyenda: ✅ Aprobado  🔄 En revisión  📝 Borrador  ❌ Rechazado
```

---

### 3.4 Formulario nuevo desplazamiento (`/dashboard/desplazamientos/nuevo`)

```
┌─────────────────────────────────────────────────────────┐
│ ← Volver   Nuevo Desplazamiento          [Guardar borr.]│
├─────────────────────────────────────────────────────────┤
│ Selecciona la ruta:                                     │
│ ┌───────────────────────────────────┐                   │
│ │ 🔍 Buscar ruta...              ▼  │                   │
│ └───────────────────────────────────┘                   │
├─────────────────────────────────────────────────────────┤
│ Progreso: ████████░░░░░░░  4 / 14 secciones             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ▼ 1. DATOS GENERALES                                   │
│  ─────────────────────────────────────────────────────  │
│  Motivo del desplazamiento:                             │
│  ┌────────────────────────────────────────────────┐     │
│  │                                                │     │
│  └────────────────────────────────────────────────┘     │
│  Tipo de vehículo:                                      │
│  ◉ Carga Pesada  ○ Transp. Personal  ○ Moto  ○ Público  │
│  ...                                                    │
│                                                         │
│  ▶ 2. RUTA PRINCIPAL          (pre-cargado)             │
│  ▶ 3. RUTAS ALTERNAS          (pre-cargado)             │
│  ▶ 4. RUTAS BLOQUEADAS        (pre-cargado)             │
│  ▶ 5. LÍMITES DE VELOCIDAD    (ingresar valores)        │
│  ▶ 6. SITIOS PERNOCTE         (pre-cargado)             │
│  ▶ ...                                                  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ FIRMA CONDUCTOR                                         │
│ ┌──────────────────────────────────────┐                │
│ │                                      │                │
│ │     [Área de firma táctil/mouse]     │                │
│ │                                      │                │
│ └──────────────────────────────────────┘                │
│ [Limpiar firma]                                         │
├─────────────────────────────────────────────────────────┤
│                    [ Enviar a Revisión ]                │
└─────────────────────────────────────────────────────────┘
```

---

### 3.5 Detalle / revisión desplazamiento (OPERACIONES)

```
┌─────────────────────────────────────────────────────────┐
│ ← Volver   Desplazamiento #0041 — EN REVISIÓN           │
├─────────────────────────────────────────────────────────┤
│ Conductor: Manuel López  │  Ruta: Sardinas              │
│ Fecha: 14 abr 2026       │  Hora salida: 06:00          │
├─────────────────────────────────────────────────────────┤
│ [ Vista completa del formulario — solo lectura ]        │
│                                                         │
│  1. Datos Generales ............. ✅                    │
│  2. Ruta Principal .............. ✅                    │
│  ...                                                    │
│  14. Planos de Ruta ............. ✅ [ver imagen]        │
│                                                         │
│  Firma Conductor: [imagen firma]                        │
├─────────────────────────────────────────────────────────┤
│ FIRMA OPERACIONES                                       │
│ ┌──────────────────────────────────────┐                │
│ │     [Área de firma táctil/mouse]     │                │
│ └──────────────────────────────────────┘                │
├─────────────────────────────────────────────────────────┤
│ Observaciones:                                          │
│ ┌────────────────────────────────────────────────┐     │
│ │                                                │     │
│ └────────────────────────────────────────────────┘     │
│                                                         │
│  [ Rechazar ]              [ ✅ Aprobar y Firmar ]      │
└─────────────────────────────────────────────────────────┘
```

---

### 3.6 Gestión de rutas — CRUD (OPERACIONES/ADMIN)

```
┌─────────────────────────────────────────────────────────┐
│ Plantillas de Rutas                   [ + Nueva Ruta ]  │
├────────────────────┬──────────────┬────────┬───────────┤
│ Nombre ruta        │ Variante Sec5│ Estado │ Acciones  │
├────────────────────┼──────────────┼────────┼───────────┤
│ Bloque Cubiro      │ KM Único     │ Activa │ ✏ 🗑      │
│ Sardinas           │ Cargado/Desc.│ Activa │ ✏ 🗑      │
│ Barqueréña/Maracas │ Cargado/Desc.│ Activa │ ✏ 🗑      │
│ SLP → Trinidad     │ Cargado/Desc.│ Activa │ ✏ 🗑      │
│ Lucero/Joropera    │ Cargado/Desc.│ Activa │ ✏ 🗑      │
│ SLP → Yopal        │ Cargado/Desc.│ Activa │ ✏ 🗑      │
└────────────────────┴──────────────┴────────┴───────────┘
```

---

## 4. Estructura de navegación

```mermaid
graph LR
    Login --> Dashboard

    Dashboard --> Desplazamientos
    Dashboard --> Rutas:::ops
    Dashboard --> Admin:::admin

    Desplazamientos --> Listado
    Desplazamientos --> Nuevo
    Desplazamientos --> Detalle

    Nuevo --> Formulario14Secs
    Detalle --> VistaCompleta
    VistaCompleta --> AprobOps:::ops

    Rutas:::ops --> ListadoRutas
    ListadoRutas --> EditarRuta

    Admin:::admin --> Usuarios
    Usuarios --> CrearEditar

    classDef ops fill:#dbeafe
    classDef admin fill:#fce7f3
```

---

## 5. Responsive / móvil

- Formulario: secciones colapsables (acordeón), una abierta a la vez
- Tablas dinámicas (Secs. 6-12): scroll horizontal en móvil
- Firma canvas: área táctil de 100% ancho en móvil
- Listado: tarjetas en lugar de tabla en < 640px
- Navegación: menú hamburguesa en < 768px
