'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/actions/auth';
import TruckIcon from '@/components/icons/TruckIcon';
import type { LoginFormState } from '@/types/auth';

export default function LoginPage() {
  const [state, action, pending] = useActionState<LoginFormState, FormData>(
    loginAction,
    {},
  );

  return (
    <div className="w-full max-w-sm">
      {/* Encabezado */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-neutral-900 mb-4">
          <TruckIcon className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-semibold text-neutral-900">
          Rutas de Desplazamiento
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Ingresa con tus credenciales corporativas
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-700"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="usuario@empresa.com"
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-700"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow"
            />
          </div>

          {state?.error && (
            <div
              role="alert"
              aria-live="polite"
              className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
            >
              <svg
                aria-hidden="true"
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                />
              </svg>
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-2 px-4 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {pending ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-neutral-400 mt-6">
        FOR-SSTA-218 · Planificación de Desplazamientos 2026
      </p>
    </div>
  );
}
