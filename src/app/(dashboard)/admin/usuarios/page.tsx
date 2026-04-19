import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { apiGet } from '@/lib/api-server';
import { toggleEstadoUsuarioAction } from '@/app/actions/usuarios';
import type { UserRole } from '@/types/auth';

interface UsuarioItem {
  id: string;
  email: string;
  nombre: string;
  rol: UserRole;
  activo: boolean;
  createdAt: string;
  _count: { desplazamientos: number };
}

interface Stats {
  usersByRol: Array<{ rol: UserRole; _count: { id: number } }>;
  despByEstado: Array<{ estado: string; _count: { id: number } }>;
  despUltimos7dias: number;
}

const ROL_LABEL: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  OPERACIONES: 'Operaciones',
  CONDUCTOR: 'Conductor',
};

const ROL_COLOR: Record<UserRole, string> = {
  ADMIN: 'bg-purple-50 text-purple-700',
  OPERACIONES: 'bg-blue-50 text-blue-700',
  CONDUCTOR: 'bg-neutral-100 text-neutral-600',
};

export default async function UsuariosPage() {
  const user = await getSessionUser();
  if (!user || user.rol !== 'ADMIN') redirect('/dashboard');

  let usuarios: UsuarioItem[] = [];
  let stats: Stats | null = null;

  try {
    [usuarios, stats] = await Promise.all([
      apiGet<UsuarioItem[]>('/api/admin/usuarios'),
      apiGet<Stats>('/api/admin/usuarios/stats'),
    ]);
  } catch {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
        Error al cargar los usuarios. Intente nuevamente.
      </div>
    );
  }

  const activos = usuarios.filter((u) => u.activo).length;
  const inactivos = usuarios.length - activos;

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Usuarios</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {activos} activos{inactivos > 0 && ` · ${inactivos} inactivos`}
          </p>
        </div>
        <Link
          href="/admin/usuarios/nuevo"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shrink-0"
        >
          + Nuevo usuario
        </Link>
      </div>

      {/* Actividad del sistema */}
      {stats && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
            Actividad del sistema
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.usersByRol.map((r) => (
              <div key={r.rol} className="bg-white border border-neutral-200 rounded-xl p-4">
                <p className="text-2xl font-semibold text-neutral-900">{r._count.id}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{ROL_LABEL[r.rol]}</p>
              </div>
            ))}
            <div className="bg-white border border-neutral-200 rounded-xl p-4">
              <p className="text-2xl font-semibold text-neutral-900">{stats.despUltimos7dias}</p>
              <p className="text-xs text-neutral-500 mt-0.5">Desplaz. últimos 7 días</p>
            </div>
            {stats.despByEstado
              .filter((e) => e.estado === 'EN_REVISION')
              .map((e) => (
                <div key={e.estado} className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-2xl font-semibold text-blue-700">{e._count.id}</p>
                  <p className="text-xs text-blue-600 mt-0.5">En revisión</p>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Tabla de usuarios */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          Gestión de usuarios
        </h2>
        {usuarios.length === 0 ? (
          <div className="text-center py-16 text-neutral-400 text-sm">
            No hay usuarios registrados.
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  <th className="text-left px-4 py-3 font-medium text-neutral-500">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-500 hidden sm:table-cell">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-500">Rol</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-500 hidden md:table-cell">
                    Desplaz.
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-500">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => {
                  const toggle = toggleEstadoUsuarioAction.bind(null, u.id);
                  const esMismoUsuario = u.id === user.id;
                  return (
                    <tr
                      key={u.id}
                      className={`border-b border-neutral-100 last:border-0 transition-colors ${
                        u.activo ? 'hover:bg-neutral-50' : 'opacity-50'
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-neutral-900">{u.nombre}</td>
                      <td className="px-4 py-3 text-neutral-500 hidden sm:table-cell text-xs">
                        {u.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROL_COLOR[u.rol]}`}
                        >
                          {ROL_LABEL[u.rol]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-500 hidden md:table-cell text-xs">
                        {u._count.desplazamientos}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.activo
                              ? 'bg-green-50 text-green-700'
                              : 'bg-neutral-100 text-neutral-400'
                          }`}
                        >
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/usuarios/${u.id}/editar`}
                            className="text-xs text-neutral-600 hover:text-neutral-900 px-2.5 py-1 rounded-md hover:bg-neutral-100 transition-colors"
                          >
                            Editar
                          </Link>
                          {!esMismoUsuario && (
                            <form action={toggle}>
                              <button
                                type="submit"
                                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                                  u.activo
                                    ? 'text-red-500 hover:text-red-700 hover:bg-red-50'
                                    : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                                }`}
                              >
                                {u.activo ? 'Desactivar' : 'Activar'}
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
