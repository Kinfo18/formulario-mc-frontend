# Roles y Permisos del Sistema

**Fecha:** 2026-04-15

---

## 1. Roles definidos

| Rol | Código | Descripción |
|-----|--------|-------------|
| **Conductor / Operativo** | `CONDUCTOR` | Personal que realiza el desplazamiento. Crea y firma formularios propios. |
| **Operaciones** | `OPERACIONES` | Equipo que revisa, valida y aprueba desplazamientos. Gestiona plantillas de rutas. |
| **Administrador** | `ADMIN` | Control total del sistema: usuarios, rutas, configuración. |

---

## 2. Matriz de permisos

### Desplazamientos

| Acción | CONDUCTOR | OPERACIONES | ADMIN |
|--------|:---------:|:-----------:|:-----:|
| Crear desplazamiento propio | ✅ | ✅ | ✅ |
| Ver desplazamientos propios | ✅ | ✅ | ✅ |
| Ver todos los desplazamientos | ❌ | ✅ | ✅ |
| Editar desplazamiento propio (borrador) | ✅ | ✅ | ✅ |
| Editar desplazamiento ajeno | ❌ | ✅ | ✅ |
| Eliminar desplazamiento | ❌ | ❌ | ✅ |
| Firmar como Conductor | ✅ | ❌ | ✅ |
| Firmar como Operaciones | ❌ | ✅ | ✅ |
| Descargar PDF propio | ✅ | ✅ | ✅ |
| Descargar PDF ajeno | ❌ | ✅ | ✅ |
| Exportar ZIP masivo | ❌ | ✅ | ✅ |
| Enviar PDF por correo | ❌ | ✅ | ✅ |

### Plantillas de Rutas

| Acción | CONDUCTOR | OPERACIONES | ADMIN |
|--------|:---------:|:-----------:|:-----:|
| Ver listado de rutas disponibles | ✅ | ✅ | ✅ |
| Ver detalle de plantilla | ❌ | ✅ | ✅ |
| Crear plantilla de ruta | ❌ | ✅ | ✅ |
| Editar plantilla de ruta | ❌ | ✅ | ✅ |
| Eliminar plantilla de ruta | ❌ | ❌ | ✅ |
| Subir plano de ruta (Sección 14) | ❌ | ✅ | ✅ |

### Usuarios

| Acción | CONDUCTOR | OPERACIONES | ADMIN |
|--------|:---------:|:-----------:|:-----:|
| Ver perfil propio | ✅ | ✅ | ✅ |
| Editar perfil propio | ✅ | ✅ | ✅ |
| Ver todos los usuarios | ❌ | ❌ | ✅ |
| Crear usuario | ❌ | ❌ | ✅ |
| Editar usuario | ❌ | ❌ | ✅ |
| Desactivar / eliminar usuario | ❌ | ❌ | ✅ |
| Asignar roles | ❌ | ❌ | ✅ |

### Historial y Reportes

| Acción | CONDUCTOR | OPERACIONES | ADMIN |
|--------|:---------:|:-----------:|:-----:|
| Ver historial propio | ✅ | ✅ | ✅ |
| Ver historial global | ❌ | ✅ | ✅ |
| Filtrar por conductor/ruta/fecha | ❌ | ✅ | ✅ |
| Exportar CSV/Excel | ❌ | ✅ | ✅ |

---

## 3. Estados de un desplazamiento

```
BORRADOR → EN_REVISION → APROBADO → ARCHIVADO
              ↓
           RECHAZADO → BORRADOR (puede corregirse)
```

| Estado | Quién puede cambiar | Descripción |
|--------|---------------------|-------------|
| `BORRADOR` | CONDUCTOR | Formulario en edición, no enviado |
| `EN_REVISION` | CONDUCTOR (al enviar) | Enviado a Operaciones para revisión |
| `APROBADO` | OPERACIONES / ADMIN | Revisado y aprobado, PDF generado |
| `RECHAZADO` | OPERACIONES / ADMIN | Devuelto al conductor con observaciones |
| `ARCHIVADO` | ADMIN | Cerrado definitivamente |

