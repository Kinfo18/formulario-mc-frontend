'use client';

import { useActionState } from 'react';
import type { UsuarioFormState } from '@/app/actions/usuarios';
import type { UserRole } from '@/types/auth';

const ROLES: Array<{ value: UserRole; label: string }> = [
  { value: 'CONDUCTOR', label: 'Conductor' },
  { value: 'OPERACIONES', label: 'Operaciones' },
  { value: 'ADMIN', label: 'Administrador' },
];

interface Props {
  action: (prev: UsuarioFormState | null, formData: FormData) => Promise<UsuarioFormState>;
  defaultValues?: {
    nombre?: string;
    email?: string;
    rol?: UserRole;
  };
  isEdit?: boolean;
}

const inputClass =
  'w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1 transition-colors';
const labelClass = 'block text-xs font-medium text-neutral-700 mb-1';
const errorClass = 'text-xs text-red-600 mt-1';

export function UsuarioForm({ action, defaultValues, isEdit }: Props) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-5 max-w-lg">
      {state?.error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="nombre" className={labelClass}>
          Nombre completo
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          required
          autoComplete="off"
          defaultValue={defaultValues?.nombre}
          className={inputClass}
          placeholder="Ej. Juan Pérez"
        />
        {state?.fieldErrors?.nombre && (
          <p className={errorClass}>{state.fieldErrors.nombre}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="off"
          defaultValue={defaultValues?.email}
          className={inputClass}
          placeholder="usuario@empresa.com"
        />
        {state?.fieldErrors?.email && (
          <p className={errorClass}>{state.fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          {isEdit ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required={!isEdit}
          autoComplete="new-password"
          className={inputClass}
          placeholder={isEdit ? '••••••••' : 'Mínimo 8 caracteres'}
        />
        {state?.fieldErrors?.password && (
          <p className={errorClass}>{state.fieldErrors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="rol" className={labelClass}>
          Rol
        </label>
        <select
          id="rol"
          name="rol"
          required
          defaultValue={defaultValues?.rol ?? 'CONDUCTOR'}
          className={inputClass}
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        {state?.fieldErrors?.rol && (
          <p className={errorClass}>{state.fieldErrors.rol}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear usuario'}
        </button>
        <a
          href="/admin/usuarios"
          className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors py-2"
        >
          Cancelar
        </a>
      </div>
    </form>
  );
}
