export type UserRole = 'ADMIN' | 'OPERACIONES' | 'CONDUCTOR';

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  rol: UserRole;
}

export interface LoginFormState {
  error?: string;
}
