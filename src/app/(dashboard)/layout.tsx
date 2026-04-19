import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { logoutAction } from '@/app/actions/auth';
import TruckIcon from '@/components/icons/TruckIcon';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  const isAdminOrOps = user.rol === 'ADMIN' || user.rol === 'OPERACIONES';

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center">
                <TruckIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-neutral-900 hidden sm:inline">
                Rutas de Desplazamiento
              </span>
            </Link>
            <nav className="flex items-center gap-0.5 overflow-x-auto scrollbar-none">
              <Link
                href="/desplazamientos"
                className="text-xs text-neutral-600 hover:text-neutral-900 px-3 py-2 min-h-[40px] flex items-center rounded-md hover:bg-neutral-100 transition-colors whitespace-nowrap"
              >
                Desplazamientos
              </Link>
              {isAdminOrOps && (
                <Link
                  href="/rutas"
                  className="text-xs text-neutral-600 hover:text-neutral-900 px-3 py-2 min-h-[40px] flex items-center rounded-md hover:bg-neutral-100 transition-colors whitespace-nowrap"
                >
                  Rutas
                </Link>
              )}
              {user.rol === 'ADMIN' && (
                <Link
                  href="/admin/usuarios"
                  className="text-xs text-neutral-600 hover:text-neutral-900 px-3 py-2 min-h-[40px] flex items-center rounded-md hover:bg-neutral-100 transition-colors whitespace-nowrap"
                >
                  Usuarios
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-neutral-900">{user.nombre}</p>
              <p className="text-xs text-neutral-500">{user.rol}</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors px-3 py-2 min-h-[40px] rounded-md hover:bg-neutral-100"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