---

## 4. Reglas de negocio críticas

1. **Conductor solo ve lo suyo:** Un `CONDUCTOR` nunca puede acceder a desplazamientos de otros conductores, ni via UI ni via API.
2. **Firma de Conductor:** Solo el conductor asignado al desplazamiento puede estampar su firma. No puede firmar en nombre de otro.
3. **Firma de Operaciones:** Solo un usuario con rol `OPERACIONES` o `ADMIN` puede firmar como Operaciones.
4. **Edición bloqueada post-aprobación:** Un desplazamiento `APROBADO` no puede editarse. Solo `ADMIN` puede revertirlo a `BORRADOR`.
5. **Eliminación lógica:** Los desplazamientos nunca se borran físicamente — se archivan (`ARCHIVADO`) para conservar trazabilidad.
6. **Un solo Admin inicial:** El primer usuario creado por el sistema tiene rol `ADMIN`. Solo un `ADMIN` puede crear otros admins.

---

## 5. Implementación en el backend

### Middleware de autorización

```typescript
// backend/src/middleware/requireRole.ts
type Role = 'CONDUCTOR' | 'OPERACIONES' | 'ADMIN'

function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user  // inyectado por JWT middleware
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ success: false, error: 'Acceso denegado' })
    }
    next()
  }
}
```

### Jerarquía de roles (para lógica de herencia)

```typescript
const ROLE_HIERARCHY: Record<Role, number> = {
  CONDUCTOR: 1,
  OPERACIONES: 2,
  ADMIN: 3,
}

function hasMinRole(userRole: Role, minRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole]
}
```

### Guard de propiedad (ownership)

```typescript
// Para endpoints que requieren ser el dueño O tener rol elevado
function requireOwnerOrRole(minRole: Role) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const user = req.user
    const desplazamiento = await prisma.desplazamiento.findUnique({ where: { id } })

    if (!desplazamiento) return res.status(404).json({ success: false, error: 'No encontrado' })

    const isOwner = desplazamiento.conductorId === user.id
    const hasElevated = hasMinRole(user.role, minRole)

    if (!isOwner && !hasElevated) {
      return res.status(403).json({ success: false, error: 'Acceso denegado' })
    }
    next()
  }
}
```

---

## 6. Rutas de API protegidas

```
POST   /api/auth/login                    → público
POST   /api/auth/refresh                  → público

GET    /api/desplazamientos               → OPERACIONES, ADMIN
POST   /api/desplazamientos               → CONDUCTOR, OPERACIONES, ADMIN
GET    /api/desplazamientos/:id           → owner | OPERACIONES | ADMIN
PUT    /api/desplazamientos/:id           → owner (BORRADOR) | OPERACIONES | ADMIN
DELETE /api/desplazamientos/:id           → ADMIN

GET    /api/rutas                         → todos (autenticados)
POST   /api/rutas                         → OPERACIONES, ADMIN
PUT    /api/rutas/:id                     → OPERACIONES, ADMIN
DELETE /api/rutas/:id                     → ADMIN

GET    /api/pdf/:id                       → owner | OPERACIONES | ADMIN
POST   /api/pdf/bulk                      → OPERACIONES, ADMIN
POST   /api/email                         → OPERACIONES, ADMIN

GET    /api/admin/usuarios                → ADMIN
POST   /api/admin/usuarios                → ADMIN
PUT    /api/admin/usuarios/:id            → ADMIN
DELETE /api/admin/usuarios/:id            → ADMIN
```

---

## 7. Implementación en el frontend (Next.js)

```typescript
// src/middleware.ts — protección de rutas
const ROLE_ROUTES: Record<string, Role[]> = {
  '/dashboard/desplazamientos/nuevo':   ['CONDUCTOR', 'OPERACIONES', 'ADMIN'],
  '/dashboard/desplazamientos':         ['CONDUCTOR', 'OPERACIONES', 'ADMIN'],
  '/dashboard/rutas':                   ['OPERACIONES', 'ADMIN'],
  '/dashboard/admin':                   ['ADMIN'],
}
```
