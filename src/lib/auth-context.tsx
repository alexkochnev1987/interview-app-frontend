'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { runMutation } from '@/lib/run-mutation';
import { TOAST_MESSAGES } from '@/lib/toast-messages';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await runMutation(
      async () => {
        const res = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Unable to log out right now.');
        }
      },
      {
        showSuccessToast: false,
        errorMessage: TOAST_MESSAGES.auth.logoutError,
      }
    );
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
