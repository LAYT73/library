import { create } from 'zustand';
import type { User, UserRoleType } from '../types';
import { UserRole } from '../types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  hasRole: (role: UserRoleType | UserRoleType[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const storedUserRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
const storedToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
let initialUser: User | null = null;
try {
  if (storedUserRaw) initialUser = JSON.parse(storedUserRaw);
} catch {
  initialUser = null;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: initialUser,
  token: storedToken,
  isAuthenticated: !!initialUser,

  login: (user: User) => {
    localStorage.setItem('accessToken', user.accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token: user.accessToken, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user: User) => {
    // keep localStorage in sync when user is set programmatically
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch {}
    set({ user, isAuthenticated: !!user, token: (user as any)?.accessToken ?? get().token });
  },

  hasRole: (roles: UserRoleType | UserRoleType[]) => {
    const { user } = get();
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  },

  hasPermission: (permission: string) => {
    const { user } = get();
    if (!user) return false;

    const rolePermissions: Record<string, string[]> = {
      [UserRole.ADMIN]: ['*'],
      [UserRole.LIBRARIAN]: [
        'books.*',
        'copies.*',
        'orders.*',
        'reports.*',
        'disciplines.*',
      ],
      [UserRole.DEPARTMENT_HEAD]: ['books.read', 'coverage.read.department'],
      [UserRole.VIEWER]: ['books.read', 'coverage.read'],
    };

    const permissions = rolePermissions[user.role] || [];
    return permissions.includes('*') || permissions.includes(permission);
  },
}));
