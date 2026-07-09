'use client';

import { useRouter } from '@/i18n/navigation';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { logout as apiLogout, type AuthUserResponseDto as User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  establishSession: (sessionUser: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  establishSession: () => {},
  logout: async () => {},
});

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: User | null;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(initialUser);
  const [prevInitialUser, setPrevInitialUser] = useState(initialUser);

  if (initialUser !== prevInitialUser) {
    setPrevInitialUser(initialUser);
    // Keep a client-established session when the first RSC refresh has not
    // picked up the new cookie yet (common right after login/demo sign-in).
    setUser((current) => initialUser ?? current);
  }

  const establishSession = (sessionUser: User) => {
    setUser(sessionUser);
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  return (
    <AuthContext.Provider
      value={{ user, establishSession, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useIsDemo() {
  return useContext(AuthContext).user?.demo === true;
}
